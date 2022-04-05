const module = '/oms'
import request from '@/utils/request'
// 获取配送
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/prepay/addSupplierPrepay',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/prepay/deleteSupplierPrepay',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/fin/supplier/prepay/getSupplierPrepayPage',
    method: 'post',
    data
  })
}
export function review(data = {}) {
  return request({
    url: module + '/fin/supplier/prepay/reviewSupplierPrepay',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/supplier/prepay/updateSupplierPrepay',
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
