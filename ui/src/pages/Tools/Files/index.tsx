import ContentCard from '@/components/ContentCard';
import React from 'react';
import { useContainer } from '@/hooks/useContainer';
import ContainerSelectCard from '@/components/ContainerSelectCard';
import type { Pod } from '@/services/pods';
import FilesContent from '@/pages/Tools/Files/components/FilesContent';
import { StyledFileCardEmpty } from '@/pages/Tools/Files/styles/index.styled';

interface FilesProps {
  currentPod: Pod;
}

const Files: React.FC<FilesProps> = ({ currentPod }) => {
  const { container, containers, podInfo, handleChangeContainer } = useContainer({
    pod: currentPod,
  });

  return (
    <>
      <ContainerSelectCard
        value={container}
        options={containers}
        onChange={handleChangeContainer}
      />
      <ContentCard title="文件管理" height="60vh">
        {container && podInfo ? (
          <FilesContent pod={{ ...podInfo, container }} />
        ) : (
          <StyledFileCardEmpty />
        )}
      </ContentCard>
    </>
  );
};
export default Files;
