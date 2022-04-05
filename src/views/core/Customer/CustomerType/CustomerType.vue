<template>
  <div>
    <mix-search v-show="searchFormShow" ref="searchForm" class="transition-box" :form="searchForm" :formlist="searchList" @search="search" />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="true"
      :ids="ids"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"  @row-click="(row)=>{currentRow = row;}" -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      :max-height="mixin_tab_max_height"
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
        class="my-op-fa"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            v-for="item in operateTableList"
            :key="item.prop"
            effect="light"
            :content="item.title"
            placement="top"
            :hide-after="1000"
            :enterable="false"
            :disabled="$store.state.app.tooltipDisabled"
          >
            <el-button
              v-show="item.show"
              v-permission="item.permission"
              class="my-op-class"
              type="text"
              size="mini"
              :disabled="comp_disabled_table(item,row)"
              :loading="item.loading"
              :icon="item.icon"
              @click.stop="
                if(operateTableList.every(item => !item.loading )){
                  currentRow=row;
                  $listeners.currentSelect(currentRow);
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
    <!--    Form弹窗栏目  -->
    <el-dialog
      :title="operateItem.title"
      :visible.sync="formShow"
    >
      <mix-form
        :formdata="$attrs['form-data']"
        :form-type="operateItem.prop"
        :current-row="currentRow"
        :formshow="formShow"
        @close="operateItem.loading = false"
        @formSave="formSave"
      />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getCustomerTypeRes, deleteCustomerType, getCustomerTypeGroup } from '@/api/core/Customer'
export default {
  name: 'Order',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', disabled: false, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: 0, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '类型名', prop: 'type', type: 'text', width: '300px' }
      ],
      ids: [],
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateTableList: [
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:customerType:update'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['ums:customerType:page'], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['ums:customerType:append'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-delete', disabled: 'ids', type: 'primary', permission: ['ums:customerType:delete'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        getCustomerTypeGroup({}).then(resz => { // 字典表强制更新
          if (resz.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'CustomerType': resz.data })
          }
        })
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getCustomerTypeRes(searchForm).then(res => {
        this.currentRow = { id: '' }
        this.tableData = res.data
        this.Mixin_loading = false
      })
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      this.operateItem.loading = true
      console.log('this.currentRow:', this.currentRow)
      this.formShow = true
    },
    formSave(e) { // 提交回调处理
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
      }
    },
    dels(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteCustomerType({ 'ids': this.ids }).then(res => {
          this.message(res)
          operateItem.loading = false
        }).finally(() => {
          operateItem.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    handleSelectionChange(rows) {
      this.selectRows = rows
      this.ids = rows.map(item => item.id)
      this.mixin_rows = rows
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

