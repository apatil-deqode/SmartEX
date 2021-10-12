import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import Images from '@images';
import {DrawerItem} from '@components';

class RpmDrawerItem extends Component {
  render() {
    const {t, rpm} = this.props;
    return (
      <DrawerItem
        title={t('rpm') + '\n' + rpm}
        icon={Images.rpm}
        style={{flex: 1}}
      />
    );
  }
}

const mapStateToProps = ({auth: {rpm}}) => {
  return {rpm};
};

export default withTranslation()(connect(mapStateToProps)(RpmDrawerItem));
