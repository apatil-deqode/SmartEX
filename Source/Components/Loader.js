import React from 'react';
import {Modal, View, ActivityIndicator, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {AppTheme} from '@themes';
import {Actions} from '@state';

const Loader = ({visible, hideProgressBar}) => {
  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={hideProgressBar}>
      <View style={styles.container}>
        <ActivityIndicator size={60} color={AppTheme.colors.accent} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.backdrop,
  },
});

const mapstateToProps = (state) => {
  return {
    visible: state.dialog.loaderVisible,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideProgressBar: () => dispatch({type: Actions.HIDE_PROGRESS_BAR}),
  };
};

export default connect(mapstateToProps, mapDispatchToProps)(Loader);
