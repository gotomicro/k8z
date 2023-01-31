import { SmileOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import React from 'react';
import './styles/index.less';

const AppInit: React.FC = () => {
  console.log('href', location.href);
  return (
    <Result
      className="initResult"
      icon={<SmileOutlined className="iconRotation" />}
      title="加载中..."
    />
  );
};
export default AppInit;
