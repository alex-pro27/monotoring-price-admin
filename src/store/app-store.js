import { observable, action, runInAction, computed } from 'mobx';
import _ from "lodash";
import { persist } from 'mobx-persist';
import Api from '../api/api';
import TornadoWebSocket from '../api/websocket';
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
        routes.push({
          path: route.path,
          component: route.component,
          icon: extra.icon || route.icon,
          menu: extra.menu || route.menu,
          title: extra.name || extra.plural || route.title,
          permission: extra.permission,
        })
        let exchidren = [].concat(extra.children || [])
        if (Array.isArray(route.children)) {
        let children = [].concat(route.children) 
          children.forEach((child, i) => {
            const index = exchidren.findIndex((x) => x.path === child.path)
            const extraChild = exchidren[index] || {}
            let path = route.path
            if (extraChild.view_type === 2) {
              path = route.path + '/:id'
            }
            addRoute({...child, path}, extraChild)
            exchidren.splice(i, index)
          })
        }
        exchidren.forEach(extraChild => {
          let component, title, path
          if (extraChild.view_type === 1) {
            component = ContentTypes
            title = extraChild.plural || name
            path = extraChild.path

          } else if (extraChild.view_type === 2) {
            component = EditContentType
            title = `Добавить ${extraChild.name}`
            path = `${route.path}/:id`
          }
          addRoute({
            path: extraChild.path,
            component,
            icon: "view_carousel",
            title,
            menu: extraChild.menu,
            path 
          }, {
            permission: Permission.create(extraChild.permission),
            children: extraChild.children,
          })
        })
      }
      const accessPerm = Permission.create({access: 7})
      if (this.isSuperUser) {
        for (let route of RegisterRoutes) {
          if (!this.avilableViews.get(route.path)) {
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
              title: view.plural || view.name,
              path: path,
              permission: view.permission,
              menu: true,
              icon: view.icon || 'view_carousel',
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
        let _routes = [].concat(RegisterRoutes)
        RegisterRoutes.forEach((route, i) => {
          if (this.avilableViews.get(route.path)) {
            addRoute(route, this.avilableViews.get(route.path))
            _routes.splice(i, 1)
          }
        })
        for (let [path, view] of this.avilableViews) {
          if (routes.find(r => r.path === path)) {
            continue
          }
          let component, title
          if (view.view_type === 1) {
            component = ContentTypes
            title = view.plural || view.name
          } else if (view.view_type === 2) {
            component = EditContentType
            title = `Добавить ${view.name}`
          }
          addRoute({
            path,
            component,
            icon: view.icon,
            title,
            menu: view.menu,
          }, {
            permission: Permission.create(view.permission),
            children: view.children,
          })
        }
      }
      console.log("routes",routes)
      return routes
    } else {
      return RegisterRoutes
    }
  }

  createSocket() {
    this.socket = new TornadoWebSocket("/api/admin/ws")
    this.socket.on("open", () => {
      this.socket.on("on_connect", message => {
        console.log("on connected", message)
      })
      this.socket.on("on_update_products", message => {
        console.log("on on_update_products", message)
        window.openMessage("Товары обновлены", "success");
      })
      this.socket.emit("connect", {
        token: this.admin.token
      })
    })
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
        () => {
          this.createSocket();
          resolve()
        },
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