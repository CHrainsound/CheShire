import { PRESETS, findPreset } from "./presets";
import { gettext } from "i18n";

const FIELDS = [
  {
    key: "baseUrl",
    labelKey: "field_base_url",
    hintKey: "hint_base_url",
    clean: cleanUrl,
  },
  {
    key: "apiKey",
    labelKey: "field_api_key",
    hintKey: "hint_api_key",
    clean: cleanSecret,
  },
  {
    key: "model",
    labelKey: "field_model",
    hintKey: "hint_model",
    clean: cleanSecret,
  },
];

function stripWrappers(val) {
  return String(val == null ? "" : val)
    .replace(/^[\s"'`]+/, "")
    .replace(/[\s"'`]+$/, "")
    .trim();
}

function cleanSecret(val) {
  return stripWrappers(val);
}

function cleanUrl(val) {
  return stripWrappers(val).replace(/\/+$/, "");
}

const CARD = {
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  padding: "12px 14px",
  marginBottom: "12px",
};

const SECTION_TITLE = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#409EFF",
  marginBottom: "8px",
};

const HINT_TEXT = {
  fontSize: "11px",
  color: "#aaaaaa",
  marginTop: "2px",
};

AppSettingsPage({
  build(props) {
    let config = {};
    try {
      const raw = props.settingsStorage.getItem("apiConfig");
      if (raw) config = JSON.parse(raw) || {};
    } catch (e) {
      config = {};
    }

    if (!config.preset) config.preset = "custom";

    const save = () => {
      props.settingsStorage.setItem("apiConfig", JSON.stringify(config));
    };

    const applyPreset = (key) => {
      config.preset = key;
      const preset = findPreset(key);
      if (preset && key !== "custom") {
        if (preset.baseUrl) config.baseUrl = preset.baseUrl;
        if (preset.model) config.model = preset.model;
      }
      save();
    };

    const providerCard = View({ style: CARD }, [
      View({ style: SECTION_TITLE }, [gettext("section_provider")]),
      Select({
        label: gettext("select_provider"),
        value: config.preset,
        options: PRESETS.map((p) => ({ name: p.name, value: p.key })),
        onChange: (value) => {
          applyPreset(value);
        },
      }),
      View({ style: HINT_TEXT }, [gettext("hint_provider")]),
    ]);

    const apiCard = View({ style: CARD }, [
      View({ style: SECTION_TITLE }, [gettext("section_api")]),
      ...FIELDS.map((field) =>
        View(
          {
            style: {
              borderBottom: "1px solid #f0f0f0",
              padding: "6px 0",
            },
          },
          [
            TextInput({
              label: gettext(field.labelKey),
              value: config[field.key] || "",
              subStyle: {
                fontSize: "14px",
                color: "#333",
              },
              maxLength: 300,
              onChange: (val) => {
                config[field.key] = field.clean(val);
                save();
              },
            }),
            View({ style: HINT_TEXT }, [gettext(field.hintKey)]),
          ]
        )
      ),
    ]);

const ROW = {
  borderBottom: "1px solid #f0f0f0",
  padding: "6px 0",
};

const advCard = View({ style: CARD }, [
  View({ style: SECTION_TITLE }, [gettext("section_advanced")]),
  View({ style: ROW }, [
    Toggle({
      label: gettext("toggle_thinking"),
      value: config.thinking === true,
      onChange: (value) => {
        config.thinking = value;
        save();
      },
    }),
    View({ style: HINT_TEXT }, [gettext("hint_thinking")]),
  ]),
  View({ style: ROW }, [
    Select({
      label: gettext("select_effort"),
      value: config.reasoningEffort || "high",
      options: [
        { name: "low", value: "low" },
        { name: "high", value: "high" },
        { name: "max", value: "max" },
      ],
      onChange: (value) => {
        config.reasoningEffort = value;
        save();
      },
    }),
  ]),
  View({ style: ROW }, [
    Select({
      label: gettext("select_lang"),
      value: config.replyLang || "auto",
      options: [
        { name: gettext("lang_auto"), value: "auto" },
        { name: gettext("lang_zh"), value: "zh" },
        { name: gettext("lang_en"), value: "en" },
      ],
      onChange: (value) => {
        config.replyLang = value;
        save();
      },
    }),
  ]),
  View({ style: ROW }, [
    TextInput({
      label: gettext("field_system_prompt"),
      value: config.systemPrompt || "",
      subStyle: {
        fontSize: "14px",
        color: "#333",
      },
      maxLength: 300,
      onChange: (val) => {
        config.systemPrompt = stripWrappers(val);
        save();
      },
    }),
    View({ style: HINT_TEXT }, [gettext("hint_system_prompt")]),
  ]),
]);

    return View(
      {
        style: {
          padding: "14px 16px 20px 16px",
          backgroundColor: "#f5f6f7",
          minHeight: "100%",
        },
      },
      [
        View(
          {
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "12px",
            },
          },
          [gettext("settings_title")],
        ),
        providerCard,
        apiCard,
        advCard,
        View(
          {
            style: {
              marginTop: "4px",
              fontSize: "11px",
              color: "#999999",
              textAlign: "center",
            },
          },
          [gettext("footer_hint")]
        ),
      ]
    );
  },
});
