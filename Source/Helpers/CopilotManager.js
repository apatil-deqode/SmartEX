import AsyncStorage from '@react-native-async-storage/async-storage';

class CopilotManager {
  async setCompleted(name) {
    AsyncStorage.setItem(name, 'true');
  }

  async isNeeded(name) {
    return (await AsyncStorage.getItem(name)) !== 'true';
  }
}

export const Introductions = {
  HOME: 'home',
  SETTINGS: 'settings',
  HELP: 'help',
  ALL_FABRICS: 'all_fabrics',
  CREATE_FABRIC: 'created_fabric',
};
Object.freeze(Introductions);

const instance = new CopilotManager();

export default instance;
