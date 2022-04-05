// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'

export function updateOrder(data = {}) {
  return request({
    url: module + '/pur/costs/order/add',
    method: 'post',
    data
  })
}

// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/pur/costs/order/page',
    method: 'post',
    data
  })
}
export function getDetails(data = {}) {
  return request({
    url: module + '/pur/costs/order/getPurCostInfo',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/costs/order/reviewer',
    method: 'post',
    data
  })
}

// 获取模板
export function getPurFeeTmpList(data = {}) {
  return request({
    url: module + '/pur/costs/order/getPurFeeTmpList',
    method: 'post',
    data
  })
}
// 获取模板
export function generateOrderNo(data = {}) {
  return request({
    url: module + '/pur/generate/orderNo/get',
    method: 'post',
    data
  })
}
// 删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/pur/costs/order/delete',
    method: 'post',
    data
  })
}
// 费用单查询(费用分摊)
export function getPurCostListForFeeShare(data = {}) {
  return request({
    url: module + '/pur/costs/order/getPurCostListForFeeShare',
    method: 'post',
    data
  })
}
