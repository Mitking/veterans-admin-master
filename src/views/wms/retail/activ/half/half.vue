<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->

    <el-form v-show="searchFormShow" ref="searchForm" class="form-fa" inline>
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item class="item-fa" label="商品档案">
        <el-input v-model="searchForm.goodsCode" placeholder="" clearable />
      </el-form-item>
      <el-form-item class="item-fa" label="开始日期">
        <el-date-picker
          v-model="searchForm.beginDate"
          style="width:202px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item class="item-fa" label="结束日期">
        <el-date-picker
          v-model="searchForm.endDate"
          style="width:202px"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item class="item-fa" label="日期类型">
        <el-select v-model="searchForm.dateType" style="width:175px">
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'date_type'})"
            :key="indexSon+100"
            :label="itemSon.name"
            :value="itemSon.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="item-fa" label="制单人">
        <el-input
          ref="creatorNameInput"
          v-model="searchForm.creatorName"
          style="width:150px"
          :readonly="true"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='User';search_dialog_item.searchFormProp='creator';search_dialog_item.show=true"
          @clear="searchForm.creator='';searchForm.creatorName=''"
        />
      </el-form-item>
      <el-form-item class="item-fa" label="审核人">
        <el-input
          ref="reviewerNameInput"
          v-model="searchForm.reviewerName"
          style="width:150px"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='User';search_dialog_item.searchFormProp='reviewer';search_dialog_item.show=true"
          @clear="searchForm.reviewerId='';searchForm.reviewerName=''"
        />
      </el-form-item>
      <el-form-item class="item-fa" label="审核状态">
        <el-select v-model="searchForm.auditStatus" style="width:175px">
          <el-option
            :key="0"
            label="全部"
            :value="0"
          />
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'audit_status'})"
            :key="indexSon+100"
            :label="itemSon.name"
            :value="itemSon.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 操作栏目 -->
    <el-form inline size="mini" style="margin: 0 24px" :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}">
      <el-form-item
        v-permission="['oms:activSingle:getList']"
      >
        <el-button icon="el-icon-search" type="primary" @click="search(1)">查询</el-button>
      </el-form-item>
      <el-form-item
        v-permission="['oms:activSingle:add']"
      >
        <el-button icon="el-icon-plus" type="primary" :loading="$attrs.insertloading" @click="$listeners.openModel({prop:'insert',title:'新增'})">新增</el-button>
      </el-form-item>
      <el-form-item
        v-permission="['oms:activSingle:update:invalid']"
      >
        <el-button icon="el-icon-circle-close" type="primary" :disabled="ids.length===0 || selectRows.some(item=>item.invalid || item.auditStatus!=='3')" :loading="$attrs.reviewloading" @click="invalidFn">作废</el-button>
      </el-form-item>
      <el-form-item
        v-permission="['oms:activSingle:delete']"
      >
        <el-button icon="el-icon-minus" type="primary" :disabled="ids.length===0 || selectRows.some(item=>item.auditStatus!=='1')" :loading="delloading" @click="dels">删除</el-button>
      </el-form-item>
      <el-form-item
        v-permission="['oms:activSingle:update:review']"
      >
        <el-button icon="el-icon-s-check" type="primary" :disabled="ids.length===0 || selectRows.some(item=>item.auditStatus!=='1')" :loading="reviewloading" @click="reviews">审核</el-button>
      </el-form-item>
      <el-form-item>
        <el-tag
          style="cursor:pointer"
          type="success"
          @click="
            searchFormShow = !searchFormShow
            $nextTick(() => {
              $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
            })
          "
        >
          {{ searchFormShow? "收起" : "展开" }}
        </el-tag>
      </el-form-item>
    </el-form>
    <el-table
      ref="Tab"
      v-loading="tab_loading"
      style="margin:0 24px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
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
      <el-table-column align="center" prop="halfNo" :width="300" label="单据号" />
      <el-table-column align="center" prop="storeId" :width="200" label="门店">
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores',row.storeId,{value:'id',lebal:'name'}) }}
          <!-- <el-tooltip
            effect="dark"
            :content="row.storeIds.map(itemZ=>MenuGetPropName('stores',itemZ,{ value: 'id', label: 'name' })).toString()"
            placement="top-start"
          >
            <div>
              {{ row.storeIds.map(itemZ=>MenuGetPropName('stores',itemZ,{ value: 'id', label: 'name' })).toString() | sizeFilter(10) }}
            </div>
          </el-tooltip> -->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="beginDate" :width="160" label="开始日期" />
      <el-table-column align="center" prop="endDate" :width="160" label="结束日期" />

      <el-table-column align="center" prop="fullAmount" :width="160" label="满额">
        <template slot-scope="{row}">
          {{ fen2yuan(row.fullAmount) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="reduceAmount" :width="160" label="减额">
        <template slot-scope="{row}">
          {{ fen2yuan(row.reduceAmount) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="auditStatus" :width="100" label="审核状态">
        <template slot-scope="{row}">
          {{ MenuGetPropName('audit_status',row.auditStatus) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="reduceType" :width="100" label="满减类型">
        <template slot-scope="{row}">
          {{ MenuGetPropName('reduce_type',row.reduceType) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="orderState" :width="100" label="订单状态">
        <template slot-scope="{row}">
          {{ MenuGetPropName('order_state',row.orderState) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="memberLevel" :width="100" label="订单状态">
        <template slot-scope="{row}">
          {{ MenuGetPropName('member_type',row.memberLevel) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="creatorName" :width="150" label="制单人" />
      <el-table-column align="center" prop="createTime" :width="160" label="制单时间" />
      <el-table-column align="center" prop="reviewer" :width="150" label="审核人" />
      <el-table-column align="center" prop="reviewerTime" :width="160" label="审核时间" />
      <el-table-column align="center" prop="remark" :width="200" label="备注" />
      <!-- 操作单条 -->
      <el-table-column
        v-if="TableOprateLength"
        width="80"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            effect="light"
            content="详情"
            placement="top"
          >
            <el-button
              v-permission="['oms:activSingleDetails:getDetails']"
              class="my-op-class"
              type="text"
              size="mini"
              :disabled="!row.id"
              :loading="$attrs.detailloading"
              icon="el-icon-document"
              @click="currentRow=row;
                      $listeners.currentSelect(currentRow);
                      $listeners.openModel({prop:'detail',title:'详情'})"
            />
          </el-tooltip>
          <el-tooltip
            effect="light"
            content="修改"
            placement="top"
          >
            <el-button
              v-permission="['oms:activSingle:update']"
              class="my-op-class"
              type="text"
              size="mini"
              :disabled="!row.id || row.auditStatus!=='1'"
              :loading="$attrs.editloading"
              icon="el-icon-edit-outline"
              @click="currentRow=row;
                      $listeners.currentSelect(currentRow);
                      $listeners.openModel({prop:'edit',title:'修改'})"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <local-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />

    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="search_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        search_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        search_dialog_item.selectForm==='User' && '员工选择' || ''"
      :visible.sync="search_dialog_item.show"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="search_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="SearchDialogSelect"
          @addlist="search_dialog_item.show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ProductIndex from '@/views/core/product/product/index.vue'
import User from '@/views/ums/admin/userSelectPage.vue'
import { getPage, deleteOrders, review, OrderInvalid } from '@/api/wms/activ/reduceorder'
import LocalPage from './components/LocalPage'
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore'

export default {
  name: 'Order',
  components: { ProductIndex, LocalPage, SelectOrgStore, User },
  data() {
    return {
      searchFormShow: true,
      TableOprateLength: 0,
      reviewloading: false,
      delloading: false,
      tab_loading: false,
      insertLoading: false,
      ruleForm: {
        selectData: ''
      },
      dialogVisible: false,
      ids: [],
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        'goodsCode': '',
        'orgId': this.$store.getters.accountType === 3 ? 0 : this.$store.getters.orgId,
        'storeId': this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0,
        'beginDate': '',
        'endDate': '',
        'dateType': '1',
        'creator': 0,
        'auditStatus': '',
        'reviewerId': 0,
        'creatorName': '',
        'reviewerName': '',
        'pageNum': 1,
        'pageSize': 10
      },
      tableData: {
        records: [],
        total: 0
      },
      selectRows: [],
      details: [] // 详细数据
    }
  },
  computed: {
    mixin_tab_max_height() {
      const tabmaxheight = this.windowH - (this.searchFormShow ? this.$attrs.search_form_height : 0) - 300
      return tabmaxheight
    }
  },
  watch: {
    search_dialog_item: {
      deep: true,
      handler(newV, oldV) {
        console.log('watch中：', newV)
        if (newV.show) {
          this.$refs.creatorNameInput.blur()
          this.$refs.reviewerNameInput.blur()
        }
      }
    }
  },
  created() {
    console.log('重新加载')
    this.TableOprateLength = this.oprate_length(['oms:activSingleDetails:getDetails', 'oms:activSingle:update'])

    this.search(1)
  },
  methods: {
    oprate_length(arg) {
      return this.$store.getters.roles.filter(item => arg.includes(item)).length
    },
    disabledFn() {
      return this.currentRow.invalidFlag
    },
    SearchDialogSelect(e) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'ProductIndex':
          this.searchForm.goodsCode = e[0].goodsCode
          this.searchForm.goodsName = e[0].goodsName
          break
        case 'reviewer':
          this.searchForm.reviewerId = e[0].id
          this.searchForm.reviewerName = e[0].surname
          break
        case 'creator':
          this.searchForm.creator = e[0].id
          this.searchForm.creatorName = e[0].surname
          break
      }

      // this.searchForm
    },
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
      this.selectRows = rows
    },
    message(res) {
      if (res.code === 200) {
        this.search(this.searchForm.pageNum, this.searchForm.pageSize)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(pageNum = null, pageSize = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.tab_loading = true
      getPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search(searchForm.pageNum - 1, searchForm.pageSize)
          } else {
            this.tableData = res.data
            this.tab_loading = false
          }
        }
      })
    },
    dels() {
      this.delloading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrders({ 'singleNos': this.selectRows.map(item => item.singleNo) }).then(res => {
          this.message(res)
          this.delloading = false
        }).catch(err => {
          this.delloading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        this.delloading = false
      })
    },
    invalidFn(e, isSure = false) {
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认作废所选项目吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.invalidFn(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
        }).finally(() => {
          e.loading = false
        })
        return
      }
      OrderInvalid({ ids: this.ids }).then((res) => {
        this.message(res)
      }).finally(() => {
        e.loading = false
      })
    },
    reviews(e, isSure = false) {
      this.reviewloading = true
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.reviews(e, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          this.reviewloading = false
        })
        return
      }
      // 批量审核
      review({ ids: this.ids, auditStatus: '3' }).then((res) => {
        this.message(res)
        this.reviewloading = false
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
.form-fa{
  flex-wrap: wrap;
  margin:24px 24px 10px 24px;
}
.form-fa >>> .el-form-item__content{
  /* display: flex; */
  /*justify-content: flex-start;*/
  /*align-items:center;*/
  padding:0 30px 0 0;
  margin: 0;
  /*margin:5px;*/
  /*flex: 1;*/
}
.form-fa >>> .el-form-item{
  margin-bottom:10px
}
/* .item-fa{
 width:300px
} */
</style>
