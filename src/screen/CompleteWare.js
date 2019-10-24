import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import AppWrapper from '../components/AppWrapper';
import Lightbox from 'react-image-lightbox';
import Spinner from '../components/Spinner';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import permissions from '../constants/permissions'
import { Box } from '@material-ui/core';
import { SERVER_ROOT } from '../constants/config';
import moment from 'moment';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
  image: {
    width: 128,
    height: 128,
    margin: 8,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  buttonControl: {
    padding: theme.spacing(2),
    background: "#fafafa",
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

@AppWrapper
@withStyles(styles)
@inject('contentTypesStore', 'appStore')
export default class CompleteWare extends Component {

  state = {
    fields: {},
    isOpen: false,
    contentTypeID: 0,
    init: false,
    showImage: null,
  }

  disposers = []

  onUpdateSignal() {
    this.selectContentType()
  }
  
  componentWillMount() {
    this.viewId = parseInt(this.props.match.params.id) || 0
    this.route = this.props.appStore.getRoute(this.props.match.path)
    this.isWriteAccess = [permissions.ACCESS, permissions.WRITE].indexOf(this.route.permission.access) > -1
    if (this.route) {
      this.setState({ contentTypeID: this.route.contentTypeID })
      this.selectContentType()
    }
    this.onResize = () => this.forceUpdate()
    window.addEventListener("resize", this.onResize)
    
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize)
    this.disposers.forEach(d => d())
  }

  onClickImg = event => {
    event.stopPropagation()
    if (event.target.src) {
      this.setState({
        isOpen: true,
        showImage: event.target.src.replace(/(.*)_thumb\.(jpe?g|png|gif)/g, "$1.$2")
      })
    }
  }

  selectContentType = () => {
    this.props.contentTypesStore.select({content_type_id: this.route.contentTypeID, id: this.viewId}).then(
      ({fields}) => {
        this.props.setTitle(fields["ware_id"].value.label)
        this.setState({fields, init: true})
      }
    )
  }

  goBack = () => {
    const { history } = this.props;
    const path = history.location.pathname.split('/')[1]
    history.replace('/' + path)
  }

  renderText(label, text) {
    return (
      <Box style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
        <Typography variant="subtitle2" style={{marginRight: 20}} variant="subtitle1">
          {label}:
        </Typography>
        <Typography style={{fontWeight: 'bold'}} variant="subtitle1">
            {text}
          </Typography>
      </Box>
    )
  }

  renderField(field) {
    switch(field.type) {
      case 'checkbox':
        return this.renderText(field.label, field.value ? 'Да': 'Нет')
      case 'datetime-local':
      case 'datetime':
        return this.renderText(field.label, moment(field.value).format('LLL'))
      case 'search_select':
      case 'search_select':
        return this.renderText(field.label, field.value.label)
    }
  }
  
  render() {
    const { classes } = this.props
    return (
      <Box className={classes.root}>
        <Spinner listenLoad={["getFieldsContentType"]} />
        {
          this.state.isOpen && (
            <Lightbox
              mainSrc={this.state.showImage}
              onCloseRequest={() => this.setState({ isOpen: false })}
            />
          )
        }
        <Box className={classes.buttonControl}>
          <Button onClick={this.goBack} variant="outlined" color="secondary">
            <Icon>keyboard_backspace</Icon>
          </Button>
        </Box>
        {this.state.init &&
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            {
              this.state.fields['photos'].value 
              && this.state.fields['photos'].value.map(({label, value}) => (
                <ButtonBase key={value} onClick={this.onClickImg} className={classes.image}>
                  <img
                    className={classes.img} 
                    alt="complex" 
                    src={SERVER_ROOT + label.replace(/(.*)\.(jpe?g|png|gif)/ig, '$1_thumb.$2')}
                  />
                </ButtonBase>
              ))
            }
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography variant="h6">
                    {this.state.fields["ware_id"].value.label}
                  </Typography>
                  {
                    Object.entries(this.state.fields)
                    .filter(([key, _]) => !~['ware_id', 'price', 'photos', 'min_price', 'max_price'].indexOf(key))
                    .map(([key, field]) => (
                      <Box key={key}>
                        {this.renderField(field)}
                      </Box>
                    ))
                  }
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="h5">Цена: {this.state.fields["price"].value}₽</Typography>
                <Typography variant="h5">Макс. цена: {this.state.fields["max_price"].value}₽</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        }
      </Box>
    );
  }
}
