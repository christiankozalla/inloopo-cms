import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { youtube } from "./youtube.mjs";

export function generateVideoSitemap({ sitemapFilename, filter = () => true }) {
    if (!sitemapFilename) {
        throw new Error(`Provide a filename for the video-sitemap - e.g. generateVideoSitemap({ sitemapFilename: "video-sitemap.xml" })`)
    }
    let baseUrl = "";
    return {
        name: "video-sitemap",
        hooks: {
            "astro:config:done": ({ config }) => {
                baseUrl = config.site;
            },
            "astro:build:done": async ({ dir, pages }) => {

                pages = pages.filter(filter).map(({ pathname }) => ({
                    pathname,
                    fullUrl: new URL(pathname, baseUrl),
                    indexFileUrl: new URL(pathname + "index.html", dir),
                }));

                const xmlForEachPage = [];
                for (const page of pages) {
                    const content = await readFile(fileURLToPath(page.indexFileUrl), { encoding: "utf-8" });
                    page.iframes = extractIframes(content);
                    const videos = {};
                    const videoIds = page.iframes.map((iframe) => extractVideoId(iframe.src));
                    for (let i = 0; i < videoIds.length; i++) {
                        const videoId = videoIds[i];
                        try {
                            const res = await youtube.videos.list({
                                part: "snippet",
                                id: videoId,
                            });

                            if (res.data.items.length && res.data.items[0]?.snippet) {
                                videos[videoId] = { ...res.data.items[0] };
                                videos[videoId].videoXml = videoXmlSnippet({
                                    playerLoc: page.iframes[i].src,
                                    ...res.data.items[0].snippet,
                                });
                            }
                        } catch (err) {
                            console.error(`Error: fetching youtube video ${videoId}`, err);
                            continue;
                        }
                    }

                    // Create url entry only if there are videos on the page
                    if (Object.values(videos).length) {
                        let xmlPage = `
                            <url>
                                <loc>${page.fullUrl}</loc>
                                ${Object.values(videos)
                                .map((data) => data.videoXml)
                                .join("\n")}
                            </url>`;

                        xmlForEachPage.push(xmlPage);
                    }
                }

                const sitemapContent = `
                    <?xml version="1.0" encoding="UTF-8"?>
                    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
                            ${xmlForEachPage.join("\n")}
                    </urlset>`;

                await writeFile(
                    fileURLToPath(new URL(sitemapFilename, dir)),
                    sitemapContent.replace(/\s{2,}/g, ""),
                );
            },
        },
    };
}

function videoXmlSnippet({ title, playerLoc, publishedAt, channelId, description, thumbnails, defaultAudioLanguage }) {
    return `
    <video:video>
      ${thumbnails?.medium?.url ? `<video:thumbnail_loc>${thumbnails.medium.url}</video:thumbnail_loc>` : ``}
      <video:title>${title}</video:title>
      <video:description>
        ${description}
      </video:description>
      <video:publication_date>${publishedAt}</video:publication_date>
      <video:player_loc>
        ${playerLoc}
      </video:player_loc>
    </video:video>
    `;
}

// Function to extract video ID from YouTube iframe src URL
function extractVideoId(iframeSrc) {
    const match = iframeSrc.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (match && match.length >= 2) {
        return match[1];
    } else {
        return null;
    }
}

function extractIframes(htmlString) {
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const iframes = [];
    let match;

    while ((match = iframeRegex.exec(htmlString)) !== null) {
        const src = match[1];
        iframes.push({ src });
    }

    return iframes;
}

//
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//     xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
//   <url>
//     <loc>https://www.example.com/videos/some_video_landing_page.html</loc>
//     <video:video>
//       <video:thumbnail_loc>https://www.example.com/thumbs/345.jpg</video:thumbnail_loc>
//       <video:title>John teaches cheese</video:title>
//       <video:description>
//         John explains the differences between a banana and cheese.
//       </video:description>
//       <video:player_loc>
//         https://www.youtube.com/embed/1a2b3c4d
//       </video:player_loc>
//     </video:video>
//   </url>
// </urlset>

// {
//     kind: 'youtube#video',
//     etag: 'zTUQf4k0xgEFzaqAu5E41m15Se0',
//     id: 'P_X8gdJqbgM',
//     snippet: {
//       publishedAt: '2023-06-28T13:00:16Z',
//       channelId: 'UCR9IILqtrl_21L8hbtDqhxA',
//       title: 'Sector Rotation explained with free Tool',
//       description: 'Learn to use Sector Rotation Analysis to improve your investments.\n' +
//         '\n' +
//         '** SECTOR ROTATION TOOL **\n' +
//         'https://www.inloopo.com/sector-rotation/\n' +
//         '\n' +
//         '00:00 Introduction\n' +
//         '00:31 What is sector rotation?\n' +
//         '00:53 My sector rotation model\n' +
//         '01:42 S&P 500 Sector Weighting\n' +
//         '02:25 NASDAQ Sector Weighting\n' +
//         '03:10 Dow Jones Sector Weighting\n' +
//         '04:25 Sector Rotation Tool\n' +
//         '06:01 Sector Rotation Model\n' +
//         '06:56 Sector Rotation in TradingView\n' +
//         '08:38 How to use Sector Rotation\n' +
//         '\n' +
//         '------------------------------------------------------\n' +
//         '** ABOUT PHILIPP KOZALLA **\n' +
//         'https://www.inloopo.com/about/\n' +
//         '\n' +
//         '** MY SOCIALS **\n' +
//         'https://www.facebook.com/Philipp123456\n' +
//         '\n' +
//         'Any questions or any feedback please comment below! 👇🏻👇🏻👇🏻\n' +
//         '\n' +
//         '--------------------------------------------------\n' +
//         'Risk Disclosure: Futures and forex trading contains substantial risk and is not for every investor. An investor could potentially lose all or more than the initial investment. Risk capital is money that can be lost without jeopardizing ones’ financial security or life style. Only risk capital should be used for trading and only those with sufficient risk capital should consider trading. Past performance is not necessarily indicative of future results. \n' +
//         '\n' +
//         'Hypothetical Performance Disclosure: Hypothetical performance results have many inherent limitations, some of which are described below. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown; in fact, there are frequently sharp differences between hypothetical performance results and the actual results subsequently achieved by any particular trading program. One of the limitations of hypothetical performance results is that they are generally prepared with the benefit of hindsight. In addition, hypothetical trading does not involve financial risk, and no hypothetical trading record can completely account for the impact of financial risk of actual trading. for example, the ability to withstand losses or to adhere to a particular trading program in spite of trading losses are material points which can also adversely affect actual trading results. There are numerous other factors related to the markets in general or to the implementation of any specific trading program which cannot be fully accounted for in the preparation of hypothetical performance results and all which can adversely affect trading results.',
//       thumbnails: [Object],
//       channelTitle: 'inloopo Trading',
//       categoryId: '27',
//       liveBroadcastContent: 'none',
//       defaultLanguage: 'en',
//       localized: [Object],
//       defaultAudioLanguage: 'en'
//     }
//   }
