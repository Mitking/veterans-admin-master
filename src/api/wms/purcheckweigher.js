// addOrder, deleteOrder, deleteDetails, getDetails, getPage, review, updateOrder, getStoNumber
const module = '/wms'
import request from '@/utils/request'
// 获取
export function addOrSaveOrder(data = {}) {
  return request({
    url: module + '/pur/checkweigher/order/save',
    method: 'post',
    data
  })
}

export function getPage(data = {}) {
  return request({
    url: module + '/pur/checkweigher/order/getList',
    method: 'post',
    data
  })
}
export function deleteOrders(data = {}) {
  return request({
    url: module + '/pur/checkweigher/order/delete',
    method: 'post',
    data
  })
}

export function review(data = {}) {
  return request({
    url: module + '/pur/checkweigher/order/reviewer',
    method: 'post',
    data
  })
}
// export function demandexport(data = {}) {
//   return request({
//     url: module + '/pur/demand/order/export',
//     method: 'post',
//     data
//   })
// }
export function orderNo(data = {}) {
  return request({
    url: module + '/pur/generate/orderNo/get',
    method: 'post',
    data
  })
}
