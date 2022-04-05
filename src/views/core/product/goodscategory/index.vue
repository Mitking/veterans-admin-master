<template>
  <div>
    <keep-alive :max="2" exclude="CoreForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :within-add-row="withinAddRow"
        :details="details"
        :show="formShow"
        :cascaderbycode="true"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=deepClone(e);delete currentRow.haveChild}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addCategory, updateCategory, getCategoryList } from '@/api/core/goodscategory'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './goodscategorynewui'
import store from '@/store'
export default {
  name: 'GoodsCategoryIndex',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    var parentCodeCheck = (rule, value, callback) => {
      const form = this.$refs.Comp.$refs.Form.form
      if (value && value === form.code) {
        return callback(new Error('不能选择自身为父级'))
      }
      callback()
    }
    return {
      loading: false,
      currentComponent: 'Order',
      withinAddRow: {},
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, formHidden: true, disabled: true, type: 'text', defaultValue: null, editShow: false, addFatherProp: 'Req' },
        { title: '分类代码', prop: 'code', width: 200, show: true, type: 'Number', editShow: false, addFatherProp: 'Req' },
        { title: '分类名称', prop: 'name', width: 200, show: true, type: 'text', editShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '分类名称必填', trigger: 'change' }] },
        { title: '上级分类', prop: 'parentCode', show: false, type: 'goodsCategory', defaultValue: '', valueProp: 'code', editShow: true, addFatherProp: 'Req',
          rule: [{ validator: parentCodeCheck, trigger: 'change' }] },
        { title: '上级分类', prop: 'parentCode', width: 200, show: true, type: 'select', selectData: 'categoryList', selectOption: { value: 'code', name: 'name' },
          defaultValue: '0', editShow: false, addFatherProp: 'other' },
        { title: 'POS展示', prop: 'ifPosShow', width: 100, show: true, type: 'if_type', defaultValue: true, editShow: true, addFatherProp: 'Req' },
        { title: '是否启用', prop: 'enable', width: 100, show: true, type: 'if_enable', defaultValue: true, editShow: true, addFatherProp: 'Req' }
        // { title: '是否有子类', prop: 'haveChild', width: 100, show: true, type: 'if_type', readonly: true, defaultValue: false, editShow: false, addFatherProp: 'Req' },
        // { title: '序号', prop: 'sortNo', show: true, width: 100, type: 'Number', float: { max: 99 }, editShow: true, addFatherProp: 'Req' }
        // { title: '备注', prop: 'remark', show: true, type: 'text', editShow: true, width: '90%', addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'CoreForm')
      return this.currentComponent === 'CoreForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        //  更新枚举表
        getCategoryList({}).then(res => { // 强制更新数据字典
          store.dispatch('enum/add_enum', { categoryList: res.data })
          this.$refs.Comp.search()
        })
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'enable', 'editShow', operateItem.prop !== 'insert')
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit', 'insert', 'withinAdd'].includes(operateItem.prop)) { // 详情，修改
        this.details = null
        if (operateItem.prop === 'withinAdd') { // 追加
          this.withinAddRow.parentCode = this.currentRow.code || ''
        }
        this.currentComponent = 'CoreForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert' :case 'withinAdd': // 新增
          delete data.Req.id
          data.Req.parentCode = data.Req.parentCode || '0'
          addCategory(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data.Req.parentCode = data.Req.parentCode || '0'
          updateCategory(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        default:
          console.log(arg, data)
      }
    }
  }
}
</script>
<style scoped>
</style>
