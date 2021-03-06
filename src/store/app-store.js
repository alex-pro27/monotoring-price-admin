import { observable, action, runInAction, computed } from 'mobx';
import _ from "lodash";
import { persist } from 'mobx-persist';
import Api from '../api/api';
import TWebSocket from '../api/websocket';
import Admin  from './models/Admin';
import Permission  from './models/Permission';
import monitoringStore from './monitoring-store';
import View from './models/View';
import { RegisterRoutes } from '../Router'
import ContentTypes from '../screen/ContentTypes';
import EditContentType from '../screen/EditContentType';
import roleTypes from '../constants/roles';

class AppStore {

  api = new Api()
  socket = null
  @persist('object', Admin) @observable admin;
  @observable avilableViews = new Map()
  @observable onUpdateProduct = 0;
  @observable onlineUsers = []
  _routes = []

  @action clearAdmin = () => {
    this.admin = null;
  }

  @action setOnlineUsers = (users) => {
    this.onlineUsers = users.map(u => Admin.create(u))
  }

  @action addOnlineUser(user) {
    this.onlineUsers = [user].concat(this.onlineUsers)
  }

  @action rmOnlineUser(user_id) {
    this.onlineUsers = this.onlineUsers.filter(({ id }) => id !== user_id)
  }

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
          contentTypeID: extra.content_type_id,
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
            content_type_id: extraChild.content_type_id,
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
              contentTypeID: view.content_type_id,
              menu: true,
              icon: view.icon || 'view_carousel',
              component: ContentTypes
            })
            routes.push({
              title: `Добавить ${view.name}`,
              path: path + '/:id',
              permission: view.permission,
              contentTypeID: view.content_type_id,
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
            contentTypeID: view.content_type_id,
            title,
            menu: view.menu,
          }, {
            permission: Permission.create(view.permission),
            children: view.children,
          })
        }
      }
      this._routes = routes
    } else {
      this._routes = RegisterRoutes
    }
    return this._routes
  }

  createSocket() {
    if (!this.admin) return;
    this.socket = new TWebSocket("/api/admin/ws")
    this.socket.on("open", () => {
      this.socket.on("connect", message => {
        console.log("on connected", message)
      })
      this.socket.on("update_products", ({message, error}) => {
        console.log("on update_products", message)
        window.openMessage(message, error ? "error" : "success");
        if (!error) {
          runInAction(() => this.onUpdateProduct++);
        }
      })
      this.socket.on("client_joined", ({user}) => {
        user = Admin.create(user)
        console.log("client_joined", user.fullName)
        this.addOnlineUser(Admin.create(user))
        window.openMessage(`Пользователь ${user.fullName} присоединился`, "success");
      })
      this.socket.on("client_leaved", ({user_id, full_name}) => {
        console.log("client_leaved", full_name)
        window.openMessage(`Пользователь ${full_name} покинул админ панель`, "success");
        this.rmOnlineUser(user_id)
      })
      this.socket.on("onopen", () => {
        console.log("connected open")
      })
      this.socket.on("logout", () => {
        this.socket.close()
        this.logout()
      })
      this.socket.emit("connect", {
        token: this.admin.token
      })
    })
  }

  getOnlineUsers(update) {
    if (update || this.onlineUsers.length === 0) {
      this.api.getOnlineUsers().then(this.setOnlineUsers)
    }
  }

  getRoute(pathMatch) {
    return this._routes.find(({ path }) => path === pathMatch)
  }

  login({username, password}) {
     return new Promise(resolve => {
      this.api.login({username, password})
      .then(userData => {
        runInAction(() => this.admin = Admin.create(userData))
        this.setToken(userData.token)
        if (this.admin.roles && 
          this.admin.roles.find(x => ~[roleTypes.ADMIN, roleTypes.MANAGER].indexOf(x.role_type))) {
          this.createSocket();
        }
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
          console.log(availableViews)
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
        userData => {
          runInAction(() => this.admin = Admin.create(userData))
          if (this.admin.roles && this.admin.roles.find(x => ~[1,2].indexOf(x.role_type))) {
            this.createSocket();
          }
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
    if (this.socket && !this.socket.closed) {
      this.socket.emit("logout", {
        token: this.admin.token
      })
      this.socket.close()
    }
    this.api.logout().then(() => {
      this.clearAdmin();
      this.avilableViews = new Map();
      monitoringStore.clear();
    })
    
  }

}

export default new AppStore();