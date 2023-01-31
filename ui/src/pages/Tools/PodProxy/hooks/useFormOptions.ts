import { INIT_MONACO_WAIT } from '@/configs/default';
import type { ProxyResultParams } from '@/services/podProxy';
import { sendPodProxy } from '@/services/podProxy';
import type { Pod } from '@/services/pods';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';
import { Form, message } from 'antd';
import lodash from 'lodash';
import { useCallback, useState } from 'react';

export const useFormOptions = ({ currentPod }: { currentPod: Pod }) => {
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

  return { form, loading, sendResult, handleResetTab, handleFinishForm };
};
