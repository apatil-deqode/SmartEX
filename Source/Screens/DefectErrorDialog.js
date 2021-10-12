import React, {Component} from 'react';
import {Dialog, Portal} from 'react-native-paper';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation';
import {Constants} from '@data';
import {Actions} from '@state';
import {ErrorDialog} from '@components';
import {CoreServiceAPIService} from '@services';
import {logAnalytics, Events} from '@helpers';
import ImageCarouselDialog from './ImageCarousel/ImageCarouselDialog';
import {Stores} from '@state';

class DefectErrorDialog extends Component {
  constructor() {
    super();

    this.state = {
      portrait: Orientation.getInitialOrientation === Constants.PORTRAIT,
      carouselVisible: false,
      selectedIdx: 0,
    };
  }

  updateOrientation = (orientation) => {
    this.setState({portrait: Constants.PORTRAIT === orientation});
  };

  componentDidMount() {
    Orientation.addOrientationListener(this.updateOrientation);
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this.updateOrientation);
  }

  showCarousel = (index) => {
    this.setState({carouselVisible: true, selectedIdx: index});
  };

  onPressUnlock = async (confirmed) => {
    logAnalytics(Events.DEFECT_STOP, 'unlocking machine');
    const coreServiceAPIService = new CoreServiceAPIService();
    const result = await coreServiceAPIService.unlockMachine(confirmed);
    if (!result) {
      // TODO: Error accoured. Basic error already handeled in API service
    }
  };
  render() {
    const {
      type,
      defect,
      occurrences,
      cm,
      visible,
      hideDefectStopDialog,
      timestamp,
    } = this.props;
    const {portrait, selectedIdx, carouselVisible} = this.state;
    //const liveFeed = Stores.getState().liveFeed.liveFeed?.feed ?? [];
    const liveFeed = Stores.getState().liveFeed.defectedFrames?.frames ?? [];
    return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDefectStopDialog}
          dismissable={false}
          style={{
            alignSelf: 'center',
            width: portrait ? '90%' : '80%',
            position: 'absolute',
            bottom: 0,
            right: '5%',
          }}>
          {visible ? (
            <ErrorDialog
              type={type}
              timestamp={timestamp}
              defect={defect}
              cm={cm}
              occurrences={occurrences}
              liveFeed={liveFeed}
              onPressImage={this.showCarousel}
              onPressUnlock={(confirmed) => this.onPressUnlock(confirmed)}
            />
          ) : null}
        </Dialog>
        {visible ? (
          <ImageCarouselDialog
            visible={carouselVisible}
            images={liveFeed}
            index={selectedIdx}
            onRequestClose={() => this.setState({carouselVisible: false})}
          />
        ) : null}
      </Portal>
    );
  }
}

const mapstateToProps = (state) => {
  return {
    visible: state.dialog.defectStopVisible,
    type: state.dialog.type,
    defect: state.dialog.defect,
    cm: state.dialog.cm,
    occurrences: state.dialog.occurrences,
    timestamp: state.dialog.timestamp,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideDefectStopDialog: () => dispatch({type: Actions.HIDE_DEFECT_STOP}),
  };
};

export default connect(mapstateToProps, mapDispatchToProps)(DefectErrorDialog);
