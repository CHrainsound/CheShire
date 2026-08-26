# 柴郡猫猫 (Cheshire Cat)

> 运行在 Zepp OS 手表上的 AI 聊天客户端：抬腕即聊，内置主流大模型预设与自定义角色人设，对话记录保存在手表本地。支持圆形/方形表盘自动适配。
>
> An AI chat client for Zepp OS smartwatches — chat with a raise of your wrist. Ships with presets for mainstream LLM providers and custom personas; chat history persists locally on the watch. Adapts to round and square displays automatically.

## 使用前必读 / Before You Start

- **首次使用请先在手机端 Zepp App 的应用设置中配置 API**（服务商、接口地址、API Key、模型），否则手表端无法发起对话。
  **Configure the API in the app settings of the Zepp App on your phone before first use** (provider, base URL, API key, and model), otherwise the watch app cannot start a conversation.
- 点击"提问"按钮即可调出输入法（官方及第三方输入法均支持），直接在手表上打字发送消息。
  Tap "ASK" to bring up the keyboard — both the built-in and third-party input methods are supported. Type and send messages directly from your watch.

## 功能 / Features

- 支持 DeepSeek、Kimi、通义千问、豆包、OpenAI、小米 MiMo 预设及任意 OpenAI 兼容接口
  Presets for DeepSeek, Kimi, Qwen, Doubao, OpenAI & Xiaomi MiMo, plus any OpenAI-compatible endpoint
- 可自定义角色人设（默认为柴郡猫）· Custom persona support (Cheshire Cat by default)
- 深度思考开关与思考强度调节 · Deep thinking toggle with adjustable reasoning effort
- 回复语言可选中文/英文/跟随提问 · Reply language: Chinese / English / auto-follow input
- 本地聊天记录持久化 · Local chat history persistence

## 说明 / Note

- 目前仅测试了 DeepSeek API，使用其他服务如有问题请联系 3014386984@qq.com
  Only the DeepSeek API has been tested so far. For issues with other providers, please contact 3014386984@qq.com

## 隐私声明 / Privacy Statement

**中文**

本应用不收集、不上传任何数据至开发者服务器。具体说明：

1. **API 配置**（服务商地址、API Key、模型名称、自定义人设）仅保存在手机端 Zepp App 设置存储中，用于手表端连接你选择的服务商，开发者无法获取。
2. **聊天记录** 仅保存在手表本地存储中，不会同步到云端；点击应用内"清空"按钮即可彻底删除。
3. **对话内容** 会通过你自己配置的 API 地址发送给对应的 AI 服务商（如 DeepSeek），该部分数据的处理受相应服务商隐私政策约束，请查阅其官方条款。
4. 本应用不含统计、广告或追踪组件；仅申请设备信息（用于屏幕适配）和本地存储两项系统权限。

**English**

This app does not collect or transmit any data to the developer's servers. Specifically:

1. **API configuration** (provider URL, API key, model name, custom persona) is stored only in the settings storage of the Zepp App on your phone, and is used solely to connect your watch to the provider you choose. The developer has no access to it.
2. **Chat history** is stored only on the watch itself and never synced to any cloud; tap "CLEAR" in the app to delete it permanently.
3. **Conversation content** is sent via your own configured API endpoint to the corresponding AI provider (e.g., DeepSeek). Handling of that data is governed by the provider's own privacy policy.
4. This app contains no analytics, ads, or trackers, and requests only two system permissions: device info (for screen adaptation) and local storage.
