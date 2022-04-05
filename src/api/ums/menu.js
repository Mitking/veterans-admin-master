const module = '/ums'
import request from '@/utils/request'

/**
 * 查询所有菜单
 * @returns
 */
export const queryAllMenus = (data = {}) => {
  return request.post(module + '/menu/all', data)
}
/**
 * 新增权限
 * @returns
 */
export const saveOrUpdate = (data = {}) => {
  return request.post(module + '/menu/saveOrUpdate', data)
}
/**
 * 删除权限
 * @returns
 */
export const deleteMenu = (data = {}) => {
  return request.post(module + '/menu/delete', data)
}
