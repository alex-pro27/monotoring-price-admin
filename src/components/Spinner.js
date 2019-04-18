import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import RestService from "../api/rest";
import CircularProgress from '@material-ui/core/CircularProgress';


const styles = theme => ({
  container: {
    position: 'absolute',
    flex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progress: {
    margin: theme.spacing.unit * 2,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
  },
})


@withStyles(styles)
class Spinner extends Component {

  unsubscribe = null;

  state = {
    listenLoad: null,
  }

  static defaultProps = {
    backgroundColor: 'rgba(255,255,255,0.6)',
    size: 50,
  }

  static propTypes = {
    listenLoad: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.number,
    backgroundColor: PropTypes.string,
    type: PropTypes.string,
  }

  get flagLoad() {
    if (this.props.listenLoad) {
      return Object.values(this.state.listenLoad).indexOf(true) > -1;
    }
    else return true
  }

  componentWillMount() {
    if (this.props.listenLoad) {
      this.rest = new RestService();
      this.state.listenLoad = this.rest.getLoads(this.props.listenLoad);
      this.unsubscribe = this.rest.subscribe((obj) => {
        Object.entries(obj).forEach(([key, status]) => {
          if(this.state.listenLoad[key] !== undefined) {
            let listenLoad = Object.assign({}, this.state.listenLoad, {[key]: status})
            this.setState({listenLoad})
          }
        })
      })
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  render() {
    if (this.flagLoad){
      const { classes } = this.props
      return (
        <div className={classes.container} style={{backgroundColor: this.props.backgroundColor}}>
          <CircularProgress className={classes.progress} color="secondary" />
        </div>
      );
    }
    return null
  }
}

export default Spinner;