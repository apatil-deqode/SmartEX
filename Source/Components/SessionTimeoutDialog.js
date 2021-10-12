import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Portal, Dialog} from 'react-native-paper';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {AppTheme, Styles} from '@themes';
import {Actions} from '@state';
import Button from './Button';

const SessionTimeoutDialog = ({visible, onRequestClose, t}) => {
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        {visible ? (
          <View style={styles.container}>
            <Text style={styles.h1}>{t('session_expired')}</Text>
            <Text style={styles.subtitle}>
              {t('session_expired_desciption')}
            </Text>
            <Button style={styles.button} onPress={onRequestClose}>
              {t('login')}
            </Button>
          </View>
        ) : null}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    alignSelf: 'center',
    width: '50%',
  },
  h1: {
    ...Styles.h3,
    color: AppTheme.colors.accent,
  },
  subtitle: {
    ...Styles.h4,
    marginTop: 60,
    textAlign: 'center',
  },
  button: {
    marginTop: 60,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
});

const mapStateToProps = (state) => ({
  visible: state.dialog.sessionExpiredVisible,
});

const mapDispatchToProps = (dispatch) => ({
  onRequestClose: () => dispatch({type: Actions.HIDE_SESSION_TIMEOUT}),
});

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SessionTimeoutDialog),
);
