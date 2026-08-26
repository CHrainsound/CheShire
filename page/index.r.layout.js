import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import { DEFAULT_COLOR, DEFAULT_COLOR_TRANSPARENT } from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const STATUS_TEXT = {
  x: (DEVICE_WIDTH - px(360)) / 2,
  y: px(44),
  w: px(360),
  h: px(28),
  color: 0x999999,
  text_size: px(20),
  align_h: hmUI.align.CENTER_H,
};

export const CHAT_AREA = {
  top: px(80),
};

export const WELCOME_TEXT = {
  x: px(50),
  y: px(110),
  w: DEVICE_WIDTH - px(100),
  h: px(180),
  color: 0x888888,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const BUBBLE_STYLE = {
  textSize: px(22),
  padX: px(20),
  padY: px(14),
  gap: px(16),
  marginLeft: px(50),
  marginRight: px(50),
  userMaxW: px(290),
  aiMaxW: px(380),
  minH: px(44),
  radius: px(16),
  userBg: 0x2d71ce,
  userFg: 0xffffff,
  aiBg: 0x333333,
  aiFg: 0xeeeeee,
};

const BTN_MIN_Y = px(336);
const BTN_GAP = px(12);

export const BUTTONS = {
  minY: BTN_MIN_Y,
  gapBelowContent: BTN_GAP,
  w: px(164),
  h: px(58),
  spacing: px(18),
  textSize: px(26),
  tailPadding: px(90),
};

export const ASK_BUTTON = {
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "ASK",
};

export const CLEAR_BUTTON = {
  normal_color: 0x555555,
  press_color: 0x333333,
  text: "CLEAR",
};
