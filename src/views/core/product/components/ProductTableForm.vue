<template>
  <div>
    <el-form ref="Form" :model="form" class="form-fa">
      <el-row>
        <el-col
          v-for="(item,index) in $attrs['price_list']"
          :key="index"
          :span="['2','3'].includes(item.priceType)?6:12"
          style="display:flex;justify-content: space-around"
        >
          <el-form-item
            :label="MenuGetPropName('price_type',item.priceType)"
            :label-width="'80px'"
            :style="{marginLeft:['2','3'].includes(item.priceType)?($attrs['operate-item'].prop==='detail'?'10px':'40px'):((item.priceType==='8')?($attrs['operate-item'].prop==='detail'?'0px':'42px'):'41px')}"
            :prop="'amountShow'+item.priceType"
            :rules="[{ required: (item.priceType!=='8' && $attrs['operate-item'].prop!=='detail'), message: '价格必填', trigger: 'change' }]"
          >
            <div v-if="$attrs['operate-item'].prop==='detail'">
              <div v-if="!item.amountShow" style="color:#aaaaaa">-</div>
              <span v-else>{{ item.amountShow }}</span>
            </div>
            <!--:readonly="['2','3'].includes(item.priceType)"  -->
            <el-input
              v-else
              v-model="item.amountShow"
              v-number-input.float="Object.assign({decimal:['2', '3'].includes(item.priceType)?6:2,max:999999},item.float)"
              :style="{'width':'80%'}"
              placeholder="手动录入"
              @input="
                if(['2', '3'].includes(item.priceType)){item.amount=yuan2fen6cover($event)}
                else{item.amount=yuan2fen($event)}
                form['amountShow'+item.priceType]=$event"
            />
          </el-form-item>
          <el-form-item
            v-if="!['2','3'].includes(item.priceType)"
            :style="{marginLeft:(item.priceType==='8')?($attrs['operate-item'].prop==='detail'?'-70px':'-8px'):($attrs['operate-item'].prop==='detail'?'20px':0)}"
            :label-width="'140px'"
            :prop="'algCode'+item.priceType"
            :rules="[{ required: (item.priceType!=='8' && $attrs['operate-item'].prop!=='detail'), message: '算法必填', trigger: 'change' }]"
          >
            <span slot="label">
              {{ MenuGetPropName('price_type',item.priceType)+'算法'+(item.priceType==='5'?'组':'') }}
              <el-tooltip
                v-if="$attrs['operate-item'].prop!=='detail'"
                v-permission="['core:priceAlg:getList']"
                placement="bottom"
                effect="light"
                popper-class="path-lint-to"
              >
                <div slot="content" @click="$router.push({name:item.priceType==='5'?'AlgTeam':'PriceAlgIndex'})">没有适合的选项,点此设置</div>
                <i class="el-icon-warning-outline" />
              </el-tooltip>
            </span>
            <div v-if="$attrs['operate-item'].prop==='detail'">
              <div v-if="!item.algCode" style="color:#aaaaaa">-</div>
              <span v-else-if="item.priceType==='5'">{{ MenuGetPropName('alg_team',item.algTeamId,{ value: 'id', label: 'teamName' }) }}</span>
              <span v-else>{{ MenuGetPropName('algList',item.algCode,{ value: 'algCode', label: 'algName' }) }}</span>
            </div>
            <!-- 零售价选算法组 -->
            <el-select
              v-else-if="item.priceType==='5'"
              v-model="item.algCode"
              placeholder="请选择"
              @change="(v)=>{algChange(item,v)}"
            >
              <el-option
                v-for="(itemSon,indexSon) in selectComputed({selectData:'alg_team'})"
                :key="indexSon"
                :label="itemSon.teamName"
                :value="itemSon.id"
              />
            </el-select>
            <el-select
              v-else
              v-model="item.algCode"
              placeholder="请选择"
              @change="(v)=>{algChange(item,v)}"
            >
              <el-option
                v-for="(itemSon,indexSon) in selectComputed({selectData:'algList'})"
                :key="indexSon"
                :label="itemSon.algName"
                :value="itemSon.algCode"
                :disabled="alg_select_dis_comp(itemSon,item)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { calculatePrice } from '@/api/core/product'
export default {
  name: 'ProductTableForm',
  data() {
    return {
      form: { amountShow1: '', amountShow2: '', amountShow3: '', amountShow4: '', amountShow5: '', amountShow6: '', amountShow7: '', amountShow8: '',
        algCode1: '', algCode2: '', algCode3: '', algCode4: '', algCode5: '', algCode6: '', algCode7: '', algCode8: '' }
    }
  },
  computed: {
    // 校验价格算法可用性
    alg_select_dis_comp() {
      return function(itemSon, item) {
        const price = item.priceType === '5' ? this.$attrs['price_list'][2].amount : this.$attrs['price_list'][0].amount
        return itemSon.maxCost < price || itemSon.minCost > price
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        return this.enumGetproplist(propitem) || []
      }
    } },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n === 'ProductAdd') {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          this.$attrs.price_list.map(item => {
            this.$set(this.form, 'algCode' + item.priceType, item.algCode)
            this.$set(this.form, 'amountShow' + item.priceType, item.amountShow)
          })
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    init() { // 重置
      this.$refs.Form.clearValidate()
    },
    algChange(item, val) { // algTeamId
      this.form['algCode' + item.priceType] = val
      const price = item.priceType === '5' ? this.$attrs['price_list'][2].amount : this.$attrs['price_list'][0].amount
      calculatePrice({ price: price, algCode: item.priceType !== '5' ? val : null, algTeamId: item.priceType === '5' ? val : null, ifWeigh: this.$attrs.form.whetherWeigh }).then(res => {
        if (res.code === 200) {
          item.amount = res.data.calculatePrice
          item.amountShow = this.fen2yuan(item.amount)
          this.form['amountShow' + item.priceType] = item.amountShow
        }
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  margin-top:15px;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
</style>
