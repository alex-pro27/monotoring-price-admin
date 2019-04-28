import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    maxWidth: 350
  },
  menu: {
    width: 200,
  },
})

@withStyles(styles)
@inject("contentTypesStore")
@observer
export default class Select extends Component {
  
  static propsTypes = {
    name: PropTypes.string,
    width: PropTypes.string | PropTypes.number,
    required: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    placeHolder: PropTypes.string,
    contentType: propsTypes.string,
    onChange: propsTypes.func,
  }

  static defaultProps = {
    width: 'auto',
    placeHolder: '',
    disabled: false,
    required: false,
    onChange: () => void 0,
  }
  
  constructor(props) {
    super(props);
    this.state = {
      options = [],
    }
    this.getList()
  }

  getList(page = 1) {
    this.props.contentTypesStore
    .getList({page, content_type_name: this.props.contentType})
    .then(contentType => {
      let options = []
      for (let item of contentType.result) {
        if (!this.state.selected.find(({id}) => id === item.id)) {
          options.push(item)
        }
      }
      this.setState({
        paginate: Paginate.create(contentType.paginate),
        page: page,
        options,
      })
    })
  }
  
  render() {
    const { name, width, required, label, disabled, classes, placeHolder } = this.props
    return (
      <TextField
        id={name}
        key={name}
        style={{width}}
        select
        displayEmpty
        required={required}
        label={label}
        disabled={disabled}
        className={classes.textField}
        value={value}
        onChange={({target: {value}}) => this.props.onChange(value)}
        SelectProps={{
          MenuProps: {
            className: classes.menu,
          },
        }}
        helperText={placeHolder}
        margin="normal"
      >
        {this.state.options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
}
