import React, { Component } from 'react';
import AsyncSelect from 'react-select/lib/Async';
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
    <Paper square onScroll={props.selectProps.onScroll} className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  )
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
export default class SearchSelect extends Component {
  
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
    multiple: PropTypes.bool,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number,
        label: PropTypes.string,
      })
    )
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
      paginate: {},
      keyword: null,
    }
    if (!this.props.contentType) {
      this.state.options = this.props.options || []
      this.state.init = true
    }
  }

  getList({page = this.state.page, keyword = null, callback = null}) {
    this.loading = true
    this.props.contentTypesStore
    .getList({page, content_type_name: this.props.contentType, keyword})
    .then(contentType => {
      let options = []
      let update = this.state.paginate.current_page !== page
      if (keyword !== this.state.keyword) {
        page = 1
        update = false
      }
      if (update) {
        options = this.state.options
      }
      if (!update && !this.props.required) {
        options.push({value: "", label: "Пусто"})
      }
      if (!update) {
        this.props.value && options.push(this.props.value)
      } 
      for (let item of contentType.result || []) {
        if (this.props.value && this.props.value.value === item.value) {
          continue
        }
        options.push(item)
      }
      if (!this.state.init) {
        this.state.paginate = Paginate.create(contentType.paginate)
      }
      this.setState({
        page,
        options,
        keyword,
        init: true,
      }, () => typeof callback === 'function' && callback(this.state.options))
    }).finally(() => this.loading = false)
  }

  loadOptions = (keyword, callback) => {
    if (!this.props.contentType || this.state.page === this.state.paginate.count_page) { 
      const res = this.state
      .options
      .filter(({label}) => label.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
      callback(res)
    } else {
      this.getList({keyword, callback})
    }
  }

  onScroll = ({target}) => {
    if (!this.loading && target.scrollTop >= target.scrollHeight - target.offsetHeight - 500) {
      if (this.state.page < this.state.paginate.count_page) {
        this.setState({page: this.state.page + 1}, () => {
          this.refs.async.setState({ isLoading: true })
          this.refs.async.loadOptions('', (options) => {
            this.refs.async.setState({ defaultOptions: [].concat(options) || [], isLoading: false })
          })
        })
      }
    }
  }
  
  render() {
    const {
      name, 
      width, 
      required,
      multiple,
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
    }
    return (
      <div className={classes.root}>
        <NoSsr>
          <AsyncSelect
            id={name}
            key={name}
            ref={'async'}
            styles={selectStyles}
            onScroll={this.onScroll}
            components={components}
            classes={classes}
            disabled={disabled}
            isMulti={multiple}
            textFieldProps={{
              label,
              InputLabelProps: {
                shrink: true,
              },
            }}
            value={value}
            placeholder={placeHolder}
            onChange={(value) => this.props.onChange(value)}
            cacheOptions
            defaultOptions
            loadOptions={this.loadOptions}
            isClearable
          />
        </NoSsr>
      </div>
    );
  }
}
