<template>
  <div>
    <div class="btns">
      <el-button-group>
        <el-button size="mini" @click="save">保存</el-button>
        <el-button size="mini" @click="processZoomIn()">放大</el-button>
        <el-button size="mini" @click="processZoomout()" >缩小</el-button>
        <el-button size="mini" @click="rocessReZoom()">重置</el-button>
      </el-button-group>
    </div>
    <div>
      <div class="containers" ref="content">
       <div class="canvas" ref="canvas"></div>
       <process-panel :bpmn-modeler="bpmnModeler" :process-title="name"  class="panel"></process-panel>
       <!--弃用-->
       <!-- <div id="js-properties-panel" class="panel"></div> -->
      </div>
      <!--弃用-->
      <!-- <conditional ref="conditional" :medeling="bpmnModeler" :element="element" :val="val"></conditional>
      <change-task-user ref="taskUser" :medeling="bpmnModeler" :element="element" :assignee="defaultTrees"></change-task-user> -->
    </div>
  </div>
</template>

<script>
// import propertiesPanelModule from 'bpmn-js-properties-panel'
// import costomRenderer from './costomRenderer'
// import costomPalettle from './costomPalettle'
// import axios from '../utils/http'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import customTranslate from './customTranslate/customTranslate'
import templateXml from '../mock/template'
import activitiModdle from './data/activiti.json'
import conditional from './part/conditional'
import changeTaskUser from './part/changeTaskUser'
import processPanel from './panel/processPanel'

export default {
  name: 'basic',
  data () {
    return {
      bpmnModeler: null,
      container: null,
      canvas: null,
      initTemplate: '',
      initData: null,
      element: null,
      conditionFlag: false,
      defaultTrees: [],
      val: '',
      name: '请假申请',
      defaultZoom: 1
    }
  },
  components: {
    conditional,
    changeTaskUser,
    processPanel
  },
  methods: {
    // 初始化
    init () {
      let customTranslateModule = {
        translate: [ 'value', customTranslate ]
      }
      this.container = this.$refs.content
      const canvas = this.$refs.canvas
      this.bpmnModeler = new BpmnModeler({
        container: canvas,
        propertiesPanel: {
          parent: '#js-properties-panel'
        },
        additionalModules: [
          // 左边工具栏以及节点
          propertiesProviderModule,
          customTranslateModule
          // costomRenderer,
          // costomPalettle
        ],
        moddleExtensions: {
          activiti: activitiModdle
        }
      })
      this.createNewDiagram()
    },
    // 获取流程图
    createNewDiagram () {
      let xml = this.initTemplate
      this.bpmnModeler.importXML(xml, (err) => {
        if (err) {
          console.info(err)
        } else {
          // this.successBpmn()
        }
      })
    },
    // 右侧面板更改事件类型
    successBpmn () {
      const minDao = require('min-dom')
      const container = this.bpmnModeler.get('propertiesPanel')._container
      minDao.delegate.bind(container, 'input', 'click', (e) => {
        this.handleChange(e)
      })
      this.addModelerListener()
    },
    // 弹出框
    handleChange (e) {
      // 用户任务
      if (e.delegateTarget.id === 'camunda-assignee') {
        const propertiesPanel = this.bpmnModeler.get('propertiesPanel')
        const entries = propertiesPanel._current.groups.details.entries
        if (typeof entries !== 'undefined') {
          entries.map(res => {
            this.defaultTrees = res.oldValues['assignee'].split(',')
          })
        }
        this.$refs.taskUser.flag = true
      }
      // 条件表达式
      if (e.delegateTarget.id === 'cam-condition') {
        const propertiesPanel = this.bpmnModeler.get('propertiesPanel')
        const entries = propertiesPanel._current.groups.details.entries
        if (typeof entries !== 'undefined') {
          entries.map(res => {
            this.val = res.oldValues['condition'] !== '' ? res.oldValues['condition'] : ''
          })
        }
        this.$refs.conditional.dialogVisible = true
      }
    },
    addModelerListener () {
      const eventBus = this.bpmnModeler.get('eventBus')
      const eventTypes = ['element.click', 'element.changed', 'element.updateLabel']
      eventTypes.forEach((eventType) => {
        eventBus.on(eventType, (e) => {
          if (!e || e.element.type === 'bpmn:Process') return
          if (eventType === 'element.changed') {
            this.element = e.element
          } else if (eventType === 'element.click') {
            this.element = e.element
          } else if (eventType === 'element.updateLabel') {
          }
        })
      })
    },
    // 保存流程图
    save () {
      this.bpmnModeler.saveXML({format: true}, (err, data) => {
        if (err) {
          console.log(err)
        } else {
          this.bpmnModeler.saveSVG({format: true}, (err, svg) => {
            if (err) {

            } else {
              this.doSave(data, svg)
            }
          })
        }
      })
    },
    doSave (xml, svgXml) {
      // let params = {
      //   'flow_xml': xml,
      //   'svg_xml': svgXml
      // }
      console.log(xml)
      // axios.post('http://mall-zt.cn.utools.club/myactiviti/model/15001/save', params)
      //   .then(res => {
      //     console.log(res)
      //   })
      //   .catch(err => {
      //     console.log(err)
      //   })
    },
    // 重置
    rocessReZoom () {
      this.defaultZoom = 1
      this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
    },
    // 放大
    processZoomIn (zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100
      if (newZoom > 4) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
      }
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    // 缩小
    processZoomout (zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100
      if (newZoom < 0.2) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
      }
      this.defaultZoom = newZoom
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    }
  },
  mounted () {
    let processId = new Date().getTime()
    this.initTemplate = templateXml.initTemplate(processId)
    this.init()
  }
}
</script>
<style scoped>
  .btns{
    margin: 5px 10px;
  }
  .containers{
    position: absolute;
    background-color: #fff;
    width: 100%;
    height: 100%;
  }
  .containers-canvas{
    width: 77%;
    background-color: #fff;
    height: 100%;
  }
  .containers-panel{
    height: 100%;
    margin: 0 auto;
  }
  .canvas{
    width: 100%;
    height: 100%;
  }
  .panel{
    position: absolute;
    right: 0;
    top: -6%;
    width: 300px;
  }
</style>
