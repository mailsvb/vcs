<template>
  <div class="version">
    <div><a target="_blank" href="https://github.com/atos-virtual-care/vcs-realtime-sdk-web-demo">App Version: v{{ $store.state.version }}</a></div>
    <div><a target="_blank" href="https://sdk.virtualcareservices.net">SDK Version: v{{ $store.state.sdkVersion }}</a></div>
  </div>
  <div class="home">
    <div class="spacer"></div>
    <div class="title">
      <img width="100" alt="" src="/logo.svg" />
      <div>{{ $store.state.productName }}</div>
    </div>
    <div class="spacer"></div>
  </div>
</template>

<style lang="less" scoped>
.tune {
  color: #555;
  position: absolute;
  top: 20px;
  right: 20px;
  &:hover {
    color: black;
    cursor: pointer;
  }
}
.version {
  position: absolute;
  left: 10px;
  bottom: 10px;
  a {
    text-decoration: none;
    color: black;
  }
}
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #b9e4e1;

  .title {
    text-align: center;
  }
  .spacer {
    flex: 1;
  }
}
</style>
