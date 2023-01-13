import type { Pod } from '@/services/pods';
import React, { useCallback, useEffect, useState } from 'react';
import type { ProxyResultParams } from '@/services/podProxy';
import { sendPodProxy } from '@/services/podProxy';
import { Form, message } from 'antd';
import lodash from 'lodash';
import ContentCard from '@/components/ContentCard';
import ProxyRequest from '@/pages/Tools/PodProxy/components/ProxyRequest';
import ProxyResponse from '@/pages/Tools/PodProxy/components/ProxyResponse';
import Loading from '@/components/Loading';
import { INIT_MONACO_WAIT } from '@/configs/default';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';

export enum RequestProtocols {
  http = 'http://',
}

interface PodProxyProps {
  currentPod: Pod;
}
const PodProxy: React.FC<PodProxyProps> = ({ currentPod }) => {
  const [sendResult, setSendResult] = useState<ProxyResultParams>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleResetTab = useCallback(() => {
    setSendResult(undefined);
    form.resetFields();
    if (currentPod) {
      form.setFieldsValue({
        clusterName: currentPod.cluster,
        namespace: currentPod.namespace,
        podName: currentPod.name,
      });
    }
  }, [currentPod, form]);

  const handleFinishForm = useCallback((fields: any) => {
    const requestBody = lodash.pick(fields, ['info']).info;
    const requestInfo = {
      ...lodash.pick(fields, ['clusterName', 'namespace', 'podName', 'method']),
      url: `${fields.urlBefore}${fields.url ?? ''}`,
    };
    const headers = JSON.stringify(
      requestBody?.headers
        ?.filter((item: any) => item.key)
        .reduce((pre: any, cur: any) => {
          pre[cur.key] = cur?.value ?? '';
          return pre;
        }, {}) ?? [],
    );
    const payload = requestBody?.body ?? '';
    if (!requestInfo.url) {
      message.warning({ content: '请填写相关的请求信息', key: 'request-warn' });
      return;
    }

    setLoading(true);
    sendPodProxy({ ...requestInfo, headers, payload })
      .then((res) => {
        if (res?.code !== 0) {
          message.error({
            content: res?.msg ?? '接口出现未知错误，请重新尝试',
            key: 'testApi-error',
          });
          return;
        }
        setSendResult(res.data);
        documentScrollUtil(AnchorScrollKey.Response);
      })
      .catch((e) => {
        message.error({
          content: `【未知错误】: ${JSON.stringify(e)}`,
          key: 'testApi-request-error',
        });
        console.error(e);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), INIT_MONACO_WAIT);
      });
  }, []);

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
