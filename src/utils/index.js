/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
import Dec from 'decimal.js'
// import { number } from 'echarts/src/export'
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {String} str
 * @returns {Number} output s
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      obj[name] = v.substring(index + 1, v.length)
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

// 返回字典列表
export function enumGetproplist(propitem, selectDataFilter = null, selectOutFilter = null) {
  if (this.$store.state.enum.enumList) {
    if (selectDataFilter) {
      return this.$store.state.enum.enumList[propitem.selectData].filter(item => selectDataFilter.includes(item[propitem.selectOption ? propitem.selectOption.value : 'value']))
    }
    if (selectOutFilter) {
      return this.$store.state.enum.enumList[propitem.selectData].filter(item => !selectOutFilter.includes(item[propitem.selectOption ? propitem.selectOption.value : 'value']))
    }
    return this.$store.state.enum.enumList[propitem.selectData]
  } else {
    return []
  }
}
// 返回字典name
export function MenuGetPropName(prop, val = '', selectOption = { value: '', label: '' }) { // valName:比较的字段名 returnName:返回值字段名称
  let IfHave = []
  if (typeof this.$store.state.enum.enumList[prop] !== 'undefined') {
    IfHave = this.$store.state.enum.enumList[prop].filter(itemz => (itemz[selectOption.value || 'value'].toString() === val.toString() || itemz[selectOption.value || 'value'] === val))
  }
  if (prop && IfHave.length > 0) {
    return IfHave[0][selectOption.label || 'name']
  } else {
    return ''
  }
}
// 多条件过滤数据
export function ArrFilter(arr = [], propObj = {}) {
  return arr.filter(item => Object.keys(propObj).every(itemSon => propObj[itemSon] === item[itemSon]))
}
// 多条件过滤数据-自动计算弹窗
export function ArrAutoSomeFilter(arr = [], propObj = {}) {
  return arr.filter(item => item[Object.keys(propObj)[0]] ? (item.editShow && item[Object.keys(propObj)[0]].includes(Object.values(propObj)[0])) : false)
}
// 多条件过滤数据-枚举
export function ArrSomeFilter(arr = [], propObj = {}) {
  return arr.filter(item => Object.values(propObj)[0].includes(item[Object.keys(propObj)[0]]))
}

// 判断要用的字段数据，没有时获取
// export function selectDataLoad(arg) {
//   this.$store.dispatch('enum/get_sync_enum', arg)
// }
// 分类汇总
export function groupByProp(data, prop) { // 分类汇总
  const c = []
  const d = {}
  data.forEach(element => {
    if (!d[element[prop]]) {
      const temp = {}
      temp[prop] = element[prop]
      temp.children = [element]
      temp.id = element[prop] + 10000
      c.push(temp)
      d[element[prop]] = element
    } else {
      c.forEach(ele => {
        if (ele[prop] === element[prop]) {
          ele.children.push(element)
        }
      })
    }
  })
  return c
}

// 价格转换2位
export function fen2yuan2cover(fen) {
  if (isNaN(fen) || fen === '') {
    return fen
  }
  if (!fen) {
    return 0
  }
  const temp = new Dec(fen).mul(new Dec('0.01')).toFixed(2) * 1
  let s = temp.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}
// 价格转换6.2位
export function fen2yuan(fen) {
  if (isNaN(fen) || fen === '') {
    return fen
  }
  if (!fen) {
    return 0
  }
  const temp = new Dec(fen).mul(new Dec('0.000001')).toFixed(2) * 1
  let s = temp.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}
export function yuan2fen(yuan) {
  if (isNaN(yuan) || !yuan || yuan === '-' || yuan === '--') {
    return 0
  }
  return new Dec(yuan).mul(new Dec('1000000')).toFixed(2) * 1
}
// 价格转换6位0补齐 补位
export function fen2yuan6cover(fen) {
  if (isNaN(fen) || fen === '') {
    return fen
  }
  if (!fen) {
    return 0
  }
  const temp = new Dec(fen).mul(new Dec('0.000001')).toFixed(6) * 1
  let s = temp.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 6) {
    s += '0'
  }
  return s
}
export function yuan2fen6cover(yuan) {
  if (!yuan) {
    return 0
  }
  return new Dec(yuan).mul(new Dec('1000000')).toFixed(6) * 1
}

// 重量转换
export function g2kg(g) {
  if (isNaN(g) || g === '') {
    return g
  }
  if (!g) {
    return 0
  }
  const temp = new Dec(g).mul(new Dec('0.001')).toFixed(3) * 1
  let s = temp.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 3) {
    s += '0'
  }
  return s
}
export function kg2g(kg) {
  if (!kg) {
    return 0
  }
  return new Dec(kg).mul(new Dec('1000')).toFixed(3) * 1
}

//  数组返回重复项
export function refrain(arr) {
  const tmp = []
  if (Array.isArray(arr)) {
    arr.concat().sort().sort(function(a, b) {
      if (a === b && tmp.indexOf(a) === -1) tmp.push(a)
    })
  }
  return tmp
}
// 数组合并去重(商品)
export function MergeArray(arr1, arr2) {
  const _arr = []
  for (let i = 0; i < arr1.length; i++) {
    _arr.push(arr1[i])
  }
  for (let i = 0; i < arr2.length; i++) {
    let flag = true
    for (let j = 0; j < arr1.length; j++) {
      const eq = (typeof arr2[i] !== 'object' && arr2[i] === arr1[j]) ||
      (typeof arr2[i] === 'object' && arr2[i].goodsCode === arr1[j].goodsCode)
      if (eq) {
        flag = false
        break
      }
    }
    if (flag) {
      _arr.push(arr2[i])
    }
  }
  return _arr
}
