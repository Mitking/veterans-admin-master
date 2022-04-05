<template>
  <div>
    <keep-alive :max="2" exclude="CompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :current-row="currentRow"
        :details="details"
        :show="formShow"
        :insertloading="insertLoading"
        :detailloading="detailLoading"
        :editloading="editLoading"
        :order_no="orderNo"
        :operate-item="operateItem"
        @tabDateChange="tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import { review, addOrder, updateOrder, getDetails } from '@/api/wms/activ/discount'
import { getActivNumber } from '@/api/wms/activ/getOrderNo'
import CompForm from './components/CompForm.vue'
import Order from './discount.vue'
// import { getCategoryList } from '@/api/core/goodscategory'
// import store from '@/store'
export default {
  name: 'ActivDiscount',
  components: { CompForm, Order },
  // 全局常用字段
  data() {
    return {
      searchFormHeight: 150,
      orderNo: '',
      insertLoading: false,
      detailLoading: false,
      editLoading: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      tabDate: [],
      operateItem: {},
      details: []

    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'CompForm')
      return this.currentComponent === 'CompForm'
    }
  },
  watch: {},
  created() {
    // getCategoryList({}).then(res => {
    //   store.dispatch('enum/add_enum', { categoryList: res.data || [] })
    // })
  },
  methods: {
    invalidDateCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.validDate > value) {
        callback(new Error())
      } else {
        callback()
      }
    },
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
      this.detailLoading = operateItem.prop === 'detail'
      this.editLoading = operateItem.prop === 'edit'
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'discountNo': this.currentRow.discountNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            this.currentComponent = 'CompForm'
          } else {
            this.$message.error('获取失败')
          }
        }).finally(() => {
          this.detailLoading = false
          this.editLoading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.insertLoading = true
        this.details = []
        getActivNumber({ type: 'HD_ZK' }).then(res => {
          if (res.code === 200) {
            this.orderNo = res.data
            this.currentComponent = 'CompForm'
            this.insertLoading = false
          }
        })
      }
    },
    formSave(arg, data = { ingleReq: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.discountNo = data.discountReq.discountNo
            })
          }
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
            if (res.code === 200 && arg.review) {
              this.review(res.data)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.discountNo = data.detailReqs.discountNo
            })
          }

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
    review(id = null, isSure = false) { // 审核
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
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        this.message(res)
      }).catch(err => {
        this.loading = false
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'Order'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        throw err
      })
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将删除${this.mix_comp_find_order_title_name('adjustmentOrderNo', this.table_data_arr)}「${item.adjustmentOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve(true)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          resolve(false)
        })
      })
    }
  }
}
</script>
<style scoped>
</style>
