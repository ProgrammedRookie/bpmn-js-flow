<template>
  <div class="panel-tab-content">
    配置表单
  </div>
</template>

<script>
export default {
  name: 'ElementForm',
  data () {
    return {

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
  mounted () {
    console.log(this.id)
    console.log(this.type)
  },
  methods: {}
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
