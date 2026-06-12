#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "assets", "data");
const PLAYER_DIR = path.join(ROOT, "assets", "players");
const SCHEDULE_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const TM_NATIONS_URL = "https://www.transfermarkt.com/vereins-statistik/wertvollstenationalmannschaften/marktwertetop";
const TM_SEARCH_URL = "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=";

const zh = {
  "Algeria": "阿尔及利亚",
  "Argentina": "阿根廷",
  "Australia": "澳大利亚",
  "Austria": "奥地利",
  "Belgium": "比利时",
  "Bosnia & Herzegovina": "波黑",
  "Brazil": "巴西",
  "Canada": "加拿大",
  "Cape Verde": "佛得角",
  "Colombia": "哥伦比亚",
  "Croatia": "克罗地亚",
  "Curaçao": "库拉索",
  "Czech Republic": "捷克",
  "DR Congo": "民主刚果",
  "Ecuador": "厄瓜多尔",
  "Egypt": "埃及",
  "England": "英格兰",
  "France": "法国",
  "Germany": "德国",
  "Ghana": "加纳",
  "Haiti": "海地",
  "Iran": "伊朗",
  "Iraq": "伊拉克",
  "Ivory Coast": "科特迪瓦",
  "Japan": "日本",
  "Jordan": "约旦",
  "Mexico": "墨西哥",
  "Morocco": "摩洛哥",
  "Netherlands": "荷兰",
  "New Zealand": "新西兰",
  "Norway": "挪威",
  "Panama": "巴拿马",
  "Paraguay": "巴拉圭",
  "Portugal": "葡萄牙",
  "Qatar": "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  "Scotland": "苏格兰",
  "Senegal": "塞内加尔",
  "South Africa": "南非",
  "South Korea": "韩国",
  "Spain": "西班牙",
  "Sweden": "瑞典",
  "Switzerland": "瑞士",
  "Tunisia": "突尼斯",
  "Turkey": "土耳其",
  "USA": "美国",
  "Uruguay": "乌拉圭",
  "Uzbekistan": "乌兹别克斯坦"
};

const teamSeed = {
  "Algeria": { code: "ALG", rating: 71, attack: 70, defense: 68, confed: "CAF", style: "边路速度 + 二点球冲击", homeBoost: 0 },
  "Argentina": { code: "ARG", rating: 91, attack: 91, defense: 86, confed: "CONMEBOL", style: "控球压迫 + 前场自由换位", homeBoost: 0 },
  "Australia": { code: "AUS", rating: 68, attack: 64, defense: 70, confed: "AFC", style: "高空球 + 身体对抗", homeBoost: 0 },
  "Austria": { code: "AUT", rating: 79, attack: 78, defense: 78, confed: "UEFA", style: "高压逼抢 + 中路推进", homeBoost: 0 },
  "Belgium": { code: "BEL", rating: 83, attack: 84, defense: 79, confed: "UEFA", style: "肋部渗透 + 边锋单点", homeBoost: 0 },
  "Bosnia & Herzegovina": { code: "BIH", rating: 69, attack: 69, defense: 66, confed: "UEFA", style: "中锋支点 + 定位球", homeBoost: 0 },
  "Brazil": { code: "BRA", rating: 90, attack: 91, defense: 86, confed: "CONMEBOL", style: "边路爆点 + 前场压迫", homeBoost: 0 },
  "Canada": { code: "CAN", rating: 76, attack: 76, defense: 72, confed: "CONCACAF", style: "边路速度 + 高位反抢", homeBoost: 7 },
  "Cape Verde": { code: "CPV", rating: 63, attack: 62, defense: 64, confed: "CAF", style: "紧凑防线 + 快速反击", homeBoost: 0 },
  "Colombia": { code: "COL", rating: 82, attack: 83, defense: 79, confed: "CONMEBOL", style: "左路突破 + 反击终结", homeBoost: 0 },
  "Croatia": { code: "CRO", rating: 82, attack: 80, defense: 81, confed: "UEFA", style: "中场节奏 + 控球消耗", homeBoost: 0 },
  "Curaçao": { code: "CUW", rating: 58, attack: 56, defense: 58, confed: "CONCACAF", style: "低位密集 + 边路转换", homeBoost: 0 },
  "Czech Republic": { code: "CZE", rating: 73, attack: 72, defense: 73, confed: "UEFA", style: "直接传中 + 禁区对抗", homeBoost: 0 },
  "DR Congo": { code: "COD", rating: 72, attack: 73, defense: 69, confed: "CAF", style: "速度转换 + 身体压制", homeBoost: 0 },
  "Ecuador": { code: "ECU", rating: 78, attack: 75, defense: 80, confed: "CONMEBOL", style: "中场拦截 + 边后卫推进", homeBoost: 0 },
  "Egypt": { code: "EGY", rating: 77, attack: 78, defense: 74, confed: "CAF", style: "右路终结 + 中低位保护", homeBoost: 0 },
  "England": { code: "ENG", rating: 92, attack: 92, defense: 87, confed: "UEFA", style: "前场群星 + 位置轮转", homeBoost: 0 },
  "France": { code: "FRA", rating: 93, attack: 94, defense: 88, confed: "UEFA", style: "纵深冲刺 + 反击压迫", homeBoost: 0 },
  "Germany": { code: "GER", rating: 88, attack: 88, defense: 83, confed: "UEFA", style: "控球推进 + 前腰连接", homeBoost: 0 },
  "Ghana": { code: "GHA", rating: 71, attack: 70, defense: 69, confed: "CAF", style: "身体对抗 + 快速推进", homeBoost: 0 },
  "Haiti": { code: "HAI", rating: 56, attack: 55, defense: 55, confed: "CONCACAF", style: "收缩反击 + 单点冲刺", homeBoost: 0 },
  "Iran": { code: "IRN", rating: 72, attack: 72, defense: 71, confed: "AFC", style: "防守组织 + 中锋终结", homeBoost: 0 },
  "Iraq": { code: "IRQ", rating: 64, attack: 63, defense: 64, confed: "AFC", style: "低位防守 + 转换推进", homeBoost: 0 },
  "Ivory Coast": { code: "CIV", rating: 76, attack: 76, defense: 74, confed: "CAF", style: "边锋冲击 + 中场硬度", homeBoost: 0 },
  "Japan": { code: "JPN", rating: 81, attack: 80, defense: 80, confed: "AFC", style: "小范围配合 + 前场逼抢", homeBoost: 0 },
  "Jordan": { code: "JOR", rating: 61, attack: 61, defense: 60, confed: "AFC", style: "快攻边路 + 定位球", homeBoost: 0 },
  "Mexico": { code: "MEX", rating: 77, attack: 76, defense: 75, confed: "CONCACAF", style: "主场气势 + 边中结合", homeBoost: 8 },
  "Morocco": { code: "MAR", rating: 82, attack: 80, defense: 84, confed: "CAF", style: "防守韧性 + 边路推进", homeBoost: 0 },
  "Netherlands": { code: "NED", rating: 88, attack: 87, defense: 86, confed: "UEFA", style: "三线压迫 + 肋部穿插", homeBoost: 0 },
  "New Zealand": { code: "NZL", rating: 60, attack: 59, defense: 61, confed: "OFC", style: "长传支点 + 防线紧凑", homeBoost: 0 },
  "Norway": { code: "NOR", rating: 84, attack: 86, defense: 77, confed: "UEFA", style: "中锋终结 + 直塞纵深", homeBoost: 0 },
  "Panama": { code: "PAN", rating: 63, attack: 62, defense: 63, confed: "CONCACAF", style: "身体对抗 + 快速反击", homeBoost: 0 },
  "Paraguay": { code: "PAR", rating: 72, attack: 70, defense: 73, confed: "CONMEBOL", style: "防守韧性 + 远射反击", homeBoost: 0 },
  "Portugal": { code: "POR", rating: 90, attack: 91, defense: 85, confed: "UEFA", style: "边路内切 + 前场多点", homeBoost: 0 },
  "Qatar": { code: "QAT", rating: 63, attack: 63, defense: 61, confed: "AFC", style: "中路组织 + 快速套边", homeBoost: 0 },
  "Saudi Arabia": { code: "KSA", rating: 66, attack: 65, defense: 65, confed: "AFC", style: "前场逼抢 + 边路突破", homeBoost: 0 },
  "Scotland": { code: "SCO", rating: 74, attack: 72, defense: 75, confed: "UEFA", style: "中场冲击 + 传中二点", homeBoost: 0 },
  "Senegal": { code: "SEN", rating: 80, attack: 79, defense: 81, confed: "CAF", style: "身体天赋 + 防守反击", homeBoost: 0 },
  "South Africa": { code: "RSA", rating: 65, attack: 64, defense: 66, confed: "CAF", style: "小快灵转换 + 门前抢点", homeBoost: 0 },
  "South Korea": { code: "KOR", rating: 79, attack: 80, defense: 76, confed: "AFC", style: "纵向冲刺 + 前场压迫", homeBoost: 0 },
  "Spain": { code: "ESP", rating: 91, attack: 90, defense: 87, confed: "UEFA", style: "控球压迫 + 边锋爆点", homeBoost: 0 },
  "Sweden": { code: "SWE", rating: 78, attack: 79, defense: 76, confed: "UEFA", style: "强力中锋 + 反击推进", homeBoost: 0 },
  "Switzerland": { code: "SUI", rating: 78, attack: 76, defense: 79, confed: "UEFA", style: "体系稳定 + 中路控制", homeBoost: 0 },
  "Tunisia": { code: "TUN", rating: 68, attack: 66, defense: 70, confed: "CAF", style: "防守纪律 + 定位球", homeBoost: 0 },
  "Turkey": { code: "TUR", rating: 80, attack: 81, defense: 76, confed: "UEFA", style: "前腰创造 + 边路冲刺", homeBoost: 0 },
  "USA": { code: "USA", rating: 80, attack: 79, defense: 77, confed: "CONCACAF", style: "体能压迫 + 边路速度", homeBoost: 8 },
  "Uruguay": { code: "URU", rating: 85, attack: 84, defense: 83, confed: "CONMEBOL", style: "高强度逼抢 + 中场覆盖", homeBoost: 0 },
  "Uzbekistan": { code: "UZB", rating: 66, attack: 65, defense: 66, confed: "AFC", style: "紧凑阵型 + 快速推进", homeBoost: 0 }
};

const stars = {
  "Algeria": ["Rayan Ait-Nouri", "Ismael Bennacer", "Amine Gouiri"],
  "Argentina": ["Lionel Messi", "Lautaro Martinez", "Julian Alvarez"],
  "Australia": ["Nestory Irankunda", "Jackson Irvine", "Mathew Ryan"],
  "Austria": ["David Alaba", "Konrad Laimer", "Christoph Baumgartner"],
  "Belgium": ["Jeremy Doku", "Kevin De Bruyne", "Charles De Ketelaere"],
  "Bosnia & Herzegovina": ["Amar Dedic", "Ermedin Demirovic", "Edin Dzeko"],
  "Brazil": ["Vinicius Junior", "Rodrygo", "Bruno Guimaraes"],
  "Canada": ["Alphonso Davies", "Jonathan David", "Tajon Buchanan"],
  "Cape Verde": ["Logan Costa", "Jovane Cabral", "Ryan Mendes"],
  "Colombia": ["Luis Diaz", "Jhon Duran", "James Rodriguez"],
  "Croatia": ["Josko Gvardiol", "Mateo Kovacic", "Luka Modric"],
  "Curaçao": ["Tahith Chong", "Juninho Bacuna", "Leandro Bacuna"],
  "Czech Republic": ["Patrik Schick", "Tomas Soucek", "Adam Hlozek"],
  "DR Congo": ["Yoane Wissa", "Chancel Mbemba", "Silas Katompa Mvumpa"],
  "Ecuador": ["Moises Caicedo", "Piero Hincapie", "Pervis Estupinan"],
  "Egypt": ["Mohamed Salah", "Omar Marmoush", "Mostafa Mohamed"],
  "England": ["Jude Bellingham", "Bukayo Saka", "Harry Kane"],
  "France": ["Kylian Mbappe", "William Saliba", "Ousmane Dembele"],
  "Germany": ["Jamal Musiala", "Florian Wirtz", "Kai Havertz"],
  "Ghana": ["Mohammed Kudus", "Thomas Partey", "Inaki Williams"],
  "Haiti": ["Fafa Picault", "Duckens Nazon", "Frantzdy Pierrot"],
  "Iran": ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"],
  "Iraq": ["Ali Al-Hamadi", "Zidane Iqbal", "Aymen Hussein"],
  "Ivory Coast": ["Simon Adingra", "Evan Ndicka", "Franck Kessie"],
  "Japan": ["Takefusa Kubo", "Kaoru Mitoma", "Wataru Endo"],
  "Jordan": ["Mousa Tamari", "Yazan Al-Naimat", "Nizar Al-Rashdan"],
  "Mexico": ["Santiago Gimenez", "Edson Alvarez", "Hirving Lozano"],
  "Morocco": ["Achraf Hakimi", "Brahim Diaz", "Noussair Mazraoui"],
  "Netherlands": ["Xavi Simons", "Cody Gakpo", "Frenkie de Jong"],
  "New Zealand": ["Chris Wood", "Liberato Cacace", "Marko Stamenic"],
  "Norway": ["Erling Haaland", "Martin Odegaard", "Antonio Nusa"],
  "Panama": ["Adalberto Carrasquilla", "Michael Amir Murillo", "Jose Fajardo"],
  "Paraguay": ["Julio Enciso", "Miguel Almiron", "Ramon Sosa"],
  "Portugal": ["Bruno Fernandes", "Rafael Leao", "Cristiano Ronaldo"],
  "Qatar": ["Akram Afif", "Almoez Ali", "Tarek Salman"],
  "Saudi Arabia": ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saud Abdulhamid"],
  "Scotland": ["Scott McTominay", "Andy Robertson", "Billy Gilmour"],
  "Senegal": ["Nicolas Jackson", "Pape Matar Sarr", "Sadio Mane"],
  "South Africa": ["Lyle Foster", "Teboho Mokoena", "Percy Tau"],
  "South Korea": ["Min-jae Kim", "Kang-in Lee", "Heung-min Son"],
  "Spain": ["Lamine Yamal", "Pedri", "Nico Williams"],
  "Sweden": ["Alexander Isak", "Dejan Kulusevski", "Viktor Gyokeres"],
  "Switzerland": ["Manuel Akanji", "Granit Xhaka", "Breel Embolo"],
  "Tunisia": ["Ellyes Skhiri", "Hannibal Mejbri", "Elias Saad"],
  "Turkey": ["Arda Guler", "Hakan Calhanoglu", "Kenan Yildiz"],
  "USA": ["Christian Pulisic", "Weston McKennie", "Folarin Balogun"],
  "Uruguay": ["Federico Valverde", "Darwin Nunez", "Ronald Araujo"],
  "Uzbekistan": ["Abdukodir Khusanov", "Eldor Shomurodov", "Abbosbek Fayzullaev"]
};

const teamAliases = {
  "Bosnia-Herzegovina": "Bosnia & Herzegovina",
  "Cote d'Ivoire": "Ivory Coast",
  "Côte d'Ivoire": "Ivory Coast",
  "United States": "USA",
  "United States of America": "USA",
  "South Korea": "South Korea",
  "Korea, South": "South Korea",
  "Congo DR": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Türkiye": "Turkey",
  "Curacao": "Curaçao"
};

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(PLAYER_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

async function getBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function clean(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(str) {
  return crypto.createHash("sha1").update(str).digest("hex").slice(0, 8);
}

function parseMoney(value) {
  const text = clean(value);
  const match = text.match(/€\s*([\d.]+)\s*(bn|m|k)?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = (match[2] || "m").toLowerCase();
  if (unit === "bn") return Math.round(amount * 1000);
  if (unit === "k") return Math.round(amount / 1000 * 100) / 100;
  return Math.round(amount * 100) / 100;
}

function moneyLabel(millions) {
  if (millions == null) return "暂无";
  if (millions >= 1000) return `€${(millions / 1000).toFixed(2)}bn`;
  if (millions >= 10) return `€${millions.toFixed(1)}m`;
  return `€${millions.toFixed(2)}m`;
}

function parseUtc(date, timeText) {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})\s+UTC([+-]\d+)/);
  if (!match) return `${date}T12:00:00Z`;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const offset = Number(match[3]);
  const utcHour = hour - offset;
  const dt = new Date(Date.UTC(...date.split("-").map((n, i) => i === 1 ? Number(n) - 1 : Number(n)), utcHour, minute));
  return dt.toISOString();
}

function cnRound(round = "") {
  if (round.startsWith("Matchday")) return round.replace("Matchday", "小组赛第");
  return ({
    "Round of 32": "32 强淘汰赛",
    "Round of 16": "16 强淘汰赛",
    "Quarter-final": "1/4 决赛",
    "Semi-final": "半决赛",
    "Match for third place": "三四名决赛",
    "Final": "决赛"
  })[round] || round;
}

function cnGroup(group = "") {
  return group.replace("Group ", "").replace(/^([A-Z])$/, "$1 组") || "淘汰赛";
}

function isPlaceholder(team) {
  return /^(W|L|[123][A-L]|[A-L][123])/.test(team || "");
}

function pseudoRating(team) {
  const n = [...String(team)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 68 + (n % 18);
}

function predictMatch(match, teams) {
  const a = teams[match.team1];
  const b = teams[match.team2];
  const ar = a ? a.rating + (a.homeBoost || 0) : pseudoRating(match.team1);
  const br = b ? b.rating + (b.homeBoost || 0) : pseudoRating(match.team2);
  const aa = a ? a.attack : ar;
  const ba = b ? b.attack : br;
  const ad = a ? a.defense : ar;
  const bd = b ? b.defense : br;
  const diff = ar - br;
  const baseTotal = 2.35 + Math.max(-0.25, Math.min(0.4, ((aa + ba) - (ad + bd)) / 80));
  const homeXg = Math.max(0.35, baseTotal / 2 + diff / 38 + (aa - bd) / 95);
  const awayXg = Math.max(0.3, baseTotal / 2 - diff / 38 + (ba - ad) / 95);
  let homeGoals = Math.max(0, Math.min(4, Math.round(homeXg)));
  let awayGoals = Math.max(0, Math.min(4, Math.round(awayXg)));
  if (Math.abs(diff) > 14 && homeGoals === awayGoals) diff > 0 ? homeGoals++ : awayGoals++;
  if (homeGoals + awayGoals === 0) homeGoals = 1;
  const win = Math.round(100 / (1 + Math.exp(-diff / 12)));
  const draw = Math.max(18, Math.min(34, 31 - Math.abs(diff) * 0.45));
  const p1 = Math.round(win * (100 - draw) / 100);
  const p2 = Math.round((100 - win) * (100 - draw) / 100);
  return {
    score: [homeGoals, awayGoals],
    xg: [Number(homeXg.toFixed(2)), Number(awayXg.toFixed(2))],
    probabilities: {
      home: p1,
      draw: Math.round(draw),
      away: Math.max(0, 100 - p1 - Math.round(draw))
    },
    totalGoals: Number((homeXg + awayXg).toFixed(2)),
    bothScore: Math.round(Math.min(72, Math.max(38, 42 + (homeXg + awayXg - 2) * 18 - Math.abs(diff) * 0.35))),
    confidence: Math.round(Math.min(86, Math.max(52, 62 + Math.abs(diff) * 0.8))),
    note: isPlaceholder(match.team1) || isPlaceholder(match.team2) ? "淘汰赛对阵暂未确定，当前为晋级路径占位预测。" : "基于赛前公开数据与模型权重生成。"
  };
}

function parseNationValues(html) {
  const values = {};
  const rowRe = /<tr class="(?:odd|even)">([\s\S]*?)<\/tr>\s*<\/table>\s*<\/td><td class="links">([^<]*)<\/td><td class="rechts"><b>([^<]+)<\/b><\/td><\/tr>/g;
  let match;
  while ((match = rowRe.exec(html))) {
    const row = match[1];
    const nameMatch = row.match(/<a title="([^"]+)" href="[^"]+\/startseite\/verein\/\d+">/);
    if (!nameMatch) continue;
    const rawName = clean(nameMatch[1]);
    const team = teamAliases[rawName] || rawName;
    values[team] = {
      confed: clean(match[2]),
      valueText: clean(match[3]),
      valueMillions: parseMoney(match[3])
    };
  }
  return values;
}

async function fetchNationValues() {
  const combined = {};
  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? TM_NATIONS_URL : `${TM_NATIONS_URL}?page=${page}`;
    const html = await getText(url);
    Object.assign(combined, parseNationValues(html));
    await sleep(250);
  }
  return combined;
}

function parsePlayer(html, requestedName) {
  const idx = html.indexOf('id="player-grid"');
  if (idx === -1) return null;
  const end = html.indexOf('<div class="keys"', idx);
  const chunk = html.slice(idx, end > idx ? end : idx + 25000);
  const img = chunk.match(/<img src="([^"]+)" title="([^"]+)" alt="([^"]+)" class="bilderrahmen-fixed"/);
  const link = chunk.match(/<a title="([^"]+)" href="([^"]+\/profil\/spieler\/\d+)">([^<]+)<\/a>/);
  const club = chunk.match(/<\/tr><tr><td><a title="([^"]+)" href="[^"]+\/startseite\/verein\/\d+">/);
  const detail = chunk.match(/<\/table><\/td><td class="zentriert">([^<]+)<\/td><td class="zentriert">([\s\S]*?)<\/td><td class="zentriert">([^<]+)<\/td><td class="zentriert">([\s\S]*?)<\/td><td class="rechts hauptlink">/);
  const position = detail ? detail[1] : "";
  const age = detail ? detail[3] : "";
  const nationHtml = detail ? detail[4] : "";
  const value = chunk.match(/<td class="rechts hauptlink">(?:<a[^>]*>)?([^<]*€[^<]+)(?:<\/a>)?<\/td>/);
  const nationMatches = [...nationHtml.matchAll(/(?:title|alt)="([^"]+)"/g)].map((m) => clean(m[1]));
  if (!link) return null;
  const fullName = clean(link[3]);
  return {
    requestedName,
    name: fullName,
    position: position ? clean(position) : "球员",
    age: age ? Number(clean(age)) : null,
    club: club ? clean(club[1]) : "俱乐部待更新",
    nationalities: [...new Set(nationMatches)].slice(0, 2),
    marketValueText: value ? clean(value[1]) : "暂无",
    marketValueMillions: value ? parseMoney(value[1]) : null,
    transfermarktUrl: `https://www.transfermarkt.com${clean(link[2])}`,
    imageRemote: img ? clean(img[1]) : "",
    image: ""
  };
}

async function fetchPlayer(name) {
  try {
    const html = await getText(`${TM_SEARCH_URL}${encodeURIComponent(name)}`);
    return parsePlayer(html, name) || { requestedName: name, name, position: "球员", age: null, club: "搜索结果待更新", nationalities: [], marketValueMillions: null, marketValueText: "暂无", image: "" };
  } catch (error) {
    return { requestedName: name, name, error: error.message, marketValueMillions: null, marketValueText: "暂无", image: "" };
  }
}

async function downloadPlayerImage(player) {
  if (!player || !player.imageRemote) return player;
  const url = player.imageRemote.replace("/small/", "/medium/");
  const extFromUrl = (new URL(url)).pathname.match(/\.(png|jpe?g|webp)$/i);
  const ext = extFromUrl ? extFromUrl[1].replace("jpeg", "jpg").toLowerCase() : "jpg";
  const filename = `${slugify(player.name || player.requestedName)}-${hash(url)}.${ext}`;
  const out = path.join(PLAYER_DIR, filename);
  if (!fs.existsSync(out) || fs.statSync(out).size < 200) {
    try {
      const buffer = await getBuffer(url);
      fs.writeFileSync(out, buffer);
      await sleep(80);
    } catch {
      return player;
    }
  }
  player.image = `assets/players/${filename}`;
  return player;
}

async function mapLimit(items, limit, iterator) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await iterator(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  ensureDirs();
  console.log("Fetching World Cup schedule...");
  const schedule = JSON.parse(await getText(SCHEDULE_URL));
  fs.writeFileSync(path.join(DATA_DIR, "worldcup-2026-source.json"), JSON.stringify(schedule, null, 2));

  console.log("Fetching national team market values...");
  const nationValues = await fetchNationValues();

  const teamNames = [...new Set(schedule.matches.flatMap((m) => [m.team1, m.team2]).filter((t) => !isPlaceholder(t)))].sort();
  const playerNames = [...new Set(teamNames.flatMap((team) => stars[team] || []))];

  console.log(`Fetching ${playerNames.length} player cards from Transfermarkt...`);
  const players = await mapLimit(playerNames, 5, async (name, index) => {
    const player = await fetchPlayer(name);
    if ((index + 1) % 15 === 0) console.log(`  ${index + 1}/${playerNames.length}`);
    await sleep(180);
    return downloadPlayerImage(player);
  });
  const playerByRequested = Object.fromEntries(players.filter(Boolean).map((p) => [p.requestedName, p]));

  const teams = {};
  for (const name of teamNames) {
    const seed = teamSeed[name] || { code: name.slice(0, 3).toUpperCase(), rating: 66, attack: 66, defense: 66, confed: "TBD", style: "平衡阵型", homeBoost: 0 };
    const nationalValue = nationValues[name] || {};
    const teamStars = (stars[name] || []).map((starName) => playerByRequested[starName]).filter(Boolean);
    const fetchedStarsValue = teamStars.reduce((sum, p) => sum + (p.marketValueMillions || 0), 0);
    const valueMillions = nationalValue.valueMillions || Math.max(18, Math.round(fetchedStarsValue * 2.4));
    teams[name] = {
      name,
      zh: zh[name] || name,
      ...seed,
      valueMillions,
      valueText: nationalValue.valueText || moneyLabel(valueMillions),
      stars: teamStars
    };
  }

  const sorted = schedule.matches
    .map((match, index) => ({
      id: `M${String(index + 1).padStart(3, "0")}`,
      sourceIndex: index + 1,
      round: match.round,
      roundZh: cnRound(match.round),
      group: match.group || "",
      groupZh: cnGroup(match.group || ""),
      date: match.date,
      time: match.time || "",
      kickoffUtc: parseUtc(match.date, match.time),
      ground: match.ground || "",
      team1: match.team1,
      team2: match.team2
    }))
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc) || a.sourceIndex - b.sourceIndex)
    .map((match, index) => ({ ...match, id: `M${String(index + 1).padStart(3, "0")}` }));

  const matches = sorted.map((match) => ({ ...match, prediction: predictMatch(match, teams) }));
  const appData = {
    generatedAt: new Date().toISOString(),
    name: schedule.name,
    sources: [
      { name: "openfootball/worldcup.json", url: SCHEDULE_URL, note: "104 场赛程静态源" },
      { name: "Transfermarkt national teams", url: TM_NATIONS_URL, note: "国家队总身价" },
      { name: "Transfermarkt player search", url: "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche", note: "明星球员身价与头像" }
    ],
    teams,
    matches
  };

  fs.writeFileSync(path.join(DATA_DIR, "app-data.json"), JSON.stringify(appData, null, 2));
  fs.writeFileSync(
    path.join(DATA_DIR, "app-data.js"),
    `window.WORLD_CUP_DATA = ${JSON.stringify(appData)};\n`
  );
  console.log(`Done. ${matches.length} matches, ${Object.keys(teams).length} teams, ${players.length} players.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
