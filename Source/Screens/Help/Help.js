import {Button, DropDownPicker, NegativeButton} from '@components';
import {getHelpOptions} from '@data';
import Fonts from '@fonts';
import {
  CopilotManager,
  Events,
  Introductions,
  logAnalytics,
  ls,
  ScaledSheet,
} from '@helpers';
import {Actions} from '@state';
import {AppTheme, CopilotStyle, Styles} from '@themes';
import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {
  Keyboard,
  NativeModules,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  copilot,
  CopilotStep,
  walkthroughable,
} from 'react-native-copilot-fullscreen';
import {Card} from 'react-native-paper';
import RNSmtpMailer from 'react-native-smtp-mailer';
import {connect} from 'react-redux';
import UnlockDialog from './UnlockDialog';

const SENDER_EMAIL = 'smartex.app.customer.service@gmail.com';
const SENDER_PASS = 'UrOnYOKErTIOnstErterskyLveyALArkowPoSecK';
const RECIPENT_EMAILS = 'karan@nickelfox.com'; //comma separated
const {LockTask} = NativeModules;
const CopilotView = walkthroughable(View);
class Help extends Component {
  state = {
    issue: null,
    description: null,
    loading: false,
    registerDialogVisible: false,
    isLocked: false,
  };

  updateIssue = (selected) => {
    this.setState({issue: selected});
  };

  updateDescription = (newValue) => {
    this.setState({description: newValue});
  };

  componentDidMount() {
    //this.showIfIntroductionNeeded();
    LockTask.isLocked()
      .then((isLock) => {
        if (isLock) {
          this.setState({isLocked: true});
        } else {
          this.setState({isLocked: false});
        }
      })
      .catch();
  }

  showIfIntroductionNeeded = async (forced) => {
    if (forced || (await CopilotManager.isNeeded(Introductions.HELP))) {
      this.props.copilotEvents.on('stop', () =>
        CopilotManager.setCompleted(Introductions.HELP),
      );
      this.props.start();
    }
  };

  setToUnlockMode = () => {
    LockTask.stopLockTask();
  };

  render() {
    const {t} = this.props;
    return (
      <Card elevation={AppTheme.elevation} style={Styles.rootCard}>
        <TouchableOpacity
          activeOpacity={1}
          style={{flex: 1}}
          onPress={() => Keyboard.dismiss()}>
          <Text style={Styles.subtitle1}>{t('help')}</Text>
          {/* <FAB
            small
            icon="help"
            style={styles.fab}
            onPress={this.showIfIntroductionNeeded.bind(this, true)}
          /> */}
          <Text style={styles.dropDownHeader}>{t('facing_issue')}</Text>
          <CopilotStep
            key={t('step_dropdown')}
            text={t('step_dropdown')}
            order={1}
            name="step_dropdown">
            <CopilotView style={styles.dummyDropDownView} />
          </CopilotStep>
          <DropDownPicker
            items={getHelpOptions(t)}
            arrowSize={ls(38)}
            arrowColor="white"
            dropDownMaxHeight={ls(270)}
            defaultValue={this.state.issue?.value}
            placeholder={t('choose_problem')}
            onChangeItem={this.updateIssue}
            placeholderStyle={styles.placeHolder}
            dropDownStyle={styles.dropDown}
            itemStyle={styles.dropDownItem}
            labelStyle={styles.dropDownLabel}
            containerStyle={styles.dropDownContainer}
            style={styles.dropDownField}
          />
          <CopilotStep
            key={t('step_description')}
            text={t('step_description')}
            order={2}
            name="step_description">
            <CopilotView style={{flex: 1, marginTop: ls(30)}}>
              <View style={styles.descriptionContainer}>
                <Text style={Styles.subtitle2}>{t('description')}</Text>
                <Text style={styles.regularSubtitle}>{t('optional')}</Text>
              </View>
              <TextInput
                multiline
                style={styles.description}
                value={this.state.description}
                onChangeText={this.updateDescription}
              />
            </CopilotView>
          </CopilotStep>
          <View style={styles.buttonsContainer}>
            {this.state.isLocked ? (
              <View>
                <NegativeButton
                  style={{marginEnd: ls(22)}}
                  onPress={() => this.setState({registerDialogVisible: true})}>
                  {t('UnlockDevice')}
                </NegativeButton>
              </View>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                flex: 1,
              }}>
              <NegativeButton
                style={{marginEnd: ls(22)}}
                onPress={() => this.props.navigation.goBack()}>
                {t('cancel')}
              </NegativeButton>
              <CopilotStep
                key={t('step_submit')}
                text={t('step_submit')}
                order={3}
                name="step_submit">
                <CopilotView>
                  <Button
                    loading={this.state.loading}
                    disabled={this.state.loading}
                    onPress={this.sendMail}>
                    {t('submit')}
                  </Button>
                </CopilotView>
              </CopilotStep>
            </View>
          </View>
          <UnlockDialog
            visible={this.state.registerDialogVisible}
            onDismiss={() => this.setState({registerDialogVisible: false})}
            onSubmit={() => {
              this.setState({registerDialogVisible: false, isLocked: false});
              this.setToUnlockMode();
            }}
          />
        </TouchableOpacity>
      </Card>
    );
  }

  sendMail = async () => {
    const {t} = this.props;
    if (!this.state.issue) {
      this.props.showSnackbar(t('select_issue_message'));
      return;
    }
    this.setState({loading: true});
    try {
      const result = await RNSmtpMailer.sendMail({
        mailhost: 'smtp.gmail.com',
        port: '465',
        ssl: true,
        username: SENDER_EMAIL,
        password: SENDER_PASS,
        from: SENDER_PASS,
        recipients: RECIPENT_EMAILS,
        subject: t('email_subject'),
        htmlBody: this.getEmailBody(),
        attachmentPaths: [],
        attachmentNames: [],
        attachmentTypes: [],
      });
      if (result) {
        this.setState({loading: false});
        this.props.showSnackbar(t('issue_report_success'));
        this.props.navigation.goBack();
      }
    } catch (e) {
      this.setState({loading: false});
      this.props.showSnackbar(t('issue_report_failure'));
    }
  };

  getEmailBody = () => {
    const {issue, description} = this.state;
    logAnalytics(
      Events.REPORT_ISSUE,
      `sending email ragarding issue "${issue.label}"`,
    );
    return `<p>
    This email is generated to report issue titled <b>
    ${issue.label}
    </b> with the machine <b>${this.props.machine}</b> of factory <b>
    ${this.props.factory}.</b></p>
    <p>${
      description
        ? `Description provided along with this issue is <b>${description}</b>`
        : 'No Description has been provided'
    }
    </p>
    `;
  };
}

const styles = ScaledSheet.create({
  regularSubtitle: {
    ...Styles.subtitle2,
    fontFamily: Fonts.regular,
  },
  placeHolder: {
    ...Styles.h4,
    color: AppTheme.colors.placeholder,
  },
  dropDownHeader: {
    ...Styles.subtitle2,
    marginTop: '36@vs',
  },
  dummyDropDownView: {
    height: '120@vs',
    top: '70@vs',
    position: 'absolute',
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '48@ls',
    marginBottom: '8@ls',
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
    height: '72@ls',
    marginTop: '8@ls',
  },
  description: {
    flex: 1,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 5,
    padding: '16@ls',
    fontSize: '24@ls',
    color: 'white',
    fontFamily: Fonts.semiBold,
    marginTop: '8@ls',
    textAlignVertical: 'top',
  },
  descriptionContainer: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

const mapStateToProps = ({persisted}) => {
  return {
    machine: persisted.machine,
    factory: persisted.factory,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(copilot(CopilotStyle)(Help)),
);
