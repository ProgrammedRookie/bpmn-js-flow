<template>
  <div>
     <el-dialog
      :visible.sync="flag"
      title="配置任务执行者"
      width="45%"
      :before-close="handleClose"
      top="3%">
      <div>
        <el-form :model="form" label-width="80px" ref="form">
          <el-form-item label="部门类型">
            <el-radio-group v-model="form.type" @change="handleChangeRadio">
              <el-radio label="1">指定审核部门</el-radio>
              <el-radio label="2">申请人所属部门</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="审批部门">
            <el-select v-model="form.dept" clearable :disabled="disabledFlag" placeholder="请选择审批部门" style="width:80%">
              <el-option v-for="item in depts" :key="item.deptid" :label="item.deptname" :value="item.deptid"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="审批角色">
            <el-select v-model="form.role" clearable placeholder="请选择审批角色" style="width:80%">
              <el-option v-for="item in roles" :key="item.deptid" :label="item.rolename" :value="item.roleid"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="审批用户">
            <el-cascader v-model="form.user" clearable :props="props"  placeholder="请选择审批用户" style="width:80%"></el-cascader>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleClose">取 消</el-button>
        <el-button size="small" type="primary" @click="handleSaveAssignee">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
import axios from '../utils/http'
<script>
// import axios from 'axios'
export default {
  data () {
    return {
      flag: false,
      depts: [
        {
          'deptid': '1',
          'deptname': '研发部'
        },
        {
          'deptid': '2',
          'deptname': '销售部'
        }
      ],
      roles: [
        {
          'roleid': '1',
          'rolename': '系统管理员'
        },
        {
          'roleid': '2',
          'rolename': '网站管理员'
        }
      ],
      form: {
        type: '',
        dept: '',
        role: '',
        user: ''
      },
      rules: {
        type: [
          {
            required: true,
            message: '请选择部门类型',
            trigger: 'change'
          }
        ]
      },
      props: {
        lazy: true,
        lazyLoad (node, resolve) {
          // console.log('node', node)
          // console.log('res', resolve)
        }
      },
      disabledFlag: false
    }
  },
  props: {
    medeling: {
      type: Object,
      defaul: () => {
        return null
      }
    },
    element: {
      type: Object,
      default: () => {
        return null
      }
    },
    assignee: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 获取部门
      // axios.post('http://mall-zt.cn.utools.club/MallDept/findAll.mall', {}).then((res) => {
      //   this.depts = res.data.data
      // })
      //   .catch(() => {

      //   })
      // 获取角色
      // axios.post('http://mall-zt.cn.utools.club/MallRole/findAll.mall', {}).then((res) => {
      //   this.roles = res.data.data
      // })
      //   .catch(() => {

      //   })
    },
    handleChangeRadio (val) {
      if (val === '1') {
        this.form.dept = ''
        this.disabledFlag = true
      } else {
        this.disabledFlag = false
      }
    },
    handleClose () {
      this.flag = false
      this.form = {}
    },
    handleSaveAssignee () {
      console.log(this.$refs['form'])
      this.$refs['form'].validate((vaild) => {
        if (vaild) {
          this.save()
        } else {
          return false
        }
      })
    },
    save () {
      let assignee = '#DT_' + this.form.type + '#D_' + this.form.dept + '#R_' + this.form.role + '#U_' + this.form.user
      let properties = {}
      properties['assignee'] = assignee
      const medeling = this.medeling.get('modeling')
      medeling.updateProperties(this.element, properties)
      this.handleClose()
    }
  }
}
</script>

<style>
  .content-tag{
    display: flex;
  }
  .content-tag-style {
    margin-right: 5px
  }
</style>
