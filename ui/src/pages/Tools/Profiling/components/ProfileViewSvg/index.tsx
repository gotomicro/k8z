import Loading from '@/components/Loading';
import { DEFAULT_WAIT } from '@/configs/default';
import {
  StyledIframe,
  StyledProfileViewSvg,
  StyledTools,
} from '@/pages/Tools/Profiling/styles/profileView.styled';
import { getDownloadProfilePath } from '@/pages/Tools/Profiling/utils/downloadProfileUtil';
import {
  GET_PROFILE_DIFF_SVG_URL,
  GET_PROFILE_SVG_URL,
  GoTypeMapping,
  GoTypes,
  runProfilesDiff,
  SvgTypeMapping,
  SvgTypes,
} from '@/services/profiling';
import { RequestBaseUrl } from '@/utils/electronRenderUtil';
import { FullscreenExitOutlined, FullscreenOutlined, LinkOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { useThrottleFn } from 'ahooks';
import { Button, message, Radio, Space, Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export interface ProfileViewProps {
  url?: string;
  baseUrl?: string;
  targetUrl?: string;
  iframeHeight?: string;
  style?: React.CSSProperties;
}
const ProfileViewSvg: React.FC<ProfileViewProps> = ({
  url,
  baseUrl,
  targetUrl,
  style,
  iframeHeight,
}) => {
  const [svgType, setSvgType] = useState<SvgTypes>(SvgTypes.profile);
  const [goType, setGoType] = useState<GoTypes>(GoTypes.profile);
  const [loadingDiff, setLoadingDiff] = useState<boolean>(false);
  const [isFull, setIsFull] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState') || {};
  const isElectron = initialState?.isElectron ?? false;

  const handleChangeSvgType = useCallback((e: any) => {
    setSvgType(e.target.value);
  }, []);

  const handleChangeGoType = useCallback((type: any) => {
    setGoType(type);
  }, []);

  const handleChangeFullScreen = useCallback(() => {
    setIsFull((isFull) => !isFull);
  }, []);

  const handleClickFullButton = useThrottleFn(handleChangeFullScreen, { wait: DEFAULT_WAIT }).run;

  const handleClickDownload = useCallback(() => {
    if (!url) {
      message.warning({ content: 'URL 不存在', key: 'download-warn' });
      return;
    }
    const downloadPath = getDownloadProfilePath(url);
    if (isElectron) {
      window.electron?.downloading?.(downloadPath);
      return;
    }

    window.open(downloadPath, '_self');
  }, [isElectron, url]);

  const SvgUrl = useCallback(
    (type?: GoTypes) => {
      if (baseUrl && targetUrl && !loadingDiff) {
        return `${RequestBaseUrl}${GET_PROFILE_DIFF_SVG_URL}?baseUrl=${baseUrl}&targetUrl=${targetUrl}&svgType=${svgType}&goType=${
          type ?? goType
        }`;
      }
      if (url) {
        return `${RequestBaseUrl}${GET_PROFILE_SVG_URL}?url=${url}&svgType=${svgType}&goType=${
          type ?? goType
        }`;
      }
      return '';
    },
    [baseUrl, targetUrl, loadingDiff, url, svgType, goType],
  );

  const TabItems = useMemo(() => {
    return Object.keys(GoTypeMapping).map((type) => ({
      label: GoTypeMapping[type],
      key: type,
      children: <StyledIframe src={SvgUrl(GoTypes[type])} height={iframeHeight} />,
    }));
  }, [SvgUrl, iframeHeight]);

  const handleRunProfilesDiff = useCallback(() => {
    setLoadingDiff(true);
    runProfilesDiff({
      baseUrl: baseUrl,
      targetUrl: targetUrl,
    }).finally(() => {
      setLoadingDiff(false);
    });
  }, [baseUrl, targetUrl]);

  const handleKeyDown = useCallback(
    (e: any) => {
      // esc 键
      if (isFull && e.keyCode === 27) {
        setIsFull(false);
      }
      return;
    },
    [isFull],
  );

  useEffect(() => {
    if (url || (baseUrl && targetUrl)) {
      setSvgType(SvgTypes.profile);
      handleChangeGoType(GoTypes.profile);
    }
    if (baseUrl && targetUrl) {
      handleRunProfilesDiff();
    }
  }, [baseUrl, handleChangeGoType, handleRunProfilesDiff, targetUrl, url]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (loadingDiff) {
    return <Loading loading={loadingDiff} tip={'正在加载 Profiles...'} />;
  }
  return (
    <StyledProfileViewSvg style={style} isFull={isFull}>
      <StyledTools>
        <Radio.Group defaultValue={SvgTypes.profile} value={svgType} onChange={handleChangeSvgType}>
          <Radio.Button value={SvgTypes.flame}>{SvgTypeMapping[SvgTypes.flame]}</Radio.Button>
          <Radio.Button value={SvgTypes.profile}>{SvgTypeMapping[SvgTypes.profile]}</Radio.Button>
        </Radio.Group>
        <Space>
          {!!url && (
            <Button type={'link'} onClick={handleClickDownload} icon={<LinkOutlined />}>
              下载全部原文件
            </Button>
          )}
          <Button
            type="link"
            icon={isFull ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={handleClickFullButton}
          />
        </Space>
      </StyledTools>
      <Tabs
        defaultActiveKey={GoTypes.profile}
        activeKey={goType}
        onChange={handleChangeGoType}
        size={'small'}
        items={TabItems}
      />
    </StyledProfileViewSvg>
  );
};
export default ProfileViewSvg;
