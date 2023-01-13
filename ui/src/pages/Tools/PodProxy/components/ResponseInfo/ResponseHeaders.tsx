import { Table } from 'antd';
import React, { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { DefaultResponseInfoProps } from '@/pages/Tools/PodProxy/components/ResponseInfo/index';

export type ResponseHeadersProps = DefaultResponseInfoProps;

const ResponseHeaders: React.FC<ResponseHeadersProps> = ({ value }) => {
  const headerList = useMemo(() => {
    return (
      Object.keys(value?.headers ?? {}).map((item) => ({
        key: item,
        value: value?.headers[item],
      })) ?? []
    );
  }, [value]);

  const columns: ColumnsType<any> = [
    {
      dataIndex: 'key',
      title: 'Key',
    },
    {
      dataIndex: 'value',
      title: 'Value',
    },
  ];

  return (
    <Table
      bordered
      size={'small'}
      dataSource={headerList}
      columns={columns}
      pagination={false}
      scroll={{ y: 'calc(60vh - 76px)' }}
    />
  );
};

export default ResponseHeaders;
