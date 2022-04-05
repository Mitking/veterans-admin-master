const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/pos/pay/config/getPosPayConfigPage',
    method: 'post',
    data
  })
}
// 修改
export function save(data = {}) {
  return request({
    url: module + '/pos/pay/config/updatePosPayConfig',
    method: 'post',
    data
  })
}
