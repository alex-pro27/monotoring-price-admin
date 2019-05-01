import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const styles = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}

@withStyles(styles)
class SearchInput extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    placeHolder: PropTypes.string,
  }

  static defaultProps = {
    onChange: () => void 0,
    onSearch: () => void 0
  }

  state = {
    keyword: ""
  }

  onChange = ({target: {value}}) => {
    this.setState({keyword: value})
    this.props.onChange(value)
  }

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root} elevation={1}>
        <InputBase 
          onChange={this.onChange} 
          className={classes.input} 
          placeholder={this.props.placeHolder} 
        />
        <IconButton 
          onClick={() => this.props.onSearch(this.state.keyword)} 
          className={classes.iconButton} 
          aria-label="Search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }
}

export default SearchInput;