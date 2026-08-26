import { BaseSideService } from "@zeppos/zml/base-side";
import { splitChunks } from "../utils/message-chunk";
import { DEFAULT_SYSTEM_PROMPT } from "./neko-prompt";

const CHUNK_DELAY = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(baseUrl) {
  const base = baseUrl.replace(/\/+$/, "");
  return /\/chat\/completions$/.test(base)
    ? base
    : `${base}/chat/completions`;
}

function maskKey(key) {
  if (!key) return "(empty)";
  const k = String(key);
  if (k.length <= 8) return `***(${k.length} chars)`;
  return `${k.slice(0, 3)}***${k.slice(-4)} (${k.length} chars)`;
}

const LANG_NAMES = {
  zh: "Chinese",
  en: "English",
};

function buildMessages(config, context) {
  let system = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const langName = LANG_NAMES[config.replyLang];
  if (langName) {
    system += ` Always respond in ${langName}.`;
  }
  return [{ role: "system", content: system }, ...context];
}

async function chatCompletion(config, messages) {
  const requestBody = {
    model: config.model,
    messages,
    max_tokens: 512,
    temperature: 0.7,
  };

  if (config.thinking === true) {
    requestBody.thinking = { type: "enabled" };
    const effort = config.reasoningEffort;
    if (effort === "low" || effort === "high" || effort === "max") {
      requestBody.reasoning_effort = effort;
    }
  }

  const response = await fetch({
    url: buildUrl(config.baseUrl),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const body =
    typeof response.body === "string" && response.body.length > 0
      ? JSON.parse(response.body)
      : response.body;

  if (response.status !== 200) {
    const message =
      (body && body.error && body.error.message) ||
      `HTTP ${response.status}`;
    const err = new Error(message);
    err.httpStatus = response.status;
    err.requestUrl = buildUrl(config.baseUrl);
    throw err;
  }

  const content =
    body &&
    body.choices &&
    body.choices[0] &&
    body.choices[0].message &&
    body.choices[0].message.content;

  return typeof content === "string" && content.length > 0
    ? content
    : "(empty reply)";
}

AppSideService(
  BaseSideService({
    onInit() {},

    async onRequest(req, res) {
      console.log("=====>,", req.method);

      if (req.method === "CHAT") {
        const config = this.getConfig();
        if (!config) {
          res(null, { error: "NO_CONFIG" });
          return;
        }

        res(null, { ok: true });
        await this.pushReply(
          config,
          buildMessages(config, req.params.messages)
        );
        return;
      }

      res(null, { error: "UNKNOWN_METHOD" });
    },

    getConfig() {
      const raw = this.settings.getItem("apiConfig");
      if (!raw) return null;
      try {
        const config = JSON.parse(raw);
        if (config && config.baseUrl && config.apiKey && config.model) {
          return config;
        }
        return null;
      } catch (e) {
        return null;
      }
    },

    async pushReply(config, messages) {
      try {
        const reply = await chatCompletion(config, messages);
        const chunks = splitChunks(reply);
        for (let i = 0; i < chunks.length; i++) {
          this.call({
            method: "CHAT_CHUNK",
            params: { seq: i, text: chunks[i], done: i === chunks.length - 1 },
          });
          if (i < chunks.length - 1) await sleep(CHUNK_DELAY);
        }
      } catch (e) {
        console.log("chat error:", e && e.message);
        let detail = String((e && e.message) || e);
        if (e && e.httpStatus) {
          detail += `\n[HTTP ${e.httpStatus}] ${e.requestUrl}`;
          if (e.httpStatus === 401 || e.httpStatus === 403) {
            detail += `\nkey=${maskKey(config.apiKey)}`;
          }
        }
        this.call({
          method: "CHAT_CHUNK",
          params: {
            seq: 0,
            error: detail,
            done: true,
          },
        });
      }
    },

    onSettingsChange({ key }) {
      console.log("settings changed:", key);
    },

    onRun() {},

    onDestroy() {},
  })
);
