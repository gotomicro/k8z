import { RequestTypes } from '@/pages/Tools/PodProxy/components/RequestType';
import { Form, Input } from 'antd';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

const StyledFormFields = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const StyledInputKey = styled(Input)`
  width: 240px;
`;

const StyledFormFieldOptions = styled.div`
  width: 100px;
  flex: 0 0 100px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequestHeaders: React.FC = () => {
  const [newName, setNewName] = useState<string>();
  const handleDelete = useCallback((remove: any, name) => {
    remove(name);
    setNewName((test) => (test ? (parseInt(test) - 1).toString() : '0'));
  }, []);

  const handleChange = useCallback(
    (add: any, fields: any[], name: number) => {
      if (!newName) {
        add({});
        setNewName(fields.length.toString());
      }
      if (newName && parseInt(newName) === name) {
        add({}, name + 1);
        setNewName((test) => (test ? (parseInt(test) + 1).toString() : '0'));
      }
    },
    [newName],
  );
  return (
    <Form.List name={['info', RequestTypes.Headers.toLowerCase()]} initialValue={[{}]}>
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <StyledFormFields key={key}>
                <Form.Item {...restField} name={[name, 'key']} noStyle>
                  <StyledInputKey
                    placeholder="key,必填"
                    onChange={() => {
                      handleChange(add, fields, name);
                    }}
                  />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'value']} noStyle>
                  <Input
                    placeholder="value，未填写 key 则不会作为 headers 参数"
                    onChange={() => {
                      handleChange(add, fields, name);
                    }}
                  />
                </Form.Item>
                <StyledFormFieldOptions>
                  {fields.length > 1 && <a onClick={() => handleDelete(remove, name)}>delete</a>}
                </StyledFormFieldOptions>
              </StyledFormFields>
            ))}
          </>
        );
      }}
    </Form.List>
  );
};
export default RequestHeaders;
