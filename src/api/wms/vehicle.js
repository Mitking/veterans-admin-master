// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/save',
    method: 'post',
    data
  })
}
export function deleteNode(data = {}) {
  return request({
    url: module + '/pd/route/node/delete',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/query',
    method: 'post',
    headers: { 'Accept': '*/*' },
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/verify',
    method: 'post',
    data
  })
}
export function getStoNumber(data = {}) {
  return request({
    url: module + '/pd/generate/orderNo/get',
    method: 'post',
    data
  })
}
