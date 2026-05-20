'use strict';

const axios = require('axios');

// Only require Bookmark when mongoose is ready
let Bookmark;
try {
  Bookmark = require('../models/Bookmark');
} catch (e) {
  console.error('[ZEROSCOPE] Could not load Bookmark model:', e.message);
}

const ZA_API_KEY = process.env.ZA_API_KEY || '';
const ZA_BASE_URL = 'https://zeroauthoritydao.com';

// ─── Real Scraped Fallback Data ───────────────────────────────
function getRealFallbackData() {
  return {
    bounties: [
      {
        id: 'fastpool-btcfi',
        title: 'FastPool BTCFi Challenge',
        description: 'Complete the FastPool BTCFi challenge on the Stacks Network. Contribute to Bitcoin DeFi innovation through the FastPool ecosystem.',
        reward: 'TBD', rewardToken: 'STX', status: 'open', category: 'General',
        poster: 'Ryder One Community',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'za-3hunna-clipping',
        title: 'ZA x 3HUNNA CLIPPING BOUNTY',
        description: 'Create viral marketing clips for the 3HUNNA x Zero Authority DAO collaboration on the Stacks Network.',
        reward: 'TBD', rewardToken: 'STX', status: 'open', category: 'Marketing',
        poster: '3hunnatheClipper',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'usda-alpha-arena',
        title: 'USDA Alpha Arena',
        description: 'Participate in the USDA Alpha Arena. Explore USDA stablecoin mechanics on Stacks.',
        reward: 'TBD', rewardToken: 'USDA', status: 'open', category: 'General',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'flat-frenzy',
        title: 'THE $FLAT FRENZY BOUNTY',
        description: 'Join the $FLAT Frenzy on Zero Authority DAO. Compete for rewards on the Stacks Network.',
        reward: 'TBD', rewardToken: '$FLAT', status: 'open', category: 'General',
        poster: 'Flat Earth',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'top-dawg-award',
        title: 'The Top Dawg Award',
        description: 'Win the Top Dawg Award. Prove yourself as the top contributor in the Dawgcoin ecosystem on Stacks.',
        reward: 'TBD', rewardToken: 'DAWG', status: 'open', category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'ruffs-to-riches-2',
        title: "'Ruffs-to-Riches' - Part Two",
        description: "Continue the Ruffs-to-Riches journey in Part Two of Dawgcoin's Zero Authority bounty series.",
        reward: 'TBD', rewardToken: 'DAWG', status: 'open', category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'megapont-lets-go-ape',
        title: 'Megapont Lets Go Ape',
        description: 'Create the best meme for Megapont and win in this Zero Authority DAO meme contest on Stacks.',
        reward: 'TBD', rewardToken: 'STX', status: 'open', category: 'Meme',
        poster: 'Creators Campaign',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
      {
        id: 'ruffs-to-riches-1',
        title: "'Ruffs-to-Riches' - Part One",
        description: "Start the Ruffs-to-Riches journey in Part One of Dawgcoin's Zero Authority bounty series.",
        reward: 'TBD', rewardToken: 'DAWG', status: 'open', category: 'General',
        poster: 'Dawgcoin',
        url: 'https://zeroauthoritydao.com/bounty',
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        postedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'bounty',
      },
    ],
    quests: [
      {
        id: '021c71f1-7b26-4344-b38f-beda107ade66',
        title: 'USDA Deployment Challenge',
        description: 'Become a Stacks Power User. Complete the USDA Deployment Challenge and earn 250 REP.',
        reward: '250', rewardToken: 'REP', status: 'open', category: 'DeFi',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/quests/021c71f1-7b26-4344-b38f-beda107ade66',
        type: 'quest',
      },
      {
        id: '494e3b31-db0a-4f17-b88c-aa9265d29af5',
        title: 'WELSH Corgi STX Dog Season',
        description: 'Become a Stacks Power User. Join the Welsh Corgi STX Dog Season quest and earn 250 REP.',
        reward: '250', rewardToken: 'REP', status: 'open', category: 'Community',
        poster: 'Welsh Community',
        url: 'https://zeroauthoritydao.com/quests/494e3b31-db0a-4f17-b88c-aa9265d29af5',
        type: 'quest',
      },
      {
        id: 'bc2f470a-69d9-48b5-8598-cd373896ab80',
        title: 'LEO Coin - STX Cat Season',
        description: 'Become a Stacks Power User. Complete the LEO Coin STX Cat Season quest and earn 250 REP.',
        reward: '250', rewardToken: 'REP', status: 'open', category: 'Community',
        poster: 'LEO Campaign',
        url: 'https://zeroauthoritydao.com/quests/bc2f470a-69d9-48b5-8598-cd373896ab80',
        type: 'quest',
      },
      {
        id: '8d45ff1b-7d5f-498a-aff7-3ab03b116223',
        title: 'Unlock STX Liquidity with USDA',
        description: 'Become a Stacks Power User. Unlock STX liquidity with USDA and earn 200 REP.',
        reward: '200', rewardToken: 'REP', status: 'open', category: 'DeFi',
        poster: 'DIKO Creators',
        url: 'https://zeroauthoritydao.com/quests/8d45ff1b-7d5f-498a-aff7-3ab03b116223',
        type: 'quest',
      },
      {
        id: '0c420ca2-ee7e-4215-a5c7-e4bdc534b4d5',
        title: 'Fast Pool Just Leveled Up',
        description: "Become a Stacks Power User. Complete Ryder's Fast Pool quest and earn 250 REP.",
        reward: '250', rewardToken: 'REP', status: 'open', category: 'Staking',
        poster: 'Fast Pool',
        url: 'https://zeroauthoritydao.com/quests/0c420ca2-ee7e-4215-a5c7-e4bdc534b4d5',
        type: 'quest',
      },
    ],
  };
}

// ─── Check MongoDB connection ─────────────────────────────────
function isMongoConnected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
  }
}

// ─── Compute Analytics ────────────────────────────────────────
function computeAnalytics(opportunities, bookmarks) {
  const bounties = opportunities.filter((o) => o.type === 'bounty');
  const quests = opportunities.filter((o) => o.type === 'quest');
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
    totalGigs: 0,
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
    const fallback = getRealFallbackData();
    const opportunities = [...fallback.bounties, ...fallback.quests];

    // Try to get bookmarks only if MongoDB is connected
    let bookmarks = [];
    let bookmarkedIds = [];
    if (isMongoConnected() && Bookmark) {
      try {
        bookmarks = await Bookmark.find().lean();
        bookmarkedIds = bookmarks.map((b) => b.opportunityId);
      } catch (e) {
        console.error('[ZEROSCOPE] Could not fetch bookmarks:', e.message);
      }
    }

    const analytics = computeAnalytics(opportunities, bookmarks);

    res.render('dashboard', {
      title: 'ZEROSCOPE — Dashboard',
      opportunities,
      allOpportunities: opportunities,
      bookmarkedIds,
      analytics,
      fromLiveAPI: false,
      activeCategory: req.query.category || null,
      activeType: req.query.type || null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /bookmarks
exports.getBookmarks = async (req, res, next) => {
  try {
    let bookmarks = [];

    if (isMongoConnected() && Bookmark) {
      try {
        bookmarks = await Bookmark.find().sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.error('[ZEROSCOPE] Bookmark fetch error:', e.message);
      }
    }

    res.render('bookmarks', {
      title: 'ZEROSCOPE — My Bookmarks',
      bookmarks,
      analytics: {
        totalBookmarks: bookmarks.length,
        activeCount: bookmarks.filter((b) => b.userStatus === 'active').length,
        appliedCount: bookmarks.filter((b) => b.userStatus === 'applied').length,
        wonCount: bookmarks.filter((b) => b.userStatus === 'won').length,
        statusBreakdown: {},
        categoryBreakdown: {},
      },
      activeStatus: req.query.status || 'all',
      activeCategory: req.query.category || 'all',
      error: isMongoConnected() ? null : 'Database is connecting — bookmarks will appear shortly.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /bookmarks — Save
exports.saveBookmark = async (req, res, next) => {
  try {
    if (!isMongoConnected() || !Bookmark) {
      return res.redirect('/?notice=db_connecting');
    }
    const { opportunityId, title, description, reward, rewardToken,
            status, category, url, type, poster, deadline, postedAt } = req.body;

    if (!opportunityId || !title) {
      return res.redirect('/');
    }

    const existing = await Bookmark.findOne({ opportunityId }).lean();
    if (existing) return res.redirect('/?notice=already_bookmarked');

    await Bookmark.create({
      opportunityId, title, description, reward,
      rewardToken: rewardToken || 'STX',
      status: status || 'open',
      userStatus: 'active',
      category: category || 'General',
      url, type: type || 'bounty',
      poster: poster || 'Zero Authority DAO',
      notes: '',
      postedAt: postedAt ? new Date(postedAt) : null,
      deadline: deadline ? new Date(deadline) : null,
    });

    return res.redirect('/bookmarks');
  } catch (err) {
    next(err);
  }
};

// POST /bookmarks/:id/delete
exports.deleteBookmark = async (req, res, next) => {
  try {
    if (!isMongoConnected() || !Bookmark) return res.redirect('/bookmarks');
    await Bookmark.findByIdAndDelete(req.params.id).lean();
    return res.redirect('/bookmarks');
  } catch (err) {
    next(err);
  }
};

// POST /bookmarks/:id/status
exports.updateBookmarkStatus = async (req, res, next) => {
  try {
    if (!isMongoConnected() || !Bookmark) return res.redirect('/bookmarks');
    const { userStatus } = req.body;
    await Bookmark.findByIdAndUpdate(req.params.id, { userStatus }).lean();
    return res.redirect('/bookmarks');
  } catch (err) {
    next(err);
  }
};s