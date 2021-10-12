import {ScaledSheet} from '@helpers';
import React from 'react';
import {withTranslation} from 'react-i18next';
import {Dialog, Portal} from 'react-native-paper';
import {connect} from 'react-redux';
import {ServiceStatusView} from '@components';
import {Actions} from '@state';

const ServicePingError = ({status, t, visible, hidePingError}) => {
  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Dialog
        visible
        style={styles.root}
        dismissable={true}
        onDismiss={hidePingError}>
        <ServiceStatusView status={status} t={t} />
      </Dialog>
    </Portal>
  );
};

const styles = ScaledSheet.create({
  root: {
    alignSelf: 'center',
    width: '50%',
  },
});

const mapstateToProps = (state) => {
  return {
    status: state.dialog.connectionStatus,
    visible: state.dialog.serviceDialogVisibility.isVisible,
  };
};
const mapDispatchToProps = (dispatch) => {
  const isVisible = {isVisible: false};
  return {
    hidePingError: () =>
      dispatch({
        type: Actions.SHOW_HIDE_SERVICES_DILOAG,
        payload: isVisible,
      }),
  };
};

export default withTranslation()(
  connect(mapstateToProps, mapDispatchToProps)(ServicePingError),
);
