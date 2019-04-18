import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Lightbox from 'react-image-lightbox';
import AppWrapper from '../components/AppWrapper';

import 'react-image-lightbox/style.css';
import Spinner from '../components/Spinner';


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  avatar: {
    width: 120,
    height: 120,
    float: 'left',
    marginRight: 50,
    cursor: "pointer"
  }
})

@AppWrapper
@withStyles(styles)
@inject('usersStore')
@observer
class EditUser extends Component {

  state = {
    isOpen: false,
  }

  componentDidMount() {
    const userID = parseInt(this.props.match.params.id)
    this.props.usersStore.selectUser(userID)
  }

  componentWillUnmount() {
    this.props.usersStore.clearSelectedUser()
  }

  render() {
    const {classes, usersStore: { selectedUser }} = this.props;
    return (
      <div>
        <Spinner listenLoad={['getUserInfo',]} />
        {
          this.state.isOpen && 
          <Lightbox
            mainSrc={selectedUser.photo}
            onCloseRequest={() => this.setState({ isOpen: false })}
          />
        }

        <Paper className={classes.root} elevation={1}>
          <Avatar
            onClick={() => this.setState({isOpen: true})}
            alt=""
            src={selectedUser.photo}
            className={classes.avatar}
          />
          <Typography component="h3">
            {selectedUser.first_name} {selectedUser.last_name}
          </Typography>
          <Typography component="p">
            { selectedUser.phone }
          </Typography>
          <div style={{clear: 'both'}}></div>
        </Paper>      
      </div>
    )
  }
}


export default EditUser;