import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Spinner from '../components/Spinner';
import PaginateComponent from '../components/Paginate';

import AppWrapper from '../components/AppWrapper';

const styles = theme => ({
  
  wrapper: {
    height: window.innerHeight - 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },

  usersList: {
    width: '100%',
    overflow: 'auto',
  },
  round_status: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'gray',
    display: 'inline-block',
    paddingRight: 10,
    marginRight: 20,
  },
})

@AppWrapper
@withStyles(styles)
@inject('usersStore')
@observer
class Users extends Component {

  componentDidMount() {
    this.props.usersStore.getUsers()
  }
  
  render() {
    const {
      classes,
      history,
      usersStore: {
        users,
        paginate,
      }
    } = this.props

    return (
      <div className={classes.wrapper}>
        <Spinner listenLoad={['allUsers',]} />
        <PaginateComponent 
          paginate={paginate}
          maxPages={9}
          getContent={page => this.props.usersStore.getUsers(page)}
        />
        <List className={classes.usersList}>
          {
            users.map((user, index) => (
              <ListItem key={index} button onClick={() => history.push("/user/" + user.id)}>
                <span className={classes.round_status} style={{backgroundColor: user.online? 'green': 'red'}}/>
                <ListItemAvatar>
                  <Avatar
                    alt={`Avatar n°${user.id}`}
                    src={user.photo}
                  />
                </ListItemAvatar>
                <ListItemText primary={user.fullName} />
                <ListItemText primary={user.phone} />
              </ListItem>
            ))
          }
        </List>
        
      </div>
    );
  }
}


export default Users; 