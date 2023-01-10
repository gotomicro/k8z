import styled from 'styled-components';

export const StyledToolItem = styled.div`
  position: relative;
  padding: 25px 15px 15px;
  width: 250px;
  height: 250px;
  border-radius: 8px;
  box-shadow: 8px 10.5px 28.5px rgb(39 44 49 / 6%), 1px 2px 8px rgb(39 44 49 / 3%);
  background: #fff;
  cursor: pointer;
  :hover {
    background: #a1e0ff;
  }
`;

export const StyledToolItemTitle = styled.div`
  position: absolute;
  top: -18px;
  left: 0;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledToolItemTitleContext = styled.div`
  padding: 8px 15px;
  background: #249ffd;
  height: 36px;
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

export const StyledToolItemImg = styled.div<{
  url: string;
}>`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  ${({ url }) =>
    url
      ? `
    background-image: url(${url});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 50% 50%;
    background-color: #f5f5f5;
  `
      : 'background-color: #f5f5f5;'}
`;
