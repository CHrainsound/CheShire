import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { LocalStorage } from "@zos/storage";
import { setInterval, clearInterval } from "@zos/timer";
import { setPageBrightTime } from "@zos/display";
import { getText } from "@zos/i18n";
import {
  createKeyboard,
  deleteKeyboard,
  inputType,
  getTextLayout,
} from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import {
  STATUS_TEXT,
  CHAT_AREA,
  WELCOME_TEXT,
  BUBBLE_STYLE,
  BUTTONS,
  ASK_BUTTON,
  CLEAR_BUTTON,
} from "zosLoader:./index.[pf].layout.js";
import { DEVICE_WIDTH } from "../utils/config/device";

const logger = Logger.getLogger("ai_chat");

const WELCOME_KEY = "welcome";
const ASK_LABEL_KEY = "btn_ask";
const CLEAR_LABEL_KEY = "btn_clear";
const NO_CONFIG_KEY = "err_no_config";
const CONN_FAILED_KEY = "err_conn_failed";
const ERROR_PREFIX_KEY = "err_prefix";
const MAX_CONTEXT_MESSAGES = 8;
const MAX_RENDER_MESSAGES = 12;
const MAX_SAVED_MESSAGES = 20;
const MAX_SAVED_CONTENT_CHARS = 2000;
const STORAGE_KEY = "chatHistory";

const localStorage = new LocalStorage();

Page(
  BasePage({
    state: {
      messages: [],
      busy: false,
      replyBuf: "",
      bubbles: [],
      nextY: CHAT_AREA.top,
    },

    build() {
      this.state.messages = [];
      this.state.busy = false;
      this.state.replyBuf = "";
      this.state.bubbles = [];
      this.state.nextY = CHAT_AREA.top;
      this.typingTimer = null;
      this.typingDots = 0;
      this.keepAwakeTimer = null;

      const restored = this.loadHistory();
      if (restored) {
        this.state.messages = restored;
      }

      this.statusWidgetRef = hmUI.createWidget(hmUI.widget.TEXT, {
        ...STATUS_TEXT,
        text: "",
      });

      if (restored && restored.length > 0) {
        this.rerenderFromHistory();
      } else {
        this.showWelcome();
      }

      this.askBtnRef = this.createButton(
        { ...ASK_BUTTON, text: getText(ASK_LABEL_KEY) },
        () => this.startInput(),
        0
      );
      this.clearBtnRef = this.createButton(
        { ...CLEAR_BUTTON, text: getText(CLEAR_LABEL_KEY) },
        () => this.clearChat(),
        1
      );
      this.spacerRef = hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: BUTTONS.minY + BUTTONS.h,
        w: DEVICE_WIDTH,
        h: BUTTONS.tailPadding,
        color: 0x000000,
      });
      this.relayoutButtons(true);
    },

    createButton(style, onClick, index) {
      const btnY = Number.isInteger(this.btnY) ? this.btnY : BUTTONS.minY;
      const totalW = 2 * BUTTONS.w + BUTTONS.spacing;
      return hmUI.createWidget(hmUI.widget.BUTTON, {
        x: (DEVICE_WIDTH - totalW) / 2 + index * (BUTTONS.w + BUTTONS.spacing),
        y: btnY,
        w: BUTTONS.w,
        h: BUTTONS.h,
        text_size: BUTTONS.textSize,
        radius: 12,
        ...style,
        click_func: onClick,
      });
    },

    relayoutButtons(force) {
      const targetY = Math.max(
        BUTTONS.minY,
        this.state.nextY + BUTTONS.gapBelowContent
      );
      if (!force && targetY === this.btnY) return;
      this.btnY = targetY;
      if (this.askBtnRef) this.askBtnRef.setProperty(hmUI.prop.Y, targetY);
      if (this.clearBtnRef) this.clearBtnRef.setProperty(hmUI.prop.Y, targetY);
      if (this.spacerRef) {
        this.spacerRef.setProperty(hmUI.prop.Y, targetY + BUTTONS.h);
      }
    },

    showWelcome() {
      if (this.welcomeWidgetRef) return;
      this.welcomeWidgetRef = hmUI.createWidget(hmUI.widget.TEXT, {
        ...WELCOME_TEXT,
        text: getText(WELCOME_KEY),
      });
    },

    hideWelcome() {
      if (this.welcomeWidgetRef) {
        hmUI.deleteWidget(this.welcomeWidgetRef);
        this.welcomeWidgetRef = null;
      }
    },

    setStatus(text) {
      if (this.statusWidgetRef) {
        this.statusWidgetRef.setProperty(hmUI.prop.TEXT, text || "");
      }
    },

    loadHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const messages = JSON.parse(raw);
        if (!Array.isArray(messages)) return null;
        return messages.filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        );
      } catch (e) {
        logger.log("load history failed");
        return null;
      }
    },

    saveHistory() {
      try {
        const trimmed = this.state.messages
          .slice(-MAX_SAVED_MESSAGES)
          .map((m) => ({
            role: m.role,
            content:
              m.content.length > MAX_SAVED_CONTENT_CHARS
                ? m.content.slice(0, MAX_SAVED_CONTENT_CHARS)
                : m.content,
          }));
        this.state.messages = trimmed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (e) {
        logger.log("save history failed");
      }
    },

    measureText(text, width, wrapped) {
      const result = getTextLayout(text, {
        text_size: BUBBLE_STYLE.textSize,
        text_width: wrapped ? width : 0,
        wrapped: wrapped ? 1 : 0,
      });
      return result || {};
    },

    buildBubbleGeometry(role, content) {
      const st = BUBBLE_STYLE;
      const isUser = role === "user";
      const maxW = isUser ? st.userMaxW : st.aiMaxW;
      const innerW = maxW - 2 * st.padX;

      const wrapped = this.measureText(content, innerW, true);
      const single = this.measureText(content, 0, false);
      const textH = Math.max(wrapped.height || 0, st.minH - 2 * st.padY);
      const boxW = Math.min(maxW, (single.width || innerW) + 2 * st.padX);
      const boxH = textH + 2 * st.padY;
      const x = isUser
        ? DEVICE_WIDTH - st.marginRight - boxW
        : st.marginLeft;

      return { x, y: 0, w: boxW, h: Math.max(boxH, st.minH), innerW, textH };
    },

    renderBubble(role, content, y) {
      const st = BUBBLE_STYLE;
      const geo = this.buildBubbleGeometry(role, content);
      geo.y = y;

      const bg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: geo.x,
        y: geo.y,
        w: geo.w,
        h: geo.h,
        radius: st.radius,
        color: role === "user" ? st.userBg : st.aiBg,
      });
      const txt = hmUI.createWidget(hmUI.widget.TEXT, {
        x: geo.x + st.padX,
        y: geo.y + st.padY,
        w: geo.innerW,
        h: geo.textH,
        color: role === "user" ? st.userFg : st.aiFg,
        text_size: st.textSize,
        align_h: hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.WRAP,
        text: content,
      });

      const bubble = { role, y, bg, txt, h: geo.h };
      this.state.nextY = y + geo.h + st.gap;
      this.state.bubbles.push(bubble);
      return bubble;
    },

    deleteBubble(bubble) {
      if (bubble.bg) hmUI.deleteWidget(bubble.bg);
      if (bubble.txt) hmUI.deleteWidget(bubble.txt);
    },

    appendBubble(role, content) {
      this.hideWelcome();
      this.renderBubble(role, content, this.state.nextY);

      if (this.state.bubbles.length > MAX_RENDER_MESSAGES) {
        this.rerenderFromHistory();
        return;
      }

      this.relayoutButtons();
    },

    updateLastBubble(content) {
      const bubble = this.state.bubbles[this.state.bubbles.length - 1];
      if (!bubble) return;

      const geo = this.buildBubbleGeometry(bubble.role, content);
      geo.y = bubble.y;

      if (Math.abs(geo.h - bubble.h) > 2) {
        this.deleteBubble(bubble);
        this.state.bubbles.pop();
        this.renderBubble(bubble.role, content, bubble.y);
        const rebuilt = this.state.bubbles[this.state.bubbles.length - 1];
        rebuilt.pending = true;
      } else {
        bubble.txt.setProperty(hmUI.prop.TEXT, content);
      }

      this.relayoutButtons();
    },

    rerenderFromHistory() {
      for (const b of this.state.bubbles) this.deleteBubble(b);
      this.state.bubbles = [];
      this.state.nextY = CHAT_AREA.top;

      const visible = this.state.messages.slice(-MAX_RENDER_MESSAGES);
      for (const msg of visible) {
        this.renderBubble(msg.role, msg.content, this.state.nextY);
      }

      if (this.state.replyBuf.length > 0) {
        this.renderBubble("assistant", this.state.replyBuf, this.state.nextY);
        const created = this.state.bubbles[this.state.bubbles.length - 1];
        if (created) created.pending = true;
      }

      this.relayoutButtons(true);
    },

    clearBubbles() {
      for (const b of this.state.bubbles) this.deleteBubble(b);
      this.state.bubbles = [];
      this.state.nextY = CHAT_AREA.top;
    },

    startTyping() {
      this.hideWelcome();
      this.appendBubble("assistant", ".");
      const created = this.state.bubbles[this.state.bubbles.length - 1];
      if (!created) return;
      created.pending = true;
      this.typingDots = 1;
      this.startKeepAwake();

      this.typingTimer = setInterval(() => {
        if (!this.state.busy) {
          this.stopTyping();
          return;
        }
        const b = this.state.bubbles[this.state.bubbles.length - 1];
        if (!b || !b.pending || !b.txt) return;
        this.typingDots = (this.typingDots % 3) + 1;
        try {
          b.txt.setProperty(hmUI.prop.TEXT, ".".repeat(this.typingDots));
        } catch (e) {
          this.stopTyping();
        }
      }, 400);
    },

    stopTyping() {
      if (this.typingTimer !== null && this.typingTimer !== undefined) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
    },

    startKeepAwake() {
      if (this.keepAwakeTimer !== null && this.keepAwakeTimer !== undefined) {
        return;
      }
      const refresh = () => {
        if (!this.state.busy) {
          this.stopKeepAwake();
          return;
        }
        const result = setPageBrightTime({ brightTime: 60000 });
        if (result !== 0) {
          logger.log("setPageBrightTime failed:", result);
        }
      };
      refresh();
      this.keepAwakeTimer = setInterval(refresh, 60000);
    },

    stopKeepAwake() {
      if (this.keepAwakeTimer !== null && this.keepAwakeTimer !== undefined) {
        clearInterval(this.keepAwakeTimer);
        this.keepAwakeTimer = null;
      }
    },

    startInput() {
      if (this.state.busy) return;
      createKeyboard({
        inputType: inputType.CHAR,
        onComplete: (_, result) => {
          deleteKeyboard();
          const text = (result && result.data) || "";
          if (text.trim().length > 0) {
            this.sendChat(text.trim());
          }
        },
        onCancel: () => {
          deleteKeyboard();
        },
      });
    },

    clearChat() {
      this.stopTyping();
      this.stopKeepAwake();
      this.state.messages = [];
      this.state.replyBuf = "";
      this.state.busy = false;
      this.clearBubbles();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        logger.log("remove history failed");
      }
      this.setStatus("");
      this.showWelcome();
      this.relayoutButtons(true);
    },

    sendChat(text) {
      this.state.busy = true;
      this.state.replyBuf = "";
      this.setStatus("");
      this.state.messages.push({ role: "user", content: text });
      this.saveHistory();
      this.appendBubble("user", text);
      this.startTyping();

      const context = this.state.messages.slice(-MAX_CONTEXT_MESSAGES);
      this.request({
        method: "CHAT",
        params: {
          messages: context,
        },
      })
        .then((data) => {
          if (data && data.error === "NO_CONFIG") {
            this.fail(getText(NO_CONFIG_KEY));
            this.rollbackLastUserMessage();
          }
        })
        .catch(() => {
          this.fail(getText(CONN_FAILED_KEY));
          this.rollbackLastUserMessage();
        });
    },

    onCall(data) {
      if (!data || data.method !== "CHAT_CHUNK" || !data.params) return;

      const { text, error, done } = data.params;

      if (error) {
        this.fail(`${getText(ERROR_PREFIX_KEY)}${error}`);
        return;
      }

      this.stopTyping();
      this.state.replyBuf += text || "";

      const lastBubble = this.state.bubbles[this.state.bubbles.length - 1];
      if (lastBubble && lastBubble.role === "assistant" && lastBubble.pending) {
        this.updateLastBubble(this.state.replyBuf);
      } else {
        this.appendBubble("assistant", this.state.replyBuf);
        const created = this.state.bubbles[this.state.bubbles.length - 1];
        if (created) created.pending = true;
      }

      if (done) {
        this.state.busy = false;
        this.stopKeepAwake();
        const last = this.state.bubbles[this.state.bubbles.length - 1];
        if (last) last.pending = false;
        this.state.messages.push({
          role: "assistant",
          content: this.state.replyBuf,
        });
        this.state.replyBuf = "";
        this.saveHistory();
        logger.log("reply complete");
      }
    },

    fail(message) {
      this.state.busy = false;
      this.stopTyping();
      this.stopKeepAwake();
      this.state.replyBuf = "";
      this.setStatus(message);

      const last = this.state.bubbles[this.state.bubbles.length - 1];
      if (last && last.role === "assistant" && last.pending) {
        this.deleteBubble(last);
        this.state.bubbles.pop();
        this.state.nextY = last.y;
        this.showWelcomeIfEmpty();
        this.relayoutButtons(true);
      }
    },

    rollbackLastUserMessage() {
      const lastMsg = this.state.messages[this.state.messages.length - 1];
      if (!lastMsg || lastMsg.role !== "user") return;
      this.state.messages.pop();
      this.saveHistory();

      const lastBubble = this.state.bubbles[this.state.bubbles.length - 1];
      if (lastBubble && lastBubble.role === "user") {
        this.deleteBubble(lastBubble);
        this.state.bubbles.pop();
        this.state.nextY = lastBubble.y;
      }
      this.showWelcomeIfEmpty();
      this.relayoutButtons(true);
    },

    showWelcomeIfEmpty() {
      if (this.state.bubbles.length === 0 && !this.state.busy) {
        this.showWelcome();
      }
    },
  })
);
