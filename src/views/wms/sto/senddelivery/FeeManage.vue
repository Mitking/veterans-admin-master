<template>
  <div class="heightParent" :style="{height:(windowH-($attrs.is_child?187:167))+'px'}">
    <div v-if="!$attrs.is_child" class="title-add-form">费用列表</div>
    <div class="formFeather">
      <el-card class="formCard my-class my-class-line">
        <el-form ref="Form" :model="form" label-width="80px">
          <el-table
            ref="TabItem"
            class="my-class-table"
            :data="form.dataArr"
            border
            show-summary
            :summary-method="summaryFn"
          >
            <el-table-column
              v-if="isCanEdit"
              :width="100"
              fixed
            >
              <template slot="header">
                <div class="table-header">操作</div>
              </template>
              <template slot-scope="{row,$index}">
                <div class="operator-father">
                  <el-button v-permission="['wms:sendDeliveryFee:delete']" style="font-size: 1.25rem;" type="text" icon="el-icon-delete" :loading="loading" @click="deleteItem(row,$index)" />
                  <el-button v-permission="['wms:sendDeliveryFee:update']" style="font-size: 1.25rem;" type="text" icon="el-icon-circle-plus-outline" :loading="loading" @click="addItem(row,$index)" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="deliveryNo"
              label="配送单号"
              align="center"
              :width="220"
            />
            <el-table-column
              label="费用名称"
              width="350"
              align="center"
            >
              <template slot-scope="{row,$index}">
                <!-- 业务费用选项:disabled="true" -->
                <el-form-item :prop="`dataArr[${$index}].feeAssociateId`" label-width="0px" :rules="[{ required: true, message: '费用名称不能为空'}]" :style="{'width':'100%','height':'30px'}">
                  <el-cascader
                    v-model="row.feeAssociateId"
                    :disabled="!isCanEdit"
                    :props="{
                      value:'id',
                      label:'showName',
                      leaf:'ifLast',
                      emitPath:false
                    }"
                    :style="{'width':'100%'}"
                    :options="$store.state.enum.enumList.feeSelectListLast"
                    @change="is_changed=true"
                  />
                  <template slot="error" slot-scope="{error}">
                    <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
                  </template>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
              prop="feeAmount"
              label="费用金额"
              width="200"
              align="center"
            >
              <template slot-scope="{row,$index}">
                <el-form-item v-if="isCanEdit" :prop="`dataArr[${$index}].feeAmountShow`" label-width="0px" :rules="[{ required: true, message: '费用金额不能为空'}]" :style="{'width':'100%','height':'30px'}">
                  <el-input v-model="row.feeAmountShow" v-number-input.float="{decimal:2,max:99999999}" placeholder="" @change="is_changed=true" @input="row.feeAmount=yuan2fen(row.feeAmountShow)">
                    <div slot="prefix" style="height:100%">
                      <span style="line-height:36px">￥</span>
                    </div>
                  </el-input>
                  <template slot="error" slot-scope="{error}">
                    <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
                  </template>
                </el-form-item>
                <div v-else>{{ fen2yuan(row.feeAmount) }}</div>

              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              align="center"
            >
              <template slot-scope="{row}">
                <el-input v-if="isCanEdit" v-model="row.remark" placeholder="" @change="is_changed=true" />
                <div v-else>{{ row.remark }}</div>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>
    </div>
    <div v-if="!$attrs.is_child" class="footer">
      <el-button v-if="isCanEdit" v-permission="['wms:sendDeliveryFee:update']" type="primary" :loading="loading" @click="onSubmit('editFee')">
        <template>
          修改
        </template>
      </el-button>
      <el-button :loading="loading" @click="onSubmit('detail')">
        <template>
          关闭
        </template>
      </el-button>
    </div>
  </div>
</template>

<script>
import { deleteDeliveryFee, updateDeliveryFee } from '@/api/wms/senddelivery'
import { getFeeSelectList } from '@/api/oms/fin/feemanage'
import store from '@/store'
export default {
  name: 'FeeManage',
  components: { },
  // 全局常用字段
  data() {
    return {
      loading: false,
      form: { dataArr: [] },
      is_changed: false,
      initItem: { 'id': null, 'deliveryNo': this.$attrs['current-row'].deliveryNo, 'feeAssociateId': '', 'feeAmount': '', 'feeAmountShow': '', 'remark': '' }
    }
  },
  computed: {
    isCanEdit() {
      return this.$attrs['current-row'].settledAmount === '0' && this.$attrs['current-row'].auditStatus === '3' && !this.$attrs.is_child
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n === 'WmsForm') {
          this.initItem = { 'id': null, 'deliveryNo': this.$attrs['current-row'].deliveryNo, 'feeAssociateId': '', 'feeAmount': '', 'feeAmountShow': '', 'remark': '' }
          this.init()
        }
      }
    }
  },
  created() {
    if (store.state.enum.enumList.feeSelectListLast.length === 0) {
      getFeeSelectList({ ifLastQuery: true }).then(res => {
        store.dispatch('enum/add_enum', { feeSelectListLast: res.data || [] })
      })
    }
    this.init()
  },
  methods: {
    init() {
      if (this.$attrs['fee-list'].length === 0) {
        this.form.dataArr = this.deepClone([this.initItem])
      } else {
        this.form.dataArr = this.deepClone(this.$attrs['fee-list'])
      }
    },
    onSubmit(act = 'detail') {
      console.log(this.form.dataArr)
      if (this.form.dataArr.length === 1 && JSON.stringify(this.form.dataArr[0]) === JSON.stringify(this.initItem)) {
        this.loading = false
        this.$listeners.formSave('detail')
        return
      }
      if (act === 'detail') {
        if (this.is_changed) { // 数据变化
          this.$confirm(`数据有变化,确认关闭吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$listeners.formSave(act)
          }).catch(() => {
            this.loading = false
          })
        } else {
          this.$listeners.formSave(act)
        }
      } else if (act === 'editFee') {
        this.loading = true
        this.$refs.Form.validate(pass => {
          if (pass) {
            updateDeliveryFee(this.form.dataArr).then(() => {
              this.$listeners.formSave({ opt: 'detail', refresh: true })
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.loading = false
          }
        })
      }
    },
    deleteItem(e, index, isSure = false) {
      console.log('del')
      if (!e.id) { // 没有id的直接删除
        this.form.dataArr.remove(e)
        if (this.form.dataArr.length === 0) {
          this.form.dataArr = this.deepClone([this.initItem])
        }
        return
      }
      if (!isSure) {
        this.$confirm(`确认删除所选项目吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteItem(e, index, true)
        }).catch(() => {
          this.$message.info('已取消删除')
        })
        return
      }
      this.loading = true
      deleteDeliveryFee({ ids: [e.id] }).then(() => {
        this.form.dataArr.remove(e)
        if (this.form.dataArr.length === 0) {
          this.form.dataArr = this.deepClone([this.initItem])
        }
      }).finally(() => {
        this.loading = false
      })
    },
    addItem(e, index) {
      this.is_changed = true
      this.form.dataArr.splice((index + 1), 0, this.deepClone(this.initItem))
      console.log('add')
    },
    summaryFn(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (column.property === 'feeAmount') {
          sums[index] = data.map(item => Number(this.fen2yuan(item[column.property]))).reduce((curr, prve) => this.DECIMAL.add(curr, prve).toNumber(), 0)
        } else {
          sums[index] = '-'
        }
      })
      return sums
    }
  }
}
</script>

<style scoped>
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  flex: 1;
  /*margin-left: -5%;*/
  /*border:1px solid blue;*/
  border-bottom: 1px solid #cccccc;
}
.heightParent{
  display: flex;
  flex-direction: column;
  /*border:1px solid red;*/
}
.formCard:nth-of-type(1){
  margin: 20px 20px 10px 20px;
}
.formCard:last-of-type{
  margin: 10px 20px 20px 20px;
}
.formCard{
  margin: 10px 20px;
}
.footer{
  /*border:1px solid blue;*/
  padding-top: 12px;
  margin-right: 1%;
  align-self: flex-end;
  z-index: 100;
}
.my-class >>> .el-form-item{
  margin-bottom:8px
}
.my-class >>> .el-collapse-item__header{
  border:none;
  border-bottom-color: #e6ebf5;
 }
.my-class >>> .el-collapse-item__header.collapse-transition{
  border:none;
}
.my-class >>> .el-collapse-item__content{
  padding-bottom: 0
}
.my-class >>> .el-collapse{
  border:none
}
.my-class >>> .el-collapse-item__wrap{
  border:none
}
.my-class-line >>> .el-collapse-item__header.is-active{
  border-bottom:1px solid #e6ebf5;
}
.my-class-edit >>> .el-form-item{
  margin-bottom: 10px;
  margin-top: 10px
}
.my-class-detail >>> .el-form-item{
  margin-bottom: 0;
  margin-top: 10px
}
.table-header{
  display: flex;
  justify-content: center;
}
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
</style>
