const module = '/wms'
import request from '@/utils/request'
// 单新增
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/warehouse/addWarehouse',
    method: 'post',
    data
  })
}
// 单删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/warehouse/deleteWarehouse',
    method: 'post',
    data
  })
}
// 单详情删除
export function deleteDetails(data = {}) {
  return request({
    url: module + '/sto/warehouse/details/deleteSortedOrderDetails',
    method: 'post',
    data
  })
}
// 单详情查询
export function getDetails(data = {}) {
  return request({
    url: module + '/sto/warehouse/details/getWarehouseDetails',
    method: 'post',
    data
  })
}
// 单查询
export function getPage(data = {}) {
  return request({
    url: module + '/sto/warehouse/getSortedOrderPage',
    method: 'post',
    data
  })
}
// 单批量审核
export function review(data = {}) {
  return request({
    url: module + '/sto/warehouse/reviewWarehouse',
    method: 'post',
    data
  })
}
// 单修改
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/warehouse/updateWarehouse',
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
