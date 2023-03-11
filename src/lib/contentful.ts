import contentful from "contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import type { Document } from "@contentful/rich-text-types";

const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.MODE === "development" ? import.meta.env.CONTENTFUL_PREVIEW_KEY : import.meta.env.CONTENTFUL_API_KEY,
  host: import.meta.env.MODE === "development" ? "preview.contentful.com" : "cdn.contentful.com",
});

const renderOptions = {
  renderNode: {
    [INLINES.EMBEDDED_ENTRY]: (node: any, _children: any) => {
      return `
        <div class="article__box--info-item">
          <h6 class="article__box--info">${node.data.target.fields.heading}</h6>
        </div>
        <div class="article__box">
          ${node.data.target.fields.subHeading ? `<h4>${node.data.target.fields.subHeading}</h4>` : ""}
          ${node.data.target.fields.paragraphs && documentToHtmlString(node.data.target.fields.paragraphs)}
        </div>
      `;
    },
    [BLOCKS.HEADING_2]: (node: any, _children: any) => {
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

export { contentfulClient, renderOptions };
export type { Post };
