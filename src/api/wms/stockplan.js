const module = '/wms'
import request from '@/utils/request'
// 单新增
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/addInvPlan',
    method: 'post',
    data
  })
}
// 单删除
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/deleteInvPlanPage',
    method: 'post',
    data
  })
}

// 单查询
export function getPage(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/getInvPlanPage',
    method: 'post',
    data
  })
}
// 单批量审核
export function review(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/reviewInvPlan',
    method: 'post',
    data
  })
}
// 单修改
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/updateInvPlan',
    method: 'post',
    data
  })
}
// 单停用
export function stopInvPlan(data = {}) {
  return request({
    url: module + '/sto/inv/plan/order/stopInvPlan',
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
