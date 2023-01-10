import styled from 'styled-components';

export const StyledLoading = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .ant-spin-show-text > .ant-spin-text {
    margin-top: 10px;
    letter-spacing: 1.4px;
  }
`;
