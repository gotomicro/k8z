import styled from 'styled-components';

export const StyledProfileViewSvg = styled.div<{ isFull?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .ant-tabs {
    flex: 1;
    .ant-tabs-content-holder > .ant-tabs-content,
    .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane {
      height: 100%;
    }
  }
  ${({ isFull }) =>
    isFull
      ? `
      position: fixed;
      top: 0;
      left: 0;
      background: #fff;
      z-index: 2;
      padding: 24px;
    `
      : ''}
`;

export const StyledTools = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  margin-bottom: 8px;
`;

export const StyledIframe = styled.iframe<{ height?: string }>`
  width: 100%;
  height: ${({ height }) => (height ? height : '100%')};
  border: none;
`;
