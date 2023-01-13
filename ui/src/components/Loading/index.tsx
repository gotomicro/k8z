import React from 'react';
import { StyledLoading } from '@/components/Loading/styles/index.styled';
import { Spin } from 'antd';

interface LoadingProps {
  loading?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ loading = false, size, tip = '加载中...' }) => {
  return (
    <StyledLoading>
      <Spin size={size} spinning={loading} tip={tip} />
    </StyledLoading>
  );
};
export default Loading;
