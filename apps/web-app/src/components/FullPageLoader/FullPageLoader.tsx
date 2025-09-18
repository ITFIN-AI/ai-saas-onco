import React, { FunctionComponent } from 'react';
import { Spin } from 'antd';

interface OwnProps {}

type Props = OwnProps;

const FullPageLoader: FunctionComponent<Props> = () => {
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
      <Spin size="large" />
    </div>
  );
};

export default FullPageLoader;
