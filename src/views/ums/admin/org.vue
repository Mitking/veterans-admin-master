<template>
  <div>
    <h1>不在维护</h1>
    <!--搜索栏目-->
    <mix-search
      :form="searchForm"
      :formlist="searchList"
      :form-data="[]"
      @search="search"
    />

    <!-- 操作栏目 -->
    <mix-operate :ids="ids" :operate-list="operateList" :current-row="currentRow" />

    <!--    表格    -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      highlight-current-row
      max-height="580"
      :data="tableData.records"
    >
      <el-table-column label="账套ID" prop="accountId" width="80" align="center" />
      <el-table-column label="全称" prop="orgName" align="center" />
      <el-table-column label="简称" prop="orgShortName" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" />
    </el-table>
    <!--分页-->
    <mix-page :form="searchForm" :table-data="tableData" @search="search" />
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { pageDefaultOrgList, saveOrUpdate } from '@/api/ums/org'
export default {
  name: 'Org',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      ids: [],
      searchList: [
        { title: '组织简称', prop: 'orgShortName', type: 'text' },
        {
          title: '账套',
          prop: 'accountId',
          type: 'select',
          selectData: 'accounts',
          width: '400px',
          sonprop: 'orgId'
        }
      ],
      currentRow: { id: '' }, // 当前选择数据
      operateList: [
        // 搜索栏项目
        {
          title: '查询组织列表',
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
          show: !this.$attrs.child,
          click: this.save,
          icon: 'el-icon-plus',
          disabled: false,
          type: 'primary',
          permission: ['ums:org:saveOrUpdate'],
          width: 80
        },
        {
          title: '修改组织',
          show: !this.$attrs.child,
          click: this.save,
          icon: 'el-icon-edit-outline',
          disabled: 'isRow',
          type: '',
          permission: ['ums:org:saveOrUpdate'],
          width: 80
        }
      ],
      searchForm: {
        accountId: '',
        orgShortName: '',
        pageNum: 1,
        pageSize: 10
      },
      formShow: false,
      formType: '',
      tableData: {
        records: []
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.search()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    save(operateItem = {}) {
      // 添加、修改角色

      this.formType = operateItem.title === '添加组织' ? 'insert' : 'edit'
      this.formShow = true
    },
    formSave(e) {
      const temp = this.deepClone(e)
      temp.id = e.id ? e.id : null
      saveOrUpdate(temp).then(res => {
        res.data =
          res.code === 200 && this.formType === 'edit' ? '修改成功' : res.data
        this.message(res)
        this.formShow = false
        this.formLoading = false
      })
    },
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => {
        searchForm[item] = searchForm[item] || null
      })
      this.Mixin_loading = true
      pageDefaultOrgList(searchForm).then(res => {
        this.currentRow = { id: '' }
        this.tableData = res.data
        this.Mixin_loading = false
      })
    }
  }
}
</script>

<style scoped></style>
