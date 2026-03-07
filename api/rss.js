// api/rss.js — Returns an RSS 2.0 feed built from posts.json
// Deployed on Vercel as a serverless function
// URL: https://cnax.ai/api/rss

const REPO_OWNER = 'ckend69';
const REPO_NAME  = 'cnax-site';
const FILE_PATH  = 'posts.json';
const SITE_URL   = 'https://cnax.ai';
const FEED_TITLE = 'CNAX AI Blog — AI for Small Businesses';
const FEED_DESC  = 'Practical AI guides, strategies, and automation tips for small business owners. Published twice daily by the CNAX AI team.';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildRss(posts) {
  const items = posts.slice(0, 50).map(post => {
    const postUrl = `${SITE_URL}/blog.html#${escapeXml(post.slug || '')}`;
    const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
    const excerpt = escapeXml(post.excerpt || stripHtml(post.content || '').slice(0, 200));
    const title   = escapeXml(post.title || 'Untitled');
    const author  = escapeXml(post.author || 'CNAX AI');
    const category = escapeXml(post.category || 'AI Integration');

    return `
    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="false">${SITE_URL}/posts/${post.id || post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>blog@cnax.ai (${author})</author>
      <category>${category}</category>
      <description>${excerpt}</description>
    </item>`;
  }).join('');

  const lastBuild = posts.length > 0 && posts[0].date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog.html</link>
    <description>${escapeXml(FEED_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>720</ttl>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${SITE_URL}/blog.html</link>
    </image>${items}
  </channel>
</rss>`;
}

export default async function handler(req, res) {
  // Allow public access — no auth needed for RSS
  const githubToken = process.env.GITHUB_TOKEN;

  try {
    let posts = [];

    if (githubToken) {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
      const ghRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (ghRes.ok) {
        const data = await ghRes.json();
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        posts = JSON.parse(content);
      }
    }

    const rss = buildRss(posts);

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(rss);
  } catch (err) {
    console.error('RSS error:', err);
    // Return a valid empty feed on error rather than crashing
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.status(200).send(buildRss([]));
  }
}
