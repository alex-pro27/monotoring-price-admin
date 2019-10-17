import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import text from '../constants/text';
import { Typography, Box } from '@material-ui/core';
import MultySelect from './MultySelect';
import SearchSelect from './SearchSelect';
import { isObject } from '../helpers/helpres';


const styles = theme => ({
  textField: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    maxWidth: 350
  },
  menu: {
    width: 200,
  },
  button: {
    width: 300,
    display: 'block'
  },
  inlineBlock: {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center'
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
    textButton: "Сохранить",
    customButton: false,
    customButtonOnPress: 0,
  }

  static propTypes = {
    textButton: PropTypes.string,
    fields: PropTypes.object,
    onChangeFields: PropTypes.func,
    onPressButton: PropTypes.func,
    style: PropTypes.object,
    buttonDisabled: PropTypes.bool,
    buttonStyle: PropTypes.object,
    history: PropTypes.object,
    customButton: PropTypes.bool,
    customButtonOnPress: PropTypes.number,
    formIsChanged: (isChanged) => void 0,
    formIsError: (isError) => void 0,
  }

  dateFields = []

  constructor(props) {
    super(props);
    this.state = {
      initFields: _.cloneDeep(props.fields),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.customButtonOnPress && this.props.customButtonOnPress !== nextProps.customButtonOnPress) {
      this.onPressButton();
    }
  }
 
  _isChanged() {
    let isChanged = false;
    for (let [name, { value, required }] of Object.entries(this.props.fields)) {
      if (Array.isArray(value)) {
        if (
          value.length !== this.state.initFields[name].value.length
          || _.differenceBy(value, this.state.initFields[name].value, 'value').length
        ) {
          isChanged = true
          break;
        }
      } else if (isObject(value)) {
        if (value.value !== (this.state.initFields[name].value || {}).value) {
          isChanged = true
          break
        }
      } else {
        const changed = value != this.state.initFields[name].value
        if ((required && !!value && changed) || (!required && changed)) {
          isChanged = true
          break
        }
      }
    }
    this.isChanged !== isChanged && this.props.formIsChanged(isChanged)
    return isChanged;
  }

  _isError() {
    let isError = false
    for (let { error, hidden } of Object.values(this.props.fields)) {
      if (error && !hidden) {
        isError = true
        break
      }
    }
    this.isError !== isError && this.props.formIsError(isError)
    return isError;
  }

  _changeSelect = name => value => {
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
    if(['text', 'string', 'input', 'textarea', 'password'].indexOf(fields[name].type) > -1) {
      fields[name].value = value.toString();
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

  _onBlurTextField = (name) => ({target: {value}}) => {
    if(this.props.fields[name]['blur'] instanceof Function) {
      let fields = Object.assign({}, this.props.fields);
      fields[name].value = fields[name].blur(value);
      this.props.onChangeFields(fields);
    }
  }

  onPressButton() {
    let data = {}
    Object.entries(this.props.fields).forEach(([name, {value, type, convert}]) => {
      let _value
      if (convert instanceof Function) {
        _value = value && convert(value)
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
      ([name, { 
        value, 
        type, 
        label, 
        error, 
        required, 
        itemValue, 
        maxLength, 
        placeHolder, 
        width,
        disabled, 
        contentType, 
        groups, 
        groupBy,
        groupByField,
        options 
      }], index) => {
        if (type == "checkbox") {
          return (
            <Box key={name} className={classes.inlineBlock}>
              <Checkbox
                key={name}
                id={name}
                checked={value}
                disabled={disabled}
                onChange={this._changeCheckBox(name)}
              />
              <label htmlFor={name}><Typography inline={'true'}>{label}</Typography></label>
            </Box>
          )
        } else if (type === 'switch') {
           return (
             <Box key={name} className={classes.inlineBlock}>
              <Switch
                key={name}
                id={name}
                checked={value}
                disabled={disabled}
                onChange={this._changeCheckBox(name)}
                value={value}
              />
              <label htmlFor={name}><Typography inline={'true'}>{label}</Typography></label>
            </Box>
           )
        } else if (type === 'search_select') {
          return (
            <SearchSelect
              key={name}
              width={width}
              required={required}
              label={label}
              disabled={disabled}
              value={value}
              onChange={this._changeSelect(name)}
              placeHolder={placeHolder}
              contentType={contentType}
              options={options}
              itemValue={itemValue}
            />
          )
        } else if (type === 'select') {
          return (
            <TextField
              key={name}
              name={name}
              label={label}
              select
              style={{width: width || 'auto'}}
              required={required}
              value={value.value}
              onChange={({target: value}) => this._changeSelect(name)(value)}
              margin="normal"
              className={classes.textField}
            >
              {
                options.map(({label, value}, i) => (
                  <MenuItem key={i} value={value}>
                    <Typography>{label}</Typography>
                  </MenuItem>
                ))
              }
            </TextField>
          )
        } if (type === "hidden") {
            return <input key={name} value={value} id={name} name={name} type={type} />
        } else if (type === 'multy_select') {
          return (
            <MultySelect
              key={name}
              label={label}
              selected={value}
              contentType={contentType}
              groupBy={groupBy}
              groupByField={groupByField}
              groups={groups}
              history={this.props.history}
              onChange={this._changeSelect(name)}
            />
          )
        } else {
          return (
            <TextField
              key={name}
              id={name}
              autoComplete={""}
              error={!!error}
              style={{width: width || 'auto'}}
              helperText={error}
              disabled={disabled}
              label={label}
              required={required}
              inputProps={{ maxLength }}
              type={type}
              multiline={type === 'text'}
              className={classes.textField}
              value={value || ""}
              onChange={this._checkFields(name)}
              onBlur={this._onBlurTextField(name)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          )
        }
      }
    )
  }

  render() {
    this.isError = this._isError();
    this.isChanged = this._isChanged();
    const { classes, style, buttonStyle, buttonDisabled, textButton, customButton } = this.props;
    return (
      <form style={{paddingHorizontal: 15, paddingBottom: 20, width: '100%', alignItems: 'center', ...style}}>
        {this._renderFields()}
        { !customButton &&
          <Button 
            variant="contained" 
            color="secondary"
            className={classes.button}
            onClick={() => this.onPressButton()}
            style={{marginTop: 30, ...buttonStyle}}
            disabled={buttonDisabled || !this.isChanged || this.isError}
          >
            {textButton}
          </Button>
        }
      </form>
    );
  }
}