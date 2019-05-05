import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { observe } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Spinner from '../components/Spinner';
import PaginateComponent from '../components/Paginate';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import AppWrapper from '../components/AppWrapper';
import SearchInput from '../components/SearchInput';
import { Divider } from '@material-ui/core';

const styles = theme => console.log(theme.palette) || ({
  
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
  controlBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 15px',
    width: '100%'
  },
  tableBody: {
    width: '100%',
    overflow: 'auto',
  },

  tableRowBase: {
    width: '100%', 
    display: "flex", 
    flexDirection: "row", 
    justifyContent: "start",
    minWidth: 500,
  },

  tableHederRow: {
    marginTop: "20px",
    backgroundColor: theme.palette.grey['200']
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
  },
  tableCol: {
    minHeight: "48px",
    width: "100%",
    textAlign: 'left',
    padding: "12px 15px"
  },
  disabledSort: {
    color: theme.palette.text.disabled,
  }
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
    this.disposers = [
      observe(this.props.contentTypesStore, 'activeSort', ({ newValue }) => {
        console.log("observe", newValue)
        const order_by = Object.entries(newValue)
        .filter(([name, sort]) => sort)
        .map(([name, sort]) => sort === 'desc' ? `-${name}`: name)
        .join(",")
        this.props.contentTypesStore.clearOrderBy()
        this.props.contentTypesStore.getAll({
          content_type_id: this.contentTypeID,
          order_by,
        })
      }),
    ]
  }

  componentWillUnmount() {
    this.disposers.forEach(d => d())
  }

  sortHandler = name => event => {
    this.props.contentTypesStore.activateSort(name)
  }

  renderSortField() {
    const {
      classes,
      history,
      contentTypesStore: { all, sortFields, extraFields, activeSort },
      match: { path },
    } = this.props
    return (
      <Fragment>
        <div className={[classes.tableRowBase, classes.tableHederRow].join(" ")}>
          {
            extraFields.map(({label}, i) => (
              <div key={i} className={classes.tableCol}>
                <Typography className={classes.disabledSort} variant={"body2"}>{label}</Typography>
              </div>
            ))
          }
          {
            sortFields.map(({label, name}, i) => (
              <div key={i} className={classes.tableCol}>
                <TableSortLabel
                  active={!!activeSort[name]}
                  direction={activeSort[name] || 'asc'}
                  onClick={this.sortHandler(name)}
                >
                  <Typography variant={"body2"}>{label}</Typography>
                </TableSortLabel>
              </div>
            ))
          }
        </div>
        <Divider/>
        <Paper elevation={0} className={classes.tableBody}>
          {
            all.map((row, i) => (
              <Fragment key={i}>
                <ButtonBase
                  focusRipple
                  className={[classes.tableRowBase, classes.tableRow].join(" ")}
                  onClick={() => history.push(`${path}/${row.id}`)}
                >
                  {
                    extraFields.map(({name}, i) => (
                      <div key={i} className={classes.tableCol}>
                        <Typography>{typeof row[name] === "boolean"? row[name]? "Да": "Нет" : row[name]}</Typography>
                      </div>
                    ))
                  }
                  {
                    sortFields.map(({name}, i) => (
                      <div key={i} className={classes.tableCol}>
                        <Typography>{typeof row[name] === "boolean"? row[name]? "Да": "Нет" : row[name]}</Typography>
                      </div>
                    ))
                  }
                </ButtonBase>
                <Divider/>
              </Fragment>
            ))
          }
        </Paper>
      </Fragment>
    )
  }

  renderShort() {
    const {
      classes,
      history,
      contentTypesStore: { all },
      match: { path },
    } = this.props
    return (
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
    )
  }
  
  render() {
    const {
      classes,
      history,
      contentTypesStore: {
        name,
        paginate,
        short,
        availableSearch,
        keyword
      },
      match: { path },
    } = this.props

    return (
      <div className={classes.wrapper}>
        <Spinner listenLoad={['allContentTypes',]} />
        <div className={classes.controlBlock}>
          {
            availableSearch &&
            <div style={{margin: "auto 15px"}}>
              <SearchInput
                keyword={keyword}
                onSearch={(keyword) => this.props.contentTypesStore.getAll({keyword, content_type_id: this.contentTypeID})}
                placeHolder={`Искать ${name}`} 
              />
            </div>
          }
          <Button 
            onClick={() => history.push(`${path}/new`)}
            variant="contained" 
            color="secondary"
            className={classes.button}
          >
            { `Новый ${name}` }
          </Button>
        </div>
        <PaginateComponent 
          paginate={paginate}
          maxPages={9}
          getContent={page => this.props.contentTypesStore.getAll({page, content_type_id: this.contentTypeID,})}
        />
        {
          short
          ? this.renderShort()
          : this.renderSortField()          
        }
      </div>
    );
  }
}

export default ContentTypes; 