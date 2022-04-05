<template>
  <div>
    <!--    <input v-model="$attrs.form.goodsCode" type="text">-->
    <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">
      <el-form-item
        v-for="(item,index) in ArrFilter($attrs['form-data'], { addFatherProp: 'destination', 'editShow': true })"
        v-show="formItemShow(item)"
        :key="index"
        :style="{'width':'25%'}"
        :label="item.type==='remark'?'':item.title"
        :prop="item.prop"
      >
        <!--        -->
        <el-input v-if="item.type==='text'" v-model="form[item.prop]" :placeholder="item.placeholder" :readonly="item.readonly" />
        <el-input v-if="item.type==='selectState'" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :placeholder="item.placeholder" :readonly="item.readonly" />
        <el-select v-if="item.type==='select' && !item.readonly" v-model="form[item.prop]" class="item-select-fa" placeholder="请选择">
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-input v-if="item.type==='select' && item.readonly" :placeholder="item.placeholder" :value="MenuGetPropName(item.selectData,form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })" :readonly="item.readonly" />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="form[item.prop]"
          style="width: 100%"
          value-format="yyyy-MM-dd"
        />
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,form[item.prop]) }}
          </span>
          <el-switch
            v-if="!item.readonly"
            v-model="form[item.prop]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </div>
      </el-form-item>
      <el-form-item style="width: 100%;padding:0;margin:0" />
      <el-form-item
        v-for="(item,i) in ArrFilter($attrs['form-data'], { addFatherProp: 'destination', 'editShow': true, type:'remark' })"
        :key="10000+i"
        label="备注"
        style="width: 50%;padding-right: 0"
      >
        <el-input v-model="form[item.prop]" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'WmsNodeFormItem',
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
        if (e.formShow === false) {
          return false
        }
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
          temp = temp.filter(item => this.form[propitem.fatherProp] === '' ? false : item[propitem.fatherPropName || propitem.fatherProp] === this.form[propitem.fatherProp])
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
        console.log('数据开始初始化')
        this.loading = true
        const temp = {}
        if (['edits', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,批量修改
          ArrFilter(this.$attrs['form-data'], { addFatherProp: 'destination', 'editShow': true }).map(item => {
            temp[item.prop] = typeof item.defaultValue === 'boolean' ? item.defaultValue : (item.defaultValue || '')
          })
          this.form = temp
        } else if (['edit'].includes(this.$attrs['operate-item'].prop)) { // 修改
          // this.form = this.deepClone(this.$attrs.details_destination'])
          ArrFilter(this.$attrs['form-data'], { addFatherProp: 'destination', 'editShow': true }).map(item => {
            temp[item.prop] = this.$attrs.details_destination[item.prop]
          })
          this.form = temp
        }
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
