import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';


const styles =  theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  menu: {
    width: 200,
  },
});

@withStyles(styles)
export default class Forms extends Component {

  static defaultProps = {
    onChangeFields: (fields) => fields,
    onPressButton: (data) => data,
    buttonDisabled: false,
    buttonStyle: {},
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

  dateFields = [];

  constructor(props) {
    super(props);
    this.state = {
      initFields: _.cloneDeep(props.fields),
    };
  }

  _isChanged() {
    for (let { changed } of Object.values(this.props.fields)) {
      if (changed) return true;
    }
    return false;
  }

  _isChangedAll() {
    let fields = Object.values(this.props.fields).filter(({required, hidden}) => required && !hidden)
    return fields.filter(({ changed }) => changed).length === fields.length;
  }

  _isError() {
    for (let { error, hidden } of Object.values(this.props.fields)) {
      if (error && !hidden) return true;
    }
    return false;
  }

  _changeDropDown = name => value => {
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
    console.log(name, fields[name].value)
    this.props.onChangeFields(fields)
  }

  _checkFields = name => value => {
    console.log(name, value)
    let fields = Object.assign({}, this.props.fields)
    fields[name].value = value
    this.props.onChangeFields(fields)
    return Boolean(fields[name].error)
  }

  onPressButton() {
    let data = {};
    Keyboard.dismiss();
    Object.entries(this.props.fields).forEach(([name, {value, type}]) => {
      let _value;
      if (this.props.fields[name].сonvert instanceof Function) {
        _value = this.props.fields[name].сonvert(value);
      } else {
        _value = value;
      }
      data[name] = _value;
    })
    this.props.onPressButton(data);
    this.setState({initFields: _.cloneDeep(this.props.fields)});
  }

  _renderFields() {
    const { classes } = this.props;
    return Object.entries(this.props.fields).map(
      ([name, { value, type, label, error, required, multiple, maxLength, placeHolder, width, options, hidden, disabled }], index) => {
        if (hidden) return null;
        if (type == "checkbox") {
          return (
            <Checkbox
              checked={value}
              onChange={this._changeCheckBox(name)}
              value="checkedA"
            />
          )
        } else if (type === 'switch') {
          <Switch
            checked={value}
            onChange={this._changeCheckBox(name)}
            value={value}
          />
        } else if (type === 'select') {
          return (
            <TextField
              id={name}
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
        } else {
          return (
            <TextField
              id={name}
              error={error}
              disabled={disabled}
              hidden={hidden}
              label={label}
              maxLength={maxLength}
              multiline={type === 'textarea'}
              className={classes.textField}
              value={value}
              onChange={this._checkFields(name)}
              margin="normal"
            />
          )
          
        }
      }
    );
  }

  render() {
    const isError = this._isError();
    const isChangedAll = this._isChangedAll();
    return (
      <form style={[
          {paddingHorizontal: 15, paddingBottom: 20, width: '100%', alignItems: 'center',},
          this.props.style
      ]}>
        {this._renderFields()}
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => this.onPressButton()}
          style={[{marginTop: 30}, this.props.buttonStyle]}
          disabled={this.props.buttonDisabled || !isChangedAll || isError} 
        >
          {this.props.textButton}
        </Button>
      </form>
    );
  }
}