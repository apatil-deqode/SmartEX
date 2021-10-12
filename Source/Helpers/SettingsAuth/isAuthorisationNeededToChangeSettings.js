const isAuthorisationNeededToChangeSettings = (lastAuthTimestamp) => {
  const timeStamp = lastAuthTimestamp;
  if (!timeStamp) {
    return true;
  }
  var timeDiff = new Date().getTime() - timeStamp;
  var timeInMin = timeDiff / 30000;
  if (timeInMin >= 1) {
    return true;
  }
  return false;
};

export default isAuthorisationNeededToChangeSettings;
