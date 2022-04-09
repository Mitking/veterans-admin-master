<template>
  <div>
    <el-form ref="form" label-width="100px">
      <el-form-item label="省">
        <el-cascader
          v-model="localValue"
          :options="options"
          :props="{label:'province',
                   value:'id',
                   lazy: true,
                   lazyLoad:lazyLoad}"
        />
      </el-form-item>
      <div>
        <el-form-item>
          <el-button type="primary" @click="addVillage">
            追加村
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getAllProvince, getCityByPcode, getCountyByPcode, getTownByPcode, getVillageByPcode, addVillage } from '@/api/localcode/local'
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
      this.options = res.data
    })
  },
  methods: {
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
            res.data.map(item => { item.province = item.village; item.leaf = true })
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
