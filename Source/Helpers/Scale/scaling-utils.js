import {Dimensions} from 'react-native';

const guidelineBaseWidth = 1280;
const guidelineBaseHeight = 800;

const {width, height} = Dimensions.get('window');
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

export const largeScale = (size) => (longDimension / guidelineBaseWidth) * size;
export const verticalScale = (size) =>
  (shortDimension / guidelineBaseHeight) * size;

export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const ls = largeScale;
export const vs = verticalScale;
export const ms = moderateScale;
