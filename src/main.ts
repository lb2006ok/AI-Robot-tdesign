import {createApp} from 'vue';
import App from './App.vue';
import TDesign from 'tdesign-vue-next';
import TDesignChat from '@tdesign-vue-next/chat'; // 引入chat组件
(window as any).DWFCHATCONFIG  = {
    collectionId: '',
    targetClass: '',
    viewName: '',
    obj: {}
}
// const app = createApp(App, {});
// app.use(TDesign).use(TDesignChat).mount('#app');
// app.openRobot = app.config.globalProperties.openRobot;
// app.openRobot({});
function initChatWidget(config: any = {
    apiUrl: '',
    title: '',
    placement: 'right'
}) {
    const app = createApp(App, config);
    app.use(TDesign).use(TDesignChat)
    // 挂载到指定的DOM元素
    const container = document.createElement('div');
    container.id = 'my-chat-widget-container';
    document.body.appendChild(container);
    app.mount(container);
    // app.openRobot = app.config.globalProperties.openRobot;
    return {
        openRobot: app.config.globalProperties.openRobot,
    };
}
export default {
    initChatWidget
};