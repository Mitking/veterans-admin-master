<template>
  <el-card class="mt10">
    <div slot="header" class="headerTitle">
      <span>按钮权限</span>
      <!-- {{ checks }} -->
      <el-button-group>
        <el-button size="small" type="primary" round @click="checkAll">全选</el-button>
        <el-button size="small" type="info" round @click="uncheckAll">全不选</el-button>
      </el-button-group>
    </div>
    <div>
      <el-checkbox-group v-model="$attrs['checks-button-ids'].ButtonIds" size="small">
        <el-checkbox v-for="b in buttonList" :key="b.id" :label="b.id" border>{{ b.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'Buttons',
  props: {
    buttons: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    }
    // checksButtonIds: {
    //   type: Array,
    //   required: true
    // }
  },
  data() {
    return {
      checks: []
    }
  },
  computed: {
    buttonList() {
      return this.buttons
    }
  },
  watch: {
    // checks: { // 监听选中变化，告知父组件，选中的按钮权限
    //   handler(nv) {
    //     this.change(nv)
    //   }
    // },
    // checksButtonIds: {
    //   handler(nv) {
    //     this.checks = this.checksButtonIds
    //   }
    // }
  },
  methods: {
    log(id) {
      console.log(id)
    },

    // change(checkIds) {
    //   if (this.buttons && this.buttons[0] && this.buttons[0].menuEntity) {
    //     const parentId = this.buttons[0].menuEntity.parentId
    //     this.$emit('buttonCheck', parentId, checkIds)
    //   }
    // },
    checkAll() {
      this.buttonList.forEach(item => {
        if (!this.$attrs['checks-button-ids'].ButtonIds.includes(item.id)) {
          this.$attrs['checks-button-ids'].ButtonIds.push(item.id)
        }
      })
    },
    uncheckAll() {
      this.buttonList.forEach(item => {
        if (this.$attrs['checks-button-ids'].ButtonIds.includes(item.id)) {
          this.$attrs['checks-button-ids'].ButtonIds.splice(this.$attrs['checks-button-ids'].ButtonIds.indexOf(item.id), 1)
        }
      })
    }
  }
}
</script>

<style scoped>
.headerTitle{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
