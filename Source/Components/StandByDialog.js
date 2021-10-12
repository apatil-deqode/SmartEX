import {ServicePingError, DrawerItem} from '@components';
import {ScaledSheet} from '@helpers';
import Images from '@images';
import {Actions} from '@state';
import {Styles} from '@themes';
import React, {useRef, useState} from 'react';
import {withTranslation} from 'react-i18next';
import {Image, View} from 'react-native';
import {Dialog, Portal} from 'react-native-paper';
import {connect} from 'react-redux';
import SignalDrawerItem from '../Screens/SideBar/SignalDrawerItem';
import {ServiceStatusView} from '@components';

const StandByDialog = ({
  status,
  t,
  showSnackbar,
  hidePingError,
  pingErrorDialogVisible,
}) => {
  const [isPingErrorVisible, setIsPingErrorVisible] = useState(false);
  const {
    isMachineConnected = false,
    isSensingConnected = false,
    isCoreConnected = false,
    isMlConnected = false,
  } = status;

  if (
    isMachineConnected === true ||
    isSensingConnected === true ||
    isCoreConnected === false ||
    isMlConnected === false
  ) {
    return null;
  }

  if (pingErrorDialogVisible && isPingErrorVisible) {
    setIsPingErrorVisible(false);
  }

  return (
    <Portal>
      <Dialog visible style={styles.root} dismissable={false}>
        <View style={styles.mainContainer}>
          <Portal>
            <Dialog
              visible={isPingErrorVisible}
              style={styles.serviceStatusDialog}
              dismissable
              onDismiss={() => {
                hidePingError();
                setIsPingErrorVisible(false);
              }}>
              <ServiceStatusView status={status} t={t} />
            </Dialog>
          </Portal>
          <View style={styles.sideIconStyle}>
            <View style={styles.flexGrow}>
              <DrawerItem
                title={t('connection_info')}
                icon={Images.infoImage}
                style={styles.flex}
                onPress={() => {
                  hidePingError();
                  showSnackbar(t('update_po_error'));
                  setIsPingErrorVisible(true);
                }}
                numberOfLines={1}
              />
            </View>
            <View style={styles.flexGrow}>
              <SignalDrawerItem />
            </View>
          </View>
          <View style={styles.container}>
            <Image source={Images.logo} style={styles.image} />
          </View>
        </View>
      </Dialog>
    </Portal>
  );
};

const styles = ScaledSheet.create({
  root: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  serviceStatusDialog: {
    alignSelf: 'center',
    width: '50%',
  },
  sideIconStyle: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    maxWidth: 738,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '30@ls',
    paddingHorizontal: '50@ls',
  },
  title: {
    ...Styles.subtitle1,
    marginTop: '16@vs',
  },
  icon: {
    marginVertical: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  subtitle: {
    ...Styles.h5,
    marginTop: '8@ls',
    marginHorizontal: '30@ls',
  },
  table: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '30@ls',
    marginHorizontal: '30@ls',
  },
  core: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  titles: {
    justifyContent: 'space-around',
    marginStart: 16,
  },
  flexGrow: {
    height: 60,
    marginVertical: 10,
  },
});
const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    hidePingError: () => dispatch({type: Actions.HIDE_PING_ERROR_DIALOG}),
  };
};
const mapstateToProps = ({dialog}) => {
  return {
    status: dialog.connectionStatus,
    pingErrorDialogVisible: dialog.pingErrorDialogVisible,
  };
};

export default withTranslation()(
  connect(mapstateToProps, mapDispatchToProps)(StandByDialog),
);
