<template>
  <div class="form-fa">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>可选权限</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="setAllExpand(true,'tree')">全部展开</el-button>
      </div>
      <div class="box-card-list">
        <el-scrollbar style="height: 100%">
          <el-tree
            ref="tree"
            node-key="id"
            :data="$attrs.treedata"
            show-checkbox
            :default-expanded-keys="ids"
            :default-checked-keys="$attrs.roletreeown"
            :render-content="renderContent"
            @check-change="handleCheckChange"
          />
        </el-scrollbar>
      </div>
    </el-card>
    <el-card class="box-card" height="300">
      <div slot="header" class="clearfix">
        <span>已选权限</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="setAllExpand(true,'tree2')">全部展开</el-button>
      </div>
      <!--    :data="treeDataSelect"  -->
      <div class="box-card-list">
        <el-scrollbar style="height: 100%">
          <el-tree
            ref="tree2"
            node-key="id"
            :data="treeDataSelect"
            :default-expanded-keys="ids"
            :render-content="selectedContent"
          />
        </el-scrollbar>
      </div>
    </el-card>
    <div class="footer">
      <el-button :loading="$attrs['form-loading']" type="primary" @click="$listeners.grantMenuCallback(selected.map(item=>item.id))">确认</el-button>
      <el-button @click="reset">还原</el-button>
    </div>
  </div>

</template>

<script>
export default {
  name: 'MenuSelect',
  data() {
    return {
      selected: [],
      selectedId: [],
      ids: [], // 不含节点
      selIds: [] // 含节点
    }
  },
  computed: {
    treeDataSelect() {
      return this.dataDeal(this.$attrs.treedata)
      // const temp = []
      // for (let i = 0; i < 100; i++) {
      //   temp.push({ id: i, label: i + 'label' })
      // }
      // return temp
    },
    comp_selected() {
      return this.$attrs.roletreeown.concat(this.selected.map(item => item.id))
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          setTimeout(() => {
            // this.$refs.tree.setCheckedKeys(this.$attrs.roletreeown)
            this.selectedId = this.$refs.tree.getCheckedNodes(false, false)
            this.selected = this.$refs.tree.getCheckedNodes(false, true)
            this.selIds = this.selected.map(item => item.id)
            this.ids = this.selectedId.map(item => item.id)
            // this.$refs.tree2.setCheckedKeys(this.ids)
          }, 0)
        }
      },
      immediate: true
    }
  },
  created() {
  },
  methods: {
    setAllExpand(state, tree) {
      const nodes = this.$refs[tree].store.nodesMap
      for (const i in nodes) {
        nodes[i].expanded = state
      }
    },
    reset() {
      this.$refs.tree.setCheckedKeys(this.$attrs.roletreeown)
      // this.ids = this.$attrs.roletreeown
    },
    renderContent(h, { node, data, store }) {
      if (node.level && node.level === 1) {
        return (
          <span>
            <el-tag size='small'>模块-{node.label}</el-tag>
          </span>)
      }
      if (data.menuEntity) {
        const temp = data.menuEntity.type === 'B' && '按钮-' || data.menuEntity.type === 'M' && '菜单-' || data.menuEntity.type === 'D' && '目录-'
        const typeName = data.menuEntity.type === 'B' && 'danger' || data.menuEntity.type === 'M' && 'success' || data.menuEntity.type === 'D' && 'info'
        return (
          <span>
            <el-tag effect='dark' type={typeName} size='mini'>{temp}-{node.label}</el-tag>
          </span>)
      }
    },
    selectedContent(h, { node, data, store }) {
      // if (this.selIds.includes(data.id)) {
      if (node.level && node.level === 1) {
        return (
          <span>
            <el-tag size='small'>模块-{node.label}</el-tag>
          </span>)
      }
      if (data.menuEntity) {
        const temp = data.menuEntity.type === 'B' && '按钮-' || data.menuEntity.type === 'M' && '菜单-' || data.menuEntity.type === 'D' && '目录-'
        const typeName = data.menuEntity.type === 'B' && 'danger' || data.menuEntity.type === 'M' && 'success' || data.menuEntity.type === 'D' && 'info'
        return (
          <span>
            <el-tag effect='dark' type={typeName} size='mini'>{temp}-{node.label}</el-tag>
          </span>)
      }
      // }
    },
    dataDeal(data) {
      // if (data.length > 0) {
      const temp = data.filter(item => this.selIds.includes(item.id))
      //
      if (temp.length > 0) {
        // temp.children = this.dataDeal(temp.children)
        //
        return temp.map(item => ({
          id: item.id,
          label: item.label,
          menuEntity: item.menuEntity,
          children: (item.children && item.children.length > 0) ? this.dataDeal(item.children) : []
        }))
      }
      //
      // return temp
      // }
      // return null
    },
    handleCheckChange() {
      this.selected = this.$refs.tree.getCheckedNodes(false, true)
      this.selectedId = this.$refs.tree.getCheckedNodes(false, false)
      this.selIds = this.selected.map(item => item.id)
      this.ids = this.selectedId.map(item => item.id)
    }
  }

}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding-bottom:50px
}
.box-card{
  width: 480px;
}
.box-card-list{
  height: 100vh;
  max-height: 70vh;
  overflow-y: auto;
}
>>> .el-scrollbar__wrap{
  overflow-x: hidden;
}
.footer{
  /*border:1px solid blue;*/
  position: fixed;
  right: 60px;
  /*align-self: flex-end;*/
  bottom: 40px;
}
.select-item{
    margin: 10px;

}
</style>
