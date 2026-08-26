import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import { DEFAULT_COLOR, DEFAULT_COLOR_TRANSPARENT } from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const STATUS_TEXT = {
  x: px(20),
  y: px(58),
  w: DEVICE_WIDTH - px(40),
  h: px(26),
  color: 0x999999,
  text_size: px(18),
  align_h: hmUI.align.CENTER_H,
};

export const CHAT_AREA = {
  top: px(92),
};

export const WELCOME_TEXT = {
  x: px(20),
  y: px(130),
  w: DEVICE_WIDTH - px(40),
  h: px(160),
  color: 0x888888,
  text_size: px(22),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};

export const BUBBLE_STYLE = {
  textSize: px(20),
  padX: px(16),
  padY: px(12),
  gap: px(14),
  marginLeft: px(20),
  marginRight: px(20),
  userMaxW: px(240),
  aiMaxW: px(340),
  minH: px(40),
  radius: px(14),
  userBg: 0x2d71ce,
  userFg: 0xffffff,
  aiBg: 0x333333,
  aiFg: 0xeeeeee,
};

const BTN_MIN_Y = px(316);
const BTN_GAP = px(10);

export const BUTTONS = {
  minY: BTN_MIN_Y,
  gapBelowContent: BTN_GAP,
  w: px(160),
  h: px(58),
  spacing: px(16),
  textSize: px(26),
  tailPadding: px(20),
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
