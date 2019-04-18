import { 
  LOGIN, 
  LOGOUT, 
  CHECK_AUTH,
  ALL_USERS,
  USER_INFO,
  ALL_VIEWS,
  GET_VIEW,
  GET_AVAILABLE_VIEWS,
  CREATE_VIEW,
} from '../constants/urls';
import RestService from './rest';

let instance = null;

export default class Api {

  _rest = new RestService();

  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  /**
   * Проверить на активность сессии пользователя
   */
  async checkAuth() {
    await this.request(
      () => this._rest.post(CHECK_AUTH, {}, {}),
    )
  }

  /**
   * Авторизация 
   */
  async login({username, password}) {
    return await this.request(
      () => this._rest.post(
        LOGIN, { username, password }, {}, 
        {loadName: 'login'}
      ),
      userInfo => {
        this._rest.setToken(userInfo.token)
        console.log(userInfo)
        return userInfo;
      }
    )
  }

  /**
   * Выход из системы
   */
  async logout() {
    return await this.request(
      () => this._rest.get(
        LOGOUT, {}, {},
        {loadName: 'logout', cacheTimelife: 0}
      ),
      () => this._rest.setToken(null)
    )
  }

  /**
   * Получить всех пользователей
   * @param {*} page Номер страници
   */
  async allUsers(page = null) {
    return this.request(
      () => this._rest.get(
        ALL_USERS, { page }, {},
        {loadName: 'allUsers', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить пользователя
   * @param {*} id ID Пользователя
   */
  async getUserInfo(id) {
    return this.request(
      () => this._rest.get(
        USER_INFO.replace(':id', id),
        {}, {},
        {loadName: 'getUserInfo', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить все доступные для пользователя вьюхи 
   */
  async getAvailableViews() {
    return this.request(
      () => this._rest.get(
        GET_AVAILABLE_VIEWS,
        {}, {},
        {loadName: 'getAvailableViews', cacheTimelife: 0}
      )
    )
  }

  /**
   * Все вьюхи
   */
  async allViews() {
    return this.request(
      () => this._rest.get(
        ALL_VIEWS,
        {}, {},
        {loadName: 'allViews', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить представление по ID
   */
  async getView(id) {
    return this.request(
      () => this._rest.get(
        GET_VIEW.replace(':id', id),
        {}, {},
        {loadName: 'getView', cacheTimelife: 0}
      )
    )
  }

  /**
   * Зарегистрировать вьюху
   * @param {*} param0 
   */
  async createView({ name, route_path, children_idx, prent_id }) {
    return this.request(
      () => this._rest.put(
        CREATE_VIEW,
        {name, route_path, children_idx, prent_id}, {},
        {loadName: 'createView', cacheTimelife: 0}
      )
    )
  }

  async request(fun, clb = null) {
    try {
      const data = this.handleResponse(await fun());
      if(clb instanceof Function) {
        return clb(data)
      }
      return data;
    }
    catch(e) {
      this.handleError(e);
    }
  }

  async handleResponse(response) {
    if (response.data.error) {
      return this.handleError(Error(response.data.message));
    }
    return response.data;
  }

  handleError(e) {
    let message = e.message
    if (e.response) {
      switch(e.response.status) {
        case 403:
          message = "Доступ запрещен";
          break
        case 401:
          message = "Ошибка авторизации";
          break
        case 500:
          message = "Ошибка сервера"
          break
      }
    }
    window.openMessage(message, "error");
    throw e;
  }

}