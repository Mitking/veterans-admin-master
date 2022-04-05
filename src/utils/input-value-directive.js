import Vue from 'vue'

function onInput(el, ele, binding, vnode) {
  function handle() {
    // 只保留数字
    let val = ele.value
    // modifiers为修饰符对象，传入了float，则其float属性为true
    if (binding.modifiers.float) {
      // 清除"数字"和"."以外的字符
      val = val.replace(/[^\d.-]/g, '')
      // 0数字 开头干掉
      if (/^0\d(\d*)/g.test(val)) {
        val = val.replace(/0/g, '')
      }

      // 只保留第一个, 清除多余的
      val = val.replace(/\.{2,}/g, '.')
      // 只保留第一个'.', 清除多余的
      if (/[0-9]*\.[0-9]*\./g.test(val)) {
        val = val.replace(/[0-9]*\.[0-9]*\./g, /[0-9]*\.[0-9]*/.exec(val)[0])
      }

      // 可以是负数
      if (binding.value.minus) {
        val = val.replace(/-{2,}/g, '-') // 双减号变成一个
        if (/[0-9]-$/g.test(val) || /.-$/g.test(val)) { // 以减号结尾置空-
          val = val.replace(/-$/g, '')
        }
      } else {
        val = val.replace(/-/g, '')
      }
      // 第一个字符如果是.号，则补充前缀0
      val = val.replace(/^\./g, '0.')
      val = val.replace(/^-\./g, '-0.')
      if (typeof binding.value !== 'undefined') {
        // 期望保留的最大小数位数
        let pointKeep = 0
        if (typeof binding.value.decimal === 'string' ||
          typeof binding.value.decimal === 'number') {
          pointKeep = parseInt(binding.value.decimal)
        }
        if (!isNaN(pointKeep)) {
          if (!Number.isInteger(pointKeep) ||
            pointKeep < 0) {
            pointKeep = 0
          }
          let str = '^(\\d+)\\.(\\d\{' + pointKeep + '}).*$'
          if (binding.value.minus && /^-/.test(val)) {
            str = '^-(\\d+)\\.(\\d\{' + pointKeep + '}).*$'
          }
          const reg = new RegExp(str)
          if (pointKeep === 0) {
            // 不需要小数点
            val = val.replace(reg, '$1')
          } else {
            // 通过正则保留小数点后指定的位数
            if (binding.value.minus && /^-/.test(val)) {
              val = val.replace(reg, '-$1.$2')
            } else {
              val = val.replace(reg, '$1.$2')
            }
          }
        }
        if (typeof binding.value.max !== 'undefined') {
          let max = Number(binding.value.max)
          if (el.getElementsByTagName('input')[0].getAttribute('max-value') !== null) {
            max = el.getElementsByTagName('input')[0].getAttribute('max-value')
          }
          // console.log(max)
          if (Math.abs(val) > max) {
            val = (/^-/.test(val) ? '-' : '') + max
          }
        } else {
          if (Math.abs(val) > 10000000) val = (/^-/.test(val) ? '-' : '') + 10000000
        }
      }
      ele.value = val + ''
      // ele.value = Number(val)
    } else {
      if (typeof binding.value === 'object' && typeof binding.value.max !== 'undefined') {
        let max = Number(binding.value.max)
        if (el.getElementsByTagName('input')[0].getAttribute('max-value') !== null) {
          max = el.getElementsByTagName('input')[0].getAttribute('max-value') / 100
        }
        console.log(max)
        if (Number(val) > Number(binding.value.max)) {
          ele.value = binding.value.max
        } else {
          ele.value = ele.value.replace(/[\D]/g, '')
        }
      } else {
        if (Number(val) > 10000000) {
          ele.value = 10000000
        } else {
          ele.value = ele.value.replace(/[\D]/g, '')
        }
      }
    }
    // 当输入汉字时会导致vue model 数据不同步，因此在回调函数添加上以下代码，手动触发数据的双向绑定。
    if (vnode.componentInstance) {
      vnode.componentInstance.$emit('input', ele.value)
    } else {
      vnode.elm.dispatchEvent(new CustomEvent('input', ele.value))
    }
  }
  return handle
}
function onPointInput(el, ele, binding, vnode) {
  function handle() {
  // 只保留数字
    let val = ele.value
    // 清除"数字"和"."以外的字符
    val = val.replace(/[^\d.-]/g, '')
    // 清除..字符
    val = val.replace(/\.{2,}/g, '.')
    // 0数字 开头干掉
    if (/^0\d(\d*)/g.test(val)) {
      val = val.replace(/0/g, '')
    }
    // . 开头干掉
    if (/^[.]/.test(val)) {
      val = val.replace(/./g, '')
    }

    ele.value = val + ''
  }
  return handle
}

const numberInput = {
  bind(el, binding, vnode) {
    const ele = el.tagName === 'INPUT' ? el : el.querySelector('input')
    ele.addEventListener('keyup', onInput(el, ele, binding, vnode), false)
  }
}
const numberPointInput = {
  bind(el, binding, vnode) {
    const ele = el.tagName === 'INPUT' ? el : el.querySelector('input')
    ele.addEventListener('keyup', onPointInput(el, ele, binding, vnode), false)
  }
}

function priceInput(el, ele, binding, vnode) {
  function handle() {
    // 只保留数字
    // const val = ele.value
    console.log(ele)
    ele.value = Number(ele.value)
    // 当输入汉字时会导致vue model 数据不同步，因此在回调函数添加上以下代码，手动触发数据的双向绑定。
    if (vnode.componentInstance) {
      vnode.componentInstance.$emit('input', ele.value)
    } else {
      vnode.elm.dispatchEvent(new CustomEvent('input', ele.value))
    }
  }
  return handle
}

const numberPriceInput = {
  bind(el, binding, vnode) {
    const ele = el.tagName === 'INPUT' ? el : el.querySelector('input')
    ele.addEventListener('keyup', priceInput(el, ele, binding, vnode), false)
  }
}

Vue.directive('number-input', numberInput)
Vue.directive('number-price-input', numberPriceInput)
Vue.directive('number-point-input', numberPointInput) // 只能输入数字和.
