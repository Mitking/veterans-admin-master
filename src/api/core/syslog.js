const module = '/core'
import request from '@/utils/request'

export function getLogErrorList(data = {}) {
  return request({
    url: module + '/sys/log/getLogErrorList',
    method: 'post',
    data
  })
}
export function getLogExList(data = {}) {
  return request({
    url: module + '/sys/log/getLogExList',
    method: 'post',
    data
  })
}
export function getLogInfoList(data = {}) {
  return request({
    url: module + '/sys/log/getLogInfoList',
    method: 'post',
    data
  })
}
export function getLogKeyList(data = {}) {
  return request({
    url: module + '/sys/log/getLogKeyList',
    method: 'post',
    data
  })
}
