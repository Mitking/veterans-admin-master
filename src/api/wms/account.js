// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
export function addOrder(data = {}) {
  return request({
    url: module + '/pur/on/account/order/add',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/pur/on/account/order/delete',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/pur/on/account/order/list',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/send/apply/item/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/pur/on/account/order/get',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/pur/on/account/order/reviewer',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/pur/on/account/order/update',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/send/number/getSendNumber',
    method: 'post',
    data
  })
}
export function generate(data = {}) {
  return request({
    url: module + '/send/call/generateCallByApply',
    method: 'post',
    data
  })
}
