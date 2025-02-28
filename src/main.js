import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';  // Sử dụng App.vue làm root component
import PokemonList from './PokemonList.vue';
import PokemonDetail from './PokemonDetail.vue';
import './assets/main.css';

// Định nghĩa các route
const routes = [
  { path: '/', component: PokemonList },
  { path: '/pokemon/:id', component: PokemonDetail, props: true },
];

// Tạo Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Khởi chạy ứng dụng với Vue Router
const app = createApp(App);
app.use(router);
app.mount('#app');
