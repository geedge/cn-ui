<template>
  <div id="frame-box" style="height: 100%; width: 100%; padding-top: 10px; overflow: hidden">
    <iframe
        id="frame"
        width="100%"
        height="100%"
        frameborder="no"
        border="0"
    >
    </iframe>
  </div>
</template>

<script>
export default {
  name: 'Viewer',
  data () {
    return {
      height: 0
    }
  },
  mounted () {
    const boxDom = document.getElementById('frame-box')
    const dom = document.getElementById('frame')
    const height = boxDom.offsetHeight
    dom.src = BASE_CONFIG.logUrl + '&height=' + (height + 100)
  }
}
</script>
