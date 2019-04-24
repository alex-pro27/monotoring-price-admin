import { observable, action, runInAction, computed } from 'mobx';
import _ from "lodash";
import { persist } from 'mobx-persist';
import Api from '../api/api';
import Admin  from './models/Admin';
import Permission  from './models/Permission';
import userStore from './users-store';
import View from './models/View';
import { RegisterRoutes } from '../Router'
import ContentTypes from '../screen/ContentTypes';
import EditContentType from '../screen/EditContentType';

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
      const addRoute = (route, extra={}) => {
        const exchidren = [].concat(extra.children || [])
        routes.push({
          path: route.path,
          component: route.component,
          icon: extra.icon || route.icon,
          menu: route.menu,
          title: extra.name || extra.plural || route.title,
          permission: extra.permission,
        })
        if (Array.isArray(route.children)) {
          route.children.forEach(child => {
            const exchild = exchidren.find((x) => x.path === child.path) || {}
            addRoute(
              {
                 ...child, 
                 path: route.path + child.path, 
                 title: exchild.name || exchild.plural || route.title,
              },
              exchild,
            )
          })
        }
      }
      const accessPerm = Permission.create({access: 7})
      if (this.isSuperUser) {
        const paths = [...this.avilableViews.keys()]
        for (let route of RegisterRoutes) {
          if (paths.indexOf(route.path) === -1) {
            route = {permission: accessPerm, ...route}
            routes.push(route)
          }
        }
        for (let [path, view] of this.avilableViews) {
          let route = RegisterRoutes.find(r => (r.path === path))
          if (route) {
            addRoute(route, view)
          } else {
            routes.push({
              title: view.name,
              path: path,
              permission: view.permission,
              menu: true,
              icon: 'view_carousel',
              component: ContentTypes
            })
            routes.push({
              title: `Добавить ${view.name}`,
              path: path + '/:id',
              permission: view.permission,
              component: EditContentType
            })
          }
        }
      } else {
        RegisterRoutes.forEach(route => {
          const view = this.avilableViews.get(route.path)
          view && addRoute(route, view)
        })
      }
      return routes
    } else {
      return RegisterRoutes
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
        views.forEach((view) => {
          availableViews.set(view.path, View.create(view))
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