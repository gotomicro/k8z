import { ResponseTypes } from '@/pages/Tools/PodProxy/components/ResponseType';
import { useCallback, useState } from 'react';

export const useResponseType = () => {
  const [selectResponseType, setSelectResponseType] = useState<ResponseTypes>(ResponseTypes.Body);

  const handleChangeSelectResponseType = useCallback((value: ResponseTypes) => {
    setSelectResponseType(value);
  }, []);

  return {
    selectResponseType,
    handleChangeSelectResponseType,
  };
};
