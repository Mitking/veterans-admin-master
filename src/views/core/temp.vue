<template>
  <div>复制粘贴</div>
</template>

<script>
export default {
  name: 'Temp',
  data() {
    return {
      // sugarRate	          含糖率		false
      // season	              应季月份		false
      // tare	                皮重量		false
      // netWeight	          净重量		false
      // saleType	            售卖类型 (sale_type)		false
      // shorthandCode	      商品速记码		false
      // tagId	              标签ID		false
      // length	              长		false
      // width	              宽		false
      // height	              高		false
      // volume	              体积		false
      // baseStock	          基础库存		false
      // stopBuy	            是否停购 (if_type)		false
      // stopSale	            是否停售 (if_type)		false
      // subtractStock	      是否减库存 (if_type)		false
      // whetherScore	        是否积分 (if_type)		false
      // whetherSpecial	      是否特殊商品 (if_type)		false
      // negativeInventory	  是否负库存销售 (if_type)		false
      // whetherSorted	      是否分拣 (if_type)		false
      // whetherCount	        是否计数 (if_type)		false
      // whetherNew	          是否新品 (if_type)		false
    // whetherAdjustmentPrice	是否允许调整价格(if_type)		false
      // whetherWeigh	        是否称重商品(if_type)		false
      // whetherCoupon	      是否使用优惠劵(if_type)		false
      // whetherNovel	        是否新奇货(if_type)		false
      // turnoverDay	        周转天数		false
      // firstStorageTime	    首次入仓时间

      // id	          主键(新增传null/修改必传)
      // priceType   	价格类型 (price_type)
      // priceUseState	售卖价采用 (if_type)
      // amount	      当前价格金额
      // algCode	      算法编号
      // goodsCode   	商品代码
      //
      //
      // id	                  组合品id(新增不传/修改必传)		false
      // goodsParentCode	    商品代码		false
      // goodsCode	          组合品商品代码		false
      // comboNum	            扣减库存数量		false
      // saleMeasurementUnit	销售计量单位 (weight_type)		false
      // stopSale	            是否停售 (if_type)		false
    }
  }
}
</script>

<style scoped>

</style>
