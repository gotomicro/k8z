import ContentCard from '@/components/ContentCard';
import ClusterOptions from '@/pages/ClustersManage/ClusterOptions';
import CreateClusterModal from '@/pages/ClustersManage/components/CreateClusterModal';
import UpdateClusterModal from '@/pages/ClustersManage/components/UpdateClusterModal';
import { useClusters } from '@/pages/ClustersManage/hooks/useClusters';
import type { Clusters } from '@/services/cluster';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'umi';
import styles from './styles/index.less';

const ClustersManage = () => {
  const [searchParams] = useSearchParams();
  const {
    clusters,
    openCreate,
    openUpdate,
    editorCluster,
    submitLoading,
    handleCancelModal,
    handleOpenCreateModal,
    handleOpenUpdateModal,
    handleDeleteCluster,
    handleClusterFormSubmit,
  } = useClusters();

  const columns: ColumnsType<Clusters> = useMemo(() => {
    return [
      {
        title: '集群',
        dataIndex: 'name',
      },
      {
        title: '操作',
        key: 'Options',
        width: 120,
        render: (record: Clusters) => (
          <ClusterOptions
            name={record.name}
            isStaticConfig={record.isStaticConfig}
            onUpdate={handleOpenUpdateModal}
            onDelete={handleDeleteCluster}
          />
        ),
      },
    ];
  }, [handleDeleteCluster, handleOpenUpdateModal]);

  // 支持从url上增加创建集群
  useEffect(() => {
    if (searchParams.get('quickCreated') === 'true') {
      handleOpenCreateModal();
    }
  }, [searchParams, handleOpenCreateModal]);

  return (
    <>
      <ContentCard title="Cluster">
        <Table
          rowKey={'name'}
          size={'small'}
          columns={columns}
          scroll={{ y: 'calc(90vh - 44px)' }}
          className={styles.tableWrapper}
          rowClassName={styles.row}
          dataSource={clusters}
          pagination={false}
        />
        <Button
          type="link"
          className={styles.createIcon}
          onClick={handleOpenCreateModal}
          icon={
            <Tooltip title="新建集群">
              <PlusOutlined />
            </Tooltip>
          }
        />
        <CreateClusterModal
          open={openCreate}
          loading={submitLoading}
          onCancel={handleCancelModal}
          handleSubmit={handleClusterFormSubmit}
        />
        <UpdateClusterModal
          open={openUpdate}
          loading={submitLoading}
          cluster={editorCluster}
          onCancel={handleCancelModal}
          handleSubmit={handleClusterFormSubmit}
        />
      </ContentCard>
    </>
  );
};
export default ClustersManage;
