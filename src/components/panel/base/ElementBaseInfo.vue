<template>
  <div class="panel-tab-content">
    <el-form size="mini" label-width="80px" label-suffix=" : ">
      <el-form-item label="ID">
        <el-input v-model="elementBaseInfo.id"  @change="updateBaseInfo('id')" clearable  :disabled="idEditDisabled || elementBaseInfo.$type === 'bpmn:Process'" ></el-input>
      </el-form-item>
      <el-form-item label="节点名称">
        <el-input v-model="elementBaseInfo.name" clearable  @change="updateBaseInfo('name')"></el-input>
      </el-form-item>
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <el-form-item label="版本标签">
          <el-input v-model="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')"></el-input>
        </el-form-item>
        <el-form-item label="可执行">
          <el-switch v-model="elementBaseInfo.isExcutable" active-text="是" inactive-text="否" @change="updateBaseInfo('isExcutable')"></el-switch>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'ElementBaseInfo',
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
    },
    idEditDisabled: {
      type: Boolean,
      default: () => {
        return true
      }
    }
  },
  data () {
    return {
      elementBaseInfo: {}
    }
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function (val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo())
        }
      }
    }
  },
  mounted () {

  },
  methods: {
    resetBaseInfo () {
      this.bpmnElement = window.bpmnInstances.bpmnElement
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject))
    },
    updateBaseInfo (key) {
      const attrObj = Object.create(null)
      attrObj[key] = this.elementBaseInfo[key]
      if (key === 'id') {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: this.elementBaseInfo[key] }
        })
      } else {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj)
      }
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
