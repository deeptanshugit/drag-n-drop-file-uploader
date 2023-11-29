// main.js
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import FileUploader from '@/components/FileUploader'
import UploadedFiles from '@/components/UploadedFiles'

const routes = [
  { path: '/', component: FileUploader },
  { path: '/uploaded-files', component: UploadedFiles },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');
