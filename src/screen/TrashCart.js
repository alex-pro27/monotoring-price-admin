import React, { Component } from 'react';
import { withStyles, Icon } from '@material-ui/core';
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AppWrapper from '../components/AppWrapper';
import { inject, observer } from 'mobx-react';
import Spinner from '../components/Spinner';
import moment from 'moment';

const styles = theme => ({
  root: {

  },
  tableWarapper: {
    overflow: 'auto',
    marginTop: 25,
  },
  tableHead: {
    backgroundColor: theme.palette.grey['200']
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
  },
  tableCell: {
    minHeight: "48px",
    textAlign: 'left',
    padding: "12px 15px"
  },
})

@AppWrapper
@withStyles(styles)
@inject('appStore')
@observer
class TrashCart extends Component {

  state = {
    data: []
  }

  componentDidMount() {
    this.getTrashData()
  }

  getTrashData = () => {
    this.props.appStore.api.getTrashData()
    .then(data => this.setState({ data: Object.values(data) }))
  }

  recovery = (content_type_name, id) => () => {
    this.props.appStore.api
    .recoveryFromTrashCart(content_type_name, id)
    .then(this.getTrashData)
  }

  onUpdateSignal = () => {
    this.getTrashData()
  }
  
  render() {
    const { classes } = this.props
    return (
      <Box className={classes.root}>
        <Spinner listenLoad={["getTrashData", "recoveryFromTrash"]} />
        {
          this.state.data.map(({ title, results, content_type_name }) => (
            <Paper key={content_type_name} className={classes.tableWarapper}>
              <Typography style={{marginLeft: 15}} variant="h6">{title}</Typography>
              <Table>
                <TableHead className={classes.tableHead}>
                  <TableRow className={classes.tableRow}>
                  {
                    ["Наименование", "Дата удаления", ""].map((name, i) => (
                      <TableCell key={i} className={classes.tableCell}>
                        <Typography>{name}</Typography>
                      </TableCell>
                    ))
                  }
                  </TableRow>
                </TableHead>
                <TableBody>
                {
                  results.map(({label, value, deleted_at}, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                    {
                      [label, moment(deleted_at).format("LLL")].map((cell, j) => (
                        <TableCell key={`${i}_${j}`} className={classes.tableCell}>
                          <Typography>{cell}</Typography>
                        </TableCell>
                      ))
                    }
                    <TableCell className={classes.tableCell}>
                      <IconButton onClick={this.recovery(content_type_name, value)}>
                        <Icon>restore_from_trash</Icon>
                      </IconButton>
                    </TableCell>
                    </TableRow>
                  ))
                }
                </TableBody>
              </Table>
            </Paper>
          ))
        }
      </Box>
    );
  }
}


export default TrashCart;