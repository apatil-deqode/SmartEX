import DbHelper from '@db';
import CoreServiceAPIService from '../../Services/CoreServiceAPIService';
import {Actions} from './Actions';

export const deleteDefects = async () => {
  await DbHelper.clearFeedsAndImages();
};

export const disableStoppageState = async (dispatch, getState) => {
  dispatch({type: Actions.SHOW_PROGRESS_BAR});

  let newSettings = getState().persisted.settings;
  newSettings.stoppage_state = false;

  const coreServiceAPIService = new CoreServiceAPIService();
  const compatibilityStatus = await coreServiceAPIService.disableMachineStoppage();
  coreServiceAPIService.sendSettings(newSettings); // Async Call -> not checking the return value to make it faster

  dispatch({type: Actions.HIDE_PROGRESS_BAR});

  if (!compatibilityStatus) {
    const message = i18n.t('disable_machine_error');
    dispatch({type: Actions.NOTIFY, message});
    return status;
  }

  dispatch({type: Actions.SET_STOPPAGE_STATE, stoppage_state: false});
};

export const enableStoppageState = async (dispatch, getState) => {
  dispatch({type: Actions.SHOW_PROGRESS_BAR});

  let newSettings = getState().persisted.settings;
  newSettings.stoppage_state = true;

  const coreServiceAPIService = new CoreServiceAPIService();
  const compatibilityStatus = await coreServiceAPIService.enableMachineStoppage();

  // Don't need to call the sendSettings since navigating to the Home.js already calls the sendSettings on mount
  // coreServiceAPIService.sendSettings(newSettings); // Async Call -> not checking the return value to make it faster

  dispatch({type: Actions.HIDE_PROGRESS_BAR});

  if (!compatibilityStatus) {
    const message = i18n.t('disable_machine_error');
    dispatch({type: Actions.NOTIFY, message});
    return status;
  }

  dispatch({type: Actions.SET_STOPPAGE_STATE, stoppage_state: true});
};
