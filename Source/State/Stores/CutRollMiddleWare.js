import {Actions} from '../Actions/Actions';
import {deleteDefects} from '../Actions/AsyncActions';

const CutRollMiddleWare = () => (next) => (action) => {
  switch (action.type) {
    case Actions.SET_SELECTED_FABRIC:
      deleteDefects();
  }
  next(action);
};

export default CutRollMiddleWare;
