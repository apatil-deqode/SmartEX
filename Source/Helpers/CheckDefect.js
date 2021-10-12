class CheckDefect {
  defectTypeIndex = {
    horizontal: 0,
    vertical: 1,
    punctual: 2,
    oil: 3,
  };

  defectTypes = (image, settings) => {
    const {score, thresholds} = image;
    const parsedScore = JSON.parse(score);
    const parsedThresholds = JSON.parse(thresholds);
    const imageDefect = image.defect ? image.defect : '';
    const typeOfDefect = imageDefect.toLowerCase();
    let defectType = null;
    if (typeOfDefect.includes('horizontal')) {
      defectType = 'horizontal';
    }
    if (typeOfDefect.includes('vertical')) {
      defectType = defectType !== null ? defectType + ' vertical' : 'vertical';
    }
    if (typeOfDefect.includes('point') || typeOfDefect.includes('punctual')) {
      defectType = defectType !== null ? defectType + ' point' : 'point';
    }
    if (typeOfDefect.includes('oil')) {
      defectType = defectType !== null ? defectType + ' oil' : 'oil';
    }
    if (parsedScore.length !== 0 && parsedThresholds.length !== 0) {
      return defectType !== null
        ? this.functionDictionary[defectType](
            parsedScore,
            parsedThresholds,
            settings,
          )
        : defectLavel.noDefect;
    }
    return defectLavel.noDefect;
  };

  presentationForSingleDefect = (scoreValue, thresholdValue, switchValue) => {
    const isDefective = scoreValue >= thresholdValue;
    if (switchValue === true) {
      return isDefective ? defectLavel.red : defectLavel.noDefect;
    }

    if (switchValue === false) {
      return isDefective ? defectLavel.gray : defectLavel.noDefect;
    }
  };

  presentationFor2Defects = (condition1, condition2) => {
    const {flag1, score1, threshold1} = condition1;
    const {flag2, score2, threshold2} = condition2;

    if (flag1 === true && score1 >= threshold1) {
      return defectLavel.red;
    }

    if (flag2 === true && score2 >= threshold2) {
      return defectLavel.red;
    }

    if (score1 >= threshold1 || score2 >= threshold2) {
      return defectLavel.gray;
    }
    return defectLavel.noDefect;
  };

  presentationFor3Defects = (condition1, condition2, condition3) => {
    const {flag1, score1, threshold1} = condition1;
    const {flag2, score2, threshold2} = condition2;
    const {flag3, score3, threshold3} = condition3;

    if (flag1 === true && score1 >= threshold1) {
      return defectLavel.red;
    }

    if (flag2 === true && score2 >= threshold2) {
      return defectLavel.red;
    }

    if (flag3 === true && score3 >= threshold3) {
      return defectLavel.red;
    }

    if (score1 >= threshold1 || score2 >= threshold2 || score3 >= threshold3) {
      return defectLavel.gray;
    }
    return defectLavel.noDefect;
  };

  presentationFor4Defects = (
    condition1,
    condition2,
    condition3,
    condition4,
  ) => {
    const {flag1, score1, threshold1} = condition1;
    const {flag2, score2, threshold2} = condition2;
    const {flag3, score3, threshold3} = condition3;
    const {flag4, score4, threshold4} = condition4;

    if (flag1 === true && score1 >= threshold1) {
      return defectLavel.red;
    }

    if (flag2 === true && score2 >= threshold2) {
      return defectLavel.red;
    }

    if (flag3 === true && score3 >= threshold3) {
      return defectLavel.red;
    }

    if (flag4 === true && score4 >= threshold4) {
      return defectLavel.red;
    }

    if (
      score1 >= threshold1 ||
      score2 >= threshold2 ||
      score3 >= threshold3 ||
      score4 >= threshold4
    ) {
      return defectLavel.gray;
    }
    return defectLavel.noDefect;
  };
  functionDictionary = {
    horizontal: (scores, thresholds, settings) => {
      return this.presentationForSingleDefect(
        scores[this.defectTypeIndex.horizontal],
        thresholds[this.defectTypeIndex.horizontal],
        settings.horizontalSwitchValue,
      );
    },

    vertical: (scores, thresholds, settings) => {
      return this.presentationForSingleDefect(
        scores[this.defectTypeIndex.vertical],
        thresholds[this.defectTypeIndex.vertical],
        settings.verticalSwitchValue,
      );
    },

    point: (scores, thresholds, settings) => {
      return this.presentationForSingleDefect(
        scores[this.defectTypeIndex.punctual],
        thresholds[this.defectTypeIndex.punctual],
        settings.punctualSwitchValue,
      );
    },

    oil: (scores, thresholds, settings) => {
      return this.presentationForSingleDefect(
        scores[this.defectTypeIndex.oil],
        thresholds[this.defectTypeIndex.oil],
        settings.oilSwitchValue,
      );
    },

    'horizontal vertical': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.verticalSwitchValue,
        score2: scores[this.defectTypeIndex.vertical],
        threshold2: thresholds[this.defectTypeIndex.vertical],
      };
      return this.presentationFor2Defects(condition1, condition2);
    },

    'horizontal point': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.punctualSwitchValue,
        score2: scores[this.defectTypeIndex.punctual],
        threshold2: thresholds[this.defectTypeIndex.punctual],
      };
      return this.presentationFor2Defects(condition1, condition2, settings);
    },

    'horizontal oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.oilSwitchValue,
        score2: scores[this.defectTypeIndex.oil],
        threshold2: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor2Defects(condition1, condition2, settings);
    },

    'vertical point': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.verticalSwitchValue,
        score1: scores[this.defectTypeIndex.vertical],
        threshold1: thresholds[this.defectTypeIndex.vertical],
      };
      const condition2 = {
        flag2: settings.punctualSwitchValue,
        score2: scores[this.defectTypeIndex.punctual],
        threshold2: thresholds[this.defectTypeIndex.punctual],
      };
      return this.presentationFor2Defects(condition1, condition2);
    },

    'vertical oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.verticalSwitchValue,
        score1: scores[this.defectTypeIndex.vertical],
        threshold1: thresholds[this.defectTypeIndex.vertical],
      };
      const condition2 = {
        flag2: settings.oilSwitchValue,
        score2: scores[this.defectTypeIndex.oil],
        threshold2: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor2Defects(condition1, condition2);
    },

    'point oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.pointSwitchValue,
        score1: scores[this.defectTypeIndex.point],
        threshold1: thresholds[this.defectTypeIndex.point],
      };
      const condition2 = {
        flag2: settings.oilSwitchValue,
        score2: scores[this.defectTypeIndex.oil],
        threshold2: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor2Defects(condition1, condition2);
    },

    'horizontal vertical point': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.verticalSwitchValue,
        score2: scores[this.defectTypeIndex.vertical],
        threshold2: thresholds[this.defectTypeIndex.vertical],
      };
      const condition3 = {
        flag3: settings.punctualSwitchValue,
        score3: scores[this.defectTypeIndex.punctual],
        threshold3: thresholds[this.defectTypeIndex.punctual],
      };
      return this.presentationFor3Defects(condition1, condition2, condition3);
    },

    'horizontal vertical oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.verticalSwitchValue,
        score2: scores[this.defectTypeIndex.vertical],
        threshold2: thresholds[this.defectTypeIndex.vertical],
      };
      const condition3 = {
        flag3: settings.oilSwitchValue,
        score3: scores[this.defectTypeIndex.oil],
        threshold3: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor3Defects(condition1, condition2, condition3);
    },

    'horizontal point oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.pointSwitchValue,
        score2: scores[this.defectTypeIndex.point],
        threshold2: thresholds[this.defectTypeIndex.point],
      };
      const condition3 = {
        flag3: settings.oilSwitchValue,
        score3: scores[this.defectTypeIndex.oil],
        threshold3: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor3Defects(condition1, condition2, condition3);
    },

    'vertical point oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.verticalSwitchValue,
        score1: scores[this.defectTypeIndex.vertical],
        threshold1: thresholds[this.defectTypeIndex.vertical],
      };
      const condition2 = {
        flag2: settings.pointSwitchValue,
        score2: scores[this.defectTypeIndex.point],
        threshold2: thresholds[this.defectTypeIndex.point],
      };
      const condition3 = {
        flag3: settings.oilSwitchValue,
        score3: scores[this.defectTypeIndex.oil],
        threshold3: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor3Defects(condition1, condition2, condition3);
    },

    'horizontal vertical point oil': (scores, thresholds, settings) => {
      const condition1 = {
        flag1: settings.horizontalSwitchValue,
        score1: scores[this.defectTypeIndex.horizontal],
        threshold1: thresholds[this.defectTypeIndex.horizontal],
      };
      const condition2 = {
        flag2: settings.verticalSwitchValue,
        score2: scores[this.defectTypeIndex.vertical],
        threshold2: thresholds[this.defectTypeIndex.vertical],
      };
      const condition3 = {
        flag3: settings.punctualSwitchValue,
        score3: scores[this.defectTypeIndex.punctual],
        threshold3: thresholds[this.defectTypeIndex.punctual],
      };
      const condition4 = {
        flag3: settings.oilSwitchValue,
        score3: scores[this.defectTypeIndex.oil],
        threshold3: thresholds[this.defectTypeIndex.oil],
      };
      return this.presentationFor4Defects(
        condition1,
        condition2,
        condition3,
        condition4,
      );
    },
  };
}

export const updateSetting = (isState, index, switchkey, oldSetting) => {
  const update = oldSetting;
  if (index === null) {
    // Function called from main page and setting switches.
    update[switchkey] = isState;
    for (let i = 0; i <= 7; i++) {
      update.cameraDefectSettings[i][switchkey] = isState;
    }
  } else {
    //Function called from image slider for perticukar defect type.
    update.cameraDefectSettings[index][switchkey] = isState;
    for (let i = 0; i <= 7; i++) {
      if (update.cameraDefectSettings[i][switchkey] === true) {
        update[switchkey] = true;
        break;
      } else {
        update[switchkey] = false;
      }
    }
  }
  return update;
};

export const defectLavel = {
  red: 'red',
  gray: 'grey',
  noDefect: 'noDefect',
};

export default new CheckDefect();
