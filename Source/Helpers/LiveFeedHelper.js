export const cameraTemplate = (index) => {
  return {
    index: index,
    defect: 'NoDefect',
    frames: [
      {
        type: 'IR',
        pos: 'TOP',
        frame: '',
      },
    ],
    rotation: 0,
    rpm: 0,
    score: '[0, 0, 0, 0]',
    thresholds: '[1, 1, 1, 1]',
    timestamp: '',
    thumbnail: '',
    isStoreCache: false,
  };
};
