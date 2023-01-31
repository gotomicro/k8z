import { Button } from 'antd';
import styled, { css } from 'styled-components';

export const StyledConfigMapFiles = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 8px;
  overflow: hidden;
`;

export const StyledConfigMapFilesScroll = styled.div`
  width: calc(100% + 10px);
  min-height: 34px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const StyledConfigMapFilesList = styled.div`
  width: calc(100% - 12px);
  display: flex;
  flex-flow: wrap;
  gap: 8px;
`;

const StyledConfigMapFileBaseFont = css`
  color: #2f3e4c;
  letter-spacing: 1.5px;
  &:hover {
    color: #2f3e4c !important;
  }
`;

const StyledConfigMapFileBase = css`
  width: calc(25% - 6px);
  height: 32px;
  text-align: left;
  border-radius: 6px;
  background-color: hsla(180, 1%, 75%, 0.14);
  ${StyledConfigMapFileBaseFont}
  &:hover {
    background-color: hsla(208, 89%, 86%, 0.3);
  }
`;

export const StyledConfigMapFileAddButton = styled(Button)`
  min-width: 200px !important;
  ${StyledConfigMapFileBase}
`;

export const StyledConfigMapFileNameButton = styled(Button)`
  flex: 1 !important;
  min-width: 0;
  background-color: transparent !important;
  span {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  ${StyledConfigMapFileBase}
  ${StyledConfigMapFileBaseFont}
`;
export const StyledConfigMapFileButton = styled.div<{ isSelect: boolean }>`
  display: flex;
  gap: 8px;
  justify-content: space-between;
  ${StyledConfigMapFileBase}
  ${({ isSelect }) => (isSelect ? `background-color: #d9f0ff` : '')}
`;
