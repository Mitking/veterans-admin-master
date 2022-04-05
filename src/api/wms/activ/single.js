// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'
export function getPage(data = {}) {
  return request({
    url: module + '/activ/single/getSinglePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/activ/single/addSingle',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/activ/single/deleteSingle',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/activ/single/details/updateSingle',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/activ/single/updateSingle',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/activ/single/reviewSingle',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/activ/single/invalidSingle',
    method: 'post',
    data
  })
}
