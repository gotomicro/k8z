import React from 'react';
import styles from '@/pages/Tools/Files/styles/header.less';
import { useCallback } from 'react';
import { message } from 'antd';

interface FilesPathItemProps {
  folder: string;
  folderPath: string;
  handleClickJumpPath: (path: string) => void;
}
const FilesPathItem: React.FC<FilesPathItemProps> = ({
  folder,
  folderPath,
  handleClickJumpPath,
}) => {
  const handleJumpPath = useCallback(() => {
    const clickPath = folderPath.split(folder)[0] + folder;
    if (clickPath === folderPath) {
      message.warning({ content: '已在当前路径', key: 'folder-path-jump-warn' });
      return;
    }
    handleClickJumpPath(clickPath);
  }, [folder, folderPath, handleClickJumpPath]);
  return (
    <div className={styles.folderPathContent}>
      <span className={styles.folderPathDivision}>/</span>
      <span className={styles.folderPathContext} onClick={handleJumpPath}>
        {folder}
      </span>
    </div>
  );
};
export default FilesPathItem;
