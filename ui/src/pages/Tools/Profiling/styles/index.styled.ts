import styled from 'styled-components';

export const StyledProfileCreatedMode = styled.div`
  display: flex;
  margin-top: 8px;
`;
export const StyledEmptyOrSpin = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const StyledErrorDependency = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  ul,
  ol {
    margin: 0;
    padding-left: 20px;
    list-style: decimal;
    strong {
      color: crimson;
    }
  }
`;
