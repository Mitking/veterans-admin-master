// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/oms'
import request from '@/utils/request'

export function deleteOrder(data = {}) {
  return request({
    url: module + '/pos/order/tip/deletePosOrderTip',
    method: 'post',
    data
  })
}
export function addOrder(data = {}) {
  return request({
    url: module + '/pos/order/tip/appendPosOrderTip',
    method: 'post',
    data
  })
}
export function getPage(data = {}) {
  return request({
    url: module + '/pos/order/tip/getPosOrderTipPage',
    method: 'post',
    data
  })
}

export function updateOrder(data = {}) {
  return request({
    url: module + '/pos/order/tip/updatePosOrderTip',
    method: 'post',
    data
  })
}

