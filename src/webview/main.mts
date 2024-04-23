/// <reference lib="dom" />

import { createApp } from "vue";
import { createPinia } from "pinia";
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeProgressRing, vsCodeTextField } from "@vscode/webview-ui-toolkit";
import App from "./App.vue";
import "vue-select/dist/vue-select.css";
import "./styles.scss";

window.vscode = acquireVsCodeApi();
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextField(), vsCodeProgressRing());

const pinia = createPinia();
const app = createApp(App);
app.use(pinia).mount("#app");
