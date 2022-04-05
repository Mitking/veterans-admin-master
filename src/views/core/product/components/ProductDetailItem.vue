<template>
  <el-form class="form-fa" label-width="100px">
    <el-form-item
      v-for="(item,index) in ArrFilter($attrs['form-data'], $attrs.filtration)"
      :key="index"
      class="wid"
      :style="{'width':'25%'}"
      :label="item.title"
      :prop="item.prop"
    >
      <div v-if="$attrs.form[item.prop]==='' || $attrs.form[item.prop]===undefined" style="color:#aaaaaa">-</div>
      <div v-else>
        <div v-if="item.type==='text' || item.type==='date'">{{ $attrs.form[item.prop] }}</div>
        <div v-if="item.type==='weight_number'">{{ g2kg($attrs.form[item.prop]) }}</div>
        <div v-if="item.type==='selectState' || item.type==='select' || item.type==='goodsCategory'">{{ MenuGetPropName(item.selectData,$attrs.form[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
        <div v-if="item.type==='if_type' || item.type==='if_enable'">
          <span>
            {{ $attrs.form[item.prop]===''?enumGetproplist(item.type)[0].name:MenuGetPropName(item.type,$attrs.form[item.prop]) }}
          </span>
        </div>
        <div v-if="item.type==='number' || item.type==='Number'">
          {{ $attrs.form[item.prop] }}
          <span v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
            <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
          </span>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { ArrFilter } from '@/utils'
export default {
  name: 'ProductDetailItem',
  data() {
    return {
      form: {}
    }
  },
  computed: {
    goodTypePlaceholder() {
      return function() {
        const arr = this.$store.state.enum.enumList.categoryList.filter(itemz => itemz.id === this.idValue)
        return this.goodTypeValue === null ? '请选择' : (arr.length ? arr[0].name : '请选择')
      }
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`wms表单${n ? '打开' : '关闭'}`)
          // this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('详情数据开始初始化')
        this.loading = true
        const temp = {}
        // 详情
        ArrFilter(this.$attrs['form-data'], { addFatherProp: 'Req', 'detailShow': true }).map(item => {
          const type1 = typeof this.$attrs['current-row'][item.prop] === 'boolean'
          temp[item.prop] = type1 ? this.$attrs['current-row'][item.prop]
            : (this.$attrs['current-row'][item.prop] || item.defaultValue || '-')
        })
        this.form = temp
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
</style>
