const module = '/wms'
import request from '@/utils/request'
// 新增
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/whs/sale/order/saveWhsOrder',
    method: 'post',
    data
  })
}
// 获取数据列表
export function getPage(data = {}) {
  return request({
    url: module + '/whs/sale/order/getWhsOrderPageList',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/whs/sale/order/batchDeleteWhsOrder',
    method: 'post',
    data
  })
}

export function orderReviewer(data = {}) {
  return request({
    url: module + '/whs/sale/order/whsOrderReview',
    method: 'post',
    data
  })
}

export function orderNo(data = {}) {
  return request({
    url: module + '/whs/sale/order/getOrderNo',
    method: 'post',
    data
  })
}
// 详情
export function getDetails(data = {}) {
  return request({
    url: module + '/whs/sale/order/getWhsOrderInfo',
    method: 'post',
    data
  })
}
