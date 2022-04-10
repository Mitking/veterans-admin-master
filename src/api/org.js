import request from '@/utils/request'
/**
 * 新增
 * @returns
 */
export const add = (data = {}) => {
  return request.post('/sysOrg/add', data)
}
/**
 * 删除
 * @returns
 */
export const del = (data = {}) => {
  return request.post('/sysOrg/delete', data)
}
/**
 * 查询
 * @returns
 */
export const getList = (data = {}) => {
  return request.post('/sysOrg/getListSysOrgByTownId', data)
}
/**
 * 编辑
 * @returns
 */
export const upd = (data = {}) => {
  return request.post('/sysOrg/update', data)
}
