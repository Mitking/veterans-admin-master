<template>
  <div>
    <keep-alive :max="2" exclude="WmsCompForm">
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
        @deleteDetail="deleteDetail"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addPriceAlg, updatePriceAlg, getPriceAlgEntity, getPriceAlgTeamEntity } from '@/api/core/algteam'
import CoreCompForm from '@/views/wms/components/WmsCompForm.vue'
import Order from './algteam'
export default {
  name: 'AlgTeam',
  components: { CoreCompForm, Order },
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
        { title: '算法组名称', prop: 'teamName', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '市场名称必填', trigger: 'change' }] },
        // { title: '启用禁用', prop: 'enable', show: true, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true },
        { title: '备注', prop: 'remark', show: true, type: 'remark', addFatherProp: 'Req', editShow: true },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '算法名称', prop: 'algName', tableWidth: 200, show: false, type: 'selectFromPage', formProData: { id: 0 }, click: 'addItems', windowName: 'AlgSelect', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '算法名称必填', trigger: 'change' }] },
        { title: '最低成本价', prop: 'minCost', tableWidth: 100, defaultValue: '-', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '最高成本价', prop: 'maxCost', tableWidth: 100, defaultValue: '-', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '加价率(%)', prop: 'markupRate', tableWidth: 100, defaultValue: '-', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '加价额度', prop: 'markupQuota', tableWidth: 100, defaultValue: '-', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '小数点后取整', prop: 'afterPointRound', tableWidth: 120, defaultValue: '-', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '取整规则', prop: 'roundRule', tableWidth: 100, defaultValue: '-', readonly: true, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      return this.currentComponent === 'CoreCompForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    deleteDetail() {
      return Promise.resolve(true)
    },
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        getPriceAlgTeamEntity().then(res => { // 字典表强制更新
          if (res.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'alg_team': res.data })
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
      this.$set(this.table_data_arr[4].formProData, 'id', operateItem.prop === 'insert' ? 0 : this.currentRow.id)
      if (['detail', 'edit', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        getPriceAlgEntity({ teamId: this.currentRow.id }).then(res => {
          this.details = res.data.filter(iF => !!iF.teamId)
          this.currentComponent = 'CoreCompForm'
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') {
        this.details = []
        this.currentComponent = 'CoreCompForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, removeAlgIds = []) { // 提交回调处理
      let data_temp = this.deepClone(data)
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': case 'copy': // 新增,复制
          data_temp.Req.id = null
          data_temp = data_temp.Req
          data_temp.algIds = data.detailReqs.map(i => i.id)
          data_temp.removeAlgIds = []
          delete data_temp.detailReqs

          addPriceAlg(data_temp).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          data_temp = data_temp.Req
          data_temp.id = this.currentRow.id
          data_temp.algIds = data.detailReqs.map(i => i.id)
          data_temp.removeAlgIds = removeAlgIds.filter(idt => !data_temp.algIds.includes(idt))
          updatePriceAlg(data_temp).then(res => {
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
