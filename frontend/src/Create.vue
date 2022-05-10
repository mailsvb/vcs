<template>
  <Preferences ref="preferences"></Preferences>
  <div class="version">
    <div><a target="_blank" href="https://github.com/atos-virtual-care/vcs-realtime-sdk-web-demo">App Version: v{{ $store.state.version }}</a></div>
    <div><a target="_blank" href="https://sdk.virtualcareservices.net">SDK Version: v{{ $store.state.sdkVersion }}</a></div>
  </div>
  <div class="home">
    <div class="tune">
      <svg-icon @click="$refs.preferences.show()" type="mdi" :path="mdiTune"></svg-icon>
    </div>
    <div class="spacer"></div>
    <div class="title">
      <img width="100" alt="" src="/logo.svg" />
      <div>{{ productName }}</div>
    </div>
    <div class="pure-form pure-form-aligned">
      <div class="pure-control-group">
        <label>Caller</label>
        <input data-autotest="phoneNumber" v-model="phoneNumber" />
        <span class="pure-form-message-inline">This is a required field.</span>
      </div>
      <div class="pure-control-group">
        <label>Your name</label>
        <input data-autotest="user" v-model="user.name" />
      </div>
      <!--<div class="pure-control-group">
        <label>Join with</label>
        <select data-autotest="roomType" v-model="mediaPreselection">
          <option data-autotest="both" value="both">audio and video</option>
          <option data-autotest="audio" value="audio">audio only</option>
          <option data-autotest="video" value="video">video only</option>
        </select>
      </div>-->
      <div class="pure-controls">
        <button data-autotest="createRoom" @click="join(true)" :disabled="!phoneNumber" class="pure-button pure-button-primary">Create room</button>
        <button data-autotest="joinRoom" @click="join()" :disabled="!phoneNumber" class="pure-button pure-button-primary">Join room</button>
      </div>
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
  .pure-form {
    margin-top: 50px;
    margin-bottom: 50px;
  }
  input,
  select {
    width: 240px;
  }
  button {
    margin: 3px;
  }
  .spacer {
    flex: 1;
  }
}
</style>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTune } from '@mdi/js';
import Preferences from './Preferences.vue';

export default {
  components: {
    Preferences,
    SvgIcon
  },

  data() {
    return {
      phoneNumber: null,
      user: {},
      mediaPreselection: 'both',
      version: '',
      mdiTune
    };
  },

  computed: {
    productName() {
      return this.$store.state.productName;
    }
  },

  async created() {
    // Fetch config backend
    await this.$store.dispatch('fetchConfig');

    //this.phoneNumber = this.$store.state.activeRoom || '';

    this.user = this.$store.getters.user;
    if (!this.user.country) {
      this.user.country = navigator.language.toUpperCase().split('-')[1];
    }
  },

  mounted() {
    this.phoneNumber = this.$route.query?.phone;
  },

  methods: {
    join(create) {
      this.$store
        .dispatch(create ? 'createRoom' : 'fetchRoom', this.phoneNumber)
        .then(() => {
          // this.$store.state.mediaPreselection = this.mediaPreselection;
          this.$store.state.mediaPreselection = 'both';
          this.$store.commit('setUser', this.user);
          this.$router.push({ path: 'room', query: { id: this.phoneNumber } });
        })
        .catch(err => {
          console.error(err);
          alert(err);
        });
    }
  }
};
</script>
