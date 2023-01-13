import { useCallback, useState } from 'react';
import { ResponseTypes } from '@/pages/Tools/PodProxy/components/ResponseType';

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
