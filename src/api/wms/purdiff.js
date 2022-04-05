const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/diff/order/save',
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
// 财务获取
export function getPage(data = {}) {
  return request({
    url: module + '/pur/diff/order/getDiffOrderList',
    method: 'post',
    data
  })
}

export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/diff/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/diff/order/reviewer',
    method: 'post',
    data
  })
}
export function financeReviewer(data = {}) {
  return request({
    url: module + '/pur/diff/order/reviewer',
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
    url: module + '/sto/receive/diff/detail/getListByRecordId',
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
