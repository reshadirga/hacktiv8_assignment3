import axios from "axios";
import { Row, Col, Space, Table, Card } from "antd";
import { useEffect } from "react";
import './App.css';
 
const dataSource = [
      {
        key: '1',
        currency: 'CAD',
        buy: 10,
        exchangeRate: 50,
        sell: 100,
      },
      {
        key: '2',
        currency: 'IDR',
        buy: 10,
        exchangeRate: 50,
        sell: 100,
      },
      {
        key: '3',
        currency: 'JPY',
        buy: 10,
        exchangeRate: 50,
        sell: 100,
      },
      {
        key: '4',
        currency: 'CHF',
        buy: 10,
        exchangeRate: 50,
        sell: 100,
      },
    ];
 
const columns = [
      {
        title: '',
        dataIndex: 'currency',
      },
      {
        title: 'WE BUY',
        dataIndex: 'buy',
      },
      {
        title: 'EXCHANGE RATE',
        dataIndex: 'exchangeRate',
      },
      {
        title: 'WE SELL',
        dataIndex: 'sell',
      },
    ];
 
const TableApp = () => {
  useEffect(() => {
 
    (async() => {
      const result = await axios.get("https://api.exchangeratesapi.io/latest");
      console.log('result',result);
      })();
    }, []);
 
 
    return (
    <Row>
      <Col lg={{ span: 12, offset: 2 }}>
        <Space direction="vertical">
          <Card title="Table Chart Stock" style={{ width: 900 }}>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Space>
      </Col>
    </Row>
  );
};
 
export default TableApp;