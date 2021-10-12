import React, {Component} from 'react';
import {Actions} from '@state';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {DrawerItem, Divider, CopilotView} from '@components';
import SwitchOffButton from './SwitchOffButton';
import Images from '@images';
import {AppTheme} from '@themes';
import {walkthroughable, CopilotStep} from 'react-native-copilot-fullscreen';
import {SwitchOffDialog, InfoDialog} from 'Screens';
import SignalDrawerItem from './SignalDrawerItem';
import RpmDrawerItem from './RpmDrawerItem';

const CopilotTouchableOpacity = walkthroughable(TouchableOpacity);

class SideBar extends Component {
  state = {
    switchOffDialogVisible: false,
    InfoDialogVisible: false,
  };

  displayStatusDialog = () => {
    const isVisible = {
      isVisible: !this.props.serviceDialogVisibility.isVisible,
    };
    this.props.showHideServicePingDialog(isVisible);
    // if (!this.props.available) {
    //   this.props.showPingError();
    // }
  };

  render() {
    const {t} = this.props;
    return (
      <View style={styles.container}>
        <CopilotStep
          key={t('step_smartex_logo')}
          text={t('step_smartex_logo')}
          order={1}
          name="step_smartex_logo">
          <CopilotTouchableOpacity
            onPress={() => this.props.navigation.navigate('home')}>
            <Image source={Images.icon} />
          </CopilotTouchableOpacity>
        </CopilotStep>
        <View style={{flexGrow: 1, marginTop: 4}}>
          <CopilotStep
            key={t('step_available')}
            text={t('step_available')}
            order={2}
            name="step_available">
            <DrawerItem
              style={styles.flex}
              title={this.props.available ? t('available') : t('unavailable')}
              icon={this.props.available ? Images.tick : Images.unavailable}
              isDisabled={this.props.available}
              onPress={this.displayStatusDialog}
            />
          </CopilotStep>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.flexGrow}>
          <CopilotStep
            key={t('step_signal')}
            text={t('step_signal')}
            order={3}
            name="step_signal">
            <CopilotView style={styles.flex}>
              <SignalDrawerItem />
            </CopilotView>
          </CopilotStep>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.flexGrow}>
          <CopilotStep
            key={t('step_rpm')}
            text={t('step_rpm')}
            order={4}
            name="step_rpm">
            <CopilotView style={styles.flex}>
              <RpmDrawerItem />
            </CopilotView>
          </CopilotStep>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.flexGrow}>
          <CopilotStep
            key={t('step_settings')}
            text={t('step_settings')}
            order={5}
            name="step_settings">
            <DrawerItem
              title={t('settings')}
              icon={Images.settings}
              style={styles.flex}
              onPress={() => this.props.navigation.navigate('Settings')}
              numberOfLines={1}
            />
          </CopilotStep>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.flexGrow}>
          <CopilotStep
            key={t('step_help')}
            text={t('step_help')}
            order={6}
            name="step_help">
            <DrawerItem
              title={t('help')}
              icon={Images.info}
              style={styles.flex}
              onPress={this.showInfoDialog}
            />
          </CopilotStep>
        </View>
        <View style={styles.switchOffBtn}>
          <CopilotStep
            key={t('step_switch_off')}
            text={t('step_switch_off')}
            order={7}
            name="step_switch_off">
            <SwitchOffButton
              style={styles.flex}
              onPress={() =>
                this.props.setDisableHomeAction(!this.props.isDisableHomeAction)
              }
            />
          </CopilotStep>
        </View>
        <SwitchOffDialog
          visible={this.state.switchOffDialogVisible}
          onRequestClose={this.hideSwitchOffDialog}
        />
        <InfoDialog
          visible={this.state.infoDialogVisible}
          onRequestClose={this.hideInfoDialog}
        />
      </View>
    );
  }

  showSwitchOffDialog = () => this.setState({switchOffDialogVisible: true});
  hideSwitchOffDialog = () => this.setState({switchOffDialogVisible: false});

  showInfoDialog = () => this.setState({infoDialogVisible: true});
  hideInfoDialog = () => this.setState({infoDialogVisible: false});
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: AppTheme.colors.card,
    borderTopEndRadius: 15,
    borderBottomEndRadius: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  divider: {
    marginHorizontal: 8,
  },
  switchOffBtn: {
    flexGrow: 1,
    marginVertical: 1,
    marginHorizontal: 4,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});

const mapStateToProps = ({dialog, home: {isDisableHomeAction}}) => {
  return {
    available: dialog.connectionStatus.isAvailable,
    serviceDialogVisibility: dialog.serviceDialogVisibility,
    isDisableHomeAction: isDisableHomeAction,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showPingError: () => dispatch({type: Actions.SHOW_PING_ERROR_DIALOG}),
    showHideServicePingDialog: (isVisible) =>
      dispatch({
        type: Actions.SHOW_HIDE_SERVICES_DILOAG,
        payload: isVisible,
      }),
    setDisableHomeAction: (isVisible) =>
      dispatch({type: Actions.DISABLE_HOME_ACTION, data: isVisible}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SideBar),
);
