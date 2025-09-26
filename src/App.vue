<template>
  <div class="chatbot-button">
    <t-button shape="circle" theme="primary" size="large" @click="visible = true" id="DWFRobot">
      <template #icon>
        <animation-1-icon/>
      </template>
    </t-button>
  </div>
  <t-drawer v-model:visible="visible" :footer="false" size="680px" :close-btn="true" class="drawer-box">
    <template #header>
      <t-avatar size="32px" shape="circle" image="https://tdesign.gtimg.com/site/chat-avatar.png"></t-avatar>
      <span class="title">Hi, &nbsp;我是AI</span>
    </template>
    <t-chat
        layout="both"
        :clear-history="chatList.length > 0 && !isStreamLoad"
        @on-action="operation"
        @clear="clearConfirm"
    >
      <template v-for="(item, index) in chatList" :key="index">
        <t-chat-item
            :role="item.role"
            :text-loading="index === 0 && loading"
            :content="item.content"
            :variant="getStyle(item.role)"
            :reasoning="false"
        >
          <template #content>
            <t-chat-reasoning
                v-if="item.reasoning?.length > 0"
                expand-icon-placement="right"
            >
              <template #header>
                <t-chat-loading v-if="isStreamLoad" text="思考中..."/>
                <div v-else style="display:flex;align-items:center">
                  <CheckCircleIcon
                      style="
                          color: green;
                          font-size: '20px';
                          margin-right: '8px'
                        "
                  />
                  <span>{{ item.duration ? `已深度思考(用时${item.duration}秒)` : '已深度思考' }}</span>
                </div>
              </template>
              <t-chat-content :content="item.reasoning" role="assistant"/>
            </t-chat-reasoning>
            <t-chat-content v-if="item.content.length > 0" :content="item.content"/>
          </template>
        </t-chat-item>
      </template>
      <template #footer>
        <t-button theme="primary" @click="openForm">
          <template #icon>
            <add-icon/>
          </template>
          打开表单
        </t-button>
        <t-chat-sender
            v-model="inputValue"
            :loading="isStreamLoad"
            :textarea-props="{
            placeholder: '请输入消息...',
          }"
            @stop="onStop"
            @send="inputEnter"
        >
          <template #prefix>
            <div class="model-select">
              <t-tooltip v-model:visible="allowToolTip" content="切换模型" trigger="hover">
                <t-select
                    v-model="selectValue"
                    :options="selectOptions"
                    value-type="object"
                    @focus="allowToolTip = false"
                ></t-select>
              </t-tooltip>
              <t-button class="check-box" :class="{ 'is-active': isChecked }" variant="text" @click="checkClick">
                <SystemSumIcon/>
                <span>深度思考</span>
              </t-button>
            </div>
          </template>
        </t-chat-sender>
      </template>
    </t-chat>
  </t-drawer>
</template>
<script setup>
import {ref, toRefs, defineProps, getCurrentInstance} from 'vue';
import {SystemSumIcon, Animation1Icon, CheckCircleIcon, AddIcon} from 'tdesign-icons-vue-next';
import {fetchEventSource} from '@microsoft/fetch-event-source';

const props = defineProps(['apiUrl', 'title', 'obj', 'form'])
const {apiUrl, title} = toRefs(props);
const fetchCancel = ref(null);
const loading = ref(false);
const inputValue = ref('');
// 流式数据加载中
const isStreamLoad = ref(false);
const visible = ref(false);
const agentConfig = {
  "id": "xxxx",
  "name": "LightRagAgent",
  "description": "Agent for lightrag tasks",
  "knowledge_type": "aperag",
  "knowledge_filters": {
    "collection_id": ''
  },
  "chat_model_config": {
    "service_provider": "openailike",
    "id": "Qwen/Qwen2.5-7B-Instruct",
    "api_key": "20676974-d271-4004-bf7d-472627477901",
    "base_url": "https://api-inference.modelscope.cn/v1/",
    "temperature": 0.7,
    "max_tokens": 8192
  },
  "tools": [
    {
      "type": "func",
      "module_name": "agno.tools.duckduckgo",
      "class_name": "DuckDuckGoTools",
      "params": {
        "enable_search": true,
        "enable_news": true,
        "all": true,
        "modifier": "",
        "fixed_max_results": "",
        "proxy": "",
        "timeout": 10,
        "verify_ssl": true
      }
    }
  ],
  "prompts": {
    "default": {
      "system": "你具备专业的印刷知识，能够根据客户需求提供准确、详细的报价计算。\n",
      "introduction": "1. 查询知识库，搜索相关的数据\n2. 从网络搜索，调用DuckDuckGoTools"
    }
  }
};
let currentAbortController = null;

// 滚动到底部
const operation = function (type, options) {
  console.log(type, options);
};
const selectOptions = [
  {
    label: '默认模型',
    value: 'default',
  },
  {
    label: '深度思考',
    value: 'deepseek-r1',
  },
  {
    label: '混元',
    value: 'hunyuan',
  },
];
const selectValue = ref({
  label: '默认模型',
  value: 'default',
});
const getStyle = (role) => {
  if (role === 'assistant') {
    return 'outline';
  }
  if (role === 'user') {
    return 'base';
  }
  if (role === 'error') {
    return 'text';
  }
  return 'text';
};
const allowToolTip = ref(false);
const isChecked = ref(false);
const checkClick = () => {
  isChecked.value = !isChecked.value;
};

const app = getCurrentInstance();
app.appContext.config.globalProperties.openRobot = (config) => {
  window.DWFCHATCONFIG.collectionId = config.collectionId;
  window.DWFCHATCONFIG.targetClass = config.targetClass;
  window.DWFCHATCONFIG.viewName = config.viewName;
  window.DWFCHATCONFIG.obj = config.obj;
  window.DWFCHATCONFIG.dwf_ctx = config.dwf_ctx;
  visible.value = true;
};

const handleChange = (value, {index}) => {
  console.log('handleChange', value, index);
};
// 倒序渲染
const chatList = ref([
  // {
  //   avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
  //   name: '自己',
  //   datetime: '今天16:38',
  //   content: `
  //   ---
  //   ---
  //   `,
  //   role: 'assistant',
  //   reasoning: '',
  // },
]);
const clearConfirm = function () {
  chatList.value = [];
};
const onStop = function () {
  if (fetchCancel.value) {
    fetchCancel.value.controller.close();
    loading.value = false;
    isStreamLoad.value = false;
  }
};

const inputEnter = function () {
  if (isStreamLoad.value) {
    return;
  }
  if (!inputValue.value) return;
  const params = {
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    name: '自己',
    datetime: new Date().toDateString(),
    content: inputValue.value,
    role: 'user',
  };
  chatList.value.unshift(params);
  // 空消息占位
  const params2 = {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'TDesignAI',
    datetime: new Date().toDateString(),
    content: '',
    reasoning: '',
    role: 'assistant',
  };
  chatList.value.unshift(params2);
  handleData();
  inputValue.value = '';
};
// 简化的事件日志 - 只输出到控制台
const addEventLog = (message) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-CN');
  console.log(`[${timeString}] ${message}`);
}

const handleData = async () => {
  loading.value = true;
  isStreamLoad.value = true;

  if (currentAbortController) {
    currentAbortController.abort();
  }
  // 创建新的AbortController
  currentAbortController = new AbortController();
  const lastItem = chatList.value[0];
  // 准备请求数据
  agentConfig["knowledge_filters"].collection_id = window.DWFCHATCONFIG.collectionId;
  const requestData = {
    message: inputValue.value,
    stream: true,
    agent_config: agentConfig
  };

  try {
    fetchEventSource(apiUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'bearer sk-84362eec89484c13aadd34de7a7834aa'
      },
      body: JSON.stringify(requestData),
      signal: currentAbortController.signal,
      async onopen(response) {
        addEventLog('连接成功，开始接收数据');
        // if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        //   return; // everything's good
        // } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        //   // client-side errors are usually non-retriable:
        //   throw new FatalError();
        // } else {
        //   throw new RetriableError();
        // }
      },
      onmessage(result) {
        let data = JSON.parse(result.data);
        loading.value = false;
        lastItem.reasoning += data.reasoning_content;
        lastItem.content += data.content;
        // if (!isOk) {
        //   lastItem.role = 'error';
        //   lastItem.content = msg;
        //   lastItem.reasoning = msg;
        // }
        // 显示用时xx秒，业务侧需要自行处理
        lastItem.duration = 20;
        // 控制终止按钮
        isStreamLoad.value = false;
        loading.value = false;
        // if (msg.event === 'FatalError') {
        //   throw addEventLog(msg.data);
        // }
      },
      onclose() {
        // lastItem.content += '<t-button theme="primary"><template #icon><add-icon /></template>打开表单</t-button>';
        // if the server closes the connection unexpectedly, retry:
        // throw new RetriableError();
      },
      onerror(err) {
        addEventLog(err);
      }
    });
    // 如果循环正常结束，也移除生成指示器
    isStreamLoad.value = false;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求已被中止');
      addEventLog('请求已被用户中止');
    } else {
      console.error('请求错误:', error);
      // if (currentAIResponseElement) {
      //   currentAIResponseElement.textContent += `\n\n错误: ${error.message}`;
      // }
      addEventLog(`请求错误: ${error.message}`);

      // 移除生成中的提示
      isStreamLoad.value = false;
    }
  } finally {
    currentAbortController = null;
    isStreamLoad.value = false;
  }
};

const openForm = () => {
  window.DWFCHATCONFIG.dwf_ctx.openForm(window.DWFCHATCONFIG.targetClass, window.DWFCHATCONFIG.viewName, {
    initScript: `return {
      obj: ${window.DWFCHATCONFIG.obj}
    }`
  })
}
</script>
<style lang="less">
.title {
  margin-left: 16px;
  font-size: 20px;
  color: var(--td-text-color-primary);
  font-weight: 600;
  line-height: 28px;
}

.chatbot-button {
  position: fixed;
  cursor: pointer;
  bottom: 10px;
  right: 10px;
  z-index: 2147483647;
}

.drawer-box {
  .t-drawer__header {
    padding: 32px;
  }

  .t-drawer__body {
    padding: 0px 32px 30px 32px;
  }

  .t-drawer__close-btn {
    right: 32px;
    top: 32px;
    background-color: var(--td-bg-color-secondarycontainer);
    width: 32px;
    height: 32px;
    border-radius: 50%;

    .t-icon {
      font-size: 20px;
    }
  }
}

.model-select {
  display: flex;
  align-items: center;

  .t-select {
    width: 112px;
    height: var(--td-comp-size-m);
    margin-right: var(--td-comp-margin-s);

    .t-input {
      border-radius: 32px;
      padding: 0 15px;
    }

    .t-input.t-is-focused {
      box-shadow: none;
    }
  }

  .check-box {
    width: 112px;
    height: var(--td-comp-size-m);
    border-radius: 32px;
    border: 0;
    background: var(--td-bg-color-component);
    color: var(--td-text-color-primary);
    box-sizing: border-box;
    flex: 0 0 auto;

    .t-button__text {
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        margin-left: var(--td-comp-margin-xs);
      }
    }
  }

  .check-box.is-active {
    border: 1px solid var(--td-brand-color-focus);
    background: var(--td-brand-color-light);
    color: var(--td-text-color-brand);
  }
}
</style>