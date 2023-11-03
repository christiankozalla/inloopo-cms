import contentful from "contentful";
import type { EntryFieldTypes, Asset } from "contentful";
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


function renderOptionsAndVideos() {
  const videos: VideoNode[] = [];
  const renderOptions = {
    renderNode: {
      [INLINES.HYPERLINK]: (node: any, next: any) => {
        return `<a href="${node.data.uri}"${(node.data.uri.includes('inloopo.com') || node.data.uri.startsWith('/')) ? '' : ' target="_blank"'}>${next(node.content)}</a>`;
      },
      [BLOCKS.TABLE]: (node: any, children: any) =>
        `<div class="article__table"><table>${children(node.content)}</table></div>`,
      [BLOCKS.UL_LIST]: (node: any, children: any) => `<ul class="article__list">${children(node.content)}</ul>`,
      [BLOCKS.OL_LIST]: (node: any, children: any) => `<ol class="article__list">${children(node.content)}</ol>`,
      [BLOCKS.HEADING_2]: (node: any, _children: any) => {
        const inlineEntry = node.content.find((data: any) => data.nodeType === "embedded-entry-inline");
        if (typeof inlineEntry !== "undefined") {
          if (inlineEntry.data.target.sys.contentType.sys.id === "tocHeadline")
            return renderTocHeadline(inlineEntry as Node<TocHeadline>);
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
        ${node.data.target.fields.description?.startsWith("[caption]")
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
          case "youtubeVideo":
            videos.push(node);
            return renderYoutubeVideo(node);
          case "inlineHtml":
            return node.data.target.fields.code;
          default:
            console.log("Unknown content type: " + node.data.target.sys.contentType.sys.id);
            return "";
        }
      },
    },
  };
  return {
    videos,
    renderOptions
  };
}


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

function renderYoutubeVideo(node: Node<YoutubeVideo>) {
  // node.data.target.videoId - e.g. P_X8gdJqbgM as in https://www.youtube.com/watch?v=P_X8gdJqbgM
  // node.data.target.title - e.g. "Sector Rotation explained with free Tool"
  return `
    <iframe class="article__figure" width="100%" height="auto" style="display: block; margin: 24px auto; aspect-ratio: 16 / 9" loading="lazy" src="https://www.youtube-nocookie.com/embed/${node.data.target.fields.videoId}?controls=0" title=${node.data.target.fields.title} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  `;
}

interface Post {
  contentTypeId: "post" | "englishPost";
  fields: {
    title: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    category: EntryFieldTypes.Text;
    published?: EntryFieldTypes.Date;
    description: EntryFieldTypes.Text;
    seoDescription: EntryFieldTypes.Text;
    body: Document;
    author: EntryFieldTypes.EntryLink<Author>;
    heroImage: EntryFieldTypes.AssetLink;
  };
}

interface StockMarketIndicatorPost {
  contentTypeId: "stockMarketIndicatorPost" | "englishStockMarketIndicatorPost";
  fields: {
    title: EntryFieldTypes.Text;
    date: EntryFieldTypes.Date;
    content: Document;
  };
}

interface Author {
  contentTypeId: string;
  fields: {
    name: EntryFieldTypes.Text;
    avatar?: Asset;
    bio?: EntryFieldTypes.Text;
  };
}

interface ChartData {
  phase: EntryFieldTypes.Text;
  englishPhase: EntryFieldTypes.Text;
  data: EntryFieldTypes.Text;
}

interface Node<T> {
  data: {
    target: {
      fields: T;
    };
  };
}

interface VideoNode {
  nodeType: 'embedded-entry-inline';
  data: {
    target: {
      sys: { createdAt: string },
      fields: { title: string, videoId: string }
    }
  }
  content: any[];
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

interface YoutubeVideo {
  videoId: string;
  title: string;
}

export { contentfulClient, renderOptionsAndVideos };
export type { Post, ChartData, StockMarketIndicatorPost, VideoNode };
