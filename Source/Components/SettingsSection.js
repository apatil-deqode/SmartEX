import {AppTheme, Styles} from '@themes';
import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';

const textInputProps = {
  maxLength: 3,
  textAlign: 'center',
  keyboardType: 'number-pad',
};
const SettingsSection = ({
  roll,
  isfromRoll,
  heading,
  horDefectCountChangeText,
  vertDefectCountChangeText,
  punchDefectCountChangeText,
  oilDefectCountChangeText,
  horDefectLengthChangeText,
  vertDefectLengthChangeText,
  punchDefectLenghtChangeText,
  oilDefectLenghtChangeText,
  horDefectCount,
  vertDefectCount,
  punchDefectCount,
  oilDefectCount,
  horDefectLength,
  vertDefectLength,
  punchDefectLenght,
  oilDefectLenght,
  occurrences,
}) => {
  return (
    <View style={styles.mainContainer}>
      <Text style={Styles.subtitle3}> {heading} </Text>
      <View style={styles.innerRowContainer}>
        <TextInput
          {...textInputProps}
          style={styles.input}
          value={horDefectCount}
          onChangeText={
            (v) => horDefectCountChangeText(v)
            // this.onChange('horizontal', 'defectStopCount', v)
          }
        />

        {/* <Text style={styles.occrencessText}>{occurrences}</Text> */}
        {isfromRoll ? (
          <Text style={[styles.occrencessText, {width: 160}]}>
            {occurrences} {roll}
          </Text>
        ) : (
          // <Text style={styles.rollTextStyle}>{roll}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.occrencessText}>{occurrences}</Text>
            <TextInput
              {...textInputProps}
              style={styles.input}
              value={horDefectLength}
              onChangeText={(v) => horDefectLengthChangeText(v)}
            />
            <Text style={Styles.h6}>cm</Text>
          </View>
        )}
        {/*
        <Text style={Styles.h6}>cm</Text> */}
      </View>
      <View style={styles.innerRowContainer}>
        <TextInput
          {...textInputProps}
          style={styles.input}
          value={vertDefectCount}
          onChangeText={(v) => vertDefectCountChangeText(v)}
        />
        {/* <Text style={Styles.h6}>{t('occurrences')}</Text> */}
        {/* <Text style={styles.occrencessText}>{occurrences}</Text> */}
        {isfromRoll ? (
          <Text style={[styles.occrencessText, {width: 160}]}>
            {occurrences} {roll}
          </Text>
        ) : (
          // <Text style={styles.rollTextStyle}>{roll}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.occrencessText}>{occurrences}</Text>
            <TextInput
              {...textInputProps}
              style={styles.input}
              value={vertDefectLength}
              onChangeText={(v) => vertDefectLengthChangeText(v)}
            />
            <Text style={Styles.h6}>cm</Text>
          </View>
        )}
      </View>

      <View style={styles.innerRowContainer}>
        <TextInput
          {...textInputProps}
          style={styles.input}
          value={punchDefectCount}
          onChangeText={(v) => punchDefectCountChangeText(v)}
        />
        {/* <Text style={Styles.h6}>{t('occurrences')}</Text> */}
        {/* <Text style={styles.occrencessText}>{occurrences}</Text> */}
        {isfromRoll ? (
          <Text style={[styles.occrencessText, {width: 160}]}>
            {occurrences} {roll}
          </Text>
        ) : (
          // <Text style={styles.rollTextStyle}>{roll}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.occrencessText}>{occurrences}</Text>
            <TextInput
              {...textInputProps}
              style={styles.input}
              value={punchDefectLenght}
              onChangeText={(v) => punchDefectLenghtChangeText(v)}
            />
            <Text style={Styles.h6}>cm</Text>
          </View>
        )}
      </View>
      <View style={styles.innerRowContainer}>
        <TextInput
          {...textInputProps}
          style={styles.input}
          value={oilDefectCount}
          onChangeText={(v) => oilDefectCountChangeText(v)}
        />
        {/* <Text style={Styles.h6}>{t('occurrences')}</Text> */}
        {/* <Text style={styles.occrencessText}>{occurrences}</Text> */}
        {isfromRoll ? (
          <Text style={[styles.occrencessText, {width: 160}]}>
            {occurrences} {roll}
          </Text>
        ) : (
          // <Text style={styles.rollTextStyle}>{roll}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.occrencessText}>{occurrences}</Text>
            <TextInput
              {...textInputProps}
              style={styles.input}
              value={oilDefectLenght}
              onChangeText={(v) => oilDefectLenghtChangeText(v)}
            />
            <Text style={Styles.h6}>cm</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  h1: {
    ...Styles.h3,
    color: AppTheme.colors.accent,
  },
  subtitle: {
    ...Styles.h4,
    marginTop: 60,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 100,
    paddingBottom: 2,
  },
  mainContainer: {
    marginTop: 10,
    alignItems: 'center',
    // backgroundColor: 'darkslategrey',
    borderRadius: 8,
    margin: 3,
    // borderWidth: 2,
    backgroundColor: AppTheme.colors.darkGray,
    elevation: 5,
    overflow: 'hidden',
  },
  innerRowContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
  },
  input: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    marginEnd: 8,
    width: 70,
  },
  rollTextStyle: {
    ...Styles.h6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    color: 'white',
  },
  occrencessText: {
    ...Styles.h6,
    width: 100,
  },
});

export default SettingsSection;
