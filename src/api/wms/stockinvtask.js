const module = '/wms'
import request from '@/utils/request'
// 单新增
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/inv/task/addInvTask',
    method: 'post',
    data
  })
}
// 单删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/inv/task/deleteInvTask',
    method: 'post',
    data
  })
}
// 单详情删除
export function deleteDetails(data = {}) {
  return request({
    url: module + '/sto/inv/task/details/deleteDetailById',
    method: 'post',
    data
  })
}
// 单详情查询
export function getDetails(data = {}) {
  return request({
    url: module + '/sto/inv/task/details/getInvTaskDetails',
    method: 'post',
    data
  })
}
// 单查询
export function getPage(data = {}) {
  return request({
    url: module + '/sto/inv/task/getInvTaskPage',
    method: 'post',
    data
  })
}
// 单批量审核
export function review(data = {}) {
  return request({
    url: module + '/sto/inv/task/reviewInvTask',
    method: 'post',
    data
  })
}
// 单修改
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/inv/task/updateInvTask',
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
// 生成盘点单
export function generateInvOrderByTask(data = {}) {
  return request({
    url: module + '/sto/inv/task/generateInvOrderByTask',
    method: 'post',
    data
  })
}
