<template>
  <div class="popup-card">
    <h1>接口返回值覆盖器</h1>
    <p>管理界面已迁移到独立面板</p>
    <el-button type="primary" @click="openManager">打开管理面板</el-button>
  </div>
</template>

<script setup>
const openManager = () => {
  chrome.tabs.create({ url: 'ui/tab.html' });
};
</script>

<style>
body {
  margin: 0;
  width: 300px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.popup-card {
  padding: 20px;
  text-align: center;
}
h1 {
  font-size: 18px;
  margin-bottom: 10px;
}
p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}
</style>
