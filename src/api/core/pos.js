const module = '/core'
import request from '@/utils/request'
// 获取价格
export function selectPos(data = {}) {
  return request({
    url: module + '/pos/register/selectPos',
    method: 'post',
    data
  })
}
export function addPos(data = {}) {
  return request({
    url: module + '/pos/register/addPos',
    method: 'post',
    data
  })
}
export function deletePos(data = {}) {
  return request({
    url: module + '/pos/register/deletePos',
    method: 'post',
    data
  })
}
export function selectPosCond(data = {}) {
  return request({
    url: module + '/pos/register/selectPosCond',
    method: 'post',
    data
  })
}
export function updatePos(data = {}) {
  return request({
    url: module + '/pos/register/updatePos',
    method: 'post',
    data
  })
}
