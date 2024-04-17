/// <reference lib="dom" />

import { createApp } from "vue";
import { createPinia } from 'pinia';
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeDropdown } from "@vscode/webview-ui-toolkit";
import App from './App.vue';
import './styles.scss';

window.vscode = acquireVsCodeApi();
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeDropdown());

const pinia = createPinia();
const app = createApp(App);
app.use(pinia).mount('#app');
