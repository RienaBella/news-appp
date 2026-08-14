const state = {
  articles: [],
  category: 'all',
  savedArticles: JSON.parse(localStorage.getItem('newspulse-saved') || '[]'),
  activeArticleId: null,
  isLoading: false,
  errorMessage: ''
};

const elements = {
  tickerTrack: document.getElementById('tickerTrack'),
  categoryNav: document.getElementById('categoryNav'),
  featuredStory: document.getElementById('featuredStory'),
  trendingList: document.getElementById('trendingList'),
  quickBriefGrid: document.getElementById('quickBriefGrid'),
  newsFeed: document.getElementById('newsFeed'),
  radarGrid: document.getElementById('radarGrid'),
  savedStories: document.getElementById('savedStories'),
  popularStories: document.getElementById('popularStories'),
  searchInput: document.getElementById('searchInput'),
  newsletterForm: document.getElementById('newsletterForm'),
  themeToggle: document.getElementById('themeToggle'),
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  newsMeta: document.getElementById('newsMeta'),
  articleModal: document.getElementById('articleModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalCategory: document.getElementById('modalCategory'),
  modalSource: document.getElementById('modalSource'),
  modalDate: document.getElementById('modalDate'),
  modalSummary: document.getElementById('modalSummary'),
  modalQuickBrief: document.getElementById('modalQuickBrief'),
  modalWhyMatters: document.getElementById('modalWhyMatters'),
  modalImage: document.getElementById('modalImage'),
  modalLink: document.getElementById('modalLink'),
  modalSaveBtn: document.getElementById('modalSaveBtn'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  errorBanner: document.getElementById('errorBanner')
};

const categoryAliases = {
  all: 'all',
  Nigeria: 'Nigeria',
  World: 'World',
  Technology: 'Technology',
  Sports: 'Sports',
  Entertainment: 'Entertainment',
  Business: 'Business',
  Science: 'Science'
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
  fetchNews('all');
});

function initTheme() {
  const savedTheme = localStorage.getItem('newspulse-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  document.body.classList.toggle('dark', isDark);
  elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function bindEvents() {
  elements.categoryNav.addEventListener('click', (event) => {
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    const category = chip.dataset.category;
    document.querySelectorAll('.category-chip').forEach((button) => button.classList.toggle('active', button === chip));
    state.category = category;
    closeMobileMenu();
    fetchNews(category);
  });

  elements.searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = state.articles.filter((item) => {
      const text = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
      return !query || text.includes(query);
    });
    renderNewsFeed(filtered);
  });

  elements.newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('newsletterInput').value.trim();
    if (!email) return;
    showToast('You are subscribed to the NewsPulse briefing.');
    elements.newsletterForm.reset();
  });

  document.getElementById('newsletterCta').addEventListener('click', () => {
    document.getElementById('newsletterInput').focus();
    window.scrollTo({ top: document.body.scrollHeight * 0.75, behavior: 'smooth' });
  });

  elements.themeToggle.addEventListener('click', () => {
    const nextDark = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', nextDark);
    localStorage.setItem('newspulse-theme', nextDark ? 'dark' : 'light');
    elements.themeToggle.textContent = nextDark ? '☀️' : '🌙';
  });

  elements.mobileMenuToggle.addEventListener('click', () => {
    const isOpen = elements.categoryNav.classList.toggle('mobile-open');
    elements.mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    elements.mobileMenuToggle.textContent = isOpen ? '✕' : '☰';
  });

  document.querySelector('.close-modal').addEventListener('click', closeArticleModal);
  elements.articleModal.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'true') {
      closeArticleModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.articleModal.classList.contains('hidden')) {
      closeArticleModal();
    }
  });

  elements.modalSaveBtn.addEventListener('click', () => {
    if (!state.activeArticleId) return;
    const article = state.articles.find((entry) => entry.id === state.activeArticleId);
    if (!article) return;
    const saved = state.savedArticles.findIndex((item) => item.id === article.id);
    if (saved !== -1) {
      state.savedArticles.splice(saved, 1);
      elements.modalSaveBtn.textContent = 'Save article';
    } else {
      state.savedArticles.unshift(article);
      elements.modalSaveBtn.textContent = 'Saved';
    }
    localStorage.setItem('newspulse-saved', JSON.stringify(state.savedArticles));
    renderSavedArticles();
    renderNewsFeed(getVisibleArticles());
  });
}

async function fetchNews(category) {
  const cleanCategory = categoryAliases[category] || category || 'all';
  state.isLoading = true;
  state.errorMessage = '';
  updateLoadingState();
  updateErrorState();

  try {
    const res = await fetch(`/api/news?category=${encodeURIComponent(cleanCategory)}`);
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    const data = await res.json();
    state.articles = data.articles || [];
    if (!state.articles.length) {
      state.articles = [];
    }
    elements.newsMeta.textContent = data.source === 'api' ? 'Live coverage' : 'Demo coverage';
  } catch (error) {
    console.error('Unable to fetch news:', error);
    state.errorMessage = 'We could not load live news right now, so demo stories are being shown instead.';
    state.articles = getFallbackArticles(cleanCategory);
    elements.newsMeta.textContent = 'Demo coverage';
  } finally {
    state.isLoading = false;
    updateLoadingState();
    updateErrorState();
    renderEverything();
  }
}

function renderEverything() {
  renderTicker();
  renderFeaturedStory();
  renderTrending();
  renderQuickBrief();
  renderNewsFeed(getVisibleArticles());
  renderRadar();
  renderSavedArticles();
  renderPopularStories();
}

function getVisibleArticles() {
  const search = elements.searchInput.value.trim().toLowerCase();
  return state.articles.filter((article) => {
    if (!search) return true;
    return `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(search);
  });
}

function getFallbackArticles(category) {
  const fallback = [
    { id: 'fallback-1', title: 'Nigeria expands digital trade support for small businesses and logistics operators', category: 'Nigeria', source: 'Nigerian Monitor', author: 'Ayo Adeyemi', publishedAt: '2026-08-13T08:30:00Z', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80', summary: 'The latest digital trade measures aim to cut friction for smaller operators and speed up everyday commerce.', quickBrief: 'The plan makes transactions smoother and reduces delays for businesses handling moving goods and services.', whyItMatters: 'Improved digital access can help farmers, traders and enterprises compete with fewer bottlenecks and less paperwork.', url: 'https://example.com/demo/nigeria-trade', isBreaking: true, trendingScore: 96, readTime: '4 min read' },
    { id: 'fallback-2', title: 'Global markets brace for another week of shifting commodity and energy prices', category: 'World', source: 'Global Wire', author: 'Noah Brooks', publishedAt: '2026-08-13T06:10:00Z', image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80', summary: 'Energy and agricultural markets remain sensitive to changing demand and shipping conditions across key regions.', quickBrief: 'Volatility is likely to continue for a few more days as supply and demand data keep moving.', whyItMatters: 'Price swings can affect grocery prices, transport costs and the wider cost of living.', url: 'https://example.com/demo/global-markets', isBreaking: false, trendingScore: 88, readTime: '5 min read' },
    { id: 'fallback-3', title: 'AI infrastructure spending rises as companies optimize cloud and chip efficiency', category: 'Technology', source: 'Signal Daily', author: 'Lina Tran', publishedAt: '2026-08-12T18:25:00Z', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', summary: 'Tech firms are ramping up more efficient hardware and software stacks to support AI workflows in real-world business environments.', quickBrief: 'Smarter infrastructure enables more companies to pilot AI without cost and power bottlenecks.', whyItMatters: 'This can shape how quickly AI becomes practical for everyday operations across sectors.', url: 'https://example.com/demo/ai-infra', isBreaking: true, trendingScore: 94, readTime: '6 min read' },
    { id: 'fallback-4', title: 'Clubs negotiate late-window additions to rebalance squads before kickoff', category: 'Sports', source: 'Pitch Report', author: 'Kemi Olatunji', publishedAt: '2026-08-12T11:40:00Z', image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80', summary: 'Late signings continue to reshape the competitive picture across leading leagues and competitions.', quickBrief: 'Small, strategic additions can reshape momentum and team chemistry during a long season.', whyItMatters: 'The final weeks of a transfer window often dictate how strong teams look in early matches.', url: 'https://example.com/demo/late-window', isBreaking: false, trendingScore: 82, readTime: '3 min read' },
    { id: 'fallback-5', title: 'Streaming services lean into local-language originals to deepen audience connection', category: 'Entertainment', source: 'Screen East', author: 'Tobechukwu Emeka', publishedAt: '2026-08-11T21:05:00Z', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80', summary: 'Entertainment companies are increasingly investing in culturally relevant storytelling for more engaged viewers.', quickBrief: 'Local stories continue to win attention as audiences look for more authentic and relatable content.', whyItMatters: 'It helps creators build stronger global and regional audiences while preserving local culture.', url: 'https://example.com/demo/streaming-locals', isBreaking: false, trendingScore: 80, readTime: '4 min read' },
    { id: 'fallback-6', title: 'Small businesses adopt new cash tools to smooth payments and forecasting', category: 'Business', source: 'Capital Ledger', author: 'Mariam Sanni', publishedAt: '2026-08-11T14:00:00Z', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', summary: 'Finance and payment tools are becoming more valuable to businesses looking to manage cash more predictably.', quickBrief: 'Better payment systems make it easier for companies to expand safely and plan ahead.', whyItMatters: 'When cash flow is stronger, hiring, inventory and investment often become more stable.', url: 'https://example.com/demo/fntech-tools', isBreaking: false, trendingScore: 76, readTime: '5 min read' },
    { id: 'fallback-7', title: 'Climate researchers map shifting rainfall patterns in coastal regions', category: 'Science', source: 'Future Earth', author: 'Ifeoma Eze', publishedAt: '2026-08-10T16:50:00Z', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80', summary: 'Seasonal rainfall is becoming less predictable, raising new concerns for flood planning and food systems.', quickBrief: 'Climate variability is changing how communities plan infrastructure and protection measures.', whyItMatters: 'The effects are already visible in agriculture, transport and urban adaptation planning.', url: 'https://example.com/demo/climate-rainfall', isBreaking: false, trendingScore: 74, readTime: '4 min read' }
  ];

  if (!category || category === 'all') return fallback;
  return fallback.filter((article) => article.category.toLowerCase() === category.toLowerCase());
}

function updateLoadingState() {
  elements.loadingIndicator.classList.toggle('hidden', !state.isLoading);
}

function updateErrorState() {
  elements.errorBanner.textContent = state.errorMessage;
  elements.errorBanner.classList.toggle('hidden', !state.errorMessage);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function closeMobileMenu() {
  elements.categoryNav.classList.remove('mobile-open');
  elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
  elements.mobileMenuToggle.textContent = '☰';
}

function renderTicker() {
  const items = state.articles.slice(0, 6).map((article) => article.title);
  elements.tickerTrack.innerHTML = items.map((item) => `<span>${item}</span>`).join('');
}

function renderFeaturedStory() {
  const featured = state.articles.find((article) => article.isBreaking) || state.articles[0];
  if (!featured) {
    elements.featuredStory.innerHTML = '<div class="empty-state">No stories available right now.</div>';
    return;
  }

  elements.featuredStory.innerHTML = `
    <div class="featured-media" style="background-image: url('${featured.image}')">
      <span class="featured-badge">${featured.category}</span>
    </div>
    <div class="featured-copy">
      <span class="pill">Featured story</span>
      <h1>${featured.title}</h1>
      <p>${featured.summary}</p>
      <div class="meta-row">
        <span>${featured.source}</span>
        <span>•</span>
        <span>${formatDate(featured.publishedAt)}</span>
        <span>•</span>
        <span>${featured.readTime}</span>
      </div>
      <div class="modal-actions" style="margin-top: 18px;">
        <button class="primary-btn" data-open-story="${featured.id}">Read story</button>
      </div>
    </div>
  `;

  const readButton = elements.featuredStory.querySelector('[data-open-story]');
  readButton?.addEventListener('click', () => openArticle(featured.id));
}

function renderTrending() {
  const items = [...state.articles].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)).slice(0, 5);
  elements.trendingList.innerHTML = items.map((item, index) => `
    <button class="story-tile" data-open-story="${item.id}" type="button">
      <span class="story-rank">${index + 1}</span>
      <div>
        <h4>${item.title}</h4>
        <small>${item.source}</small>
      </div>
      <span class="score-pill">${item.trendingScore || 70}</span>
    </button>
  `).join('');

  elements.trendingList.querySelectorAll('[data-open-story]').forEach((button) => {
    button.addEventListener('click', () => openArticle(button.dataset.openStory));
  });
}

function renderQuickBrief() {
  const items = [...state.articles].slice(0, 4);
  elements.quickBriefGrid.innerHTML = items.map((item) => `
    <article class="brief-card">
      <span class="pill">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.quickBrief}</p>
    </article>
  `).join('');
}

function renderNewsFeed(articles) {
  const items = articles && articles.length ? articles : state.articles;
  if (!items.length) {
    elements.newsFeed.innerHTML = '<div class="empty-state">No articles match your current search or category.</div>';
    return;
  }

  elements.newsFeed.innerHTML = items.map((article) => `
    <article class="article-card" data-open-story="${article.id}">
      <img src="${article.image}" alt="${article.title}" />
      <div class="card-copy">
        <div class="card-topline">
          <span class="pill">${article.category}</span>
          <button class="save-btn ${isSaved(article.id) ? 'saved' : ''}" data-save-id="${article.id}" type="button">${isSaved(article.id) ? 'Saved' : 'Save'}</button>
        </div>
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <div class="card-footer">
          <div class="meta-row">
            <span>${article.source}</span>
            <span>•</span>
            <span>${formatDate(article.publishedAt)}</span>
          </div>
          <div class="card-actions">
            <span>${article.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  elements.newsFeed.querySelectorAll('[data-open-story]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('[data-save-id]')) return;
      openArticle(card.dataset.openStory);
    });
  });

  elements.newsFeed.querySelectorAll('[data-save-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSave(button.dataset.saveId);
    });
  });
}

function renderRadar() {
  const items = [...state.articles].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)).slice(0, 4);
  elements.radarGrid.innerHTML = items.map((item, index) => `
    <div class="radar-item">
      <span class="radar-bar" style="height:${48 + index * 10}px"></span>
      <div class="radar-text">
        <h4>${item.title}</h4>
        <small>${item.category}</small>
      </div>
      <span class="score-pill">${item.trendingScore || 70}</span>
    </div>
  `).join('');
}

function renderSavedArticles() {
  if (!state.savedArticles.length) {
    elements.savedStories.innerHTML = '<div class="empty-state">No saved articles yet.</div>';
    return;
  }

  elements.savedStories.innerHTML = state.savedArticles.slice(0, 4).map((article) => `
    <button class="saved-item" data-open-story="${article.id}" type="button">
      <h4>${article.title}</h4>
      <small>${article.category} • ${formatDate(article.publishedAt)}</small>
    </button>
  `).join('');

  elements.savedStories.querySelectorAll('[data-open-story]').forEach((item) => {
    item.addEventListener('click', () => openArticle(item.dataset.openStory));
  });
}

function renderPopularStories() {
  const items = [...state.articles].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)).slice(0, 3);
  elements.popularStories.innerHTML = items.map((article) => `
    <article class="popular-card" data-open-story="${article.id}">
      <img src="${article.image}" alt="${article.title}" />
      <div class="popular-copy">
        <span class="pill">${article.category}</span>
        <h3>${article.title}</h3>
        <p class="muted">${article.quickBrief}</p>
      </div>
    </article>
  `).join('');

  elements.popularStories.querySelectorAll('[data-open-story]').forEach((card) => {
    card.addEventListener('click', () => openArticle(card.dataset.openStory));
  });
}

function openArticle(articleId) {
  const article = state.articles.find((entry) => entry.id === articleId);
  if (!article) return;

  state.activeArticleId = articleId;
  elements.modalTitle.textContent = article.title;
  elements.modalCategory.textContent = article.category;
  elements.modalSource.textContent = article.source;
  elements.modalDate.textContent = formatDate(article.publishedAt);
  elements.modalSummary.textContent = article.summary;
  elements.modalQuickBrief.textContent = article.quickBrief;
  elements.modalWhyMatters.textContent = article.whyItMatters;
  elements.modalImage.src = article.image;
  elements.modalImage.alt = article.title;
  elements.modalLink.href = article.url;
  elements.modalSaveBtn.textContent = isSaved(article.id) ? 'Saved' : 'Save article';
  elements.articleModal.classList.remove('hidden');
  elements.articleModal.setAttribute('aria-hidden', 'false');
}

function closeArticleModal() {
  elements.articleModal.classList.add('hidden');
  elements.articleModal.setAttribute('aria-hidden', 'true');
}

function toggleSave(articleId) {
  const existingIndex = state.savedArticles.findIndex((item) => item.id === articleId);
  if (existingIndex >= 0) {
    state.savedArticles.splice(existingIndex, 1);
  } else {
    const article = state.articles.find((item) => item.id === articleId);
    if (article) state.savedArticles.push(article);
  }
  localStorage.setItem('newspulse-saved', JSON.stringify(state.savedArticles));
  renderSavedArticles();
  renderNewsFeed(getVisibleArticles());
  if (state.activeArticleId === articleId) {
    elements.modalSaveBtn.textContent = isSaved(articleId) ? 'Saved' : 'Save article';
  }
}

function isSaved(articleId) {
  return state.savedArticles.some((item) => item.id === articleId);
}

function formatDate(value) {
  if (!value) return 'Today';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
