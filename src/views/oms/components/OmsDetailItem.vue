<template>
  <!-- toString -->
  <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
    <el-form-item
      v-for="(item,index) in ArrFilter($attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true })"
      v-show="formItemShow(item)"
      :key="index"
      class="wid"
      :style="{'width':'25%'}"
      :prop="item.prop"
    >
      <span slot="label">
        {{ item.type==='remark'?'':item.title }}
        <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
          <i class="el-icon-warning-outline" />
        </el-tooltip>
      </span>
      <!--      <div v-if="item.type==='text' || item.type==='date' || item.type==='number'">{{ form[item.prop] }}</div>-->
      <div v-if="(item.type==='selectState' || item.type==='select') && formItemShow(item)">{{ MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) || "-" }}</div>
      <div v-else-if="item.type==='if_type' || item.type==='if_enable'">
        <span>
          {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop]) }}
        </span>
      </div>
      <div v-else-if="item.type==='PRICE_AUTOMATIC' || item.type==='PRICE' || item.type==='PRICE_ADVANCE'">{{ fen2yuan(form[item.prop]) }}</div>
      <el-tooltip
        v-else-if="item.type==='storeIds'"
        effect="dark"
        :content="form[item.prop].map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString()"
        placement="top-start"
      >
        <div>
          {{ form[item.prop].map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString() | sizeFilter(10) }}
        </div>
      </el-tooltip>
      <div v-else>{{ form[item.prop] || '-' }}</div>
    </el-form-item>
  </el-form>
</template>

<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'OmsDetailItem',
  data() {
    return {
      form: {}
    }
  },
  computed: {
    // 提交校验
    rules() {
      const temp_obj = {}
      ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true }).map(item => {
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
          this.form[e.prop] = (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
            ? (this.form[e.prop] || ((typeof e.defaultValue === 'undefined') ? '' : e.defaultValue)) : null
          return (this.form[Object.keys(e.fa_show)[0]] === Object.values(e.fa_show)[0])
        }
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => this.form[propitem.fatherProp] === '' ? true : item[propitem.fatherPropName || propitem.fatherProp] === this.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.form[propitem.prop])) {
            this.form[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : '')
          }
          return temp
        }
        return this.enumGetproplist(propitem, propitem.selectDataFilter) || []
      }
    } },
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
          const type1 = typeof this.$attrs['current-row'][item.prop] !== 'undefined'
          temp[item.prop] = type1 ? this.$attrs['current-row'][item.prop]
            : (this.$attrs['current-row'][item.prop] || item.defaultValue || '-')
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
