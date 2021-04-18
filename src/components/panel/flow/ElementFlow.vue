<template>
  <div class="panel-tab-content">
    <el-form size="mini" label-suffix=" :" label-width="80px" :model="flowConditionForm">
      <el-form-item label="流转类型">
        <el-select v-model="flowConditionForm.type" @change="updateFlowType" style="width:100%">
          <el-option label="条件流转" value="condition"></el-option>
          <el-option label="普通流转路径" value="normal" />
          <el-option label="默认流转路径" value="default" />
        </el-select>
      </el-form-item>
      <el-form-item label="条件格式" v-if="flowConditionForm.type === 'condition'" key="condition">
        <el-select v-model="flowConditionForm.conditionType" style="width:100%">
          <el-option label="表达式" value="expression" />
          <el-option label="脚本" value="script" />
        </el-select>
      </el-form-item>
      <template v-if="flowConditionForm.conditionType === 'expression'">
        <el-form-item label="表单字段">
          <el-tag class="tag-style-class" @click="handleClickTag(item.value)" v-for="item in fieldLists" type="success"  size="small" :key="item.value">{{item.label}}</el-tag>
        </el-form-item>
        <el-form-item label="表达式">
          <el-input v-model="flowConditionForm.body" clearable @change="updateFlowCondition"></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ElementFlow',
  data () {
    return {
      flowConditionForm: {},
      fieldLists: [
        {
          label: '姓名',
          value: 'name',
          disabled: false
        },
        {
          label: '年龄',
          value: 'age',
          disabled: false
        }
      ]
    }
  },
  props: {
    businessObject: {
      type: Object,
      default: () => {
        return null
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
    businessObject: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.resetFlowCondition())
      }
    }
  },
  mounted () {
  },
  methods: {
    resetFlowCondition () {
      this.bpmnElement = window.bpmnInstances.bpmnElement
      this.bpmnElementSource = this.bpmnElement.source
      this.bpmnElementSourceRef = this.bpmnElement.businessObject.sourceRef
      if (this.bpmnElementSourceRef && this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        this.flowConditionForm = { type: 'default' }
      } else if (!this.bpmnElement.businessObject.conditionExpression) {
        this.flowConditionForm = { type: 'normal' }
      } else {
        const conditionExpression = this.bpmnElement.businessObject.conditionExpression
        this.flowConditionForm = { ...conditionExpression, type: 'condition' }
      }
    },
    updateFlowType (type) {
      if (type === 'condition') {
        const flowConditionRef = window.bpmnInstances.moddle.create('bpmn:FormalExpression')
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: flowConditionRef
        })
      }
      if (type === 'default') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: null
        })
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: this.bpmnElement
        })
      }
      if (this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: null
        })
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: null
        })
      }
    },
    updateFlowCondition () {
      const {body, conditionType} = this.flowConditionForm
      let condition
      if (conditionType === 'expression') {
        condition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body })
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { conditionExpression: condition })
    },
    handleClickTag (val) {
      const value = '${ ' + val + '   }'
      this.$set(this.flowConditionForm, 'body', value)
    }
  },
  beforeDestroy () {
    this.bpmnElement = null
    this.bpmnElementSource = null
    this.bpmnElementSourceRef = null
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
.tag-style-class {
  margin-right: 5px;
}
</style>
