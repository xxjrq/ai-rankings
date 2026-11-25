(() => {
  const SITE_URL = 'https://aimmme.com';

  const KNOWN_BRANDS = [
    { match: /anthropic|claude/i, initials: 'CL', bg: '#FDF4EE', fg: '#9A4415', border: '#F5D6C3' },
    { match: /openai|gpt|sora/i, initials: 'OA', bg: '#EEF8F5', fg: '#0E6B52', border: '#CBECE1' },
    { match: /google|gemini|veo|chrome/i, initials: 'GG', bg: '#EEF4FF', fg: '#1D4ED8', border: '#D1E0FF' },
    { match: /meta|llama|muse|astryx/i, initials: 'MT', bg: '#EFF6FF', fg: '#1E40AF', border: '#CFE0FF' },
    { match: /deepseek/i, initials: 'DS', bg: '#EEF2FF', fg: '#3730A3', border: '#D4DCFF' },
    { match: /kimi|moonshot/i, initials: 'KM', bg: '#F4F4F5', fg: '#18181B', border: '#D4D4D8' },
    { match: /qwen|wan|千问|通义/i, initials: 'QW', bg: '#F5F3FF', fg: '#5B21B6', border: '#DDD6FE' },
    { match: /alibaba/i, initials: 'AL', bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
    { match: /xai|spacex|grok/i, initials: 'GK', bg: '#F4F4F5', fg: '#09090B', border: '#D4D4D8' },
    { match: /xiaomi|mimo/i, initials: 'XM', bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
    { match: /z ai|zhipu|glm/i, initials: 'GL', bg: '#EFF6FF', fg: '#1D4ED8', border: '#DBEAFE' },
    { match: /minimax|hailuo/i, initials: 'MM', bg: '#FDF2F8', fg: '#9D174D', border: '#FBCFE8' },
    { match: /stepfun|step/i, initials: 'SF', bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
    { match: /tencent|hunyuan|yuanbao|元宝/i, initials: 'TC', bg: '#EFF6FF', fg: '#0369A1', border: '#BAE6FD' },
    { match: /bytedance|doubao|seedance|seedream|豆包|即梦/i, initials: 'DB', bg: '#F0F9FF', fg: '#0284C7', border: '#BAE6FD' },
    { match: /inclusion|ling|ring|蚂蚁/i, initials: 'IN', bg: '#F0FDFA', fg: '#0F766E', border: '#99F6E4' },
    { match: /nvidia|cosmos/i, initials: 'NV', bg: '#F0FDF4', fg: '#15803D', border: '#BBF7D0' },
    { match: /mistral/i, initials: 'MS', bg: '#FFFBEB', fg: '#B45309', border: '#FDE68A' },
    { match: /kling|kuaishou|可灵/i, initials: 'KL', bg: '#FFF7ED', fg: '#EA580C', border: '#FED7AA' },
    { match: /midjourney/i, initials: 'MJ', bg: '#F8FAFC', fg: '#0F172A', border: '#CBD5E1' },
    { match: /github/i, initials: 'GH', bg: '#F4F4F5', fg: '#09090B', border: '#D4D4D8' },
  ];

  const PALETTE = [
    { bg: '#F4F4F5', fg: '#27272A', border: '#E4E4E7' },
    { bg: '#F1F5F9', fg: '#334155', border: '#CBD5E1' },
    { bg: '#EFF6FF', fg: '#1E40AF', border: '#DBEAFE' },
    { bg: '#ECFDF5', fg: '#065F46', border: '#D1FAE5' },
    { bg: '#FFFBEB', fg: '#92400E', border: '#FEF3C7' },
    { bg: '#FAF5FF', fg: '#6B21A8', border: '#F3E8FF' },
  ];

  const state = {
    rankings: null,
    projects: [],
    view: 'rankings',
    domain: 'all',
    boardSlug: 'global-llm',
    snapshotDate: '',
    searchQuery: '',
    tableFilter: '',
    origin: 'all',
    sortBy: 'rank',
    compareKeys: [],
    projectKind: 'all',
    projectQuery: '',
    liveIndex: 0,
    liveTimer: null,
    livePaused: false,
  };

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toRelativeLogo(logoUrl) {
    if (!logoUrl) return '';
    return './' + String(logoUrl).replace(/^\/+/, '');
  }

  function getBadgeStyle(name, provider) {
    const probe = `${provider || ''} ${name || ''}`.trim();
    for (const b of KNOWN_BRANDS) {
      if (b.match.test(probe)) return b;
    }
    const label = (provider || name || 'AI').replace(/^[^a-zA-Z0-9\u4e00-\u9fff]+/, '');
    const words = label.match(/[A-Za-z0-9]+/g);
    let initials = 'AI';
    if (words && words.length >= 2) initials = (words[0][0] + words[1][0]).toUpperCase();
    else if (words && words[0].length >= 2) initials = words[0].slice(0, 2).toUpperCase();
    else if (label.length > 0) initials = label.slice(0, 1).toUpperCase();

    let hash = 0;
    for (let i = 0; i < probe.length; i++) hash = (hash * 31 + probe.charCodeAt(i)) >>> 0;
    return { initials, ...PALETTE[hash % PALETTE.length] };
  }

  function renderLogoHtml(item, small = false) {
    const badge = getBadgeStyle(item.name, item.provider || item.owner || item.repo);
    const rel = toRelativeLogo(item.logoUrl);
    const sizeCls = small ? 'sm' : '';
    const fbAttr = `data-initials="${escapeHtml(badge.initials)}" data-bg="${badge.bg}" data-fg="${badge.fg}" data-border="${badge.border}"`;
    if (rel) {
      return `<span class="brand-badge has-img ${sizeCls}" ${fbAttr} aria-hidden="true"><img src="${escapeHtml(rel)}" alt="" decoding="async" onerror="window.__aimmmeLogoFallback(this)" /></span>`;
    }
    return `<span class="brand-badge ${sizeCls}" style="background:${badge.bg};color:${badge.fg};border-color:${badge.border}" aria-hidden="true">${escapeHtml(badge.initials)}</span>`;
  }

  window.__aimmmeLogoFallback = function (imgEl) {
    const span = imgEl.parentElement;
    if (!span) return;
    span.classList.remove('has-img');
    span.style.background = span.dataset.bg || '#f4f4f5';
    span.style.color = span.dataset.fg || '#27272a';
    span.style.borderColor = span.dataset.border || '#e4e4e7';
    span.textContent = span.dataset.initials || 'AI';
  };

  function renderDeltaHtml(item) {
    if (item.isNew) return '<span class="delta-badge delta-new">NEW</span>';
    if (typeof item.rankDelta === 'number') {
      if (item.rankDelta > 0) return `<span class="delta-badge delta-up">↑ ${item.rankDelta}</span>`;
      if (item.rankDelta < 0) return `<span class="delta-badge delta-down">↓ ${Math.abs(item.rankDelta)}</span>`;
    }
    return '<span class="delta-flat">—</span>';
  }

  function getBoards() {
    return state.rankings?.boards || [];
  }

  function getBoard(slug) {
    const boards = getBoards();
    return boards.find(b => b.slug === slug) || boards[0];
  }

  function getActiveSnapshot(board) {
    if (!board || !board.snapshots?.length) return null;
    if (state.snapshotDate) {
      const hit = board.snapshots.find(s => s.date === state.snapshotDate);
      if (hit) return hit;
    }
    return board.snapshots[0];
  }

  function syncHash() {
    if (state.searchQuery) {
      history.replaceState(null, '', `#q=${encodeURIComponent(state.searchQuery)}`);
      return;
    }
    if (state.view === 'projects') {
      history.replaceState(null, '', '#projects');
      return;
    }
    const board = getBoard(state.boardSlug);
    const snap = getActiveSnapshot(board);
    if (board && snap) {
      history.replaceState(null, '', `#board=${encodeURIComponent(board.slug)}&date=${encodeURIComponent(snap.date)}`);
    }
  }

  function parseInitialHash() {
    const h = window.location.hash.replace(/^#/, '');
    if (!h) return;
    if (h === 'projects') {
      state.view = 'projects';
      return;
    }
    const params = new URLSearchParams(h);
    if (params.get('q')) state.searchQuery = params.get('q');
    if (params.get('board')) state.boardSlug = params.get('board');
    if (params.get('date')) state.snapshotDate = params.get('date');
  }

  function renderHeroLive() {
    const featured = getBoards().filter(b => b.featured).slice(0, 10);
    const list = featured.length ? featured : getBoards().slice(0, 10);
    if (!list.length) return;
    const idx = state.liveIndex % list.length;
    const board = list[idx];
    const snap = board.snapshots[0];
    const top3 = snap.items.slice(0, 3);

    document.getElementById('live-counter').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    document.getElementById('live-board-title').textContent = board.title;
    document.getElementById('live-board-meta').textContent = `${snap.sourceName} · ${snap.date} · ${snap.metricLabel}`;
    document.getElementById('hero-focus-chip').textContent = board.shortTitle || board.title;

    document.getElementById('live-top3-list').innerHTML = top3.map(it => `
      <div class="live-row">
        <div class="live-row-left">
          <span class="live-rank r${it.rank}">${it.rank}</span>
          ${renderLogoHtml(it, true)}
          <span class="live-row-name">${escapeHtml(it.name)}</span>
        </div>
        <span class="live-row-score">${escapeHtml(it.scoreDisplay)}</span>
      </div>
    `).join('');

    document.getElementById('live-dots').innerHTML = list.map((b, i) => `
      <button type="button" class="live-dot-btn ${i === idx ? 'is-active' : ''}" data-live-idx="${i}" aria-label="切换到 ${escapeHtml(b.shortTitle)}"></button>
    `).join('');

    const jumpBtn = document.getElementById('live-jump-btn');
    jumpBtn.onclick = () => {
      state.view = 'rankings';
      state.boardSlug = board.slug;
      state.snapshotDate = snap.date;
      state.tableFilter = '';
      state.compareKeys = [];
      renderAll();
      document.getElementById('board-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }

  function renderDomainAndPills() {
    const domains = state.rankings?.domains || [];
    const boards = getBoards();

    document.getElementById('domain-tabs').innerHTML = [
      `<button type="button" class="domain-tab ${state.domain === 'all' ? 'is-active' : ''}" data-domain="all">全部榜单 (${boards.length})</button>`,
      ...domains.map(d => {
        const count = boards.filter(b => b.domain === d.id).length;
        return `<button type="button" class="domain-tab ${state.domain === d.id ? 'is-active' : ''}" data-domain="${escapeHtml(d.id)}">${escapeHtml(d.name)} (${count})</button>`;
      })
    ].join('');

    const visibleBoards = state.domain === 'all' ? boards : boards.filter(b => b.domain === state.domain);
    document.getElementById('board-pills').innerHTML = visibleBoards.map(b => `
      <button type="button" class="board-pill ${b.slug === state.boardSlug ? 'is-active' : ''}" data-board="${escapeHtml(b.slug)}">${escapeHtml(b.shortTitle || b.title)}</button>
    `).join('');
  }

  function renderStage() {
    const board = getBoard(state.boardSlug);
    if (!board) return;
    const snap = getActiveSnapshot(board);
    if (!snap) return;

    const domainObj = (state.rankings?.domains || []).find(d => d.id === board.domain);
    document.getElementById('stage-eyebrow').textContent = `${domainObj?.name || board.domain} · ${snap.sourceName}`;
    document.getElementById('stage-title').textContent = board.title;
    document.getElementById('stage-subtitle').textContent = board.subtitle || board.description;

    const webBoardUrl = `${SITE_URL}/rankings/${encodeURIComponent(board.slug)}`;
    const mainLink = document.getElementById('stage-aimmme-link');
    mainLink.href = webBoardUrl;
    const srcLink = document.getElementById('stage-source-link');
    srcLink.href = snap.sourceUrls?.[0] || webBoardUrl;

    document.getElementById('snapshot-pills').innerHTML = board.snapshots.map((s, idx) => `
      <button type="button" class="snapshot-pill ${s.date === snap.date ? 'is-active' : ''}" data-date="${escapeHtml(s.date)}">
        ${escapeHtml(s.periodLabel || s.date)}${idx === 0 ? ' · 最新' : ''}
      </button>
    `).join('');

    // Podium
    const top3 = snap.items.slice(0, 3);
    document.getElementById('stage-podium').innerHTML = top3.map(it => `
      <article class="podium-card p${it.rank}">
        <div class="podium-top">
          <span class="podium-medal nums">NO. ${String(it.rank).padStart(2, '0')}</span>
          ${renderDeltaHtml(it)}
        </div>
        <div class="podium-identity">
          ${renderLogoHtml(it, false)}
          <div class="podium-name">${escapeHtml(it.name)}</div>
        </div>
        <div class="podium-score nums">${escapeHtml(it.scoreDisplay)}</div>
        <div class="podium-sub">${escapeHtml([it.provider, it.country, it.summary].filter(Boolean).join(' · ') || '官方核验条目')}</div>
      </article>
    `).join('');

    // Filter & sort items
    const q = state.tableFilter.trim().toLowerCase();
    let rows = snap.items.filter(it => {
      if (state.origin === 'cn' && it.country !== '中国') return false;
      if (state.origin === 'global' && (!it.country || it.country === '中国')) return false;
      if (state.origin === 'oss' && !it.isOpenSource && !it.repo) return false;
      if (q) {
        const hay = `${it.name} ${it.provider || ''} ${it.summary || ''} ${(it.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (state.sortBy === 'score') {
      rows = [...rows].sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || a.rank - b.rank);
    } else if (state.sortBy === 'delta') {
      rows = [...rows].sort((a, b) => (b.rankDelta ?? (b.isNew ? 99 : -99)) - (a.rankDelta ?? (a.isNew ? 99 : -99)) || a.rank - b.rank);
    }

    const hasDelta = snap.items.some(it => it.isNew || typeof it.rankDelta === 'number');
    document.getElementById('th-delta').style.display = hasDelta ? '' : 'none';
    document.getElementById('th-score').textContent = snap.metricLabel || '核心指标';

    const maxScore = Math.max(...snap.items.map(i => (typeof i.score === 'number' ? i.score : 0)), 1);

    document.getElementById('stage-table-body').innerHTML = rows.length ? rows.map(it => {
      const rowKey = `${board.slug}:${snap.date}:${it.rank}:${it.id}`;
      const isSelected = state.compareKeys.includes(rowKey);
      const pct = typeof it.score === 'number' && maxScore > 0 ? Math.max(8, Math.min(100, Math.round((it.score / maxScore) * 100))) : 0;
      const tags = [...new Set([it.country, ...(it.tags || [])].filter(Boolean))].slice(0, 3);
      const projectHref = it.projectSlug ? `${SITE_URL}/project/${encodeURIComponent(it.projectSlug)}` : '';
      const officialHref = it.officialUrl || webBoardUrl;

      return `
        <tr>
          <td><span class="rank-num nums ${it.rank <= 3 ? 'top' + it.rank : ''}">${String(it.rank).padStart(2, '0')}</span></td>
          ${hasDelta ? `<td>${renderDeltaHtml(it)}</td>` : ''}
          <td>
            <div class="entity-cell">
              ${renderLogoHtml(it, false)}
              <div>
                <div class="entity-name">${escapeHtml(it.name)}</div>
                ${it.summary ? `<div class="entity-summary">${escapeHtml(it.summary)}</div>` : ''}
              </div>
            </div>
          </td>
          <td>
            <div>${escapeHtml(it.provider || '—')}</div>
            <div class="tag-row">${tags.map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join('')}</div>
          </td>
          <td>
            <div class="score-bar-wrap">
              <div class="score-val nums">${escapeHtml(it.scoreDisplay)}</div>
              ${pct > 0 ? `<div class="score-track"><div class="score-fill" style="width:${pct}%"></div></div>` : ''}
            </div>
          </td>
          <td>
            <div class="row-actions">
              <button type="button" class="row-btn ${isSelected ? 'is-selected' : ''}" data-compare-key="${escapeHtml(rowKey)}">
                ${isSelected ? '已选对比' : '对比'}
              </button>
              <a class="row-btn" href="${escapeHtml(officialHref)}" target="_blank" rel="noopener noreferrer">官网 ↗</a>
              ${projectHref ? `<a class="row-btn" href="${escapeHtml(projectHref)}" target="_blank" rel="noopener noreferrer">战绩 ↗</a>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="6" class="loading-cell">当前筛选条件下暂无匹配条目</td></tr>';

    document.getElementById('stage-methodology').innerHTML =
      `<strong>数据口径说明：</strong>${escapeHtml(snap.methodology || '基于官方公开快照整理')} · <strong>采集日期：</strong>${escapeHtml(snap.date)} · <a href="${escapeHtml(webBoardUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-weight:600">前往 AIMMME 主站查看该榜单完整归档 ↗</a>`;

    renderComparePanel(board, snap);
  }

  function renderComparePanel(board, snap) {
    const panel = document.getElementById('compare-panel');
    const selected = state.compareKeys
      .map(key => snap.items.find(it => `${board.slug}:${snap.date}:${it.rank}:${it.id}` === key))
      .filter(Boolean);

    if (!selected.length) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }

    panel.hidden = false;
    panel.innerHTML = `
      <div class="compare-head">
        <span>已选择 ${selected.length} / 2 项进行对比（点击行内“对比”可切换）</span>
        <button type="button" class="row-btn" id="clear-compare-btn">清空对比</button>
      </div>
      <div class="compare-cols">
        ${selected.map(it => `
          <div class="compare-box">
            <div class="entity-cell" style="margin-bottom:6px">
              ${renderLogoHtml(it, false)}
              <div>
                <div class="entity-name">#${it.rank} ${escapeHtml(it.name)}</div>
                <div class="entity-summary">${escapeHtml(it.provider || '—')} · ${escapeHtml(snap.metricLabel)}: <strong>${escapeHtml(it.scoreDisplay)}</strong></div>
              </div>
            </div>
            ${it.secondaryMetrics?.length ? `<div class="tag-row">${it.secondaryMetrics.map(m => `<span class="mini-tag">${escapeHtml(m.label)}: ${escapeHtml(m.value)}</span>`).join('')}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('clear-compare-btn').onclick = () => {
      state.compareKeys = [];
      renderStage();
    };
  }

  function renderGallery() {
    const boards = getBoards();
    const visible = state.domain === 'all' ? boards : boards.filter(b => b.domain === state.domain);
    const domainMap = new Map((state.rankings?.domains || []).map(d => [d.id, d.name]));
    document.getElementById('gallery-count').textContent = String(visible.length);

    document.getElementById('boards-gallery-grid').innerHTML = visible.map(b => {
      const snap = b.snapshots[0];
      const top10 = snap.items.slice(0, 10);
      const webUrl = `${SITE_URL}/rankings/${encodeURIComponent(b.slug)}`;
      return `
        <article class="gallery-card ${b.slug === state.boardSlug ? 'is-current' : ''}">
          <div>
            <div class="gallery-card-top">
              <div>
                <span class="gallery-domain">${escapeHtml(domainMap.get(b.domain) || b.domain)}</span>
                <h3 class="gallery-title">${escapeHtml(b.title)}</h3>
              </div>
              <span class="gallery-date nums">${escapeHtml(snap.date)}</span>
            </div>
            <div class="gallery-top10">
              ${top10.map(it => `
                <div class="gallery-row">
                  <div class="gallery-row-left">
                    <span class="gallery-row-rank r${it.rank}">${String(it.rank).padStart(2, '0')}</span>
                    ${renderLogoHtml(it, true)}
                    <span class="gallery-row-name">${escapeHtml(it.name)}</span>
                  </div>
                  <span class="gallery-row-score">${escapeHtml(it.scoreDisplay)}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="gallery-card-foot">
            <button type="button" class="gallery-select-btn" data-select-board="${escapeHtml(b.slug)}">切换到主舞台 (${snap.items.length} 项)</button>
            <a class="gallery-ext-link" href="${escapeHtml(webUrl)}" target="_blank" rel="noopener noreferrer">主站交互版 ↗</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderCrossSearch() {
    const sec = document.getElementById('search-results-section');
    const clearBtn = document.getElementById('hero-search-clear');
    const q = state.searchQuery.trim().toLowerCase();

    if (!q) {
      sec.hidden = true;
      clearBtn.hidden = true;
      return;
    }

    clearBtn.hidden = false;
    sec.hidden = false;
    const hits = [];
    for (const b of getBoards()) {
      const snap = b.snapshots[0];
      for (const it of snap.items) {
        const hay = `${it.name} ${it.provider || ''} ${it.repo || ''} ${it.summary || ''}`.toLowerCase();
        if (hay.includes(q)) {
          hits.push({ board: b, snap, item: it });
        }
      }
    }

    document.getElementById('search-results-heading').textContent = `“${state.searchQuery}” 的跨榜命中（${hits.length} 条）`;
    document.getElementById('search-results-grid').innerHTML = hits.length
      ? hits.slice(0, 30).map(h => `
          <div class="search-hit">
            <div class="search-hit-left">
              ${renderLogoHtml(h.item, false)}
              <div>
                <div class="entity-name">#${h.item.rank} ${escapeHtml(h.item.name)}</div>
                <div class="search-hit-meta">${escapeHtml(h.board.shortTitle)} · ${escapeHtml(h.snap.date)} · ${escapeHtml(h.item.scoreDisplay)}</div>
              </div>
            </div>
            <div class="row-actions">
              <button type="button" class="row-btn" data-select-board="${escapeHtml(h.board.slug)}">定位榜单</button>
              <a class="row-btn" href="${escapeHtml(SITE_URL + '/rankings/' + encodeURIComponent(h.board.slug))}" target="_blank" rel="noopener noreferrer">主站 ↗</a>
            </div>
          </div>
        `).join('')
      : '<p style="color:#71717a;font-size:13.5px;margin:0">未找到匹配的模型、公司或开源项目，请尝试更换关键词（如 Claude、DeepSeek、OpenAI、Qwen）。</p>';
  }

  function renderProjects() {
    const q = state.projectQuery.trim().toLowerCase();
    const list = state.projects.filter(p => {
      if (state.projectKind !== 'all' && p.kind !== state.projectKind) return false;
      if (q) {
        const hay = `${p.name} ${p.repo || ''} ${p.owner || ''} ${p.summary || ''} ${p.language || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    document.getElementById('projects-filtered-count').textContent = `显示 ${list.length} / ${state.projects.length} 项`;
    document.getElementById('projects-grid').innerHTML = list.map(p => {
      const detailUrl = `${SITE_URL}/project/${encodeURIComponent(p.slug)}`;
      const cmd = p.installCommand || (p.repo ? `git clone https://github.com/${p.repo}.git` : '');
      return `
        <article class="project-card">
          <div>
            <div class="project-top">
              <span class="mini-tag">${escapeHtml(p.kind === 'skill' ? 'Agent Skill' : p.language || 'GitHub 开源')}</span>
              <span class="mini-tag nums">最佳 #${p.bestRank} · 上榜 ${p.appearancesCount} 次</span>
            </div>
            <div class="project-head">
              ${renderLogoHtml(p, false)}
              <h3 class="project-title">${escapeHtml(p.name)}</h3>
            </div>
            <p class="project-desc">${escapeHtml(p.summary)}</p>
          </div>
          <div>
            ${cmd ? `
              <div class="project-cmd" style="margin-bottom:10px">
                <code>${escapeHtml(cmd)}</code>
                <button type="button" class="copy-cmd-btn" data-copy="${escapeHtml(cmd)}">复制</button>
              </div>
            ` : ''}
            <div class="project-foot">
              <a style="color:#2563eb;font-weight:600" href="${escapeHtml(detailUrl)}" target="_blank" rel="noopener noreferrer">主站战绩与详情 ↗</a>
              <a style="color:#52525b;font-weight:600" href="${escapeHtml(p.officialUrl)}" target="_blank" rel="noopener noreferrer">官方源码 ↗</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderViewToggle() {
    const rSec = document.getElementById('view-rankings');
    const pSec = document.getElementById('view-projects');
    const isRankings = state.view === 'rankings';
    rSec.hidden = !isRankings;
    pSec.hidden = isRankings;
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.view === state.view);
    });
  }

  function renderAll() {
    renderViewToggle();
    renderCrossSearch();
    if (state.view === 'rankings') {
      renderDomainAndPills();
      renderStage();
      renderGallery();
    } else {
      renderProjects();
    }
    syncHash();
  }

  function bindEvents() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        state.view = btn.dataset.view;
        state.searchQuery = '';
        document.getElementById('hero-search-input').value = '';
        renderAll();
      });
    });

    document.getElementById('brand-home-link').addEventListener('click', (e) => {
      e.preventDefault();
      state.view = 'rankings';
      state.searchQuery = '';
      renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const searchForm = document.getElementById('hero-search-form');
    const searchInput = document.getElementById('hero-search-input');
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.searchQuery = searchInput.value;
      renderAll();
    });
    searchInput.addEventListener('input', () => {
      state.searchQuery = searchInput.value;
      renderCrossSearch();
    });
    document.getElementById('hero-search-clear').addEventListener('click', () => {
      state.searchQuery = '';
      searchInput.value = '';
      renderAll();
    });
    document.getElementById('search-exit-btn').addEventListener('click', () => {
      state.searchQuery = '';
      searchInput.value = '';
      renderAll();
    });

    document.getElementById('domain-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-domain]');
      if (!btn) return;
      state.domain = btn.dataset.domain;
      const boards = getBoards();
      const first = state.domain === 'all' ? boards[0] : boards.find(b => b.domain === state.domain);
      if (first && (state.domain !== 'all' && getBoard(state.boardSlug)?.domain !== state.domain)) {
        state.boardSlug = first.slug;
        state.snapshotDate = '';
        state.compareKeys = [];
      }
      renderAll();
    });

    document.getElementById('board-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-board]');
      if (!btn) return;
      state.boardSlug = btn.dataset.board;
      state.snapshotDate = '';
      state.compareKeys = [];
      state.tableFilter = '';
      document.getElementById('table-filter-input').value = '';
      renderAll();
    });

    document.getElementById('snapshot-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-date]');
      if (!btn) return;
      state.snapshotDate = btn.dataset.date;
      state.compareKeys = [];
      renderAll();
    });

    document.getElementById('table-filter-input').addEventListener('input', (e) => {
      state.tableFilter = e.target.value;
      renderStage();
    });

    document.getElementById('origin-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-origin]');
      if (!btn) return;
      state.origin = btn.dataset.origin;
      document.querySelectorAll('#origin-pills .chip').forEach(c => c.classList.toggle('is-active', c.dataset.origin === state.origin));
      renderStage();
    });

    document.getElementById('table-sort-select').addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderStage();
    });

    document.getElementById('copy-top10-btn').addEventListener('click', async () => {
      const board = getBoard(state.boardSlug);
      const snap = getActiveSnapshot(board);
      if (!board || !snap) return;
      const lines = [
        `${board.title}（${snap.date} · ${snap.sourceName}）`,
        ...snap.items.slice(0, 10).map(it => `#${it.rank} ${it.name} — ${it.scoreDisplay}`),
        `完整交互榜：${SITE_URL}/rankings/${board.slug}`
      ];
      await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
      const btn = document.getElementById('copy-top10-btn');
      const old = btn.textContent;
      btn.textContent = '已复制 TOP10 ✓';
      setTimeout(() => { btn.textContent = old; }, 1600);
    });

    document.getElementById('stage-table-body').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-compare-key]');
      if (!btn) return;
      const key = btn.dataset.compareKey;
      const idx = state.compareKeys.indexOf(key);
      if (idx >= 0) state.compareKeys.splice(idx, 1);
      else if (state.compareKeys.length < 2) state.compareKeys.push(key);
      else state.compareKeys = [state.compareKeys[1], key];
      renderStage();
    });

    document.addEventListener('click', (e) => {
      const sel = e.target.closest('[data-select-board]');
      if (sel) {
        state.view = 'rankings';
        state.boardSlug = sel.dataset.selectBoard;
        state.snapshotDate = '';
        state.searchQuery = '';
        state.compareKeys = [];
        document.getElementById('hero-search-input').value = '';
        renderAll();
        document.getElementById('board-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) {
        navigator.clipboard.writeText(copyBtn.dataset.copy).catch(() => {});
        const old = copyBtn.textContent;
        copyBtn.textContent = '已复制';
        setTimeout(() => { copyBtn.textContent = old; }, 1400);
      }
    });

    document.getElementById('live-dots').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-live-idx]');
      if (!btn) return;
      state.liveIndex = Number(btn.dataset.liveIdx) || 0;
      renderHeroLive();
    });

    const liveCard = document.querySelector('.hero-live-card');
    liveCard.addEventListener('mouseenter', () => { state.livePaused = true; });
    liveCard.addEventListener('mouseleave', () => { state.livePaused = false; });

    document.getElementById('project-search-input').addEventListener('input', (e) => {
      state.projectQuery = e.target.value;
      renderProjects();
    });

    document.getElementById('project-kind-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-kind]');
      if (!btn) return;
      state.projectKind = btn.dataset.kind;
      document.querySelectorAll('#project-kind-pills .chip').forEach(c => c.classList.toggle('is-active', c.dataset.kind === state.projectKind));
      renderProjects();
    });
  }

  async function init() {
    parseInitialHash();
    bindEvents();
    try {
      const [rankRes, projRes] = await Promise.all([
        fetch('./data/rankings.json'),
        fetch('./data/projects.json')
      ]);
      if (!rankRes.ok || !projRes.ok) throw new Error('HTTP load error');
      state.rankings = await rankRes.json();
      const projPayload = await projRes.json();
      state.projects = projPayload.projects || [];

      const meta = state.rankings.meta || {};
      document.getElementById('hero-updated-at').textContent = meta.updatedAt || '2026-11-20';
      document.getElementById('stat-boards').textContent = String(meta.boardCount || getBoards().length);
      document.getElementById('stat-snapshots').textContent = String(meta.snapshotCount || 43);
      document.getElementById('stat-projects').textContent = String(state.projects.length);
      document.getElementById('projects-total').textContent = String(state.projects.length);

      if (state.searchQuery) {
        document.getElementById('hero-search-input').value = state.searchQuery;
      }

      renderHeroLive();
      renderAll();

      state.liveTimer = setInterval(() => {
        if (!state.livePaused) {
          state.liveIndex = (state.liveIndex + 1) % 10;
          renderHeroLive();
        }
      }, 4500);
    } catch (err) {
      document.getElementById('stage-table-body').innerHTML =
        `<tr><td colspan="6" class="loading-cell">榜单数据加载失败，请访问 <a href="${SITE_URL}/rankings" style="color:#2563eb;font-weight:700">aimmme.com/rankings</a></td></tr>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
