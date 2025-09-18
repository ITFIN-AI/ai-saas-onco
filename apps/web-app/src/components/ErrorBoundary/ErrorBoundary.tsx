import React, { Component, ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { Modal, Alert, Button } from 'antd';
import { WithTranslation, withTranslation } from 'react-i18next';

type State = {
  eventId: null | string;
  hasError: boolean;
  visible: boolean;
};

class ErrorBoundary extends Component<WithTranslation, State> {
  state = {
    eventId: null,
    hasError: false,
    visible: true,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ errorInfo });
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  refreshPage() {
    window.location.reload();
  }

  render() {
    const { t } = this.props;
    const { hasError, eventId, visible } = this.state;
    if (hasError) {
      return (
        <Modal
          centered
          open={visible}
          closable={false}
          footer={[
            <Button key="back" onClick={this.refreshPage}>
              {t<string>('button.refreshPage')}
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                this.setState({
                  visible: false,
                });
                Sentry.showReportDialog({ eventId: eventId || '' });
              }}
            >
              {t<string>('button.sendFeedback')}
            </Button>,
          ]}
        >
          <div>
            <Alert
              message={t<string>('appError')}
              description={t<string>('appErrorDescription')}
              type="error"
              showIcon
            />
          </div>
        </Modal>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default withTranslation('common')(ErrorBoundary);
