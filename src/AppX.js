import logo from './logo.svg';
import './App.css';
import { Table, Row, Col, Space, Card } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Moment from 'react-moment';

const TableApp = () => {

  const [baseCurrencySource, setBaseCurrencySource] = useState(0);
  const [dateSource, setDateSource] = useState(0);
  const [dataSource, setDataSource] = useState(0);
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

  useEffect(() => {
    axios.get("https://api.exchangeratesapi.io/latest").then((res) => {
    console.log(res);
    setBaseCurrencySource(res.data.base);
    setDateSource(res.data.date);
    let forexData = res.data.rates;
    setDataSource(setDataToTableFormat(forexData));
    });
  }, []);

  return (
    <Row>
      <Col md={{ span: 12, offset: 6 }}>
        <Space direction="vertical">
          <Card title="Table Chart Stock" style={{ width: 600 }}>
            {/* Dropdown maybe? */}
            <h3>Base currency: {baseCurrencySource}</h3>
            <p>Date:{" "}
              <Moment parse="YYYY-MM-DD" format="DD MMMM YYYY">
                {dateSource}
              </Moment> 
            </p>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Space>
      </Col>
    </Row>
    
    );

}

const setDataToTableFormat = (forexCurrencies) => {

  let dataSource = [];
  let pairCurrency = Object.keys(forexCurrencies);
  let exchangeRate = pairCurrency.map(function (v) {
    return forexCurrencies[v];
  });

  exchangeRate.forEach((v, i) => {
    
    let readForexObject = 
    {
      key: i + 1,
      currency: pairCurrency[i],
      weBuy: formatCurrencyRate(v-spreadPrice(v)),
      exchangeRate: formatCurrencyRate(v),
      weSell: formatCurrencyRate(v+spreadPrice(v)),
    };

    dataSource.push(readForexObject);
  });

  return dataSource;
}

const spreadPrice = (exchangeRate) => {
  return exchangeRate*0.1;
}

const formatCurrencyRate = (rates) => {
  let value = Math.round(rates*1000)/1000;
  // let intValue = Math.round(rates);
  // let intValueDivider = 0;

  // if (intValue > 1000) intValueDivider = (Math.log10)/3;
  // for (let i = 0; i < intValueDivider; i++)

  
  return value;
}

export default TableAppX;