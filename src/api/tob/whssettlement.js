const module = '/wms'
import request from '@/utils/request'
// 新增
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/whs/settle/order/saveSettleOrder',
    method: 'post',
    data
  })
}
// 获取数据列表
export function getPage(data = {}) {
  return request({
    url: module + '/whs/settle/order/getPageList',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/whs/settle/order/deleteSettleOrder',
    method: 'post',
    data
  })
}

export function orderReviewer(data = {}) {
  return request({
    url: module + '/whs/settle/order/whsSettleOrderReview',
    method: 'post',
    data
  })
}

export function orderNo(data = {}) {
  return request({
    url: module + '/whs/settle/order/getOrderNo',
    method: 'post',
    data
  })
}
// 详情
export function getDetails(data = {}) {
  return request({
    url: module + '/whs/settle/order/getSettleOrderInfo',
    method: 'post',
    data
  })
}
