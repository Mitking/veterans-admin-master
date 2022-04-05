<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
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
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
        @updataWidth="updataWidth"
        @deleteNodes="deleteNodes"
        @updateDetailsNotes="updateDetailsNotes"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, review, deleteNode, getStoNumber } from '@/api/wms/vehicle'
import WmsForm from '@/views/wms/components/WmsVehicleForm'
const dayjs = require('dayjs')
import Order from './vehicle'
export default {
  name: 'VehicleIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['pd:vehicle:schedul:order:verify'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '车辆调度单号', prop: 'vehicleSchedulOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '调度日期', width: 150, prop: 'schedulDate', defaultValue: dayjs().format('YYYY-MM-DD'), show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '审核状态', width: 150, prop: 'auditStatuDes', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 150, prop: 'createTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewerName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 150, prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: true, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '始发城市', prop: 'startCity', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '到达城市', prop: 'arriveCity', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '车辆类型', prop: 'carType', show: false, type: 'select', selectData: 'CAR_TYPE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '司机', prop: 'driver', show: false, type: 'select', selectData: 'personListSJ', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '电话', prop: 'phone', show: false, type: 'number', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { max: 99999999999, type: 'number', transform: (v) => Number(v), message: '长度不能超过11位', trigger: 'change' }] },
        { title: '车牌号', prop: 'carNumber', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { max: 8, type: 'number', transform: (v) => v.length, message: '长度不能超过8位', trigger: 'change' }] },
        // { title: '始发地址', prop: 'startAddr', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '到达地址', prop: 'arriveAddr', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '节点', prop: 'notes', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 180 },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'nodes', tableHidden: true },
        { title: '城市', prop: 'city', show: false, placeholder: '城市必填', type: 'text', editShow: true, detailShow: true, addFatherProp: 'nodes',
          rule: [{ required: true, message: '城市必填', trigger: 'blur' }] },
        { title: '地址', prop: 'addr', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'nodes' },
        { title: '纬度', prop: 'lat', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'nodes' },
        { title: '经度', prop: 'lng', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'nodes' },
        { title: '路径索引', prop: 'routeIndex', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'nodes', tableHidden: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
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
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'vehicleSchedulOrderNo': this.currentRow.vehicleSchedulOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.details
        // this.formShow = true
        this.currentComponent = 'WmsForm'
        operateItem.loading = false
        // } else {
        //   this.$message.error('获取失败')
        //   operateItem.loading = false
        // }
        // })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getStoNumber({ type: 'WLDD' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsForm'
            operateItem.loading = false
          }
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
          data.id = null
          addOrSaveOrder(data).then(res => {
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
          addOrSaveOrder(data).then(res => {
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
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
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
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除选中的路线, 是否继续?`, '提示', {
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
    },
    deleteNodes(id) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除调度单号「${this.currentRow.vehicleSchedulOrderNo}」中的路线节点, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (id) {
            deleteNode({ id: id }).then(res => {
              if (res.code === 200) {
                resolve(true)
              } else {
                resolve(false)
              }
            })
          } else {
            resolve(true)
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          resolve(false)
        })
      })
    },
    updataWidth(obj, extent) {
      // extent
      if (extent > 3) {
        this.ArrFilter(this.table_data_arr, obj)[0].tabWidth = (extent - 3) * 360
      }
    },
    updateDetailsNotes(rowId, nodeId) {
      this.details.filter(item => item.id === rowId)[0].notes.filter(item => item.id === nodeId)[0].id = null
    }
  }
}
</script>
<style scoped>
</style>
