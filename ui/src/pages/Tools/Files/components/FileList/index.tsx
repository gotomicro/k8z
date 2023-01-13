import React, { useCallback, useMemo } from 'react';
import { Button, Empty, Table } from 'antd';
import type { FileInfo } from '@/services/podContainers';
import type { ColumnsType } from 'antd/es/table';
import { stringTimeFormat } from '@/utils/timeUtils';
import classNames from 'classnames';
import numeral from 'numeral';
import type { TableRowSelection } from 'antd/lib/table/interface';
import styles from '@/pages/Tools/Files/styles/list.less';
import { StyledFiles } from '@/pages/Tools/Files/styles/list.styled';
import type { FilesContentProps } from '@/pages/Tools/Files/components/FilesContent';

export interface FileListProps extends FilesContentProps {
  fileList: FileInfo[];
  folderPath: string;
  loadingList: boolean;
  handleClickJumpPath: (path: string) => void;
  handleClickDownloadFileOrFolder: (path: string) => void;
  handleChangeSelectFiles: (selectedRowKeys: React.Key[], selectedRows: FileInfo[]) => void;
}

const FileList: React.FC<FileListProps> = ({
  pod,
  fileList,
  folderPath,
  loadingList,
  handleClickJumpPath,
  handleChangeSelectFiles,
  handleClickDownloadFileOrFolder,
}) => {
  const filePath = useCallback(
    (name: string) => {
      if (name === '.') {
        return folderPath;
      }
      if (name === '..') {
        const reg = /(\/)[^/]+$/g;
        return folderPath.replace(reg, '') || '/';
      }
      return folderPath === '/' ? `${folderPath}${name}` : `${folderPath}/${name}`;
    },
    [folderPath],
  );
  const handleNameRender = useCallback(
    (name: string, record: FileInfo) => {
      if (!record.isDir) {
        return <span className={styles.titleSelect}>{name}</span>;
      }
      if (record.isLink) {
        return (
          <a
            className={styles.titleSelect}
            onClick={() => handleClickJumpPath(filePath(name))}
          >{`-> ${record.linkTarget}`}</a>
        );
      }
      return (
        <a
          className={styles.titleSelect}
          onClick={(e) => {
            e.stopPropagation();
            handleClickJumpPath(filePath(name));
          }}
        >
          {name}
        </a>
      );
    },
    [filePath, handleClickJumpPath],
  );

  const columns: ColumnsType<FileInfo> = useMemo(() => {
    return [
      {
        title: '文件名称',
        dataIndex: 'name',
        fixed: 'left',
        width: 300,
        render: handleNameRender,
      },
      {
        title: '文件类型',
        dataIndex: 'isDir',
        width: 100,
        render: (isDir: boolean) => {
          return isDir ? '文件夹' : '文件';
        },
        defaultSortOrder: 'ascend',
        sortDirections: ['ascend', 'descend'],
        sorter: (a, b) => {
          const first = a.isDir ? 0 : 1;
          const last = b.isDir ? 0 : 1;
          return first - last;
        },
      },
      {
        title: '文件大小（B）',
        dataIndex: 'size',
        width: 120,
        render: (size: string) => numeral(size).format('0[.]000b'),
      },
      {
        title: 'User',
        dataIndex: 'user',
        width: 100,
      },
      {
        title: 'Group',
        dataIndex: 'group',
        width: 100,
      },
      {
        title: '修改时间',
        dataIndex: 'modifyTime',
        width: 200,
        render: (time: string) => stringTimeFormat(time),
      },
      {
        title: '操作',
        dataIndex: 'options',
        fixed: 'right',
        width: 80,
        render: (_: any, record: FileInfo) => {
          return (
            <Button
              type="link"
              disabled={['.', '..', '/'].includes(record.name)}
              onClick={() => handleClickDownloadFileOrFolder(filePath(record.name))}
            >
              下载
            </Button>
          );
        },
      },
    ];
  }, [filePath, handleClickDownloadFileOrFolder, handleNameRender]);

  const rowSelection: TableRowSelection<FileInfo> = {
    type: 'checkbox',
    onChange: handleChangeSelectFiles,
    getCheckboxProps: (record: FileInfo) => ({
      disabled: record.name === '.' || record.name === '..', // Column configuration not to be checked
      name: record.name,
    }),
  };

  if (!pod) {
    return (
      <div className={classNames(styles.empty, styles.files)}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <StyledFiles>
      <Table
        rowSelection={rowSelection}
        loading={loadingList}
        size={'small'}
        rowKey={'name'}
        scroll={{ x: '1200', y: 'calc(60vh - 124px)' }}
        pagination={false}
        columns={columns}
        dataSource={fileList}
      />
    </StyledFiles>
  );
};
export default FileList;
