import {
  Loader,
  ServicePingError,
  SessionTimoutDialog,
  SnackbarNotifier,
  StandByDialog,
} from '@components';
import DefectErrorDialog from '@screens/DefectErrorDialog';
import React from 'react';
import {connect} from 'react-redux';
import AuthStackNavigator from './AuthStackNavigator';
import MainStackNavigator from './MainStackNavigator';

const AppContainer = ({isLoggedIn}) => {
  return (
    <>
      {isLoggedIn ? <MainStackNavigator /> : <AuthStackNavigator />}
      <SnackbarNotifier />
      <Loader />
      <DefectErrorDialog />
      <ServicePingError />
      <SessionTimoutDialog />
      <StandByDialog />
    </>
  );
};

const mapStateToProps = ({auth}) => {
  return {
    isLoggedIn: auth.isLoggedIn,
  };
};

export default connect(mapStateToProps)(AppContainer);
