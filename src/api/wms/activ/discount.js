// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'
export function getPage(data = {}) {
  return request({
    url: module + '/activ/discount/getDiscountPage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/activ/discount/addDiscount',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/activ/discount/deleteDiscount',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/activ/discount/details/getDiscountDetails',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/activ/discount/updateDiscount',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/activ/discount/reviewDiscount',
    method: 'post',
    data
  })
}
export function OrderInvalid(data = {}) {
  return request({
    url: module + '/activ/discount/invalidDiscount',
    method: 'post',
    data
  })
}
