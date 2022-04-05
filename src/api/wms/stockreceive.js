const module = '/wms'
import request from '@/utils/request'
// addOrder  deleteOrder  deleteDetails  getDetails  getPage  review  updateOrder  getSendNumber
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/receive/order/addStoReceiveOrder',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/receive/order/deleteStoReceiveOrder',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/sto/receive/order/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/sto/receive/order/details/getDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/sto/receive/order/getStoReceiveOrderPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/sto/receive/order/reviewReceiveOrder',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/receive/order/updateStoReceiveOrder',
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
