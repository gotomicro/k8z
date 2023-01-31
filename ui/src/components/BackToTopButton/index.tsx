import { FloatButton } from 'antd';
import React, { useCallback } from 'react';

const BackToTopButton: React.FC = () => {
  const handleScrollTarget = useCallback(() => document.getElementById('main') || window, []);

  return <FloatButton.BackTop target={handleScrollTarget} visibilityHeight={100} />;
};
export default BackToTopButton;
