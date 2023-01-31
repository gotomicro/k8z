import type { ClusterInfo, ClusterMethod, Clusters } from '@/services/cluster';
import { createOrUpdateCluster, getClusterList, getOrDeleteCluster } from '@/services/cluster';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

export const useClusters = () => {
  const [clusters, setClusters] = useState<Clusters[]>([]);
  const [editorCluster, setEditorCluster] = useState<ClusterInfo>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const getClusters = useCallback(() => {
    getClusterList()
      .then((res) => {
        if (res?.code === 0) {
          setClusters(res.data);
          return;
        }
        message.warning({
          content: `【集群列表获取失败】: ${res?.msg ?? '未知错误'}`,
          key: 'clusters-warn',
        });
      })
      .catch((e) => {
        message.error({
          content: `【集群列表获取失败】: ${e?.msg ?? '未知错误'}`,
          key: 'clusters-error',
        });
        console.error('【GetClusterList】: ', e);
      });
  }, []);

  // 打开创建集群的弹窗
  const handleOpenCreateModal = useCallback(() => {
    setOpenCreate(true);
  }, []);

  // 打开编辑集群的弹窗
  const handleOpenUpdateModal = useCallback((name: string) => {
    message.loading({
      content: '正在获取集群信息...',
      key: 'cluster-info',
      duration: 0,
    });
    getOrDeleteCluster(name, 'GET')
      .then((res) => {
        if (res?.code === 0) {
          message.destroy('cluster-info');
          setEditorCluster(res.data);
          setOpenUpdate(true);
          return;
        }
        message.error({
          content: `获取集群信息失败：${res?.msg.toString() ?? '未知错误'}`,
          key: 'cluster-info',
          duration: 3,
        });
      })
      .catch((e) => {
        message.error({
          content: `获取集群信息失败：${e.toString()}`,
          key: 'cluster-info',
          duration: 3,
        });
        console.error(e);
      });
  }, []);

  // 关闭弹窗
  const handleCancelModal = useCallback(() => {
    if (openCreate) {
      setOpenCreate(false);
    }
    if (openUpdate) {
      setOpenUpdate(false);
    }
  }, [openCreate, openUpdate]);

  // 删除集群
  const handleDeleteCluster = useCallback(
    (name: string) => {
      message.loading({ content: `正在删除集群：${name}...`, key: 'cluster-delete', duration: 0 });
      getOrDeleteCluster(name, 'DELETE')
        .then((res) => {
          if (res?.code === 0) {
            getClusters();
            message.success({
              content: `删除集群[ ${name} ]成功`,
              key: 'cluster-delete',
              duration: 3,
            });
            return;
          }
          message.error({
            content: `【删除集群[ ${name} ]失败】${res?.msg ?? '未知错误'}`,
            key: 'cluster-delete',
            duration: 3,
          });
        })
        .catch((e) => {
          message.error({
            content: `【删除集群[ ${name} ]失败】${e.toString()}`,
            key: 'cluster-delete',
            duration: 3,
          });
          console.error(e);
        });
    },
    [getClusters],
  );

  // 新增或者更新
  const handleClusterFormSubmit = useCallback(
    (field: ClusterInfo, method: ClusterMethod) => {
      setSubmitLoading(true);
      createOrUpdateCluster(field, method)
        .then((res) => {
          if (res?.code === 0) {
            handleCancelModal();
            getClusters();
            setEditorCluster(undefined);
            if (method === 'PUT') {
              message.success({ content: `${field.name} 编辑成功`, key: 'submit-form' });
            } else if (method === 'POST') {
              message.success({ content: `${field.name} 新建成功`, key: 'submit-form' });
            }
            return;
          }
          message.error({ content: `【表单提交失】${res?.msg ?? '未知错误'}`, key: 'submit-form' });
        })
        .catch((e) => {
          message.error({ content: `【表单提交失】${e.toString()}`, key: 'submit-form' });
          console.error(e);
        })
        .finally(() => setSubmitLoading(false));
    },
    [getClusters, handleCancelModal],
  );

  useEffect(() => {
    getClusters();
  }, [getClusters]);

  return {
    clusters,
    getClusters,
    openCreate,
    openUpdate,
    submitLoading,
    editorCluster,
    handleCancelModal,
    handleOpenCreateModal,
    handleOpenUpdateModal,
    handleDeleteCluster,
    handleClusterFormSubmit,
  };
};
