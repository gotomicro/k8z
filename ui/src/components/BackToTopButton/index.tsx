import React, { useCallback } from 'react';
import { FloatButton } from 'antd';

const BackToTopButton: React.FC = () => {
  const handleScrollTarget = useCallback(() => document.getElementById('main') || window, []);

  return <FloatButton.BackTop target={handleScrollTarget} visibilityHeight={100} />;
};
export default BackToTopButton;
