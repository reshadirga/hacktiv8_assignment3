import logo from './logo.svg';
import './App.css';
import { Table, Row, Col, Space, Card } from 'antd';
import { Get, withAxios } from 'react-axios';
import { useEffect } from 'react';
import axios from 'axios';

const dataSource = [
  {
    key: '1',
    name: 'Mike',
    age: 32,
    address: '10 Downing Street',
  },
  {
    key: '2',
    name: 'John',
    age: 42,
    address: '10 Downing Street',
  },
];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const TableApp = () => {

  useEffect(() => {
    axios.get("https://api.exchangeratesapi.io/latest").then((res) => {
    console.log('res', res.data.base);
    });
  }, []);

  return (
    <Row>
      <Col lg={{ span: 12, offset: 2 }}>
        <Space direction="vertical">
          <Card title="Table Chart Stock" style={{ width: 400 }}>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Space>
      </Col>
    </Row>
  );
}

export default TableApp;
