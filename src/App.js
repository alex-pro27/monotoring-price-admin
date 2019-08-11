import React, { Component } from 'react';
import { observer } from 'mobx-react';
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

moment.locale("ru")

@observer
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
      yes: "",
      no: ""
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

  showDialog = ({title, message, yes, no, onClose = (ans) => void 0, node}) => {
    let dialog = Object.assign({}, this.state.dialog);
    dialog.message = message;
    if(yes && no) {
      dialog.yes = typeof yes === "boolean" ? text.OK : yes;
      dialog.no = typeof no === "boolean" ? text.CANCEL: no;
    } else if (yes) {
      dialog.yes = typeof yes === "boolean" ? text.OK : yes;
    } else {
      dialog.yes = typeof yes === "boolean" ? text.CANCEL : yes;
    }
    dialog.show = true;
    dialog.node = node;
    dialog.title = title;
    dialog.onClose = ans => onClose(ans) || this.closeDialog();
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
    let dialog = {
      yes: "",
      no: "",
      onClose: (ans) => void 0,
      title: "",
      message: "",
      show: false,
      node: null
    };
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
        show={this.state.dialog.show}
        title={this.state.dialog.title}
        message={this.state.dialog.message}
        onClose={this.state.dialog.onClose}
        yes={this.state.dialog.yes}
        no={this.state.dialog.no}
        node={this.state.dialog.node}
      />
    )
  }

  render() {
    return (
      <Provider {...store}>
        <MuiThemeProvider>
          <div>
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
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }

}

export default App;