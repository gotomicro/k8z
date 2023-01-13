import React, { useMemo } from 'react';
import styles from '@/pages/Tools/PodProxy/styles/response.less';
import classNames from 'classnames';
// import { Divider } from 'antd';
import type { ProxyResultParams } from '@/services/podProxy';

export enum ResponseTypes {
  Body = 'Body',
  Headers = 'Headers',
  // Cookies = 'Cookies',
}

export interface ResponseTypeProps {
  value?: ResponseTypes;
  response: Pick<ProxyResultParams, 'status' | 'statusCode' | 'duration' | 'contentLength'>;
  onChange?: (value: ResponseTypes) => void;
}
const ResponseType: React.FC<ResponseTypeProps> = ({
  value = ResponseTypes.Body,
  response,
  onChange,
}) => {
  const ResponseInfo = useMemo(() => {
    const { status, statusCode, duration, contentLength } = response;
    const statusClass =
      statusCode >= 200 && statusCode < 300 ? styles.infoContextOK : styles.infoContextERROR;
    return (
      <div className={styles.info}>
        <div>
          <span className={styles.infoTitle}>Status&#58;&nbsp;</span>
          <span className={classNames(statusClass)}>
            {statusCode}&nbsp;{status}
          </span>
        </div>
        <div>
          <span className={styles.infoTitle}>Time&#58;&nbsp;</span>
          <span className={classNames(statusClass)}>{duration}&nbsp;ms</span>
        </div>
        <div>
          <span className={styles.infoTitle}>Size&#58;&nbsp;</span>
          <span className={classNames(statusClass)}>{contentLength}&nbsp;B</span>
        </div>
      </div>
    );
  }, [response]);
  return (
    <div className={styles.responseType}>
      <div>
        {Object.keys(ResponseTypes).map((item) => {
          return (
            <span
              className={classNames(
                styles.typeButton,
                value === ResponseTypes[item] && styles.typeButtonActive,
              )}
              key={ResponseTypes[item]}
              onClick={() => onChange?.(ResponseTypes[item])}
            >
              {ResponseTypes[item]}
            </span>
          );
        })}
      </div>
      <div className={styles.infoAndOptions}>{ResponseInfo}</div>
    </div>
  );
};
export default ResponseType;
