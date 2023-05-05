class BoersenampelStatus extends HTMLElement {
  latest = {};
  chatId = {
    // channel IDs
    en: -1001869699916,
    de: -1001657145651,
  };
  lang = "de";
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const validLangs = ["de", "en"];
    if (this.getAttribute("lang") === null || !["de", "en"].includes(this.getAttribute("lang"))) {
      console.error("lang attribute must be either 'de' or 'en'");
    } else {
      this.lang = this.getAttribute("lang");
    }
  }

  // Is executed after the web component is connected to the DOM
  connectedCallback() {
    fetch("https://christiankozalla.com/boersenampel.json")
      .then((res) => res.json())
      .then((response) => {
        this.saveLatestPost(this.lang, response.result);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        const template = document.createElement("template");
        template.innerHTML = `<div style="margin: 2rem auto; max-width: 100%; font-size: 1.1rem; padding: 2rem; border: 3px solid #ff6b35">${this.render(
          { text: this.latest[this.lang].text, actions: this.latest[this.lang].entities }
        )}</div>`;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
      });
  }

  render({ text, actions }) {
    // input.slice is working from beginning to end,
    // so the actions (text styles) are applied from beginning to end (to avoid messing up index offsets)
    for (let i = actions.length - 1; i >= 0; i--) {
      text = this.apply(text, actions[i]);
    }
    return text.replaceAll("\n", "<br>");
  }

  apply(input, action) {
    const start = input.slice(0, action.offset);
    const inner = input.slice(action.offset, action.offset + action.length);
    const end = input.slice(action.offset + action.length);
    switch (action.type) {
      case "bold":
        return `${start}<strong>${inner}</strong>${end}`;
      case "text_link":
        return `${start}<a href="${action.url}" rel="noreferrer,noopener" target="_blank">${inner}</a>${end}`;
      default:
        return input;
    }
  }

  saveLatestPost(lang, results) {
    // Filter posts by language
    const postsInLang = results.filter((item) => {
      const [type] = Object.keys(item).filter((key) => key !== "update_id");
      return item[type].forward_from_chat?.id === this.chatId[this.lang];
    });

    // Find latest post
    const updateIds = postsInLang.map((item) => item["update_id"]);
    const foundLatest = postsInLang.find((item) => item["update_id"] === Math.max(...updateIds));
    if (!foundLatest) {
      this.latest[lang] = postsInLang[0];
      return;
    }

    // Assign latest post to this.latest looking for one of these post types (we don't know ahead of time)
    const types = ["message", "channel_post", "edited_message", "edited_channel_post"];

    this.latest[lang] =
      foundLatest[types.find((type) => Object.prototype.hasOwnProperty.call(foundLatest, type)) || ""];
  }
}

customElements.define("boersenampel-status", BoersenampelStatus);
