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
import { Typography, Box } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Checkbox from '@material-ui/core/Checkbox';
import Spinner from './Spinner';
import SearchInput from './SearchInput';
import moment from 'moment';
import { SERVER_ROOT } from '../constants/config';
import store from '../store';

const MAX_HEIGHT = 450;

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
    maxHeight: MAX_HEIGHT,
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
    history: PropTypes.object,
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
      isLoadedGroupItems: {},
      showImage: null
    }
  }

  lastGroupOpened = {}
  refsGroups = {
    list: {},
    selected: {}
  }

  componentDidMount() {
    this.getList();
  }

  getList({page = this.state.page, keyword = this.state.keyword} = {}) {
    this.setState({loading: true})
    let contentType = this.props.contentType
    if (this.props.groupBy) {
      contentType = this.props.groupBy
    }
    this.props.contentTypesStore
    .getList({page, content_type_name: contentType, keyword})
    .then(contentType => {
      let options = []
      let groups = {}
      let _groups = {}
      let update = this.state.paginate.current_page !== page
      if (keyword !== this.state.keyword) {
        page = 1
        update = false
      }
      this.props.groupBy && (_groups = Object.assign({}, this.props.groups, this.state.groups))
      if (update) {
        if (this.props.groupBy) {
          groups = _groups
        } else {
          options = [].concat(this.state.list)
        }
      } else if (this.props.groupBy) {
        for (let { group_id } of this.state.selected) {
          if (_groups[group_id].toLowerCase().indexOf(keyword) > -1) {
            groups[group_id] = _groups[group_id]
          }
        }
      }
      for (let item of contentType.result) {
        if (this.props.groupBy) {
          groups[item.value] = item.label
        } else {
          if (!this.state.selected.find(({value}) => value === item.value)) {
            options.push(item)
          }
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

  loadItemsInGroup(groupID) {
    return new Promise(resolve => {
      this.props.contentTypesStore
      .getFilteredList({
        field_name: this.props.groupByField, 
        value: groupID,
        content_type_name: this.props.contentType,
      })
      .then(contentType => {
        let list = []
        let selected = [].concat(this.state.selected)
        for (let item of contentType) {
          if (!selected.find(({value}) => item.value === value)) {
            list.push(item)
          }
        }
        list = [...list].concat(this.state.list)
        this.setState({
          list,
          isLoadedGroupItems: Object.assign({[groupID]: true}, this.state.isLoadedGroupItems),
        }, resolve);
      }).finally(() => this.setState({loading: false}))
    })
  }

  openOrCloseGroup = (name, groupID) => event => {
    if (this.state.loading) return;
    let isOpen = Object.assign({}, this.state.isOpen)
    let loading = false
    isOpen[name][groupID] = !isOpen[name][groupID]
    let isNotOpen = false
    const scrollOpenedGroup = () => {
      const groupsWrap = ReactDOM.findDOMNode(this.refs[name])
      const group = ReactDOM.findDOMNode(this.refsGroups[name][groupID])
      groupsWrap && group && groupsWrap.scrollTo(0, groupsWrap.scrollTop + group.offsetTop - groupsWrap.scrollTop - 5)
    }

    if (isOpen[name][groupID]) {
      isNotOpen = !this.lastGroupOpened[name] || !isOpen[name][this.lastGroupOpened[name]]
      if (!isNotOpen) {
        this.scrollOpenedGroup = scrollOpenedGroup
      }
      if (this.lastGroupOpened[name] && this.lastGroupOpened[name] != groupID) {
        isOpen[name][this.lastGroupOpened[name]] = false
      }
      this.lastGroupOpened[name] = groupID
      if (!this.state.isLoadedGroupItems[groupID]) {
        this.loadItemsInGroup(groupID)
        loading = true
      }
    }
    this.setState({ isOpen, loading }, () => isNotOpen && scrollOpenedGroup())
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
    let groupsChecked = Object.assign({}, this.state.groupsChecked)
    if (this.props.groupBy) {
      let isFindingChecked = fields.filter(
        ({group_id, checked}) => group_id == fields[index].group_id && checked
      )
      groupsChecked[name][fields[index].group_id] = !!isFindingChecked.length
    }
    this.setState(
      {[name]: fields, checked, groupsChecked}, 
      () => this.stopToggle = false
    )
  }

  handleToggleGroup = (name, groupID) => event => {
    if (this.stopToggle || this.state.loading) return
    this.clear(name)
    let fields = []
    let checked = Object.assign({}, this.state.checked)
    let groupsChecked = Object.assign({}, this.state.groupsChecked)
    groupsChecked[name][groupID] = !groupsChecked[name][groupID]
    const toggleItems = () => {
      fields = [].concat(this.state[name])
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
    }
    if (!this.state.isLoadedGroupItems[groupID]) {
      this.setState({loading: true})
      this.loadItemsInGroup(groupID).then(() => {
        toggleItems();
        this.setState(
          { groupsChecked, fields, checked, loading: false },
          () => this.stopToggle = false
        )
      })
    } else {
      toggleItems();
      this.setState({ groupsChecked, fields, checked }, () => this.stopToggle = false)
    }
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
        if (!this.props.groupBy) {
          const elem = ReactDOM.findDOMNode(this.refs[nameTo])
          elem && elem.scrollTo(0, 0)
        }
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

  getHref = (value) => {
    let pathUrl;
    for ({content_type_name, path} of store.appStore.avilableViews.values()) {
      if (content_type_name === this.props.contentType) {
        pathUrl = path
        break
      }
    }
    return `${window.location.pathname}#${pathUrl}/${value}`
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
            <a
              href={this.getHref(it.value)}
              onClick={ev => ev.stopPropagation()}
              target="_blank"
              style={{textDecoration: 'none'}}
            >
              <Button>
                <Icon>insert_link</Icon>
              </Button>
            </a>
          </ListItem>
        )
      )
    })

    let _groups = {}
    let _selected = this.state.selected.map(({group_id}) => group_id)
    if (name === "selected") {
      for (let [id, label] of Object.entries(this.state.groups)) {
        if (!_selected.length) {
          break
        }
        for (let i in _selected) {
          if (id == _selected[i]) {
            _groups[id] = label
            _selected.splice(i, 1)
            break
          }
        }
      }
    } else {
      _groups = this.state.groups
    }

    return (
      <Box className={classes.listWrapper}>
        <Typography>{title}:</Typography>
        <Box style={{position: 'relative'}}>
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
            Object.entries(_groups).map(([groupID, groupName], index) => (
              <Box key={index} style={{border: this.state.isOpen[name][groupID] ? 'solid 1px red': null}}>
                <ListItem
                  ref={ref => this.refsGroups[name][groupID] = ref} 
                  button 
                  onClick={this.openOrCloseGroup(name, groupID)}
                >
                  <Fragment>
                    <Checkbox
                      checked={!!this.state.groupsChecked[name][groupID]}
                      tabIndex={-1}
                      onChange={this.handleToggleGroup(name, groupID)}
                      onClick={event => event.stopPropagation()}
                    />
                      <ListItemText>{ groupName }</ListItemText>
                      {this.state.isOpen[name][groupID] ? <ExpandLess /> : <ExpandMore />}
                  </Fragment>
                </ListItem>
                <Collapse 
                  in={this.state.isOpen[name][groupID]} 
                  timeout="auto" 
                  unmountOnExit
                  onExited={() => this.scrollOpenedGroup && (this.scrollOpenedGroup() || (this.scrollOpenedGroup = null))}
                >
                  <List component="div" disablePadding>
                    {
                      groups[groupID] ? groups[groupID]
                      : (
                        <ListItem style={{paddingLeft: 50}}>
                          <ListItemText>Пусто...</ListItemText>
                        </ListItem>
                      )
                    }
                  </List>
                </Collapse>
              </Box>
            ))
          }
          </List>
        </Box>
      </Box>
    )
  }

  _renderSearchInput(name) {
    return (
      name === 'list' && this.state.isSearched &&
      <Box>
        <SearchInput
          placeHolder="Поиск" 
          keyword={this.state.keyword} 
          onSearch={this.onSearch} 
        />
      </Box>
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
      <Box className={classes.listWrapper}>
        <Typography>{title}:</Typography>
        <Box style={{position: 'relative'}}>
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
              list.map(({label, checked, value}, index) => (
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
                        src={SERVER_ROOT + label.replace(/(.*)\.(?:jp?g|png|gif)/ig, '$1_thumb.jpg')} 
                        alt='' 
                        style={{width: 100, height: 100}} 
                      /> 
                    : ["date", "datetime"].indexOf(toHTML) > -1
                    ? label.split(",").map(date => (
                      <ListItemText>{moment(date).format(toHTML === "date" ? "LL": "LLL")}</ListItemText>
                    ))
                    : <div dangerouslySetInnerHTML={{ __html: label }} />
                  }
                  <a 
                    href={this.getHref(value)} 
                    onClick={ev => ev.stopPropagation()}
                    target="_blank"
                    style={{textDecoration: 'none'}}
                  >
                    <Button>
                      <Icon>insert_link</Icon>
                    </Button>
                  </a>
                </ListItem>
              ))
            }
          </List>
        </Box>
      </Box>
    )
  }

  render() {
    const { classes, label } = this.props
    return (
      <Box className={classes.root}>
        <Typography variant={'body2'}>{label}:</Typography>
        <Divider />
        <Box>
          <Box className={classes.wrapper}>
            {this._renderSelectList('Выбранно', 'selected')}
            <Button disabled={!this.isChecked()} onClick={this.addTo}>
              <Icon>code</Icon>
            </Button>
            {this._renderSelectList('Доступные', 'list')} 
          </Box>
        </Box>
        <Divider />
      </Box>
    )
  }
}

export default MultySelect;