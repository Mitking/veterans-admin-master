// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'
export function getPage(data = {}) {
  return request({
    url: module + '/activ/reduce/getReducePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/activ/reduce/addReduce',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + 'activ/reduce/deleteReduce',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/activ/reduce/details/getReduceDetails',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/activ/reduce/updateReduce',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/activ/reduce/reviewReduce',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/activ/reduce/invalidReduce',
    method: 'post',
    data
  })
}
