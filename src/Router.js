import React, { Component } from 'react';
import { Router, HashRouter, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history'
import { PublicRoute } from 'react-router-with-props';

import Login from './screen/Login';
import Index from './screen/Index';
import Route404 from './screen/Route404';
import EditContentType from './screen/EditContentType';
// import ContentTypes from './screen/ContentTypes';
import { observer, inject } from 'mobx-react';
import { observe } from 'mobx';
import Monitorings from './screen/Monitorings';

export const history = createBrowserHistory()

export const RegisterRoutes = [
  {
    path: "/",
    component: Index,
    title: "Главная",
    icon: "home",
    menu: true
  },
  {
    path: "/monitorings",
    component: Monitorings,
    menu: true,
    children: [
      {
        path: "/:id",
        component: EditContentType,
      },
    ]
  },
]

@inject('appStore')
@observer
class AppRouters extends Component {

  constructor(props) {
    super(props);
    const { routes, isAuth } = this.props.appStore
    this.state = {
      routes,
      isAuth,
    }
    console.log(history)
    this.disposers = [
      observe(this.props.appStore, 'routes', ({ newValue }) => {
        this.setState({routes: newValue})
      }),
      observe(this.props.appStore, 'isAuth', ({ newValue }) => {
        this.setState({isAuth: newValue});
        !newValue && history.replace("/login")
      }),
    ]
  }

  componentWillUnmount() {
    this.disposers.forEach(d => d())
  }

  render() {
    return (
      <Router history={history} useHash>
        <div>
          <Switch>
            {
              this.state.routes.map(({path, component, title, permission}, i) => {
                return (
                  <PublicRoute
                    key={i}
                    exact
                    path={path}
                    authed={!this.state.isAuth} 
                    redirectTo="/login" 
                    component={component}
                    title={title}
                    permission={permission}
                  />
                )
              })
            }
            <PublicRoute exact path="/login" component={Login} />
            <PublicRoute path="*" component={Route404} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default AppRouters