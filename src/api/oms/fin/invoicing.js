const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/invoicing/addInvoicing',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/invoicing/deleteInvoicing',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/invoicing/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/invoicing/details/getInvoicingDetail',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/invoicing/getInvoicingPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/invoicing/reviewInvoicing',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/invoicing/updateInvoicing',
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
export function getListForInvoicing(data = {}) {
  return request({
    url: module + '/fin/franchisee/settle/getListForInvoicing',
    method: 'post',
    data
  })
}
