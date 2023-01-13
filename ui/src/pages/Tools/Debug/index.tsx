import React from 'react';
import ContentCard from '@/components/ContentCard';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import type { FormParams } from '@/pages/Tools/Debug/components/ConfigForm';
import ConfigForm from '@/pages/Tools/Debug/components/ConfigForm';
import { Empty, Form } from 'antd';
import type { Pod } from '@/services/pods';
import { useContainer } from '@/hooks/useContainer';
import { useDebug } from '@/pages/Tools/Debug/hooks/useDebug';
import Loading from '@/components/Loading';
import {
  StyledDebug,
  StyledDebugTerm,
  StyledDebugTermEmpty,
} from '@/pages/Tools/Debug/styles/index.styled';

interface DebugProps {
  currentPod: Pod;
}

const Debug: React.FC<DebugProps> = ({ currentPod }) => {
  const toolName = localStorageManage(k8zStorageKeys.toolsName);
  const [form] = Form.useForm<FormParams>();
  const { containers, podInfo } = useContainer({
    pod: currentPod,
  });

  const { loading, startDebug, terminalRef, handleSubmit, handleStopClient } = useDebug({
    podInfo,
  });

  return (
    <>
      <ContentCard title={`${toolName}-Config`} height="132px">
        <ConfigForm
          form={form}
          isStart={startDebug}
          containers={containers}
          handleFinish={handleSubmit}
          handleStopClient={handleStopClient}
        />
      </ContentCard>
      <ContentCard title={`${toolName}-Content`} id="debug_content" height="80vh">
        <StyledDebug>
          {loading && <Loading loading={loading} tip="正在创建副本..." />}
          {startDebug ? (
            <StyledDebugTerm ref={terminalRef} isShow={loading} />
          ) : (
            <StyledDebugTermEmpty>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未进行 Debug" />
            </StyledDebugTermEmpty>
          )}
        </StyledDebug>
      </ContentCard>
    </>
  );
};
export default Debug;
