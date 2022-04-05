const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPosFlowPage(data = {}) {
  return request({
    url: module + '/pos/order/getPosFlowPage',
    method: 'post',
    data
  })
}
export function getPosFlowDetail(data = {}) {
  return request({
    url: module + '/pos/order/getPosFlowDetail',
    method: 'post',
    data
  })
}
