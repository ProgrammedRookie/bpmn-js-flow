<template>
    <div class="process-panel-container" style="width:400px">
      <div class="process-panel-header"><i class="el-icon-flag"></i>{{processTitle}}</div>
      <div class="process-panel-collapse">
        <el-collapse v-model="activeTab">
          <el-collapse-item name="base">
            <div slot="title" class="panel-tab-title"><i class="el-icon-info"></i>常规</div>
            <element-base-info :type="elementType" :business-object="elementBusinessObject" :id-edit-disabled="idEditDisabled"></element-base-info>
          </el-collapse-item>
          <el-collapse-item name="condition" v-if="conditionFormVisible" key="condition">
            <div slot="title" class="panel-tab-title"><i class="el-icon-star-on"></i>流转条件</div>
            <element-flow :business-object="elementBusinessObject" :type="elementType"></element-flow>
          </el-collapse-item>
          <el-collapse-item name="condition" v-if="formVisible" key="form">
            <div slot="title" class="panel-tab-title"><i class="el-icon-s-order"></i>表单</div>
            <element-form :id="elementId" :type="elementType"></element-form>
          </el-collapse-item>
          <el-collapse-item name="task" v-if="elementType === 'UserTask'" key="task">
            <div slot="title" class="panel-tab-title"><i class="el-icon-s-claim"></i>任务</div>
            <element-user-task id="elementId" :type="elementType"></element-user-task>
          </el-collapse-item>
          <el-collapse-item name="multiInstance" v-if="elementType === 'UserTask'" key="multiInstance">
            <div slot="title" class="panel-tab-title"><i class="el-icon-s-help"></i>多实例</div>
            <element-multi-instance  :business-object="elementBusinessObject" :type="elementType"></element-multi-instance>
          </el-collapse-item>
          <el-collapse-item name="listeners" v-if="elementType === 'UserTask'" key="listeners">
            <div slot="title" class="panel-tab-title"><i class="el-icon-message-solid"></i>监听器</div>
            <element-listeners :id="elementId" :type="elementType" ></element-listeners>
          </el-collapse-item>
          <el-collapse-item name="extensions" key="extensions">
            <div slot="title" class="panel-tab-title"><i class="el-icon-circle-plus"></i>扩展属性</div>
            <element-properties :id="elementId" :type="elementType"></element-properties>
          </el-collapse-item>
          <el-collapse-item name="other" key="other">
            <div slot="title" class="panel-tab-title"><i class="el-icon-s-promotion"></i>其他</div>
            <element-other-config :id="elementId" />
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
</template>

<script>
import ElementBaseInfo from './base/ElementBaseInfo'
import ElementForm from './form/ElementForm'
import ElementUserTask from './task/ElementUserTask'
import ElementMultiInstance from './instance/ElementMultiInstance'
import ElementOtherConfig from './other/ElementOtherConfig'
import ElementListeners from './listeners/ElementListeners'
import ElementProperties from './properties/ElementProperties'
import ElementFlow from './flow/ElementFlow'
export default {
  name: 'ProcessPanel',
  data () {
    return {
      activeTab: 'base',
      elementId: '',
      elementType: '',
      elementBusinessObject: {},
      conditionFormVisible: false,
      formVisible: false
    }
  },
  components: {
    ElementBaseInfo,
    ElementForm,
    ElementUserTask,
    ElementMultiInstance,
    ElementOtherConfig,
    ElementListeners,
    ElementProperties,
    ElementFlow
  },
  props: {
    bpmnModeler: {
      type: Object,
      default: () => {
        return null
      }
    },
    idEditDisabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    processTitle: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  created () {
    this.initModels()
  },
  methods: {
    initModels () {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10)
        return
      }
      if (this.timer) clearTimeout(this.timer)
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get('modeling'),
        moddle: this.bpmnModeler.get('moddle'),
        eventBus: this.bpmnModeler.get('eventBus'),
        bpmnFactory: this.bpmnModeler.get('bpmnFactory'),
        elementRegistry: this.bpmnModeler.get('elementRegistry'),
        replace: this.bpmnModeler.get('replace'),
        selection: this.bpmnModeler.get('selection')
      }
      this.getActiveElement()
    },
    getActiveElement () {
      this.processElement = window.bpmnInstances.elementRegistry.find(el => el.type === 'bpmn:Process')
      this.initFormOnChanged(this.processElement)
      this.bpmnModeler.on('selection.changed', ({ newSelection }) => {
        if (newSelection && newSelection.length) {
          const element = newSelection[0]
          this.initFormOnChanged(element)
        } else {
          this.initFormOnChanged(this.processElement)
        }
      })
      this.bpmnModeler.on('element.changed', ({ element }) => {
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element)
        }
      })
    },
    initFormOnChanged (element) {
      console.log(`
        ----------
        select element changed:
          id:  ${element.id}
          type:  ${element.businessObject.$type}
        ----------
        `)
      // console.log("businessObject: ", element.businessObject);
      window.bpmnInstances.bpmnElement = element
      this.bpmnElement = element
      this.elementId = element.id
      this.elementType = element.type.split(':')[1]
      this.elementBusinessObject = JSON.parse(JSON.stringify(element.businessObject))
      this.conditionFormVisible = !!(this.elementType === 'SequenceFlow' && element.source && element.source.type.indexOf('StartEvent') === -1)
      this.formVisible = this.elementType === 'UserTask' || this.elementType === 'StartEvent'
    },
    beforeDestroy () {
      window.bpmnInstances = null
    }
  }
}
</script>

<style>
.process-panel-header {
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}
.process-panel-container{
  box-sizing: border-box;
  padding: 0 8px;
  border-left: 1px solid #eeeeee;
  box-shadow: 0 0 8px #cccccc;
  height: 100%;
}
.process-panel-collapse {
  overflow-y: auto;
  max-height: 90%;
}
.process-panel-collapse::-webkit-scrollbar{
  width:10px;
  height:10px;
}
.process-panel-collapse::-webkit-scrollbar-thumb{
  background-color:rgba(94, 88, 88, 0.05);
  border-radius:10px;
  -webkit-box-shadow:inset1px1px0rgba(0,0,0,.1);
}
.process-panel-collapse::-webkit-scrollbar-thumb:hover{
  background-color:rgba(0,0,0,.4);
  -webkit-box-shadow:inset1px1px0rgba(0,0,0,.1);
}
.panel-tab-title {
  font-weight: 600;
  padding: 0 8px;
  font-size: 1.1em;
  line-height: 1.2em;
}
.panel-tab-title i {
   margin-right: 8px;
   font-size: 1.2em;
}

</style>
