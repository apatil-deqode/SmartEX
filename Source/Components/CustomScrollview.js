import React from 'react';
import {ScrollView, View, Animated} from 'react-native';

const CustomScrollview = ({
  children,
  visibleHeight,
  wholeHeight,
  updateVisibleHeight,
  updateWholeHeight,
  listSize,
  ...rest
}) => {
  const indicator = new Animated.Value(0);
  const indicatorSize =
    wholeHeight > visibleHeight
      ? (visibleHeight * visibleHeight) / wholeHeight
      : 0;
  const difference =
    visibleHeight > indicatorSize ? visibleHeight - indicatorSize : 1;
  return (
    <View style={{flex: 1, flexDirection: 'row'}}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(width, height) => {
          updateWholeHeight(height);
        }}
        onLayout={({
          nativeEvent: {
            layout: {x, y, width, height},
          },
        }) => updateVisibleHeight(height)}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: indicator}}}],
          {useNativeDriver: true},
        )}
        {...rest}>
        {children}
      </Animated.ScrollView>

      <Animated.View
        style={[
          {
            height: listSize && listSize > 0 ? indicatorSize : 0,
            width: 2,
            backgroundColor: 'white',
            transform: [
              {
                translateY: Animated.multiply(
                  indicator,
                  visibleHeight / wholeHeight,
                ).interpolate({
                  inputRange: [0, difference],
                  outputRange: [0, difference],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

export default CustomScrollview;
