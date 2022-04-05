import Vue from 'vue'
// key.enter触发
Vue.directive('entersearch', {
  bind: function(el, binding, vnode) {
    el.function_bind = function(e) {
      // console.log(vnode.context.$options.name)
      // console.log(vnode.parent.context.$options.name)
      // console.log(vnode.parent.context.$parent.$options.name)
      // console.log(vnode.context.$route.name)
      // console.log(binding.modifiers.all)
      // console.log(binding.arg)
      if (binding.arg === e.key &&
      (binding.value.is_child ||
      [vnode.context.$options.name, vnode.parent.context.$options.name, vnode.parent.context.$parent.$options.name].includes(vnode.context.$route.name))) {
        if (binding.value.func) { // 自动调用
          return binding.value.func()
        }
        binding.value.handFunc() // 手动调用
      }
    }
    document.addEventListener('keydown', el.function_bind)
  },
  unbind: function(el, binding) {
    document.removeEventListener('keydown', el.function_bind)
  }
})
