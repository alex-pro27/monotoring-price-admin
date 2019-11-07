import React, { Component } from 'react';
import AppWrapper from '../components/AppWrapper';
import { Box, List, Typography } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { observe, toJS } from 'mobx';
import { Paper, ListItem } from 'material-ui';

@AppWrapper
@observer
@inject("appStore")
class Dashboard extends Component {
  
  state = {
    onlineUsers: [],
  }
  
  disposers = []

  onUpdateSignal = () => {
    this.props.appStore.getOnlineUsers(true)
  }

  componentWillMount() {
    this.state.onlineUsers = toJS(this.props.appStore.onlineUsers)
  }

  componentDidMount() {
    this.disposers = [
      observe(this.props.appStore, "onlineUsers", ({ newValue }) => {
        this.setState({onlineUsers: toJS(newValue)})
        console.log("on update users",this.state)
      })
    ]
    this.props.appStore.getOnlineUsers()
  }

  componentWillUnmount() {
    this.disposers.forEach(d => d())
  }
  
  render() {
    return (
      <Box>
        <Paper style={{width: '80%', margin: '0 auto'}}>
          <Typography variant="h5" style={{padding: 15}}>Сейчас на сайте:</Typography>
          <List>
            {
              this.state.onlineUsers.map(({fullName}, i) => (
                <ListItem key={i}>
                  <Typography>{fullName}</Typography>
                </ListItem>
              ))
            }
          </List>
        </Paper>
      </Box>
    );
  }
}

export default Dashboard;