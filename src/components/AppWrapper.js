import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { observe } from 'mobx';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing.unit * 7 + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9 + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
  },
  activeButton: {
    backgroundColor: "#ffdaa3"
  },
  grow: {
    flexGrow: 1,
  },
  rightblock: {
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'rigth',
    display: 'flex',
    flexDirection: 'row',
  }
});

var drawerState = false

@withStyles(styles, { withTheme: true })
@inject('appStore')
@observer
class AppWrapperComponent extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
  };

  state = {
    open: drawerState,
    title: '',
  }
  
  componentWillMount() {
    this.setPageTitle(this.props.title)
  }

  setPageTitle(title) {
    document.title = title || "Админка"
  }

  setTitle = (title) => {
    this.setPageTitle(title)
    this.setState({ title })
  }

  handleDrawerOpen = () => {
    drawerState = true
    this.setState({ open: drawerState })
  };

  handleDrawerClose = () => {
    drawerState = false
    this.setState({ open: drawerState })
  };

  showConfirmExit() {
    window.showDialog({
      title: "Подтвердите действие",
      message: "Действительно хотите выйти?",
      yes: true,
      cancel: true,
      onAction: ans => ans && this.props.appStore.logout()
    })
  }

  render() {
    const { classes, theme, title, appStore: { routesInMenu, admin } } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: this.state.open,
          })}
        >
          <Toolbar disableGutters={!this.state.open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, {
                [classes.hide]: this.state.open,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography className={classes.grow} variant="h6" color="inherit" noWrap>
              { this.state.title || title }
            </Typography>
            <div className={classes.rightblock}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={
                  () => {
                    this.childComponent.onUpdateSignal 
                    && this.childComponent.onUpdateSignal()
                  }
                }
              >
                <Icon>refresh</Icon>
              </IconButton>
              <Typography style={{color: "white"}} >
                {admin.fullName}
              </Typography>
              <Button 
                onClick={() => this.showConfirmExit()}
                color="inherit">
                Выйти
              </Button>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={classNames(classes.drawer, {
            [classes.drawerOpen]: this.state.open,
            [classes.drawerClose]: !this.state.open,
          })}
          classes={{
            paper: classNames({
              [classes.drawerOpen]: this.state.open,
              [classes.drawerClose]: !this.state.open,
            }),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
            {routesInMenu.map(({title, path, icon}, i) => {
              const tmp = this.props.history.location.pathname.match(/(^\/[^\/]+)/g)
              const rootPath = tmp ? tmp[0] : this.props.history.location.pathname
              return (
                <ListItem 
                  button 
                  disabled={this.props.history.location.pathname === path} 
                  key={i}
                  className={rootPath === path ? classes.activeButton: null}
                  onClick={() => this.props.history.push(path)}
                >
                  <ListItemIcon>
                    <Icon>{icon}</Icon>
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </ListItem>
              )
            })}
          </List>
          <Divider />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {
            React.Children.map(this.props.children, child => {
              const component = React.cloneElement(
                child, 
                {
                  ref: ref => this.childComponent = ref && (ref['wrappedInstance'] || ref),
                  setTitle: this.setTitle,
                }
              )
              return component;
            })
          }
        </main>
      </div>
    );
  }
}

export default function(Component) {
  return props => (
    <AppWrapperComponent {...props}> 
      <Component {...props}/> 
    </AppWrapperComponent>
  )
};