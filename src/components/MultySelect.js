import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paginate from '../store/models/Paginate';
import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({
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
    maxHeight: 300,
    overflow: 'auto',
  },
  listWrapper: {
    width: '50%'
  }
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
      paginate: {},
      selected: this.props.selected || [],
      checked: {
        list: [],
        selected: [],
      },
    }
    this.getList();
  }

  getList(page = 1) {
    this.props.contentTypesStore
    .getList({page, content_type_name: this.props.contentType})
    .then(contentType => {
      let list = []
      for (let item of contentType.result) {
        if (!this.state.selected.find(({value}) => value === item.value)) {
          list.push(item)
        }
      }
      this.setState({
        paginate: Paginate.create(contentType.paginate),
        page: page,
        list,
      })
    })
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
  }

  handleToggle = (name, index) => () => {
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
    to.unshift(...checked[nameFrom].map(i => from[i]))
    checked[nameFrom].sort((a, b) => b - a).forEach(i => from.splice(i, 1))
    checked[nameTo] = Array.from(new Array(checked[nameFrom].length)).map((_, i) => i)
    checked[nameFrom] = []
    this.setState(
      {[nameFrom]: from, [nameTo]: to, checked}, 
      () => {
        ReactDOM.findDOMNode(this[nameTo]).scrollTo(0, 0)
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

  _renderSelectList(title, name) {
    const { classes } = this.props
    const list = this.state[name]
    return (
      <div className={classes.listWrapper}>
        <Typography>{title}:</Typography>
        <List className={classes.list} ref={ref => this[name] = ref} >
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
                  disableRipple
                />
                <ListItemText>{ label }</ListItemText>
              </ListItem>
            ))
          }
        </List>
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