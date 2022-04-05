const module = '/wms'
import request from '@/utils/request'
export function getInvDiffReasonGroup(data = {}) {
  return request({
    url: module + '/sto/adjust/reason/getAdjustReasonGroup',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/sto/adjust/reason/appendAdjustReason',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/sto/adjust/reason/updateAdjustReason',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/sto/adjust/reason/deleteAdjustReason',
    method: 'post',
    data
  })
}
