// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/save',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/reviewer',
    method: 'post',
    data
  })
}
export function repltOrderInvalidation(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/repltOrderInvalidation',
    method: 'post',
    data
  })
}
export function orderNo(data = {}) {
  return request({
    url: module + '/pur/generate/orderNo/get',
    method: 'post',
    data
  })
}
export function generate(data = {}) {
  return request({
    url: module + '/pur/replenishment/order/generateReceiveOrder',
    method: 'post',
    data
  })
}
