const module = '/wms'
import request from '@/utils/request'

export function addOrder(data = {}) {
  return request({
    url: module + '/sto/refund/order/addRefundOrder',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/refund/order/deleteRefundOrder',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/sto/refund/order/details/deleteRefundDetails',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/sto/refund/order/details/getRefundDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/sto/refund/order/getRefundOrderPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/sto/refund/order/reviewRefundOrder',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/refund/order/updateRefundOrder',
    method: 'post',
    data
  })
}
export function getStoNumber(data = {}) {
  return request({
    url: module + '/sto/number/getStoNumber',
    method: 'post',
    data
  })
}
