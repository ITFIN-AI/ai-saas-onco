import React, { FunctionComponent } from 'react';
import { Alert } from 'antd';

type Props = typeof Alert.defaultProps;

const FullPageAlert: FunctionComponent<Props> = (props = {}) => {
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Alert
        style={{
          width: '100%',
          maxWidth: 500,
          padding: 20,
          marginBottom: 24,
          ...props.style,
        }}
        {...props}
      />
    </div>
  );
};

export default FullPageAlert;
