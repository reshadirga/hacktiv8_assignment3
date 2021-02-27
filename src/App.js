import { Card, Col, Input, Row, Select, Space, Table } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import './App.css';

const TableApp = () => {

  const [activeBaseCurrency, setActiveBaseCurrency] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('');
  const [dateSource, setDateSource] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [rawDataSource, setRawDataSource] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [disableInputState, setDisableInputState] = useState(true);
  const { Option } = Select;
  let options = [];
  const columns = [
    {
      title: '',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: 'We Buy',
      dataIndex: 'weBuy',
      key: 'weBuy',
    },
    {
      title: 'Exchange Rate',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
    },
    {
      title: 'We Sell',
      dataIndex: 'weSell',
      key: 'weSell',
    },
  ];


  // Get data from API
  useEffect(() => {
    axios.get("https://api.exchangeratesapi.io/latest").then((res) => {

      if (res.status !== 200) return;
      else {
        let rates = res.data?.rates;
        setDateSource(res.data?.date);
        setRawDataSource(initiatieRawRates(rates));
      }

    });
  }, []);

  // Add currency to selection
  useEffect(() => {
    for (const key in rawDataSource) options.push(
      <Option value={key}>{key}</Option>
    )

    setBaseCurrency(
      <Select placeholder="Select base currency" className="select-before inputSection" onChange={(value) => {
        setActiveBaseCurrency(value); setDisableInputState(false);
      }}>
        {options}
      </Select>
    )

  }, [rawDataSource]);

  // User change: active base currency; then empty input form and enable value input
  useEffect(() => {
    setInputValue('');
  }, [activeBaseCurrency]);

  // User change: base currency value input or active base currency; then recalculate table
  useEffect(() => {
    setDataSource(setDataToTableFormat(calculateBasedOnInput(inputValue, recalculateRates(activeBaseCurrency, rawDataSource))))
  }, [inputValue, rawDataSource, activeBaseCurrency]);


  return (
    <Row >
      <Col lg={{ span: 12 }} className="tableContainer">
        <Space direction="vertical" className="tableCard glass">
          <Card title="Table Chart Stock" className="tableCard">
            <Input
              className="baseCurrencyInput inputSection"
              addonBefore={baseCurrency}
              placeholder="Insert case currency value..."
              allowClear="true"
              value={inputValue}
              disabled={disableInputState}
              onChange={e => setInputValue(formatNumber(e.target.value))}
            />
            <div className="infoHeader">
              <Col className="infoHeaderLeft">
                <h3>Base currency: {activeBaseCurrency} {" "} {inputValue}</h3>
              </Col>
              <Col className="infoHeaderRight">
                <p>Date:{" "}
                  <Moment parse="YYYY-MM-DD" format="DD MMMM YYYY">
                    {dateSource}
                  </Moment>
                </p>
              </Col>
            </div>
            <div className="currencyTable">
              <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 7 }}/>
            </div>
          </Card>
        </Space>
      </Col>
    </Row>

  );
}

const setDataToTableFormat = (rates) => {

  let dataSource = [];
  let index = 0;

  for (const key in rates) {
    let value = rates[key];
    let readForexObject = {};

    if (value == "-") {
      readForexObject =
      {
        key: index++,
        currency: key,
        weBuy: value,
        exchangeRate: value,
        weSell: value,
      };
    }

    else {
      readForexObject =
      {
        key: index++,
        currency: key,
        weBuy: formatNumber((formatCurrencyRate(value - spreadPrice(value))).toString()),
        exchangeRate: formatNumber((formatCurrencyRate(value)).toString()),
        weSell: formatNumber((formatCurrencyRate(value + spreadPrice(value))).toString()),
      };
    };
    dataSource.push(readForexObject);
  }
  return dataSource;
}

const initiatieRawRates = (rates) => {
  let newRates = { ['EUR']: (1) };
  let arrNewRates = [];

  arrNewRates.push(rates)
  arrNewRates.push(newRates);

  newRates = arrNewRates.reduce(function (result, currentObject) {
    for (var key in currentObject) {
      if (currentObject.hasOwnProperty(key)) {
        result[key] = currentObject[key];
      }
    }
    return result;
  }, {});

  return newRates;
}

const recalculateRates = (baseCurrency, rates) => {

  let newRates = '';
  let arrNewRates = [];
  let activeBaseCurrencyValue = 0;

  for (const key in rates) {
    if (key == baseCurrency) activeBaseCurrencyValue = rates[key];
  }

  for (const key in rates) {
    let value = rates[key];
    newRates = { [key]: (value / activeBaseCurrencyValue) };
    arrNewRates.push(newRates);
  }

  newRates = arrNewRates.reduce(function (result, currentObject) {
    for (var key in currentObject) {
      if (currentObject.hasOwnProperty(key)) {
        result[key] = currentObject[key];
      }
    }
    return result;
  }, {});

  return newRates;
}

const calculateBasedOnInput = (multiplier, rates) => {

  let newRates = '';
  let arrNewRates = [];
  const arrMultiplier = multiplier.split('');
  arrMultiplier.map((v, i) => {
    if (v == ",") arrMultiplier.splice(i, 1);
    return arrMultiplier;
  })

  for (let i = 1; i < arrMultiplier.length; i++) arrMultiplier[0] += arrMultiplier[i];
  multiplier = parseFloat(arrMultiplier[0]);

  if (!multiplier) {
    for (const key in rates) {
      newRates = { [key]: '-' };
      arrNewRates.push(newRates);
    }
  }

  else {
    for (const key in rates) {
      let value = rates[key];
      newRates = { [key]: (multiplier * value) };
      arrNewRates.push(newRates);
    }
  }



  newRates = arrNewRates.reduce(function (result, currentObject) {
    for (var key in currentObject) {
      if (currentObject.hasOwnProperty(key)) {
        result[key] = currentObject[key];
      }
    }
    return result;
  }, {});

  return newRates;
}

const spreadPrice = (exchangeRate) => {
  return exchangeRate * 0.1;
}

const formatCurrencyRate = (rates) => {
  let value = Math.round(rates * 1000) / 1000;
  return value;
}

function formatNumber(value) {

  if (checkNumberValidity(value)) return alertInputTypeError(value);

  if (value < 1000) return value;
  else {
    const stringValue = value.toString().split('');
    let decimalValue = [];
    let stringDecimalValue = '';
    let onDecimal = false;
    let convertedValue = '';

    stringValue.map((v, i) => {
      if (v == ",") stringValue.splice(i, 1);
      if (v == "." || onDecimal) {
        onDecimal = true;
        decimalValue.push(v);
      }
      return stringValue;
    })

    for (let i = 0; i < decimalValue.length; i++) stringValue.pop();

    for (let i = stringValue.length - 1; i >= 0; i--) {
      let digits = stringValue.length - i;
      if (digits > 2 && digits % 3 == 1) convertedValue = stringValue[i] + "," + convertedValue
      else convertedValue = stringValue[i] + convertedValue;
    }

    decimalValue.map((v) => stringDecimalValue += v);
    if (onDecimal) convertedValue += stringDecimalValue;

    return convertedValue;
  }
}

const alertInputTypeError = (value) => {
  alert('Please enter number only');

  let cleanedValue = '';
  const inputs = value.split('');

  inputs.pop();
  inputs.map((v) => cleanedValue += v);

  return cleanedValue;
}

const checkNumberValidity = (value) => {

  const inputs = value.split('');
  let check = false;

  inputs.map((v) => {
    if (v != "1" && v != "2" && v != "3" && v != "4" && v != "5" && v != "6" && v != "7" && v != "8" && v != "9" && v != "0" && v != "," && v != ".") check = true;
    else check = false;
  })
  return check;
}

export default TableApp;