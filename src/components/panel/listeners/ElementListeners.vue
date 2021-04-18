<template>
  <div class="panel-tab-content">
    <el-form size="mini" label-suffix=" : " ref="listenerFieldFormRef" label-width="100px">
      <el-form-item label="事件类型">
        <el-select @change="updateListenersEvent" v-model="listenerForm.event" style="width:100%">
          <el-option v-for="item in types" :key="item.value" :value="item.value" :label="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="监听器类型">
        <el-select v-model="listenerForm.listenerType" style="width:100%">
          <el-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :label="listenerTypeObject[i]" :value="i"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
         label="Java 类"
         v-if="listenerForm.listenerType === 'classListener'"
         key="listener-class">
        <el-input @change="updateListenersEvent" clearable v-model="listenerForm.class"></el-input>
      </el-form-item>
      <el-form-item
        label="表达式"
        v-if="listenerForm.listenerType === 'expressionListener'">
        <el-input clearable  @change="updateListenersEvent"  v-model="listenerForm.expression"></el-input>
      </el-form-item>
      <el-form-item
        label="代理表达式"
        v-if="listenerForm.listenerType === 'delegateExpressionListener'">
        <el-input clearable  @change="updateListenersEvent"  v-model="listenerForm.delegateExpression"></el-input>
      </el-form-item>
      <template v-if="listenerForm.listenerType === 'scriptListener'">
        <el-form-item
        label="脚本格式">
        <el-input clearable v-model="listenerForm.scriptFormat"></el-input>
      </el-form-item>
      <el-form-item label="脚本类型">
        <el-select v-model="listenerForm.scriptType" style="width:100%">
          <el-option label="内联脚本" value="inlineScript"></el-option>
          <el-option label="外部脚本" value="externalScript"></el-option>
        </el-select>
      </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ElementListeners',
  data () {
    return {
      types: [
        {
          label: 'start',
          value: 'start'
        },
        {
          label: 'end',
          value: 'end'
        }
      ],
      listenerForm: {
        'event': '',
        'listenerType': '',
        'class': '',
        'expression': '',
        'delegateExpression': '',
        'scriptFormat': '',
        'scriptType': ''
      },
      listenerTypeObject: {
        classListener: 'Java 类',
        expressionListener: '表达式',
        delegateExpressionListener: '代理表达式',
        scriptListener: '脚本'
      }
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
      handler (val) {
        val && val.length && this.$nextTick(() => this.resetListenersList())
      }
    }
  },
  mounted () {
    console.log(this.type)
  },
  methods: {
    resetListenersList () {
      this.bpmnElement = window.bpmnInstances.bpmnElement
      this.otherExtensionList = []
      if (typeof this.bpmnElement.businessObject !== 'undefined' && typeof this.bpmnElement.businessObject.extensionElements !== 'undefined' && typeof this.bpmnElement.businessObject.extensionElements.values !== 'undefined') {
        this.bpmnElementListeners = this.bpmnElement.businessObject.extensionElements.values.filter(ex => {
          if (ex.$type !== 'activiti:TaskListener') {
            this.otherExtensionList.push(ex)
          }
          return ex.$type === 'activiti:TaskListener'
        })
      } else {
        this.bpmnElementListeners = []
      }
      const listeners = this.bpmnElementListeners.map(listener => {
        let listenerType
        if (listener.class) listenerType = 'classListener'
        if (listener.expression) listenerType = 'expressionListener'
        if (listener.delegateExpression) listenerType = 'delegateExpressionListener'
        if (listener.script) listenerType = 'scriptListener'
        return {
          ...JSON.parse(JSON.stringify(listener)),
          ...(typeof listener.script !== 'undefined' ? listener.script : {}),
          listenerType: listenerType
        }
      })
      if (listeners.length > 0) {
        listeners.map(res => {
          Object.keys(res).forEach((key) => {
            this.$set(this.listenerForm, key, res[key])
          })
        })
      } else {
        Object.keys(this.listenerForm).forEach((key) => {
          this.$set(this.listenerForm, key, '')
        })
      }
    },
    updateListenersEvent () {
      const listenerObject = window.bpmnInstances.moddle.create('activiti:TaskListener', this.initListenerObject(this.listenerForm))
      this.updateElementExtensions(listenerObject)
    },
    updateElementExtensions (options) {
      const extensions = window.bpmnInstances.moddle.create('bpmn:ExtensionElements', {
        values: this.otherExtensionList.concat(options)
      })
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      })
    },
    initListenerObject (options) {
      const listenerObj = Object.create(null)
      listenerObj.event = options.event
      switch (options.listenerType) {
        case 'scriptListener':
          listenerObj.script = this.initScriptObject()
          break
        case 'expressionListener':
          listenerObj.expression = options.expression
          break
        case 'delegateExpressionListener':
          listenerObj.delegateExpression = options.delegateExpression
          break
        default:
          listenerObj.class = options.class
      }
      return listenerObj
    },
    initScriptObject () {
      const { scriptType, scriptFormat, value, resource } = this.listenerForm
      const scriptConfig = scriptType === 'inlineScript' ? { scriptFormat, value } : { scriptFormat, resource }
      return window.bpmnInstances.moddle.create('activiti:Script', scriptConfig)
    }
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
