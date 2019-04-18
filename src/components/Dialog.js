import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogMat from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const buttonPropType = PropTypes.shape({
  title: PropTypes.string, 
  onPress: PropTypes.func,
});

class Dialog extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    node: PropTypes.node,
    yes: buttonPropType,
    no: buttonPropType,
    show: PropTypes.bool,
    onClose: PropTypes.func,
  }

  static defaultProps = {
    effect: 'up',
    message: "",
    title: ""
  }

  render() {
    const { show, yes, no, title, node, message, onClose } = this.props;
    return (
      <DialogMat
        open={show}
        onClose={() => onClose()}
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
            <Button onClick={yes.onPress} color="primary">
              { yes.title }
            </Button>
          }
          { 
            no &&
            <Button onClick={no.onPress} color="primary">
              { no.title }
            </Button>
          }
        </DialogActions>

      </DialogMat>
    );
  }
}

export default Dialog;
