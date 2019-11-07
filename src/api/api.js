import { 
  LOGIN, 
  LOGOUT, 
  CHECK_AUTH,
  GET_AVAILABLE_VIEWS,
  ALL_CONTENT_TYPES,
  ACTION_FIELDS_CONTENT_TYPE,
  UPDATE_MONITORINGS,
  GET_FILTERED_LIST,
  GET_MONITORING_LIST,
  GET_COMPLETE_WARES,
  GET_TRASH_DATA,
  RECOVERY_FROM_TRASH,
  GET_REPORT,
  GET_ONLINE_USERS,
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
    return await this.request(
      () => this._rest.post(this._rest.getUrl(CHECK_AUTH), {}, {}),
      userInfo => {
        this._rest.setToken(userInfo.token)
        return userInfo;
      }
    )
  }

  /**
   * Авторизация 
   */
  async login({username, password}) {
    return await this.request(
      () => this._rest.post(
        this._rest.getUrl(LOGIN), { username, password }, {}, 
        {loadName: 'login'}
      ),
      userInfo => {
        this._rest.setToken(userInfo.token)
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
        this._rest.getUrl(LOGOUT), {}, {},
        {loadName: 'logout', cacheTimelife: 0}
      ),
      () => this._rest.setToken(null)
    )
  }

  /**
   * Получить все доступные для пользователя вьюхи 
   */
  async getAvailableViews() {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(GET_AVAILABLE_VIEWS),
        {}, {},
        {loadName: 'getAvailableViews', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить удаленные данные
   */
  async getTrashData() {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(GET_TRASH_DATA),
        {}, {},
        {loadName: 'getTrashData', cacheTimelife: 0}
      )
    )
  }

  /**
   * Восстановить удаленную сущность
   */
  async recoveryFromTrashCart(content_type_name, id) {
    return this.request(
      () => this._rest.post(
        this._rest.getUrl(RECOVERY_FROM_TRASH),
        {content_type_name, id}, {},
        {loadName: 'recoveryFromTrash', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить список из табилцы по ID content_type
   * @param {*} content_type_id - content-type
   * @param {*} page - номер страницы
   */
  async allContentTypes({page, content_type_id, content_type_name, keyword, short, order_by, group_by, page_size=100}) {
    console.log("allcontentType", content_type_name, short)
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(ALL_CONTENT_TYPES),
        {page, content_type_id, content_type_name, keyword, short, order_by, group_by, page_size}, {},
        {loadName: 'allContentTypes', cacheTimelife: 0}
      )
    )
  }

  /**
   * Получить отфильтрованный список
   * @param {*} content_type_id - 
   * @param {*} content_type_name - 
   */
  async getFilteredList({content_type_id, content_type_name, field_name, value}) {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(GET_FILTERED_LIST),
        {content_type_id, content_type_name, field_name, value},
        {loadName: 'getFilteredList', cacheTimelife: 0}
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
        this._rest.getUrl(ACTION_FIELDS_CONTENT_TYPE.replace(':action', id)),
        {content_type_id}, {},
        {loadName: 'getFieldsContentType', cacheTimelife: 0}
      )
    )
  }

  async getCompleteWares(
    {datefrom, dateto, page, order_by, 
      regions, work_groups, monitoring_shops, 
      monitoring_types, keywords
    }, report = false) {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(report ? GET_REPORT : GET_COMPLETE_WARES),
        { 
          datefrom,
          dateto,
          page,
          order_by,
          keywords,
          regions: regions.join(','),
          work_groups: work_groups.join(','),
          monitoring_shops: monitoring_shops.join(','),
          monitoring_types: monitoring_types.join(','),
        }, {},
        { loadName: 'getCompleteWares', cacheTimelife: 0 }
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
    const action = method === 'put' ? `${content_type_id}/create` : content_type_id + '/' + fields.id;
    return this.request(
      () => this._rest[method](
        this._rest.getUrl(ACTION_FIELDS_CONTENT_TYPE.replace(':action', action)),
        {fields: JSON.stringify(fields)}, {},
        {loadName: 'sendFieldsContentType', cacheTimelife: 0}
      )
    )
  }

  async updateMonitorings(file, monitoring_idx, is_update = false) {
    return this.request(
      () => this._rest.post(
        this._rest.getUrl(UPDATE_MONITORINGS), 
        {update_wares: file, monitoring_idx, is_update}, {}, {loadName: "updateMonitorings", cacheTimelife: 0}
      )
    )
  }

  async getMonitrongsList() {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(GET_MONITORING_LIST),
        {}, {}, {loadName: "getMonitrongsList", cacheTimelife: 0}
      )
    )
  }

  async getOnlineUsers() {
    return this.request(
      () => this._rest.get(
        this._rest.getUrl(GET_ONLINE_USERS),
        {}, {}, {loadName: "getOnlineUsers", cacheTimelife: 0}
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
        case 502:
            message = "Нет ответа от сервера"
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