// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取配送
export function deleteOrder(data = {}) {
  return request({
    url: module + '/retail/price/tag/delete',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/retail/store/price/tag/set/getStorePriceTagSetPage',
    method: 'post',
    data
  })
}

export function getDetails(data = {}) {
  return request({
    url: module + '/retail/price/tag/get',
    method: 'post',
    data
  })
}
export function updateDetailOrder(data = {}) {
  return request({
    url: module + '/retail/price/tag/detail/save',
    method: 'post',
    data
  })
}
export function updateOrder(data = {}) {
  return request({
    url: module + '/retail/price/tag/save',
    method: 'post',
    data
  })
}
export function addStorePriceTagSet(data = {}) {
  return request({
    url: module + '/retail/store/price/tag/set/addStorePriceTagSet',
    method: 'post',
    data
  })
}
export function updateStorePriceTagSet(data = {}) {
  return request({
    url: module + '/retail/store/price/tag/set/updateStorePriceTagSet',
    method: 'post',
    data
  })
}
export function sysncPriceTagData(data = {}) {
  return request({
    url: module + '/retail/store/price/tag/set/sysncPriceTagData',
    method: 'post',
    data
  })
}
