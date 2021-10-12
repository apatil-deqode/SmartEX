import React, {useState, useEffect} from 'react';
import {Dialog, Portal} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import Orientation from 'react-native-orientation';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {Styles} from '@themes';
import {ConfirmationDialog} from '@components';
import {CoreServiceAPIService} from '@services';
import {Constants} from '@data';
import {logAnalytics, Events} from '@helpers';
import {useDispatch} from 'react-redux';
import {disableStoppageState} from 'State/Actions/AsyncActions';
import Icon from '@icons';
import {ls} from '@helpers';

const InfoDialog = ({visible, onRequestClose, t}) => {
  const [portrait, setPortrait] = useState(
    Orientation.getInitialOrientation() === Constants.PORTRAIT,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const updateOrientation = (orientation) => {
      setPortrait(Constants.PORTRAIT === orientation);
    };

    Orientation.addOrientationListener(updateOrientation);
    return () => {
      Orientation.removeOrientationListener(updateOrientation);
    };
  }, []);

  async function onDisableMachineStoppage() {
    logAnalytics(Events.DISABLE_MACHINE, 'disabling machine');
    // TODO: Extract to own function
    const coreServiceAPIService = new CoreServiceAPIService();
    dispatch(disableStoppageState);
    onRequestClose();
  }

  const dialogRender = () => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>INFO DETAILS</Text>
          <Pressable
            onPress={() => {
              onRequestClose();
            }}>
            <Icon.Cross width={ls(35)} height={ls(35)} />
          </Pressable>
        </View>
        <View style={styles.contain}>
          <Text style={styles.messageText}>FOR SUPPORT PLEASE CONTACT</Text>
          <Text style={styles.emailText}>support@smartex.ai</Text>
        </View>
      </View>
    );
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onRequestClose}
        style={{alignSelf: 'center', width: portrait ? '85%' : '50%'}}>
        {dialogRender()}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#717EF1',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 8,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    width: '95%',
    marginTop: 30,
    marginBottom: '30%',
    alignItems: 'center',
  },
  contain: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: '30%',
    borderRadius: 8,
  },
  headerText: {
    ...Styles.h5,
    width: '90%',
    textAlign: 'center',
  },
  messageText: {
    ...Styles.subtitle4,
    width: '90%',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  emailText: {
    ...Styles.body2,
    width: '90%',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default withTranslation()(InfoDialog);
