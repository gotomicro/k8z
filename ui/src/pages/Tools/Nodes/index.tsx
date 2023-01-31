import ContentCard from '@/components/ContentCard';
import FilterForm from '@/pages/Tools/Nodes/components/FilterForm';
import { AnchorScrollKey } from '@/utils/documentScrollUtil';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { useForm } from 'antd/es/form/Form';
import React from 'react';

export interface FormParams {
  method: string;
  filter: string;
}

interface NodesProps {
  cluster: string;
  namespace: string;
}
const Nodes: React.FC<NodesProps> = () => {
  const [form] = useForm<FormParams>();
  return (
    <>
      <FilterForm form={form} />
      <ContentCard
        title={`${localStorageManage(k8zStorageKeys.toolsName)}`}
        id={AnchorScrollKey.NodesList}
        height="90vh"
      />
    </>
  );
};

export default Nodes;
