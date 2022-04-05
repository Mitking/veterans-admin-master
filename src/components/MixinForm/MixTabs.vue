<template>
  <div>
    <div v-if="!$attrs.readonly" style="margin: 15px;">
      <!--   v-model="$attrs.form[item.prop]"   -->
      <el-select v-model="priceType" class="item-select-fa" placeholder="请选择价格类型" :style="{width:'300px'}">
        <el-option
          v-for="itemSon in selectComputed({selectData:'price_type'})"
          :key="itemSon.value"
          :label="itemSon.name"
          :value="itemSon.value"
          :disabled="addDisabledComp(itemSon)"
        />
      </el-select>
      <el-button
        style="margin: 10px;"
        type="primary"
        size="small"
        @click="addTab(priceType)"
      >
        添加新价格
      </el-button>
    </div>
    <!--  v-model="$attrs.form[0].priceType"  -->
    <el-tabs v-model="value" v-loading="loading" type="card" :closable="!$attrs.readonly" @tab-remove="(e)=>{loading=true;removeTab(e)}">
      <el-tab-pane
        v-for="(item) in $attrs.form"
        :key="item.priceType"
        :label="MenuGetPropName('price_type',item.priceType)+(item.id?'':'(新增)')"
        :name="item.priceType"
      >
        <mix-add-module :form-data="$attrs['form-data']" :form="item" :readonly="$attrs.readonly" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import MixAddModule from '@/components/MixinForm/MixAddModule'
import { deleteById } from '@/api/core/product'
export default {
  name: 'MixTabs',
  components: { MixAddModule },
  data() {
    return {
      priceType: '',
      formwork: {},
      loading: false,
      value: this.$attrs.form[0].priceType
    }
  },
  computed: {
    selectComputed() { // select选项集
      return function(propitem) {
        return this.enumGetproplist(propitem)
      }
    },
    addDisabledComp() {
      return function(itemSon) {
        return this.$attrs.form.map(item => item.priceType).includes(itemSon.value)
      }
    }
  },
  watch: {
    '$attrs.dataloading': { // 监听网络获取数据
      handler(n) {
        if (n === false) {
          this.value = this.$attrs.form[0].priceType
        }
      }
    }
  },
  created() {
    this.$attrs['form-data'].map(item => {
      this.$set(this.formwork, item.prop, typeof (item.defaultValue) !== 'undefined' ? item.defaultValue : null)
    })
  },
  methods: {
    addTab(n) {
      if (n === '') {
        this.$message.error('请先选择价格类型')
        return
      }
      this.formwork.priceType = n
      this.$attrs.form.push(this.deepClone(this.formwork))
      this.priceType = '' // 还原下拉框
      this.value = this.$attrs.form[(this.$attrs.form.length - 1)].priceType
    },
    removeTab(targetName) {
      if (this.$attrs.form.filter(item => item.priceType === targetName).length > 0) {
        if (this.$attrs.form.length === 1) {
          this.$message.error('至少保留一项！')
          this.loading = false
          return
        }
        const id = this.$attrs.form.filter(item => item.priceType === targetName)[0].id
        if (id === null) { // 当删除的为新增价格时
          this.$attrs.form.splice(this.$attrs.form.indexOf(this.$attrs.form.filter(item => item.priceType === targetName)[0]), 1)
          this.loading = false
          this.value = this.$attrs.form[0].priceType
          return
        }
        if (this.$attrs.form.some(item => item.id === null)) {
          this.$message('移除或者提交新增价格后操作！')
          this.loading = false
          return
        }
        this.$confirm(`此操作将永久删除「${this.MenuGetPropName('price_type', targetName)}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteById({ 'id': id }).then(res => {
            if (res.code === 200) {
              this.$listeners.bresh()
              this.$success('操作成功')
            } else {
              this.$error(res.data)
            }
            this.value = this.$attrs.form[0].priceType
            this.loading = false
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          this.loading = false
        })
      }
    }
  }
}
</script>
