import { Constants } from '@data';
import { Actions, Stores } from '@state';
import OriginalAxios, { AxiosRequestConfig } from 'axios';
import i18n from 'i18next';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import { Endpoints } from './Endpoints';
import SmartexService from './SmartexService';
import Base64 from 'react-native-base64';

const Axios = OriginalAxios.create({
  baseURL: Config.BASE_URL,
  timeout: 90000,
});

const refreshToken = async (): Promise<Boolean> => {
  const {refreshToken} = Stores.getState().persisted.session;
  const result = await SmartexService.refreshToken(refreshToken);
  if (result.error) {
    if ([400, 401].includes(result.error.status)) {
      //400 = Invalid refresh token
      //401 = Refresh Token Expired
      Stores.dispatch({
        type: Actions.SET_TOKEN,
        payload: {auth: null, refresh: null},
      });
    }
    return false;
  } else {
    const {access_token, refresh_token} = result.data;
    Stores.dispatch({
      type: Actions.SET_TOKEN,
      payload: {auth: access_token, refresh: refresh_token},
    });
  }
  return true;
};

const reLogin = async (): Promise<Boolean> => {
  const deviceId = DeviceInfo.getUniqueId() + Constants.EMAIL_SUFFIX;
  const macAddress = await DeviceInfo.getMacAddress();
  const password = Base64.encode(macAddress);

  const result = await SmartexService.login(deviceId, password);

  if (result.error) {
    return false;
  }
  const {access_token, refresh_token} = result.data;
  Stores.dispatch({
    type: Actions.SET_TOKEN,
    payload: {auth: access_token, refresh: refresh_token},
  });
  return true;
};

export const safeApiRequest = async (
  requestConfig: AxiosRequestConfig,
  isRetry = false,
): Promise<Result> => {
  try {
    const token = Stores.getState().persisted.session.authToken;
    Axios.defaults.headers.common['Authorization'] = token
      ? `Bearer ${token}`
      : '';
    const response = await Axios.request(requestConfig);
    return {data: response.data};
  } catch (ex) {
    console.log('ex >>>>>', ex);
    const error = {
      status: ex.response?.status ?? null,
      message: i18n.t('something_went_wrong'),
    };
    if (ex.response) {
      console.log('Status code =', ex.response.status);
      console.log(requestConfig.url + ' =', JSON.stringify(ex.response.data));
      if (
        ex.response.status == 401 &&
        requestConfig.url !== Endpoints.LOGIN && requestConfig.url !== Endpoints.REFRESH_TOKEN &&
        !isRetry
      ) {
        const isTokenRefreshed = await refreshToken();
        if (isTokenRefreshed) {
          return await safeApiRequest(requestConfig, true);
        } else if (
          requestConfig.url !== Endpoints.LOGIN
        ) {
          const isreloginSuccess = await reLogin();
          if (isreloginSuccess) {
            return await safeApiRequest(requestConfig, true);
          } else {
            const {username, password} = Stores.getState().persisted.loginCredentials;
            const result = await SmartexService.login(username, password);
            if (result.error) {
              Stores.dispatch({type: Actions.SHOW_SESSION_TIMOUT});
            } else {
              const {access_token, refresh_token} = result.data;
              Stores.dispatch({
                type: Actions.SET_TOKEN,
                payload: {auth: access_token, refresh: refresh_token},
              });
              return await safeApiRequest(requestConfig, true);
            } 
          }
        }
      }

      if (typeof ex.response.data === 'object') {
        error.message = ex.response.data.message;
      }
    } else if (ex.request) {
      console.log('request failed =>', requestConfig.url);
      error.message = i18n.t('internet_error');
    }

    return {error};
  }
};

interface Result {
  data?: any;
  error?: {
    status: number;
    message: string;
  };
}
