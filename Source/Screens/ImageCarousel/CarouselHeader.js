import React, {PureComponent} from 'react';
import {Text, View, Pressable} from 'react-native';
import {Menu} from 'react-native-paper';
import Switch from 'react-native-switch-pro';
import moment from 'moment/min/moment-with-locales';
import i18n from 'i18next';
import {ScaledSheet, ls} from '@helpers';
import Icon from '@icons';
import {Styles, AppTheme} from '@themes';
import {withTranslation} from 'react-i18next';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CheckDefect} from '@helpers';
import {defectLavel, updateSetting} from 'Helpers/CheckDefect';
import {connect} from 'react-redux';
import {Actions, Stores} from '@state';
import {CoreServiceAPIService} from '@services';

const UPDATE = {
  HORIZONTAL_SWITCH_VALUE: 'horizontalSwitchValue',
  VERTICAL_SWITCH_VALUE: 'verticalSwitchValue',
  PUNCTUAL_SWITCH_VALUE: 'punctualSwitchValue',
  OIL_SWITCH_VALUE: 'oilSwitchValue',
};

class CarouselHeader extends PureComponent {
  state = {
    typeMenuVisible: false,
    positionMenuVisible: false,
  };

  constructor(props) {
    super();
    this.update = null;
  }

  componentDidMount() {
    moment.locale(i18n.language);
  }

  componentDidUpdate() {
    moment.locale(i18n.language);
  }

  setEnabled = (key, isState) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.update) {
      this.update = JSON.parse(
        JSON.stringify(Stores.getState().persisted.settings),
      ); //deep copy backup otherwise modification changes in redux
    }
    const {index} = this.props;
    this.update = updateSetting(isState, index, key, this.update);
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
        this.props.setSettings(this.update); // Order Matters of these lines
      }
    }, 2000);
  };

  generateTranslatedString = (t, defectName) => {
    let translation = '';
    let defectList = defectName.split(' + ');

    translation = t(defectList[0]);
    for (let i = 1; i < defectList.length; i++) {
      translation += ` +  ${t(defectList[i])}`;
    }

    return translation;
  };

  render() {
    const isHome = this.props.isHome ? this.props.isHome : false;
    const {camera, goBack} = this.props;
    const time = moment(camera.timestamp);
    const defectName = camera.defect;
    const {score, thresholds} = camera;
    const parsedScore = JSON.parse(score);
    const parsedThresholds = JSON.parse(thresholds);
    const defectTypes = (defectName ? defectName : '').split(' + ');
    const foundH = defectTypes.find(
      (element) => element.toLowerCase() === 'horizontal',
    );
    const foundV = defectTypes.find(
      (element) => element.toLowerCase() === 'vertical',
    );
    const foundP = defectTypes.find(
      (element) =>
        element.toLowerCase() === 'punctual' ||
        element.toLowerCase() === 'point',
    );
    const foundO = defectTypes.find(
      (element) => element.toLowerCase() === 'oil',
    );
    const dataDefectH = {
      defect: foundH,
      score: camera.score,
      thresholds: camera.thresholds,
    };
    const dataDefectV = {
      defect: foundV,
      score: camera.score,
      thresholds: camera.thresholds,
    };
    const dataDefectP = {
      defect: foundP,
      score: camera.score,
      thresholds: camera.thresholds,
    };
    const dataDefectO = {
      defect: foundO,
      score: camera.score,
      thresholds: camera.thresholds,
    };
    const {settings, index, t} = this.props;
    let defectLavelH = null;
    let defectLavelV = null;
    let defectLavelP = null;
    let defectLavelO = null;

    if (isHome === true) {
      defectLavelH = foundH
        ? CheckDefect.defectTypes(dataDefectH, settings[index])
        : null;
      defectLavelV = foundV
        ? CheckDefect.defectTypes(dataDefectV, settings[index])
        : null;
      defectLavelP = foundP
        ? CheckDefect.defectTypes(dataDefectP, settings[index])
        : null;
      defectLavelO = foundO
        ? CheckDefect.defectTypes(dataDefectO, settings[index])
        : null;
    } else {
      if (foundH !== null) {
        defectLavelH =
          parsedScore[0] >= parsedThresholds[0] ? camera.defectLevel : null;
      }
      if (foundV !== null) {
        defectLavelV =
          parsedScore[1] >= parsedThresholds[1] ? camera.defectLevel : null;
      }
      if (foundP !== null) {
        defectLavelP =
          parsedScore[2] >= parsedThresholds[2] ? camera.defectLevel : null;
      }
      if (foundO !== null) {
        defectLavelO =
          parsedScore[3] >= parsedThresholds[3] ? camera.defectLevel : null;
      }
    }

    return (
      <View style={styles.header}>
        <View style={styles.headerStart}>
          <View style={{alignItems: 'flex-start'}}>
            <Text numberOfLines={1} style={Styles.h4}>
              {defectName ? this.generateTranslatedString(t, defectName) : null}
            </Text>
            <View style={styles.dateAndTimeView}>
              <Text style={Styles.body2}>{time?.format('ll')}</Text>
              <Text style={Styles.body2}>{time?.format('LTS')}</Text>
            </View>
            {/* <Text style={Styles.caption}>{score + '  ' + thresholds}</Text> */}
          </View>
          <View style={{marginLeft: 5, alignItems: 'center'}}>
            <Text style={Styles.caption}>
              {t('camera')} {index + 1}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'flex-end',
              }}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={Styles.caption}>{t('scores')}</Text>
                <View style={styles.scoreTableDivider} />
                <Text style={Styles.caption}>{t('thresholds')}</Text>
              </View>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text
                  style={{...Styles.caption, marginTop: 2, marginVertical: 5}}>
                  {t('horizontal')}
                </Text>
                {isHome === true ? (
                  <Switch
                    width={60}
                    height={30}
                    value={settings[index].horizontalSwitchValue}
                    onSyncPress={(value) =>
                      this.setEnabled(UPDATE.HORIZONTAL_SWITCH_VALUE, value)
                    }
                    circleColorActive={'#8D8FFA'}
                    circleColorInactive={'#757C91'}
                    circleStyle={{
                      elevation: 10,
                    }}
                    backgroundActive={'#7B9EDF'}
                    backgroundInactive={'#586075'}
                    style={{
                      elevation: 10,
                    }}
                  />
                ) : null}
                <Text
                  style={[
                    Styles.caption,
                    defectLavelH === defectLavel.red
                      ? styles.defectLavelRed
                      : null,
                    defectLavelH === defectLavel.gray
                      ? styles.defectLavelGrey
                      : null,
                  ]}>
                  {parsedScore[0]}
                </Text>
                <View style={styles.scoreTableDivider} />
                <Text style={Styles.caption}>{parsedThresholds[0]}</Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 5,
                }}>
                <Text style={{...Styles.caption, marginVertical: 5}}>
                  {t('vertical')}
                </Text>
                {isHome === true ? (
                  <Switch
                    width={60}
                    height={30}
                    value={settings[index].verticalSwitchValue}
                    onSyncPress={(value) =>
                      this.setEnabled(UPDATE.VERTICAL_SWITCH_VALUE, value)
                    }
                    circleColorActive={'#8D8FFA'}
                    circleColorInactive={'#757C91'}
                    circleStyle={{
                      elevation: 10,
                    }}
                    backgroundActive={'#7B9EDF'}
                    backgroundInactive={'#586075'}
                    style={{
                      elevation: 10,
                    }}
                  />
                ) : null}
                <Text
                  style={[
                    Styles.caption,
                    defectLavelV === defectLavel.red
                      ? styles.defectLavelRed
                      : null,
                    defectLavelV === defectLavel.gray
                      ? styles.defectLavelGrey
                      : null,
                  ]}>
                  {parsedScore[1]}
                </Text>
                <View style={styles.scoreTableDivider} />
                <Text style={Styles.caption}>{parsedThresholds[1]}</Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 5,
                }}>
                <Text
                  style={{...Styles.caption, marginTop: 2, marginVertical: 5}}>
                  {t('punctual')}
                </Text>
                {isHome === true ? (
                  <Switch
                    width={60}
                    height={30}
                    value={settings[index].punctualSwitchValue}
                    onSyncPress={(value) =>
                      this.setEnabled(UPDATE.PUNCTUAL_SWITCH_VALUE, value)
                    }
                    circleColorActive={'#8D8FFA'}
                    circleColorInactive={'#757C91'}
                    circleStyle={{
                      elevation: 10,
                    }}
                    backgroundActive={'#7B9EDF'}
                    backgroundInactive={'#586075'}
                    style={{
                      elevation: 10,
                    }}
                  />
                ) : null}

                <Text
                  style={[
                    Styles.caption,
                    defectLavelP === defectLavel.red
                      ? styles.defectLavelRed
                      : null,
                    defectLavelP === defectLavel.gray
                      ? styles.defectLavelGrey
                      : null,
                  ]}>
                  {parsedScore[2]}
                </Text>
                <View style={styles.scoreTableDivider} />
                <Text style={Styles.caption}>{parsedThresholds[2]}</Text>
              </View>

              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text
                  style={{...Styles.caption, marginTop: 2, marginVertical: 5}}>
                  {t('oil')}
                </Text>
                {isHome === true ? (
                  <Switch
                    width={60}
                    height={30}
                    value={settings[index].oilSwitchValue}
                    onSyncPress={(value) =>
                      this.setEnabled(UPDATE.OIL_SWITCH_VALUE, value)
                    }
                    circleColorActive={'#8D8FFA'}
                    circleColorInactive={'#757C91'}
                    circleStyle={{
                      elevation: 10,
                    }}
                    backgroundActive={'#7B9EDF'}
                    backgroundInactive={'#586075'}
                    style={{
                      elevation: 10,
                    }}
                  />
                ) : null}

                <Text
                  style={[
                    Styles.caption,
                    defectLavelO === defectLavel.red
                      ? styles.defectLavelRed
                      : null,
                    defectLavelO === defectLavel.gray
                      ? styles.defectLavelGrey
                      : null,
                  ]}>
                  {parsedScore[3]}
                </Text>
                <View style={styles.scoreTableDivider} />
                <Text style={Styles.caption}>{parsedThresholds[3]}</Text>
              </View>
            </View>
          </View>

          <View style={styles.close}>
            {defectName ? this.renderDropDowns() : null}
            <Pressable
              onPress={() => {
                goBack();
              }}>
              <Icon.Cross width={ls(65)} height={ls(65)} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  renderDropDowns = () => {
    const {typeMenuVisible, positionMenuVisible} = this.state;
    const {
      camera,
      onTypeChanged,
      onPositionChanged,
      type,
      pos,
      t,
      isThumbnailImage,
    } = this.props;

    // types -> Array with different camera types (IR, VIS)
    let types = new Set();
    camera.frames.forEach((frame) => types.add(frame.type));
    types = Array.from(types);

    // positions -> Array with different camera pos (TOP, FRONT)
    let positions = new Set();
    camera.frames.forEach((frame) => positions.add(frame.pos));
    positions = Array.from(positions);

    return (
      <View style={styles.flexRow}>
        <View style={styles.option}>
          <Text style={Styles.h6}>{t('light_type')}</Text>
          <Pressable
            onPress={this.openTypeMenu}
            style={styles.dropdown}
            disabled={isThumbnailImage}>
            <Text style={Styles.h6}>{type}</Text>
            <MaterialIcon
              name="chevron-down"
              color="white"
              size={isThumbnailImage ? 0 : 20}
            />
          </Pressable>
          <Menu
            visible={typeMenuVisible}
            onDismiss={this.closeTypeMenu}
            contentStyle={styles.menu}
            anchor={{x: 950, y: 50}}>
            {types.map((aType) => (
              <Menu.Item
                key={aType}
                titleStyle={styles.menuItem}
                onPress={() => {
                  onTypeChanged(aType);
                  this.closeTypeMenu();
                }}
                title={aType}
                disabled={isThumbnailImage}
              />
            ))}
          </Menu>
        </View>
        <View style={{...styles.option}}>
          <Text style={{...Styles.h6}}>{t('light_source')}</Text>
          {positions.length > 1 && !isThumbnailImage ? (
            <View style={{flexDirection: 'row', marginHorizontal: 10}}>
              <Text style={{...Styles.h6, marginTop: 2}}>
                {positions[0] === pos
                  ? `  ${positions[0]} `
                  : `  ${positions[1]} `}
              </Text>
              <Switch
                width={60}
                height={30}
                value={pos === positions[0]}
                onSyncPress={(value) => {
                  if (positions[0] === pos) {
                    onPositionChanged(positions[1]);
                  } else {
                    onPositionChanged(positions[0]);
                  }
                }}
                disabled={isThumbnailImage}
                circleColorActive={'#8D8FFA'}
                circleColorInactive={'#757C91'}
                circleStyle={{
                  elevation: 10,
                }}
                backgroundActive={'#7B9EDF'}
                backgroundInactive={'#586075'}
                style={{
                  elevation: 10,
                }}
              />
            </View>
          ) : (
            <View style={{flexDirection: 'row', marginHorizontal: 10}}>
              <Text style={{...Styles.h6, marginTop: 2}}>
                {positions.length > 0 ? positions[0] : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  openTypeMenu = () => this.setState({typeMenuVisible: true});
  closeTypeMenu = () => this.setState({typeMenuVisible: false});
  openPositionMenu = () => this.setState({positionMenuVisible: true});
  closePositionMenu = () => this.setState({positionMenuVisible: false});
}

const styles = ScaledSheet.create({
  header: {
    backgroundColor: AppTheme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 120,
    zIndex: 1,
  },
  headerStart: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 0.98,
  },

  dateAndTimeView: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.input,
    borderRadius: '25@ls',
    paddingHorizontal: '15@ls',
    paddingVertical: '5@ls',
  },
  divider: {
    width: 3,
    height: '25@ls',
    marginStart: '15@ls',
    marginEnd: '15@ls',
    backgroundColor: '#2E2E32',
  },
  close: {
    marginEnd: '15@ls',
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 20,
  },
  dropdown: {
    marginStart: 10,
    marginEnd: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.input,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 100,
    borderRadius: 8,
  },
  menu: {
    width: 100,
    backgroundColor: AppTheme.colors.card,
  },
  menuItem: {
    ...Styles.h6,
    width: 68,
  },
  option: {
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  //Score Table
  scoreTable: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  scoreCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 5,
  },
  scoreTableDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 5,
  },
  defectLavelRed: {
    fontFamily: 'TitilliumWeb-SemiBold',
    fontSize: '12@vs',
    color: 'red',
  },
  defectLavelGrey: {
    fontFamily: 'TitilliumWeb-SemiBold',
    fontSize: '12@vs',
    color: 'grey',
  },
});
const mapStateToProps = ({persisted: {settings}}) => ({
  settings: settings.cameraDefectSettings,
});

const mapDispatchToProps = (dispatch) => ({
  setSettings: (data) => dispatch({type: Actions.SET_SETTINGS, data}),
});

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(CarouselHeader),
);
