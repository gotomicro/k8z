import styles from '@/pages/Tools/PodProxy/styles/response.less';
import classNames from 'classnames';
import React from 'react';

export enum RequestTypes {
  // Params = 'Params',
  // Authorization = 'Authorization',
  Headers = 'Headers',
  Body = 'Body',
}

export interface RequestTypeProps {
  value?: RequestTypes;
  onChange?: (value: RequestTypes) => void;
}
const RequestType: React.FC<RequestTypeProps> = ({ value, onChange }) => {
  return (
    <div className={styles.requestType}>
      {Object.keys(RequestTypes).map((item) => {
        return (
          <span
            className={classNames(
              styles.typeButton,
              value === RequestTypes[item] && styles.typeButtonActive,
            )}
            key={RequestTypes[item]}
            onClick={() => onChange?.(RequestTypes[item])}
          >
            {RequestTypes[item]}
          </span>
        );
      })}
    </div>
  );
};
export default RequestType;
