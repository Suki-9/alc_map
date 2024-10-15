import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    component: () => import('@/pages/Map.vue')
  }, {
    path: '/registry',
    component: () => import('@/pages/Registry.vue')
  }]
});

export default router;