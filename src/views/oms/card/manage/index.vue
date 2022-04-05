<template>
  <div>
    <keep-alive :max="2" exclude="OmsCardComp">
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
        :form-bottons="form_bottons"
        :detail_table_buttons="detail_table_buttons"
        v-bind="$attrs"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrder, getSendNumber, getDetails, updateOrder, reviews } from '@/api/oms/card/manage'
import OmsForm from '@/views/oms/components/OmsCardComp'
import Order from './manage'
import dayjs from 'dayjs'
export default {
  name: 'CardManageIndex',
  components: { OmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const faceNoInputFn = (row, form) => {
      if (form.cardMeson !== '3') { // 不是芯片卡
        row.cardNo = row.faceNo
      }
    }
    const cardNoInputFn = (row, form, key, index, refs) => {
      console.log(key)
      if (key.substr(-1, 1) === ' ' || key === 'enter') {
        console.log('换行')
        if (key.substr(-1, 1) === ' ') {
          row.cardNo = key.substr(0, key.length - 1)
        }
        if (refs['cardNo' + (index + 1)] && refs['cardNo' + (index + 1)].length) {
          refs['cardNo' + (index + 1)][0].focus()
        }
        // focus
      }
    }
    const cardno_check = (rule, value, callback) => {
      if (this.refrain(this.Mixin_tabDate.map(item => item.cardNo)).includes(value)) { // 出现重复卡号
        return callback(new Error('卡号重复'))
      }
      callback()
    }
    const faceno_check = (rule, value, callback) => {
      if (this.refrain(this.Mixin_tabDate.map(item => item.faceNo)).includes(value)) { // 出现重复卡号
        return callback(new Error('卡面号重复'))
      }
      callback()
    }

    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:createCard:review'] }
      ],
      detail_table_buttons: [
        { title: '清空列表', show: true, prop: 'clearList' },
        { title: '追 加', show: true, prop: 'addItem' },
        { title: '批量创建', show: true, prop: 'addList' }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '创建单号', prop: 'cardCreateNo', width: 230, show: true, type: 'text', defaultValue: '', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '创建日期', prop: 'createDate', width: 150, defaultValue: dayjs().format('YYYY-MM-DD'), show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '创建日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: true, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, outTabHidden: true, tabHidden: true, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '门店', prop: 'storeId', width: 200, readonly: true, show: true, type: 'select', defaultValue: this.$store.state.user.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '卡介质', prop: 'cardMeson', width: 100, readonly: false, show: true, type: 'select', defaultValue: '3', selectData: 'card_meson', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '卡类型不能为空', trigger: 'change' }] },
        { title: '起始卡面号', prop: 'originCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '结束卡面号', prop: 'endCardNo', width: 200, show: true, type: 'number', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '单卡面值', prop: 'cardAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '不能为空或负数', trigger: 'change' }] },
        { title: '卡数量', prop: 'count', width: 100, show: true, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatus', width: 100, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 180, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewTime', width: 180, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        // { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '卡面号', prop: 'faceNo', show: false, type: 'text', inputFn: faceNoInputFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'blur' }, { validator: faceno_check, trigger: 'change' }] },
        { title: '卡号', prop: 'cardNo', tipMsg: '读卡器,空格或enter键可换行', tableWidth: 300, inputFn: cardNoInputFn, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ required: true, message: '不能为空', trigger: 'blur' }, { validator: cardno_check, trigger: 'change' }] },
        { title: '卡面值', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空或负数', trigger: 'change' }] }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsForm')
      return this.currentComponent === 'OmsForm'
    }
  },
  watch: {
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'cardMeson', 'readonly', n.some(item => item.cardNo !== ''))
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.loading = false
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.msg)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情
        getDetails({ 'cardCreateNo': this.currentRow.cardCreateNo }).then(res => {
          this.details = res.data
          // this.formShow = true
          this.currentComponent = 'OmsForm'
          operateItem.loading = false
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'LPK_CJ' }).then(res => {
          this.table_data_arr[1].defaultValue = res.data
          this.currentComponent = 'OmsForm'
          operateItem.loading = false
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null
          data.orgId = data.Req.orgId
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.cardCreateNo = data.Req.cardCreateNo
              item.cardMeson = data.Req.cardMeson
            })
          }
          data.createReq = data.Req

          delete data.Req
          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrder(data).then(res => {
                if (res.code === 200) {
                  this.review(res.data.id, true)
                }
              }).catch(err => {
                this.loading = false
                throw err
              })
            }).catch(() => {
              this.$message.info('已取消审核')
              this.loading = false
            })
            return
          }
          addOrder(data).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data.orgId = data.Req.orgId
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.cardCreateNo = data.Req.cardCreateNo
              item.cardMeson = data.Req.cardMeson
            })
          }
          data.createReq = data.Req

          delete data.Req
          updateOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review()
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
    },
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.review(id, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          if (this.operateItem.prop === 'insert') {
            this.currentComponent = 'Order'
            setTimeout(() => {
              this.$refs.Comp.search()
            }, 0)
          }
          this.loading = false
        })
        return
      }
      reviews({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).catch(() => {
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'Order'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        this.loading = false
      })
    }
    // deleteDetail(item) {
    //   return new Promise(resolve => {
    //     this.$confirm(`此操作将永久删除单号「${item.cardManageNo}」中的项目, 是否继续?`, '提示', {
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
