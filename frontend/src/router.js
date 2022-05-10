import { createWebHistory, createRouter } from 'vue-router';
import Home from './Home.vue';
import Room from './Room.vue';
import Create from './Create.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/room',
    name: 'Room',
    component: Room
  },
  {
    path: '/create',
    name: 'Create',
    component: Create
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
