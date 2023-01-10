import styled from 'styled-components';
import MonacoEditor from '@monaco-editor/react';
export const StyledConfigMapContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fff;
`;

export const StyledConfigMapEditorEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const StyledConfigMapEditorOptions = styled.div`
  position: absolute;
  top: 0;
  right: 18px;
  height: 32px;
  gap: 8px;
`;

export const StyledConfigMapEditor = styled(MonacoEditor)`
  width: 100%;
  height: 100%;
  padding-top: 8px;
`;
