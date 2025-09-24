import {createApp} from 'vue';
import App from './App.vue';
import TDesign from 'tdesign-vue-next';
import TDesignChat from '@tdesign-vue-next/chat'; // 引入chat组件

// const app = createApp(App);
// app.use(TDesign).use(TDesignChat).mount('#app');

export function initChatWidget(config: any) {
    const app = createApp(App, {
        // 将配置传递给组件
        apiUrl: config.apiUrl,
        title: config.title,
        // ... 其他配置
    });
    app.use(TDesign).use(TDesignChat)
    // 挂载到指定的DOM元素
    const container = document.createElement('div');
    container.id = 'my-chat-widget-container';
    document.body.appendChild(container);
    app.mount(container);
}