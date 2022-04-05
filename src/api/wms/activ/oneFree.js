// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'
export function getPage(data = {}) {
  return request({
    url: module + '/activ/one/free/getOneFreePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/activ/one/free/addOneFree',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/activ/one/free/deleteOneFree',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/activ/one/free/details/getOneFreeDetails',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/activ/one/free/updateOneFree',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/activ/one/free/reviewOneFree',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/activ/one/free/invalidOneFree',
    method: 'post',
    data
  })
}
