import React, {PureComponent} from 'react';
import {Text, View, StyleSheet, Image} from 'react-native';
import {Card} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import ScoreChart from './ScoreChart';
import {connect} from 'react-redux';
import {AppTheme, Styles} from '@themes';
import {Stores, Actions} from '@state';
import {CoreServiceAPIService} from '@services';
import UpdateIndicator from './UpdateIndicator';
import {updateSetting} from 'Helpers/CheckDefect';
import Images from '@images';
import {isAuthorisationNeededToChangeSettings} from '@helpers';

const UPDATE = {
  HORIZONTAL_SWITCH_VALUE: 'horizontalSwitchValue',
  HORIZONTAL_THRESHOLD: 'horizontalThreshold',
  VERTICAL_SWITCH_VALUE: 'verticalSwitchValue',
  VERTICAL_THRESHOLD: 'verticalThreshold',
  PUNCTUAL_SWITCH_VALUE: 'punctualSwitchValue',
  PUNCTUAL_THRESHOLD: 'punctualThreshold',
  OIL_SWITCH_VALUE: 'oilSwitchValue',
  OIL_THRESHOLD: 'oilThreshold',
};
const syncKeys = Object.values(UPDATE);

class ShiftChart extends PureComponent {
  constructor(props) {
    super();
    this.update = null;
    this.state = {
      chartWidth: 0,
      chartHeight: 0,

      verticalSwitchValue: props.verticalSwitchValue,
      verticalThreshold: props.verticalThreshold,

      horizontalSwitchValue: props.horizontalSwitchValue,
      horizontalThreshold: props.horizontalThreshold,

      punctualThreshold: props.punctualThreshold,
      punctualSwitchValue: props.punctualSwitchValue,

      oilThreshold: props.oilThreshold,
      oilSwitchValue: props.oilSwitchValue,
    };
  }
  componentDidUpdate(previous) {
    let needSync = false;
    for (const key of syncKeys) {
      if (previous[key] !== this.props[key]) {
        needSync = true;
        break;
      }
    }
    if (needSync) {
      this.syncStateFromProps();
    }
  }

  syncStateFromProps = () => {
    let update = {};
    syncKeys.forEach((key) => (update[key] = this.props[key]));
    this.setState(update);
  };

  onChange = (key, value) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.update || this.props.isFromSetting === true) {
      this.props.setIsFromSetting(false);
      this.update = JSON.parse(
        JSON.stringify(Stores.getState().persisted.settings),
      ); //deep copy backup otherwise modification changes in redux
    }
    switch (key) {
      case UPDATE.HORIZONTAL_THRESHOLD:
        this.update.horizontal.sensitivityThreshold = value / 100;
        this.setState({horizontalThreshold: value / 100});
        break;
      case UPDATE.VERTICAL_THRESHOLD:
        this.update.vertical.sensitivityThreshold = value / 100;
        this.setState({verticalThreshold: value / 100});
        break;
      case UPDATE.PUNCTUAL_THRESHOLD:
        this.update.punctual.sensitivityThreshold = value / 100;
        this.setState({punctualThreshold: value / 100});
        break;
      case UPDATE.OIL_THRESHOLD:
        this.update.oil.sensitivityThreshold = value / 100;
        this.setState({oilThreshold: value / 100});
        break;
      default:
        this.update = updateSetting(value, null, key, this.update);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(async () => {
      const coreServiceAPIService = new CoreServiceAPIService();
      const result = await coreServiceAPIService.sendSettings(this.update);
      if (!result) {
        // TODO: Error accoured. Basic error already handeled in API service
      }
      if (this.update !== null) {
        this.props.setSettings(this.update);
      } else {
        // Order Matters of these lines
        this.update = null; //
      }
    }, 2000);
  };

  setHorizontalEnabled = (enabled) =>
    this.onChange(UPDATE.HORIZONTAL_SWITCH_VALUE, enabled);

  setVerticalEnabled = (enabled) =>
    this.onChange(UPDATE.VERTICAL_SWITCH_VALUE, enabled);

  setHorizontalThreshold = (value) =>
    this.onChange(UPDATE.HORIZONTAL_THRESHOLD, value);

  setVerticalThreshold = (value) =>
    this.onChange(UPDATE.VERTICAL_THRESHOLD, value);

  setPunctualEnabled = (enabled) =>
    this.onChange(UPDATE.PUNCTUAL_SWITCH_VALUE, enabled);

  setPunctualThreshold = (value) =>
    this.onChange(UPDATE.PUNCTUAL_THRESHOLD, value);

  setOilEnabled = (enabled) => this.onChange(UPDATE.OIL_SWITCH_VALUE, enabled);

  setOilThreshold = (value) => this.onChange(UPDATE.OIL_THRESHOLD, value);

  onCardLayout = ({nativeEvent: {layout}}) => {
    this.setState({
      chartWidth: layout.width * (1 / 4),
      chartHeight: layout.height,
    });
  };

  render() {
    const {isSensitivityThresholdLock} = Stores.getState().persisted.settings;
    const {timestamp} = Stores.getState().persisted;

    const {
      t,
      horizontalScores,
      verticalScores,
      punctualScores,
      oilScores,
    } = this.props;
    const {
      chartWidth,
      chartHeight,
      horizontalThreshold,
      verticalThreshold,
      horizontalSwitchValue,
      verticalSwitchValue,
      punctualSwitchValue,
      punctualThreshold,
      oilSwitchValue,
      oilThreshold,
    } = this.state;

    return (
      <Card
        elevation={AppTheme.elevation}
        style={styles.card}
        onLayout={this.onCardLayout}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={Styles.subtitle1}>{t('scores')}</Text>
            {isSensitivityThresholdLock ? (
              <Image
                source={
                  isAuthorisationNeededToChangeSettings(timestamp)
                    ? Images.lockedImage
                    : Images.unlockedImage
                }
                resizeMode={'contain'}
                style={{marginLeft: 5, height: 30, width: 30}}
              />
            ) : null}
          </View>
          <UpdateIndicator />
        </View>
        {chartWidth && chartHeight ? (
          <View style={styles.chartRow}>
            <ScoreChart
              enabled={horizontalSwitchValue}
              setEnabled={this.setHorizontalEnabled}
              onThresholdChanged={this.setHorizontalThreshold}
              value={horizontalThreshold * 100}
              label={t('horizontal')}
              scores={horizontalScores}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              onDisplaySettingAuthDialog={this.props.onDisplaySettingAuthDialog}
            />
            <ScoreChart
              enabled={verticalSwitchValue}
              setEnabled={this.setVerticalEnabled}
              onThresholdChanged={this.setVerticalThreshold}
              style={styles.verticalChart}
              value={verticalThreshold * 100}
              label={t('vertical')}
              scores={verticalScores}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              onDisplaySettingAuthDialog={this.props.onDisplaySettingAuthDialog}
            />
            <ScoreChart
              enabled={punctualSwitchValue}
              setEnabled={this.setPunctualEnabled}
              onThresholdChanged={this.setPunctualThreshold}
              style={styles.verticalChart}
              value={punctualThreshold * 100}
              label={t('punctual')}
              scores={punctualScores}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              onDisplaySettingAuthDialog={this.props.onDisplaySettingAuthDialog}
            />
            <ScoreChart
              enabled={oilSwitchValue}
              setEnabled={this.setOilEnabled}
              onThresholdChanged={this.setOilThreshold}
              style={styles.verticalChart}
              value={oilThreshold * 100}
              label={t('oil')}
              scores={oilScores}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              onDisplaySettingAuthDialog={this.props.onDisplaySettingAuthDialog}
            />
          </View>
        ) : null}
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginHorizontal: 24,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
  },

  card: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  chartRow: {
    flexDirection: 'row',
    flex: 1,
  },
  verticalChart: {
    end: 2,
  },
});

const mapStateToProps = ({home, persisted: {settings, isFromSetting}}) => ({
  horizontalScores: home.horizontalScores,
  verticalScores: home.verticalScores,
  punctualScores: home.punctualScores,
  oilScores: home.oilScores,

  horizontalThreshold: settings.horizontal.sensitivityThreshold,
  verticalThreshold: settings.vertical.sensitivityThreshold,
  punctualThreshold: settings.punctual.sensitivityThreshold,
  oilThreshold: settings.oil.sensitivityThreshold,

  horizontalSwitchValue: settings.horizontalSwitchValue,
  verticalSwitchValue: settings.verticalSwitchValue,
  punctualSwitchValue: settings.punctualSwitchValue,
  oilSwitchValue: settings.oilSwitchValue,

  isFromSetting: isFromSetting,
});

const mapDispatchToProps = (dispatch) => ({
  showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  setSettings: (data) => dispatch({type: Actions.SET_SETTINGS, data}),
  setIsFromSetting: (isFromSetting) =>
    dispatch({type: Actions.IS_FROM_SETTING, data: isFromSetting}),
});

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ShiftChart),
);
