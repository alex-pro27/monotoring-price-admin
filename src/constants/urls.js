/**
 * Авторизация
 */
export const LOGIN = '/api/admin/login';
/**
 * Выход
 */
export const LOGOUT = '/api/admin/logout';
/**
 * Проверка на активность ссесси пользователя
 */
export const CHECK_AUTH = '/api/admin/check-auth';
/**
 * Все пользователи
 */
export const ALL_USERS = '/api/admin/users'
/**
 * Получить все доступные для пользователя вьюхи
 */
export const GET_AVAILABLE_VIEWS = '/api/admin/available-views'
/**
 * Получить доступные таблицы (модели)
 */
export const GET_CONTENT_TYPES = '/api/admin/content-types'

/**
 * Получить список из табилцы по ID content_type
 */
export const ALL_CONTENT_TYPES = '/api/admin/content-types'

/**
 * обработчик ContentType (получение/добавление/редактирование)
 */
export const ACTION_FIELDS_CONTENT_TYPE = '/api/admin/content-type/:action'

/**
 * Websocket админа
 */
export const WS_ADMIN = '/admin'

export const ws_events = {
  
}