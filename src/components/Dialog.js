import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogMat from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class Dialog extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    node: PropTypes.node,
    yes: PropTypes.string,
    no: PropTypes.string,
    cancel: PropTypes.string,
    show: PropTypes.bool,
    onAction: PropTypes.func,
    onClose: PropTypes.func,
    close: PropTypes.func,
    onOpen: PropTypes.func,
  }

  static defaultProps = {
    effect: 'up',
    message: "",
    title: "",
    onClose: () => void 0,
    onAction: (ans) => ans,
    onOpen: () => void 0,
  }

  render() {
    const { show, yes, no, cancel, title, node, message, onAction, onClose, close, onOpen } = this.props;
    return (
      <DialogMat
        open={show}
        onClose={onClose}
        onRendered={onOpen}
      >
        <DialogTitle id="alert-dialog-slide-title">
          { title }
        </DialogTitle>
        <DialogContent>
          { 
            !node
            ? <DialogContentText id="alert-dialog-slide-description">
                { message } 
              </DialogContentText>
            : node
          }
        </DialogContent>
        <DialogActions>
          { 
            yes &&
            <Button onClick={() => (onAction(true) || close())} color="primary">
              { yes }
            </Button>
          }
          { 
            no &&
            <Button onClick={() => (onAction(false) || close())} color="primary">
              { no }
            </Button>
          }
          {
            cancel && 
            <Button onClick={close} color="primary">
              { cancel }
            </Button>
          }
        </DialogActions>
      </DialogMat>
    );
  }
}

export default Dialog;
