import { Form } from 'antd';
import styled from 'styled-components';

export const StyledConfigBody = styled.div`
  margin-top: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledCaughtFormLabel = styled.div`
  width: 67.1px;
  text-align: right;
`;

export const StyledCaughtFromOptions = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledCaughtMode = styled(Form.Item)`
  flex: 1;
  .ant-form-item-required {
    &:before {
      display: none;
    }
  }
`;
