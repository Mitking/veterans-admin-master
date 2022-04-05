<template>
  <div>
    <mix-search v-show="searchFormShow" ref="searchForm" :form="searchForm" :formlist="searchList" v-bind="$attrs" @search="search" />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :back="true"
      :ids="ids"
      :current-row="currentRow"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(dataList,{show:true}))}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{ currentRow = row }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="(item,index) in ArrFilter(dataList,{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '200'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='localSelect'">{{ item.selectData[row[item.prop]] }}</div>
          <div v-else-if="item.type==='img'">
            <el-image
              style="width: 50px; height: 50px"
              :src="row[item.prop]"
              fit="scale-down"
            />
          </div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      title="员工选择"
      :visible.sync="mixin_select_form_show"
      :append-to-body="true"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, deleteOrder, swEnableState } from '@/api/wms/retailmobiledevicesregister'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'Order',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' },
      ids: [],
      editShow: false,
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'deviceOrgId', type: 'select', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'deviceStoreId', type: 'select', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherPropName: 'orgId', fatherProp: 'deviceOrgId', width: '300px' },
        { title: '操作人', prop: 'operatorId', reallyProp: 'operator', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '开始时间', prop: 'startDate', type: 'datetime' },
        { title: '结束时间', prop: 'endDate', type: 'datetime', defaultTime: '23:59:59' }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'edit', click: this.search, loading: false, icon: 'el-icon-edit-outline', disabled: false, type: 'primary', permission: [], width: 80 }
        // { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['retail:mobile:devices:register:delete'], width: 80 },
        // { title: '启用', show: true, prop: 'invoke', click: this.disabledFn, loading: false, icon: 'el-icon-switch-button', disabled: 'isRow', disabledFn: this.invoke, type: 'primary', permission: ['retail:mobile:devices:register:swEnableState'], width: 80 },
        // { title: '禁用', show: true, prop: 'disabled', click: this.disabledFn, loading: false, icon: 'el-icon-circle-close', disabled: 'isRow', disabledFn: this.disabled, type: 'primary', permission: ['retail:mobile:devices:register:swEnableState'], width: 80 }
      ],
      dataList: [
        { title: 'ID', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '账号类型', width: 150, prop: 'accountType', show: true, type: 'localSelect', selectData: ['平台级别', '门店级别', '组织级别', '账套级别'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '类型', width: 100, prop: 'type', show: true, type: 'localSelect', selectData: ['管理员', '会员用户'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '头像', width: 150, prop: 'avatar', show: true, type: 'img', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '账套', width: 150, prop: 'accountNum', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '组织', width: 150, prop: 'orgName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '门店', width: 150, prop: 'storeName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '用户名', width: 150, prop: 'username', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: 'IP地址', width: 200, prop: 'ip', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '设备', width: 150, prop: 'device', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '操作时间', width: 150, prop: 'operatorDate', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],

      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: [],
      details: [], // 详细数据
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0
    }
  },
  computed: {
    idsLength() {
      return true
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
      }
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    getDate() {
      getPage().then(res => {
        if (res.code === 200) {
          this.tableData = res.data
          this.editShow = false
          this.Mixin_loading = false
        }
      })
    },
    invoke() {
      return this.currentRow.enableState
    },
    disabled() {
      return !this.currentRow.enableState
    },
    // save() {
    //   updateOrSave(this.tableData).then(res => {
    //     if (res.code === 200) {
    //       this.getDate()
    //     }
    //   }).catch(() => {
    //     this.editShow = false
    //   })
    // },
    edit() {
      console.log('edit')
      this.editShow = true
    },
    output() {
      console.log('output')
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      // searchForm.updateType = searchForm.updateType ? Number(searchForm.updateType) : null

      this.Mixin_loading = true
      getPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除终端型号「${this.currentRow.deviceModel}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteOrder({ 'stoInvPlanNo': this.currentRow.stoInvPlanNo }).then(res => {
          this.message(res)
          operateItem.loading = false
        }).catch(err => {
          operateItem.loading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    // reviews() { // 批量审核
    //   review({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
    //     this.message(res)
    //   })
    // },
    disabledFn(e, isSure = false) { // 禁用启用
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认${this.currentRow.enableState ? '禁用' : '启用'}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.disabledFn(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
          e.loading = false
        })
        return
      }
      swEnableState({ 'id': this.currentRow.id }).then(res => {
        this.message(res)
      }).finally(() => {
        e.loading = false
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow ? 0 : 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    }
  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
</style>
