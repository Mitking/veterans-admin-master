<template>
  <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="120px">
    <el-form-item
      v-for="(item,index) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true })"
      v-show="formItemShow(item)"
      :key="index"
      class="wid"
      :style="{'width':'25%'}"
      :prop="item.prop"
    >
      <span slot="label">
        {{ item.title }}
        <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
          <i class="el-icon-warning-outline" />
        </el-tooltip>
      </span>
      <div v-if="form[item.prop]===''" style="color:#999999">-</div>
      <div v-else>
        <div v-if="item.type==='text' || item.type==='number' || item.type==='Number' || item.type==='date' || item.type==='timeSf'">{{ form[item.prop] || '-' }}</div>
        <div v-if="item.type==='PRICE'">{{ form[item.prop]?fen2yuan(form[item.prop]):'-' }}</div>
        <div v-if="item.type==='selectState' || item.type==='select'">
          {{ MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}
        </div>
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop]) }}
          </span>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'WmsDetailItem',
  data() {
    return {
      form: {}
    }
  },
  computed: {
    // 提交校验
    rules() {
      const temp_obj = {}
      this.$attrs['form-data'].map(item => {
        if (item.rule) {
          temp_obj[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })
      return temp_obj
    },
    formItemShow() { // 父级数据联动渲染
      return function(e) {
        if (typeof e.fa_show === 'undefined') {
          return true
        } else {
          // this.form[e.prop] = (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
          //   ? (this.form[e.prop] || ((typeof e.defaultValue === 'undefined') ? '' : e.defaultValue)) : null
          return Object.keys(e.fa_show).every(item => this.form[item] === e.fa_show[item])
        }
      }
    }
    // selectComputed() { // select选项集
    //   return function(propitem) {
    //     if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
    //       let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
    //       temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
    //       if (!temp.map(item => item.value).includes(this.$attrs.form[propitem.prop])) {
    //         this.$attrs.form[propitem.prop] = 0
    //       }
    //       return temp
    //     }
    //     return this.enumGetproplist(propitem)
    //   }
    // }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('详情数据开始初始化')
        this.loading = true
        const temp = {}
        // 详情
        ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true }).map(item => {
          const type1 = typeof this.$attrs['current-row'][item.prop] === 'boolean'
          temp[item.prop] = type1 ? this.$attrs['current-row'][item.prop]
            : (this.$attrs['current-row'][item.prop] || item.defaultValue || '')
        })
        this.form = temp
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
</style>
