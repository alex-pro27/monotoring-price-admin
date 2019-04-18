import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { colors } from '../constants/colors'

const styles = theme => ({
  container: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 15
  },
  button: {
    margin: '0 4px',
    minWidth: '30px'
  }
})

@withStyles(styles)
class PaginateComponent extends Component {

  static defaultProps = {
    maxPages: 9
  }

  static propTypes = {
    paginate: PropTypes.shape({
      count_page: PropTypes.number,
      current_page: PropTypes.number
    }),
    maxPages: PropTypes.number,
    getContent: PropTypes.func,
  }

  render() {
    const { classes, paginate, getContent } = this.props
    const { count_page, current_page } = paginate

    if (count_page > 1) {
      const previous = current_page - 1
      const next = current_page + 1
      let maxPages = this.props.maxPages % 2 > 0 ? this.props.maxPages - 1: this.props.maxPages
      let startPage = 1
      let endPage = maxPages + 1
      let range = count_page > maxPages + 1 ? maxPages + 1 : count_page
      if (count_page > maxPages + 1 && current_page > maxPages / 2) {
        endPage = current_page + maxPages / 2
        if (count_page < endPage) {
          endPage = count_page
        }
        startPage = endPage - maxPages
        range = endPage - startPage + 1
      }

      return (
        <div className={classes.container}>
          <Button 
            variant="outlined" 
            color="primary" 
            className={classes.button}
            disabled={previous < 1}
            onClick={() => getContent(previous)}
          >
            <Icon>arrow_back</Icon>
          </Button>

          {
            Array.from(new Array(range)).map((_, i) => {
              const page = startPage + i;
              return( 
                <Button
                  key={page}
                  variant={page === current_page ? "outlined" : null}
                  color="primary" 
                  className={classes.button}
                  style={{borderColor: colors.PRIMARY}}
                  // style={{borderWidth: page === current? 1 : 0}}
                  disabled={page === current_page}
                  onClick={() => getContent(page)}
                >
                  <Typography>{ page }</Typography>
                </Button>
              )
            })
          }

          <Button 
            variant="outlined" 
            color="primary" 
            className={classes.button}
            disabled={next >= count_page + 1}
            onClick={() => getContent(next)}
          >
            <Icon>arrow_forward</Icon>
          </Button>

        </div>
      )
    } else {
      return null
    }
  }
}

export default PaginateComponent;