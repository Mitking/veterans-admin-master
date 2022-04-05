const module = '/oms'
import request from '@/utils/request'
// 税率
export function addOrder(data = {}) {
  return request({
    url: module + '/fin/tax/rate/finTaxRateAdd',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/fin/tax/rate/finTaxRateUpdate',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/fin/tax/rate/getFinTaxRatePage',
    method: 'post',
    data
  })
}

export function getFinTaxRateList(data = {}) {
  return request({
    url: module + '/fin/tax/rate/getFinTaxRateList',
    method: 'post',
    data
  })
}
export function finTaxRateStatisticsPage(data = {}) {
  return request({
    url: module + '/fin/tax/rate/finTaxRateStatisticsPage',
    method: 'post',
    data
  })
}

