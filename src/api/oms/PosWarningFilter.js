const module = '/oms'
import request from '@/utils/request'

export function getPosWarningFilterPage(data = {}) {
  return request({
    url: module + '/pos/order/warning/filter/getPosWarningFilterPage',
    method: 'post',
    data
  })
}
export function posWarningFilterAdd(data = {}) {
  return request({
    url: module + '/pos/order/warning/filter/posWarningFilterAdd',
    method: 'post',
    data
  })
}
export function posWarningFilterDelete(data = {}) {
  return request({
    url: module + '/pos/order/warning/filter/posWarningFilterDelete',
    method: 'post',
    data
  })
}
export function posWarningFilterUpdate(data = {}) {
  return request({
    url: module + '/pos/order/warning/filter/posWarningFilterUpdate',
    method: 'post',
    data
  })
}
export function posWarningSetting(data = {}) {
  return request({
    url: module + '/pos/order/warning/filter/posWarningSetting',
    method: 'post',
    data
  })
}
export function getPosWarningPage(data = {}) {
  return request({
    url: module + '/pos/order/warning/getPosWarningPage',
    method: 'post',
    data
  })
}
