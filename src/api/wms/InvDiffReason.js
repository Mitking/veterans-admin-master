const module = '/wms'
import request from '@/utils/request'
export function getInvDiffReasonGroup(data = {}) {
  return request({
    url: module + '/sto/inv/diff/reason/getInvDiffReasonGroup',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/inv/diff/reason/appendInvDiffReason',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/inv/diff/reason/updateInvDiffReason',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/inv/diff/reason/deleteInvDiffReason',
    method: 'post',
    data
  })
}
