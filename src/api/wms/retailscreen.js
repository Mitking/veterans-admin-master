const module = '/wms'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/retail/screen/set/getList',
    method: 'post',
    data
  })
}
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/retail/screen/set/add',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/retail/screen/set/delete',
    method: 'post',
    data
  })
}
export function getScreenImgs(data = {}) {
  return request({
    url: module + '/retail/screen/set/getScreenImgs',
    method: 'post',
    data
  })
}
export function switchState(data = {}) {
  return request({
    url: module + '/retail/screen/set/switchState',
    method: 'post',
    data
  })
}
export function batchDisable(data = {}) {
  return request({
    url: module + '/retail/screen/set/batchDisable',
    method: 'post',
    data
  })
}
