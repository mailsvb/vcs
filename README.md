# VCS Realtime SDK sample application for web clients

This sample application uses the [Virtual Care Service (VCS) Realtime JavaScript SDK](https://sdk.virtualcareservices.net/) to demonstrate how users use join virtual rooms to interact with audio and/or video.

The application has two parts:

1. **Application server**: The application server is a Node.js app that serves two purposes, a) serve the frontend Vue.js application, and b) create rooms on behalf of the frontend application using the [VCS REST API](https://sdk.virtualcareservices.net/sdks/rest/).
2. **Frontend Vue app**: The frontend app uses the [VCS Realtime JavaScript SDK](https://sdk.virtualcareservices.net/) to join the virtual room. Peer-2-peer WebRTC is used for media communication.

> At this time only four participants can join a room

## Running application locally

### Getting the code

Clone this repository and install the dependencies.

```bash
git clone https://github.com/mailsvb/vcs
cd vcs
npm install
```

### Configure the app

#### Application server

Environment variables for the backend

```env
# VCS API KEY used to create room via REST API. Contact the system administrator of your VCS system to obtain a VCS API key and the domain of the VCS system.
export VCS_API_KEY=04gf...

# VCS server, e.g. sandbox.virtualcareservices.net
export VCS_HOST=sandbox.virtualcareservices.net

# PORT express app is listening on. Default is port 3001.
export VCS_PORT=3001

# TELEGRAM_CRED for accessing the Telegram API for notifications
export TELEGRAM_CRED=123...:Abc

# TWILIO_ACCOUNT_SID, TWILIO_ACCOUNT_TOKEN, TWILIO_MESSAGE_SID for accessing the Twilio SMS API for notifications
export TWILIO_ACCOUNT_SID=Abc...
export TWILIO_ACCOUNT_TOKEN=Abc...
export TWILIO_MESSAGE_SID=Abc...
```

#### Frontend Vue app

Environment variables for the backend

```env
# VITE_APP_SERVER is the backend server URL. So in development set to localhost:3001 for example
export VITE_APP_SERVER=http://localhost:3001

# VCS_FRONTEND_PORT Set the port where the frontend webserver should listen on. Default is 3000
export VCS_FRONTEND_PORT=3000

# VCS_FRONTEND_ADDR Set the addr of the interface the frontend should listen on. Default is 127.0.0.1
export VCS_FRONTEND_ADDR=127.0.0.1
```

### Start the app

There are no other dependencies to run the app locally. Once you add the API key as explained above, start the backend and frontend. The application is available at <http://localhost:3000/>.

```bash
# Start the backend application server and frontend Vue app
npm run dev

# Navigate to http://localhost:3000/
```
