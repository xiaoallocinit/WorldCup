const DATA = window.WORLD_CUP_DATA;
const app = document.getElementById("app");

// 应用手动比分覆盖（assets/data/score-overrides.js）
const SCORE_OVERRIDES = window.SCORE_OVERRIDES || {};
for (const match of DATA.matches) {
  const override = SCORE_OVERRIDES[match.id];
  if (override && Array.isArray(override.score)) {
    match.prediction.score = override.score;
  }
}

// 应用已结束比赛的真实比分（assets/data/results.js）
const MATCH_RESULTS = window.MATCH_RESULTS || {};
for (const match of DATA.matches) {
  const record = MATCH_RESULTS[match.id];
  if (record && Array.isArray(record.result)) {
    match.result = record.result;
    match.finished = true;
  }
}

// 已结束比赛的比分分布，供后续比分概率分析参考
function scoreDistribution() {
  const counts = new Map();
  let total = 0;
  for (const match of DATA.matches) {
    if (!match.finished) continue;
    const key = `${match.result[0]}:${match.result[1]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
    total += 1;
  }
  return {
    total,
    rows: [...counts.entries()].sort((a, b) => b[1] - a[1])
  };
}

const state = {
  query: "",
  stage: "all",
  group: "all",
  matchId: "",
  page: 0
};

const WEIGHTS = [
  ["球员身价", 18],
  ["近期状态", 17],
  ["攻守战法", 20],
  ["赔率市场", 15],
  ["过往成绩", 10],
  ["外部因子", 12],
  ["主客场", 8]
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markSvg() {
  return `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#f3b643" stroke-width="1.7"/>
      <path d="M7.5 8.5 12 5l4.5 3.5-1.8 5.2H9.3L7.5 8.5Z" stroke="#f3b643" stroke-width="1.7"/>
      <path d="m9.3 13.7-2.8 3M14.7 13.7l2.8 3" stroke="#e14242" stroke-width="1.7"/>
    </svg>`;
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(DATA.generatedAt));
}

function formatKickoff(match) {
  const beijing = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(match.kickoffUtc));
  return `${match.date} · ${match.time} · 北京 ${beijing}`;
}

function isPlaceholder(team) {
  return !DATA.teams[team];
}

function placeholderLabel(team) {
  const value = String(team || "");
  const wl = value.match(/^([WL])(\d+)$/);
  if (wl) return `第 ${wl[2]} 场${wl[1] === "W" ? "胜者" : "负者"}`;
  const rank = value.match(/^([123])([A-L])$/);
  if (rank) return `${rank[2]} 组第 ${rank[1]}`;
  const third = value.match(/^3([A-L](?:\/[A-L])+)$/);
  if (third) return `${third[1]} 组最佳第三`;
  return value || "待定球队";
}

const FLAG_CODES = {
  "Algeria": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Belgium": "be",
  "Bosnia & Herzegovina": "ba",
  "Brazil": "br",
  "Canada": "ca",
  "Cape Verde": "cv",
  "Colombia": "co",
  "Croatia": "hr",
  "Curaçao": "cw",
  "Czech Republic": "cz",
  "DR Congo": "cd",
  "Ecuador": "ec",
  "Egypt": "eg",
  "England": "gb-eng",
  "France": "fr",
  "Germany": "de",
  "Ghana": "gh",
  "Haiti": "ht",
  "Iran": "ir",
  "Iraq": "iq",
  "Ivory Coast": "ci",
  "Japan": "jp",
  "Jordan": "jo",
  "Mexico": "mx",
  "Morocco": "ma",
  "Netherlands": "nl",
  "New Zealand": "nz",
  "Norway": "no",
  "Panama": "pa",
  "Paraguay": "py",
  "Portugal": "pt",
  "Qatar": "qa",
  "Saudi Arabia": "sa",
  "Scotland": "gb-sct",
  "Senegal": "sn",
  "South Africa": "za",
  "South Korea": "kr",
  "Spain": "es",
  "Sweden": "se",
  "Switzerland": "ch",
  "Tunisia": "tn",
  "Turkey": "tr",
  "USA": "us",
  "Uruguay": "uy",
  "Uzbekistan": "uz"
};

function flagIcon(teamName) {
  const flagCode = FLAG_CODES[teamName];
  if (!flagCode) return "";
  return `<img class="flag-icon" src="https://flagcdn.com/24x18/${flagCode}.png" srcset="https://flagcdn.com/48x36/${flagCode}.png 2x" alt="" loading="lazy">`;
}

function team(teamName) {
  return DATA.teams[teamName] || {
    name: teamName,
    zh: placeholderLabel(teamName),
    code: teamName.length <= 4 ? teamName : "TBD",
    rating: 68,
    attack: 68,
    defense: 68,
    valueText: "待定",
    valueMillions: 0,
    style: "晋级路径待定",
    stars: [],
    confed: "TBD",
    homeBoost: 0
  };
}

function teamLabel(teamName) {
  const t = team(teamName);
  return t.zh || t.name;
}

function code(teamName) {
  const t = team(teamName);
  return t.code || String(teamName).slice(0, 3).toUpperCase();
}

function money(value) {
  if (!value) return "待定";
  if (value >= 1000) return `€${(value / 1000).toFixed(2)}bn`;
  if (value >= 10) return `€${value.toFixed(1)}m`;
  return `€${value.toFixed(2)}m`;
}

function odds(prob) {
  if (!prob) return "-";
  return (100 / prob * 0.94).toFixed(2);
}

function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function poissonProb(k, lambda) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

// 基于模型 xg（期望进球）用泊松分布推算"波胆"比分概率与对应的公平赔率
function correctScoreOdds(match, limit = 6) {
  const [homeXg, awayXg] = match.prediction.xg;
  const maxGoals = 6;
  const margin = 0.92; // 模拟盘口抽水后的赔付比例
  const rows = [];
  let total = 0;
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      const pr = poissonProb(i, homeXg) * poissonProb(j, awayXg);
      rows.push({ score: [i, j], pr });
      total += pr;
    }
  }
  return rows
    .map((row) => ({ score: row.score, prob: row.pr / total }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, limit)
    .map((row) => ({ ...row, odds: Math.max(1.01, (margin / row.prob)) }));
}

function venueCountry(ground) {
  if (/Mexico|Guadalajara|Monterrey/i.test(ground)) return "墨西哥";
  if (/Toronto|Vancouver/i.test(ground)) return "加拿大";
  return "美国";
}

function topbar(subtitle, actions = "") {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="mark">${markSvg()}</div>
        <div>
          <h1>世界杯比分预测系统</h1>
          <p>${esc(subtitle)}</p>
        </div>
      </div>
      <div class="pillrow">${actions}</div>
    </header>`;
}

function renderDashboard() {
  const matches = filteredMatches();
  const groupOptions = ["all", ...Array.from(new Set(DATA.matches.map((m) => m.groupZh || "淘汰赛")))];
  app.className = "app dashboard-view";
  app.innerHTML = `
    <section class="shell">
      ${topbar(`${DATA.name}`, `
        <div class="pill">104 MATCHES</div>
        <div class="pill">48 TEAMS</div>
        <div class="pill">144 STAR CARDS</div>
      `)}
      <div class="dashboard-grid">
        <aside class="dashboard-panel">
          <div class="eyebrow">World Cup Prediction Board</div>
          <h2>世界杯首页看板</h2>
          <p class="subtitle">2026 世界杯全部 104 场赛程一览，AI 模型综合球队身价、阵容实力、近期状态与主客场因素，为每场比赛生成比分预测。点击“生成预测”可查看该场比赛的完整分析报告。</p>
          <div class="stat-grid">
            <div class="stat-card"><b>${DATA.matches.length}</b><span>全部比赛</span></div>
            <div class="stat-card"><b>${Object.keys(DATA.teams).length}</b><span>参赛队伍</span></div>
            <div class="stat-card"><b>${Object.values(DATA.teams).reduce((n, t) => n + t.stars.length, 0)}</b><span>明星球员卡</span></div>
            <div class="stat-card"><b>${matches.length}</b><span>当前筛选</span></div>
          </div>
          <div class="filters">
            <input id="searchInput" value="${esc(state.query)}" placeholder="搜索球队、城市、场次">
            <select id="stageSelect">
              <option value="all"${state.stage === "all" ? " selected" : ""}>全部阶段</option>
              <option value="group"${state.stage === "group" ? " selected" : ""}>只看小组赛</option>
              <option value="knockout"${state.stage === "knockout" ? " selected" : ""}>只看淘汰赛</option>
            </select>
            <select id="groupSelect">
              ${groupOptions.map((g) => `<option value="${esc(g)}"${state.group === g ? " selected" : ""}>${g === "all" ? "全部小组" : esc(g)}</option>`).join("")}
            </select>
          </div>
          <p class="note">赛程来自 openfootball 2026 JSON；国家队总身价、明星球员身价和头像由 Transfermarkt 搜索页抓取后保存到本地。淘汰赛未定对阵会以晋级路径占位生成。</p>
          ${scoreDistributionPanel()}
        </aside>
        <section class="matches-panel">
          <div class="matches-head">
            <div>
              <div class="eyebrow">Match List</div>
              <h2>全部比赛与预测比分</h2>
              <p class="subtitle">当前显示 ${matches.length} 场。比分为模型预测，不是投注建议。</p>
            </div>
            <button class="primary" data-generate="${esc(matches[0]?.id || DATA.matches[0].id)}">生成第一场预测</button>
          </div>
          <div class="match-list">
            ${matches.length ? matches.map(matchCard).join("") : `<div class="empty-state">没有匹配的比赛。</div>`}
          </div>
        </section>
      </div>
    </section>`;

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    if (event.isComposing) return;
    const cursor = event.target.selectionStart;
    renderDashboard();
    const input = document.getElementById("searchInput");
    input.focus();
    input.setSelectionRange(cursor, cursor);
  });
  document.getElementById("searchInput").addEventListener("compositionend", (event) => {
    state.query = event.target.value;
    const cursor = event.target.selectionStart;
    renderDashboard();
    const input = document.getElementById("searchInput");
    input.focus();
    input.setSelectionRange(cursor, cursor);
  });
  document.getElementById("stageSelect").addEventListener("change", (event) => {
    state.stage = event.target.value;
    renderDashboard();
  });
  document.getElementById("groupSelect").addEventListener("change", (event) => {
    state.group = event.target.value;
    renderDashboard();
  });
}

function filteredMatches() {
  const query = state.query.trim().toLowerCase();
  return DATA.matches.filter((match) => {
    if (state.stage === "group" && !match.group) return false;
    if (state.stage === "knockout" && match.group) return false;
    if (state.group !== "all" && (match.groupZh || "淘汰赛") !== state.group) return false;
    if (!query) return true;
    const haystack = [
      match.id,
      match.roundZh,
      match.groupZh,
      match.ground,
      match.team1,
      match.team2,
      teamLabel(match.team1),
      teamLabel(match.team2)
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function scoreDistributionPanel() {
  const { total, rows } = scoreDistribution();
  if (!total) {
    return `
      <div class="score-stats">
        <div class="eyebrow">Result Tracker</div>
        <h3>已结束比赛比分分布</h3>
        <p class="note">暂无已结束比赛。每场比赛结束后，在 assets/data/results.js 中填入真实比分，这里会自动统计比分出现频率，供后续比分概率分析参考。</p>
      </div>`;
  }
  return `
    <div class="score-stats">
      <div class="eyebrow">Result Tracker</div>
      <h3>已结束比赛比分分布（${total} 场）</h3>
      <div class="score-stats-grid">
        ${rows.map(([score, count]) => `<div class="score-stat-pill"><b>${esc(score)}</b><span>${count} 次 · ${((count / total) * 100).toFixed(1)}%</span></div>`).join("")}
      </div>
    </div>`;
}

function matchCard(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction;
  return `
    <article class="match-card${match.finished ? " finished" : ""}">
      <div class="match-meta">
        <b>${esc(match.id)}</b>
        ${match.finished ? `<span class="status-badge">已结束</span>` : ""}
        <span>${esc(formatKickoff(match))}</span>
        <span>${esc(match.roundZh)} · ${esc(match.groupZh || "淘汰赛")}</span>
        <span>${esc(match.ground)}</span>
      </div>
      <div class="matchup">
        <div class="team-inline">
          ${flagIcon(match.team1)}
          <div><strong>${esc(a.zh)}</strong><small>${esc(match.team1)}</small></div>
        </div>
        <div class="score-pill">
          ${match.finished ? `<span class="result-score">${match.result[0]} : ${match.result[1]}</span><span class="predicted-score">预测 ${p.score[0]}:${p.score[1]}</span>` : `${p.score[0]} : ${p.score[1]}`}
        </div>
        <div class="team-inline right">
          <div><strong>${esc(b.zh)}</strong><small>${esc(match.team2)}</small></div>
          ${flagIcon(match.team2)}
        </div>
      </div>
      <div class="match-actions">
        <div class="prob-row">
          <span><b>${p.probabilities.home}%</b>${esc(a.zh)}胜</span>
          <span><b>${p.probabilities.draw}%</b>平局</span>
          <span><b>${p.probabilities.away}%</b>${esc(b.zh)}胜</span>
        </div>
        <div class="odds-row">
          ${correctScoreOdds(match, 3).map((row) => `<span class="odds-pill"><b>${row.score[0]}-${row.score[1]}</b> @ <em>${row.odds.toFixed(2)}</em></span>`).join("")}
        </div>
        <button class="primary" data-generate="${esc(match.id)}">生成预测</button>
      </div>
    </article>`;
}

function renderDeck(matchId, page = 0, pushHash = true) {
  const match = DATA.matches.find((item) => item.id === matchId) || DATA.matches[0];
  state.matchId = match.id;
  state.page = Math.max(0, Math.min(7, Number(page) || 0));
  if (pushHash) setHash(match.id, state.page);

  const ACCENTS = ["gold", "cyan", "green", "red"];
  app.className = "app deck-view";
  app.innerHTML = `
    <section class="deck-shell">
      ${topbar(`${match.id} · ${teamLabel(match.team1)} vs ${teamLabel(match.team2)} · ${formatKickoff(match)}`, `
        <div class="host-ribbon">
          ${flagIcon("Mexico")}${flagIcon("USA")}${flagIcon("Canada")}
          <span>FIFA WORLD CUP 2026</span>
        </div>
        <button data-back>返回首页</button>
        <div class="pill">${esc(match.roundZh)}</div>
        <div class="pill">${esc(match.ground)}</div>
      `)}
      <section class="deck-frame">
        ${slides(match).map((html, index) => `<article class="slide${index === state.page ? " active" : ""}" data-slide="${index}" data-accent="${ACCENTS[index % ACCENTS.length]}">${html}</article>`).join("")}
      </section>
      <footer class="bottombar">
        <div class="thumbs">
          ${Array.from({ length: 8 }, (_, index) => `<button class="thumb${index === state.page ? " active" : ""}" data-page="${index}">${String(index + 1).padStart(2, "0")}</button>`).join("")}
        </div>
        <div class="nav">
          <button data-step="-1" aria-label="上一页">‹</button>
          <button data-step="1" aria-label="下一页">›</button>
        </div>
      </footer>
    </section>`;
}

function setHash(matchId, page) {
  const next = `#match=${matchId}&page=${page + 1}`;
  if (location.hash !== next) location.hash = next;
}

function changePage(delta) {
  if (!state.matchId) return;
  renderDeck(state.matchId, state.page + delta);
}

function goPage(page) {
  if (!state.matchId) return;
  renderDeck(state.matchId, page);
}

function slides(match) {
  return [
    slideScore(match),
    slidePlayers(match),
    slideHistory(match),
    slideTactics(match),
    slideOdds(match),
    slideResults(match),
    slideExternal(match),
    slideModel(match)
  ];
}

function slideHeader(num, label, title, subtitle) {
  return `
    <div class="slide-header">
      <div>
        <div class="eyebrow">${String(num).padStart(2, "0")} / 08 · ${esc(label)}</div>
        <h2>${esc(title)}</h2>
        <p class="subtitle">${esc(subtitle)}</p>
      </div>
      <div class="page-no"><span class="page-no-num">${String(num).padStart(2, "0")}</span><span class="page-no-label">${esc(label)}</span></div>
    </div>
    <div class="slide-watermark" aria-hidden="true">${String(num).padStart(2, "0")}</div>`;
}

function slideScore(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction;
  return `
    <div class="slide-inner">
      ${slideHeader(1, "Final Score Forecast", "比分预测", `模型把双方身价、明星球员、近期走势、攻守结构、赔率市场、外部因子和主客场合并为单场概率。${p.note}`)}
      <div class="hero-grid">
        <div class="score-card">
          <div class="teams">
            <div class="team">
              ${flagIcon(match.team1)}
              <div class="team-name">${esc(a.zh)}</div>
              <div class="team-meta">${esc(a.style)} · 总身价 ${esc(a.valueText)}</div>
            </div>
            <div class="score">${p.score[0]} : ${p.score[1]}</div>
            <div class="team right">
              <div class="team-name">${esc(b.zh)}</div>
              <div class="team-meta">${esc(b.style)} · 总身价 ${esc(b.valueText)}</div>
              ${flagIcon(match.team2)}
            </div>
          </div>
          <div class="confidence">
            <div class="metric"><b>${p.probabilities.home}%</b><span>${esc(a.zh)}胜</span></div>
            <div class="metric"><b>${p.probabilities.draw}%</b><span>平局</span></div>
            <div class="metric"><b>${p.probabilities.away}%</b><span>${esc(b.zh)}胜</span></div>
          </div>
          <p class="note">预测不是投注建议。赛前首发、临场伤停、盘口流动和天气变化会改变结果。</p>
        </div>
        <div class="side-panel">
          <div class="model-box">
            <div class="eyebrow">Model Signal</div>
            ${modelRow("综合实力", Math.round((a.rating + b.rating) / 2), 100)}
            ${modelRow(`${a.zh}进攻`, a.attack, 100)}
            ${modelRow(`${b.zh}进攻`, b.attack, 100)}
            ${modelRow("市场信心", p.confidence, 100)}
            ${modelRow("总进球倾向", Math.round(p.totalGoals / 4 * 100), 100)}
          </div>
          <div class="grid-2">
            <div class="mini-card"><b>${p.totalGoals}</b><span>预期总进球</span></div>
            <div class="mini-card"><b>${p.bothScore}%</b><span>双方进球概率</span></div>
            <div class="mini-card"><b>${p.xg[0]}</b><span>${esc(a.zh)} xG</span></div>
            <div class="mini-card"><b>${p.xg[1]}</b><span>${esc(b.zh)} xG</span></div>
          </div>
        </div>
      </div>
    </div>`;
}

function slidePlayers(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const diff = a.valueMillions && b.valueMillions ? Math.round((a.valueMillions - b.valueMillions) / Math.max(b.valueMillions, 1) * 100) : 0;
  return `
    <div class="slide-inner">
      ${slideHeader(2, "Player Value", "明星球员身价与头像", "本页明星球员卡由 Transfermarkt 搜索页抓取，头像已下载到本地 assets/players。身价反映阵容上限和核心球员稀缺性。")}
      <div class="analysis-layout">
        <div>
          <p class="headline-number">${diff >= 0 ? "+" : ""}${diff}%</p>
          <p class="subtitle">${esc(a.zh)} 总身价 ${esc(a.valueText)}，${esc(b.zh)} 总身价 ${esc(b.valueText)}。若淘汰赛对阵暂未确定，球员卡会在球队确定后更新。</p>
          <div class="grid-2">
            <div class="mini-card"><b>${esc(a.valueText)}</b><span>${esc(a.zh)}国家队总身价</span></div>
            <div class="mini-card"><b>${esc(b.valueText)}</b><span>${esc(b.zh)}国家队总身价</span></div>
            <div class="mini-card"><b>${a.stars.length}</b><span>${esc(a.zh)}明星样本</span></div>
            <div class="mini-card"><b>${b.stars.length}</b><span>${esc(b.zh)}明星样本</span></div>
          </div>
        </div>
        <div class="players-grid">
          ${playerSide(a)}
          ${playerSide(b)}
        </div>
      </div>
    </div>`;
}

function playerSide(t) {
  const cards = t.stars.length
    ? t.stars.map(playerCard).join("")
    : `<div class="source-card"><b>待定</b><span>晋级队未确定，暂无可抓取球员卡。</span></div>`;
  return `<div class="player-side"><h3>${esc(t.zh)}</h3>${cards}</div>`;
}

function playerCard(player) {
  const img = player.image
    ? `<img class="avatar" src="${esc(player.image)}" alt="${esc(player.name)}">`
    : `<div class="avatar-fallback">${esc((player.name || "?").slice(0, 1))}</div>`;
  return `
    <div class="player-card">
      ${img}
      <div>
        <strong>${esc(player.name)}</strong>
        <span>${esc(player.position)} · ${player.age ? `${player.age}岁` : "年龄待定"}</span>
        <small>${esc(player.club || "俱乐部待定")}</small>
      </div>
      <div class="player-value">${esc(player.marketValueText || money(player.marketValueMillions))}</div>
    </div>`;
}

function slideHistory(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction;
  return `
    <div class="slide-inner">
      ${slideHeader(3, "History & Form", "历史比赛与近期状态", "系统用强度评分、洲际背景、赛程阶段和进攻/防守分模拟近期状态。真实赛前可接入近 10 场战绩源替换本页。")}
      <div class="grid-3">
        <div class="source-card"><b>${a.rating}</b><span>${esc(a.zh)}综合强度评分</span></div>
        <div class="source-card"><b>${b.rating}</b><span>${esc(b.zh)}综合强度评分</span></div>
        <div class="source-card"><b>${p.confidence}%</b><span>模型置信度</span></div>
      </div>
      <div class="analysis-layout">
        <div class="model-box">
          <div class="eyebrow">Form Score</div>
          ${modelRow(`${a.zh}进攻`, a.attack, 100)}
          ${modelRow(`${a.zh}防守`, a.defense, 100)}
          ${modelRow(`${b.zh}进攻`, b.attack, 100)}
          ${modelRow(`${b.zh}防守`, b.defense, 100)}
        </div>
        <div class="table">
          <div class="tr head"><span>比赛阶段</span><span>模型判断</span><span>比分影响</span></div>
          <div class="tr"><strong>0-20 分钟</strong><span>${esc(a.zh)}尝试建立节奏</span><span>早进球概率影响全局</span></div>
          <div class="tr"><strong>20-60 分钟</strong><span>${esc(b.zh)}寻找转换窗口</span><span>平局情景上升</span></div>
          <div class="tr"><strong>60-80 分钟</strong><span>替补和体能分化</span><span>强队二次领先概率提升</span></div>
          <div class="tr"><strong>80 分钟后</strong><span>定位球与犯规风险</span><span>尾部比分波动</span></div>
        </div>
      </div>
    </div>`;
}

function slideTactics(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  return `
    <div class="slide-inner">
      ${slideHeader(4, "Tactical Matchup", "攻守战法", `${a.zh} 的主要路径是 ${a.style}；${b.zh} 的主要路径是 ${b.style}。模型会把战法相克计入 xG 分布。`)}
      <div class="analysis-layout">
        <div class="tactics" aria-label="战术示意图">
          <div class="player-dot" style="left:14%;top:46%;">LB</div>
          <div class="player-dot" style="left:31%;top:24%;">LW</div>
          <div class="player-dot" style="left:47%;top:43%;">10</div>
          <div class="player-dot" style="left:64%;top:31%;">RW</div>
          <div class="player-dot" style="left:78%;top:47%;">9</div>
          <div class="player-dot away" style="left:82%;top:63%;">CB</div>
          <div class="player-dot away" style="left:61%;top:68%;">6</div>
          <div class="player-dot away" style="left:42%;top:65%;">8</div>
          <div class="player-dot away" style="left:25%;top:68%;">ST</div>
          <div class="arrow" style="left:29%;top:33%;width:190px;transform:rotate(12deg);"></div>
          <div class="arrow" style="left:59%;top:56%;width:150px;transform:rotate(-31deg);"></div>
        </div>
        <div class="grid-2">
          <div class="mini-card"><b>${esc(a.zh)}</b><span>${esc(a.style)}。若先入球，比赛会进入更开放的转换节奏。</span></div>
          <div class="mini-card"><b>${esc(b.zh)}</b><span>${esc(b.style)}。若能压住前 25 分钟，平局概率上升。</span></div>
          <div class="mini-card"><b>关键空间</b><span>边后卫身后、后腰两侧和禁区弧顶是最容易改变比分的区域。</span></div>
          <div class="mini-card"><b>关键事件</b><span>首发中锋状态、定位球质量和第 60 分钟后的替补速度。</span></div>
        </div>
      </div>
    </div>`;
}

function slideOdds(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction.probabilities;
  const scoreOdds = correctScoreOdds(match, 10);
  return `
    <div class="slide-inner">
      ${slideHeader(5, "Odds & Market", "赔率与市场信号", "本页为模型概率折算的公平赔率区间，用来模拟盘口温度；波胆赔率由模型 xg 通过泊松分布推算，仅供参考。")}
      <div class="analysis-layout">
        <div>
          <p class="headline-number">${odds(p.home)}</p>
          <p class="subtitle">${esc(a.zh)}模型公平欧赔约 ${odds(p.home)}，平局 ${odds(p.draw)}，${esc(b.zh)} ${odds(p.away)}。盘口若明显偏离，可视为市场分歧。</p>
          <div class="grid-2">
            <div class="mini-card"><b>${p.home}%</b><span>${esc(a.zh)}隐含胜率</span></div>
            <div class="mini-card"><b>${match.prediction.totalGoals}</b><span>模型大小球中枢</span></div>
          </div>
        </div>
        <div class="table">
          <div class="tr head"><span>市场</span><span>价格信号</span><span>模型动作</span></div>
          <div class="tr"><strong>胜平负</strong><span>${p.home > p.away ? a.zh : b.zh}更热</span><span>调整胜率权重</span></div>
          <div class="tr"><strong>大小球</strong><span>${match.prediction.totalGoals > 2.55 ? "偏大球" : "中低比分"}</span><span>总进球收敛到 ${match.prediction.totalGoals}</span></div>
          <div class="tr"><strong>双方进球</strong><span>${match.prediction.bothScore}%</span><span>${match.prediction.bothScore > 55 ? "2-1 高于 2-0" : "零封情景保留"}</span></div>
          <div class="tr"><strong>盘口风险</strong><span>临场首发敏感</span><span>赛前 60 分钟重算</span></div>
        </div>
      </div>
      <div class="score-odds-grid">
        ${scoreOdds.map((row) => `<div class="mini-card${row.score[0] === match.prediction.score[0] && row.score[1] === match.prediction.score[1] ? " highlight" : ""}"><b>${row.score[0]} - ${row.score[1]}</b><span>@ ${row.odds.toFixed(2)}（${(row.prob * 100).toFixed(1)}%）</span></div>`).join("")}
      </div>
    </div>`;
}

function slideResults(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction;
  return `
    <div class="slide-inner">
      ${slideHeader(6, "Previous Results", "过往成绩与大赛底色", "这里用洲际强度、球队身价和模型评分形成大赛画像；未来可接入 FIFA/Elo/近十场战绩实现自动回看。")}
      <div class="grid-4">
        <div class="mini-card"><b>${esc(a.confed)}</b><span>${esc(a.zh)}所属足联</span></div>
        <div class="mini-card"><b>${esc(b.confed)}</b><span>${esc(b.zh)}所属足联</span></div>
        <div class="mini-card"><b>${a.rating - b.rating > 0 ? a.zh : b.zh}</b><span>纸面优势方</span></div>
        <div class="mini-card"><b>${p.confidence}%</b><span>结果稳定度</span></div>
      </div>
      <div class="scenario"><span class="tag">情景 A</span><p>${esc(a.zh)}率先把战法打出来，比赛进入主预测路径。</p><b>${p.score[0]}-${p.score[1]}</b></div>
      <div class="scenario"><span class="tag">情景 B</span><p>${esc(b.zh)}把节奏拖慢，比赛转为身体对抗和定位球拉锯。</p><b>${Math.max(0, p.score[0] - 1)}-${p.score[1]}</b></div>
      <div class="scenario"><span class="tag">情景 C</span><p>早牌、伤停或门将失误制造高波动，比分尾部扩大。</p><b>${p.score[0] + 1}-${p.score[1] + 1}</b></div>
    </div>`;
}

function slideExternal(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const country = venueCountry(match.ground);
  return `
    <div class="slide-inner">
      ${slideHeader(7, "External Factors", "外部因子", "世界杯单场预测不能只看纸面实力。球场、旅行距离、天气、草皮、首战压力和裁判尺度都会改变节奏。")}
      <div class="analysis-layout">
        <div class="grid-2">
          <div class="mini-card"><b>${esc(match.ground)}</b><span>比赛城市/球场区域</span></div>
          <div class="mini-card"><b>${esc(country)}</b><span>举办国环境</span></div>
          <div class="mini-card"><b>${a.homeBoost || 0}</b><span>${esc(a.zh)}主场/东道主加成</span></div>
          <div class="mini-card"><b>${b.homeBoost || 0}</b><span>${esc(b.zh)}主场/东道主加成</span></div>
        </div>
        <div class="model-box">
          <div class="eyebrow">External Adjustment</div>
          ${modelRow("主场球迷", Math.max(a.homeBoost, b.homeBoost) * 10 || 38, 100)}
          ${modelRow("旅行负担", 56, 100)}
          ${modelRow("天气节奏", 62, 100)}
          ${modelRow("心理压力", match.group ? 48 : 68, 100)}
        </div>
      </div>
    </div>`;
}

function slideModel(match) {
  const a = team(match.team1);
  const b = team(match.team2);
  const p = match.prediction;
  return `
    <div class="slide-inner">
      ${slideHeader(8, "Final Model", "模型权重与复盘", "最终预测由 7 类因子加权。若赛前首发确认出现核心伤停，最需要重算明星身价、战法和赔率三项。")}
      <div class="analysis-layout">
        <div class="model-box">
          ${WEIGHTS.map(([name, value]) => modelRow(name, value, 100, `${value}%`)).join("")}
        </div>
        <div>
          <div class="grid-3">
            <div class="mini-card"><b>${p.score[0]}-${p.score[1]}</b><span>主预测比分</span></div>
            <div class="mini-card"><b>${Math.max(0, p.score[0] - 1)}-${p.score[1]}</b><span>第一备选比分</span></div>
            <div class="mini-card"><b>${p.score[0] + 1}-${p.score[1] + 1}</b><span>高波动尾部比分</span></div>
          </div>
          <div class="source-card" style="margin-top:14px;">
            <b>数据源与口径</b>
            <span>赛程来自 openfootball/worldcup.json；国家队总身价、球员身价和头像来自 Transfermarkt 搜索页抓取；比分由本地模型根据球队评分、身价、战法、主客场和场外变量生成。</span>
          </div>
          <div class="source-links" style="margin-top:14px;">
            ${DATA.sources.map((source) => `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.name)}</a>`).join("")}
          </div>
          <p class="note">当前页面链接：#match=${esc(match.id)}&page=${state.page + 1}。复制这个地址即可直接打开对应比赛预测页。</p>
        </div>
      </div>
    </div>`;
}

function modelRow(label, value, max = 100, display = null) {
  const pct = Math.max(0, Math.min(100, Math.round(value / max * 100)));
  return `
    <div class="model-row">
      <span>${esc(label)}</span>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <strong>${esc(display || Math.round(value))}</strong>
    </div>`;
}

app.addEventListener("click", (event) => {
  const generate = event.target.closest("[data-generate]");
  if (generate) {
    renderDeck(generate.dataset.generate, 0);
    return;
  }

  if (event.target.closest("[data-back]")) {
    state.matchId = "";
    location.hash = "dashboard";
    renderDashboard();
    return;
  }

  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    goPage(Number(pageButton.dataset.page));
    return;
  }

  const stepButton = event.target.closest("[data-step]");
  if (stepButton) {
    changePage(Number(stepButton.dataset.step));
  }
});

window.addEventListener("keydown", (event) => {
  if (!state.matchId) return;
  if (event.key === "ArrowLeft") changePage(-1);
  if (event.key === "ArrowRight" || event.key === " ") changePage(1);
  if (/^[1-8]$/.test(event.key)) goPage(Number(event.key) - 1);
});

window.addEventListener("hashchange", () => route(false));

function route(pushHash = false) {
  const hash = location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const matchId = params.get("match");
  const page = Number(params.get("page") || 1) - 1;
  if (matchId && DATA.matches.some((match) => match.id === matchId)) {
    renderDeck(matchId, page, pushHash);
  } else {
    state.matchId = "";
    renderDashboard();
  }
}

route(false);
