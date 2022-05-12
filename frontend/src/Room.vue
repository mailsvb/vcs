<template>
  <Preferences ref="preferences"></Preferences>
  <Chat ref="chat" :participants="room?.remoteParticipants" @send="sendMessage"></Chat>

  <div v-if="room" ref="room" class="room" :class="{ mobile }">
    <div class="roomname">
      <div data-autotest="displayedRoomName" v-if="room.name">Caller: {{ room.name }}</div>
    </div>
    <div class="actions">
      <button data-autotest="toggleCamera" @click="switchCamera" v-if="mobile" class="pure-button pure-button-primary switch-camera">
        <svg-icon type="mdi" :path="mdiCameraFlip"></svg-icon>
      </button>
      <button data-autotest="toggleVideo" @click="toggleVideo" class="pure-button pure-button-primary toggle-video">
        <svg-icon v-if="hasVideo" type="mdi" :path="mdiVideo"></svg-icon>
        <svg-icon v-else type="mdi" :path="mdiVideoOff"></svg-icon>
      </button>
      <button data-autotest="hangUp" @click="leave" class="pure-button pure-button-primary hangup">
        <svg-icon type="mdi" :path="mdiPhoneHangup"></svg-icon>
      </button>
      <button data-autotest="toggleMicrophone" @click="toggleMute" class="pure-button pure-button-primary toggle-mic">
        <svg-icon v-if="isMuted" type="mdi" :path="mdiMicrophoneOff"></svg-icon>
        <svg-icon v-else type="mdi" :path="mdiMicrophone"></svg-icon>
      </button>
      <button @click="$refs.chat.show()" class="pure-button pure-button-primary chat">
        <svg-icon type="mdi" :path="mdiChat"></svg-icon>
      </button>
      <button @click="$refs.preferences.show()" v-if="!mobile" class="pure-button pure-button-primary preferences">
        <svg-icon type="mdi" :path="mdiTune"></svg-icon>
      </button>
    </div>
    <audio id="audio" ref="audio" autoplay></audio>
    <div class="call-stage">
      <div v-for="participant in getStageParticipants()" :key="participant.address">
        <div class="video">
          <video data-autotest="remoteParticipantVideo" :id="`video-${participant.address}`" autoplay playsinline></video>
        </div>
        <div class="text">
          <div data-autotest="displayedUser">{{ participant.name }}</div>
        </div>
      </div>
    </div>
    <div class="call-sidebar">
      <div v-if="$store.state.viewSelf">
        <div class="video">
          <div data-autotest="localParticipantVideo" class="video" id="localStream" ref="localStream"></div>
        </div>
        <div class="text">
          <div data-autotest="displayedUser">{{ this.ownName }}</div>
        </div>
      </div>
      <div v-for="participant in getSidebarParticipants()" :key="participant.address">
        <div class="video">
          <video data-autotest="remoteParticipantVideo" :id="`sidebar-${participant.address}`" autoplay playsinline></video>
        </div>
        <div class="text">
          <div data-autotest="displayedUser">{{ participant.name }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="error" class="error">
    <div>Error: {{ error }}</div>
  </div>
</template>

<style lang="less" scoped>
button {
  border-radius: 4px;
  height: 40px;
  margin: 5px;
}

.room {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: black;

  .text {
    line-height: 18px;
    position: absolute;
    left: 5px;
    top: 5px;
    font-size: 18px;
    z-index: 1;
    div {
      mix-blend-mode: difference;
      color: #fff;
      display: inline;
    }
    .flag {
      width: 20px;
      margin-right: 8px;
      border: solid #555 1px;
      margin-bottom: -1px;
    }
  }

  #localStream {
    ::v-deep(video) {
      width: 200px;
      object-fit: contain;
      background: black;
      background-image: url('/noVideo120.png');
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  .actions {
    display: block;
    position: absolute;
    bottom: 0px;
    z-index: 2;
    .hangup {
      color: white;
      background: red;
    }
    .preferences {
      color: black;
      background: #d0d0d0;
    }
  }

  .roomname {
    line-height: 25px;
    position: absolute;
    bottom: 50px;
    font-size: 18px;
    z-index: 1;
    div {
      mix-blend-mode: difference;
      color: #fff;
      display: inline;
    }
    .flag {
      width: 20px;
      margin-right: 8px;
      border: solid #555 1px;
      margin-bottom: -1px;
    }
  }

  .call-stage {
    width: 100%;
    height: 100%;
    align-items: center;
    display: flex;
    position: fixed;
    > div {
      flex: 1 1 0px;
      position: relative;
      text {
        position: absolute;
      }
      video {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        background-image: url('/noVideo250.png');
        background-repeat: no-repeat;
        background-position: center;
      }
    }
  }

  .call-sidebar {
    position: absolute;
    right: 5px;
    top: 5px;
    align-items: center;
    display: flex;
    flex-direction: column;
    > div {
      flex: 1 1 0px;
      position: relative;
      .text {
        background-color: #000;
        position: absolute;
        line-height: 16px !important;
        font-size: 14px !important;
        left: 0px !important;
        top: 0px !important;
      }
      video {
        width: 200px;
        background: black;
        background-image: url('/noVideo120.png');
        background-repeat: no-repeat;
        background-position: center;
      }
    }
  }

  &.mobile {
    .actions {
      bottom: 0px;
      opacity: 0.5;
    }

    .call-sidebar {
      video {
        width: 70px;
        object-fit: cover;
      }
      .text {
        background-color: #000;
        line-height: 8px !important;
        font-size: 8px !important;
        left: 0px !important;
        top: 0px !important;
      }
    }

    #localStream {
      ::v-deep(video) {
        width: 70px;
        object-fit: cover;
      }
    }
  }
}

.error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #b9e4e1;
  button {
    margin: 30px;
  }
}
</style>

<script>
import { nextTick } from 'vue';
import { joinRoom } from 'vcs-realtime-sdk';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiVideo, mdiVideoOff, mdiMicrophone, mdiMicrophoneOff, mdiPhoneHangup, mdiCameraFlip, mdiChat, mdiTune } from '@mdi/js';
import Chat from './Chat.vue';
import Preferences from './Preferences.vue';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  components: {
    Chat,
    SvgIcon,
    Preferences
  },

  data() {
    return {
      room: null,
      remoteParticipantsCounter: 0,
      isMuted: false,
      hasVideo: true,
      callerPresent: false,
      doctorPresent: false,
      ownName: false,
      type: false,
      error: null,
      mdiVideo,
      mdiVideoOff,
      mdiMicrophone,
      mdiMicrophoneOff,
      mdiPhoneHangup,
      mdiCameraFlip,
      mdiChat,
      mdiTune
    };
  },

  computed: {
    mobile() {
      return this.isMobile();
    },
    selfViewEnabled() {
      return this.$store.state.viewSelf;
    }
  },

  watch: {
    async selfViewEnabled() {
      if (this.$store.state.viewSelf === true) {
        await nextTick();
        this.room.localParticipant.attach(this.$refs.localStream);
      }
    },
    async remoteParticipantsCounter(newCount, oldCount) {
      console.log(`[trace][remoteParticipantsCounter] participants changed [${oldCount} -> ${newCount}]`);
      this.callerPresent = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() === 'caller' && elem.mediaStream !== null).length > 0;
      this.doctorPresent = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() === 'doctor' && elem.mediaStream !== null).length > 0;
      await nextTick();
      this.updateParticipantStreams();
    }
  },

  async mounted() {
    try {
      const room = this.$route.query?.id;
      this.type = this.$route.query?.type;
      this.ownName = this.$route.query?.name || this.type;

      if (!room || !this.type) {
        throw new Error('Missing parameters (id, type)');
      }

      // Make sure config is loaded
      await this.$store.dispatch('fetchConfig');

      let token = this.$store.state.tokens[room];
      if (!token) {
        // Fetch room. This may be a navigation directly to this url.
        token = await this.$store.dispatch('fetchRoom', room);
      }
      if (!token) {
        // TODO: Show error page with link to home
        this.$router.push('/');
      }

      // Remember room
      this.$store.state.activeRoom = room;

      this.room = await joinRoom(token, {
        audio: this.$store.getters.useAudio,
        //video: this.$store.getters.useVideo,
        //hdVideo: this.$store.getters.useVideo,
        video: this.type === 'caller' || this.type === 'doctor',
        hdVideo: false,
        name: this.ownName,
        participantInfo: { type: this.type },
        host: this.$store.state.config.VCS_HOST
      });

      this.isMuted = this.room.isMuted();
      this.hasVideo = this.room.hasVideo();

      // nextTick allows the $refs below to be ready
      await nextTick();

      // Attach participant to a div. SDK will handle creating and updating video
      // element inside that div.
      this.room.localParticipant.attach(this.$refs.localStream);

      this.room.on('remoteStream', p => {
        console.log(`[trace][remoteStream] ${p.name}/${p.participantInfo?.type} stream is ${p.mediaStream === null ? 'unavailable' : 'available'}.`);
        const newParticipantsCounter = this.room.remoteParticipants.filter(elem => elem.mediaStream !== null).length;
        if (this.remoteParticipantsCounter === newParticipantsCounter) {
          console.log(`[trace][remoteStream] counter unchanged, updating streams anyway`);
          this.updateParticipantStreams();
        } else {
          this.remoteParticipantsCounter = newParticipantsCounter;
        }
      });

      this.room.on('remoteAudioStream', stream => {
        const el = this.$refs.room.querySelector('#audio');
        el && (el.srcObject = stream);
      });

      this.room.on('messageReceived', (participant, data) => {
        alert(`Participant ${participant.address} sent message: ${data}`);
      });

      // Create new video element, or remove video element via v-for binding
      this.room.on('participantJoined', p => {
        console.log(`[trace][participantJoined] ${p.name}/${p.participantInfo?.type} joined the room.`);
        this.$forceUpdate(p);
      });
      this.room.on('participantLeft', p => {
        console.log(`[trace][participantLeft] ${p.name}/${p.participantInfo?.type} left the room.`);
        this.$forceUpdate(p);
        this.remoteParticipantsCounter = this.room.remoteParticipants.filter(elem => elem.mediaStream !== null).length;
      });
      this.room.on('localStream', p => console.log('[trace][localStream] local stream has been updated'));
      this.room.on('participantJoinFailed', (p, r) => console.log(`[trace][participantJoinFailed] ${p.name}/${p.participantInfo?.type} failed to join for ${r}`));
    } catch (err) {
      console.log('Error loading room: ', err.message);
      this.error = err.message;
      setTimeout(() => {
        this.$router.push('/');
      }, 5000);
    }
  },

  methods: {
    getSidebarParticipants() {
      let returnedParticipants;
      if (this.type === 'caller') {
        if (this.doctorPresent === true) {
          returnedParticipants = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() !== 'doctor');
        } else {
          returnedParticipants = [];
        }
      } else {
        if (this.callerPresent === true) {
          returnedParticipants = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() !== 'caller');
        } else {
          returnedParticipants = [];
        }
      }
      console.log(`[trace][getSidebarParticipants] participants sidebar[${returnedParticipants.length}] callerIsPresent[${this.callerPresent} doctorIsPresent[${this.doctorPresent}]`);
      return returnedParticipants;
    },
    getStageParticipants() {
      let returnedParticipants;
      if (this.type === 'caller') {
        if (this.doctorPresent === true) {
          returnedParticipants = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() === 'doctor');
        } else {
          returnedParticipants = this.room.remoteParticipants;
        }
      } else {
        if (this.callerPresent === true) {
          returnedParticipants = this.room.remoteParticipants.filter(elem => elem.participantInfo?.type?.toLowerCase() === 'caller');
        } else {
          returnedParticipants = this.room.remoteParticipants;
        }
      }
      console.log(`[trace][getStageParticipants] participants stage[${returnedParticipants.length}] callerIsPresent[${this.callerPresent} doctorIsPresent[${this.doctorPresent}]`);
      return returnedParticipants;
    },
    updateParticipantStreams(participants) {
      this.room.remoteParticipants.forEach(elem => {
        console.log(`[trace] ${JSON.stringify(elem)}`)
        let el;
        if (this.type === 'caller') {
          if (this.doctorPresent === false || elem.participantInfo?.type === 'doctor') {
            el = this.$refs.room.querySelector(`#video-${elem.address}`);
          } else {
            el = this.$refs.room.querySelector(`#sidebar-${elem.address}`)
          }
        } else {
          if (this.callerPresent === false || elem.participantInfo?.type === 'caller') {
            el = this.$refs.room.querySelector(`#video-${elem.address}`);
          } else {
            el = this.$refs.room.querySelector(`#sidebar-${elem.address}`)
          }
        }
        console.log(`[trace][updateParticipantStreams] ownName[${this.ownName}] callerPresent[${this.callerPresent}] participant[${elem.name}/${elem.participantInfo?.type}] el[${el === null ? 'not found' : 'found'}]`)
        el && (el.srcObject = elem.mediaStream);
      })
    },
    async toggleVideo() {
      this.hasVideo = await this.room.toggleVideo();
    },
    async switchCamera() {
      await this.room.switchCamera();
    },
    toggleMute() {
      this.isMuted = this.room.toggleMute();
    },
    leave() {
      this.room.leave();
      setTimeout(() => {
        this.$router.push('/');
      }, 300);
    },
    async sendMessage({ message, participants }) {
      await this.room.sendMessageToParticipant(message, participants);
    },
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  }
};
</script>
