import { createRouter, createWebHistory } from 'vue-router'
import EditorPage from '@/views/EditorPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: EditorPage,
    },
  ],
})

export default router
