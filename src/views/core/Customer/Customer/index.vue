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
        :details="details"
        :show="formShow"
        :cascaderbycode="true"
        v-bind="$attrs"
        v-on="$listeners"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'CoreForm'"
        :show="detailFormShow?'CoreForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { appendCustomerManage, updateCustomerManage } from '@/api/core/Customer'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './Customer.vue'
export default {
  name: 'Customer',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    // const checkCycle = function(rule, value, callback) {
    //   if (!value || value[0] === '0') {
    //     callback(new Error('不能为空或0'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      detailFormShow: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false, detailShow: false },
        { title: '客户名', prop: 'name', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '客户名必填', trigger: 'change' }] },
        { title: '类型', prop: 'typeId', width: 150, show: true, tipMsgPath: '/customer/type', permission: 'ums:customerType:page', type: 'select', selectData: 'CustomerType', selectOption: { label: 'type', value: 'id' }, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '电话', prop: 'mobile', show: true, width: 150, type: 'Number', float: { max: 99999999999 }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { max: 99999999999, type: 'number', transform: (v) => Number(v), message: '长度不能超过11位', trigger: 'change' }] },
        { title: '生日', prop: 'birthday', width: 150, show: true, type: 'date', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '联系人', prop: 'contactPerson', width: 150, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '联系人电话', prop: 'contactMobile', width: 150, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '邮编', prop: 'postCode', width: 150, show: false, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '电子邮箱', prop: 'email', width: 150, show: false, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '工作单位', prop: 'employer', width: 150, show: false, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '联系地址', prop: 'contactAddress', width: 150, show: false, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true }
      ],
      details: [], // 详细数据
      TEMP_NAME: '' // 供应商名缓存
    }
  },
  computed: {
    formShow() {
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
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit', 'insert'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
        if (this.$attrs.is_child) { // 选单时弹窗展示详情
          this.detailFormShow = true
        } else {
          this.currentComponent = 'CoreForm'
        }
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增,复制
          data.Req.id = null
          appendCustomerManage(data.Req).then(res => {
            this.message(res)
          }).finally(() => {
            this.loading = false
          })
          break
        case 'edit': // 修改
          updateCustomerManage(data.Req).then(res => {
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
