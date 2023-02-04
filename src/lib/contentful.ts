import * as contentful from "contentful";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Document } from "@contentful/rich-text-types";

const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_API_KEY,
});

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node, _children) => {
      // render the EMBEDDED_ASSET as you need
      return `
      <figure class='article__figure'>
        <img
            src='https:${node.data.target.fields.file.url}'
            alt='${node.data.target.fields.description}'
            loading='lazy'
          >
        </figure>
      `;
    },
  },
};

interface Post {
  title: string;
  slug: string;
  publishedDate: string;
  description: string;
  body: Document;
}

export { contentfulClient, renderOptions };
export type { Post };
