import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/vue-element-admin/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/vue-element-admin/roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/vue-element-admin/role',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/vue-element-admin/role/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/vue-element-admin/role/${id}`,
    method: 'delete'
  })
}

/**
 * 平台角色
 */
export const page = (data = {}) => {
  return request.post('/role/page', data)
}
/**
 * 商户查询角色
 */
export const roleMerchant = (data = {}) => {
  return request.post('/role/page/merchant', data)
}

/**
 * 保存角色
 */
export const saveRole = (data = {}) => {
  return request.post('/role/saveRole', data)
}
/**
 * 删除角色
 */
export const removeRole = (data = {}) => {
  return request.post('/role/remove', data)
}

/**
 * 角色授权
 */
export const grantMenu = (data = {}) => {
  return request.post('/role/grantMenu', data)
}
/**
 * 角色授权获取信息
 */
export const roleInfo = (data = {}) => {
  return request.post('/role/info', data)
}
/**
 * 移动端授权
 */
export const changeMobileMenu = (data = {}) => {
  return request.post('/menu/mobile/changeMobileMenu', data)
}
/**
 * 根据角色名获取用户
 * @param data {{roleName:string}}
 */
export const getUsersByRoleName = (data = {}) => {
  return request.post('/user/getUsersByRoleName', data)
}

