import {Stores} from '@state';
import {Endpoints} from './Endpoints';
import {safeApiRequest} from './NetworkManager';

class Smartex {
  login = async (email, password) =>
    safeApiRequest({
      url: Endpoints.LOGIN,
      data: {email, password},
      method: 'post',
    });

  refreshToken = async (refreshToken) =>
    safeApiRequest({
      url: Endpoints.REFRESH_TOKEN,
      data: {refreshToken},
      method: 'post',
    });

  createYarnType = async (name) =>
    safeApiRequest({url: Endpoints.YARN_TYPES, data: {name}, method: 'post'});

  createColor = async (name) =>
    safeApiRequest({url: Endpoints.COLORS, data: {name}, method: 'post'});

  createStructure = async (name) =>
    safeApiRequest({url: Endpoints.STRUCTURES, data: {name}, method: 'post'});

  createFabric = async (fabric) =>
    safeApiRequest({url: Endpoints.FABRICS, data: fabric, method: 'post'});

  getDefects = async (page = 1) => {
    const {machine, factory} = Stores.getState().persisted.device;
    return safeApiRequest({
      url: Endpoints.DEFECTS,
      params: {
        factory: factory,
        machine: machine,
        page: page,
        perPage: 25,
      },
    });
  };

  getFabricList = async () => {
    const {factory} = Stores.getState().persisted.device;
    return safeApiRequest({
      url: Endpoints.FABRIC_LIST,
      params: {
        factory: factory,
        withYarns: true,
        withStructures: true,
        withDensityUnit: true,
      },
    });
  };

  getDensityUnits = async () => safeApiRequest({url: Endpoints.DENSITY_UNITS});

  getColorList = async () => safeApiRequest({url: Endpoints.COLORS});

  getYarnTypes = async () => safeApiRequest({url: Endpoints.YARN_TYPES});

  getStructures = async () => safeApiRequest({url: Endpoints.STRUCTURES});

  getDeviceInfo = async () => safeApiRequest({url: Endpoints.DEVICE_INFO});

  getLatestVersionInfo = async () =>
    safeApiRequest({url: Endpoints.LATEST_TABLET_VERSION});

  register = async (name, email, password) =>
    safeApiRequest({
      url: Endpoints.USERS,
      data: {name, email, password, type: 'device'},
      method: 'post',
    });
}

export default new Smartex();
