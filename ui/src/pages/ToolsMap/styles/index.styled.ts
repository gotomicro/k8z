import { Space } from 'antd';
import styled from 'styled-components';

export const StyledToolsMap = styled.div`
  margin: 18px 0;
  display: flex;
  justify-content: center;
  min-height: 0;
  max-width: 100%;
`;

export const StyledToolsMapSpace = styled(Space)<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '872px')};
  min-width: 516px;
`;
