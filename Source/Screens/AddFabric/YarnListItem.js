import React from 'react';
import {View, Text} from 'react-native';
import {Styles} from '@themes';
import Icon from '@icons';
import {ClickableIcon, VerticalDivider} from '@components';
import {ScaledSheet, ls} from '@helpers';

const YarnListItem = ({
  portrait,
  editable,
  first,
  last,
  item,
  onDelete,
  onEdit,
  moveItemUp,
  moveItemDown,
}) => {
  return (
    <>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 16}}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
          }}>
          <Text style={styles.text}>{item.type.label}</Text>
          <Text style={styles.text}>{item.color.label}</Text>
          <Text style={styles.text}>{item.density}</Text>
          <Text style={styles.text}>{item.unit.label}</Text>
          <Text style={styles.text}>{item.multiplier}</Text>
        </View>
        {editable ? (
          <>
            <ClickableIcon onPress={onEdit}>
              <Icon.Edit width={ls(29)} height={ls(26)} />
            </ClickableIcon>
            <ClickableIcon onPress={onDelete}>
              <Icon.Delete width={ls(22)} height={ls(29)} />
            </ClickableIcon>
            <VerticalDivider style={styles.verticalDivider} />
            <ClickableIcon dense onPress={first ? null : moveItemUp}>
              <Icon.Up
                width={ls(17)}
                height={ls(23)}
                color={first ? '#1B1C1F' : '#FFF'}
              />
            </ClickableIcon>
            <ClickableIcon dense onPress={last ? null : moveItemDown}>
              <Icon.Down
                width={ls(17)}
                height={ls(23)}
                color={last ? '#1B1C1F' : '#FFF'}
              />
            </ClickableIcon>
          </>
        ) : (
          <View style={{width: portrait ? 0 : ls(230)}} />
        )}
      </View>
      <View style={styles.divider} />
    </>
  );
};

const styles = ScaledSheet.create({
  text: {
    ...Styles.body1,
    flex: 1,
  },
  verticalDivider: {
    marginEnd: '16@ls',
    marginStart: '8@ls',
    height: '50%',
  },
  divider: {
    marginTop: '16@ls',
    height: 1,
    backgroundColor: '#32343C',
  },
});

export default YarnListItem;
