import {
  Button,
  ConfirmationDialog,
  NegativeButton,
  SettingsSection,
  SwitchSection,
  DropDownPicker,
} from '@components';
import {getLanguageOptions} from '@data';
import Fonts from '@fonts';
import {
  CopilotManager,
  Events,
  Introductions,
  logAnalytics,
  ls,
  ScaledSheet,
  downloadAPK,
  isAuthorisationNeededToChangeSettings,
  logger,
} from '@helpers';
import {ChangePassword} from '@screens';
import Config from 'react-native-config';
import {CoreServiceAPIService, SmartexService} from '@services';
import {Actions, Stores} from '@state';
import {AppTheme, CopilotStyle, Styles} from '@themes';
import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import Switch from 'react-native-switch-pro';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  copilot,
  CopilotStep,
  walkthroughable,
} from 'react-native-copilot-fullscreen';
import {Dialog, Portal} from 'react-native-paper';
import {connect} from 'react-redux';
import SettingsAuthDialog from './SettingsAuthDialog';
import {updateSetting} from 'Helpers/CheckDefect';
const height = Dimensions.get('screen').height;
import {getInitialSettings} from 'State/Reducers/PersistedReducer';
import {BlueButtonGradient} from '@components';

const CopilotView = walkthroughable(View);
const textInputProps = {
  maxLength: 3,
  textAlign: 'center',
  keyboardType: 'number-pad',
};

const textInputThresholdProps = {
  maxLength: 4,
  textAlign: 'center',
  keyboardType: 'number-pad',
};

class Settings extends Component {
  constructor(props) {
    super();
    this.inputRef = React.createRef();
    let settings = JSON.parse(JSON.stringify(props.settings));
    let mlModelsJson = JSON.parse(
      JSON.stringify(props.mlModelList !== undefined ? props.mlModelList : []),
    );
    const mlModels = mlModelsJson.map(({name, id}) => {
      return {
        value: id,
        label: name,
      };
    });

    this.initialState = {
      isOpenDropDwon: false,
      settings: getInitialSettings(),
      isThresholdValid: true,
      visible: false,
      mlModelList: mlModels,
      isPressDbCollectionMode: false, // Boolean that tells if the db_collection_mode Switch is pressed
    };

    this.state = {
      settings: settings,
      isThresholdValid: true,
      visible: false,
      mlModelList: mlModels,
      isPressDbCollectionMode: false,
    };
  }
  componentDidMount() {
    this.props.setIsFromSetting(true);
  }
  componentDidUpdate(previous) {
    if (previous.settings !== this.props.settings) {
      this.setState({settings: this.props.settings});
    }
  }
  DBColletionSwitchChange = (value) => {
    this.setState({
      isPressDbCollectionMode: true,
    });
  };
  updateAIMode = (selected) => {
    this.updateSettingsOnState('selected_model', selected.value);
  };
  onResetValue = () => {
    this.setState(this.initialState);
  };

  isTimeGreaterOneMin = () => {
    const timeStamp = Stores.getState().persisted.timestamp;
    const isTimeCheck = isAuthorisationNeededToChangeSettings(timeStamp);
    if (isTimeCheck === true) {
      const {isSensitivityThresholdLock} = Stores.getState().persisted.settings;
      return isSensitivityThresholdLock;
    }
    return false;
  };

  showIfIntroductionNeeded = async (forced) => {
    if (forced || (await CopilotManager.isNeeded(Introductions.SETTINGS))) {
      this.props.copilotEvents.on('stop', () =>
        CopilotManager.setCompleted(Introductions.SETTINGS),
      );
      this.props.start();
    }
  };

  changeLanguage = (lang) => {
    console.log('>>>>>>', lang);
    logAnalytics(Events.CHANGE_LANGUAGE, `language changed to ${lang}`);

    this.updateSettingsOnState('selectedLanguage', lang);
  };

  onChange = (type, key, value) => {
    const update = {...this.state.settings};
    if (value.length === 0) {
      update[type][key] = '';
    } else {
      if (value.charAt(value.length - 1) === '.') {
        var countDot = 0;
        for (var x = 0, length = value.length; x < length; x++) {
          var l = value.charAt(x);
          if (l === '.') {
            countDot = countDot + 1;
          }
        }
        if (countDot > 1) {
          return;
        }
        update[type][key] = value;
      } else {
        if (
          value.charAt(value.length - 2) === '.' &&
          value.charAt(value.length - 1) === '0'
        ) {
          update[type][key] = value;
        } else {
          update[type][key] = parseFloat(value, 0);
        }
      }
    }
    this.setState({settings: update});
  };

  onchangecmPerRotation = (number, isExit) => {
    if (!isExit) {
      this.updateSettingsOnState('cmPerRotation', number);
      // this.setState({cmPerRotation: number});
      return;
    }
    const value = parseFloat(number, 0) || 0.0;
    this.inputRef.current.setNativeProps({
      text: value.toString(),
    });
    // this.setState({cmPerRotation: value});
    this.updateSettingsOnState('cmPerRotation', value);
  };

  onchangeignoreDefectRotationCount = (number) => {
    if (number.length === 0) {
      // this.setState({ignoreDefectRotationCount: ''});
      this.updateSettingsOnState('ignoreDefectRotationCount', '');
    } else {
      // this.setState({ignoreDefectRotationCount: parseFloat(number, 0)});
      this.updateSettingsOnState(
        'ignoreDefectRotationCount',
        parseFloat(number, 0),
      );
    }
  };

  occurrencesPerCmValidation = () => {
    const {t, showSnackbar} = this.props;
    var horizontalMaxLength =
      this.state.settings.horizontal.defectStopCount * 20;
    var verticalMaxLength = this.state.settings.vertical.defectStopCount * 20;
    var punctualMaxLength = this.state.settings.punctual.defectStopCount * 20;
    var oilMaxLength = this.state.settings.oil.defectStopCount * 20;

    if (
      this.state.settings.horizontal.defectStopLength < horizontalMaxLength ||
      this.state.settings.vertical.defectStopLength < verticalMaxLength ||
      this.state.settings.punctual.defectStopLength < punctualMaxLength ||
      this.state.settings.oil.defectStopLength < oilMaxLength
    ) {
      showSnackbar(t('stop_if_validation'));
      return false;
    } else {
      return true;
    }
  };

  updateSettingsOnState = (settingKey, settingValue) => {
    this.setState((prevState) => ({
      settings: {
        ...prevState.settings,
        [settingKey]: settingValue, // Dinamically set the object key
      },
    }));
  };

  render() {
    const {t, settingsUnlockPassword} = this.props;
    return (
      <ScrollView>
        <View style={styles.container}>
          <View
            // elevation={AppTheme.elevation}
            style={{padding: 20}}>
            {/* <FAB
              small
              icon="help"
              style={styles.fab}
              onPress={this.showIfIntroductionNeeded.bind(this, true)}
            /> */}
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={[Styles.subtitle1, {marginTop: 1}]}>
                {t('settings')}
              </Text>
              <DropDownPicker
                items={getLanguageOptions(t)}
                arrowSize={ls(38)}
                arrowColor="white"
                dropDownMaxHeight={ls(270)}
                defaultValue={this.state.settings.selectedLanguage}
                onChangeItem={(selected) => {
                  logAnalytics(
                    Events.CHANGE_LANGUAGE,
                    `language changed to ${selected.value}`,
                  );
                  this.setState({selectedLanguage: selected.value});
                }}
                placeholderStyle={styles.placeHolder}
                dropDownStyle={styles.dropDown}
                itemStyle={styles.dropDownItem}
                labelStyle={styles.dropDownLabel}
                containerStyle={styles.dropDownContainer}
                style={styles.dropDownField}
              />
            </View>
            <View style={styles.switchSection}>
              <SwitchSection
                heading={t('defect_stop')}
                vertical={t('vertical')}
                horizontal={t('horizontal')}
                punctual={t('punctual')}
                oil={t('oil')}
                horizontalSwitchValue={
                  this.state.settings.horizontalSwitchValue
                }
                verticalSwitchValue={this.state.settings.verticalSwitchValue}
                punctualSwitchValue={this.state.settings.punctualSwitchValue}
                oilSwitchValue={this.state.settings.oilSwitchValue}
                onHorSwitchChange={(v) =>
                  this.onSwitchStateChange('horizontalSwitchValue', v)
                }
                onVertSwitchChange={(v) =>
                  this.onSwitchStateChange('verticalSwitchValue', v)
                }
                punctualSwitchChange={(v) =>
                  this.onSwitchStateChange('punctualSwitchValue', v)
                }
                oilSwitchChange={(v) =>
                  this.onSwitchStateChange('oilSwitchValue', v)
                }
              />
              <SettingsSection
                occurrences={t('occurrences')}
                isfromRoll={false}
                heading={t('stop_machine_if')}
                horDefectCount={this.state.settings.horizontal.defectStopCount.toString()}
                vertDefectCount={this.state.settings.vertical.defectStopCount.toString()}
                punchDefectCount={this.state.settings.punctual.defectStopCount.toString()}
                oilDefectCount={this.state.settings.oil.defectStopCount.toString()}
                horDefectLength={this.state.settings.horizontal.defectStopLength.toString()}
                vertDefectLength={this.state.settings.vertical.defectStopLength.toString()}
                punchDefectLenght={this.state.settings.punctual.defectStopLength.toString()}
                oilDefectLenght={this.state.settings.oil.defectStopLength.toString()}
                horDefectCountChangeText={(v) =>
                  this.onChange('horizontal', 'defectStopCount', v)
                }
                vertDefectCountChangeText={(v) =>
                  this.onChange('vertical', 'defectStopCount', v)
                }
                punchDefectCountChangeText={(v) =>
                  this.onChange('punctual', 'defectStopCount', v)
                }
                oilDefectCountChangeText={(v) =>
                  this.onChange('oil', 'defectStopCount', v)
                }
                horDefectLengthChangeText={(v) =>
                  this.onChange('horizontal', 'defectStopLength', v)
                }
                vertDefectLengthChangeText={(v) =>
                  this.onChange('vertical', 'defectStopLength', v)
                }
                punchDefectLenghtChangeText={(v) =>
                  this.onChange('punctual', 'defectStopLength', v)
                }
                oilDefectLenghtChangeText={(v) =>
                  this.onChange('oil', 'defectStopLength', v)
                }
              />
              <SettingsSection
                horDefectCount={this.state.settings.horizontal.defectPerRollCount.toString()}
                vertDefectCount={this.state.settings.vertical.defectPerRollCount.toString()}
                punchDefectCount={this.state.settings.punctual.defectPerRollCount.toString()}
                oilDefectCount={this.state.settings.oil.defectPerRollCount.toString()}
                occurrences={t('occurrences')}
                isfromRoll={true}
                roll={t('1_roll')}
                heading={t('stop_machine_if')}
                horDefectCountChangeText={(v) =>
                  this.onChange('horizontal', 'defectPerRollCount', v)
                }
                vertDefectCountChangeText={(v) =>
                  this.onChange('vertical', 'defectPerRollCount', v)
                }
                punchDefectCountChangeText={(v) =>
                  this.onChange('punctual', 'defectPerRollCount', v)
                }
                oilDefectCountChangeText={(v) =>
                  this.onChange('oil', 'defectPerRollCount', v)
                }
              />
              <SettingsSection
                isfromRoll={false}
                heading={t('alert_if')}
                horDefectCount={this.state.settings.horizontal.defectAlertCount.toString()}
                vertDefectCount={this.state.settings.vertical.defectAlertCount.toString()}
                punchDefectCount={this.state.settings.punctual.defectAlertCount.toString()}
                oilDefectCount={this.state.settings.oil.defectAlertCount.toString()}
                horDefectLength={this.state.settings.horizontal.defectAlertLength.toString()}
                vertDefectLength={this.state.settings.vertical.defectAlertLength.toString()}
                punchDefectLenght={this.state.settings.punctual.defectAlertLength.toString()}
                oilDefectLenght={this.state.settings.oil.defectAlertLength.toString()}
                occurrences={t('occurrences')}
                horDefectCountChangeText={(v) =>
                  this.onChange('horizontal', 'defectAlertCount', v)
                }
                vertDefectCountChangeText={(v) =>
                  this.onChange('vertical', 'defectAlertCount', v)
                }
                punchDefectCountChangeText={(v) =>
                  this.onChange('punctual', 'defectAlertCount', v)
                }
                oilDefectCountChangeText={(v) =>
                  this.onChange('oil', 'defectAlertCount', v)
                }
                horDefectLengthChangeText={(v) =>
                  this.onChange('horizontal', 'defectAlertLength', v)
                }
                vertDefectLengthChangeText={(v) =>
                  this.onChange('vertical', 'defectAlertLength', v)
                }
                punchDefectLenghtChangeText={(v) =>
                  this.onChange('punctual', 'defectAlertLength', v)
                }
                oilDefectLenghtChangeText={(v) =>
                  this.onChange('oil', 'defectAlertLength', v)
                }
              />
            </View>
            <View style={{flexDirection: 'row', overflow: 'hidden'}}>
              <View
                style={[
                  styles.viewInputContainer,
                  {alignItems: 'center', flexDirection: 'column'},
                ]}>
                <Text style={[Styles.subtitle3]}>
                  {t('threshold_horizontal')}
                </Text>
                <View style={styles.horizontal}>
                  <Text style={Styles.h6} adjustsFontSizeToFit>
                    {t('horizontal')}
                  </Text>
                  <TextInput
                    {...textInputThresholdProps}
                    style={styles.inputLessMarginStart}
                    value={this.state.settings.horizontal.sensitivityThreshold.toString()}
                    onChangeText={(v) =>
                      this.onChange('horizontal', 'sensitivityThreshold', v)
                    }
                  />
                  <Text style={Styles.h6} adjustsFontSizeToFit>
                    {t('vertical')}
                  </Text>
                  <TextInput
                    {...textInputThresholdProps}
                    style={styles.inputLessMarginStart}
                    value={this.state.settings.vertical.sensitivityThreshold.toString()}
                    onChangeText={(v) =>
                      this.onChange('vertical', 'sensitivityThreshold', v)
                    }
                  />
                  <Text style={Styles.h6} adjustsFontSizeToFit>
                    {t('punctual')}
                  </Text>
                  <TextInput
                    {...textInputThresholdProps}
                    style={styles.inputLessMarginStart}
                    value={this.state.settings.punctual.sensitivityThreshold.toString()}
                    onChangeText={(v) =>
                      this.onChange('punctual', 'sensitivityThreshold', v)
                    }
                  />
                  <Text style={Styles.h6} adjustsFontSizeToFit>
                    {t('oil')}
                  </Text>
                  <TextInput
                    {...textInputThresholdProps}
                    style={styles.inputLessMarginStart}
                    value={this.state.settings.oil.sensitivityThreshold.toString()}
                    onChangeText={(v) =>
                      this.onChange('oil', 'sensitivityThreshold', v)
                    }
                  />
                </View>
              </View>
              <View
                style={[
                  styles.viewInputContainer,
                  {alignItems: 'center', flexDirection: 'column'},
                ]}>
                <Text style={Styles.subtitle3}>
                  {t('current_production_has')}
                </Text>

                <View style={styles.horizontal}>
                  <TextInput
                    {...textInputThresholdProps}
                    ref={this.inputRef}
                    style={styles.inputLessMarginStart}
                    onChangeText={(txt) =>
                      this.onchangecmPerRotation(txt, false)
                    }
                    value={this.state.settings.cmPerRotation.toString()}
                    onEndEditing={(e) =>
                      this.onchangecmPerRotation(e.nativeEvent.text, true)
                    }
                  />
                  <Text style={Styles.h6}>{t('cm_per_rotation')}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.viewInputContainer,
                  {alignItems: 'center', flexDirection: 'column'},
                ]}>
                <Text style={Styles.subtitle3}>{t('ignore_defects_for')}</Text>

                <View style={styles.horizontal}>
                  <TextInput
                    {...textInputProps}
                    style={styles.inputLessMarginStart}
                    value={this.state.settings.ignoreDefectRotationCount.toString()}
                    onChangeText={this.onchangeignoreDefectRotationCount}
                  />
                  <Text style={Styles.h6}>{t('rotations_after_stoppage')}</Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                paddingVertical: 10,
                justifyContent: 'space-between',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View
                  style={[
                    styles.buttons,
                    {marginLeft: 0, marginRight: 15, height: 120},
                  ]}>
                  <Text style={{color: 'white'}}>{t('password_settings')}</Text>
                  <View style={{padding: 5}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={{color: 'white'}}>{t('use_password')}</Text>
                      <Switch
                        width={40}
                        height={20}
                        circleColorActive={'#8D8FFA'}
                        circleColorInactive={'#757C91'}
                        circleStyle={{
                          elevation: 10,
                        }}
                        backgroundActive={'#7B9EDF'}
                        backgroundInactive={'#586075'}
                        value={this.state.settings.isSensitivityThresholdLock}
                        onAsyncPress={(value) => this.onPressLock(value)}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({changePasswordDialogVisible: true})
                      }
                      style={styles.buttons}>
                      <Text style={{color: 'white'}} adjustsFontSizeToFit>
                        {t('change_password')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.buttons, {marginRight: 15}]}>
                  <View
                    style={{
                      padding: 5,
                      height: this.state.isOpenDropDwon === true ? 200 : 100,
                    }}>
                    <DropDownPicker
                      items={this.state.mlModelList}
                      arrowSize={ls(38)}
                      arrowColor="white"
                      dropDownMaxHeight={ls(150)}
                      defaultValue={this.state.settings.selected_model}
                      placeholder={t('ai_model')}
                      onChangeItem={this.updateAIMode}
                      placeholderStyle={styles.placeHolder}
                      dropDownStyle={styles.dropDown}
                      itemStyle={styles.dropDownItem}
                      labelStyle={styles.dropDownLabel}
                      containerStyle={styles.dropDownContainer}
                      style={styles.dropDownField}
                      isFromModel={true}
                      onOpen={() => this.setState({isOpenDropDwon: true})}
                      onClose={() => this.setState({isOpenDropDwon: false})}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <Text style={{color: 'white', marginRight: 10}}>
                        {t('db_collection_mode')}
                      </Text>
                      <Switch
                        width={40}
                        height={20}
                        circleColorActive={'#8D8FFA'}
                        circleColorInactive={'#757C91'}
                        circleStyle={{
                          elevation: 10,
                        }}
                        backgroundActive={'#7B9EDF'}
                        backgroundInactive={'#586075'}
                        value={this.state.settings.db_collection_mode}
                        onAsyncPress={(value) =>
                          this.DBColletionSwitchChange(value)
                        }
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    marginRight: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 120,
                  }}>
                  <TouchableOpacity
                    style={[
                      styles.buttons,
                      {height: 40, marginBottom: 10, width: 100},
                    ]}
                    onPress={() => this.onPressCheckForUpdates()}>
                    <Text style={{color: 'white'}}>{t('check_updates')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttons, {height: 40, width: 100}]}
                    onPress={() => this.onPressReset()}>
                    <Text style={{color: 'white'}}>{t('reset')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.buttonsContainer, {height: 80}]}>
                {/* <View style={{marginEnd: ls(300), flexDirection: 'row'}}>
                <NegativeButton
                  onPress={() => this.onPressReset()}
                  contentStyle={{height: ls(80)}}>
                  {t('reset')}
                </NegativeButton>
              </View> */}
                <NegativeButton
                  style={{marginEnd: ls(22)}}
                  onPress={() => this.props.navigation.goBack()}
                  contentStyle={{height: ls(80)}}>
                  {t('cancel')}
                </NegativeButton>
                <CopilotStep
                  key={t('step_save')}
                  text={t('step_save')}
                  order={3}
                  name="step_save">
                  <CopilotView>
                    <BlueButtonGradient style={{borderRadius: 8}}>
                      <Button
                        mode={'text'}
                        onPress={this.onPressSubmit}
                        contentStyle={{
                          height: ls(80),
                        }}>
                        {t('submit')}
                      </Button>
                    </BlueButtonGradient>
                  </CopilotView>
                </CopilotStep>
              </View>
            </View>
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: ls(22),
              }}>
              <View style={styles.bottomTextStyle}>
                <Text style={Styles.h6}>{t('current_production_has')}</Text>
                <TextInput
                  {...textInputThresholdProps}
                  ref={this.inputRef}
                  style={styles.inputLessMarginStart}
                  onChangeText={(txt) => this.onchangecmPerRotation(txt, false)}
                  value={this.state.settings.cmPerRotation.toString()}
                  onEndEditing={(e) =>
                    this.onchangecmPerRotation(e.nativeEvent.text, true)
                  }
                />
                <Text style={Styles.h6}>{t('cm_per_rotation')}</Text>
              </View>
              <View style={styles.bottomTextStyle}>
                <Text style={Styles.h6}>{t('ignore_defects_for')}</Text>
                <TextInput
                  {...textInputProps}
                  style={styles.inputLessMarginStart}
                  value={this.state.settings.ignoreDefectRotationCount.toString()}
                  onChangeText={this.onchangeignoreDefectRotationCount}
                />
                <Text style={Styles.h6}>{t('rotations_after_stoppage')}</Text>
              </View>
            </View> */}

            {/* <View style={styles.bottomTextStyle}>
              <Text style={Styles.subtitle2} adjustsFontSizeToFit>
                {t('password_lock')}
              </Text>
              <TouchableOpacity onPress={this.onPressLock}>
                <Image
                  source={
                    isSensitivityThresholdLock
                      ? Images.lockedImage
                      : Images.unlockedImage
                  }
                  resizeMode={'contain'}
                  style={[
                    styles.lock,
                    {marginLeft: isSensitivityThresholdLock ? 5 : 10},
                  ]}
                />
              </TouchableOpacity>
            </View> */}
            {/* <View style={styles.viewInputContainer}>
              <Text style={Styles.subtitle3} adjustsFontSizeToFit>
                {t('threshold_horizontal')}
              </Text>
              <View style={styles.horizontal}>
                { <TextInput
                  {...textInputThresholdProps}
                  style={styles.inputLessMarginStart}
                  value={this.state.settings.horizontal.sensitivityThreshold.toString()}
                  onChangeText={(v) =>
                    this.onChange('horizontal', 'sensitivityThreshold', v)
                  }
                />
                <Text style={Styles.h6} adjustsFontSizeToFit>
                  {t('vertical')}
                </Text>
                <TextInput
                  {...textInputThresholdProps}
                  style={styles.inputLessMarginStart}
                  value={this.state.settings.vertical.sensitivityThreshold.toString()}
                  onChangeText={(v) =>
                    this.onChange('vertical', 'sensitivityThreshold', v)
                  }
                />
                <Text style={Styles.h6} adjustsFontSizeToFit>
                  {t('punctual')}
                </Text>
                <TextInput
                  {...textInputThresholdProps}
                  style={styles.inputLessMarginStart}
                  value={this.state.settings.punctual.sensitivityThreshold.toString()}
                  onChangeText={(v) =>
                    this.onChange('punctual', 'sensitivityThreshold', v)
                  }
                />
                <Text style={Styles.h6} adjustsFontSizeToFit>
                  {t('oil')}
                </Text>
                <TextInput
                  {...textInputThresholdProps}
                  style={styles.inputLessMarginStart}
                  value={this.state.settings.oil.sensitivityThreshold.toString()}
                  onChangeText={(v) =>
                    this.onChange('oil', 'sensitivityThreshold', v)
                  }
                /> }
                {!this.state.isThresholdValid ? (
                  <Text
                    style={[Styles.h6, {color: AppTheme.colors.red}]}
                    adjustsFontSizeToFit>
                    {t('threshold_message')}
                  </Text>
                ) : null}
              </View>
              { <View style={styles.dbCollectionView}>
                {this.state.mlModelList.length === 0 ? null : (
                  <DropDownPicker
                    items={this.state.mlModelList}
                    arrowSize={ls(38)}
                    arrowColor="white"
                    dropDownMaxHeight={ls(150)}
                    defaultValue={this.state.settings.selected_model}
                    placeholder={t('ai_model')}
                    onChangeItem={this.updateAIMode}
                    placeholderStyle={styles.placeHolder}
                    dropDownStyle={styles.dropDown}
                    itemStyle={styles.dropDownItem}
                    labelStyle={styles.dropDownLabel}
                    containerStyle={styles.dropDownContainer}
                    style={styles.dropDownField}
                    isFromModel={true}
                  />
                )}
              </View> }
            </View> */}
            {/* <View style={styles.viewInputContainer}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({changePasswordDialogVisible: true})
                  }
                  style={styles.buttonWithBorder}>
                  <Text style={Styles.subtitle2} adjustsFontSizeToFit>
                    {t('change_password')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.onPressCheckForUpdates}
                  style={[styles.buttonWithBorder, {marginLeft: 20}]}>
                  <Text style={Styles.subtitle2} adjustsFontSizeToFit>
                    {t('check_updates')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dbCollectionView}>
                <Text style={{...Styles.h5, marginRight: 20}}>
                  {t('db_collection_mode')}
                </Text>
                <Switch
                  width={60}
                  height={30}
                  backgroundActive={AppTheme.colors.accent}
                  backgroundInactive={AppTheme.colors.placeholder}
                  value={this.state.settings.db_collection_mode}
                  onAsyncPress={(value) => this.DBColletionSwitchChange(value)}
                />
              </View>
            </View> */}
            {/* <View style={styles.buttonsContainer}> */}
            {/* <View style={{marginEnd: ls(300), flexDirection: 'row'}}>
                <NegativeButton
                  onPress={() => this.onPressReset()}
                  contentStyle={{height: ls(80)}}>
                  {t('reset')}
                </NegativeButton>
              </View> */}
            {/* <NegativeButton
                style={{marginEnd: ls(22)}}
                onPress={() => this.props.navigation.goBack()}
                contentStyle={{height: ls(80)}}>
                {t('cancel')}
              </NegativeButton>
              <CopilotStep
                key={t('step_save')}
                text={t('step_save')}
                order={3}
                name="step_save">
                <CopilotView>
                  <Button
                    onPress={this.onPressSubmit}
                    contentStyle={{height: ls(80)}}>
                    {t('submit')}
                  </Button>
                </CopilotView>
              </CopilotStep>
            </View> */}
            <Dialog
              visible={this.state.visible}
              onDismiss={false}
              style={{alignSelf: 'center', width: '60%'}}>
              <ConfirmationDialog
                title={t('reset_all')}
                subtitle={t('reset_message')}
                onPressPositive={() => {
                  this.onResetValue();
                  this.setState({visible: false});
                }}
                onPressNegative={() => {
                  this.setState({visible: false});
                }}
              />
            </Dialog>
          </View>
          <Portal>
            <Dialog
              visible={this.state.changePasswordDialogVisible}
              onDismiss={() =>
                this.setState({changePasswordDialogVisible: false})
              }
              style={styles.changePasswordPopup}>
              <ChangePassword
                onSuccess={() =>
                  this.setState({
                    changePasswordDialogVisible: false,
                  })
                }
              />
            </Dialog>
          </Portal>
          <SettingsAuthDialog
            settingsUnlockPassword={
              this.state.isPressDbCollectionMode === true
                ? '2018'
                : settingsUnlockPassword
            }
            onCancelPress={() =>
              this.state.isPressDbCollectionMode === true
                ? this.setState({isPressDbCollectionMode: false})
                : this.props.navigation.goBack()
            }
            visible={
              this.state.isPressDbCollectionMode === true
                ? this.state.isPressDbCollectionMode
                : this.isTimeGreaterOneMin()
            }
            onSubmit={() => {
              this.state.isPressDbCollectionMode === true
                ? this.setState((prevState) => ({
                    isPressDbCollectionMode: false,
                    settings: {
                      ...prevState.settings,
                      db_collection_mode: !prevState.settings
                        .db_collection_mode,
                    },
                  }))
                : this.setState({isLocked: false});

              this.props.setSettingsTimeout(new Date().getTime());
            }}
          />
        </View>
      </ScrollView>
    );
  }
  onSwitchStateChange = (key, isState) => {
    const update = {...this.state.settings};
    const updateSettings = updateSetting(isState, null, key, update);

    this.setState({
      settings: updateSettings,
    });
  };
  onPressLock = () => {
    this.updateSettingsOnState(
      'isSensitivityThresholdLock',
      !this.state.settings.isSensitivityThresholdLock,
    );
  };
  askForUpdate = (response, t) =>
    Alert.alert(
      t('updates'),
      t('ask_for_updates'),
      [
        {
          text: t('yes'),
          onPress: () => this.dawnloadNewVersion(response),
        },
        {
          text: t('no'),
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  onPressCheckForUpdates = async () => {
    try {
      const response = await SmartexService.getLatestVersionInfo();
      const {t, showSnackbar} = this.props;
      // Check if the response is not empty and contains the required fields.
      if (response.data.id && response.data.version && response.data.link) {
        // Check if the latest vesion is greater than the current installed version.
        if (Config.VERSION_NAME < response.data.version) {
          this.askForUpdate(response, t);
        } else {
          showSnackbar(t('no_new_version_available_to_download'));
        }
      } else {
        showSnackbar(t('no_new_version_available_to_download'));
      }
    } catch (err) {
      logger.log('Something went wrong', err);
    }
  };
  dawnloadNewVersion = (response) => {
    const {t, showSnackbar} = this.props;
    showSnackbar(t('downloading_new_apk'));
    downloadAPK({
      ...response.data,
      description: t('downloading_new_apk'),
      title: 'Smartex_' + response.data.version + '.apk',
    });
  };

  onPressSubmit = async () => {
    const {t, showSnackbar} = this.props;
    if (!this.occurrencesPerCmValidation()) {
      return;
    }

    if (this.state.settings.cmPerRotation === '') {
      showSnackbar(t('enter_cmRotation_value'));
      return;
    }

    if (this.state.settings.ignoreDefectRotationCount === '') {
      showSnackbar(t('enter_rotation_after_stop_value'));
      return;
    }

    if (this.state.settings.horizontal.sensitivityThreshold === '') {
      showSnackbar(t('enter_hori_threshold_value'));
      return;
    }

    if (this.state.settings.vertical.sensitivityThreshold === '') {
      showSnackbar(t('enter_vert_threshold_value'));
      return;
    }

    if (this.state.settings.punctual.sensitivityThreshold === '') {
      showSnackbar(t('enter_punch_threshold_value'));
      return;
    }
    if (this.state.settings.oil.sensitivityThreshold === '') {
      showSnackbar(t('enter_oil_threshold_value'));
      return;
    }

    if (this.state.settings.horizontal.defectAlertCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.vertical.defectAlertCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.punctual.defectAlertCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }
    if (this.state.settings.oil.defectAlertCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.horizontal.defectAlertLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.vertical.defectAlertLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.punctual.defectAlertLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }
    if (this.state.settings.oil.defectAlertLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.horizontal.defectPerRollCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.vertical.defectPerRollCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.punctual.defectPerRollCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }
    if (this.state.settings.oil.defectPerRollCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.horizontal.defectStopCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.vertical.defectStopCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.punctual.defectStopCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }
    if (this.state.settings.oil.defectStopCount === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.horizontal.defectStopLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.vertical.defectStopLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    if (this.state.settings.punctual.defectStopLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }
    if (this.state.settings.oil.defectStopLength === '') {
      showSnackbar(t('please_fill_empty_values'));
      return;
    }

    var sensitivityThresholdIntHor = parseFloat(
      this.state.settings.horizontal.sensitivityThreshold,
      0,
    );
    var sensitivityThresholdIntVer = parseFloat(
      this.state.settings.vertical.sensitivityThreshold,
      0,
    );
    var sensitivityThresholdIntPun = parseFloat(
      this.state.settings.punctual.sensitivityThreshold,
      0,
    );

    var sensitivityThresholdIntOil = parseFloat(
      this.state.settings.oil.sensitivityThreshold,
      0,
    );

    if (
      sensitivityThresholdIntHor > 1 ||
      sensitivityThresholdIntHor < 0 ||
      sensitivityThresholdIntVer > 1 ||
      sensitivityThresholdIntVer < 0 ||
      sensitivityThresholdIntPun > 1 ||
      sensitivityThresholdIntPun < 0 ||
      sensitivityThresholdIntOil > 1 ||
      sensitivityThresholdIntOil < 0
    ) {
      this.setState({isThresholdValid: false});
    } else {
      //logAnalytics(Events.SAVE_SETTINGS, `settings changed to ${this.state}`);

      const request = JSON.parse(JSON.stringify(this.state.settings));

      const coreServiceAPIService = new CoreServiceAPIService();
      // Send settings asynchronously (can't check if the operation was successfull but responsiveness is more important atm)
      coreServiceAPIService.sendSettings(request);
      /*const result = await coreServiceAPIService.sendSettings(request);
      if (!result) {
        // TODO: Error accoured. Basic error already handeled in API service
      } */
      this.props.i18n.changeLanguage(this.state.settings.selectedLanguage);

      this.props.setSettings(request);

      this.props.navigation.navigate('home');
    }
  };
  onPressReset = () => {
    this.setState({visible: true});
  };
}

const styles = ScaledSheet.create({
  container: {flex: 1, height: height, backgroundColor: '292B35'},
  switchSection: {
    flexDirection: 'row',
    marginTop: ls(5),
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  bottomTextStyle: {
    ...Styles.h6,
    marginTop: '10@ls',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    bottom: '8@ls',
    marginTop: '30@ls',
    end: 0,
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    backgroundColor: '#2E333D',
    // marginLeft: 10,
  },
  stopMachineIf: {
    ...Styles.h6,
    marginStart: '20@ls',
  },
  rollInput: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: '30@ls',
    paddingHorizontal: '16@ls',
    paddingVertical: '12@ls',
    color: 'white',
    marginEnd: '16@ls',
    width: '70@ls',
  },
  input: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: '22@ls',
    paddingHorizontal: '16@ls',
    paddingVertical: '12@ls',
    color: 'white',
    marginEnd: '16@ls',
    width: '70@ls',
  },
  inputLessMarginStart: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: '10@ls',
    paddingHorizontal: '10@ls',
    paddingVertical: '12@ls',
    color: 'white',
    marginEnd: '16@ls',
    width: '70@ls',
  },
  labelContainer: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: '16@ls',
    paddingHorizontal: '16@ls',
    paddingVertical: '12@ls',
    color: 'white',
    marginEnd: '16@ls',
  },
  rollLabel: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: '16@ls',
    paddingHorizontal: '16@ls',
    paddingVertical: '12@ls',
    color: 'white',
    marginEnd: '16@ls',
  },
  languagePicker: {
    flexDirection: 'row',
    marginTop: '5@ls',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '10@ls',
  },
  languageCopilot: {
    marginTop: '2@ls',
  },
  fab: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  changePasswordPopup: {
    alignSelf: 'center',
    width: '70%',
    height: '80%',
  },
  lock: {
    height: 30,
    width: 30,
  },
  buttonWithBorder: {
    borderColor: '#68E6E6',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  dbCollectionView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewInputContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: '20@ls',
    backgroundColor: AppTheme.colors.darkGray,
    padding: 10,
    marginRight: 10,
    elevation: 5,
    borderRadius: 8,
  },
  placeHolder: {
    ...Styles.h4,
    color: AppTheme.colors.placeholder,
  },
  dropDownField: {
    backgroundColor: AppTheme.colors.input,
    borderColor: AppTheme.colors.input,
    borderRadius: 5,
    paddingHorizontal: '16@ls',
  },
  dropDown: {
    elevation: 4,
    backgroundColor: AppTheme.colors.card,
    borderColor: AppTheme.colors.card,
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    paddingStart: '16@ls',
    paddingVertical: '16@ls',
  },
  dropDownLabel: {
    color: 'white',
    fontSize: '22@ls',
    fontFamily: Fonts.regular,
  },
  dropDownContainer: {
    height: '60@ls',
    width: '320@ls',
  },
});

const mapStateToProps = ({persisted, auth}) => {
  return {
    settings: persisted.settings,
    settingsUnlockPassword: persisted.settingsUnlockPassword,
    mlModelList: auth.mlModelList,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    setSettings: (settings) =>
      dispatch({type: Actions.SET_SETTINGS, data: settings}),
    setSettingsTimeout: (timeStamp) =>
      dispatch({type: Actions.SET_SETTINGS_TIME_STAMP, timestamp: timeStamp}),
    setIsFromSetting: (isFromSetting) =>
      dispatch({type: Actions.IS_FROM_SETTING, data: isFromSetting}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(copilot(CopilotStyle)(Settings)),
);
