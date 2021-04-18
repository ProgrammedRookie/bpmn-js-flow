<template>
  <div class="panel-tab-content">
    <el-form size="mini" label-width="80px" label-suffix=" : ">
      <el-form-item label="部门类型">
        <el-select v-model="userTaskForm.type" @change="hadleChangeDept">
          <el-option v-for="item in types" :key="item.id" :label="item.label" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="审批部门">
        <el-select multiple @change="updateElementTask('dept')" v-model="userTaskForm.dept" :disabled="deptFlag">
          <el-option v-for="item in depts" :key="item.id" :label="item.label" :value="item.id" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="审批角色">
        <el-select multiple @change="updateElementTask('role')" v-model="userTaskForm.role">
          <el-option v-for="item in roles" :key="item.id" :label="item.label" :value="item.id" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="审批用户">
        <el-cascader :props="{multiple: true,checkStrictly:false,emitPath:false,label:'label',value:'value'}" @change="updateElementTask('user')" v-model="userTaskForm.user" :options="options"></el-cascader>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ElementForm',
  data () {
    return {
      deptFlag: false,
      taskAttr: {
        'type': '#DT_',
        'dept': '#D_',
        'role': '#R_',
        'user': '#U_'
      },
      defaultTaskForm: {
        type: '',
        dept: '',
        role: '',
        user: ''
      },
      userTaskForm: {},
      depts: [
        {
          label: '研发部',
          id: '1'
        },
        {
          label: '销售部',
          id: '2'
        }
      ],
      roles: [
        {
          label: '组长',
          id: '1'
        },
        {
          label: '领导',
          id: '2'
        }
      ],
      options: [
        {
          value: 'zhinan',
          label: '指南',
          children: [
            {
              value: 'shejiyuanze',
              label: '设计原则',
              children: [
                {
                  value: 'yizhi',
                  label: '一致'
                },
                {
                  value: 'fankui',
                  label: '反馈'
                }
              ]
            }
          ]
        }
      ],
      types: [
        {
          id: '1',
          label: '指定审核部门'
        },
        {
          id: '2',
          label: '申请人所在部门'
        }
      ]
    }
  },
  props: {
    id: {
      type: String,
      default: () => {
        return ''
      }
    },
    type: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler () {
        this.bpmnElement = window.bpmnInstances.bpmnElement
        this.$nextTick(() => this.resetTaskForm())
      }
    }
  },
  mounted () {
    console.log(this.id)
    console.log(this.type)
  },
  methods: {
    resetTaskForm () {
      for (let key in this.defaultTaskForm) {
        let value
        this.$set(this.userTaskForm, key, value)
      }
    },
    hadleChangeDept (val) {
      if (val === '1') {
        this.deptFlag = false
      } else {
        this.userTaskForm.dept = ''
        this.deptFlag = true
      }
      this.updateElementTask('type')
    },
    updateElementTask (key) {
      if (key === 'type') {
        let str = ''
        if (typeof this.userTaskForm['type'] !== 'undefined') {
          str = this.userTaskForm['type']
        }
        let type = '#DT_' + str + ','
        this.taskAttr[key] = type
      } else if (key === 'dept') {
        let str = ''
        if (typeof this.userTaskForm['dept'] !== 'undefined') {
          str = this.userTaskForm['dept']
        }
        let dept = '#D_' + str + ','
        this.taskAttr[key] = dept
      } else if (key === 'role') {
        let str = ''
        if (typeof this.userTaskForm['role'] !== 'undefined') {
          str = this.userTaskForm['role']
        }
        let role = '#R_' + str + ','
        this.taskAttr[key] = role
      } else if (key === 'user') {
        let str = ''
        if (typeof this.userTaskForm['user'] !== 'undefined') {
          str = this.userTaskForm['user']
        }
        let user = '#U_' + str + ','
        this.taskAttr[key] = user
      }
      let assignee = ''
      Object.keys(this.taskAttr).forEach(res => {
        assignee = assignee + this.taskAttr[res]
      })
      let temp = {'assignee': assignee}
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, temp)
    }
  },
  beforeDestroy () {
    this.bpmnElement = null
  }
}
</script>

<style>
.panel-tab-content {
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid #eeeeee;
  padding: 8px 16px;
}
</style>
