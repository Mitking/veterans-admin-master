// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'
export function getPage(data = {}) {
  return request({
    url: module + '/activ/half/getHalfPage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/activ/half/addHalf',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/activ/half/deleteHalf',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/activ/half/details/getHalfDetails',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/activ/half/updateHalf',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/activ/half/reviewHalf',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/activ/half/invalidHalf',
    method: 'post',
    data
  })
}
