<template>
  <div class="formFeather" :style="{height:(windowHeight-150)+'px'}">
    <el-card style="margin:24px">
      <div style="color:#42b983;font-size: 1.2rem;font-weight:500">{{ $attrs.no_multiple?'单点':'批量' }}选择</div>
      <component
        :is="Comp"
        :select_window_name="$attrs.select_window_name"
        :is_child="true"
        :add_arr="$attrs.add_arr"
        :child_search_data="$attrs.child_search_data"
        :table_goods_code_arr="$attrs.table_goods_code_arr"
        :no_multiple="$attrs.no_multiple"
        @selectList="$listeners.selectList"
        @addlist="$listeners.addlist"
      />
      <!--    底部    -->
      <div class="footer">
        <el-button @click="$listeners.closeAddwindow">关 闭</el-button>
        <el-button type="primary" :disabled="$attrs.no_multiple?$attrs.add_arr_form.length===0:$attrs.add_arr.length===0" @click="$listeners.addlist">确 定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import ProductIndex from '@/views/core/product/product/index'
import StoreProductIndex from '@/views/core/product/storeproduct/index'
import SupplierIndex from '@/views/core/market/supplier/index'
import User from '@/views/ums/admin/userSelectPage'
import GetCardPageIndex from '@/views/oms/card/getcardpage/getcardpage'
import Customer from '@/views/core/Customer/Customer'

export default {
  name: 'OmsAddCardForm',
  components: {
    Customer,
    ProductIndex,
    StoreProductIndex,
    SupplierIndex,
    User,
    GetCardPageIndex,
    FinFranchiseeSettleIndex: () => import('@/views/oms/fin/business/franchiseesettle/index'),
    FinFranchiseeFeeIndex: () => import('@/views/oms/fin/business/franchiseefee/index'),
    SendDeliveryIndex: () => import('@/views/wms/sto/senddelivery/index'),
    SendRejectIndex: () => import('@/views/wms/send/sendreject/index'),
    SupplierFeeIndex: () => import('@/views/oms/fin/business/supplierfee'),
    StockReceiveIndex: () => import('@/views/wms/sto/stockreceive'),
    StockRefundIndex: () => import('@/views/wms/sto/stockrefund'),
    SupplierSettleIndex: () => import('@/views/oms/fin/business/suppliersettle')
  },
  data() {
    return {
      Comp: this.$attrs.select_window_name,
      windowHeight: document.documentElement.clientHeight,
      select_add_list: []
    }
  },
  watch: {
    '$attrs.select_window_name': {
      handler(n) {
        this.Comp = n
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  height: 200%;
}
.footer{
  /*border:1px solid blue;*/
  position: relative;
  padding: 12px 24px 36px 0;
  float: right;
  z-index: 100;
}
</style>
