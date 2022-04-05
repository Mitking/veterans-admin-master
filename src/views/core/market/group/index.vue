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
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addSupplierGroup, updateSupplierGroup, getSupplierGroupList } from '@/api/core/supplier'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './group'
export default {
  name: 'SupplierGroupIndex',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        { title: '市场名称', prop: 'groupName', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '市场名称必填', trigger: 'change' }] },
        { title: '市场代码', prop: 'groupCode', show: false, width: 100, type: 'text', addFatherProp: 'Req', editShow: false, formItemWidth: 100 },
        // { title: '启用禁用', prop: 'enable', show: true, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true },
        // { title: '账套编号 ', prop: 'groupId', show: true, type: 'text', addFatherProp: 'Req', editShow: true },
        // { title: '公司编号', prop: 'companyId', show: true, type: 'text', addFatherProp: 'Req', editShow: true },
        // { title: '创建时间', prop: 'createTime', show: true, type: 'text', addFatherProp: 'Req', editShow: false },
        // { title: '修改时间', prop: 'updateTime', show: true, type: 'text', addFatherProp: 'Req', editShow: false },
        { title: '市场位置', prop: 'groupLocation', width: 200, show: true, type: 'text', addFatherProp: 'Req', formWidth: '45%', editShow: true },
        { title: '备注', prop: 'remark', show: true, type: 'remark', addFatherProp: 'Req', editShow: true }
      ],
      details: [] // 详细数据
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
        getSupplierGroupList().then(res => { // 字典表强制更新
          if (res.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'supplier_group': res.data })
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
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
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
        case 'insert': case 'copy': // 新增,复制
          data.Req.id = null
          addSupplierGroup(data.Req).then(res => {
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
          updateSupplierGroup(data.Req).then(res => {
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
    // review() { // 审核
    //   review({ 'ids': [this.currentRow.id], 'auditStatus': '3' }).then(res => {
    //     if (res.code === 200) {
    //       this.message(res)
    //     }
    //   }).catch(err => {
    //     this.loading = false
    //     throw err
    //   })
    // },
    // deleteDetail(item) {
    //   return new Promise(resolve => {
    //     this.$confirm(`此操作将永久删除单号「${item.acceptNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }).then(() => {
    //       // this.operateItem.loading = true
    //       deleteDetails({ ids: [item.id] }).then(res => {
    //         if (res.code === 200) {
    //           this.$success('操作成功')
    //         } else {
    //           this.$error(res.data)
    //         }
    //         resolve(true)
    //       }).catch(err => {
    //         throw err
    //       })
    //     }).catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //       resolve(false)
    //     })
    //   })
    // }
  }
}
</script>
<style scoped>
</style>
