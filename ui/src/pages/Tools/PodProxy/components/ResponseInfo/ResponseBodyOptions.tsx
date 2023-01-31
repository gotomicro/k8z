import { ReactComponent as TextNotWrapSVG } from '@/assets/icon/text-not-wrap.svg';
import { ReactComponent as TextWrapSVG } from '@/assets/icon/text-wrap.svg';
import { PrettyTypes, PrettyTypesMapping } from '@/enums/pretty';
import styles from '@/pages/Tools/PodProxy/styles/response.less';
import { CopyOutlined, FormatPainterOutlined, SearchOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, Radio, Select } from 'antd';
import React, { useMemo } from 'react';

export enum BodyRadios {
  pretty = 'pretty',
  raw = 'raw',
  preview = 'preview',
}

export enum ContentTypes {
  html = 'text/html',
  xml = 'application/xml',
  xhtml = 'application/xhtml+xml',
  atomXml = 'application/atom+xml',
  json = 'application/json',
}

export type WrapTypes = 'on' | 'off';

export const BodyRadiosMapping: { [k in keyof typeof BodyRadios]: string } = {
  [BodyRadios.pretty]: 'Pretty',
  [BodyRadios.raw]: 'Raw',
  [BodyRadios.preview]: 'Preview',
};

interface ResponseBodyTypeProps {
  bodyType?: BodyRadios;
  wordWrap?: WrapTypes;
  prettyType?: PrettyTypes;
  onChangeBodyType?: (event: RadioChangeEvent) => void;
  onChangePrettyType?: (type: PrettyTypes) => void;
  onClickSearch?: () => void;
  onCopyResult?: () => void;
  onFormatDocument?: () => void;
  onChangeWordWrapType?: (wrapType: WrapTypes) => void;
}

const ResponseBodyOptions: React.FC<ResponseBodyTypeProps> = ({
  bodyType = BodyRadios.preview,
  prettyType = PrettyTypes.json,
  wordWrap = 'on',
  onChangeBodyType,
  onChangePrettyType,
  onClickSearch,
  onCopyResult,
  onFormatDocument,
  onChangeWordWrapType,
}) => {
  const PrettySelectOptions = useMemo(
    () =>
      Object.keys(PrettyTypesMapping).map((type) => ({
        label: PrettyTypesMapping[type],
        value: PrettyTypes[type],
      })),
    [],
  );

  const showRightOptions = bodyType === BodyRadios.pretty || bodyType === BodyRadios.raw;

  const showFormatButton =
    bodyType === BodyRadios.pretty &&
    (prettyType === PrettyTypes.json || prettyType === PrettyTypes.html);

  const showWrapButton = bodyType === BodyRadios.pretty;

  const isWordWrap = wordWrap === 'on';

  const WrapSvg = isWordWrap ? TextWrapSVG : TextNotWrapSVG;

  return (
    <>
      <div className={styles.left} id="bodyPretty">
        <Radio.Group value={bodyType} onChange={onChangeBodyType} size={'small'}>
          {Object.keys(BodyRadiosMapping).map((type) => (
            <Radio.Button key={type} className={styles.bodyRadioButton} value={BodyRadios[type]}>
              {BodyRadiosMapping[type]}
            </Radio.Button>
          ))}
        </Radio.Group>
        {bodyType === BodyRadios.pretty && (
          <Select
            size={'small'}
            style={{ width: 80 }}
            options={PrettySelectOptions}
            value={prettyType}
            onSelect={onChangePrettyType}
            getPopupContainer={() => document.getElementById('bodyPretty')!}
          />
        )}
        {showWrapButton && (
          <Radio.Group size={'small'} buttonStyle="solid" value={wordWrap}>
            <Radio.Button
              value={'on'}
              className={styles.bodyWrapButton}
              onClick={() => onChangeWordWrapType?.(isWordWrap ? 'off' : 'on')}
            >
              <WrapSvg />
            </Radio.Button>
          </Radio.Group>
        )}
      </div>
      {showRightOptions && (
        <div className={styles.right}>
          {showFormatButton && (
            <Button size={'small'} onClick={onFormatDocument} icon={<FormatPainterOutlined />} />
          )}
          <Button size={'small'} onClick={onCopyResult} icon={<CopyOutlined />} />
          <Button
            size={'small'}
            type={'primary'}
            onClick={onClickSearch}
            icon={<SearchOutlined />}
          />
        </div>
      )}
    </>
  );
};

export default ResponseBodyOptions;
