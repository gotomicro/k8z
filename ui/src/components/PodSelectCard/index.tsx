import {
  StyledPodSelectCardPods,
  StyledPodSelectCardSelect,
} from '@/components/PodSelectCard/styles/index.styled';
import { Select, Tag } from 'antd';
import { useModel } from '@umijs/max';
import ContentCard from '@/components/ContentCard';
import { usePodSelect } from '@/hooks/usePodSelect';
import { useMemo } from 'react';
import { useLocation } from 'umi';

export const SHOW_ALL_POD_PATHNAME_ARR = ['/debug'];
export const SHOW_CONFIGMAP_PATHNAME_ARR = ['/config-map'];

export const HIDE_POD_OR_CONFIGMAP_SELECT_ARR = ['/nodes'];

const PodSelectCard = () => {
  const currentLocation = useLocation();
  const isShowAllPod = useMemo(
    () => SHOW_ALL_POD_PATHNAME_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );
  const isConfigMap = useMemo(
    () => SHOW_CONFIGMAP_PATHNAME_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );

  const isHidePodOrConfigmap = useMemo(
    () => HIDE_POD_OR_CONFIGMAP_SELECT_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );

  const {
    cluster,
    namespace,
    handleUpdateCluster,
    handleClearCluster,
    handleUpdateNamespace,
    handleClearNamespace,
    handleClearCurrentPod,
    handleUpdateCurrentPod,
    handleUpdateCurrentConfigmap,
    handleClearCurrentConfigmap,
  } = useModel('pod', (model) => ({
    cluster: model.cluster,
    namespace: model.namespace,
    handleUpdateCluster: model.handleUpdateCluster,
    handleClearCluster: model.handleClearCluster,
    handleUpdateNamespace: model.handleUpdateNamespace,
    handleClearNamespace: model.handleClearNamespace,
    handleUpdateCurrentPod: model.handleUpdateCurrentPod,
    handleClearCurrentPod: model.handleClearCurrentPod,
    handleUpdateCurrentConfigmap: model.handleUpdateCurrentConfigmap,
    handleClearCurrentConfigmap: model.handleClearCurrentConfigmap,
  }));

  const {
    clusterList,
    openCluster,
    loadingCluster,
    handleChangeCluster,
    handleSelectCluster,
    handleMouseDownCluster,
    handleBlurCluster,

    namespaceList,
    openNamespace,
    loadingNamespace,
    handleChangeNamespace,
    handleSelectNamespace,
    handleMouseDownNamespace,
    handleBlurNamespace,

    detail,
    detailList,
    openDetail,
    loadingDetail,
    handleSelectDetail,
    handleClearDetail,
    handleMouseDownDetail,
    handleBlurDetail,

    handlePopupContainer,
  } = usePodSelect({
    cluster,
    namespace,
    handleUpdateCluster,
    handleClearCurrentPod,
    handleUpdateCurrentPod,
    handleUpdateNamespace,
    handleClearNamespace,
    handleUpdateCurrentConfigmap,
    handleClearCurrentConfigmap,
  });

  const detailOptions = useMemo(() => {
    return detailList.map((item) => ({
      ...item,
      label: item?.ready ? (
        <span>
          {isShowAllPod && !isConfigMap && <Tag color="#52b69a">Ready</Tag>}
          {item.name}
        </span>
      ) : (
        <span>
          {isShowAllPod && !isConfigMap && <Tag color="#d1495b">{item.reason}</Tag>}
          {item.name}
        </span>
      ),
    }));
  }, [detailList, isConfigMap, isShowAllPod]);

  return (
    <ContentCard title="Pod" height={isHidePodOrConfigmap ? '78px' : '124px'}>
      <div id={'pod'}>
        <StyledPodSelectCardSelect>
          <Select
            showSearch
            allowClear
            value={cluster}
            style={{ flex: 1 }}
            options={clusterList}
            open={openCluster}
            loading={loadingCluster}
            placeholder={'请选择集群'}
            onChange={handleChangeCluster}
            getPopupContainer={handlePopupContainer}
            fieldNames={{ label: 'name', value: 'name' }}
            onSelect={handleSelectCluster}
            onClear={handleClearCluster}
            onMouseDown={handleMouseDownCluster}
            onBlur={handleBlurCluster}
          />
          <Select
            showSearch
            allowClear
            value={namespace}
            disabled={!cluster}
            open={openNamespace}
            options={namespaceList}
            loading={loadingNamespace}
            onClear={handleClearNamespace}
            placeholder={'请选择 Namespace'}
            onChange={handleChangeNamespace}
            onSelect={handleSelectNamespace}
            getPopupContainer={handlePopupContainer}
            fieldNames={{ label: 'name', value: 'name' }}
            style={{ flex: 1 }}
            onMouseDown={handleMouseDownNamespace}
            onBlur={handleBlurNamespace}
          />
        </StyledPodSelectCardSelect>
        {!isHidePodOrConfigmap && (
          <StyledPodSelectCardPods>
            <Select
              showSearch
              allowClear
              disabled={!cluster || !namespace}
              value={detail}
              open={openDetail}
              loading={loadingDetail}
              placeholder={`请选择 ${isConfigMap ? 'Configmap' : 'Pod'}`}
              getPopupContainer={handlePopupContainer}
              fieldNames={{ value: 'name' }}
              options={detailOptions}
              onClear={handleClearDetail}
              onSelect={handleSelectDetail}
              onMouseDown={handleMouseDownDetail}
              onBlur={handleBlurDetail}
              style={{
                flex: 1,
              }}
            />
          </StyledPodSelectCardPods>
        )}
      </div>
    </ContentCard>
  );
};
export default PodSelectCard;
