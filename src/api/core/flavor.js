const module = '/core'
import request from '@/utils/request'

export function selectFlavor(data = {}) {
  return request({
    url: module + '/flavor/selectFlavor',
    method: 'post',
    data
  })
}
export function addFlavor(data = {}) {
  return request({
    url: module + '/flavor/addFlavor',
    method: 'post',
    data
  })
}
export function deleteFlavor(data = {}) {
  return request({
    url: module + '/flavor/deleteFlavor',
    method: 'post',
    data
  })
}
export function updateFlavor(data = {}) {
  return request({
    url: module + '/flavor/updateFlavor',
    method: 'post',
    data
  })
}
export function getFlavorList(data = {}) {
  return request({
    url: module + '/flavor/getFlavorList',
    method: 'post',
    data
  })
}
