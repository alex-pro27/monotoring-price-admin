import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import RSelect from 'react-select';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Paginate from '../store/models/Paginate'

const styles = theme => ({
  root: {
    display: 'inline-block',
    flexGrow: 1,
    height: 48,
    marginTop: '12px',
    marginBottom: '8px',
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    maxWidth: 350,
    width: '80%',
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

@withStyles(styles, { withTheme: true })
@inject("contentTypesStore")
@observer
export default class Select extends Component {
  
  static propsTypes = {
    name: PropTypes.string,
    width: PropTypes.string | PropTypes.number,
    required: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
    }),
    disabled: PropTypes.bool,
    placeHolder: PropTypes.string,
    contentType: PropTypes.string,
    onChange: PropTypes.func,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
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
      options: [],
      init: false,
      page: 1,
      paginate: {}
    }
    this.getList()
  }

  getList(page = 1) {
    this.props.contentTypesStore
    .getList({page, content_type_name: this.props.contentType})
    .then(contentType => {
      let options = [{value: "", label: "Пусто"}]
      this.props.value && options.push(this.props.value)
      for (let item of contentType.result) {
        if (this.props.value && this.props.value.value === item.value) {
          continue
        }
        options.push(item)
      }
      console.log(options)
      this.setState({
        paginate: Paginate.create(contentType.paginate),
        page: page,
        options,
        init: true
      })
    })
  }
  
  render() {
    const { 
      name, 
      width, 
      required, 
      label, 
      disabled,
      placeHolder, 
      value, 
      classes, 
      theme 
    } = this.props

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };
    return (
      this.state.init &&
      <div className={classes.root}>
        <NoSsr>
          <RSelect
            id={name}
            key={name}
            styles={selectStyles}
            components={components}
            classes={classes}
            disabled={disabled}
            textFieldProps={{
              label,
              InputLabelProps: {
                shrink: true,
              },
            }}
            value={value}
            placeholder={placeHolder}
            onChange={(value) => this.props.onChange(value)}
            options={this.state.options}
            isClearable
          />
        </NoSsr>
      </div>
    );
  }
}
