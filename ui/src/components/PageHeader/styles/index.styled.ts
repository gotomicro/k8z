import styled from 'styled-components';
import { Button } from 'antd';

export const StyledPageHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 0;
`;

export const StyledPageHeaderTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: end;
  height: 62px;
`;

export const StyledPageHeaderTitleContext = styled.span`
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 32px;
  font-family: 'PingFang SC', sans-serif;
  word-spacing: 1px;
  color: #2f3e4c;
  text-shadow: 1px 1px 1px rgb(0 0 0 / 15%);
  cursor: pointer;
`;

export const StyledPageHeaderBack = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  width: 100%;
  height: 30px;
  color: #249ffd;
`;

export const StyledPageHeaderBackContent = styled(Button)`
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, 微软雅黑,
    Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
`;
