import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/auth/admin/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/auth/admin/logout',
    method: 'post'
  })
}

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
  return request.post('/user/page', data)
}
export const userPage = (data = {}) => {
  return request.post('/user/page/merchant', data)
}

/**
 * 逻辑删除账号
 * @returns
 */
export const deleteUser = (id) => {
  return request.post('/user/delete/' + id)
}

/**
 * 新增/修改账号
 * @returns
 */
export const saveOrUpdateUser = (data = {}) => {
  return request.post('/user/saveOrUpdate', data)
}
/**
 * 角色授权
 * @returns
 */
export const grantRole = (data = {}) => {
  return request.post('/user/grantRole', data)
}
/**
 * 角色列表
 * @returns
 */
export const getRoleAll = (data = {}) => {
  return request.post('/user/role/getAll', data)
}
/**
 * 角色授权
 * @returns
 */
export const getAllTarget = (data = {}) => {
  return request.post('/user/role/getAllTarget', data)
}
/**
 * 角色授权
 * @returns
 */
export const updatePwd = (data = {}) => {
  return request.post('/user/updatePwd', data)
}
/**
 * 重置密码
 * @returns
 */
export const resetPwd = (data = {}) => {
  return request.post('/user/update/resetPwd', data)
}
