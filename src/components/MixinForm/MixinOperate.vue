<!--MixinOperate 操作栏封装 -->
<template>
  <el-form inline size="mini" style="margin: 0 24px" :style="{marginBottom:($attrs.is_child || windowH<700)?'-12px':0}">
    <el-form-item
      v-for="(item, index) in operateList"
      v-show="item.show"
      :key="index"
      v-permission="item.permission"
    >
      <el-button
        v-if="item.prop !== 'otherProfession'"
        :size="($attrs.is_child || windowH<700)?'mini':'small'"
        :loading="item.loading"
        :disabled="comp_disabled(item)"
        :type="item.type"
        :icon="item.icon"
        @click="item.click(item)"
      >{{ item.title }}</el-button>
      <el-dropdown v-if="item.prop === 'otherProfession'" @command="handleCommand">
        <el-button :type="item.type" :loading="item.loading">
          {{ item.title }}<i class="el-icon-caret-bottom" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="itemOther in item.otherProfession"
            :key="itemOther.prop"
            v-permission="itemOther.permission"
            :disabled="comp_disabled(itemOther)"
            :command="{item:item,itemOther:itemOther}"
          >
            <span>{{ itemOther.title }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-form-item>
    <el-form-item v-if="$attrs.back">
      <el-tag
        style="cursor:pointer"
        type="success"
        @click="$listeners['search-form-act']"
      >
        {{ $attrs["search-form-show"] ? "收起" : "展开" }}
      </el-tag>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'MixinOperate',
  props: {
    operateList: {
      type: Array,
      default: () => []
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      otherButtonsShow: false
    }
  },
  computed: {
    comp_disabled() {
      // 可否
      return function(val) {
        switch (
          val.disabled //  isRowNoWillRev:没有将要审核的， isRowNoRevEd：没有已经处理的, idsNoRevEd:批量操作存在已处理的
        ) {
          case 'isRow':
            return !this.currentRow.id || (val.disabledFn ? val.disabledFn() : false)
          case 'isRowNoRevEd':
            return (
              this.currentRow.auditStatu >= 3 ||
              !this.currentRow.id ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'isRowNoWillRev':
            return (
              this.currentRow.auditStatu <= 2 ||
              !this.currentRow.id ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'isRowNoRevEds':
            return (
              this.currentRow.auditStatus >= 3 ||
              !this.currentRow.id ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'isRowNoWillRevs':
            return (
              this.currentRow.auditStatus <= 2 ||
              !this.currentRow.id ||
              (val.disabledFn ? val.disabledFn() : false)
            )

          case 'ids':
            return this.$attrs.ids.length === 0 || (val.disabledFn ? val.disabledFn() : false)
          case 'idsNoRevEd':
            return (
              this.$attrs.rows.some((item) => item.auditStatu >= 3) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'idsNoWillRev':
            return (
              this.$attrs.rows.some((item) => item.auditStatu <= 2) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'idsNoRevEds':
            return (
              this.$attrs.rows.some((item) => item.auditStatus >= 3) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'idsNoWillRevs':
            return (
              this.$attrs.rows.some((item) => item.auditStatus <= 2) ||
              this.$attrs.ids.length === 0 ||
              (val.disabledFn ? val.disabledFn() : false)
            )
          case 'searchPropProuduct':
            return !this.$attrs['search-form'].goodsCode
          default:
            return !!val.disabled
        }
      }
    }
  },
  watch: {},
  methods: {
    handleCommand(command) {
      command.itemOther.click(command.itemOther, command.item)
    }
  }
}
</script>

<style scoped>
</style>
