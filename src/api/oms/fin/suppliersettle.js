const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/addSupplierSettlement',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/deleteSupplierSettlement',
    method: 'post',
    data
  })
}
export function deleteDetails(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/details/deleteDetailById',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/details/getSupplierFeeDetails',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/getSupplierSettlementPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/reviewSupplierSettlement',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/updateSupplierSettlement',
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
export function getListForInvoice(data = {}) {
  return request({
    url: module + '/fin/supplier/settlement/getListForInvoice',
    method: 'post',
    data
  })
}
