const module = '/ums'
import request from '@/utils/request'
/**
 * 平台角色
 */
export const page = (data = {}) => {
  return request.post(module + '/menu/mobile/getMenuMobileList', data)
}
/**
 * 修改
 */
export const updateMobileMenu = (data = {}) => {
  return request.post(module + '/menu/mobile/updateMobileMenu', data)
}
/**
 * 商户查询角色
 */
export const add = (data = {}) => {
  return request.post(module + '/menu/mobile/addMobileMenu', data)
}
/**
 * 商户查询角色
 */
export const delItem = (data = {}) => {
  return request.post(module + '/menu/mobile/deleteMobileMenu', data)
}
/**
 * 商户查询角色
 */
export const roleMobileInfo = (data = {}) => {
  return request.post(module + '/menu/mobile/getMenuByRoleId', data)
}
