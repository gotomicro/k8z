import ResponseInfo from '@/pages/Tools/PodProxy/components/ResponseInfo';
import ResponseType from '@/pages/Tools/PodProxy/components/ResponseType';
import { useResponseType } from '@/pages/Tools/PodProxy/hooks/useResponseType';
import {
  StyledPodProxyEmptyResponse,
  StyledPodProxyResponse,
} from '@/pages/Tools/PodProxy/styles/request.styled';
import type { ProxyResultParams } from '@/services/podProxy';
import { Empty } from 'antd';
import lodash from 'lodash';
import React from 'react';

interface ProxyResponseProps {
  result?: ProxyResultParams;
}
const ProxyResponse: React.FC<ProxyResponseProps> = ({ result }) => {
  const { selectResponseType, handleChangeSelectResponseType } = useResponseType();

  if (result) {
    const resultInfo = lodash.pick(result, ['body', 'headers']);
    const response = lodash.pick(result, ['status', 'statusCode', 'duration', 'contentLength']);
    return (
      <StyledPodProxyResponse>
        <ResponseType
          value={selectResponseType}
          response={response}
          onChange={handleChangeSelectResponseType}
        />
        <ResponseInfo value={resultInfo} type={selectResponseType} />
      </StyledPodProxyResponse>
    );
  }

  return (
    <StyledPodProxyEmptyResponse>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'输入 URL 并发送请求'} />
    </StyledPodProxyEmptyResponse>
  );
};
export default ProxyResponse;
