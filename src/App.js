import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import store, { loadFromStorage } from './store';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from './components/SnackbarContent';
import Dialog from './components/Dialog';
import Router from './Router';
import text from './constants/text';
import Spinner from './components/Spinner';
import moment  from 'moment';
import 'moment/locale/ru';
import 'react-image-lightbox/style.css';
import { Box } from '@material-ui/core';

moment.locale("ru")

class App extends Component {

  state = {
    ready: false,
    snackbar: {
      show: false,
      type: "info", // "error" | "warning" | "success" | "info"
      message: "",
    },
    dialog: {
      title: "",
      show: false,
      message: "",
      node: null,
      onClose: () => void 0,
      onOpen: () => void 0,
      onAction: () => void 0,
      yes: "",
      no: "",
      cancel: "",
    }
  }

  constructor(props) {
    super(props);
    window["openMessage"] = this.openMessage;
    window["showDialog"] = this.showDialog;
  }

  componentWillMount() {
    loadFromStorage().then(() => {
      if (store.appStore.isAuth) {
        store.appStore.checkAuth()
        .then(() => store.appStore.getAvailableViews())
        .then(() => store.appStore.setToken(store.appStore.admin.token))
        .catch(() => store.appStore.clearAdmin())
        .finally(
          () => this.setState({ready: true})
        )
      } else {
        this.setState({ready: true})
      }
    })
  }

  showDialog = ({title, message, yes, no, cancel, onClose, onOpen, onAction, node}) => {
    let dialog = Object.assign({}, this.state.dialog);
    dialog.message = message;
    if(yes && no) {
      dialog.yes = typeof yes === "boolean" ? text.OK : yes;
      dialog.no = typeof no === "boolean" ? text.NO: no;
    } else if (yes) {
      dialog.yes = typeof yes === "boolean" ? text.OK : yes;
    } else {
      dialog.cancel = typeof yes === "boolean" ? text.CANCEL : yes;
    }
    if (cancel) {
      dialog.cancel = typeof cancel === "boolean" ? text.CANCEL : cancel;
    }
    dialog.show = true;
    dialog.node = node;
    dialog.title = title;
    typeof onAction == 'function' && (dialog.onAction = onAction);
    typeof onClose == 'function' && (dialog.onClose = onClose);
    typeof onOpen == 'function' && (dialog.onOpen = onOpen);
    this.setState({ dialog });
  }

  openMessage = (message, type = "info") => {
    let snackbar = Object.assign({}, this.state.snackbar);
    snackbar.message = message,
    snackbar.type = type;
    snackbar.show = true;
    this.setState({ snackbar })
  }

  closeDialog = () => {
    const dialog = {
      yes: "",
      no: "",
      onClose: () => void 0,
      onOpen: () => void 0,
      onAction: ans => ans,
      title: "",
      message: "",
      show: false,
      node: null
    }
    this.setState({ dialog });
  }

  closeMessage = () => {
    let snackbar = Object.assign({}, this.state.snackbar);
    snackbar.show = false;
    this.setState({ snackbar });
    this.state.snackbar.message = "",
    this.state.snackbar.type = "info";
  }

  renderDialog() {
    return (
      <Dialog
        {...this.state.dialog}
        close={() => this.closeDialog()}
      />
    )
  }

  render() {
    return (
      <Provider {...store}>
        <MuiThemeProvider>
          <Box>
            <Snackbar
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              open={this.state.snackbar.show}
              autoHideDuration={6000}
              onClose={this.closeMessage}
            >
              <SnackbarContent
                onClose={this.closeMessage}
                variant={this.state.snackbar.type}
                message={this.state.snackbar.message}
              />
            </Snackbar>
            {
              this.state.ready
              ? <Router />
              : <Spinner />
            }
            {this.renderDialog()}
          </Box>
        </MuiThemeProvider>
      </Provider>
    );
  }

}

export default App;