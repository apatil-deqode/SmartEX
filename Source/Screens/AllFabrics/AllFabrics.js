import {Button, CustomFlatList, NegativeButton} from '@components';
import {Constants} from '@data';
import {
  CopilotManager,
  Events,
  Introductions,
  logAnalytics,
  ls,
  ScaledSheet,
} from '@helpers';
import Icon from '@icons';
import {SmartexService, CoreServiceAPIService} from '@services';
import {Actions} from '@state';
import {AppTheme, CopilotStyle, Styles} from '@themes';
import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {
  copilot,
  CopilotStep,
  walkthroughable,
} from 'react-native-copilot-fullscreen';
import Orientation from 'react-native-orientation';
import {
  Button as OutlinedButton,
  Card,
  TouchableRipple,
  Dialog,
} from 'react-native-paper';
import {connect} from 'react-redux';
import FabricSectionList from './FabricSectionList';
import ProducingNumberDialog from './ProducingNumberDialog';

const CopilotView = walkthroughable(View);

class AllFabrics extends Component {
  constructor(props) {
    super();

    this.state = {
      loading: false,
      selectedIdx: 0,
      errorMessage: null,
      producingDialogVisible: false,
      portrait: Orientation.getInitialOrientation() === Constants.PORTRAIT,
      wholeHeight: 1,
      visibleHeight: 0,
    };
  }
  findSelectedFabric = (arrFabrics) => {
    const {selectedFabricId} = this.props;
    let foundIdx = 0;
    if (selectedFabricId && arrFabrics?.length > 0) {
      foundIdx = arrFabrics.findIndex(
        (fabric) => fabric?.id === selectedFabricId,
      );
    }
    if (foundIdx === -1) {
      foundIdx = 0;
    }
    this.setState({
      selectedIdx: foundIdx,
    });
  };
  getFabricList = async () => {
    logAnalytics(Events.GET_FABRIC_LIST, 'getting fabric list...');
    this.setState({loading: true, errorMessage: null});
    const response = await SmartexService.getFabricList();
    if (response.error) {
      this.setState({
        errorMessage: response.error.message,
        loading: false,
      });
    } else {
      this.findSelectedFabric(response.data);
      this.props.saveFabricData(response.data);
      this.setState({
        errorMessage: null,
        loading: false,
      });
      //this.showIfIntroductionNeeded();
    }
  };

  updateOrientation = (orientation) => {
    this.setState({portrait: Constants.PORTRAIT === orientation});
  };

  componentDidMount() {
    this.getFabricList();
    const {fabrics} = this.props;
    this.findSelectedFabric(fabrics);
    Orientation.addOrientationListener(this.updateOrientation);
  }

  showIfIntroductionNeeded = async (forced) => {
    if (forced || (await CopilotManager.isNeeded(Introductions.ALL_FABRICS))) {
      this.props.copilotEvents.on('stop', () =>
        CopilotManager.setCompleted(Introductions.ALL_FABRICS),
      );
      this.props.start();
    }
  };

  componentWillUnmount() {
    Orientation.removeOrientationListener(this.updateOrientation);
  }

  selectFabric = async () => {
    const {fabrics, producingNumber} = this.props;
    const {selectedIdx} = this.state;
    const fabric = fabrics[selectedIdx];
    // logAnalytics(
    //   Events.CUT_ROLL_REQUEST,
    //   `Cutting roll with Fabric id:${
    //     fabric.id
    //   } Time:${Date.now()} Producing Number:${this.props.producingNumber}`,
    // );

    /*
    const coreServiceAPIService = new CoreServiceAPIService();
    const result = await coreServiceAPIService.cutRoll(
      fabric.id,
      Date.now(),
      this.props.producingNumber,
    );
    if (!result) {
      // TODO: Error accoured. Basic error already handeled in API service
    } */
    const coreServiceAPIService = new CoreServiceAPIService();
    coreServiceAPIService.cutRoll(fabric.id, Date.now(), producingNumber);

    this.props.setLiveFeed();
    this.props.setFabric(fabric);
    this.props.navigation.pop();
  };

  renderActionButtons = () => {
    const {t} = this.props;
    const {fabrics, cutRollUpdating} = this.props;

    return (
      <View style={styles.buttonsContainer}>
        <NegativeButton
          onPress={() => this.props.navigation.goBack()}
          contentStyle={styles.button}
          labelStyle={Styles.h2}>
          {t('cancel')}
        </NegativeButton>
        <CopilotStep text={t('step_continue')} order={4} name="step_continue">
          <CopilotView style={{marginStart: ls(22)}}>
            {fabrics.length === 0 ? null : (
              <Button
                disabled={cutRollUpdating}
                labelStyle={Styles.h2}
                contentStyle={styles.button}
                onPress={this.selectFabric}>
                {t('continue')}
              </Button>
            )}
          </CopilotView>
        </CopilotStep>
      </View>
    );
  };

  renderAddFabricBtn = () => {
    const {t} = this.props;
    return (
      <OutlinedButton
        mode="outlined"
        uppercase={false}
        color={AppTheme.colors.accent}
        style={styles.addFabricContainer}
        contentStyle={styles.addFabric}
        labelStyle={Styles.subtitle2}
        icon={() => (
          <Icon.Add
            width={ls(27)}
            height={ls(29)}
            color={AppTheme.colors.accent}
          />
        )}
        onPress={() => {
          logAnalytics(Events.ADD_FABRIC_BUTTON, 'Add fabric called');
          this.props.navigation.navigate('addFabric', {
            refresh: this.refresh,
          });
        }}>
        {t('add_fabric')}
      </OutlinedButton>
    );
  };

  refresh = () => {
    this.getFabricList();
  };

  renderListEmpty = () => {
    const {t} = this.props;
    const {loading, errorMessage} = this.state;
    if (loading) {
      return (
        <ActivityIndicator
          color={AppTheme.colors.accent}
          size={ls(60)}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{marginBottom: '10%'}}
        />
      );
    } else if (errorMessage) {
      return (
        <>
          <Text style={Styles.h5}>{errorMessage}</Text>
          <TouchableRipple
            borderless
            onPress={this.getFabricList}
            style={styles.ripple}>
            <Icon.Retry />
          </TouchableRipple>
        </>
      );
    } else {
      return <Text style={Styles.h5}>{t('no_fabrics')}</Text>;
    }
  };

  render = () => {
    const {fabrics} = this.props;
    const {portrait, selectedIdx, producingDialogVisible} = this.state;
    const {t, navigation} = this.props;
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{flex: 1}}>
        {this.renderListHeader()}
        <Card elevation={AppTheme.elevation} style={styles.card}>
          <ScrollView style={{flex: 1}}>
            <View style={{paddingVertical: 8}}>
              <View style={{flexDirection: 'row'}}>
                <Icon.favoriteFillIcon height={20} width={20} />
                <Text style={{...Styles.h6, marginBottom: 5}}> FAVORITOS </Text>
              </View>
              <FabricSectionList
                fabrics={[...fabrics, ...fabrics]}
                t={t}
                visibleHeight={this.state.visibleHeight}
                wholeHeight={this.state.wholeHeight}
                loading={this.state.loading}
                errorMessage={this.state.errorMessage}
              />
            </View>
            <View style={{paddingVertical: 8}}>
              <View style={{flexDirection: 'row'}}>
                <Icon.clockIconWhite height={20} width={20} />
                <Text style={{...Styles.h6, marginBottom: 5}}> RECENTES </Text>
              </View>
              <FabricSectionList
                fabrics={[...fabrics, ...fabrics, ...fabrics]}
                t={t}
                visibleHeight={this.state.visibleHeight}
                wholeHeight={this.state.wholeHeight}
                loading={this.state.loading}
                errorMessage={this.state.errorMessage}
              />
            </View>
            <View style={{paddingVertical: 8}}>
              <View style={{flexDirection: 'row'}}>
                {/* <Icon.favoriteFillIcon height={20} width={20} /> */}
                <Text style={{...Styles.h6, marginBottom: 5}}>
                  {' '}
                  TODAS AS MALHAS{' '}
                </Text>
              </View>
              <FabricSectionList
                fabrics={[...fabrics, ...fabrics]}
                t={t}
                visibleHeight={this.state.visibleHeight}
                wholeHeight={this.state.wholeHeight}
                loading={this.state.loading}
                errorMessage={this.state.errorMessage}
              />
            </View>
            {this.renderActionButtons()}
          </ScrollView>

          <ProducingNumberDialog
            name={fabrics[this.state.selectedIdx]?.name}
            navigation={navigation}
            visible={producingDialogVisible}
            onDismiss={this.dismissProducingDialog}
          />
          <Dialog
            visible={this.props.fabricDetail.isOpenDialog}
            onDismiss={() => this.props.setFabricDetail()}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{alignSelf: 'center', width: '60%'}}>
            <Card style={{overflow: 'hidden'}}>
              <View style={styles.detailsDialog}>
                <View style={styles.row}>
                  <Text style={Styles.h5}>FABRIC DETAILS</Text>
                  <TouchableOpacity
                    onPress={() => this.props.setFabricDetail()}>
                    <Icon.exitXIconWhite height={20} width={20} />
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.innerView,
                    {
                      marginVertical: 40,
                    },
                  ]}>
                  <View style={[styles.row, {marginBottom: 10}]}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                  </View>
                </View>
                <Text style={Styles.h6}>YARNS LIST</Text>
                <View
                  style={[
                    styles.innerView,
                    {
                      marginVertical: 10,
                    },
                  ]}>
                  <View style={[styles.row, {marginBottom: 10}]}>
                    <View style={{alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text style={Styles.h7}> FABRIC NAME: </Text>
                      <Text style={Styles.caption2}>test</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
            {/* <ConfirmationDialog
                title={t('reset_all')}
                subtitle={t('reset_message')}
                onPressPositive={() => {
                  this.onResetValue();
                  this.setState({visible: false});
                }}
                onPressNegative={() => {
                  this.setState({visible: false});
                }}
              /> */}
          </Dialog>
        </Card>
      </View>
    );
  };

  dismissProducingDialog = () => this.setState({producingDialogVisible: false});

  renderListHeader = () => {
    const {producingNumber, t} = this.props;
    const {portrait} = this.state;
    return (
      <View
        style={[
          styles.header,
          {
            flexDirection: portrait ? 'column' : 'row',
            alignItems: portrait ? 'flex-start' : 'center',
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon.fabricIconWhite width={ls(30)} height={ls(30)} />
          <Text style={[Styles.subtitle1, {marginLeft: 10}]}>
            {t('all_fabric')}
          </Text>
        </View>
        {this.state.loading ? null : (
          <View style={styles.headerContent}>
            <CopilotStep
              key={t('step_producing_number')}
              text={t('step_producing_number')}
              order={1}
              name="step_producing_number">
              <CopilotView>
                <TouchableOpacity
                  style={styles.poContainer}
                  onPress={() => this.setState({producingDialogVisible: true})}>
                  <Text style={styles.producingNumberLabel}>
                    {t('producing_number')}:
                  </Text>
                  <View style={styles.input}>
                    <Text numberOfLines={1} style={styles.producingNumber}>
                      {producingNumber ? '# ' + producingNumber : null}
                    </Text>
                    {this.props.producingNumber ? (
                      <TouchableOpacity
                        onPress={this.resetProducingNumber}
                        style={styles.reset}>
                        <Icon.Delete width={ls(22)} height={ls(29)} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </CopilotView>
            </CopilotStep>
            <CopilotStep
              key={t('step_add_fabric')}
              text={t('step_add_fabric')}
              order={2}
              name="step_add_fabric">
              <CopilotView style={{marginStart: ls(22)}}>
                {this.renderAddFabricBtn()}
              </CopilotView>
            </CopilotStep>
            {/* <FAB
              small
              icon="help"
              style={styles.fab}
              onPress={this.showIfIntroductionNeeded.bind(this, true)}
            /> */}
          </View>
        )}
      </View>
    );
  };

  resetProducingNumber = async () => {
    logAnalytics(
      Events.UPDATE_PRODUCING_NUMBER,
      'Resetting producing number to null',
    );
    this.props.setProducingNumber(null);
  };
}

const styles = ScaledSheet.create({
  card: {
    margin: '15@ls',
    flex: 1,
    padding: '25@ls',
  },
  header: {
    justifyContent: 'space-between',
    padding: '16@ls',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '24@ls',
    paddingBottom: '2@ls',
  },
  listFooter: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  emptyListContainer: {
    marginTop: '32@ls',
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: AppTheme.colors.input,
    borderRadius: '8@ls',
    padding: '16@ls',
    minWidth: '180@ls',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  producingNumberLabel: {
    ...Styles.h5,
    marginEnd: 16,
  },
  producingNumber: {
    maxWidth: '300@ls',
    ...Styles.body1,
    color: 'white',
  },
  addFabric: {
    minWidth: '180@ls',
    height: '72@ls',
  },
  addFabricContainer: {
    borderColor: AppTheme.colors.accent,
  },
  ripple: {
    borderRadius: '50@ls',
    marginTop: '30@ls',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStyle: {
    flexGrow: 1,
  },
  button: {
    height: '120@vs',
    minWidth: '22%',
  },
  reset: {
    marginTop: 2,
    marginStart: '16@ls',
  },
  fab: {
    marginStart: 16,
  },

  //Details

  detailsDialog: {
    padding: 20,
    backgroundColor: '#717EF1',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  innerView: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    padding: 10,
  },
});

const mapStateToProps = ({persisted, auth, home}) => {
  return {
    producingNumber: persisted.producingNumber,
    selectedFabricId: persisted.selectedFabric?.id,
    fabrics: persisted.allFabrics,
    cutRollUpdating: auth.cutRollUpdating,
    fabricDetail: home.fabricDetail,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setFabric: (fabric) =>
      dispatch({type: Actions.SET_SELECTED_FABRIC, fabric}),
    setProducingNumber: (number) =>
      dispatch({type: Actions.SET_PRODUCING_NUMBER, data: number}),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    setLiveFeed: () => dispatch({type: Actions.EMPTY_LIVE_FEED}),
    resetToken: (number) =>
      dispatch({type: Actions.SET_TOKEN, payload: {auth: null, refresh: null}}),
    saveFabricData: (fabrics) =>
      dispatch({type: Actions.ALL_FABRICS, payload: fabrics}),
    setFabricDetail: () =>
      dispatch({
        type: Actions.FABRIC_DETAIL_DIALOG,
        data: {
          isOpenDialog: false,
          fabricData: null,
        },
      }),
  };
};

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(copilot(CopilotStyle)(AllFabrics)),
);
