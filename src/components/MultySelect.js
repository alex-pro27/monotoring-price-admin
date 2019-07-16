import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import Paginate from '../store/models/Paginate';
import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Checkbox from '@material-ui/core/Checkbox';
import Spinner from './Spinner';
import SearchInput from './SearchInput';
import moment from 'moment';

const styles = theme => console.log(theme) || ({
  root: {
    padding: '15px 0',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  list: {
    maxHeight: 450,
    overflow: 'auto',
  },
  listWrapper: {
    width: '50%'
  },
  nested: {
    paddingLeft: 25,
  },
})

@withStyles(styles)
@inject('contentTypesStore')
@observer
class MultySelect extends Component {

  static propTypes = {
    label: PropTypes.string,
    contentType: PropTypes.string,
    selected: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
    })),
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onChange: () => void 0
  }

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      page: 1,
      isSearched: false,
      loading: false,
      paginate: {},
      toHTML: "",
      selected: this.props.selected || [],
      noData: false,
      groups: this.props.groups || {},
      groupsChecked: {
        list: {},
        selected: {},
      },
      checked: {
        list: [],
        selected: [],
      },
      isOpen: {
        list: {},
        selected: {},
      },
      showImage: null
    }
    this.getList();
  }

  getList({page = this.state.page, keyword = this.state.keyword} = {}) {
    this.setState({loading: true})
    this.props.contentTypesStore
    .getList({page, content_type_name: this.props.contentType, keyword, group_by: this.props.groupBy})
    .then(contentType => {
      let options = [].concat(this.state.list)
      let groups = Object.assign(contentType.groups || {}, this.state.groups)
      let update = this.state.paginate.current_page !== page
      if (keyword !== this.state.keyword) {
        page = 1
        update = false
      }
      if (!update) {
        options = []
        this.props.value && options.push(this.props.value)
      }
      for (let item of contentType.result) {
        if (!this.state.selected.find(({value}) => value === item.value)) {
          options.push(item)
        }
      }
      if (!this.state.init) {
        this.state.paginate = Paginate.create(contentType.paginate)
      }
      this.setState({
        page,
        list: options,
        keyword,
        groups,
        init: true,
        toHTML: contentType.meta.toHTML,
        isSearched: contentType.meta.available_search,
      })
    })
    .catch(e => this.setState({noData: true}))
    .finally(() => this.setState({loading: false}))
  }

  clear(oppositeName) {
    for(let [name, indexes] of Object.entries(this.state.checked)) {
      if (oppositeName !== name) {
        if (!this.state.checked[name].length) {
          break
        }
        indexes.forEach(i => this.state[name][i].checked = false)
        this.state.checked[name] = []
        break
      }
    }
    for (let [name, groupIDX] of Object.entries(this.state.groupsChecked)) {
      if (oppositeName !== name) { 
        if (!Object.keys(groupIDX).length) {
          break;
        }
        Object.keys(groupIDX).forEach(groupID => {
          this.state.groupsChecked[name][groupID] = false
        })
        break
      }
    }
  }

  openOrCloseGroup = (name, groupID) => event => {
    let isOpen = Object.assign({}, this.state.isOpen)
    isOpen[name][groupID] = !isOpen[name][groupID]
    this.setState({ isOpen })
  }

  handleToggle = (name, index) => event => {
    if (this.stopToggle) return
    this.stopToggle = true
    this.clear(name)
    let fields = [].concat(this.state[name])
    let checked = Object.assign({}, this.state.checked)
    fields[index].checked = !fields[index].checked
    if (fields[index].checked) {
      checked[name].push(index)
    } else {
      checked[name] = checked[name].filter(i => i !== index)
    }
    this.setState({[name]: fields, checked}, () => this.stopToggle = false)
  }

  handleToggleGroup = (name, groupID) => event => {
    if (this.stopToggle) return
    this.clear(name)
    let fields = [].concat(this.state[name])
    let checked = Object.assign({}, this.state.checked)
    let groupsChecked = Object.assign({}, this.state.groupsChecked)
    groupsChecked[name][groupID] = !groupsChecked[name][groupID]
    fields.forEach((field, index) => {
      if (field.group_id == groupID) {
        field.checked = groupsChecked[name][groupID]
        if (field.checked) {
          checked[name].push(index)
        } else {
          checked[name] = checked[name].filter(i => i !== index)
        }
      }
    })
    this.setState({ groupsChecked, fields, checked }, () => this.stopToggle = false)
  }

  addTo = () => {
    if (this.stopAddTo) return
    this.stopAddTo = true
    let nameFrom 
    let nameTo
    for(let [name, indexes] of Object.entries(this.state.checked)) {
      if (indexes.length) {
        nameFrom = name
      } else {
        nameTo = name
      }
    }
    let from = [].concat(this.state[nameFrom])
    let to = [].concat(this.state[nameTo])
    let checked = Object.assign({}, this.state.checked)
    let groupsChecked = Object.assign({}, this.state.groupsChecked)
    let isOpen = Object.assign({}, this.state.isOpen)
    to.unshift(...checked[nameFrom].map(i => from[i]))
    if (this.props.groupBy) {
      checked[nameFrom].forEach(i => {
        groupsChecked[nameFrom][from[i].group_id] = false;
        groupsChecked[nameTo][from[i].group_id] = true;
        isOpen[nameTo] = Object.assign({}, isOpen[nameFrom])
      })
    }
    checked[nameFrom].sort((a, b) => b - a).forEach(i => from.splice(i, 1))
    checked[nameTo] = Array.from(new Array(checked[nameFrom].length)).map((_, i) => i)
    checked[nameFrom] = []
    this.setState(
      {[nameFrom]: from, [nameTo]: to, isOpen, groupsChecked, checked},
      () => {
        const elem = ReactDOM.findDOMNode(this.refs[nameTo])
        elem && elem.scrollTo(0, 0)
        this.props.onChange(this.state.selected)
        this.stopAddTo = false
      }
    )
  }

  isChecked() {
    for(let indexes of Object.values(this.state.checked)) {
      if (indexes.length) {
        return true
      }
    }
    return false
  }

  onScroll = (name) => ({target}) => {
    if (name !== "list") return
    if (!this.state.loading && target.scrollTop >= target.scrollHeight - target.offsetHeight) {
      if (this.state.page < this.state.paginate.count_page) {
        this.getList({page: this.state.page + 1})
      }
    }
  }

  onSearch = (keyword) => {
    this.getList({page:1, keyword, update: false})
  }

  _renderGroupSelectList(title, name) {
    const { classes } = this.props
    const list = this.state[name]
    let groups = {}

    list.forEach((it, index) => {
      if (!groups[it.group_id]) {
        groups[it.group_id] = [];
      }
      groups[it.group_id].push(
        (
          <ListItem 
            key={index} 
            button 
            onClick={this.handleToggle(name, index)}
            className={classes.nested}
          >
            <Checkbox
              checked={!!it.checked}
              tabIndex={-1}
              onChange={this.handleToggle(name, index)}
            />
            <ListItemText>{it.label}</ListItemText>
          </ListItem>
        )
      )
    })

    return (
      <div className={classes.listWrapper}>
        <Typography>{title}:</Typography>
        <div style={{position: 'relative'}}>
          {this._renderSearchInput(name)}
          {
            name === 'list' && this.state.loading &&
            <Spinner />
          }
          <List
            style={{marginTop: this.state.isSearched && name !== 'list' ? 50 : 'auto'}} 
            onScroll={this.onScroll(name)}
            className={classes.list}
            ref={name}
          >
          {
            Object.entries(groups).map(([groupID, items], index) => (
              <Fragment key={index}>
                <ListItem button onClick={this.openOrCloseGroup(name, groupID)}>
                  <Fragment>
                  <Checkbox
                    checked={!!this.state.groupsChecked[name][groupID]}
                    tabIndex={-1}
                    onChange={this.handleToggleGroup(name, groupID)}
                    onClick={event => event.stopPropagation()}
                  />
                    <ListItemText>{ this.state.groups[groupID] }</ListItemText>
                    {this.state.isOpen[name][groupID] ? <ExpandLess /> : <ExpandMore />}
                  </Fragment>
                </ListItem>
                <Collapse in={this.state.isOpen[name][groupID]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {items}
                  </List>
                </Collapse>
              </Fragment>
            ))
          }
          </List>
        </div>
      </div>
    )
  }

  _renderSearchInput(name) {
    return (
      name === 'list' && this.state.isSearched &&
      <div>
        <SearchInput
          placeHolder="Поиск" 
          keyword={this.state.keyword} 
          onSearch={this.onSearch} 
        />
      </div>
    )
  }

  _renderSelectList(title, name) {
    if (this.props.groupBy) {
      return this._renderGroupSelectList(title, name)
    }
    const { classes } = this.props
    const { toHTML } = this.state
    const list = this.state[name]
    return (
      <div className={classes.listWrapper}>
        <Typography>{title}:</Typography>
        <div style={{position: 'relative'}}>
          {this._renderSearchInput(name)}
          {
            name === 'list' && this.state.loading &&
            <Spinner />
          }
          <List
            style={{marginTop: this.state.isSearched && name !== 'list' ? 50 : 'auto'}} 
            onScroll={this.onScroll(name)}
            className={classes.list}
            ref={name}
          >
            {
              list.map(({label, checked}, index) => (
                <ListItem 
                  key={index}
                  button
                  onClick={this.handleToggle(name, index)}
                >
                  <Checkbox
                    checked={!!checked}
                    tabIndex={-1}
                    onChange={this.handleToggle(name, index)}
                  />
                  { 
                    !toHTML
                    ? <ListItemText>{ label }</ListItemText>
                    : toHTML === "image"
                    ? <img 
                        src={label.replace(/(.*)\.(?:jp?g|png|gif)/ig, '$1_thumb.jpg')} 
                        alt='' 
                        style={{width: 100, height: 100}} 
                      /> 
                    : ["date", "datetime"].indexOf(toHTML) > -1
                    ? label.split(",").map(date => (
                      <ListItemText>{moment(date).format(toHTML === "date" ? "LL": "LLL")}</ListItemText>
                    ))
                    : <div dangerouslySetInnerHTML={{ __html: value }} />
                  }
                </ListItem>
              ))
            }
          </List>
        </div>
      </div>
    )
  }

  render() {
    const { classes, label } = this.props
    return (
      <div className={classes.root}>
        <Typography variant={'body2'}>{label}:</Typography>
        <Divider />
        <div>
          <div className={classes.wrapper}>
            {this._renderSelectList('Выбранно', 'selected')}
            <Button disabled={!this.isChecked()} onClick={this.addTo}>
              <Icon>code</Icon>
            </Button>
            {this._renderSelectList('Доступные', 'list')} 
          </div>
        </div>
        <Divider />
      </div>
    )
  }
}

export default MultySelect;