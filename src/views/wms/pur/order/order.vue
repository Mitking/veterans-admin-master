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
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="
        (row,curr) => {
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
        v-for="(item, index) in ArrFilter($attrs['form-data'], { show: true })"
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
          <div v-else-if="item.type === 'PRICE_AUTOMATIC'">
            {{ fen2yuan(row[item.prop]) }}
          </div>
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
    <mix-page
      ref="mixinPage"
      :form="searchForm"
      :table-data="tableData"
      @search="search"
    />
    <!--    一键选日期    -->
    <el-dialog
      title="请选择生成单据日期"
      :visible.sync="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
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
          :loading="generateLoading"
          @click="
            selectData = '';
            $refs.ruleForm.resetFields();
            dialogVisible = false;
            generateLoading = false;
          "
        >取 消</el-button>
        <el-button
          :loading="generateLoading"
          type="primary"
          @click="generateFunction({ prop: subType })"
        >确 定</el-button>
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
import User from '@/views/ums/admin/userSelectPage'
import MixinGlobal from '@/components/MixinGlobal'
import {
  getPage,
  deleteOrders,
  review,
  generateCheckweigherOrder,
  generateReceiveOrder,
  inspectionSave,
  orderNo,
  generateInspectionOrder
} from '@/api/wms/purorder'
// import { generate } from '@/api/wms/purtask'
export default {
  name: 'Order',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      pickerOptions: {
        disabledDate(item) {
          return item.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      generateLoading: false,
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
        { title: '采购单号', prop: 'purOrderNo', type: 'text', width: '300px' },
        { title: '采购日期', prop: 'purDate', type: 'date', width: '300px' },
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        // {
        //   title: '采购员',
        //   prop: 'purPersonId',
        //   reallyProp: 'creator',
        //   type: 'selectFromPage',
        //   selectForm: 'User',
        //   width: '300px'
        // },
        {
          title: '审核状态',
          prop: 'auditStatu',
          type: 'select',
          defaultValue: 0,
          selectData: 'audit_status',
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
        {
          title: '生成验秤单',
          prop: 'generateCheck',
          type: 'checkbox',
          width: '150px'
        },
        {
          title: '生成抽检单',
          prop: 'generateInspecation',
          type: 'checkbox',
          width: '150px'
        },
        {
          title: '生成收货单',
          prop: 'generateReceive',
          type: 'checkbox',
          width: '150px'
        }
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
        permission: ['wms:pur:order:getList'],
        width: 80
      },
      {
        title: '修改',
        show: true,
        prop: 'edit',
        click: this.$listeners.openModel,
        loading: false,
        icon: 'el-icon-edit-outline',
        disabled: 'isRowNoRevEd',
        type: 'primary',
        permission: ['wms:pur:order:save'],
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
          permission: ['wms:pur:order:getList'],
          width: 80
        },
        {
          title: '新增',
          show: true,
          prop: 'insert',
          click: this.$listeners.openModel,
          loading: false,
          icon: 'el-icon-plus',
          disabled: false,
          type: 'primary',
          permission: ['wms:pur:order:save'],
          width: 80
        },
        // {
        //   title: '删除',
        //   show: true,
        //   prop: 'delete',
        //   click: this.del,
        //   loading: false,
        //   icon: 'el-icon-minus',
        //   disabled: 'isRowNoRevEd',
        //   disabledFn: this.isAutoGenerate,
        //   type: 'primary',
        //   permission: ['wms:pur:order:delete'],
        //   width: 80
        // },
        {
          title: '删除',
          show: true,
          prop: 'delete',
          click: this.dels,
          loading: false,
          icon: 'el-icon-minus',
          disabled: 'idsNoRevEd',
          disabledFn: this.isSomeAutoGenerate,
          type: 'primary',
          permission: ['wms:pur:order:delete'],
          width: 80
        },
        {
          title: '审核',
          show: true,
          prop: 'reviews',
          click: this.reviews,
          loading: false,
          icon: 'el-icon-s-check',
          disabled: 'idsNoRevEd',
          type: 'primary',
          permission: ['wms:pur:order:reviewer'],
          width: 80
        },
        {
          title: '生成验秤单',
          show: true,
          prop: 'generateCheck',
          click: this.generateFunction,
          loading: false,
          icon: 'el-icon-edit-outline',
          disabled: 'idsNoWillRev',
          disabledFn: this.isExistGenerateCheck,
          type: 'primary',
          permission: ['wms:pur:checkweigher:order:generateCheckweigherOrder'],
          width: 80
        },
        {
          title: '生成抽检单',
          show: true,
          prop: 'generateInspecation',
          click: this.generateFunction,
          loading: false,
          icon: 'el-icon-edit-outline',
          disabled: 'idsNoWillRev',
          disabledFn: this.isExistGenerateInspecation,
          type: 'primary',
          permission: ['wms:pur:inspection:order:generateInspectionOrder'],
          width: 80
        }
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [], // 详细数据
      selectList: [],
      purOrderNos: [],
      subType: ''
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
      if (item.type === 'range') {
        item.range.map((itemRange) => {
          this.$set(
            this.searchForm,
            itemRange.prop,
            itemRange.defaultValue === 0 ? 0 : ''
          )
        })
      } else {
        this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
      }
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
      // this.currentRow = { id: '' }
      // this.$listeners.currentSelect({ id: '' })
      // }
      const temp = []
      this.mixin_rows = rows
      rows.map((item) => {
        item.orderDetails.map((itemz) => {
          itemz.purPersonId = item.purPersonId
          itemz.purNum = itemz.number
          // 初始化空数据
          itemz.number = itemz.number || 0
          itemz.addNum = itemz.addNum || 0
          itemz.addPiecesNum = itemz.addPiecesNum || 0
          itemz.addWeight = itemz.addWeight || 0
          itemz.giveNum = itemz.giveNum || 0
          itemz.givePiecesNum = itemz.givePiecesNum || 0
          itemz.giveWeight = itemz.giveWeight || 0
        })
        temp.push(...item.orderDetails)
      })
      this.selectList = temp

      this.ids = rows.map((item) => item.id)
      this.purOrderNos = rows.map((item) => item.purOrderNo)
    },
    isAutoGenerate() {
      // 上一个单情况
      return this.currentRow.autoGenerate
    },
    isSomeAutoGenerate() {
      // 存在上一个单的情况
      return this.mixin_rows.some((item) => item.autoGenerate)
    },
    isExistGenerateReceive() {
      // 存在已经生成收货单的情况
      return this.mixin_rows.some((item) => item.generateReceive)
      // return false
    },
    isExistGenerateCheck() {
      // 存在已经生成收货单的情况
      return this.mixin_rows.some((item) => item.generateCheck)
    },
    isExistGenerateInspecation() {
      // 存在已经生成收货单的情况
      // return this.currentRow.generateInspecation
      return this.mixin_rows.some((item) => item.generateInspecation)
    },
    isExistGenerateLoadCar() {
      // 存在已经生成收货单的情况
      return this.mixin_rows.some((item) => item.generateLoadCar)
    },

    message(res) {
      if (res.code === 200) {
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
      searchForm.purPersonId = [0, 3, 2].includes(this.$store.getters.accountType) ? null : this.$store.getters.operatorId

      this.Mixin_loading = true
      getPage(searchForm).then((res) => {
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
      this.$confirm(
        `此操作将永久删除${this.mix_comp_find_order_title_name(
          'purOrderNo',
          this.$attrs['form-data']
        )}「${this.currentRow.purOrderNo}」, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          // this.operateItem.loading = true
          deleteOrders({ ids: [this.currentRow.id] })
            .then((res) => {
              this.message(res)
              operateItem.loading = false
            })
            .catch((err) => {
              operateItem.loading = false
              throw err
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          operateItem.loading = false
        })
    },
    dels(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteOrders({ ids: this.ids })
            .then((res) => {
              this.message(res)
              operateItem.loading = false
            })
            .catch((err) => {
              operateItem.loading = false
              throw err
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          operateItem.loading = false
        })
    },
    reviews(e, isSure = false) {
      e.loading = true
      // 批量审核
      let order = {}
      const unCheckArr = this.mixin_rows.some((itemF) => {
        if (
          itemF.orderDetails.filter(
            (item) => !item.supplierId || !item.amount || !item.purNumWeight
          ).length > 0
        ) {
          order = itemF
          return true
        }
        return false
      })
      if (unCheckArr) {
        // const names = unCheckArr.map(item => item.purCheckOrderNo)
        this.$message.error(
          `单号：${order.purOrderNo}中存在未采购品，请处理后重试`
        )
        e.loading = false
        return
      }
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.reviews(e, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          e.loading = false
        })
        return
      }
      review({ ids: this.ids, auditStatus: '3' }).then((res) => {
        this.message(res)
      }).finally(() => {
        e.loading = false
      })
    },
    generateFunction1(e1 = null, e2 = null, isSure = false) {
      if (!isSure) {
        this.$confirm(`确认${e1.title}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.generateFunction1(e1, e2, true)
        }).catch(() => {
          this.$message.info('已取消')
        })
        return
      }
      // 生成收货单
      generateReceiveOrder({ purOrderNos: this.purOrderNos })
        .then((res) => {
          this.message(res)
        })
        .catch((err) => {
          this.$message.error(err.message || '网络错误')
          throw err
        })
    },
    generateFunction(e = null, e2 = null, isSure = false) {
      if (!isSure) {
        this.$confirm(`确认${e.title}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.generateFunction(e, e2, true)
        }).catch(() => {
          this.$message.info('已取消')
        })
        return
      }
      this.subType = e.prop
      e.loading = true
      switch (this.subType) {
        case 'generateCheck': // 生成验秤单
          generateCheckweigherOrder({
            // checkWeighbeamPersionId: this.$store.state.user.id,
            // checkWeighbeamDate: this.ruleForm.selectData,
            purOrderNos: this.purOrderNos
          })
            .then((res) => {
              this.message(res)
              this.ruleForm.selectData = ''
              // this.$refs.ruleForm.resetFields()
              this.dialogVisible = false
            })
            .catch((err) => {
              // this.$message.error('网络错误')
              this.ruleForm.selectData = ''
              // this.$refs.ruleForm.resetFields()
              throw err
            })
            .finally(() => {
              e.loading = false
            })
          break
        case 'generateInspecation': // 抽检单
          generateInspectionOrder({
            'purOrderNos': this.purOrderNos
          })
            .then((res) => {
              this.message(res)
              this.ruleForm.selectData = ''
              // this.$refs.ruleForm.resetFields()
              this.dialogVisible = false
            })
            .catch((err) => {
              // this.$message.error('功能修改')
              this.ruleForm.selectData = ''
              // this.$refs.ruleForm.resetFields()
              throw err
            })
            .finally(() => {
              e.loading = false
            })
          break
        case 'generateLoadCar': // 装车单 已注释
          {
            const temp_obj = { details: [] }
            orderNo({ type: 'CGCJ' }).then((res) => {
              if (res.code === 200) {
                temp_obj.purInspectionNo = res.data
                temp_obj.purOrderNo = this.currentRow.purOrderNo
                temp_obj.inspectionDate = this.ruleForm.selectData
                temp_obj.autoGenerate = 1
                temp_obj.remark = ''
                temp_obj.details = this.currentRow.orderDetails.map(
                  (item) => ({
                    purInspectionNo: res.data,
                    inspectionPersonId: '',
                    supplierId: item.supplierId,
                    productId: item.productId,
                    purUnit: item.purUnit,
                    purPiecesNum: item.purPiecesNum,
                    inspectionPiecesNum: Math.ceil(
                      Number(item.purPiecesNum) * 0.2
                    ),
                    sweetness: '',
                    flavor: '',
                    quality: '',
                    remark: ''
                  })
                )
                inspectionSave(temp_obj)
                  .then((res) => {
                    this.message(res)
                    this.ruleForm.selectData = ''
                    // this.$refs.ruleForm.resetFields()
                    this.dialogVisible = false
                  })
                  .catch((err) => {
                    this.$message.error('功能修改')
                    this.ruleForm.selectData = ''
                    // this.$refs.ruleForm.resetFields()
                    throw err
                  })
                  .finally(() => {
                    this.generateLoading = false
                  })
              }
            })
          }
          break
      }
      // }
      // })
      // }
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
