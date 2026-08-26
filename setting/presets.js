export const PRESETS = [
  {
    key: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
  },
  {
    key: "moonshot",
    name: "Kimi (Moonshot)",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "kimi-k3",
  },
  {
    key: "qwen",
    name: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
  {
    key: "doubao",
    name: "豆包 (火山方舟)",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    model: "",
  },
  {
    key: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  {
    key: "mimo",
    name: "小米 MiMo",
    baseUrl: "https://api.xiaomimimo.com/v1",
    model: "mimo-v2.5",
  },
  {
    key: "custom",
    name: "自定义 (手动填写)",
    baseUrl: "",
    model: "",
  },
];

export function findPreset(key) {
  for (const p of PRESETS) {
    if (p.key === key) return p;
  }
  return null;
}
