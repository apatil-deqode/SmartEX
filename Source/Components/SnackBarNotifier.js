import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Snackbar} from 'react-native-paper';
import {AppTheme, Styles} from '@themes';
import {Actions} from '@state';

const SnackBarNotifier = ({snackbarMessage, hideSnackbar}) => {
  return (
    <Snackbar
      visible={snackbarMessage}
      onDismiss={hideSnackbar}
      duration={3000}>
      <Text style={styles.snackbarText}>{snackbarMessage}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbarText: {...Styles.h6, color: AppTheme.colors.card},
});

const mapStateToProps = (state) => {
  return {
    stoppage_state: state.persisted.settings.stoppage_state,
    snackbarMessage: state.snackbar.message,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideSnackbar: () => dispatch({type: Actions.NOTIFY_CLOSE}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SnackBarNotifier);
