import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import {CustomFlatList} from '@components';
import FabricItem from './FabricItem';
import {CopilotStep, walkthroughable} from 'react-native-copilot-fullscreen';
import {ScaledSheet} from '@helpers';
import {FlatList} from 'react-native-gesture-handler';

const CopilotView = walkthroughable(View);

const FabricSectionList = ({portrait, fabrics, t}) => {
  return (
    <CopilotStep
      key={t('step_select_fabric')}
      text={t('step_select_fabric')}
      order={3}
      name="step_select_fabric">
      <CopilotView style={{flex: 1}}>
        <FlatList
          // visibleHeight={visibleHeight}
          // wholeHeight={wholeHeight}
          // updateVisibleHeight={(height) =>
          //   this.setState({visibleHeight: height})
          // }
          // updateWholeHeight={(height) => this.setState({wholeHeight: height})}
          // listSize={fabrics.length}
          // key={`${portrait}`}
          // numColumns={portrait ? 2 : 4}
          // contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id}
          data={fabrics}
          horizontal={true}
          contentContainerStyle={{
            flexWrap: 'wrap',
            flexDirection: 'column',
            height: 420,
            justifyContent: 'space-between',
          }}
          // ListEmptyComponent={
          //   <View style={styles.emptyListContainer}>
          //     {<Text style={Styles.h5}>{t('no_fabrics')}</Text>}
          //   </View>
          // }
          renderItem={({item, index}) => (
            <FabricItem
              portrait={portrait}
              fabric={item}
              // selected={index === selectedIdx}
              // onPress={() => this.setState({selectedIdx: index})}
              // onViewDetails={() =>
              //   this.props.navigation.navigate('fabricDetails', item)
              // }
            />
          )}
        />
      </CopilotView>
    </CopilotStep>
  );
};

const styles = ScaledSheet.create({
  emptyListContainer: {
    marginTop: '32@ls',
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listStyle: {
    flexGrow: 1,
  },
});

export default withTranslation()(FabricSectionList);
