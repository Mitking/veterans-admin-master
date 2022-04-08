const module = ''
import request from '@/utils/request'
/**
 * 平台角色
 */
export const page = (data = {}) => {
  return request.post(module + '/role/page', data)
}
/**
 * 商户查询角色
 */
export const roleMerchant = (data = {}) => {
  return request.post(module + '/role/page/merchant', data)
}

/**
 * 保存角色
 */
export const saveRole = (data = {}) => {
  return request.post(module + '/role/saveRole', data)
}
/**
 * 删除角色
 */
export const removeRole = (data = {}) => {
  return request.post(module + '/role/remove', data)
}

/**
 * 角色授权
 */
export const grantMenu = (data = {}) => {
  return request.post(module + '/role/grantMenu', data)
}
/**
 * 角色授权获取信息
 */
export const roleInfo = (data = {}) => {
  return request.post(module + '/role/info', data)
}
/**
 * 移动端授权
 */
export const changeMobileMenu = (data = {}) => {
  return request.post(module + '/menu/mobile/changeMobileMenu', data)
}
/**
 * 根据角色名获取用户
 * @param data {{roleName:string}}
 */
export const getUsersByRoleName = (data = {}) => {
  return request.post(module + '/user/getUsersByRoleName', data)
}
