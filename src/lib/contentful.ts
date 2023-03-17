import contentful from "contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import type { Document } from "@contentful/rich-text-types";

const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken:
    import.meta.env.MODE !== "development"
      ? import.meta.env.CONTENTFUL_API_KEY
      : import.meta.env.CONTENTFUL_PREVIEW_KEY,
  host: import.meta.env.MODE !== "development" ? "cdn.contentful.com" : "preview.contentful.com",
});

const renderOptions = {
  renderNode: {
    [BLOCKS.UL_LIST]: (node: any, children: any) => `<ul class="article__list">${children(node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (node: any, children: any) => `<ol class="article__list">${children(node.content)}</ol>`,
    [BLOCKS.HEADING_2]: (node: any, _children: any) => {
      const inlineEntry = node.content.find((data: any) => data.nodeType === "embedded-entry-inline");
      if (typeof inlineEntry !== "undefined") {
        if (inlineEntry.data.target.sys.contentType.sys.id === "tocHeadline") return renderTocHeadline(inlineEntry as Node<TocHeadline>);
        else {
          console.log("Unknown content type: " + inlineEntry.data.target.sys.contentType.sys.id);
          return "";
        }
      }
      const text = node.content.find((data: any) => data.nodeType === "text").value;
      return `
        <h2 class="article__heading-two" id=${"point-" + encodeURIComponent(text.replace(" ", "-"))}>${text}</h2>
      `;
    },
    [BLOCKS.EMBEDDED_ASSET]: (node: any, _children: any) => {
      // render the EMBEDDED_ASSET as you need
      return `
      <figure class='article__figure'>
        <img
            src='https:${node.data.target.fields.file.url}'
            alt='${node.data.target.fields.description?.replace("[caption]", "") || ""}'
            loading='lazy'>
        ${
          node.data.target.fields.description?.startsWith("[caption]")
            ? figcaptionWithParsedMarkdownLink(node.data.target.fields.description?.replace("[caption]", ""))
            : ""
        }
        </figure>
      `;
    },
    [INLINES.EMBEDDED_ENTRY]: (node: any, _children: any) => {
      switch (node.data.target.sys.contentType.sys.id) {
        case "postInfoBox":
          return renderPostInfoBox(node as Node<PostInfoBox>);
        case "webComponent":
          return renderWebComponent(node as Node<WebComponent>);
        case "tocHeadline":
          return renderTocHeadline(node as Node<TocHeadline>);
        case "inlineHtml":
          return node.data.target.fields.code;
        default:
          console.log("Unknown content type: " + node.data.target.sys.contentType.sys.id);
          return "";
      }
    },
  },
};

function figcaptionWithParsedMarkdownLink(text: string) {
  const regex = /(.*?)\[(.*?)\]\((.*?)\)(.*)/g;
  const match = regex.exec(text);
  if (match) {
    return `<figcaption>${match[1]}<a href='${match[3]}'>${match[2]}</a>${match[4]}</figcaption>`;
  } else {
    return `<figcaption>${text}</figcaption>`;
  }
}

function renderPostInfoBox(node: Node<PostInfoBox>) {
  return `
  <div class="article__box--info-item">
    <h6 class="article__box--info">${node.data.target.fields.heading}</h6>
  </div>
  <div class="article__box">
    ${node.data.target.fields.subHeading ? `<h4>${node.data.target.fields.subHeading}</h4>` : ""}
    ${node.data.target.fields.paragraphs && documentToHtmlString(node.data.target.fields.paragraphs)}
  </div>
`;
}

function renderWebComponent(node: Node<WebComponent>) {
  return `
  <script type="module" src="${node.data.target.fields.source}"></script>
  <${node.data.target.fields.htmlTag}></${node.data.target.fields.htmlTag.split(" ")[0]}>
  `;
}

function renderTocHeadline(node: Node<TocHeadline>) {
  return `
    <h2
      class="article__heading-two"
      data-toclink="${node.data.target.fields.tocLink}"
      id=${"point-" + encodeURIComponent(node.data.target.fields.text.replace(" ", "-"))}
    >
      ${node.data.target.fields.text}
    </h2>
  `;
}

interface Post {
  title: string;
  slug: string;
  category: string;
  published?: string;
  description?: string;
  seoDescription?: string;
  body: Document;
  author: { fields: { name: string; avatar?: object; bio?: string } };
  heroImage?: Record<string, any>;
}

interface Node<T> {
  data: {
    target: {
      fields: T;
    };
  };
}

interface WebComponent {
  htmlTag: string;
  source: string;
}

interface PostInfoBox {
  heading: string;
  subHeading?: string;
  paragraphs?: Document;
}

interface TocHeadline {
  text: string;
  tocLink: string;
}

export { contentfulClient, renderOptions };
export type { Post };
