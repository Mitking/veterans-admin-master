const module = '/oms'
import request from '@/utils/request'
// 查询费用列表
export function getOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/getFranchiseeFeePage',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/addFeeName',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/updateFeeName',
    method: 'post',
    data
  })
}
export function getFeeList(data = {}) {
  return request({
    url: module + '/fin/fee/name/getFeeNameList',
    method: 'post',
    data
  })
}
export function getFeeSelectList(data = {}) {
  return request({
    url: module + '/fin/fee/name/getFeeSelectList',
    method: 'post',
    data
  })
}

// 查询费用关联列表
export function getAssociateOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/associate/getFeeNameAssociatePage',
    method: 'post',
    data
  })
}
export function addAssociateOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/associate/addFeeNameAssociate',
    method: 'post',
    data
  })
}
export function updateAssociateOrder(data = {}) {
  return request({
    url: module + '/fin/fee/name/associate/updateFeeNameAssociate',
    method: 'post',
    data
  })
}
export function getAssociateFeeList(data = {}) {
  return request({
    url: module + '/fin/fee/name/getFeeByProject',
    method: 'post',
    data
  })
}
