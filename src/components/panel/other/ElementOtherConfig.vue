<template>
  <div class="panel-tab-content">
    <div class="element-property">
      <div class="element-property-label">
        文档元素：
      </div>
      <div class="element-property-value">
        <el-input type="textarea" v-model="documentation" size="mini" resize="vertical" :autosize="{minRows: 2,maxRows: 4}" @change="updateDocumentation">
        </el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElementOtherConfig',
  data () {
    return {
      documentation: ''
    }
  },
  props: {
    id: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler (id) {
        console.log('id', id)
        if (id && id.length > 0) {
          const documentations = typeof window.bpmnInstances.bpmnElement.businessObject.documentation !== 'undefined' ? window.bpmnInstances.bpmnElement.businessObject.documentation : ''
          this.documentation = documentations && documentations.length > 0 ? documentations[0].text : ''
        } else {
          this.documentation = ''
        }
      }
    }
  },
  mounted () {
    console.log(this.type)
  },
  methods: {
    updateDocumentation () {
      !this.bpmnElement && (this.bpmnElement = window.bpmnInstances.elementRegistry.get(this.id))
      const documentation = window.bpmnInstances.bpmnFactory.create('bpmn:Documentation', { text: this.documentation })
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        documentation: [documentation]
      })
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
.element-property {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
}
.element-property-label {
  display: block;
  width: 90px;
  text-align: right;
  overflow: hidden;
  padding-right: 12px;
  line-height: 32px;
  font-size: 14px;
  box-sizing: border-box;
}
.element-property-value {
  flex: 1;
  line-height: 32px;
}
</style>
