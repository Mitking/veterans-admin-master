const module = '/ums'
import request from '@/utils/request'
/**
 * 查询组织角色
 */
export const page = (data = {}) => {
  return request.post(module + '/org/page', data)
}

/**
 * 超管查询默认组织角色
 */
export const pageDefaultOrgList = (data = {}) => {
  return request.post(module + '/org/pageDefaultOrgList', data)
}

/**
 * 根据账套ID/或账套号查询账套下所有组织
 */
export const queryOrgByAccountId = (data = {}) => {
  return request.post(module + '/org/queryOrgByAccountId', data)
}

/**
 * 保存/修改组织
 */
export const saveOrUpdate = (data = {}) => {
  return request.post(module + '/org/saveOrUpdate', data)
}
// /**
//  * 角色授权获取信息
//  */
// export const roleInfo = (data = {}) => {
//   return request.post(module + '/role/info', data)
// }
