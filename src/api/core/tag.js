const module = '/core'
import request from '@/utils/request'

export function getTagPage(data = {}) {
  return request({
    url: module + '/tag/getTagPage',
    method: 'post',
    data
  })
}

export function deleteTag(data = {}) {
  return request({
    url: module + '/tag/deleteTag',
    method: 'post',
    data
  })
}

export function addTag(data = {}) {
  return request({
    url: module + '/tag/addTag',
    method: 'post',
    data
  })
}

export function updateTag(data = {}) {
  return request({
    url: module + '/tag/updateTag',
    method: 'post',
    data
  })
}

export function getTagList(data = {}) {
  return request({
    url: module + '/tag/getTagList',
    method: 'post',
    data
  })
}
