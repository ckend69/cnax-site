// api/generate.js — called by Vercel Cron twice daily
// Generates a blog post via Groq, saves to posts.json via GitHub API

const REPO_OWNER = 'ckend69';
const REPO_NAME  = 'cnax-site';
const FILE_PATH  = 'posts.json';

const TOPICS = [
  { title: "How AI Integration Can Triple Revenue for Small Businesses", category: "AI Integration" },
  { title: "Building an AI-Powered Sales Funnel That Converts 24/7", category: "Sales Funnels" },
  { title: "5 Ways AI Chatbots Are Replacing Traditional Customer Service", category: "AI Integration" },
  { title: "Workflow Automation: How Small Businesses Save 20+ Hours Per Week", category: "Automation" },
  { title: "AI Marketing Strategies That Outperform Traditional Advertising", category: "Marketing" },
  { title: "Predictive Analytics: How Small Businesses Make Smarter Decisions", category: "Analytics" },
  { title: "The ROI of AI: What Every Small Business Owner Needs to Know", category: "AI Integration" },
  { title: "AI Lead Qualification: Stop Wasting Time on Bad Leads", category: "Sales Funnels" },
  { title: "Email Automation with AI: True Personalization at Scale", category: "Marketing" },
  { title: "How AI Levels the Playing Field Against Corporate Competition", category: "AI Integration" },
  { title: "The Complete Guide to AI Sales Funnels for Service Businesses", category: "Sales Funnels" },
  { title: "Why 80% of Small Business Tasks Can Be Automated with AI", category: "Automation" },
  { title: "AI-Powered Customer Retention: Keep Clients Coming Back", category: "Marketing" },
  { title: "How to Use AI to Generate More Qualified Appointments", category: "Sales Funnels" },
  { title: "CRM Intelligence: Letting AI Manage Your Customer Relationships", category: "AI Integration" },
  { title: "Scaling Your Business Without Hiring: The AI Playbook", category: "Automation" },
  { title: "AI Content Marketing: Creating 30 Days of Content in 1 Hour", category: "Marketing" },
  { title: "The Small Business Guide to AI-Powered Social Media Marketing", category: "Marketing" },
  { title: "How AI Analytics Reveals Hidden Revenue in Your Business", category: "Analytics" },
  { title: "Automating Your Follow-Up Sequence with AI: A Step-by-Step Guide", category: "Sales Funnels" },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function callGroq(apiKey, topic) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.72,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a senior content strategist for CNAX AI — a company that delivers AI integration and AI-powered marketing/sales funnel services to small businesses. Write authoritative, practical blog articles that establish thought leadership, educate readers, and naturally position CNAX AI's services as the solution. Tone: confident, clear, and jargon-free. Always end with a CTA paragraph mentioning CNAX AI.`,
        },
        {
          role: 'user',
          content: `Write a detailed blog article titled: "${topic.title}"

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "title": "the exact title provided",
  "excerpt": "A compelling 2-3 sentence summary that makes people want to read more",
  "content": "Full article HTML using <h2>, <h3>, <p>, <ul>, <li>, <strong> tags. Minimum 600 words. Include actionable insights, real examples, and a final paragraph that mentions CNAX AI and links to getting a free consultation.",
  "readTime": "X min read",
  "category": "${topic.category}"
}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Extract JSON — handle cases where model wraps in markdown
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Groq response');

  return JSON.parse(jsonMatch[0]);
}

async function getPostsFromGitHub(token) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) return { posts: [], sha: null };
  if (!res.ok) throw new Error(`GitHub GET error ${res.status}`);

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { posts: JSON.parse(content), sha: data.sha };
}

async function savePostsToGitHub(token, posts, sha, commitMessage) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const body = { message: commitMessage, content: Buffer.from(JSON.stringify(posts, null, 2)).toString('base64') };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT error ${res.status}: ${err}`);
  }
}

export default async function handler(req, res) {
  // Verify this is a legitimate cron call
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const groqKey    = process.env.GROQ_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!groqKey || !githubToken) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY or GITHUB_TOKEN env vars' });
  }

  try {
    // Pick a topic — rotate through based on day + hour so posts don't repeat
    const seed = Math.floor(Date.now() / (12 * 60 * 60 * 1000)); // changes every 12h
    const topic = TOPICS[seed % TOPICS.length];

    // Generate article
    const article = await callGroq(groqKey, topic);

    // Build post object
    const now = new Date();
    const post = {
      id: Date.now(),
      title: article.title || topic.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      readTime: article.readTime || '5 min read',
      category: article.category || topic.category,
      date: now.toISOString(),
      slug: slugify(article.title || topic.title),
    };

    // Load, prepend, save
    const { posts, sha } = await getPostsFromGitHub(githubToken);
    posts.unshift(post);
    const trimmed = posts.slice(0, 100); // keep last 100 posts
    await savePostsToGitHub(githubToken, trimmed, sha, `blog: "${post.title}"`);

    return res.status(200).json({ success: true, title: post.title });
  } catch (err) {
    console.error('generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
