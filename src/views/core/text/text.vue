<template>
  <div>
    <mix-operate
      :style="{'margin-top':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :current-row="currentRow"
      :back="false"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <editor-bar v-model="content" :is-clear="isClear" @change="change" />
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import EditorBar from './textcontent'
import { getText, addText, updateText } from '@/api/core/text'
export default {
  name: 'TextInfo',
  components: { EditorBar },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      isClear: false,
      content: '',
      currentRow: { id: '' }, // 当前选择数据
      searchList: [ // 搜索栏项目
        { title: 'ID', prop: 'id', type: 'text', width: '300px' }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 24, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        'pageNum': 1,
        'pageSize': 10
      },
      operateList: [ // 操作栏项目
        // { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:about:us'], width: 80 },
        // { title: '更新', show: true, prop: 'insert', click: this.formSave, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:about:us'], width: 80 }
        { title: '更新', show: true, prop: 'edit', click: this.formSave, loading: false, icon: 'el-icon-edit-outline', type: 'primary', permission: ['core:about:us'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '删除', prop: 'delete', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', permission: ['core:about:us'], width: 80 }
      ],
      operateItem: { title: '', prop: '', icon: '' },
      formShow: false,
      tableData: {
        records: [],
        total: 0
      },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, formShow: true },
        { title: '内容', prop: 'about', show: true, type: 'text', width: 500, formShow: true },
        { title: '创建时间', prop: 'createTime', show: true, type: 'datetime', formShow: true }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.search()
  },
  methods: {
    change(e) {

    },
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search() {
      // const searchForm = this.deepClone(this.searchForm)
      // Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      //
      // this.Mixin_loading = true
      getText().then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          this.tableData.records = res.data
          this.content = res.data[0].about
          this.Mixin_loading = false
        }
      }).catch(err => {
        this.Mixin_loading = false
        throw err
      })
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      this.operateItem.loading = true
      console.log('this.currentRow:', this.currentRow)
      this.formShow = true
    },
    formSave(e) { // 提交回调处理
      switch (e.prop) {
        case 'detail': // 详情
          this.formShow = false
          break
        case 'insert': // 新增
          addText(e).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
        case 'edit': // 修改

          updateText({ id: 2, about: this.content }).then(res => {
            this.message(res)
            if (res.code === 200) {
              this.formShow = false
            }
          })
          break
      }
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    }
  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
</style>

