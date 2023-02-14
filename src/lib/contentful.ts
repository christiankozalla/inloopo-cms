import contentful from "contentful";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Document } from "@contentful/rich-text-types";

const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_API_KEY,
});

const renderOptions = {
  renderNode: {
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
  heroImage?: object;
}

export { contentfulClient, renderOptions };
export type { Post };
