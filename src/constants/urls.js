import { SERVER_ROOT } from "./config";

/**
 * Авторизация
 */
export const LOGIN = 'admin/login';
/**
 * Выход
 */
export const LOGOUT = 'admin/logout';
/**
 * Проверка на активность ссесси пользователя
 */
export const CHECK_AUTH = 'admin/check-auth';
/**
 * Все пользователи
 */
export const ALL_USERS = 'admin/users'
/**
 * Получить все доступные для пользователя вьюхи
 */
export const GET_AVAILABLE_VIEWS = 'admin/available-views'
/**
 * Получить список из табилцы по ID content_type
 */
export const ALL_CONTENT_TYPES = 'admin/content-types'

/**
 * Получить отфильтрованный список из табилцы по ID content_type
 */
export const GET_FILTERED_LIST = 'admin/content-types/filter'

/**
 * обработчик ContentType (получение/добавление/редактирование)
 */
export const ACTION_FIELDS_CONTENT_TYPE = 'admin/content-type/:action'

/**
 * Обновить мониториг из файла
 */
export const UPDATE_MONITORINGS = 'admin/update-monitorings'
/**
 * Шаблон файла для обновления товаров
 */
export const GET_PRODUCT_TEMPLATE_FILE = SERVER_ROOT + '/api/admin/product-template-file'

/**
 * Получить список доступных мониторингов
 */
export const GET_MONITORING_LIST = 'admin/monitorings'

/**
 * Получить список промониторенных товаров
 */
export const GET_COMPLETE_WARES = 'admin/complete-wares'

/**
 * Получить xls отчет на email
 */
export const GET_REPORT = 'admin/get-report'

/**
 * Получить удаленные данные
 */
export const GET_TRASH_DATA = 'admin/trash-data'

/**
 * Восстановить удаленную сущность
 */
export const RECOVERY_FROM_TRASH = 'admin/recovery-from-trash'

/**
 * Получтиь всех пользователей online
 */
export const GET_ONLINE_USERS = 'admin/online-users'

/**
 * Websocket админа
 */
export const WS_ADMIN = '/admin'

export const ws_events = {
  
}