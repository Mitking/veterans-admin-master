const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/order/save',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/pur/order/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/order/reviewer',
    method: 'post',
    data
  })
}
// 生成任务单
export function generate(data = {}) {
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
// 生成验秤单
export function generateCheckweigherOrder(data = {}) {
  return request({
    url: module + '/pur/checkweigher/order/generateCheckweigherOrder',
    method: 'post',
    data
  })
}
// 生成收货单
export function generateReceiveOrder(data = {}) {
  return request({
    url: module + '/pur/order/generateReceiveOrder',
    method: 'post',
    data
  })
}
// 生成抽检单
export function inspectionSave(data = {}) {
  return request({
    url: module + '/pur/inspection/order/save',
    method: 'post',
    data
  })
}
// 生成抽检单
export function generateInspectionOrder(data = {}) {
  return request({
    url: module + '/pur/inspection/order/generateInspectionOrder',
    method: 'post',
    data
  })
}
// 双生成收货单
export function generateReceiveOrderCombination(data = {}) {
  return request({
    url: module + '/pur/order/generateReceiveOrderCombination',
    method: 'post',
    data
  })
}

// 获取订单来源
export function getPurOrderResourceOrderNo(data = {}) {
  return request({
    url: module + '/pur/order/getPurOrderResourceOrderNo',
    method: 'post',
    data
  })
}
// 成本核算
export function purCostCalculation(data = {}) {
  return request({
    url: module + '/pur/order/purCostCalculation',
    method: 'post',
    data
  })
}
// 分货
export function purOrderSplit(data = {}) {
  return request({
    url: module + '/pur/order/purOrderSplit',
    method: 'post',
    data
  })
}
