import type { DefaultResponseInfoProps } from '@/pages/Tools/PodProxy/components/ResponseInfo/index';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

export type ResponseCookiesProps = DefaultResponseInfoProps;

const ResponseCookies: React.FC<ResponseCookiesProps> = () => {
  const columns: ColumnsType<any> = [
    {
      dataIndex: 'name',
      title: 'Name',
    },
    {
      dataIndex: 'value',
      title: 'Value',
    },
    {
      dataIndex: 'domain',
      title: 'Domain',
    },
    {
      dataIndex: 'path',
      title: 'Path',
    },
    {
      dataIndex: 'expires',
      title: 'Expires/Max-Age',
    },
    {
      dataIndex: 'size',
      title: 'Size',
    },
  ];

  return (
    <Table
      bordered
      size={'small'}
      dataSource={[]}
      columns={columns}
      pagination={false}
      scroll={{ y: 'calc(100vh - 610px)' }}
    />
  );
};

export default ResponseCookies;
