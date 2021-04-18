<template>
  <div class="panel-tab-content">扩展属性</div>
</template>
<script>
export default {
  name: 'ElementProperties',
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
  methods: {

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
