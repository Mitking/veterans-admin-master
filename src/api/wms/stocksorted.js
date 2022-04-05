const module = '/wms'
import request from '@/utils/request'
// 单新增
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/sorted/order/addSortedOrder',
    method: 'post',
    data
  })
}
// 单删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/sorted/order/deleteSortedOrder',
    method: 'post',
    data
  })
}
// 单详情删除
export function deleteDetails(data = {}) {
  return request({
    url: module + '/sto/sorted/order/details/deleteSortedOrderDetails',
    method: 'post',
    data
  })
}
// 单详情查询
export function getDetails(data = {}) {
  return request({
    url: module + '/sto/sorted/order/details/getSortedOrderDetails',
    method: 'post',
    data
  })
}
// 单查询
export function getPage(data = {}) {
  return request({
    url: module + '/sto/sorted/order/getSortedOrderPage',
    method: 'post',
    data
  })
}
// 单批量审核
export function review(data = {}) {
  return request({
    url: module + '/sto/sorted/order/reviewSortedOrder',
    method: 'post',
    data
  })
}
// 单修改
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/sorted/order/updateSortedOrder',
    method: 'post',
    data
  })
}
// 获取单号
export function getStoNumber(data = {}) {
  return request({
    url: module + '/sto/number/getStoNumber',
    method: 'post',
    data
  })
}
// 生成分拣入库单
export function generateWareBySorted(data = {}) {
  return request({
    url: module + '/sto/sorted/order/generateWareBySorted',
    method: 'post',
    data
  })
}
