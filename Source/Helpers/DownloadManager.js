import {Alert, PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
const android = RNFetchBlob.android;

const requestStorageAccessPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Smartex',
        message:
          'Smartex needs access to your device storage to download the new version of APK',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    } else {
      Alert.alert({
        title: 'Permission Denied',
        message: 'Permission denied to store file in device storage.',
      });
    }
  } catch (err) {
    console.warn(err);
  }
};

const downloadAPK = ({description, link, title}) => {
  requestStorageAccessPermission()
    .then(() => {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${title}`;
      RNFetchBlob.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          description,
          title,
          mime: 'application/vnd.android.package-archive',
          mediaScannable: true,
          notification: true,
          path: downloadDest,
        },
        fileCache: false,
      })
        .fetch('GET', link)
        .then((res) => {
          const filePath = res.path();
          android
            .actionViewIntent(
              filePath,
              'application/vnd.android.package-archive',
            )
            .then(() => {})
            .catch((downloadError) => {});
        });
    })
    .catch((permissionError) => {
      alert(JSON.stringify(permissionError));
    });
};

export default downloadAPK;
