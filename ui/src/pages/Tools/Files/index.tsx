import ContainerSelectCard from '@/components/ContainerSelectCard';
import ContentCard from '@/components/ContentCard';
import { useContainer } from '@/hooks/useContainer';
import FilesContent from '@/pages/Tools/Files/components/FilesContent';
import { StyledFileCardEmpty } from '@/pages/Tools/Files/styles/index.styled';
import type { Pod } from '@/services/pods';
import React from 'react';

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
