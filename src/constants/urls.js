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
 * Создать пользователя
 */
export const CREATE_USER = '/api/admin/create-user'
/**
 * Информация о пользователе
 */
export const USER_INFO = '/api/admin/user/:id'
/**
 * Все роли
 */
export const ALL_ROLES = '/api/admin/roles'
/**
 * Создать Роль
 */
export const CREATE_ROLE = '/api/admin/create-role'
/**
 * Получить Роль
 */
export const GET_ROLE = '/api/admin/role/:id'
/**
 * Получить все доступные для пользователя вьюхи
 */
export const GET_AVAILABLE_VIEWS = '/api/admin/available-views'
/**
 * Все вьюъи
 */
export const ALL_VIEWS = '/api/admin/views'
/**
 * Все вьюъи
 */
export const GET_VIEW = '/api/admin/view/:id'
/**
 * Добавить вьюху
 */
export const CREATE_VIEW = '/api/admin/create-view'

/**
 * Websocket админа
 */
export const WS_ADMIN = '/admin'

export const ws_events = {
  
}