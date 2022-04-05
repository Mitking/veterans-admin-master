const module = '/wms'
import request from '@/utils/request'
// 新增
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/consignment/shipment/order/addConsignmentShipment',
    method: 'post',
    data
  })
}
// 修改
export function saveOrder(data = {}) {
  return request({
    url: module + '/consignment/shipment/order/updateConsignmentShipment',
    method: 'post',
    data
  })
}
// 采购获取
export function getPurPage(data = {}) {
  return request({
    url: module + '/pur/diff/order/getPurList',
    method: 'post',
    data
  })
}
// 获取数据列表
export function getPage(data = {}) {
  return request({
    url: module + '/consignment/shipment/order/getConsignmentShipmentPage',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/consignment/shipment/order/deleteConsignmentShipment',
    method: 'post',
    data
  })
}

export function orderReviewer(data = {}) {
  return request({
    url: module + '/consignment/shipment/order/reviewConsignmentShipment',
    method: 'post',
    data
  })
}

export function diffOrderInvalidation(data = {}) {
  return request({
    url: module + '/pur/diff/order/diffOrderInvalidation',
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
    url: module + '/consignment/shipment/order/consignmentShipmentInfo',
    method: 'post',
    data
  })
}
// 生成相关处理单据
export function generateOrder(data = {}) {
  return request({
    url: module + '/pur/diff/order/generateOrder',
    method: 'post',
    data
  })
}
// 根据id集合获取列表
export function getListByRecordIds(data = {}) {
  return request({
    url: module + '/sto/receive/diff/detail/getListByRecordIds',
    method: 'post',
    data
  })
}
