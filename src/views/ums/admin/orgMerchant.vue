<template>
  <div>
    <!--搜索栏目-->
    <mix-search
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :form-data="table_title_arr"
      @search="search"
    />
    <!-- 操作栏目 -->
    <mix-operate :ids="ids" :operate-list="operateList" :current-row="currentRow" />
    <!--    表格    -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:12px 24px;width: 951px;"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      row-key="id"
      :data="tableData.records"
      default-expand-all
      :row-style="rowSty"
      @row-click="rowClick"
    >
      <!--   v-if=&quot;item.show&quot; 表头  -->
      <el-table-column
        v-for="(item,index) in table_title_arr.filter(itemF=>itemF.show)"
        :key="index"
        :prop="item.prop"
        :align="index===0?'left':'center'"
        :width="item.width || '200'"
      >
        <template v-if="item.show" slot="header">
          <div style="display:flex;justify-content:center">{{ item.title }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
    <el-dialog :title="formTitle" :visible.sync="showForm">
      <org-form v-if="showForm" :org-entity="currentRow" @refresh="showForm=false;search" />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { page } from '@/api/ums/org'
import OrgForm from '@/views/ums/admin/components/OrgForm'

export default {
  name: 'OrgMerchant',
  components: { OrgForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      ids: [],
      currentRow: { id: '' }, // 当前选择数据
      operateList: [ // 搜索栏项目
        {
          title: '查询列表',
          show: true,
          click: this.search,
          icon: 'el-icon-search',
          disabled: false,
          type: 'primary',
          permission: ['ums:org:getList'],
          width: 80
        },
        {
          title: '添加组织',
          show: true,
          click: this.add,
          icon: 'el-icon-plus',
          disabled: false,
          type: 'success',
          permission: ['ums:org:saveOrUpdate'],
          width: 80
        },
        {
          title: '修改组织',
          show: true,
          click: this.edit,
          icon: 'el-icon-edit-outline',
          disabled: 'isRow',
          type: '',
          permission: ['ums:org:saveOrUpdate'],
          width: 80
        }
      ],
      searchList: [
        { title: '组织简称', prop: 'orgShortName', type: 'text' }
      ],
      searchForm: {
        accountId: '',
        orgShortName: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: {
        records: [],
        total: 0
      },
      table_title_arr: [
        { title: '账套编号', prop: 'accountName', show: true, type: 'account', selectData: 'accounts', selectOption: { label: 'accountNum', value: 'id' }, formShow: true },
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', width: 300, defaultValue: null, formShow: true },
        { title: '名称', prop: 'orgName', width: 300, show: true, type: 'text', formShow: true },
        { title: '组织简称', prop: 'orgShortName', width: 270, show: true, type: 'text', formShow: true },
        { title: '创建时间', prop: 'createTime', width: 180, show: true, type: 'text', formShow: false }
      ],
      formTitle: null,
      showForm: false
    }
  },
  computed: {
    // 表格最大高度
    mixin_tab_max_height() {
      const tabmaxheight = this.windowHeight -
       (this.searchFormShow ? this.search_form_height : 0) -
       (this.$attrs.is_child ? 420 : 300)
      return tabmaxheight
    }
  },
  watch: {},
  created() {
    this.$nextTick(() => {
      this.search_form_height = this.$refs.searchForm.$el.offsetHeight
    })
  },
  methods: {
    rowSty({ row }) {
      console.log(row)
      if (row.orgShortName === '-') {
        return { fontWeight: 'bold', color: '#555555' }
      }
      return { }
    },
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    add() {
      this.showForm = true
      this.currentRow = { id: '' }
      this.formTitle = '添加组织'
    },
    edit() {
      this.showForm = true
      this.formTitle = '修改组织'
    },
    rowClick(row) {
      if (row.orgShortName !== '-') {
        this.currentRow = row
      } else {
        this.currentRow = { id: '' }
        this.$refs.Tab.toggleRowExpansion(row)
      }
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) {
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach((item) => {
        searchForm[item] = searchForm[item] || null
      })

      page(searchForm).then(res => {
        this.currentRow = { id: '' }
        res.data.records = this.groupByProp(res.data.records, 'accountId')
        res.data.records.map(item => {
          item.accountName = this.MenuGetPropName('accounts', item.accountId, { label: 'accountNum', value: 'id' })
          item.orgName = this.MenuGetPropName('accounts', item.accountId, { label: 'orgName', value: 'id' })
          item.orgShortName = '-'
          item.createTime = '-'
        })
        this.tableData = res.data
        this.Mixin_loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>

