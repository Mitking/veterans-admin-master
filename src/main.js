import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
// import plTable from 'pl-table'
import 'pl-table/themes/index.css'
// Vue.use(plTable)
import './styles/element-variables.scss'
import 'default-passive-events'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters
import permission from '@/directive/permission/index.js'
import Print from 'vue-print-nb'

import Dec from 'decimal.js'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
Vue.use(Print) // 注册
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false
Vue.directive('permission', permission)
setInterval(function() {
  document.querySelectorAll('.el-cascader-node__label').forEach((el) => {
    el.onclick = function() {
      if (this.previousElementSibling) this.previousElementSibling.click()
    }
  })
}, 1000)
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

Vue.prototype.$json_copy = (e) => {
  const txt = JSON.stringify(e)
  return JSON.parse(txt)
}
import { enumGetproplist, MenuGetPropName, deepClone, ArrFilter, groupByProp, ArrSomeFilter, ArrAutoSomeFilter, fen2yuan, yuan2fen, fen2yuan6cover, yuan2fen6cover, fen2yuan2cover, refrain, g2kg, kg2g, MergeArray } from '@/utils'
Vue.prototype.DECIMAL = Dec
Vue.prototype.enumGetproplist = enumGetproplist
Vue.prototype.MenuGetPropName = MenuGetPropName
Vue.prototype.deepClone = deepClone
Vue.prototype.ArrFilter = ArrFilter
Vue.prototype.groupByProp = groupByProp
// Vue.prototype.selectDataLoad = selectDataLoad
Vue.prototype.ArrSomeFilter = ArrSomeFilter
Vue.prototype.ArrAutoSomeFilter = ArrAutoSomeFilter
Vue.prototype.fen2yuan = fen2yuan
Vue.prototype.yuan2fen = yuan2fen
Vue.prototype.fen2yuan6cover = fen2yuan6cover
Vue.prototype.yuan2fen6cover = yuan2fen6cover
Vue.prototype.fen2yuan2cover = fen2yuan2cover
Vue.prototype.g2kg = g2kg
Vue.prototype.kg2g = kg2g
Vue.prototype.refrain = refrain
Vue.prototype.MergeArray = MergeArray
Vue.prototype.windowH = document.documentElement.clientHeight
Vue.prototype.windowW = document.documentElement.clientWidth
// eslint-disable-next-line no-extend-native
Array.prototype.insert = function(index) { // 扩展原生方法：数组插入
  index = Math.min(index, this.length)
  arguments.length > 1 &&
  this.splice.apply(this, [index, 0].concat([].pop.call(arguments))) &&
  this.insert.apply(this, arguments)
  return this
}
// 删除重复项
// eslint-disable-next-line no-extend-native
Array.prototype.delrepeat = function() {
  this.sort()// 排序
  var n = [this[0]]
  for (var i = 1; i < this.length; i++) {
    if (this[i] !== n[n.length - 1]) {
      n.push(this[i])
    }
  }
  return n
}
// eslint-disable-next-line no-extend-native
Array.prototype.indexOf = function(val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === val) return i
  }
  return -1
}
// eslint-disable-next-line no-extend-native
Array.prototype.remove = function(val) { // 扩展原生方法：数组移除
  var index = this.indexOf(val)
  if (index > -1) {
    this.splice(index, 1)
  }
}

Vue.prototype.$success = (message) => {
  Element.Notification({
    title: '成功',
    message: message,
    type: 'success',
    duration: 2500
  })
}
Vue.prototype.$error = (message) => {
  Element.Notification({
    title: '失败',
    message: message,
    type: 'error',
    duration: 2500
  })
}

// 全局自定义指令，限制输入框输入格式
// Number : 整数
// number : 浮点数
import '@/utils/input-value-directive'

// key.enter触发
import '@/utils/enter-search'
