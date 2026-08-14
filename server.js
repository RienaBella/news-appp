const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const demoArticles = [
  {
    id: 'ng-1',
    title: 'Nigeria launches new digital rail and logistics corridor to strengthen trade flow',
    category: 'Nigeria',
    source: 'Nigerian Monitor',
    author: 'Ayo Adeyemi',
    publishedAt: '2026-08-13T08:30:00Z',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    summary: 'The government says the new rail and logistics route will reduce delays, cut transport costs and improve trade in food, fuel and manufactured goods.',
    quickBrief: 'A faster corridor is expected to move goods with less disruption and more predictable delivery times across key states.',
    whyItMatters: 'Improved logistics can lower costs for businesses and households, while helping Nigeria compete more effectively in regional trade.',
    url: 'https://example.com/nigeria-rail-logistics',
    isBreaking: true,
    trendingScore: 96,
    readTime: '4 min read'
  },
  {
    id: 'world-1',
    title: 'Global energy prices ease after supply improvements and cooling demand forecasts',
    category: 'World',
    source: 'Global Wire',
    author: 'Noah Brooks',
    publishedAt: '2026-08-13T06:10:00Z',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    summary: 'Energy markets are seeing a slight retreat from recent highs as production and shipment data improve, but inflation risks remain in several regions.',
    quickBrief: 'Lower energy costs could provide relief to households and manufacturers, though volatility is still likely.',
    whyItMatters: 'A drop in fuel and power costs can reduce inflation and support wider economic growth across many countries.',
    url: 'https://example.com/global-energy-prices',
    isBreaking: false,
    trendingScore: 88,
    readTime: '5 min read'
  },
  {
    id: 'tech-1',
    title: 'AI chipmakers race to build more efficient data centre hardware for enterprise workloads',
    category: 'Technology',
    source: 'Signal Daily',
    author: 'Lina Tran',
    publishedAt: '2026-08-12T18:25:00Z',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    summary: 'New semiconductor designs aim to reduce power use while increasing processing speeds, enabling faster AI deployment in business and cloud environments.',
    quickBrief: 'Faster and more efficient chips can make AI tools cheaper to run and easier to integrate into everyday business operations.',
    whyItMatters: 'The cost and energy footprint of AI infrastructure are major barriers to adoption, so improvements here could transform industry competition.',
    url: 'https://example.com/ai-chipmakers',
    isBreaking: true,
    trendingScore: 94,
    readTime: '6 min read'
  },
  {
    id: 'sport-1',
    title: 'Championship rivals reshape squad plans as transfer window enters final stretch',
    category: 'Sports',
    source: 'Pitch Report',
    author: 'Kemi Olatunji',
    publishedAt: '2026-08-12T11:40:00Z',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
    summary: 'Club managers are rushing to complete strategic signings as they look to strengthen depth, add pace and improve title chances before the season begins.',
    quickBrief: 'The final transfer days are reshaping rosters and could change the balance of power in major leagues.',
    whyItMatters: 'Late squad changes often influence momentum, team chemistry and how competitive clubs look across the entire season.',
    url: 'https://example.com/transfer-window',
    isBreaking: false,
    trendingScore: 82,
    readTime: '3 min read'
  },
  {
    id: 'ent-1',
    title: 'Streaming platforms expand local-language originals as demand for regional content surges',
    category: 'Entertainment',
    source: 'Screen East',
    author: 'Tobechukwu Emeka',
    publishedAt: '2026-08-11T21:05:00Z',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80',
    summary: 'Service providers are backing homegrown stories and local-language productions to attract broader audiences and strengthen retention in emerging markets.',
    quickBrief: 'Viewers are increasingly choosing titles that reflect local culture, language and everyday experiences.',
    whyItMatters: 'This shift can reshape creative investment and give smaller markets a stronger voice in global entertainment.',
    url: 'https://example.com/local-language-streaming',
    isBreaking: false,
    trendingScore: 80,
    readTime: '4 min read'
  },
  {
    id: 'biz-1',
    title: 'Startups pivot toward fintech infrastructure as small businesses demand better cash tools',
    category: 'Business',
    source: 'Capital Ledger',
    author: 'Mariam Sanni',
    publishedAt: '2026-08-11T14:00:00Z',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    summary: 'A growing number of emerging companies are building payment and treasury tools for SMEs that need faster accounting and stronger financial visibility.',
    quickBrief: 'Simple, immediate financial tools are becoming a competitive advantage for smaller businesses.',
    whyItMatters: 'When SMEs improve cash flow and planning, overall employment and local investment often benefit as well.',
    url: 'https://example.com/startup-fintech',
    isBreaking: false,
    trendingScore: 76,
    readTime: '5 min read'
  },
  {
    id: 'science-1',
    title: 'Researchers track new climate signals as rainfall patterns shift across coastal communities',
    category: 'Science',
    source: 'Future Earth',
    author: 'Ifeoma Eze',
    publishedAt: '2026-08-10T16:50:00Z',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    summary: 'Scientists say unusual rainfall timing could increase flood risks and force communities to rethink urban planning and water management.',
    quickBrief: 'Regional climate patterns are becoming harder to predict, which matters for agriculture, flood response and city planning.',
    whyItMatters: 'The more climate patterns shift, the more vulnerable households and infrastructure become unless adaptation strategies improve.',
    url: 'https://example.com/climate-rainfall',
    isBreaking: false,
    trendingScore: 74,
    readTime: '4 min read'
  },
  {
    id: 'general-1',
    title: 'Cities expand public transit upgrades to ease commuter stress and reduce congestion',
    category: 'General',
    source: 'Urban Daily',
    author: 'Daniel Johnson',
    publishedAt: '2026-08-09T09:20:00Z',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    summary: 'Transit authorities are investing in faster, safer and cleaner bus and rail services to make daily commutes more reliable and less costly.',
    quickBrief: 'Improved transit can help cities cut travel time, lower emissions and improve access for workers.',
    whyItMatters: 'Efficiency in daily transport affects business productivity, quality of life and urban energy use.',
    url: 'https://example.com/public-transit',
    isBreaking: false,
    trendingScore: 79,
    readTime: '3 min read'
  }
];

function normalizeArticle(article, category) {
  return {
    id: article.id || `${category}-${Date.now()}-${Math.random()}`,
    title: article.title || 'Untitled story',
    category: article.category || category,
    source: article.source || 'NewsPulse Wire',
    author: article.author || 'NewsPulse Desk',
    publishedAt: article.publishedAt || new Date().toISOString(),
    image: article.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    summary: article.summary || article.description || 'A timely update from the newsroom.',
    quickBrief: article.quickBrief || 'A short explainer of what this story means right now.',
    whyItMatters: article.whyItMatters || 'This story matters because it affects consumers, businesses, or public policy in a direct way.',
    url: article.url || '#',
    isBreaking: Boolean(article.isBreaking),
    trendingScore: article.trendingScore || 70,
    readTime: article.readTime || '4 min read'
  };
}

function getFallbackArticles(category) {
  const normalized = demoArticles.map((article) => normalizeArticle(article, category));
  if (!category || category === 'all' || category === 'All') {
    return normalized;
  }
  return normalized.filter((article) => article.category.toLowerCase() === category.toLowerCase());
}

async function fetchNewsFromApi(category) {
  const apiKey = process.env.NEWS_API_KEY;
  const apiUrl = process.env.NEWS_API_URL;

  if (!apiKey || !apiUrl) return { source: 'demo', articles: getFallbackArticles(category) };

  try {
    const endpoint = new URL(apiUrl);
    endpoint.searchParams.set('category', category === 'all' ? '' : category);
    endpoint.searchParams.set('language', 'en');
    endpoint.searchParams.set('country', 'ng');
    if (endpoint.hostname.includes('gnews.io')) {
      endpoint.searchParams.set('token', apiKey);
      endpoint.searchParams.set('max', '10');
    }
    if (endpoint.hostname.includes('newsdata.io')) {
      endpoint.searchParams.set('apikey', apiKey);
    }

    const response = await fetch(endpoint.toString(), {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`News API returned ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.articles)
      ? data.articles
      : Array.isArray(data.results)
        ? data.results
        : [];

    if (!items.length) {
      return { source: 'demo', articles: getFallbackArticles(category) };
    }

    const mapped = items.map((item, index) => ({
      id: item.article_id || item.id || `${category}-${index}`,
      title: item.title || 'Untitled story',
      category: item.category || category || 'General',
      source: item.source?.name || item.source || 'News Pulse',
      author: item.author || 'NewsPulse Desk',
      publishedAt: item.publishedAt || item.pubDate || new Date().toISOString(),
      image: item.image || item.urlToImage || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      summary: item.description || item.summary || 'A fresh update from the newsroom.',
      quickBrief: item.quickBrief || 'A concise summary from the NewsPulse desk.',
      whyItMatters: item.whyItMatters || 'This story affects people, policy, markets or daily life in a meaningful way.',
      url: item.url || '#',
      isBreaking: index < 2,
      trendingScore: item.trendingScore || 70 + index,
      readTime: item.readTime || '4 min read'
    }));

    return { source: 'api', articles: mapped };
  } catch (error) {
    console.warn('Falling back to demo data because the external API is unavailable:', error.message);
    return { source: 'demo', articles: getFallbackArticles(category) };
  }
}

app.use(express.static(path.join(__dirname)));

app.get('/api/news', async (req, res) => {
  const category = req.query.category || 'all';
  const apiData = await fetchNewsFromApi(category);
  res.json(apiData);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`NewsPulse is running on http://localhost:${PORT}`);
});
