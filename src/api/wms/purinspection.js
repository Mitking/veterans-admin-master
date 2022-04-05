const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/inspection/order/save',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/pur/inspection/order/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/inspection/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/inspection/order/reviewer',
    method: 'post',
    data
  })
}
// 新增核验单
export function checkSave(data = {}) {
  return request({
    url: module + '/pur/check/order/save',
    method: 'post',
    data
  })
}
export function orderNo(data = {}) {
  return request({
    url: module + '/pur/generate/orderNo/get',
    method: 'post',
    data
  })
}
export function generateCheckOrder(data = {}) {
  return request({
    url: module + '/pur/check/order/generateCheckOrder',
    method: 'post',
    data
  })
}
