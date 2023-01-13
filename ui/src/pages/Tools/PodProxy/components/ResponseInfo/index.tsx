import React from 'react';
import { useMemo } from 'react';
import type { ProxyResultParams } from '@/services/podProxy';
import { ResponseTypes } from '@/pages/Tools/PodProxy/components/ResponseType';
import ResponseBody from '@/pages/Tools/PodProxy/components/ResponseInfo/ResponseBody';
import ResponseHeaders from '@/pages/Tools/PodProxy/components/ResponseInfo/ResponseHeaders';
import { StyledResponseInfo } from '@/pages/Tools/PodProxy/styles/response.styled';

export interface DefaultResponseInfoProps {
  value?: Pick<ProxyResultParams, 'body' | 'headers'>;
}

export interface ResponseInfoProps extends DefaultResponseInfoProps {
  type: ResponseTypes;
}
const ResponseInfo: React.FC<ResponseInfoProps> = ({ type, ...defaultProps }) => {
  const TypeInfo = useMemo(() => {
    switch (type) {
      case ResponseTypes.Body:
        return <ResponseBody {...defaultProps} />;
      case ResponseTypes.Headers:
        return <ResponseHeaders {...defaultProps} />;
      // case ResponseTypes.Cookies:
      //   return (
      //     <StyledResponseInfo>
      //       <ResponseCookies {...defaultProps} />
      //     </StyledResponseInfo>
      //   );
      default:
        return null;
    }
  }, [defaultProps, type]);

  return <StyledResponseInfo>{TypeInfo}</StyledResponseInfo>;
};
export default ResponseInfo;
