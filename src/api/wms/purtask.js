// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/task/save',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/pur/task/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/task/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/task/reviewer',
    method: 'post',
    data
  })
}
// 生成单
export function generate(data = {}) {
  return request({
    url: module + '/pur/task/generate',
    method: 'post',
    data
  })
}

// 生成采购订单
export function generateOrder(data = {}) {
  return request({
    url: module + '/pur/order/generate',
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
// 获取采购任务订单生成来源号
export function getTaskSourceOrderNo(data = {}) {
  return request({
    url: module + '/pur/task/getTaskSourceOrderNo',
    method: 'post',
    data
  })
}
// 生成调度单
export function generateDispatchOrder(data = {}) {
  return request({
    url: module + '/pd/vehicle/schedul/order/generateDispatchOrder',
    method: 'post',
    data
  })
}
