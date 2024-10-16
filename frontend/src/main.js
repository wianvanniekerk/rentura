import App from './App.svelte';
import '../public/global.css';

const app = new App({
  target: document.body,
  props: {
    url: window.location.pathname
  }
});

export default app;