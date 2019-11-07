import React, { Component } from 'react';
import AppWrapper from '../components/AppWrapper';
import { Box, List, Typography } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { observe } from 'mobx';
import { Paper, ListItem } from 'material-ui';

@AppWrapper
@observer
@inject("appStore")
class Dashboard extends Component {
  
  state = {
    onlineUsers: [],
  }
  
  disposers = []

  componentWillMount() {
    this.state.onlineUsers = this.props.appStore.onlineUsers
  }

  componentDidMount() {
    this.disposers = [
      observe(this.props.appStore, "onlineUsers", ({ newValue }) => {
        this.setState({onlineUsers: newValue})
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
        <Paper>
          <List>
            {
              this.state.onlineUsers.map(({fullName}) => (
                <ListItem>
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