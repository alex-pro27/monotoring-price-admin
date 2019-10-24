import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import AppWrapper from '../components/AppWrapper';
import Spinner from '../components/Spinner';
import Form from '../components/Form';
import { Box, Button, Icon } from '@material-ui/core';
import { observe } from 'mobx';
import permissions from '../constants/permissions'

const styles = theme => ({
  wrapper: {
    ...theme.mixins.gutters(),
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  buttonControl: {
    paddingTop: 20,
    paddingBottom: 20,
    background: "#fafafa",
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
  image: {
    width: 128,
    height: 128,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
})

@AppWrapper
@withStyles(styles)
@inject('contentTypesStore', 'appStore')
@observer
class EditContentType extends Component {

  state = {
    fields: {},
    init: false,
    contentTypeID: 0,
    formIsError: false,
    formIsChanged: true,
    customButtonOnPress: 0,
  }

  onUpdateSignal() {
    this.selectContentType()
  }

  selectContentType = () => {
    this.props.contentTypesStore.select({content_type_id: this.route.contentTypeID, id: this.viewId}).then(
      ({title, fields}) => {
        title && this.props.setTitle(`Редактировать ${title}`)
        this.setState({fields, init: true})
      }
    )
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
    this.disposers = [
      observe(this.props.appStore, "onUpdateProduct", this.selectContentType)
    ]
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize)
    this.disposers.forEach(d => d())
  }

  sendData = (fields, rollback) => {
    this.props.contentTypesStore
    .sendData(this.state.contentTypeID, fields)
    .then(() => window.openMessage("Успешно!", "success"))
    .catch(err => {
      rollback()
      try {
        let message = JSON.parse(err.message)
        let fields = Object.assign({}, this.state.fields)
        Object.entries(message).forEach(([k, v]) => {
          fields[k] && (fields[k].error = v)
        })
        this.setState({fields})
      } catch {}
    })
  }

  goBack = () => {
    const { history } = this.props;
    const path = history.location.pathname.split('/')[1]
    history.replace('/' + path)
  }

  onScroll = ({currentTarget}) => {
    const buttonControl = ReactDOM.findDOMNode(this.refs.buttonControl)
    buttonControl.style.transform = "translate(0,"+ currentTarget.scrollTop + "px)";
  }

  onPressSaveButton = () => {
    this.setState({customButtonOnPress: this.state.customButtonOnPress + 1})
  }

  _renderDelButton() {
    if (this.viewId && this.route && this.route.permission && this.route.permission.access === permissions.ACCESS) {
      return (
        <Button variant="contained" color="secondary" style={{marginLeft: 15}}>
          <Icon>delete</Icon>
        </Button>
      )
    }
  }

  render() {
    const { classes } = this.props;
    const { formIsChanged, formIsError } = this.state;
    return (
      <Box className={classes.wrapper} onScroll={this.onScroll} style={{height: window.innerHeight - 64}}>
        <Spinner listenLoad={['getFieldsContentType', 'sendFieldsContentType',]} />
        <Box className={classes.buttonControl} ref={"buttonControl"}>
          <Button onClick={this.goBack} variant="outlined" color="secondary">
            <Icon>keyboard_backspace</Icon>
          </Button>
          <Box>
            <Button
              disabled={!formIsChanged || formIsError || !this.isWriteAccess} 
              onClick={this.onPressSaveButton}
              variant="contained"
              color="secondary"
            >
              Сохранить
            </Button>
            {this._renderDelButton()}
          </Box>
        </Box>
       {
         this.state.init &&
        <Box>
          <Form
            fields={this.state.fields}
            onPressButton={this.sendData}
            history={this.props.history}
            customButtonOnPress={this.state.customButtonOnPress}
            onChangeFields={fields => this.setState({fields})}
            customButton={true}
            formIsChanged={(formIsChanged) => this.setState({formIsChanged})}
            formIsError={(formIsError) => this.setState({formIsError})}
          />
        </Box>
       }
      </Box>
    )
  }
}

export default EditContentType;
