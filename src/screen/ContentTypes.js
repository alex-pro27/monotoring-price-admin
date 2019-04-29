import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Spinner from '../components/Spinner';
import PaginateComponent from '../components/Paginate';
import Button from '@material-ui/core/Button';

import AppWrapper from '../components/AppWrapper';

const styles = theme => ({
  
  wrapper: {
    height: window.innerHeight - 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden'
  },

  list: {
    width: '100%',
    overflow: 'auto',
  },
  buttonBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 15px',
    width: '100%'
  },
})

@AppWrapper
@withStyles(styles)
@inject('contentTypesStore', 'appStore')
@observer
class ContentTypes extends Component {

  contentTypeID = 0

  componentDidMount() {
    this.contentTypeID = this.props.appStore.avilableViews.get(this.props.match.path).content_type_id
    this.props.contentTypesStore.getAll({content_type_id: this.contentTypeID})
  }
  
  render() {
    const {
      classes,
      history,
      contentTypesStore: {
        all,
        name,
        paginate,
      },
      match: { path },
    } = this.props

    return (
      <div className={classes.wrapper}>
        <Spinner listenLoad={['allContentTypes',]} />
        <div className={classes.buttonBlock}>
          <Button 
            onClick={() => history.push(`${path}/new`)}
            variant="contained" 
            color="secondary"
            className={classes.button}
          >
            { `Добавить ${name}` }
          </Button>
        </div>
        <PaginateComponent 
          paginate={paginate}
          maxPages={9}
          getContent={page => this.props.contentTypesStore.getAll({page, content_type_id: this.contentTypeID,})}
        />
        <List className={classes.list}>
          {
            all.map((item, index) => (
              <ListItem key={index} button onClick={() => history.push(`${path}/${item.value}`)}>
                { !item.label.match(/<[^>]+/g)
                  ? <ListItemText primary={item.label} />
                  : <div dangerouslySetInnerHTML={{ __html: item.label }} />
                }
              </ListItem>
            ))
          }
        </List>
        
      </div>
    );
  }
}


export default ContentTypes; 