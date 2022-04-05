<template>
  <div class="heightParent" :style="{height:(windowHeight-167)+'px'}">
    <div class="title-add-form">订单明细</div>
    <div class="formFeather">
      <el-card class="formCard my-class my-class-line">
        <div class="my-class-form-title">单据信息</div>
        <el-form label-width="100px" class="form-fa my-class-detail">
          <el-form-item label="单据号" style="width:25%">{{ $attrs.details.orderInfo.orderNo }}</el-form-item>
          <el-form-item label="会员手机号" style="width:25%">{{ $attrs.details.orderInfo.mobile }}</el-form-item>
          <el-form-item label="交易金额" style="width:25%">{{ fen2yuan($attrs.details.orderInfo.dealAmount) }}</el-form-item>
          <el-form-item label="单据状态" style="width:25%">{{ MenuGetPropName('pos_order_state',$attrs.details.orderInfo.state) }}</el-form-item>
          <el-form-item label="交易时间" style="width:25%">{{ $attrs.details.orderInfo.dealTime }}</el-form-item>
          <el-form-item label="实收金额" style="width:25%">{{ fen2yuan($attrs.details.orderInfo.actualAmount) }}</el-form-item>
          <el-form-item label="找零金额" style="width:25%">{{ fen2yuan($attrs.details.orderInfo.changeAmount) }}</el-form-item>
          <el-form-item v-if="$attrs.details.orderInfo.state==='4'" label="已退金额" style="width:25%">{{ fen2yuan($attrs.details.orderInfo.refundAmount) }}</el-form-item>
        </el-form>
      </el-card>
      <!--  -->
      <el-card v-if="$attrs.details.payTypeInfos.length" class="formCard my-class my-class-line">
        <div class="my-class-form-title">收款方式</div>
        <el-form label-width="100px" class="form-fa my-class-detail">
          <el-form-item v-for="index in ($attrs.details.payTypeInfos.length * 4)" :key="index" style="width:25%">
            <template slot="label">
              {{
                index%4===1 && MenuGetPropName('pay_type',$attrs.details.payTypeInfos[parseInt((index-1)/4)].payType)
                  || index%4===2 && '收款金额'
                  || index%4===3 && '参考单据号'
                  || ''
              }}
            </template>
            {{ index%4===1 && fen2yuan($attrs.details.payTypeInfos[parseInt((index-1)/4)].payAmount)
              || index%4===2 && fen2yuan($attrs.details.payTypeInfos[parseInt((index-1)/4)].receiveAmount)
              || index%4===3 && $attrs.details.payTypeInfos[parseInt((index-1)/4)].referenceNo
              || '' }}
          </el-form-item>
        </el-form>
      </el-card>
      <el-card v-if="$attrs.details.productInfos.length || $attrs.details.cardInfos.length" class="formCard my-class my-class-line">
        <div class="my-class-form-title">项目明细</div>
        <el-table
          v-if="$attrs.details.productInfos.length"
          :data="$attrs.details.productInfos"
          style="width: 981px;margin:10px"
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
          border
        >
          <el-table-column prop="goodsName" label="商品名称" align="center" width="240" />
          <el-table-column label="数量" align="center" width="200">
            <template slot-scope="{row}">
              {{ g2kg(row.number)+row.weightTypeName }}
            </template>
          </el-table-column>
          <el-table-column label="单价" align="center" width="180">
            <template slot-scope="{row}">
              {{ fen2yuan(row.salePrice) }}
            </template>
          </el-table-column>
          <el-table-column label="金额" align="center" width="180">
            <template slot-scope="{row}">
              {{ fen2yuan(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="orgId" label="实际应收" align="center" width="180">
            <template slot-scope="{row}">
              {{ fen2yuan(row.actualAmount) }}
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-if="$attrs.details.cardInfos.length"
          :data="$attrs.details.cardInfos"
          style="width: 981px;margin:10px"
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
          border
        >
          <el-table-column prop="faceNo" label="卡面号" align="center" width="180" />
          <el-table-column label="单价" align="center" width="200">
            <template slot-scope="{row}">
              {{ fen2yuan(row.price) }}
            </template>
          </el-table-column>
          <el-table-column label="金额" align="center" width="200">
            <template slot-scope="{row}">
              {{ fen2yuan(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="折扣金额" align="center" width="200">
            <template slot-scope="{row}">
              {{ fen2yuan(row.discountAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="orgId" label="实际应收" align="center" width="200">
            <template slot-scope="{row}">
              {{ fen2yuan(row.actualAmount) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <div class="footer"><el-button @click="$listeners.closeForm">关 闭</el-button></div>
  </div>
</template>

<script>
export default {
  name: 'WmsForm',
  components: { },
  data() {
    return {
      windowHeight: document.documentElement.clientHeight
    }
  },
  computed: {

  },
  watch: {},
  mounted() {

  },
  methods: {}
}
</script>
<style scoped>
.footer{
  /*border:1px solid blue;*/
  padding-top: 12px;
  margin-right: 1%;
  align-self: flex-end;
  z-index: 100;
}
.heightParent{
  display: flex;
  flex-direction: column;
  /*border:1px solid red;*/
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
.my-class-form-title{
  font-size:1.05rem;
  border-bottom:1px solid #ccc;
  line-height:2rem
}
.my-class-detail >>> .el-form-item{
  margin-bottom: 0;
  margin-top: 10px
}
.form-fa{
  display: flex;
  flex-wrap: wrap;
  /*padding-bottom:15px*/
}
</style>
