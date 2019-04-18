import { observable, action, runInAction, computed } from 'mobx';
import _ from "lodash";
import { persist } from 'mobx-persist';
import Api from '../api/api';
import Admin  from './models/Admin';
import Permission  from './models/Permission';
import userStore from './users-store';
import text from '../constants/text';
import View from './models/View';
import { RegisterRouters } from '../Router'

class AppStore {

  api = new Api()
  socket = null
  @persist('object', Admin) @observable admin;
  @observable avilableViews = new Map()

  @computed get routesInMenu() {
    return this.routes.filter(({ menu }) => menu)
  }

  @computed get isAuth() {
    return Boolean(this.admin)
  } 

  @computed get isSuperUser() {
    return this.isAuth && this.admin.is_super_user
  }

  @computed get routes() {
    if (this.isAuth) {
      let routes = []
      RegisterRouters.forEach(route => {
        const view = this.avilableViews.get(route.path);
        if (view || this.isSuperUser) {
            routes.push({
            title: view && view.name || route.title,
            component: route.component,
            permission: this.isSuperUser ? Permission.create({access: 7}) : view && view.permission,
            icon: route.icon,
            menu: route.menu,
            path: route.path,
          })
        }
      })
      return routes
    } else {
      return RegisterRouters
    }
  }

  login({username, password}) {
     return new Promise(resolve => {
      this.api.login({username, password})
      .then(userData => {
        console.log(userData)
        runInAction(() => this.admin = Admin.create(userData))
        this.setToken(userData.token)
        return this.getAvailableViews()
      })
      .then(resolve)
      .catch(this.clearAdmin)
     })
  }

  getAvailableViews() {
    return new Promise((resolve, reject) => {
      this.api.getAvailableViews()
      .then(views => {
        let availableViews = new Map()
        Object.entries(views).forEach(([k, v]) => {
          availableViews.set(k, View.create({...v, route_path: k}))
        })
        if (this.admin.is_super_user || availableViews.size > 0) {
          runInAction(() => this.avilableViews = availableViews)
          resolve()
        } else {
          this.logout()
          reject()
        }
      })
      .catch((e) => {
        console.error(e)
        this.logout()
        reject()
      })
    })
  }

  setToken(token) {
    this.api._rest.setToken(token)
  }

  checkAuth() {
    return new Promise((resolve, reject) => {
      this.api.checkAuth().then(
        () => resolve(),
        () => {
          this.logout()
          reject()
        },
      )
    })
  }

  logout() {
    this.api.logout().then(() => {
      this.clearAdmin();
      this.avilableViews = new Map();
      userStore.clear();
    })
  }

  @action clearAdmin = () => {
    this.admin = null;
  }

}

export default new AppStore();