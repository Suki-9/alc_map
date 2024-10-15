import router from './router'
import { App } from 'vue';

export function installPlugins(app: App) {
  app.use(router);
}
