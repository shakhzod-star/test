import { createRouter, createWebHashHistory } from "vue-router";
import Main from "/src/views/index.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Main,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
