const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/loan/bill/addLoanBill',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/loan/bill/deleteLoanBill',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/loan/bill/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/loan/bill/details/getLoanBillPage',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/loan/bill/getLoanBillPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/loan/bill/reviewLoanBill',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/loan/bill/updateLoanBill',
    method: 'post',
    data
  })
}
export function getSendNumber(data = {}) {
  return request({
    url: module + '/fin/serial/number/getFinSerialNumber',
    method: 'post',
    data
  })
}
