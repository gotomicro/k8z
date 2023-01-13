import React, { useMemo } from 'react';
import { StyledPodProxyRequestInfo } from '@/pages/Tools/PodProxy/styles/request.styled';
import RequestBody from '@/pages/Tools/PodProxy/components/ProxyRequestInfo/RequestBody';
import RequestHeaders from '@/pages/Tools/PodProxy/components/ProxyRequestInfo/RequestHeaders';
import { RequestTypes } from '@/pages/Tools/PodProxy/components/RequestType';

export interface DefaultInfoProps {
  value?: any;
  onChange?: (value?: any) => void;
}

export interface RequestInfoProps extends DefaultInfoProps {
  infoType: RequestTypes;
}

const ProxyRequestInfo: React.FC<RequestInfoProps> = ({ infoType, ...defaultProps }) => {
  const Info = useMemo(() => {
    switch (infoType) {
      case RequestTypes.Body:
        return (
          <StyledPodProxyRequestInfo>
            <RequestBody {...defaultProps} />
          </StyledPodProxyRequestInfo>
        );
      case RequestTypes.Headers:
        return (
          <StyledPodProxyRequestInfo>
            <RequestHeaders />
          </StyledPodProxyRequestInfo>
        );

      default:
        return <StyledPodProxyRequestInfo {...defaultProps} />;
    }
  }, [defaultProps, infoType]);

  return <>{Info}</>;
};
export default ProxyRequestInfo;
