import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import AppWrapper from '../components/AppWrapper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import 'react-image-lightbox/style.css';
import Spinner from '../components/Spinner';


const styles = theme => ({
  root: {
    
  },
})

@AppWrapper
@withStyles(styles)
@inject('viewsStore')
@observer
class Views extends Component {

  state = {
  }

  componentDidMount() {
    this.props.viewsStore.allViews()
  }

  componentWillUnmount() {
    
  }

  render() {
    const {classes, history, viewsStore: {views } } = this.props;
    return (
      <Fragment>
        <Spinner listenLoad={['allViews',]} />
        <List>
          {
            views.map(view => (
              <ListItem button onClick={() => history.push("/view/" + view.id)}>
                <ListItemText primary={view.name} />
              </ListItem>
            ))
          }
        </List>
      </Fragment>
    )
  }
}


export default Views;