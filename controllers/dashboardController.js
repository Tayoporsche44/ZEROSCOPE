// ============================================================
// ZEROSCOPE — controllers/dashboardController.js
// LIVE DATA via Zero Authority DAO MCP API
// ============================================================

'use strict';

const axios = require('axios');
const Bookmark = require('../models/Bookmark');

// ─── API Configuration ───────────────────────────────────────
const ZA_API_KEY = process.env.ZA_API_KEY || '';
const ZA_MCP_URL = 'https://zeroauthoritydao.com/mcp';
const ZA_BASE_URL = 'https://zeroauthoritydao.com';

// Axios instance for MCP calls
const mcpClient = axios.create({
  baseURL: ZA_MCP_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZA_API_KEY}`,
  },
});

// ─── MCP Tool Call Helper ─────────────────────────────────────
// The Zero Authority MCP endpoint uses JSON-RPC style tool calls
async function callMCPTool(toolName, toolArgs = {}) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: toolArgs,
    },
  };
  const response = await mcpClient.post('', payload);
  // MCP returns result.content as array of text blocks
  const content = response.data?.result?.content;
  if (!content || !Array.isArray(content)) {
    throw new Error(`MCP tool "${toolName}" returned unexpected shape`);
  }
  // Parse the text block as JSON
  const textBlock = content.find((c) => c.type === 'text');
  if (!textBlock) throw new Error(`No text block in MCP response for "${toolName}"`);
  return JSON.parse(textBlock.text);
}

// ─── Fetch Bounties from Zero Authority ──────────────────────
async function fetchBounties() {
  try {
    const data = await callMCPTool('list_bounties', { limit: 50 });
    const raw = Array.isArray(data) ? data : data.bounties || data.data || [];
    return raw.map((b) => ({
      id: b.id || b._id || '',
      title: b.title || b.name || 'Untitled Bounty',
      description: b.description || b.summary || '',
      reward: b.reward || b.amount || b.prize || 'TBD',
      rewardToken: b.rewardToken || b.token || 'STX',
      status: (b.status || 'open').toLowerCase(),
      category: b.category || b.type || 'General',
      poster: b.poster || b.creator || b.postedBy || 'Zero Authority DAO',
      url: b.url || b.link || (b.id ? `${ZA_BASE_URL}/bounty/${b.id}` : ZA_BASE_URL + '/bounty'),
      deadline: b.deadline || b.endsAt || b.expiresAt || null,
      postedAt: b.postedAt || b.createdAt || null,
      winners: b.winnerType || b.winners || '',
      type: 'bounty',
    }));
  } catch (err) {
    console.error('[ZEROSCOPE] fetchBounties error:', err.message);
    return null; // null = API failed
  }
}

// ─── Fetch Quests from Zero Authority ────────────────────────
async function fetchQuests() {
  try {
    const data = await callMCPTool('list_quests', { limit: 50 });
    const raw = Array.isArray(data) ? data : data.quests || data.data || [];
    return raw.map((q) => ({
      id: q.id || q._id || '',
      title: q.title || q.name || 'Untitled Quest',
      description: q.description || q.summary || '',
      reward: q.reward || q.rep || q.xp || '250',
      rewardToken: 'REP',
      status: (q.status || 'open').toLowerCase(),
      category: q.category || 'Quest',
      poster: q.poster || q.creator || q.postedBy || 'Zero Authority DAO',
      url: q.url || q.link || (q.id ? `${ZA_BASE_URL}/quests/${q.id}` : ZA_BASE_URL + '/quests'),
      deadline: q.deadline || q.endsAt || q.expiresAt || null,
      postedAt: q.postedAt || q.createdAt || null,
      type: 'quest',
    }));
  } catch (err) {
    console.error('[ZEROSCOPE] fetchQuests error:', err.message);
    return null;
  }
}

// ─── Fetch Gigs from Zero Authority ──────────────────────────
async function fetchGigs() {
  try {
    const data = await callMCPTool('list_gigs', { limit: 20 });
    const raw = Array.isArray(data) ? data : data.gigs || data.data || [];
    return raw.map((g) => ({
      id: g.id || g._id || '',
      title: g.title || g.name || 'Untitled Gig',
      description: g.description || g.summary || '',
      reward: g.reward || g.budget || g.amount || 'TBD',
      rewardToken: g.rewardToken || g.token || 'STX',
      status: (g.status || 'open').toLowerCase(),
      category: g.category || g.skill || 'General',
      poster: g.poster || g.creator || g.client || 'Zero Authority DAO',
      url: g.url || g.link || (g.id ? `${ZA_BASE_URL}/gigs/${g.id}` : ZA_BASE_URL),
      deadline: g.deadline || g.endsAt || null,
      postedAt: g.postedAt || g.createdAt || null,
      type: 'gig',
    }));
  } catch (err) {
    console.error('[ZEROSCOPE] fetchGigs error:', err.message);
    return null;
  }
}

// ─── Hardcoded Real Fallback Data ────────────────────────────
// Scraped from live Zero Authority DAO pages — used only if API is down
function getRealFallbackData() {
  console.warn('[ZEROSCOPE] Using real scraped fallback data');
  return {
    bounties: [
      {
        id: 'fastpool-btcfi',
        title: 'FastPool BTCFi Challenge',
        description: 'Complete the FastPool BTCFi challenge on the Stacks Network. Contribute to Bitcoin DeFi innovation through the FastPool ecosystem.',
        reward: 'TBD',
        rewardToken: 'STX',
        status: 'open',
        category: 'General',
        poster: 'Ryder One Community',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
      {
        id: 'za-3hunna-clipping',
        title: 'ZA x 3HUNNA CLIPPING BOUNTY',
        description: 'Create viral marketing clips for the 3HUNNA x Zero Authority DAO collaboration. Show your content creation skills on the Stacks Network.',
        reward: 'TBD',
        rewardToken: 'STX',
        status: 'open',
        category: 'Marketing',
        poster: '3hunnatheClipper',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
      {
        id: 'usda-alpha-arena',
        title: 'USDA Alpha Arena',
        description: 'Participate in the USDA Alpha Arena on Zero Authority DAO. Explore USDA stablecoin mechanics and demonstrate your DeFi knowledge on Stacks.',
        reward: 'TBD',
        rewardToken: 'USDA',
        status: 'open',
        category: 'General',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
      {
        id: 'flat-frenzy',
        title: 'THE $FLAT FRENZY BOUNTY',
        description: 'Join the $FLAT Frenzy on Zero Authority DAO. Compete for rewards in this community-driven bounty on the Stacks Network.',
        reward: 'TBD',
        rewardToken: '$FLAT',
        status: 'open',
        category: 'General',
        poster: 'Flat Earth',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
      {
        id: 'top-dawg-award',
        title: 'The Top Dawg Award',
        description: 'Win the Top Dawg Award on Zero Authority DAO. Prove yourself as the top contributor in the Dawgcoin ecosystem on Stacks.',
        reward: 'TBD',
        rewardToken: 'DAWG',
        status: 'open',
        category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Single Winner',
        type: 'bounty',
      },
      {
        id: 'ruffs-to-riches-2',
        title: "'Ruffs-to-Riches' - Part Two",
        description: "Continue the Ruffs-to-Riches journey in Part Two of Dawgcoin's Zero Authority bounty series. Multi-winner opportunity on Stacks.",
        reward: 'TBD',
        rewardToken: 'DAWG',
        status: 'open',
        category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
      {
        id: 'megapont-lets-go-ape',
        title: 'Megapont Lets Go Ape',
        description: 'Create the best meme for Megapont and win the single-winner prize in this Zero Authority DAO meme contest on Stacks.',
        reward: 'TBD',
        rewardToken: 'STX',
        status: 'open',
        category: 'Meme',
        poster: 'Creators Campaign',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Single Winner',
        type: 'bounty',
      },
      {
        id: 'ruffs-to-riches-1',
        title: "'Ruffs-to-Riches' - Part One",
        description: "Start the Ruffs-to-Riches journey in Part One of Dawgcoin's Zero Authority bounty series. Open to multiple winners.",
        reward: 'TBD',
        rewardToken: 'DAWG',
        status: 'open',
        category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        winners: 'Multiple Winners',
        type: 'bounty',
      },
    ],
    quests: [
      {
        id: '021c71f1-7b26-4344-b38f-beda107ade66',
        title: 'USDA Deployment Challenge',
        description: 'Become a Stacks Power User. Complete the USDA Deployment Challenge and earn 250 REP from the Arkadiko Creators.',
        reward: '250',
        rewardToken: 'REP',
        status: 'open',
        category: 'DeFi',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/quests/021c71f1-7b26-4344-b38f-beda107ade66',
        deadline: null,
        postedAt: null,
        type: 'quest',
      },
      {
        id: '494e3b31-db0a-4f17-b88c-aa9265d29af5',
        title: 'WELSH Corgi STX Dog Season',
        description: 'Become a Stacks Power User. Join the Welsh Corgi STX Dog Season quest and earn 250 REP from the Welsh Community.',
        reward: '250',
        rewardToken: 'REP',
        status: 'open',
        category: 'Community',
        poster: 'Welsh Community',
        url: 'https://zeroauthoritydao.com/quests/494e3b31-db0a-4f17-b88c-aa9265d29af5',
        deadline: null,
        postedAt: null,
        type: 'quest',
      },
      {
        id: 'bc2f470a-69d9-48b5-8598-cd373896ab80',
        title: 'LEO Coin - STX Cat Season',
        description: 'Become a Stacks Power User. Complete the LEO Coin STX Cat Season quest and earn 250 REP.',
        reward: '250',
        rewardToken: 'REP',
        status: 'open',
        category: 'Community',
        poster: 'LEO Campaign',
        url: 'https://zeroauthoritydao.com/quests/bc2f470a-69d9-48b5-8598-cd373896ab80',
        deadline: null,
        postedAt: null,
        type: 'quest',
      },
      {
        id: '8d45ff1b-7d5f-498a-aff7-3ab03b116223',
        title: 'Unlock STX Liquidity with USDA',
        description: 'Become a Stacks Power User. Unlock STX liquidity with USDA and earn 200 REP from the Arkadiko Creators.',
        reward: '200',
        rewardToken: 'REP',
        status: 'open',
        category: 'DeFi',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/quests/8d45ff1b-7d5f-498a-aff7-3ab03b116223',
        deadline: null,
        postedAt: null,
        type: 'quest',
      },
      {
        id: '0c420ca2-ee7e-4215-a5c7-e4bdc534b4d5',
        title: 'Fast Pool Just Leveled Up',
        description: "Become a Stacks Power User. Complete Ryder's Fast Pool quest and earn 250 REP.",
        reward: '250',
        rewardToken: 'REP',
        status: 'open',
        category: 'Staking',
        poster: 'Fast Pool',
        url: 'https://zeroauthoritydao.com/quests/0c420ca2-ee7e-4215-a5c7-e4bdc534b4d5',
        deadline: null,
        postedAt: null,
        type: 'quest',
      },
    ],
  };
}

// ─── Compute Analytics ────────────────────────────────────────
function computeAnalytics(opportunities, bookmarks) {
  const bounties = opportunities.filter((o) => o.type === 'bounty');
  const quests = opportunities.filter((o) => o.type === 'quest');
  const gigs = opportunities.filter((o) => o.type === 'gig');
  const openCount = opportunities.filter((o) => o.status === 'open').length;

  const categoryBreakdown = opportunities.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    totalOpportunities: opportunities.length,
    totalBounties: bounties.length,
    totalQuests: quests.length,
    totalGigs: gigs.length,
    openCount,
    totalBookmarks: bookmarks.length,
    topCategory,
    categoryBreakdown,
  };
}

// ═══════════════════════════════════════════════════════════
// CONTROLLER METHODS
// ═══════════════════════════════════════════════════════════

// GET / — Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    // Try live MCP API first — all three in parallel
    const [bountiesResult, questsResult, gigsResult] = await Promise.allSettled([
      fetchBounties(),
      fetchQuests(),
      fetchGigs(),
    ]);

    let bounties = bountiesResult.status === 'fulfilled' ? bountiesResult.value : null;
    let quests = questsResult.status === 'fulfilled' ? questsResult.value : null;
    let gigs = gigsResult.status === 'fulfilled' ? gigsResult.value : null;

    let fromLiveAPI = true;

    // If MCP failed, use our real scraped fallback
    if (!bounties && !quests) {
      const fallback = getRealFallbackData();
      bounties = fallback.bounties;
      quests = fallback.quests;
      gigs = gigs || [];
      fromLiveAPI = false;
    } else {
      bounties = bounties || [];
      quests = quests || [];
      gigs = gigs || [];
    }

    // Merge all into one feed
    const opportunities = [...bounties, ...quests, ...gigs];

    // Filter by category query param if present
    const { category, type } = req.query;
    let filtered = opportunities;
    if (category) filtered = filtered.filter((o) => o.category.toLowerCase() === category.toLowerCase());
    if (type) filtered = filtered.filter((o) => o.type === type);

    // Bookmarks from MongoDB
    const bookmarks = await Bookmark.find().lean();
    const bookmarkedIds = new Set(bookmarks.map((b) => b.opportunityId));

    // Analytics
    const analytics = computeAnalytics(opportunities, bookmarks);

    res.render('dashboard', {
      title: 'ZEROSCOPE — Dashboard',
      opportunities: filtered,
      allOpportunities: opportunities,
      bookmarkedIds: [...bookmarkedIds],
      analytics,
      fromLiveAPI,
      activeCategory: category || null,
      activeType: type || null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /bookmarks
exports.getBookmarks = async (req, res, next) => {
  try {
    const { status, category } = req.query;

    let query = {};
    if (status && status !== 'all') query.userStatus = status;
    if (category && category !== 'all') query.category = category;

    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }).lean();
    const allBookmarks = await Bookmark.find().lean();

    const statusBreakdown = allBookmarks.reduce((acc, b) => {
      const s = b.userStatus || 'active';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = allBookmarks.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});

    res.render('bookmarks', {
      title: 'ZEROSCOPE — My Bookmarks',
      bookmarks,
      analytics: {
        totalBookmarks: allBookmarks.length,
        activeCount: statusBreakdown['active'] || 0,
        appliedCount: statusBreakdown['applied'] || 0,
        wonCount: statusBreakdown['won'] || 0,
        statusBreakdown,
        categoryBreakdown,
      },
      activeStatus: status || 'all',
      activeCategory: category || 'all',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /bookmarks — Save
exports.saveBookmark = async (req, res, next) => {
  try {
    const {
      opportunityId, title, description, reward,
      rewardToken, status, category, url, type,
      poster, deadline, postedAt,
    } = req.body;

    if (!opportunityId || !title) {
      const err = new Error('opportunityId and title are required.');
      err.status = 400;
      return next(err);
    }

    const existing = await Bookmark.findOne({ opportunityId }).lean();
    if (existing) {
      return res.redirect('/?notice=already_bookmarked');
    }

    await Bookmark.create({
      opportunityId,
      title,
      description,
      reward,
      rewardToken: rewardToken || 'STX',
      status: status || 'open',
      userStatus: 'active',
      category: category || 'General',
      url,
      type: type || 'bounty',
      poster: poster || 'Zero Authority DAO',
      notes: '',
      postedAt: postedAt ? new Date(postedAt) : null,
      deadline: deadline ? new Date(deadline) : null,
    });

    return res.redirect('/bookmarks');
  } catch (err) {
    if (err.name === 'ValidationError') err.status = 400;
    next(err);
  }
};

// DELETE /bookmarks/:id
exports.deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(req.params.id).lean();
    if (!bookmark) {
      const err = new Error('Bookmark not found.');
      err.status = 404;
      return next(err);
    }
    return res.redirect('/bookmarks');
  } catch (err) {
    if (err.name === 'CastError') {
      err.status = 400;
      err.message = 'Invalid bookmark ID.';
    }
    next(err);
  }
};

// PATCH /bookmarks/:id/status — Update user status (active/applied/won/expired)
exports.updateBookmarkStatus = async (req, res, next) => {
  try {
    const { userStatus } = req.body;
    const validStatuses = ['active', 'applied', 'won', 'expired'];
    if (!validStatuses.includes(userStatus)) {
      const err = new Error('Invalid status value.');
      err.status = 400;
      return next(err);
    }
    await Bookmark.findByIdAndUpdate(req.params.id, { userStatus }).lean();
    return res.redirect('/bookmarks');
  } catch (err) {
    next(err);
  }
};