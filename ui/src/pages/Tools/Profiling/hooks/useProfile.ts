import type { Pod } from '@/services/pods';
import type { CreateProfileParams, Profile } from '@/services/profiling';
import { createdProfile, getProfiles, Modes } from '@/services/profiling';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';
import { message } from 'antd';
import lodash from 'lodash';
import { useCallback, useState } from 'react';

export const useProfile = ({ currentPod }: { currentPod: Pod }) => {
  const [profile, setProfile] = useState<{ url: string } | undefined>();
  const [spinningProfile, setSpinningProfile] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState(false);
  const [profileHistoryList, setProfileHistoryList] = useState<Profile[]>([]);

  const handleResetProfile = useCallback(() => {
    setProfile(undefined);
  }, []);

  const handleCreateProfile = useCallback((data: CreateProfileParams) => {
    setSpinningProfile(true);
    createdProfile(data)
      .then((res) => {
        if (res.code === 0) {
          message.success({ content: '生成 Profile 成功', key: 'create-profile-success' });
          setProfile(res.data);
        } else {
          message.error({
            content: `【生成 Profile 失败】: ${res.msg}`,
            key: 'create-profile-error',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        message.error({
          content: `【生成 Profile 失败】: ${err.msg}`,
          key: 'create-profile-error',
        });
      })
      .finally(() => {
        setSpinningProfile(false);
        documentScrollUtil(AnchorScrollKey.Profile);
      });
  }, []);

  const handleSubmitForm = useCallback(
    (fields: Pick<CreateProfileParams, 'mode' | 'port' | 'seconds' | 'addr'>) => {
      if (!currentPod) {
        return;
      }
      const podInfo = {
        ...lodash.pick(currentPod, ['cluster', 'namespace', 'workload', 'workloadKind']),
        podName: currentPod.name,
      };
      if (fields.mode === Modes.pod) {
        const { addr, ...params } = fields;
        handleCreateProfile({
          ...params,
          ...podInfo,
        });
        return;
      }

      if (fields.mode === Modes.ip) {
        handleCreateProfile({
          ...fields,
          ...podInfo,
        });
      }
    },
    [currentPod, handleCreateProfile],
  );

  const handleClickJumpHistory = useCallback(() => {
    const params = {
      ...lodash.pick(currentPod, ['cluster', 'namespace', 'workload', 'workloadKind']),
      podName: currentPod.name,
    };
    getProfiles(params)
      .then((res) => {
        if (res.code === 0) {
          handleResetProfile();
          setProfileHistoryList(res.data);
          setShowHistory(true);
          return;
        }
        message.error({ content: res.msg, key: 'error' });
      })
      .catch(console.error);
  }, [currentPod, handleResetProfile]);

  const handleClickJumpCreate = useCallback(() => {
    handleResetProfile();
    setShowHistory(false);
  }, [handleResetProfile]);

  return {
    profile,
    showHistory,
    spinningProfile,
    profileHistoryList,
    handleResetProfile,
    handleSubmitForm,
    handleClickJumpHistory,
    handleClickJumpCreate,
    handleClickChangeProfile: setProfile,
  };
};
