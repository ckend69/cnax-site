// api/generate.js — called by Vercel Cron twice daily
// Generates a blog post via Groq, saves to posts.json via GitHub API

const REPO_OWNER = 'ckend69';
const REPO_NAME  = 'cnax-site';
const FILE_PATH  = 'posts.json';

const AUTHORS = ['Collin Kendra', 'Nathan Bott', 'Alex Butera'];

const TOPICS = [
  // ── General AI & Automation ──────────────────────────────────────────────
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
  { title: "Is Your Small Business AI-Ready? 5 Signs It's Time to Automate", category: "AI Integration" },
  { title: "The True Cost of Not Using AI: What Manual Processes Are Costing You", category: "AI Integration" },
  { title: "AI vs. Hiring: When Automation Beats Adding Headcount", category: "Automation" },
  { title: "How to Choose the Right AI Tools for Your Small Business in 2025", category: "AI Integration" },
  { title: "What Is AI Integration and Why Does Your Business Need It Now", category: "AI Integration" },
  { title: "The 5 Most Common AI Mistakes Small Businesses Make (And How to Avoid Them)", category: "AI Integration" },
  { title: "How AI Appointment Scheduling Eliminates No-Shows and Fills Your Calendar", category: "Automation" },
  { title: "AI-Powered Reviews Management: Turn Customer Feedback Into New Leads", category: "Marketing" },
  { title: "How to Build a 24/7 Lead Generation Machine with AI", category: "Sales Funnels" },
  { title: "Text Message Automation: Why AI SMS Follow-Up Wins More Business", category: "Marketing" },

  // ── Home Services ────────────────────────────────────────────────────────
  { title: "AI for Home Service Companies: How to Book More Jobs Without More Staff", category: "Home Services" },
  { title: "How Plumbing Companies Use AI to Capture After-Hours Emergency Leads", category: "Home Services" },
  { title: "AI Chatbots for Home Services: The Secret to Winning Same-Day Bookings", category: "Home Services" },
  { title: "Landscaping Business Automation: How AI Books More Jobs Year-Round", category: "Home Services" },
  { title: "How AI Helps Home Service Businesses Dominate Local Google Rankings", category: "Home Services" },

  // ── HVAC ─────────────────────────────────────────────────────────────────
  { title: "AI for HVAC Companies: How to Fill Your Schedule in Slow Season", category: "HVAC" },
  { title: "How HVAC Contractors Use AI to Win More Maintenance Agreement Signups", category: "HVAC" },
  { title: "HVAC Lead Follow-Up Automation: Stop Losing Estimates to the Competition", category: "HVAC" },
  { title: "The HVAC Owner's Guide to AI: Dispatch, Scheduling, and Follow-Up on Autopilot", category: "HVAC" },

  // ── Dental ───────────────────────────────────────────────────────────────
  { title: "AI for Dental Offices: How to Reduce No-Shows and Fill Your Appointment Book", category: "Dental" },
  { title: "How Dental Practices Use AI Chatbots to Convert Website Visitors into New Patients", category: "Dental" },
  { title: "Dental Patient Reactivation: How AI Brings Back Patients Who Ghosted You", category: "Dental" },
  { title: "Why AI Recall Systems Outperform Traditional Dental Reminder Calls", category: "Dental" },

  // ── Med Spa ──────────────────────────────────────────────────────────────
  { title: "AI for Med Spas: How to Automate Consultations and Fill Treatment Slots", category: "Med Spa" },
  { title: "How Med Spas Use AI to Upsell Memberships and Repeat Bookings", category: "Med Spa" },
  { title: "The Med Spa Owner's Guide to AI-Powered Client Retention", category: "Med Spa" },
  { title: "AI Review Generation for Med Spas: Building a 5-Star Reputation on Autopilot", category: "Med Spa" },

  // ── Gyms & Fitness ───────────────────────────────────────────────────────
  { title: "AI for Gyms and Fitness Studios: How to Convert More Trial Members into Long-Term Members", category: "Gyms" },
  { title: "How Fitness Studios Use AI to Reduce Membership Churn by 40%", category: "Gyms" },
  { title: "AI Lead Nurture for Gyms: Turning Inquiries into Paid Memberships Automatically", category: "Gyms" },
  { title: "The Gym Owner's Guide to AI: Front Desk Automation That Actually Works", category: "Gyms" },

  // ── Restaurants ──────────────────────────────────────────────────────────
  { title: "AI for Restaurants: How to Bring Back Customers Who Haven't Visited in 60 Days", category: "Restaurants" },
  { title: "How Restaurants Use AI Text Marketing to Fill Slow Tuesday Nights", category: "Restaurants" },
  { title: "AI Reputation Management for Restaurants: Responding to Every Review in Minutes", category: "Restaurants" },
  { title: "How Local Restaurants Use AI to Compete With Chain Marketing Budgets", category: "Restaurants" },

  // ── Real Estate ──────────────────────────────────────────────────────────
  { title: "AI for Real Estate Agents: How to Instantly Respond to Every Lead 24/7", category: "Real Estate" },
  { title: "How Real Estate Teams Use AI to Qualify Buyer and Seller Leads Automatically", category: "Real Estate" },
  { title: "AI Follow-Up for Real Estate: Why the Agent Who Responds First Wins the Deal", category: "Real Estate" },
  { title: "Real Estate CRM Automation: How AI Keeps Your Pipeline Full Without Manual Work", category: "Real Estate" },

  // ── Financial Services ───────────────────────────────────────────────────
  { title: "AI for Financial Advisors: How to Automate Client Onboarding and Nurture", category: "Financial Services" },
  { title: "How Financial Services Firms Use AI to Generate and Qualify More Referrals", category: "Financial Services" },
  { title: "AI Compliance-Friendly Marketing Automation for Financial Advisors", category: "Financial Services" },

  // ── Law Firms ────────────────────────────────────────────────────────────
  { title: "AI for Law Firms: How to Turn Website Visitors Into Consultation Bookings", category: "Law Firms" },
  { title: "How Personal Injury Law Firms Use AI to Qualify More Cases Automatically", category: "Law Firms" },
  { title: "Law Firm Intake Automation: How AI Replaces After-Hours Answering Services", category: "Law Firms" },

  // ── E-Commerce ───────────────────────────────────────────────────────────
  { title: "AI for E-Commerce: How to Recover Abandoned Carts with Automated Sequences", category: "E-Commerce" },
  { title: "How Online Stores Use AI to Increase Average Order Value by 30%", category: "E-Commerce" },
  { title: "AI Customer Service for E-Commerce: Resolving 70% of Support Tickets Automatically", category: "E-Commerce" },
  { title: "Post-Purchase AI Automation: How E-Commerce Brands Turn Buyers Into Repeat Customers", category: "E-Commerce" },

  // ── Auto Repair ──────────────────────────────────────────────────────────
  { title: "AI for Auto Repair Shops: How to Book More Service Appointments on Autopilot", category: "Auto Repair" },
  { title: "How Auto Repair Shops Use AI to Follow Up on Declined Services and Win Them Back", category: "Auto Repair" },
  { title: "AI Review Generation for Auto Shops: Getting More 5-Star Google Reviews Automatically", category: "Auto Repair" },

  // ── Childcare ────────────────────────────────────────────────────────────
  { title: "AI for Childcare Centers: How to Fill Open Spots and Reduce Your Waitlist Frustration", category: "Childcare" },
  { title: "How Daycare Centers Use AI to Automate Parent Communication and Enrollment Follow-Up", category: "Childcare" },
  { title: "AI Reputation Management for Childcare Providers: Building Trust With New Families Online", category: "Childcare" },
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
          content: `You are a senior content strategist for CNAX AI — a company that delivers AI integration and AI-powered marketing/sales funnel services to small businesses. Write authoritative, practical blog articles that establish thought leadership, educate readers, and naturally position CNAX AI's services as the solution. Tone: confident, clear, and jargon-free. Always end with a CTA paragraph mentioning CNAX AI.

When the article topic is relevant to a specific industry, include a natural contextual link to the relevant CNAX AI industry page using an <a> tag. Use these URLs:
- Dental offices → https://cnax.ai/ai-for-dental.html
- HVAC companies → https://cnax.ai/ai-for-hvac.html
- Gyms and fitness studios → https://cnax.ai/ai-for-gyms.html
- Home services (plumbing, roofing, landscaping) → https://cnax.ai/ai-for-home-services.html
- Med spas and aesthetic clinics → https://cnax.ai/ai-for-med-spa.html
- Restaurants → https://cnax.ai/ai-for-restaurants.html
- Real estate agents → https://cnax.ai/ai-for-real-estate.html
- Financial advisors and RIAs → https://cnax.ai/ai-for-financial-services.html
- Law firms → https://cnax.ai/ai-for-law-firms.html
- E-commerce stores → https://cnax.ai/ai-for-ecommerce.html
- Auto repair shops → https://cnax.ai/ai-for-auto-repair.html
- Childcare and daycare → https://cnax.ai/ai-for-childcare.html
- General AI ROI → https://cnax.ai/roi-calculator.html
- AI readiness → https://cnax.ai/ai-audit.html

Only link naturally within the article body — never force a link that doesn't fit the context. Include at most 2 internal links per article.`,
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
      author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
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
