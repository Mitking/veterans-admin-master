const module = '/ums'
import request from '@/utils/request'

export const getUserTypeName = (code) => {
  switch (code) {
    case 1:
      return '门店'
    case 2:
      return '组织'
    case 3:
      return '账套'
  }
}
/**
 * 分页查询账号
 * @returns
 */
export const pageUser = (data = {}) => {
  return request.post(module + '/user/page', data)
}
export const userPage = (data = {}) => {
  return request.post(module + '/user/page/merchant', data)
}

/**
 * 逻辑删除账号
 * @returns
 */
export const deleteUser = (id) => {
  return request.post(module + '/user/delete/' + id)
}

/**
 * 新增/修改账号
 * @returns
 */
export const saveOrUpdateUser = (data = {}) => {
  return request.post(module + '/user/saveOrUpdate', data)
}
/**
 * 角色授权
 * @returns
 */
export const grantRole = (data = {}) => {
  return request.post(module + '/user/grantRole', data)
}
/**
 * 角色列表
 * @returns
 */
export const getRoleAll = (data = {}) => {
  return request.post(module + '/user/role/getAll', data)
}
/**
 * 角色授权
 * @returns
 */
export const getAllTarget = (data = {}) => {
  return request.post(module + '/user/role/getAllTarget', data)
}
/**
 * 角色授权
 * @returns
 */
export const updatePwd = (data = {}) => {
  return request.post(module + '/user/updatePwd', data)
}
/**
 * 重置密码
 * @returns
 */
export const resetPwd = (data = {}) => {
  return request.post(module + '/user/update/resetPwd', data)
}
