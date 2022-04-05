const module = '/store'
import request from '@/utils/request'

/**
 * 查询授权状态
 * @returns
 */
export const getAuthStatus = () => {
  return request.post(module + '/store/auth/getAuthStatus')
}

/**
 * 登录授权，获取商城凭证
 * @returns
 */
export const getAuthToken = (data) => {
  return request.post(module + '/store/auth/getAuthToken', data)
}
