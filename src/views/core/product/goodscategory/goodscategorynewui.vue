<template>
  <div>
    <mix-search v-show="searchFormShow" ref="searchForm" class="transition-box" :cascaderbycode="true" :form="searchForm" :formlist="searchList" v-bind="$attrs" @search="search" />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          tab_max_height = windowH - $refs.searchForm.$el.offsetHeight - 250
        })"
    />
    <!--  :height="mixin_"  表格 @row-dblclick="openModel(operateItem=operateList[1])"  :expand-row-keys="[currentRow.id?currentRow.code:'']"  -->
    <pl-table
      ref="Tab"
      v-loading="Mixin_loading"
      class="myclass"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*50 || 0)})}"
      :height="tab_max_height"
      highlight-current-row
      row-key="code"
      :use-virtual="true"
      :header-cell-style="{background:'#F3F4F7',color:'#555',textAlign:'center'}"
      :data="tableData.records"
      :row-height="36"
      @row-click="(row)=>{currentRow = row;$listeners.currentSelect(row)}"
    >
      <!--   v-if="item.show" 表头  -->
      <pl-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true})"
        :key="index"
        :tree-node="item.prop==='code'"
        :prop="item.prop"
        :width="item.width || 220"
        :align="index===0?'left':'center'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </pl-table-column>
      <!-- 操作单条 :fixed="!!tableData.records.length?'right':false"-->
      <pl-table-column
        v-if="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*50 || 0"
        align="center"
        label="操作"
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
      </pl-table-column>
    </pl-table>
  </div>
</template>

<script>
import { PlTable, PlTableColumn } from 'pl-table'
import MixinGlobal from '@/components/MixinGlobal'
import { getCategoryList, addCategory, updateCategory, deleteCategoryById, getCategoryTree } from '@/api/core/goodscategory'
export default {
  name: 'Order',
  components: { PlTable, PlTableColumn },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      tab_max_height: 500,
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: '上级分类', prop: 'parentCode', type: 'goodsCategory', width: '300px', valueProp: 'code' },
        { title: '名称', prop: 'name', type: 'text', width: '300px' },
        { title: '只看启用', prop: 'enable', defaultValue: true, type: 'checkbox', width: '300px' }
      ],
      searchShow: false, // 搜索栏弹窗

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {},
      operateTableList: [
        { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:productCategory:update'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['core:productCategory:delete'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:productCategory:getList'], width: 80 },
        // { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:productCategory:add'], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:productCategory:add'], width: 80 }
        // { title: '追加', prop: 'withinAdd', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['core:productCategory:getList'], width: 80 },
      ],
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: []
      }
    }
  },
  computed: {},
  watch: {
    'currentRow.id': {
      handler(n) {
        this.operateList[1].prop = n ? 'withinAdd' : 'insert'
      },
      immediate: true
    }
  },
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    getCategoryTree().then(res => {
      this.searchList[0].goodsOptions = res.data
    })
    this.searchList.map(item => {
      if (item.type === 'range') {
        item.range.map(itemRange => {
          this.$set(this.searchForm, itemRange.prop, itemRange.defaultValue === 0 ? 0 : '')
        })
      } else {
        this.$set(this.searchForm, item.prop, typeof (item.defaultValue) === 'undefined' ? '' : item.defaultValue)
      }
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
      this.tab_max_height = this.windowH - this.$refs.searchForm.$el.offsetHeight - 250
    })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        getCategoryList().then(res => { // 字典表强制更新
          if (res.code === 200) {
            res.data.push({ 'id': 0, 'code': '0', 'name': '起始类', 'haveChild': false })
            this.$store.dispatch('enum/add_enum', { 'categorylist': res.data })
          }
        })
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(e = { prop: '' }) {
      console.log(this.tab_max_height)
      if (e.prop === 'search') {
        this.currentRow = { id: '' }
      }
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      searchForm.parentCode = null
      this.Mixin_loading = true
      getCategoryList(searchForm).then(res => {
        // this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data && res.data.length > 0) {
          // 回调地狱处理分级
            this.tableData.records = this.callbackFn(res.data)
            // this.tableData.records = res.data
            // this.tableData.records = res.data.filter(F => F.parentCode === (this.searchForm.parentCode || '0'))
            if (this.currentRow.id) {
              this.$refs.Tab.setCurrentRow(this.currentRow)
            } else {
              this.$refs.Tab.setCurrentRow()
            }
          } else {
            this.tableData.records = []
          }
          this.Mixin_loading = false
        }
      })
    },
    callbackFn(data) {
      const temp = data.filter(F => F.parentCode === (this.searchForm.parentCode || '0'))
      temp.map(item => this.callbackDeal(item, data))

      return temp
    },
    callbackDeal(item, data) {
      if (item.haveChild) {
        return Object.assign(item, { children: data.filter(F => F.parentCode === item.code).map(itemZ => this.callbackDeal(itemZ, data)) })
      }
      return Object.assign(item, { children: [] })
    },
    formSave(e) { // 提交回调处理
      Object.keys(e).map(item => { e[item] = e[item] === '' ? null : e[item] })

      // if ((typeof e.parentCode === 'object') && (e.parentCode.length > 0)) { // 处理商品分类
      //   e.parentCode = e.parentCode[e.parentCode.length - 1]
      // } else if (e.parentCode.length === 0) {
      //   e.parentCode = '0'
      // }
      switch (this.operateItem.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
        case 'insert': // 新增
          addCategory(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
        case 'edit': // 修改

          updateCategory(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
      }
    },

    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除分类「${this.currentRow.name}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteCategoryById({ 'codes': [this.currentRow.code] }).then(res => {
          operateItem.loading = false
          this.currentRow = { id: '' }
          this.message(res)
        }).catch(() => {
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
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = 0 - this.otherOffsetHeight
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
.myclass >>> .el-table td{
 padding-left: 0;
}
</style>

