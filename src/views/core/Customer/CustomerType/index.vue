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
import { appendCustomerType, updateCustomerType, getCustomerTypeGroup } from '@/api/core/Customer'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './CustomerType.vue'
export default {
  name: 'CustomerType',
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
        { title: '类型名', prop: 'type', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '客户名必填', trigger: 'change' }] },
        { title: '备注', prop: 'remark', width: 400, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true }
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
        getCustomerTypeGroup({}).then(resz => { // 字典表强制更新
          if (resz.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'CustomerType': resz.data })
          }
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
          appendCustomerType(data.Req).then(res => {
            this.message(res)
          }).finally(() => {
            this.loading = false
          })
          break
        case 'edit': // 修改
          updateCustomerType(data.Req).then(res => {
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
