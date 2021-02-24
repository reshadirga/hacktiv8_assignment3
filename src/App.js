import logo from './logo.svg';
import './App.css';
import { Table, Row, Col, Space, Card, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Moment from 'react-moment';
import { string } from 'prop-types';

const TableApp = () => {

  const [activeBaseCurrency, setActiveBaseCurrency] = useState('EUR');
  const [baseCurrencyName, setBaseCurrencyName] = useState('EUR');
  const [dateSource, setDateSource] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [rawDataSource, setRawDataSource] = useState([]);
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
  const { Option } = Select;
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    axios.get("https://api.exchangeratesapi.io/latest").then((res) => {

      if (res.status !== 200) return;
      else {
        let rates = res.data?.rates;
        setDateSource(res.data?.date);
        setRawDataSource(initiatieRawRates(rates));
        setDataSource(setDataToTableFormat(rates));

        let options = [];
        for (const key in rates) options.push(
          <Option value={key}>{key}</Option>
        )
        options.push(
          <Option value='EUR'>EUR</Option>
        )

        setBaseCurrencyName(
          <Select defaultValue='EUR' className="select-before" onChange={(value) => {
            setActiveBaseCurrency(value);
            setInputValue('');
            setDataSource(setDataToTableFormat(recalculateRates(value, rates)));
          }}>
            {options}
          </Select>
        )
      }

    });
  }, []);


  return (
    <Row>
      <Col md={{ span: 12, offset: 6 }}>
        <Space direction="vertical">
          <Card title="Table Chart Stock" style={{ width: 600 }}>
            <Input
              className="baseCurrencyInput"
              addonBefore={baseCurrencyName}
              placeholder="Base currency value..."
              allowClear="true"
              value={inputValue}
              onChange={e => setInputValue(formatNumber(e.target.value))}
              onPressEnter={e => setDataSource(setDataToTableFormat(calculateBasedOnInput(inputValue, recalculateRates(activeBaseCurrency, rawDataSource))))}
              suffix={<p className="inputSuffix"> Press 'Enter' to calculate </p>}
            />
            <div className="infoHeader">
              <Col sm={{ span: 15, offset: 0 }}>
                <h3>Base currency: {activeBaseCurrency} {" "} {inputValue}</h3>
              </Col>
              <Col sm={{ span: 9, offset: 0 }}>
                <p>Date:{" "}
                  <Moment parse="YYYY-MM-DD" format="DD MMMM YYYY">
                    {dateSource}
                  </Moment>
                </p>
              </Col>
            </div>
            <div className="currencyTable">
              <Table dataSource={dataSource} columns={columns} />
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
    let readForexObject =
    {
      key: index++,
      currency: key,
      weBuy: formatCurrencyRate(value - spreadPrice(value)),
      exchangeRate: formatCurrencyRate(value),
      weSell: formatCurrencyRate(value + spreadPrice(value)),
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
  arrMultiplier.map((v,i) => {
    if (v == ",") arrMultiplier.splice(i,1);
    return arrMultiplier;
  })

  for (let i = 1; i < arrMultiplier.length; i++) arrMultiplier[0] += arrMultiplier[i];
  multiplier = parseFloat(arrMultiplier[0]);

  for (const key in rates) {
    let value = rates[key];
    newRates = { [key]: (multiplier * value) };
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