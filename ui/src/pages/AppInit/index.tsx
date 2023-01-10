import { Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import React from 'react';
import './styles/index.less';

const AppInit: React.FC = () => {
  return (
    <Result
      className="initResult"
      icon={<SmileOutlined className="iconRotation" />}
      title="加载中..."
    />
  );
};
export default AppInit;
