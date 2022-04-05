<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div class="title">{{ $attrs['operate-item'].title }}</div>
    <div class="formFeather">
      <!--   基础信息   -->
      <el-card class="formCard my-class my-class-line">
        <el-collapse :value="collapseNames" @change="collapseValue = $event[0]">
          <el-collapse-item name="1">
            <div slot="title" style="font-size:1.05rem">基础信息</div>
            <oms-invoice-form-item v-if="$attrs['operate-item'].prop!=='detail'" ref="Form" class="my-class-edit" v-bind="$attrs" @selectChange="selectChange" v-on="$listeners" />
            <oms-detail-item v-if="$attrs['operate-item'].prop==='detail'" ref="Form" class="my-class-detail" v-bind="$attrs" v-on="$listeners" />
          </el-collapse-item>
        </el-collapse>
      </el-card>
      <!--  详情备注  -->
      <transition name="el-zoom-in-top">
        <el-card v-if="$attrs['operate-item'].prop==='detail' && $attrs['current-row'].remark" v-show="collapseValue==='1'" class="formCard">
          <el-form label-width="100px">
            <el-form-item label="备注信息">
              <div style="padding-top: 0.25rem;padding-right: 0.5rem;line-height: 1.5rem;">{{ $attrs['current-row'].remark }}</div>
            </el-form-item>
          </el-form>
        </el-card>
      </transition>
      <!--   结算单数据   -->
      <el-card class="formCard">
        <oms-invoice-table ref="settleTable" v-bind="$attrs" v-on="$listeners" />
      </el-card>
      <!--   表格数据     -->
      <el-card v-if="$attrs.details" class="formCard">
        <oms-table ref="Table" v-bind="$attrs" v-on="$listeners" />
      </el-card>
    </div>
    <!--    底部    -->
    <div class="footer">
      <el-button
        v-for="(item, index) in $attrs['form-bottons'] || []"
        v-show="item.mix_comp_buttons_show(item)"
        :key="index"
        v-permission="item.permission"
        :loading="loading"
        type="primary"
        @click="onSubmit({opt:$attrs['operate-item'].prop,review:item.prop==='review'})"
      >
        <template>
          {{ item.title }}
        </template>
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" :loading="loading" type="primary" @click="onSubmit($attrs['operate-item'].prop)">
        <template v-if="['insert','withinAdd','edit','edits'].includes($attrs['operate-item'].prop)">
          {{ $attrs['operate-item'].title }}
        </template>
      </el-button>
      <el-button v-if="!($attrs['operate-item'].prop === 'detail')" type="success" :loading="loading" @click="reset">{{
        $attrs['operate-item'].prop==='insert' && '重置' ||
          ['edit','withinAdd','edits'].includes($attrs['operate-item'].prop) && '还原'
      }}
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
import OmsInvoiceFormItem from '@/views/oms/components/OmssupplierInvoiceFormItem'
import OmsDetailItem from '@/views/oms/components/OmsDetailItem'
import OmsTable from '@/views/oms/components/OmsTable'
import OmsInvoiceTable from '@/views/oms/components/OmssupplierInvoiceTable'
export default {
  name: 'OmsForm',
  components: { OmsInvoiceFormItem, OmsTable, OmsDetailItem, OmsInvoiceTable },
  props: {
    loading: {
      type: Boolean,
      defaultValue: () => false
    }
  },
  data() {
    return {
      collapseValue: '1',
      collapseNames: ['1'],
      windowHeight: document.documentElement.clientHeight,
      form: {},
      RootArrayForm: {},
      supplierId: '',
      tableTotal: '' // 发票总金额
    }
  },
  watch: {},
  methods: {
    selectChange(id) {
      this.$refs.settleTable.settle_org_id = id
    },
    onSubmit(arg) {
      this.$emit('update:loading', true)
      if (arg === 'detail') { // 关闭
        // if (this.$refs.Table && (this.$refs.Table.deleteDetails.length > 0 || this.$refs.Table.form.details.length > this.$attrs.details.length)) {
        if (JSON.stringify(this.$refs.Table.form.details) !== JSON.stringify(this.$attrs.details)) {
          this.$confirm(`系统发现有变动项目，关闭后这些项目不会被保存，直接关闭表单？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$listeners.formSave(arg)
          }).catch(() => {
            this.$emit('update:loading', false)
            this.$message({
              type: 'info',
              message: '请点击修改保存'
            })
          })
        } else {
          this.$listeners.formSave(arg)
        }
        return
      }
      if (arg === 'review') {
        this.$listeners.formSave(arg)
        return
      }
      const promise = []
      promise.push(this.$refs.Form.$refs.form.validate())
      if (this.$refs.Table) {
        promise.push(this.$refs.Table.$refs.Form.validate())
      }
      if (this.$refs.settleTable) {
        promise.push(this.$refs.settleTable.$refs.Form.validate())
      }
      Promise.all(promise).then(res => {
        
        console.log('通过检验')
        const temp = {}
        this.$set(temp, 'Req', this.deepClone(this.$refs.Form.form))
        if (this.$refs.Table && this.$refs.settleTable) {
          this.$set(temp, 'detailReqs', this.$refs.Table.form.details)
          this.$set(temp, 'Settle', this.deepClone(this.$refs.settleTable.form.settleDetails))
          const total_temp = temp.detailReqs.map(item => item.total).reduce((prev, curr) => {
            return Number(prev) + Number(curr)
          }, 0)
          if (temp.Req.invoiceTotalAmount !== total_temp) {
            this.$message.error('发票总额与本次开票金额不相等！')
            this.$emit('update:loading', false)
            return
          }
          this.$listeners.formSave(arg, temp, this.$refs.Table.deleteDetails)
        } else {
          this.$listeners.formSave(arg, temp)
        }
      }).catch(err => {
        this.$message.error('数据有误，请检查')
        this.$emit('update:loading', false)
        throw err
      })
    },
    delItem(item) {
      const promise = []
      promise.push(this.$refs.Form.$refs.form.validate())
      if (this.$refs.Table) {
        promise.push(this.$refs.Table.$refs.Form.validate())
      }
      if (this.$refs.settleTable) {
        promise.push(this.$refs.settleTable.$refs.Form.validate())
      }
      return new Promise((resolve) => {
        Promise.all(promise).then(res => {
          
          console.log('通过检验')
          const temp = {}
          this.$set(temp, 'supplierInvoiceReq', this.deepClone(this.$refs.Form.form))
          this.$set(temp, 'detailReqs', this.$refs.Table.form.details)
          this.$set(temp, 'settleReqs', this.deepClone(this.$refs.settleTable.form.settleDetails))
          const total_temp = temp.detailReqs.map(item => item.total).reduce((prev, curr) => {
            return Number(prev) + Number(curr)
          }, 0)
          if (temp.supplierInvoiceReq.invoiceTotalAmount !== (total_temp - item.total)) {
            this.$message.error('删除后该条数据后，发票总额与本次开票金额不相等！')
            resolve({ code: 500 })
          } else {
            temp.detailReqs.map(itemM => {
              if (itemM.id === '' || typeof itemM.id === 'undefined') {
                itemM.id = null
                itemM.invoicingCode = temp.supplierInvoiceReq.invoicingCode
              }
            })
            temp.detailReqs = temp.detailReqs.filter(itemF => itemF.id !== item.id)
            resolve({ code: 200, data: temp })
          }
        }).catch(err => {
          this.$message.error('数据有误，请检查')
          this.$emit('update:loading', false)
          throw err
        })
      })
    },
    reset() {
      
      this.$refs.Form.init()
      this.supplierId = ''
      if (this.$refs.Table) {
        this.$refs.Table.$refs.Form.resetFields()
        this.$refs.Table.init()
        this.$refs.settleTable.init()
      }
    }
  }

}
</script>

<style scoped>
.heightParent{
  display: flex;
  flex-direction: column;
  /*border:1px solid red;*/
}
.title{
  width: 100%;
  background-color: #ffffff;
  line-height: 2.6rem;
  padding-left: 20px;
}
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  flex: 1;
  /*margin-left: -5%;*/
  /*border:1px solid blue;*/
  border-bottom: 1px solid #cccccc;
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

</style>
