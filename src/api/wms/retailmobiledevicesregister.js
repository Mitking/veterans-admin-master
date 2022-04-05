const module = '/ums'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/auth/record/getPage',
    method: 'post',
    data
  })
}
export function deleteOrder(data = {}) {
  return request({
    url: module + '/retail/mobile/devices/register/delete',
    method: 'post',
    data
  })
}
export function swEnableState(data = {}) {
  return request({
    url: module + '/retail/mobile/devices/register/swEnableState',
    method: 'post',
    data
  })
}
