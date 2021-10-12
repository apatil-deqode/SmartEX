import React, {useState, useEffect} from 'react';
import {Dialog, Portal} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import Orientation from 'react-native-orientation';

import {ConfirmationDialog} from '@components';
import {CoreServiceAPIService} from '@services';
import {Constants} from '@data';
import {logAnalytics, Events} from '@helpers';
import {useDispatch} from 'react-redux';
import {disableStoppageState} from 'State/Actions/AsyncActions';

const SwitchOffDialog = ({visible, onRequestClose, t}) => {
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

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onRequestClose}
        style={{alignSelf: 'center', width: portrait ? '85%' : '50%'}}>
        <ConfirmationDialog
          title={t('switch_off')}
          subtitle={t('switch_off_message')}
          onPressPositive={onDisableMachineStoppage}
          onPressNegative={onRequestClose}
        />
      </Dialog>
    </Portal>
  );
};

export default withTranslation()(SwitchOffDialog);
