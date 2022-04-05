const module = '/ums'
import request from '@/utils/request'

/**
 * 分页查询账套
 * @returns
 */
export const pageAccount = (data = {}) => {
  return request.post(module + '/account/page', data)
}

/**
 * 更改账套状态
 * @returns
 */
export const updateAccountState = (data = {}) => {
  return request.post(module + '/account/state', data)
}

/**
 * 新增/修改账套信息
 * @returns
 */
export const saveOrUpdateAccount = (data = {}) => {
  return request.post(module + '/account/saveAccount', data)
}
/**
 * 获取所有账套信息
 * @returns
 */
export const getAccountList = (data = {}) => {
  return request.post(module + '/account/getAccountList', data)
}
