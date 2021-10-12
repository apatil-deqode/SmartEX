import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Portal, Dialog} from 'react-native-paper';
import {Styles} from '@themes';
import {ls} from '@helpers';
import {withTranslation} from 'react-i18next';
import {FormPicker, InputField, NegativeButton, Button} from '@components';
import Icon from '@icons';

const AddEditYarn = ({
  visible,
  onDismiss,
  values,
  errors,
  options,
  createYarn,
  createType,
  createColor,
  selectOption,
  t,
}) => {
  const isEdit = values.index !== undefined;
  return (
    <Portal>
      <Dialog
        dismissable={false}
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}>
        <Text style={Styles.subtitle1}>
          {isEdit ? t('edit_yarn') : t('add_new_yarn')}
        </Text>
        <View style={styles.topRow}>
          <FormPicker
            style={styles.startField}
            label={t('type')}
            showAbove={true}
            searchable={true}
            showError={errors.type}
            items={options.types}
            searchablePlaceholder={t('search_type')}
            defaultValue={values.type?.value}
            onChangeItem={(value) => selectOption('type', value)}
            onPressCreate={createType}
          />
          <FormPicker
            style={styles.endField}
            label={t('color')}
            showAbove={true}
            searchable={true}
            showError={errors.color}
            items={options.colors}
            searchablePlaceholder={t('search_color')}
            defaultValue={values.color?.value}
            onChangeItem={(value) => selectOption('color', value)}
            onPressCreate={createColor}
          />
        </View>
        <View style={styles.middleRow}>
          <InputField
            keyboardType="numeric"
            label={t('density')}
            value={values.density}
            style={styles.startField}
            error={errors.density}
            onChangeText={(value) => selectOption('density', value)}
          />
          <FormPicker
            style={styles.endField}
            label={t('units')}
            showError={errors.unit}
            items={options.units}
            defaultValue={values.unit?.value}
            onChangeItem={(value) => selectOption('unit', value)}
          />
        </View>
        <View style={styles.middleRow}>
          <InputField
            keyboardType="numeric"
            label={t('multiplier')}
            value={values.multiplier}
            style={styles.startField}
            error={errors.multiplier}
            onChangeText={(value) => selectOption('multiplier', value)}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <NegativeButton style={{marginEnd: ls(22)}} onPress={onDismiss}>
            {t('cancel')}
          </NegativeButton>
          <Button
            onPress={createYarn}
            icon={({size, color}) =>
              isEdit ? null : <Icon.Add color={color} size={size} />
            }>
            {isEdit ? t('save') : t('add')}
          </Button>
        </View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    width: '65%',
    alignSelf: 'center',
    padding: 25,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    paddingBottom: 2,
  },
  topRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  middleRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  startField: {
    width: '48%',
  },
  endField: {
    width: '48%',
    marginStart: 22,
  },
});

export default withTranslation()(AddEditYarn);
