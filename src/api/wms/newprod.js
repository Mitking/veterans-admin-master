const module = '/oms'
import request from '@/utils/request'
import postDownLoad from '@/utils/postDownLoad'
// 获取
export function newProdBudget(data = {}) {
  return request({
    url: module + '/analysis/budget/newProdBudget',
    method: 'post',
    data
  })
}
export function purBudget(data = {}) {
  return request({
    url: module + '/analysis/budget/purBudget',
    method: 'post',
    data
  })
}
// 合计
export function dataTotal(data = {}) {
  return request({
    url: module + '/analysis/budget/data-total',
    method: 'post',
    data
  })
}
export function exportDataTotal(data = {}) {
  return postDownLoad({
    url: module + '/analysis/budget/export-budget-data',
    method: 'post',
    data
  })
}
