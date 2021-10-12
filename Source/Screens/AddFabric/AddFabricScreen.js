import React, {Component} from 'react';
import {Text, View, ActivityIndicator, TouchableOpacity} from 'react-native';
import {
  CopilotStep,
  walkthroughable,
  copilot,
} from 'react-native-copilot-fullscreen';
import Orientation from 'react-native-orientation';
import {Card, FAB} from 'react-native-paper';
import {connect} from 'react-redux';
import {
  logAnalytics,
  ScaledSheet,
  ls,
  Events,
  Introductions,
  CopilotManager,
} from '@helpers';
import {AppTheme, CopilotStyle, Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import {
  InputField,
  FormPicker,
  Button,
  NegativeButton,
  CustomScrollview,
} from '@components';
import {SmartexService} from '@services';
import {Actions} from '@state';
import Icon from '@icons';
import AddEditYarn from '../AddEditYarn/AddEditYarn';
import YarnListItem from './YarnListItem';

const CopilotView = walkthroughable(View);

class AddFabricScreen extends Component {
  state = {
    loading: false,
    createFabricLoading: false,
    errorMessage: null,
    name: '',
    structure: null,
    yarns: [],
    nameError: false,
    structureError: false,
    structures: [],
    showAddYarn: false,
    wholeHeight: 1,
    visibleHeight: 0,
    yarnOptions: {
      units: [],
      colors: [],
      types: [],
    },
    selectedYarn: {
      values: {
        unit: null,
        color: null,
        type: null,
        density: null,
        multiplier: null,
      },
      errors: {
        type: false,
        color: false,
        density: false,
        unit: false,
        multiplier: false,
      },
    },
  };

  componentDidMount() {
    this.fetchData();
    Orientation.lockToLandscape();
    //this.showIfIntroductionNeeded();
  }

  showIfIntroductionNeeded = async (forced) => {
    if (
      forced ||
      (await CopilotManager.isNeeded(Introductions.CREATE_FABRIC))
    ) {
      this.props.copilotEvents.on('stop', () =>
        CopilotManager.setCompleted(Introductions.CREATE_FABRIC),
      );
      this.props.start();
    }
  };

  componentWillUnmount() {
    Orientation.unlockAllOrientations();
  }

  render() {
    const {selectedYarn} = this.state;
    const {t} = this.props;
    return (
      <>
        <AddEditYarn
          visible={this.state.showAddYarn}
          values={selectedYarn.values}
          errors={selectedYarn.errors}
          options={this.state.yarnOptions}
          createYarn={this.createYarn}
          createType={this.createType}
          createColor={this.createColor}
          selectOption={this.selectOption}
          onDismiss={this.hideYarnDialog}
        />
        <Card elevation={AppTheme.elevation} style={styles.card}>
          <Text style={Styles.subtitle1}>{t('add_new_fabric')}</Text>
          {this.state.loading ? (
            this.renderLoading()
          ) : (
            <>
              {this.renderContent()}
              {/* <FAB
                small
                icon="help"
                style={styles.fab}
                onPress={this.showIfIntroductionNeeded.bind(this, true)}
              /> */}
            </>
          )}
          {this.renderActionButtons()}
        </Card>
      </>
    );
  }

  renderLoading() {
    return (
      <View style={styles.centeredAndExpanded}>
        <ActivityIndicator color={AppTheme.colors.accent} size={ls(60)} />
      </View>
    );
  }

  renderContent() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.centeredAndExpanded}>
          <Text style={Styles.h4}>{this.state.errorMessage}</Text>
          <TouchableOpacity
            onPress={this.fetchData}
            style={{marginTop: ls(22)}}>
            <Icon.Retry />
          </TouchableOpacity>
        </View>
      );
    }

    const {t} = this.props;
    return (
      <>
        <View style={styles.fabricDetails}>
          <CopilotStep
            key={t('step_fabric_name')}
            text={t('step_fabric_name')}
            order={1}
            name="step_fabric_name">
            <InputField
              label={t('fabric_name')}
              style={{flex: 1}}
              value={this.state.name}
              error={this.state.nameError}
              onChangeText={this.setName}
            />
          </CopilotStep>
          <CopilotStep
            key={t('step_fabric_structure')}
            text={t('step_fabric_structure')}
            order={2}
            name="step_fabric_structure">
            <CopilotView style={styles.dummyStruture} />
          </CopilotStep>
          <FormPicker
            searchable={true}
            style={styles.structure}
            label={t('fabric_structure')}
            items={this.state.structures}
            showError={this.state.structureError}
            defaultValue={this.state.structure?.value}
            searchablePlaceholder={t('search_structure')}
            onChangeItem={this.selectStructure}
            onPressCreate={this.createStructure}
          />
        </View>
        <View style={styles.header}>
          <Text style={Styles.subtitle1}>{t('yarns_list')}</Text>
          <CopilotStep
            key={t('step_add_new_yarn')}
            text={t('step_add_new_yarn')}
            order={3}
            name="step_add_new_yarn">
            <CopilotView>
              <TouchableOpacity onPress={this.createNewYarn}>
                <View style={styles.addYarn}>
                  <Icon.Add
                    width={ls(27)}
                    height={ls(29)}
                    style={{marginEnd: ls(8)}}
                    color={AppTheme.colors.accent}
                  />
                  <Text style={Styles.subtitle2}>{t('add_yarn')}</Text>
                </View>
              </TouchableOpacity>
            </CopilotView>
          </CopilotStep>
        </View>
        <View style={styles.divider} />
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{t('type')}</Text>
          <Text style={styles.label}>{t('color')}</Text>
          <Text style={styles.label}>{t('density')}</Text>
          <Text style={styles.label}>{t('units')}</Text>
          <Text style={styles.label}>{t('multiplier')}</Text>
          <View style={{width: ls(230)}} />
        </View>
        {this.renderYarnsList()}
      </>
    );
  }

  renderYarnsList() {
    const {yarns} = this.state;
    const {t} = this.props;
    return (
      <CopilotStep
        key={t('step_yarn_list')}
        text={t('step_yarn_list')}
        order={4}
        name="step_yarn_list">
        <CopilotView style={{flex: 1}}>
          <CustomScrollview
            visibleHeight={this.state.visibleHeight}
            wholeHeight={this.state.wholeHeight}
            updateVisibleHeight={(height) =>
              this.setState({visibleHeight: height})
            }
            updateWholeHeight={(height) => this.setState({wholeHeight: height})}
            listSize={yarns.length}
            persistentScrollbar
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollView}>
            {yarns.length === 0 ? (
              <View style={styles.centeredAndExpanded}>
                <Text style={Styles.h5}>{t('no_yarns')}</Text>
              </View>
            ) : (
              yarns.map((yarn, index) => {
                return (
                  <YarnListItem
                    editable
                    key={index}
                    item={yarn}
                    first={index === 0}
                    last={index === yarns.length - 1}
                    onDelete={() => this.removeYarn(index)}
                    moveItemUp={() => this.moveYarnUp(index)}
                    moveItemDown={() => this.moveYarnDown(index)}
                    onEdit={() => this.editYarn(index)}
                  />
                );
              })
            )}
          </CustomScrollview>
        </CopilotView>
      </CopilotStep>
    );
  }

  renderActionButtons() {
    const {t} = this.props;
    return (
      <View style={styles.buttonsContainer}>
        <NegativeButton onPress={() => this.props.navigation.pop()}>
          {t('cancel')}
        </NegativeButton>
        {this.state.loading || this.state.errorMessage ? null : (
          <CopilotStep
            key={t('step_create')}
            text={t('step_create')}
            order={5}
            name="step_create">
            <CopilotView style={{marginStart: ls(22)}}>
              <Button
                onPress={this.createFabric}
                loading={this.state.createFabricLoading}>
                {t('submit')}
              </Button>
            </CopilotView>
          </CopilotStep>
        )}
      </View>
    );
  }

  setName = (name) => this.setState({name: name, nameError: false});

  createNewYarn = () => {
    this.setState({showAddYarn: true});
  };

  addUpdateYarn = (yarn) => {
    this.setState({
      yarns: [...this.state.yarns, yarn],
    });
    this.hideYarnDialog();
  };

  hideYarnDialog = () => {
    this.setState({
      showAddYarn: false,
      selectedYarn: {
        values: {
          type: null,
          color: null,
          density: null,
          unit: null,
          multiplier: null,
        },
        errors: {
          type: false,
          color: false,
          density: false,
          unit: false,
          multiplier: false,
        },
      },
    });
  };

  removeYarn = (idx) => {
    const yarns = [...this.state.yarns];
    yarns.splice(idx, 1);
    this.setState({yarns: yarns});
  };

  editYarn = (idx) => {
    const yarn = this.state.yarns[idx];
    this.setState((state) => ({
      showAddYarn: true,
      selectedYarn: {
        ...state.selectedYarn,
        values: {
          ...yarn,
          index: idx,
        },
      },
    }));
  };

  moveYarnUp = (idx) => {
    const yarns = [...this.state.yarns];
    yarns.splice(idx - 1, 0, yarns.splice(idx, 1)[0]);
    this.setState({yarns: yarns});
  };

  moveYarnDown = (idx) => {
    const yarns = [...this.state.yarns];
    yarns.splice(idx + 1, 0, yarns.splice(idx, 1)[0]);
    this.setState({yarns: yarns});
  };

  createFabric = async () => {
    const {name, structure, yarns} = this.state;
    const {t} = this.props;

    const stateUpdate = {};
    if (name === '') {
      stateUpdate.nameError = true;
    }
    if (!structure) {
      stateUpdate.structureError = true;
    }
    if (Object.keys(stateUpdate).length > 0) {
      this.setState(stateUpdate);
      return;
    }

    if (yarns.length === 0) {
      this.props.showSnackbar(t('yarns_error'));
      return;
    }

    const fabric = {
      name,
      idStructure: 1,
      factoryId: this.props.device.factory,
      yarns: yarns.map((yarn, index) => {
        return {
          index: index,
          idYarnType: yarn.type.value,
          idColor: yarn.color.value,
          density: yarn.density,
          idDenstityUnit: yarn.unit.value,
          multiplier: yarn.multiplier,
        };
      }),
    };
    this.setState({createFabricLoading: true});

    const result = await SmartexService.createFabric(fabric);
    if (result.error) {
      this.props.showSnackbar(result.error.message);
      this.setState({createFabricLoading: false});
    } else {
      logAnalytics(Events.CREATE_FABRIC, `fabric created: "${name}"`);
      this.setState({createFabricLoading: false});
      this.props.route.params.refresh();
      this.props.navigation.pop();
    }
  };

  fetchData = async () => {
    this.setState({loading: true, errorMessage: null});
    logAnalytics(Events.GET_YARN_DATA, 'fetching yarn data...');
    const results = await Promise.all([
      SmartexService.getStructures(),
      SmartexService.getDensityUnits(),
      SmartexService.getColorList(),
      SmartexService.getYarnTypes(),
    ]);

    for (const result of results) {
      if (result.error) {
        this.setState({loading: false, errorMessage: result.error.message});
        return;
      }
    }

    const mapToPickerItem = (item) => ({
      label: item.name,
      value: item.id,
    });

    this.setState({
      loading: false,
      structures: results[0].data.map(mapToPickerItem),
      yarnOptions: {
        units: results[1].data.map(mapToPickerItem),
        colors: results[2].data.map(mapToPickerItem),
        types: results[3].data.map(mapToPickerItem),
      },
    });
  };

  createStructure = async (name) => {
    const result = await SmartexService.createStructure(name);
    if (result.error) {
      this.props.showSnackbar(result.error.message);
    } else {
      logAnalytics(Events.CREATE_STRUCTURE, `structure created: "${name}"`);
      const structure = {label: name, value: result.data.id};
      this.setState((state) => ({
        structures: [...state.structures, structure],
        structure: structure,
      }));
    }
  };

  selectStructure = (value) => {
    this.setState({structure: value, structureError: false});
  };

  createYarn = () => {
    const values = this.state.selectedYarn.values;
    const errors = {};
    for (const key in values) {
      if (key !== 'index' && !values[key]) {
        errors[key] = true;
      }
    }
    for (const key in errors) {
      if (errors[key]) {
        const selectedYarn = {...this.state.selectedYarn};
        selectedYarn.errors = errors;
        this.setState({selectedYarn: selectedYarn});
        return;
      }
    }

    logAnalytics(Events.CREATE_NEW_YARN, 'Creating new yarn');
    const yarns = [...this.state.yarns];
    if (values.index !== undefined) {
      yarns[values.index] = values;
    } else {
      yarns.push(values);
    }
    this.setState({yarns: yarns});
    this.hideYarnDialog();
  };

  createType = async (name) => {
    const result = await SmartexService.createYarnType(name);
    if (result.error) {
      this.props.showSnackbar(result.error.message);
    } else {
      logAnalytics(Events.CREATE_YARN_TYPE, `type created: "${name}"`);
      const type = {label: name, value: result.data.id};
      this.setState((state) => ({
        yarnOptions: {
          ...state.yarnOptions,
          types: [...state.yarnOptions.types, type],
        },
        selectedYarn: {
          ...state.selectedYarn,
          values: {
            ...state.selectedYarn.values,
            type: type,
          },
        },
      }));
    }
  };

  createColor = async (name) => {
    const result = await SmartexService.createColor(name);
    if (result.error) {
      this.props.showSnackbar(result.error.message);
    } else {
      const color = {label: name, value: result.data.id};
      logAnalytics(Events.CREATE_COLOR, `color created: "${name}"`);
      this.setState((state) => ({
        yarnOptions: {
          ...state.yarnOptions,
          colors: [...state.yarnOptions.colors, color],
        },
        selectedYarn: {
          ...state.selectedYarn,
          values: {
            ...state.selectedYarn.values,
            color: color,
          },
        },
      }));
    }
  };

  selectOption = (key, value) => {
    const selectedYarn = this.state.selectedYarn;
    const newYarn = {...selectedYarn};
    newYarn.values[key] = value;
    newYarn.errors[key] = false;
    this.setState({
      selectedYarn: newYarn,
    });
  };
}

const styles = ScaledSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    margin: '15@ls',
    paddingHorizontal: '25@ls',
    paddingVertical: '16@ls',
  },
  fabricDetails: {
    flexDirection: 'row',
    marginTop: '12@ls',
  },
  structure: {
    flex: 1,
    marginStart: '22@ls',
  },
  dummyStruture: {
    width: '50%',
    position: 'absolute',
    end: 0,
    height: '130@vs',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '24@ls',
    paddingBottom: '2@ls',
  },
  addYarn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '22@ls',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#32343C',
  },
  label: {
    ...Styles.subtitle2,
    fontSize: '24@ls',
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    paddingTop: '16@ls',
    paddingBottom: '8@ls',
  },
  centeredAndExpanded: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

const mapStateToProps = ({persisted}) => {
  return {
    device: persisted.device,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  };
};

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(copilot(CopilotStyle)(AddFabricScreen)),
);
