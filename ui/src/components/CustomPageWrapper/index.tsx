import { Card } from 'antd';
import type { CardProps } from 'antd/lib/card/Card';
import type { ReactNode } from 'react';

interface CustomPageWrapperProps extends CardProps {
  children?: ReactNode;
}
const CustomPageWrapper = ({ children, ...restProps }: CustomPageWrapperProps) => {
  return (
    <Card {...restProps} style={{ flex: 1, height: '100%' }}>
      {children}
    </Card>
  );
};

export default CustomPageWrapper;
