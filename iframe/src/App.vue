<script setup>
import Sample from './components/Sample.vue'
</script>

<template>
  <div style="width: 100%; height: 100%">
    <Sample></Sample>
    <!-- 嵌入的众趣展示端 -->
    <!-- <iframe
      id="qverse-iframe"
      src="http://localhost:8066?work_id=HHGiBIepJ4V&appKey=j8k3d5r7s2m4b9n1v6x8p5q2z"
      frameborder="0"
    ></iframe> -->
    <iframe
      id="qverse-iframe"
      src="https://test.3dnest.cn/qverse/work/HHGiBIepJ4V?appKey=j8k3d5r7s2m4b9n1v6x8p5q2z"
      frameborder="0"
    ></iframe>
  </div>
</template>

<style scoped>
#qverse-iframe {
  width: 100%;
  height: 100%;
}
</style>
