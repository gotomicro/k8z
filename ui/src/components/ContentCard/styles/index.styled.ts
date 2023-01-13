import styled from 'styled-components';

export const StyledContentCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  margin: 18px 0 50px;
`;

export const StyledContentCardBody = styled.div<{ height?: string }>`
  position: relative;
  width: 80%;
  height: ${({ height }) => (height ? height : '90vh')};
  padding: 18px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 8px 10.5px 28.5px rgb(39 44 49 / 6%), 1px 2px 8px rgb(39 44 49 / 3%);
`;

export const StyledContentCardTitle = styled.div`
  position: absolute;
  top: -18px;
  left: 0;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: start;
`;

export const StyledContentCardTitleContext = styled.div`
  height: 36px;
  padding: 8px 15px;
  margin-left: 30px;
  background: #249ffd;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  word-spacing: 1px;
  line-height: 20px;
  box-shadow: 0 8px 10px hsla(206, 98%, 57%, 0.3);
  border-radius: 8px;
  &::selection {
    background: hsla(209, 90%, 85%, 0.3);
  }
`;
