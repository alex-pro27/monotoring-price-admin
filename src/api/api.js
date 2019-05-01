import { 
  LOGIN, 
  LOGOUT, 
  CHECK_AUTH,
  ALL_USERS,
  GET_AVAILABLE_VIEWS,
  ALL_CONTENT_TYPES,
  ACTION_FIELDS_CONTENT_TYPE,
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
   * Получить список из табилцы по ID content_type
   * @param {*} id - content-type
   * @param {*} page - номер страницы
   */
  async allContentTypes({page, content_type_id, content_type_name, keyword, short, order_by}) {
    console.log("allcontentType", content_type_name, short)
    return this.request(
      () => this._rest.get(
        ALL_CONTENT_TYPES,
        {page, content_type_id, content_type_name, keyword, short, order_by}, {},
        {loadName: 'allContentTypes', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить поля для редактирования
   * @param {*} id
   * @param {*} content_type_id 
   */
  async getFieldsContentType({id, content_type_id}) {
    return this.request(
      () => this._rest.get(
        ACTION_FIELDS_CONTENT_TYPE.replace(':action', id),
        {content_type_id}, {},
        {loadName: 'getFieldsContentType', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить поля для редактирования
   * @param {*} id
   * @param {*} content_type_id 
   */
  async sendFieldsContentType(content_type_id, fields, del = false) {
    const method = del ? 'delete': fields.id === 0 ? 'put' : 'post';
    let action = method === 'put' ? 'create' : fields.id
    return this.request(
      () => this._rest[method](
        ACTION_FIELDS_CONTENT_TYPE.replace(':action', action),
        {content_type_id, fields: JSON.stringify(fields)}, {},
        {loadName: 'sendFieldsContentType', cacheTimelife: 0}
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
    if (!message.match(/^{.*}$/)) {
      window.openMessage(message, "error")
    } else {
      window.openMessage("Ошибка", "error")
    }
    throw e;
  }

}