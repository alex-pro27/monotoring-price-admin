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
 * Получить доступные таблицы (модели)
 */
export const GET_CONTENT_TYPES = 'admin/content-types'

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
 * Обновить товары из файла
 */
export const UPDATE_WARES = 'admin/update-wares'
/**
 * Шаблон файла для обновления товаров
 */
export const GET_PRODUCT_TEMPLATE_FILE = '/api/admin/product-template-file'

/**
 * Websocket админа
 */
export const WS_ADMIN = '/admin'

export const ws_events = {
  
}