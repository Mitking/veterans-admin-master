// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pd/load/car/order/save',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/pd/load/car/order/getList',
    method: 'post',
    headers: { 'Accept': '*/*' },
    data
  })
}
export function getDetail(data = {}) {
  return request({
    url: module + '/pd/load/car/order/getDetail',
    method: 'post',
    headers: { 'Accept': '*/*' },
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/pd/load/car/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pd/load/car/order/verify',
    method: 'post',
    data
  })
}
export function getStoNumber(data = {}) {
  return request({
    url: module + '/pd/generate/orderNo/get',
    method: 'post',
    data
  })
}
export function getLoadFeeList(data = {}) {
  return request({
    url: module + '/pd/load/car/fee/getList',
    method: 'post',
    data
  })
}
export function loadFeeSave(data = {}) {
  return request({
    url: module + '/pd/load/car/fee/save',
    method: 'post',
    data
  })
}
export function getRouteDetails(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/getRouteDetails',
    method: 'post',
    data
  })
}
