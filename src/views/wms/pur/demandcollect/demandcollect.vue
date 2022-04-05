<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event] = ''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{
        'margin-top': searchFormShow?'0px':'24px',
        transition: transition ? null : 'all .3s ease',
      }"
      :operate-list="operateList"
      :ids="ids"
      :rows="mixin_rows"
      :current-row="currentRow"
      :back="true"
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
      style="margin: 0 24px;max-width:99%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tableHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      :data="tableData.records"
      @row-click="
        (row) => {
          $refs.Tab.toggleRowSelection(row)
        }
      "
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
        v-for="(item, index) in ArrFilter($attrs['form-data'], { show: true,tableHidden:undefined })"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{ row }">
          <div v-if="item.type === 'if_type' || item.type === 'if_enable'" :style="{color:row[item.prop]?'':'#999999'}">
            {{ MenuGetPropName(item.type, row[item.prop]) }}
          </div>
          <div
            v-else-if="item.type === 'select' || item.type === 'selectState'"
          >
            {{
              MenuGetPropName(
                item.selectData,
                row[item.prop],
                item.selectOption ? item.selectOption : { value: "", label: "" }
              )
            }}
          </div>
          <!--          v-else-->
          <div v-else-if="item.type === 'PRICE_AUTOMATIC'">
            {{ fen2yuan(row[item.prop]) }}
          </div>
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
    <mix-page
      ref="mixinPage"
      :form="searchForm"
      :table-data="tableData"
      @search="search"
    />
    <!--    一键选日期    -->
    <el-dialog
      title="请选择采购任务日期"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules">
        <el-form-item prop="selectData">
          <el-date-picker
            v-model="ruleForm.selectData"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            :picker-options="pickerOptions"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="
            selectData = '';
            $refs.ruleForm.resetFields();
            dialogVisible = false;
          "
        >取 消</el-button>
        <el-button type="primary" @click="generateFunction">确 定</el-button>
      </span>
    </el-dialog>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="
        (mixin_dialog_item.selectForm === 'SupplierIndex' && '供应商') ||
          (mixin_dialog_item.selectForm === 'ProductIndex' && '商品列表') ||
          (mixin_dialog_item.selectForm==='User' && '员工选择')
      "
      :visible.sync="mixin_select_form_show"
      width="600px"
    >
      <div style="width: 100%; padding-right: 15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show = false"
        />
      </div>
      <div slot="footer" style="marginTop:-20px">
        <el-button type="primary" @click="mixin_select_form_show = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage } from '@/api/wms/purdemand'
import { generate } from '@/api/wms/purtask'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'Order',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      pickerOptions: {
        disabledDate(item) {
          return item.getTime() < (Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      ruleForm: {
        selectData: ''
      },
      dialogVisible: false,
      rules: {
        selectData: [
          { required: true, message: '请输入日期', trigger: 'blur' }
        ]
      },
      searchList: [
        // 搜索栏项目
        {
          title: '需求单号',
          prop: 'demandOrderNo',
          type: 'text',
          width: '300px'
        },
        { title: '组织',
          prop: 'orgId',
          type: 'select',
          defaultValue: 0,
          selectData: 'organizes',
          selectOption: { label: 'orgShortName', value: 'id' },
          width: '300px'
        },
        { title: '需求门店',
          prop: 'storeId',
          type: 'select',
          defaultValue: 0,
          selectData: 'stores',
          selectOption: { label: 'name', value: 'id' },
          fatherProp: 'orgId',
          width: '300px'
        },
        {
          title: '制单人',
          prop: 'creatorName',
          reallyProp: 'creator',
          type: 'selectFromPage',
          selectForm: 'User',
          width: '300px'
        },
        {
          title: '审核人',
          prop: 'reviewer',
          reallyProp: 'reviewerId',
          type: 'selectFromPage',
          selectForm: 'User',
          width: '300px'
        },
        { title: '需求日期', prop: 'demandDate', type: 'date', width: '300px' }
        // { title: '汇总列表', prop: 'collectFlag', type: 'checkbox', width: '300px' }
      ],
      operateTableList: [{
        title: '详情',
        show: true,
        prop: 'detail',
        click: this.$listeners.openModel,
        loading: false,
        icon: 'el-icon-document',
        disabled: 'isRow',
        type: 'primary',
        permission: ['wms:pur:demand:order:getList'],
        width: 80
      }],
      operateList: [
        // 操作栏项目
        {
          title: '查询',
          show: true,
          prop: 'search',
          click: this.search,
          icon: 'el-icon-search',
          disabled: false,
          type: 'primary',
          permission: ['wms:pur:demand:order:getList'],
          width: 80
        },
        {
          title: '生成任务单',
          show: true,
          prop: 'pricePull',
          click: this.generateFunction,
          loading: false,
          icon: 'el-icon-edit-outline',
          disabled: 'idsNoWillRev',
          disabledFn: this.isExistGenerateTask,
          type: 'primary',
          permission: ['wms:pur:task:generate'],
          width: 80
        }
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        auditStatu: '3',
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [], // 详细数据
      demandOrderNoList: []
    }
  },
  computed: {
    idsLength() {
      return true
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map((item) => {
      this.$set(
        this.searchForm,
        item.prop,
        this.searchForm[item.prop] ||
          (item.defaultValue !== undefined ? item.defaultValue : '')
      ) // searchForm有值，优先用值
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
      this.mixin_rows = rows
      this.demandOrderNoList = rows.map(item => item.demandOrderNo)
      this.ids = rows.map((item) => item.id)
    },
    isExistGenerateTask() {
      // 存在已经生成任务单的情况
      return this.mixin_rows.some((item) => item.generateTask)
      // return false
    },
    message(res) {
      if (res.code === 200) {
        this.dialogVisible = false
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) {
      // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach((item) => {
        searchForm[item] = searchForm[item] || null
      })
      searchForm.generateTask = false

      this.Mixin_loading = true
      getPage(searchForm).then((res) => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            if (res.code === 200) {
              this.tableData = res.data
              this.Mixin_loading = false
            }
          }
        }
      })
    },
    generateFunction(e1 = null, e2 = null, isSure = false) {
      if (!isSure) {
        this.$confirm(`确认${e1.title}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.generateFunction(e1, e2, true)
        }).catch(() => {
          this.$message.info('已取消')
        })
        return
      }
      generate({
        // taskDate: this.ruleForm.selectData,
        demandOrderNoList: this.demandOrderNoList
      }).then((res) => {
        this.message(res)
        this.ruleForm.selectData = ''
        // this.$refs.ruleForm.resetFields()
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow
        ? 0
        : 0 - this.otherOffsetHeight
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
.transition {
  /*position: absolute;*/
  transition: all 0.3s ease;
  margin-top: 0;
  top: 0;
}
</style>
