<template>
  <div class="panel-tab-content">
    <el-form size="mini" label-suffix=" : " label-width="80px">
      <el-form-item label="回路特性">
        <el-select v-model="loopCharacteristics" style="width:100%"  @change="changeLoopCharacteristicsType">
          <el-option v-for="item in lists" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <template v-if=" loopCharacteristics === 'ParallelMultiInstance' || loopCharacteristics === 'SequentialMultiInstance'  ">
        <el-form-item label="循环基数" key="loopCardinality">
          <el-input v-model="loopInstanceForm.loopCardinality" clearable @change="updateLoopCardinality"></el-input>
        </el-form-item>
        <el-form-item label="集合" key="collection">
          <el-input v-model="loopInstanceForm.collection" clearable @change="updateLoopBase"></el-input>
        </el-form-item>
        <el-form-item label="元素变量" key="elementVariable">
          <el-input v-model="loopInstanceForm.elementVariable" clearable @change="updateLoopBase"></el-input>
        </el-form-item>
        <el-form-item label="完成条件" key="completionCondition">
          <el-input v-model="loopInstanceForm.completionCondition" clearable @change="updateLoopCondition"></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ElementMultiInstance',
  data () {
    return {
      loopCharacteristics: '',
      loopInstanceForm: {},
      defaultLoopInstanceForm: {
        completionCondition: '',
        loopCardinality: '',
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
      },
      lists: [
        {
          label: '无',
          value: 'Null'
        },
        {
          label: '循环事件',
          value: 'StandardLoop'
        },
        {
          value: 'ParallelMultiInstance',
          label: '并行多实例'
        },
        {
          value: 'SequentialMultiInstance',
          label: '串行多实例'
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
      handler (val) {
        this.bpmnElement = window.bpmnInstances.bpmnElement
        this.getElementLoop(val)
      }
    }
  },
  mounted () {
  },
  methods: {
    getElementLoop (businessObject) {
      if (!businessObject.loopCharacteristics) {
        this.loopCharacteristics = 'Null'
        this.loopInstanceForm = {}
        return
      }
      if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
        this.loopCharacteristics = 'StandardLoop'
        this.loopInstanceForm = {}
        return
      }
      if (businessObject.loopCharacteristics.isSequential) {
        this.loopCharacteristics = 'SequentialMultiInstance'
      } else {
        this.loopCharacteristics = 'ParallelMultiInstance'
      }
      let completionConditionValue = ''
      if (typeof businessObject.loopCharacteristics.completionCondition !== 'undefined' && typeof businessObject.loopCharacteristics.completionCondition.body !== 'undefined') {
        completionConditionValue = businessObject.loopCharacteristics.completionCondition['body']
      }
      let loopCardinalityValue = ''
      if (typeof businessObject.loopCharacteristics.loopCardinality !== 'undefined' && typeof businessObject.loopCharacteristics.loopCardinality.body !== 'undefined') {
        loopCardinalityValue = businessObject.loopCharacteristics.loopCardinality['body']
      }
      // 合并配置
      this.loopInstanceForm = {
        ...this.defaultLoopInstanceForm,
        ...businessObject.loopCharacteristics,
        completionCondition: completionConditionValue,
        loopCardinality: loopCardinalityValue
      }
      this.multiLoopInstance = window.bpmnInstances.bpmnElement.businessObject.loopCharacteristics
      if (
        businessObject.loopCharacteristics.extensionElements &&
        businessObject.loopCharacteristics.extensionElements.values &&
        businessObject.loopCharacteristics.extensionElements.values.length
      ) {
        this.$set(this.loopInstanceForm, 'timeCycle', businessObject.loopCharacteristics.extensionElements.values[0].body)
      }
    },
    changeLoopCharacteristicsType (type) {
      // 取消多实例配置
      if (type === 'Null') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { loopCharacteristics: null })
        return
      }
      // 配置循环
      if (type === 'StandardLoop') {
        const loopCharacteristicsObject = window.bpmnInstances.moddle.create('bpmn:StandardLoopCharacteristics')
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          loopCharacteristics: loopCharacteristicsObject
        })
        this.multiLoopInstance = null
        return
      }
      // 时序
      if (type === 'SequentialMultiInstance') {
        this.multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: true })
      } else {
        this.multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics')
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        loopCharacteristics: this.multiLoopInstance
      })
    },
    // 循环基数
    updateLoopCardinality (val) {
      let loopCardinality = null
      if (val && val.length) {
        loopCardinality = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: val })
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { loopCardinality })
    },
    updateLoopBase () {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        collection: this.loopInstanceForm.collection || null,
        elementVariable: this.loopInstanceForm.elementVariable || null
      })
    },
    updateLoopCondition (condition) {
      let completionCondition = null
      if (condition && condition.length) {
        completionCondition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', {body: condition})
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        completionCondition
      })
    }
  },
  beforeDestroy () {
    this.multiLoopInstance = null
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
