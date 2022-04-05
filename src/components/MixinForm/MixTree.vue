<template>
  <div class="form-fa">
    <el-tree
      :props="props"
      :load="loadNode"
      lazy
      @node-click="selected"
    />
    <div class="footer">
      <el-button size="mini" type="primary" @click="onOk">确认</el-button>
      <el-button size="mini" @click="onOk(0)">清空</el-button>
    </div>
  </div>
</template>

<script>
// { "id": 1, "code": "01", "name": "水果", "parentCode": "0", "haveChild": false, "enable": true, "sortNo": 1 }

export default {
  name: 'MixTree',
  data() {
    return {
      props: {
        label: 'name',
        children: 'haveChild',
        isLeaf: 'isLeaf',
        disabled: 'disabled'
      },
      select: { code: '' },
      treeData: []
    }
  },
  created() {
    // this.props = this.$attrs.tree[0]
  },
  methods: {
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(this.$attrs.tree)
      } else {
        this.$listeners.getDateByCode(node.data.code).then(res => {
          return resolve(res)
        }).catch(err => {
          console.log(err)
          return resolve([])
        })
      }
    },
    onOk(e = '') {
      if (e === 0) {
        this.$listeners.searchSync('')
      }
      this.$listeners.show()
    },
    selected(e) {
      this.$listeners.searchSync(e)
      this.select = e
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  padding-bottom:50px
}
.footer{
  /*border:1px solid blue;*/
  position: absolute;
  right: 40px;
  align-self: flex-end;
  bottom: 10px;
}
</style>
