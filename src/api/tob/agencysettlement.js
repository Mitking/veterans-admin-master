const module = '/wms'
import request from '@/utils/request'
// 新增
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/addConsignmentSettlement',
    method: 'post',
    data
  })
}
// 修改
export function saveOrder(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/updateConsignmentSettlement',
    method: 'post',
    data
  })
}
// 获取数据列表
export function getPage(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/getConsignmentSettlementPage',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/deleteConsignmentSettlement',
    method: 'post',
    data
  })
}
export function getFeeTmpList(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/getPurFeeTmpList',
    method: 'post',
    data
  })
}

export function orderReviewer(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/reviewConsignmentSettlement',
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
// 详情
export function getDetails(data = {}) {
  return request({
    url: module + '/consignment/settlement/order/consignmentSettlementInfo',
    method: 'post',
    data
  })
}
