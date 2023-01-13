import React, { useCallback } from 'react';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import type { FormInstance } from 'antd';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import ContentCard from '@/components/ContentCard';
import { SearchOutlined } from '@ant-design/icons';
import { StyledForm } from '@/pages/Tools/Nodes/styles/form.styled';
import type { FormParams } from '@/pages/Tools/Nodes';

export enum QueryMethods {
  Node = 'Node',
  Pod = 'Pod',
  Service = 'Service',
}

const QueryMethodOptions = Object.keys(QueryMethods).map((key) => ({
  label: key,
  value: QueryMethods[key],
}));

interface FilterFormProps {
  form?: FormInstance<FormParams>;
}

const FilterForm: React.FC<FilterFormProps> = ({ form }) => {
  const handlePressEnter = useCallback(() => form?.submit(), [form]);

  return (
    <ContentCard title={`${localStorageManage(k8zStorageKeys.toolsName)}-Filter`} height="132px">
      <StyledForm
        form={form}
        onFinish={() => {
          console.log('xxx');
        }}
      >
        <Row gutter={8}>
          <Col flex={2}>
            <Form.Item
              label="查询方式"
              name="method"
              rules={[{ required: true, message: '请选择查询方式' }]}
            >
              <Select showSearch options={QueryMethodOptions} />
            </Form.Item>
          </Col>
          <Col flex={4}>
            <Form.Item
              label="查询条件"
              name="filter"
              rules={[{ required: true, message: '请输入查询条件' }]}
            >
              <Input placeholder="请输入查询条件" onPressEnter={handlePressEnter} />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Form.Item noStyle>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              查询
            </Button>
          </Form.Item>
        </Row>
      </StyledForm>
    </ContentCard>
  );
};
export default FilterForm;
