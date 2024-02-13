import { createApp } from "vue";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import App from './App.vue';
import './styles.scss';

provideVSCodeDesignSystem().register(vsCodeButton());

const app = createApp(App);
app.mount('#app');
