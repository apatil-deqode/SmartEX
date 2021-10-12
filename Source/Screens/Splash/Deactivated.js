import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CodePush from 'react-native-code-push';
import {withTranslation} from 'react-i18next';
import {Button} from 'react-native-paper';

function Deactivated({t, navigation}) {
  return (
    <View style={styles.global}>
      <Text style={styles.title}>{t('user_inactive')}</Text>
      <Button
        contentStyle={styles.button}
        labelStyle={styles.buttonText}
        mode="contained"
        onPress={() => CodePush.restartApp()}>
        {t('retry')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  global: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    padding: 50,
  },
  button: {
    // height: 50,
    // width: 100,
    padding: 10,
  },
  buttonText: {
    fontSize: 20,
  },
});

export default withTranslation()(Deactivated);
