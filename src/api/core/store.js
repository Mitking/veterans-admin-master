const module = '/core'
import request from '@/utils/request'
// 获取商品档案列表
export function getStorePage(data = {}) {
  return request({
    url: module + '/store/getStorePage',
    method: 'post',
    data
  })
}
export function getGroupList(data = {}) {
  return request({
    url: module + '/store/group/getGroupList',
    method: 'post',
    data
  })
}

export function addStore(data = {}) {
  return request({
    url: module + '/store/addStore',
    method: 'post',
    data
  })
}
export function updateStore(data = {}) {
  return request({
    url: module + '/store/updateStore',
    method: 'post',
    data
  })
}
export function deleteStoreById(data = {}) {
  return request({
    url: module + '/store/deleteStoreById',
    method: 'post',
    data
  })
}
// 分组
export function getStoreGroupPage(data = {}) {
  return request({
    url: module + '/store/group/getStoreGroupPage',
    method: 'post',
    data
  })
}
export function addStoreGroup(data = {}) {
  return request({
    url: module + '/store/group/addStoreGroup',
    method: 'post',
    data
  })
}
export function deleteStoreGroupById(data = {}) {
  return request({
    url: module + '/store/group/deleteStoreGroupById',
    method: 'post',
    data
  })
}
// 门店列表
export function getStoreList() {
  return request({
    url: module + '/store/getStoreList',
    method: 'post'
  })
}

// 门店分组修改
export function updateStoreGroup(data = {}) {
  return request({
    url: module + '/store/group/updateStoreGroup',
    method: 'post',
    data
  })
}

