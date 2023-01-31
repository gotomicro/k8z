import ContentCard from '@/components/ContentCard';
import Loading from '@/components/Loading';
import ProxyRequest from '@/pages/Tools/PodProxy/components/ProxyRequest';
import ProxyResponse from '@/pages/Tools/PodProxy/components/ProxyResponse';
import { useFormOptions } from '@/pages/Tools/PodProxy/hooks/useFormOptions';
import type { Pod } from '@/services/pods';
import React, { useEffect } from 'react';

export enum RequestProtocols {
  http = 'http://',
}

interface PodProxyProps {
  currentPod: Pod;
}
const PodProxy: React.FC<PodProxyProps> = ({ currentPod }) => {
  const { form, loading, sendResult, handleResetTab, handleFinishForm } = useFormOptions({
    currentPod,
  });

  useEffect(() => {
    handleResetTab();
  }, [handleResetTab]);

  return (
    <>
      <ContentCard title="Proxy-Request" height="346px">
        <ProxyRequest handleFinishForm={handleFinishForm} form={form} podName={currentPod.name} />
      </ContentCard>
      <ContentCard title="Proxy-Response" height="60vh" id="response">
        {loading ? (
          <Loading loading={loading} tip="正在发送请求" />
        ) : (
          <ProxyResponse result={sendResult} />
        )}
      </ContentCard>
    </>
  );
};
export default PodProxy;
