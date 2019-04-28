import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';

import text from '../constants/text';
import { Typography } from '@material-ui/core';
import MultySelect from './MultySelect';


const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    maxWidth: 350
  },
  menu: {
    width: 200,
  },
  button: {
    width: 300,
    display: 'block'
  }
});

@withStyles(styles)
export default class Forms extends Component {

  static defaultProps = {
    onChangeFields: (fields) => fields,
    onPressButton: (data) => data,
    buttonDisabled: false,
    buttonStyle: {},
    style: {},
    textButton: "Сохранить"
  }

  static propTypes = {
    textButton: PropTypes.string,
    fields: PropTypes.object,
    onChangeFields: PropTypes.func,
    onPressButton: PropTypes.func,
    style: PropTypes.object,
    buttonDisabled: PropTypes.bool,
    buttonStyle: PropTypes.object,
  }

  dateFields = []

  constructor(props) {
    super(props);
    this.state = {
      initFields: _.cloneDeep(props.fields),
    }
  }

  _isChanged() {
    for (let [name, { value, required }] of Object.entries(this.props.fields)) {
      if (Array.isArray(value)) {
        if (
          value.length !== this.state.initFields[name].value.length
          || _.differenceBy(value, this.state.initFields[name].value, 'id').length
          ) {
          return true
        }
      } else {
        const changed = value != this.state.initFields[name].value
        if ((required && !!value && changed) || (!required && changed)) {
          return true
        }
      }
      
    }
    return false;
  }

  _isError() {
    for (let { error, hidden } of Object.values(this.props.fields)) {
      if (error && !hidden) return true;
    }
    return false;
  }

  _changeMultySelect = name => (value) => {
    let fields = Object.assign({}, this.props.fields)
    fields[name].value = value
    fields[name].onChange && fields[name].onChange(value)
    this.props.onChangeFields(fields)
  }

  _changeDropDown = name => ({target: {value}}) => {
    let fields = Object.assign({}, this.props.fields)
    fields[name].value = value
    fields[name].onChange && fields[name].onChange(value)
    this.props.onChangeFields(fields)
  }

  _changeCheckBox = name => () => {
    let fields = Object.assign({}, this.props.fields)
    fields[name].value = !fields[name].value
    fields[name].changed = fields[name].value
    fields[name].onChange && fields[name].onChange(value)
    this.props.onChangeFields(fields)
  }

  _checkFields = name => ({target: {value}}) => {
    let fields = Object.assign({}, this.props.fields);
    const oldValue = fields[name].value;
    fields[name].error = null;
    fields[name].value = value;
    fields[name].changed = true;
    if (
      value && fields[name].transform
      && ((oldValue && oldValue.toString().substr(0, oldValue.length - 1) !== value)
      || !oldValue)
    ) {
      value = fields[name].transform(value)
    }

    if(['input', 'textarea', 'password'].indexOf(fields[name].type) > -1) {
      fields[name].value = value.toString().trim();
      if (fields[name].required && fields[name].value.length < (fields[name].minLength || 1)) {
        fields[name].error = text.ERROR_EMPTY_FIELD;
      }
      fields[name].changed = fields[name].value && this.state.initFields[name].value !== fields[name].value;
    }

    if (!fields[name].error && fields[name].check) {
      const args = fields.type === 'password' 
      ? [fields[name].value, fields.password.value]
      : fields[name].value;
      fields[name].error = fields[name].check(args)
    }
    
    this.props.onChangeFields(fields)
  }

  onPressButton() {
    let data = {}
    Object.entries(this.props.fields).forEach(([name, {value, type, сonvert}]) => {
      let _value;
      if (сonvert instanceof Function) {
        _value = сonvert(value)
      } else {
        _value = value;
      }
      data[name] = _value;
    })
    
    const initFields = _.cloneDeep(this.state.initFields);
    this.setState({initFields: _.cloneDeep(this.props.fields)});
    this.props.onPressButton(data, () => this.setState({ initFields }));
  }

  _renderFields() {
    const { classes, fields } = this.props;
    return Object.entries(fields).map(
      ([name, { value, type, label, error, required, multiple, maxLength, placeHolder, width, options, disabled, contentType }], index) => {
        if (type == "checkbox") {
          return (
            <div key={name}>
              <Checkbox
                id={name}
                checked={value}
                disabled={disabled}
                onChange={this._changeCheckBox(name)}
              />
              <label htmlFor={name}><Typography inline>{label}</Typography></label>
            </div>
          )
        } else if (type === 'switch') {
           return (
             <div key={name}>
              <Switch
                id={name}
                checked={value}
                disabled={disabled}
                onChange={this._changeCheckBox(name)}
                value={value}
              />
              <label htmlFor={name}><Typography inline>{label}</Typography></label>
            </div>
           )
        } else if (type === 'select') {
          return (
            <TextField
              id={name}
              key={name}
              style={{width: width || 'auto'}}
              select
              displayEmpty
              required={required}
              label={label}
              multiple={multiple}
              disabled={disabled}
              className={classes.textField}
              value={value}
              onChange={this._changeDropDown(name)}
              SelectProps={{
                MenuProps: {
                  className: classes.menu,
                },
              }}
              helperText={placeHolder}
              margin="normal"
            >
              {options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) 
        } if (type === "hidden") {
          return <input key={name} value={value} id={name} name={name} type={type} />
        } else if (type === 'multy_select') {
          return (
            <MultySelect
              key={name}
              name={name}
              label={label}
              selected={value}
              contentType={contentType}
              onChange={this._changeMultySelect(name)}
            />
          )
        } else {
          return (
            <TextField
              key={name}
              id={name}
              error={!!error}
              style={{width: width || 'auto'}}
              helperText={error}
              disabled={disabled}
              label={label}
              required={required}
              inputProps={{maxLength: maxLength}}
              multiline={type === 'textarea'}
              className={classes.textField}
              value={value}
              onChange={this._checkFields(name)}
              margin="normal"
            />
          )
        }
      }
    )
  }

  render() {
    const isError = this._isError();
    const isChanged = this._isChanged();
    const { classes, style, buttonStyle, buttonDisabled, textButton } = this.props;
    return (
      <form style={{paddingHorizontal: 15, paddingBottom: 20, width: '100%', alignItems: 'center', ...style}}>
        {this._renderFields()}
        <Button 
          variant="contained" 
          color="secondary"
          className={classes.button}
          onClick={() => this.onPressButton()}
          style={{marginTop: 30, ...buttonStyle}}
          disabled={buttonDisabled || !isChanged || isError}
        >
          {textButton}
        </Button>
      </form>
    );
  }
}