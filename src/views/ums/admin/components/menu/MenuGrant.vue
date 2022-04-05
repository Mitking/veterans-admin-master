<template>
  <div>
    <!--    {{ checks }}
    <el-divider />
    {{ buttonChecks }}-->
    <el-tabs type="border-card" style="width: 70%;" @tab-click="tabClick">
      <el-tab-pane v-for="(menu,index) in menuList" :key="index" :label="menu.moduleName" :module="menu.module">
        <el-row>
          <el-col :span="6">
            <el-tree
              ref="tree"
              :data="menu.nodes"
              show-checkbox
              highlight-current
              :default-expand-all="true"
              node-key="id"
              :default-checked-keys="checks"
              @node-click="nodeClick"
            />
          </el-col>
          <el-col :offset="1" :span="17">
            <ButtonsView
              :checks-button-ids="checksButtonIds"
              :current="currentRow"
              :buttons="buttons"
              @buttonCheck="buttonCheck"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <div style="margin: 10px;">
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script type="text/javascript">
import ButtonsView from '@/views/ums/admin/components/menu/ButtonsView.vue'
import { grantMenu, roleInfo } from '@/api/ums/role'

export default {
  name: 'MenuGrant',
  components: { ButtonsView },
  props: {
    roleId: {
      required: true,
      type: Number,
      default: null
    }
  },
  data() {
    return {
      menuList: [],
      baseProps: {},
      buttons: [],
      currentRow: null, // 当前权限的行
      checks: [],
      checksButtonIds: { ButtonIds: [] },
      buttonChecks: {}
    }
  },
  created() {
    this.getGrantMenu()
  },
  methods: {
    tabClick(e) {
      if (this.currentRow) {
        this.baseProps = this.currentRow.menuEntity
      }
    },
    menuClick(row) {
      this.currentRow = row
      this.baseProps = row.menuEntity
      this.buttons = row.buttons
    },
    nodeClick(data, node, tree) {
      this.buttons = data.buttons
    },
    buttonCheck(parentId, checkIds) {
      this.$set(this.buttonChecks, `${parentId}`, checkIds)
    },
    submit() {
      let menuIds = []

      const treeList = this.$refs.tree

      treeList.forEach(tree => {
        menuIds = menuIds.concat(tree.getCheckedKeys())
        menuIds = menuIds.concat(tree.getHalfCheckedKeys())
      })
      // Object.values(this.buttonChecks).forEach(item => {
      //   menuIds = menuIds.concat(item)
      // })

      menuIds = menuIds.concat(this.checksButtonIds.ButtonIds)
      grantMenu({ id: this.roleId, menuIds: menuIds }).then(res => {
        this.$message.info('操作成功')
        this.$emit('close')
      })
    },
    getGrantMenu() { // 获取角色授权
      this.grantMenuShow = true
      roleInfo({ roleId: this.roleId }).then(res => {
        this.menuList = res.data.menus
        this.checks = res.data.ownMenuIds
        this.checksButtonIds.ButtonIds = res.data.ownButtonIds
      })
    }
  }
}
</script>

<style scoped>
</style>
