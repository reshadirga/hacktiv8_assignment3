import logo from './logo.svg';
import './App.css';
import { Table, Row, Col, Space, Card, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Moment from 'react-moment';

const TableApp = () => {

  const [baseCurrencySource, setBaseCurrencySource] = useState([]);
  const [dateSource, setDateSource] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [baseCurrencyName, setBaseCurrencyName] = useState([]);
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

  

  useEffect(() => {
    axios.get("https://api.exchangeratesapi.io/latest").then((res) => {

      if (res.status !== 200) return;
      else {
        setBaseCurrencySource(res.data?.base);
        setDateSource(res.data?.date);
        setDataSource(setDataToTableFormat(res.data?.rates));
        setBaseCurrencyName(baseCurrencyNameOptions(res.data?.rates));
      }

    });
  }, []);

  return (
    <Row>
      <Col md={{ span: 12, offset: 6 }}>
        <Space direction="vertical">
          <Card title="Table Chart Stock" style={{ width: 600 }}>
            <Input addonBefore={baseCurrencyName} defaultValue="Base currency value..." />
            <div className="infoHeader">
              <Col sm={{ span: 15, offset: 0 }}>
                <h3>Base currency: {baseCurrencySource}</h3>
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
const baseCurrencyNameOptions = (dataSource) => {

  let options = [];

  for (const key in dataSource) options.push(
    <Option value={key}>{key}</Option>
  )
  // console.log(dataSource)

  return (
    <Select defaultValue="IDR" className="select-before">
      { options }
    </Select>
  )

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

const spreadPrice = (exchangeRate) => {
  return exchangeRate * 0.1;
}

const formatCurrencyRate = (rates) => {
  let value = Math.round(rates * 1000) / 1000;
  // let intValue = Math.round(rates);
  // let intValueDivider = 0;

  // if (intValue > 1000) intValueDivider = (Math.log10)/3;
  // for (let i = 0; i < intValueDivider; i++)


  return value;
}

export default TableApp;