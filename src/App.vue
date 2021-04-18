<template>
  <div id="app" class="scrollbar">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  overflow: hidden;
  margin: 0;
  box-sizing: border-box;
}
#app {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: inline-grid;
  grid-template-columns: auto max-content;
}
</style>
