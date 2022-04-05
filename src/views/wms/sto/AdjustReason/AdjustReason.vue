<template>
  <div>
    <!-- 操作栏目 -->
    <mix-operate
      style="margin-top:0px"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="false"
      :search-form-show="searchFormShow"
      @search-form-act="searchFormShow=!searchFormShow"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])"   -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      border
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      highlight-current-row
      :max-height="mixin_tab_max_height"
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row;$listeners.currentSelect(row)}"
    >
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
    <!-- <mix-page :form="searchForm" :table-data="tableData" @search="search" /> -->
    <el-dialog
      v-if="form_show"
      title="盘点报告原因维护"
      :visible.sync="form_show"
      append-to-body
      width="500px"
    >
      <el-form ref="formsub" :model="edit_form" label-width="60px">
        <el-form-item label="原因" prop="reason" :rules="[{ required: true, message: '原因必填', trigger: 'blur' }]">
          <el-input v-model="edit_form.reason" />
        </el-form-item>
        <el-form-item label="启用">
          <span>{{ MenuGetPropName('if_type',edit_form.enable) }}</span>
          <el-switch v-model="edit_form.enable" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="edit_form.remark" :rows="3" type="textarea" placeholder="备注最多120字数" :maxlength="120" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" :loading="form_loading" @click="submit">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getInvDiffReasonGroup, deleteOrder, addOrder, updateOrder } from '@/api/wms/AdjustReason'
export default {
  name: 'AdjustReason',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      edit_form: { id: null, reason: '', enable: true, remark: '' },
      currentRow: { id: '' }, // 当前选择数据
      searchList: [],
      transition: true, // 动画开始
      form_loading: false, // 动画开始
      op_prop: 'insert',
      transitionMarginTop: 24, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateTableList: [
        { title: '修改', show: true, prop: 'edit', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['wms:stoAdjustReason:update'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['wms:stoAdjustReason:delete'], width: 80 }

      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', permission: [], disabled: false, type: 'primary', width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['wms:stoAdjustReason:add'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      form_show: false,
      tableData: {
        records: []
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
    })
    this.search()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        getInvDiffReasonGroup({ enable: true }).then(res => { // 字典表强制更新
          if (res.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'adjust_reason': res.data })
          }
        })
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    submit() {
      this.form_loading = true
      if (this.op_prop === 'insert') { // 新增
        this.$refs.formsub.validate((valid) => {
          if (valid) {
            addOrder(this.edit_form).then((res) => {
              this.message(res)
              this.form_loading = false
              this.form_show = false
            })
          } else {
            this.form_loading = false
          }
        })
      } else if (this.op_prop === 'edit') { // 编辑
        this.$refs.formsub.validate((valid) => {
          if (valid) {
            updateOrder(this.edit_form).then((res) => {
              this.message(res)
              this.form_loading = false
              this.form_show = false
            })
          } else {
            this.form_loading = false
          }
        })
      } else {
        this.form_loading = false
        this.form_show = false
      }
    },
    openModel(itemOp) {
      itemOp.loading = true
      this.form_show = true
      this.op_prop = itemOp.prop
      if (itemOp.prop === 'insert') {
        this.edit_form = { id: null, reason: '', enable: true, remark: '' }
      } else if (itemOp.prop === 'edit') {
        this.edit_form = this.currentRow
      }
      itemOp.loading = false
    },
    search() {
      this.Mixin_loading = true
      getInvDiffReasonGroup({ enable: null }).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData.records = res.data
          this.Mixin_loading = false
        }
      })
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除原因「${this.currentRow.reason}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteOrder({ 'id': this.currentRow.id }).then(res => {
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
</style>

