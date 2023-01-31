import { Input } from 'antd';
import styled from 'styled-components';

export const StyledPodProxyFormInput = styled.div`
  display: flex;
  margin-top: 8px;
`;

export const StyledRequestPathInput = styled(Input)`
  .ant-input-group-addon {
    border-radius: 0;
  }
  .ant-input-group .ant-input {
    border-radius: 0 6px 6px 0 !important;
  }
`;

export const StyledPodProxyRequestInfo = styled.div`
  height: 240px;
  width: 100%;
  overflow-y: auto;
  border-radius: 2px;
`;

export const StyledPodProxyResponse = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 8px;
`;

export const StyledPodProxyEmptyResponse = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
