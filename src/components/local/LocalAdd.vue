<template>
  <el-cascader
    v-model="localValue"
    :clearable="$attrs.clearable"
    style="width:100%"
    :placeholder="$attrs.placeholder"
    :options="options"
    :props="{label:'province',
             value:'id',
             lazy: true,
             checkStrictly:$attrs.check_strictly,
             lazyLoad:lazyLoad}"
    @change="change"
  />
</template>

<script>
import { getAllProvince, getCityByPcode, getCountyByPcode, getTownByPcode, getVillageByPcode, getGroupByPcode, addVillage } from '@/api/localcode/local'
export default {
  name: 'LocalAdd',
  components: { },
  data() {
    return {
      localValue: [],
      options: []
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    getAllProvince().then(res => {
      // res.data.map(item => { item.disabled = true })
      this.options = res.data
    })
  },
  methods: {
    change(e) {
      if (this.$listeners.localChange) { this.$listeners.localChange(e) }
    },
    addVillage() {
      addVillage({
        'pcode': this.localValue[3],
        'village': '三股流村'
      }).then(res => {
        console.log(res)
      })
    },
    lazyLoad(node, resolve) {
      console.log(node)
      if (node.value) {
        const pcode = node.data.code
        if (node.level === 1) {
          getCityByPcode({ pcode }).then(res => {
            res.data.map(item => { item.province = item.city })
            resolve(res.data)
          }).catch(() => {
            resolve([])
          })
        }
        if (node.level === 2) {
          getCountyByPcode({ pcode }).then(res => {
            res.data.map(item => { item.province = item.county })
            resolve(res.data)
          }).catch(() => {
            resolve([])
          })
        }
        if (node.level === 3) {
          getTownByPcode({ pcode }).then(res => {
            res.data.map(item => { item.province = item.town })
            resolve(res.data)
          }).catch(() => {
            resolve([])
          })
        }
        if (node.level === 4) {
          getVillageByPcode({ pcode }).then(res => {
            res.data.map(item => { item.province = item.village })
            resolve(res.data)
          }).catch(() => {
            resolve([])
          })
        }
        if (node.level === 5) {
          getGroupByPcode({ }).then(res => {
            res.data.map(item => { item.province = item.groupName; item.leaf = true })
            resolve(res.data)
          }).catch(() => {
            resolve([])
          })
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
