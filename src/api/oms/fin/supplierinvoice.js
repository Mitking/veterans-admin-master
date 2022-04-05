const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/addSupplierInvoice',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/deleteSupplierInvoice',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/details/deleteDetail',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/details/getSupplierInvoiceDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/getSupplierInvoicePage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/reviewSupplierInvoice',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/invoice/updateSupplierInvoice',
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
    url: module + '/fin/supplier/settlement/getListForInvoice',
    method: 'post',
    data
  })
}
