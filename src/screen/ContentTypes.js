import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react';
import { observe } from 'mobx';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Spinner from '../components/Spinner';
import PaginateComponent from '../components/Paginate';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Lightbox from 'react-image-lightbox';

import AppWrapper from '../components/AppWrapper';
import SearchInput from '../components/SearchInput';
import moment from 'moment';
import { SERVER_ROOT } from '../constants/config';
import { Box } from '@material-ui/core';

const styles = theme => ({
  
  wrapper: {
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
  tableWarapper: {
    overflow: 'auto',
    marginTop: 25,
  },
  tableHead: {
    backgroundColor: theme.palette.grey['200']
  },
  tableRow: {
    cursor: 'pointer',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
  },
  tableCell: {
    minHeight: "48px",
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

  state = {
    isOpen: false,
    showImage: null,
  }

  onUpdateSignal = () => {
    this.props.contentTypesStore
    .getAll({content_type_id: this.contentTypeID})
  }

  componentDidMount() {
    this.contentTypeID = this.props.appStore.avilableViews.get(this.props.match.path).content_type_id
    this.props.contentTypesStore
    .getAll({content_type_id: this.contentTypeID})
    this.disposers = [
      observe(this.props.contentTypesStore, 'activeSort', ({ newValue }) => {
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

  onScrollTable = ({target}) =>  {
    let thead = ReactDOM.findDOMNode(this.refs.thead)
    thead.style.transform = "translate(0,"+ target.scrollTop + "px)";
  }

  renderSortField() {
    const {
      classes,
      history,
      contentTypesStore: {
        all, 
        sortFields, 
        extraFields, 
        activeSort 
      },
      match: { path },
    } = this.props
    return (
      <Paper 
        onScroll={this.onScrollTable} 
        elevation={0} 
        className={classes.tableWarapper}
        style={{width: this.props.wrappedComponentSize.width}}
        ref="table"
      >
        <Table>
          <TableHead ref={"thead"} className={classes.tableHead}>
            <TableRow>
            {
              extraFields.map(({label}, i) => (
                <TableCell key={i} className={classes.tableCell}>
                  <Typography className={classes.disabledSort} variant={"body2"}>{label}</Typography>
                </TableCell>
              ))
            }
            {
              sortFields.map(({label, name}, i) => (
                <TableCell key={i} className={classes.tableCell}>
                  <TableSortLabel
                    active={!!activeSort[name]}
                    direction={activeSort[name] || 'asc'}
                    onClick={this.sortHandler(name)}
                  >
                    <Typography variant={"body2"}>{label}</Typography>
                  </TableSortLabel>
                </TableCell>
              ))
            }
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {
              all.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => history.push(`${path}/${row.id}`)}
                  className={classes.tableRow}>
                    {
                      extraFields.map(({name, toHTML}, i) => (
                        <TableCell ref={'td'+ i} key={i} className={classes.tableCell}>
                          {this.renderValue(row[name], toHTML)}
                        </TableCell>
                      ))
                    }
                    {
                      sortFields.map(({name, toHTML}, i) => (
                        <TableCell ref={'td' + (i + extraFields.length)} key={i} className={classes.tableCol}>
                          {this.renderValue(row[name], toHTML)}
                        </TableCell>
                      ))
                    }
                </TableRow>
                ))
              }
            </TableBody>
          </Table>
      </Paper>
    )
  }

  onClickImg = (event) => {
    event.stopPropagation()
    if (event.target.src) {
      this.setState({
        isOpen: true,
        showImage: event.target.src.replace(/(.*)_thumb\.(jpe?g|png|gif)/g, "$1.$2")
      })
    }
  }

  renderValue(value, toHTML) {
    const {contentTypesStore: {short}} = this.props
    if (typeof value === 'boolean') {
      value =  value ? "Да": "Нет"
    } else if (toHTML === "image") {
      value = value && value.split(",").map(
        path => SERVER_ROOT + path.replace(/(.*)\.(jpe?g|png|gif)/ig, '$1_thumb.$2')
      )
    }
    let Text = ({value}) => <ListItemText primary={value} />
    if (!short) {
      Text = ({value}) => <Typography>{value}</Typography>
    }
    return (
      !toHTML
      ? <Text value={value} />
      : toHTML === "image"
      ? value && value.map((path, i) => (
        <img 
          key={i} 
          src={path} 
          alt='' 
          onClick={this.onClickImg}
          style={{width: 100, height: 100, padding: 8}}
        />
      )) 
      : ["date", "datetime"].indexOf(toHTML) > -1
      ? value.split(",").map((date, i) => (
        <Text key={i} value={moment(date).format(toHTML === "date" ? "LL": "LLL")}/>
      ))
      : <div dangerouslySetInnerHTML={{ __html: value }} />
    )
  }

  renderShort() {
    const {
      classes,
      history,
      contentTypesStore: { all, toHTML },
      match: { path },
    } = this.props
    return (
      <List className={classes.list}>
        {
          all.map((item, index) => (
            <ListItem key={index} button onClick={() => history.push(`${path}/${item.value}`)}>
              { this.renderValue(item.label, toHTML) }
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
      <Box className={classes.wrapper} style={{height: this.props.wrappedComponentSize.height}}>
        <Spinner listenLoad={['allContentTypes',]} />
        {
          this.state.isOpen && (
          <Lightbox
              mainSrc={this.state.showImage}
              onCloseRequest={() => this.setState({ isOpen: false })}
            />
          )
        }
        <Box className={classes.controlBlock}>
          {
            availableSearch &&
            <Box style={{margin: "auto 15px"}}>
              <SearchInput
                keyword={keyword}
                onSearch={(keyword) => this.props.contentTypesStore.getAll({keyword, content_type_id: this.contentTypeID})}
                placeHolder={`Искать ${name}`} 
              />
            </Box>
          }
          <Button 
            onClick={() => history.push(`${path}/new`)}
            variant="contained" 
            color="secondary"
            className={classes.button}
          >
            { `Новый(ая) ${name}` }
          </Button>
        </Box>
        <PaginateComponent 
          paginate={paginate}
          maxPages={9}
          getContent={page => (
            this.props
            .contentTypesStore
            .getAll({page, content_type_id: this.contentTypeID})
            .then(() => {
              if (this.refs["table"]) {
                const table = ReactDOM.findDOMNode(this.refs["table"])
                table && table.scrollTo(0, 0)
              }
            })
          )}
        />
        {
          short
          ? this.renderShort()
          : this.renderSortField()          
        }
      </Box>
    );
  }
}

export default ContentTypes; 