<template>
  <div style="margin:24px">
    <el-form inline size="mini">
      <el-form-item>
        <!--       v-permission="['ums:menu:saveOrUpdate']" -->
        <el-button type="primary" icon="el-icon-plus" :disabled="!!!currentRow.id" @click="formType='insertM';formShow=true">追加菜单(M)</el-button>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-edit" :disabled="!currentRow.id || currentRow.id===-1" @click="formType='edit';formShow=true">修改权限
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!!!currentRow.id" type="danger" icon="el-icon-minus" @click="del(currentRow)">删除权限
        </el-button>
      </el-form-item>
    </el-form>
    <el-tabs type="border-card" @tab-click="tabClick">
      <el-tab-pane v-for="(menu,index) in treeMenus" :key="index" :label="menu.moduleName" :module="menu.module">
        <el-row>
          <el-col :span="6">
            <el-table
              ref="singleTable"
              height="600"
              :data="menu.nodes"
              row-key="id"
              border
              highlight-current-row
              default-expand-all
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
              @row-click="menuClick"
            >
              <el-table-column
                label="权限名称"
                header-align="center"
              >
                <template slot-scope="{row}">
                  <i :class="row.menuEntity.icon" />
                  {{ row.label }}
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :offset="1" :span="17">
            <!--基础属性-->
            <BaseProps :base-props="baseProps" />
            <!--按钮权限-->
            <Buttons
              :current="currentRow"
              :buttons="buttons"
              @addButton="formType='addButton';formShow=true"
              @editButton="formType='editButton';currentRow=$event;formShow=true"
              @delButton="del"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <!--    Form栏目  -->
    <el-dialog
      :title="`${formTypeName}-${['insertM','insertD','addButton'].includes(formType)?'添加':'修改'}`"
      :visible.sync="formShow"
    >
      <mix-form-ums :form-show="formShow" :current-row="currentRow" :form-data="table_title_arr" :form-type="formType" @close="formClose" @formSave="formSave" />
    </el-dialog>
  </div>
</template>

<script>
import { queryAllMenus, saveOrUpdate, deleteMenu } from '@/api/ums/menu'
import BaseProps from '@/views/admin/components/menu/BaseProps'
import Buttons from '@/views/admin/components/menu/Buttons'
import MixinGlobal from '@/components/MixinGlobal'

export default {
  name: 'Menu',
  components: { Buttons, BaseProps },
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: {},
      baseProps: {},
      buttons: [],
      formShow: false,
      formType: '',
      treeMenus: [],
      table_title_arr: [ // 表头字段
        { title: '主键', prop: 'id', show: true, disabled: true, type: 'text', width: 80, formShow: true, addType: ['D', 'M', 'B'] },
        { title: '模块', prop: 'module', show: true, type: 'select', disabled: false, selectData: 'module_arr', addDisabled: true, butDisabled: true, formShow: true, addType: ['D', 'M', 'B'], exclude: this.exclude },
        { title: '类型', prop: 'type', show: true, type: 'select', selectData: 'module_type', formShow: true, addType: ['D', 'M', 'B'], disabled: true },
        {
          title: '名称', prop: 'title', show: true, type: 'text', formShow: true, addType: ['M', 'D', 'B'],
          rule: [
            { required: true, message: '请输入组织名称', trigger: 'blur', formShow: ['D', 'M', 'B'] },
            { min: 2, max: 10, message: '组织名称长度2-10个字', trigger: 'blur', formShow: ['D', 'M', 'B'] }
          ]
        },
        { title: '路径', prop: 'path', show: true, type: 'text', inputGui: 'firstSlash', formShow: true, addType: ['D', 'M', 'B'], butDisabled: true,
          rule: [
            { required: true, message: '请输入路径', trigger: 'blur', formShow: ['D', 'M', 'B'] },
            { pattern: /(^\/)/, message: '要以/开头', trigger: 'blur', formShow: ['D'] },
            { pattern: /^(?!(\/\/))/, message: '不能以//开头', trigger: 'blur', formShow: ['D'] },
            { pattern: /^(?!(\/))/, message: '不用/开头', trigger: 'blur', formShow: ['M', 'B'] },
            { min: 2, max: 30, message: '长度至少大于2', trigger: 'blur', formShow: ['D', 'M', 'B'] }
          ]
        }, // 头部自动添加'/'
        { title: '图标', prop: 'icon', show: true, type: 'text', formShow: true, addType: ['D', 'M'] },
        { title: '排序', prop: 'sort', show: true, type: 'text', formShow: true, addType: ['D', 'M', 'B'] },
        { title: '总是展开', prop: 'alwaysShow', show: true, type: 'if_type', defaultValue: 0, width: 80, formShow: true, addType: ['M', 'D'] },
        { title: '不缓存', prop: 'noCache', show: true, type: 'if_type', defaultValue: 0, width: 80, formShow: true, addType: ['M'] },
        { title: '父级', prop: 'parentId', show: true, type: 'cascader', dataArr: this.treeMenusCascade, width: 80, formShow: true, addType: ['D', 'M'] },
        { title: '隐藏标识', prop: 'hidden', show: true, type: 'if_type', defaultValue: 0, width: 80, formShow: true, addType: ['D', 'M'] },
        { title: '面包屑中显示', prop: 'breadcrumb', show: true, type: 'if_type', defaultValue: 1, width: 160, formShow: true, addType: ['D', 'M'] },
        { title: '固定tab栏', prop: 'affix', show: true, type: 'if_type', defaultValue: 0, width: 100, formShow: true, addType: ['D', 'M'] },
        { title: '权限标识', prop: 'perms', show: true, type: 'text', formShow: true, addType: ['B', 'M'] },
        { title: '组件', prop: 'component', show: true, type: 'text', formShow: true, addType: ['M'] },
        { title: '组件Name', prop: 'name', show: true, type: 'text', inputGui: 'firstUpcase', formShow: true, addType: ['M'] }, // 首字母大写
        { title: '重定向', prop: 'redirect', show: true, type: 'text', placeholder: '不开启，暂时记录', disabled: true, formShow: true, addType: ['M'] }
      ]
    }
  },
  computed: {
    formTypeName() {
      const obj = { D: '目录', M: '菜单', B: '按钮', insertD: '目录', insertM: '菜单', addButton: '按钮', edit: '菜单', editButton: '按钮' }
      if (this.currentRow.id === -1) {
        return obj[this.currentRow.menuEntity.type]
      }
      return obj[this.formType]
    }
  },
  created() {
    this.queryAllMenus()
  },
  methods: {
    tabClick(e) {
      this.$refs.singleTable.map(item => item.setCurrentRow())
      this.currentRow = { id: -1, menuEntity: { title: this.MenuGetPropName('module_arr', e.$attrs.module), type: 'D', module: e.$attrs.module }}
      this.baseProps = this.currentRow.menuEntity

      // this.currentRow = { id: null }
    },
    exclude() {
      return this.treeMenus.map(item => item.module)
    },
    queryAllMenus() {
      queryAllMenus().then(res => {
        this.treeMenus = res.data
        let result = []
        if (this.currentRow.id) {
          this.treeMenus.some(item =>
            item.nodes.some(itemNode => {
              const resultArr = itemNode.children.filter(itemChild => itemChild.id === this.currentRow.id)
              if (resultArr.length > 0) {
                result = resultArr
                return true
              }
            })
          )
        }
        if (result.length > 0) {
          setTimeout(() => {
            this.$refs.singleTable.map(item => item.setCurrentRow(result[0]))
            this.menuClick(result[0])
          }, 0)
        }
      })
    },
    treeMenusCascade() {
      if (this.treeMenus.length > 0) {
        const temp = this.treeMenus.map(item => (
          {
            value: item.nodes[0].id,
            label: item.moduleName,
            children: this.formatChildren(item.nodes, this.currentRow.id ? (this.currentRow.menuEntity.module !== item.module) : true),
            disabled: true
          }))
        if (this.formTypeName === '目录') {
          return [{ value: -1, label: '根目录', children: null }]
        }
        //
        return temp
      }
    },
    formatChildren(data, disabled) {
      if (typeof data === 'object') {
        return (data.map(item => ({
          value: item.id,
          label: item.label,
          disabled: disabled,
          children: this.formatChildren(item.children, disabled)
        })))
      } else {
        return null
      }
      // else if (typeof data.children === 'undefined') {
      //   return (data.map(item => ({
      //     value: item.id,
      //     label: item.label,
      //     disabled: disabled
      //   })))
      // }
    },
    menuClick(row) {
      this.currentRow = row
      this.baseProps = row.menuEntity
      this.buttons = row.buttons
    },
    formSave(form) {
      const temp = this.deepClone(form)

      if (temp.parentId === -1) { // 添加目录
        // delete form.parentId
        this.$set(temp, 'parentId', 0)
      }
      this.$set(temp, 'moduleName', this.MenuGetPropName('module_arr', form.module))

      saveOrUpdate(temp).then(res => {
        this.formShow = false

        if (res.code === 200) {
          this.$message.success('操作成功')
          this.queryAllMenus()
        } else {
          this.$message.error(res.message)
        }
      })
    },
    del(e, name = '菜单') {
      this.$confirm(`此操作将永久删除${name}「${e.label}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu({ id: e.id }).then(res => {
          this.queryAllMenus()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    formClose() {}
  }
}
</script>

<style scoped>

.buttons-ul li {
  width: 40%;
  margin-bottom: 5px;
}

.buttons-flex {
  display: flex;
  justify-content: space-between;
}
</style>
