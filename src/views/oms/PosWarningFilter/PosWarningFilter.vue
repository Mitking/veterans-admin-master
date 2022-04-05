<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      class="transition-box"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px',display:'inline-block'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="false"
      :ids="ids"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <div style="display:inline-block;color:#999;position:relative;bottom:-12px">
      <span>当前预警值：{{ warningSetting.warningValue }} </span>
      <el-button v-permission="['oms:posWarning:setting']" type="text" @click="setValueShow=true">设置</el-button>
    </div>
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      :max-height="mixin_tab_max_height"
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:($attrs.is_child?0:55)+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {
        if ($attrs.is_child) { // 单选客户
          currentRow = row
          $listeners.selectList([row])
        }else{
          $refs.Tab.toggleRowSelection(row)
        }
      }"
      @row-dblclick="()=>{
        if($attrs.is_child){
          $listeners.selectList([currentRow])
          $listeners.addlist()
        }}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        v-if="!$attrs.is_child"
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
      title="预警值设置"
      :visible.sync="setValueShow"
      width="300px"
    >
      <el-form ref="form" :model="warningSetting" label-width="80px">
        <el-form-item
          label="预警值"
          prop="warningValue"
          :rules="[{ required: true, message: '不能为空'},
                   { type: 'number', message: '必须为数字值'}]"
        >
          <el-input v-model.number="warningSetting.warningValue" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="setValue">设置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPosWarningFilterPage, posWarningFilterDelete, posWarningSetting } from '@/api/oms/PosWarningFilter'
export default {
  name: 'Order',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' }, // 当前选择数据
      setValueShow: false,
      searchList: [ // 搜索栏项目
        { title: '门店名', prop: 'storeName', type: 'text', width: '300px' }
      ],
      ids: [],
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateTableList: [
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['oms:posWarning:filter:update'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: !this.$attrs.is_child, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:posWarning:filter:getPage'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['oms:posWarning:filter:add'], width: 80 },
        { title: '删除', show: !this.$attrs.is_child, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-delete', disabled: 'ids', type: 'primary', permission: ['oms:posWarning:filter:delete'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      },
      warningSetting: {
        warningValue: 0
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
    if (this.$attrs.is_child) {
      console.log(this.$attrs.child_search_data)
      this.searchForm = Object.assign(this.searchForm, this.$attrs.child_search_data)
    }
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
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
    search() {
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getPosWarningFilterPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        this.tableData = res.data.pageRes
        this.warningSetting = res.data.warningSetting
        this.Mixin_loading = false
      })
    },
    dels(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        posWarningFilterDelete({ 'ids': this.ids }).then(res => {
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
    setValue() {
      this.$refs.form.validate((valid) => {
        console.log(valid)
        if (valid) {
          posWarningSetting({ 'id': this.warningSetting.id, 'warningValue': this.warningSetting.warningValue }).then(() => {
            this.$message.success({ message: '设置成功', offset: 65 })
            this.setValueShow = false
          })
        }
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

