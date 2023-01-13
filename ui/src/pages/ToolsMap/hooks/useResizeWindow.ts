import { useCallback, useEffect, useState } from 'react';

const BOARD_PADDING = 100;
const DEFAULT_ITEM_CARD_WIDTH = 250;
const DEFAULT_ITEM_GAP = 16;
const DIFFERENCE_QUANTITY = 1;

export const useResizeWindow = () => {
  const [spaceWidth, setSpaceWidth] = useState<number>();

  // 根据窗口宽度计算每行放多少张工具卡片，最少放两张
  const handleResizeWidth = useCallback(() => {
    const originalWidth = window.innerWidth - BOARD_PADDING;
    const cardNum = Math.floor(originalWidth / DEFAULT_ITEM_CARD_WIDTH);
    const intervalNum = cardNum - DIFFERENCE_QUANTITY;
    const spaceNeedWidth = cardNum * DEFAULT_ITEM_CARD_WIDTH + intervalNum * DEFAULT_ITEM_GAP;
    setSpaceWidth(spaceNeedWidth);
  }, []);

  useEffect(() => {
    handleResizeWidth();
    window.onresize = handleResizeWidth;
    return () => {
      window.onresize = null;
    };
  }, [handleResizeWidth]);

  return { spaceWidth };
};
