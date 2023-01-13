import ContentCard from '@/components/ContentCard';
import { Select } from 'antd';
import React from 'react';
import type { DefaultOptionType } from 'rc-select/lib/Select';

interface ContainerSelectCardProps {
  value?: string;
  onChange?: (value?: string) => void;
  options?: DefaultOptionType[];
}

const ContainerSelectCard: React.FC<ContainerSelectCardProps> = ({ value, onChange, options }) => {
  return (
    <ContentCard title={'Container'} height="76px">
      <Select
        allowClear
        showSearch
        value={value}
        onChange={onChange}
        options={options}
        style={{ margin: '8px 0', width: '100%' }}
        placeholder="请选择 Container"
      />
    </ContentCard>
  );
};
export default ContainerSelectCard;
