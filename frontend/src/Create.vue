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
      <div class="pure-controls">
        <button data-autotest="joinRoom" @click="initialize()" :disabled="!phoneNumber" class="pure-button pure-button-primary">Initialize</button>
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
    width: 235px;
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
      mdiTune,
      NotifyData: { allowedRoomNames: [], users: [] }
    };
  },

  computed: {
    productName() {
      return this.$store.state.productName;
    }
  },

  async mounted() {
    // Fetch config backend
    await this.$store.dispatch('fetchConfig');

    this.phoneNumber = this.$route.query?.phone || this.$store.state.activeRoom || '';
    this.user.name = this.$route.query?.name || 'Calltaker';

    if (this.phoneNumber && this.user.name) {
      setTimeout(() => {
        this.initialize();
      }, 2000)
    }
  },

  methods: {
    async initialize() {
      if (this.$store.state.config.NOTIFY_DATA) {
        try {
          this.NotifyData = JSON.parse(this.$store.state.config.NOTIFY_DATA);
        } catch (err) {
          console.error(`Could not parse notifyData ${err.message}`);
        }
      }
      let room = await this.getRoom();
      !room && (room = await this.createRoom());
      if (room) {
        this.$store.state.mediaPreselection = 'both';
        this.$store.commit('setUser', this.user);
        this.$router.push({ path: 'room', query: { id: this.phoneNumber, type: 'calltaker', name: this.user.name } });
        if (this.NotifyData.allowedRoomNames && this.NotifyData.allowedRoomNames.indexOf(this.phoneNumber) > -1) {
          const baseUrl = `${window.location.protocol}//${window.location.host}/room?id=${this.phoneNumber}`;
          this.NotifyData.users && this.NotifyData.users.forEach(async (user) => {
            if (user.type && user.name) {
              const url = `${baseUrl}&type=${user.type}&name=${user.name}`;
              user.chat_id && await this.$store.dispatch('sendNotify', {chat_id: user.chat_id, text: url});
              user.number && await this.$store.dispatch('sendNotify', {number: user.number, text: url});
            }
          })
        }
      } else {
        alert('Failed to initialize');
      }
    },
    async getRoom() {
      try {
        const room = await this.$store.dispatch('fetchRoom', this.phoneNumber);
        return room;
      } catch(err) {
        console.error(err.message);
        return null;
      }
    },
    async createRoom() {
      try {
        const room = await this.$store.dispatch('createRoom', this.phoneNumber);
        return room;
      } catch(err) {
        console.error(err.message);
        return null;
      }
    }
  }
};
</script>
