const module = '/oms'
import request from '@/utils/request'

export function getDetails(data = {}) {
  return request({
    url: module + '/fin/fee/share/details/getFeeShareDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/fee/share/getFeeSharePage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/fee/share/shareFeeReview',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/fee/share/updateFeeShare',
    method: 'post',
    data
  })
}
// // 费用分摊
export function shareFee(data = {}) {
  return request({
    url: module + '/fin/fee/share/shareFee',
    method: 'post',
    data
  })
}
export function GeneratePrice(data = {}) {
  return request({
    url: module + '/fin/fee/share/generatePrice',
    method: 'post',
    data
  })
}
