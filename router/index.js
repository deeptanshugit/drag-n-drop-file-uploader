// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import FileUploaderView from '../views/FileUploaderView.vue'
import UploadedFilesView from '../views/UploadedFilesView.vue'

const routes = [
  { path: '/', component: FileUploaderView },
  { path: '/uploaded-files', component: UploadedFilesView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
