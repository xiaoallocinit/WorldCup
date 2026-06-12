// 实际比赛结果记录文件
// 比赛结束后，把 result 从 null 改成 [主队进球, 客队进球]，保存即可。
// 首页会标记"已结束"并显示真实比分；同时会统计已出现比分的频率分布，供后续比分概率分析参考。
window.MATCH_RESULTS = {
  // ===== 小组赛第 1 =====
  "M001": { team1: "墨西哥", team2: "南非", date: "2026-06-11", result: [2, 0] },
  "M002": { team1: "韩国", team2: "捷克", date: "2026-06-11", result: [2, 1] },
  // ===== 小组赛第 2 =====
  "M003": { team1: "加拿大", team2: "波黑", date: "2026-06-12", result: null },
  "M004": { team1: "美国", team2: "巴拉圭", date: "2026-06-12", result: null },
  // ===== 小组赛第 3 =====
  "M005": { team1: "卡塔尔", team2: "瑞士", date: "2026-06-13", result: null },
  "M006": { team1: "巴西", team2: "摩洛哥", date: "2026-06-13", result: null },
  "M007": { team1: "海地", team2: "苏格兰", date: "2026-06-13", result: null },
  "M008": { team1: "澳大利亚", team2: "土耳其", date: "2026-06-13", result: null },
  // ===== 小组赛第 4 =====
  "M009": { team1: "德国", team2: "库拉索", date: "2026-06-14", result: null },
  "M010": { team1: "荷兰", team2: "日本", date: "2026-06-14", result: null },
  "M011": { team1: "科特迪瓦", team2: "厄瓜多尔", date: "2026-06-14", result: null },
  "M012": { team1: "瑞典", team2: "突尼斯", date: "2026-06-14", result: null },
  // ===== 小组赛第 5 =====
  "M013": { team1: "西班牙", team2: "佛得角", date: "2026-06-15", result: null },
  "M014": { team1: "比利时", team2: "埃及", date: "2026-06-15", result: null },
  "M015": { team1: "沙特阿拉伯", team2: "乌拉圭", date: "2026-06-15", result: null },
  "M016": { team1: "伊朗", team2: "新西兰", date: "2026-06-15", result: null },
  // ===== 小组赛第 6 =====
  "M017": { team1: "法国", team2: "塞内加尔", date: "2026-06-16", result: null },
  "M018": { team1: "伊拉克", team2: "挪威", date: "2026-06-16", result: null },
  "M019": { team1: "阿根廷", team2: "阿尔及利亚", date: "2026-06-16", result: null },
  "M020": { team1: "奥地利", team2: "约旦", date: "2026-06-16", result: null },
  // ===== 小组赛第 7 =====
  "M021": { team1: "葡萄牙", team2: "民主刚果", date: "2026-06-17", result: null },
  "M022": { team1: "英格兰", team2: "克罗地亚", date: "2026-06-17", result: null },
  "M023": { team1: "加纳", team2: "巴拿马", date: "2026-06-17", result: null },
  "M024": { team1: "乌兹别克斯坦", team2: "哥伦比亚", date: "2026-06-17", result: null },
  // ===== 小组赛第 8 =====
  "M025": { team1: "捷克", team2: "南非", date: "2026-06-18", result: null },
  "M026": { team1: "瑞士", team2: "波黑", date: "2026-06-18", result: null },
  "M027": { team1: "加拿大", team2: "卡塔尔", date: "2026-06-18", result: null },
  "M028": { team1: "墨西哥", team2: "韩国", date: "2026-06-18", result: null },
  // ===== 小组赛第 9 =====
  "M029": { team1: "美国", team2: "澳大利亚", date: "2026-06-19", result: null },
  "M030": { team1: "苏格兰", team2: "摩洛哥", date: "2026-06-19", result: null },
  "M031": { team1: "巴西", team2: "海地", date: "2026-06-19", result: null },
  "M032": { team1: "土耳其", team2: "巴拉圭", date: "2026-06-19", result: null },
  // ===== 小组赛第 10 =====
  "M033": { team1: "荷兰", team2: "瑞典", date: "2026-06-20", result: null },
  "M034": { team1: "德国", team2: "科特迪瓦", date: "2026-06-20", result: null },
  "M035": { team1: "厄瓜多尔", team2: "库拉索", date: "2026-06-20", result: null },
  "M036": { team1: "突尼斯", team2: "日本", date: "2026-06-20", result: null },
  // ===== 小组赛第 11 =====
  "M037": { team1: "西班牙", team2: "沙特阿拉伯", date: "2026-06-21", result: null },
  "M038": { team1: "比利时", team2: "伊朗", date: "2026-06-21", result: null },
  "M039": { team1: "乌拉圭", team2: "佛得角", date: "2026-06-21", result: null },
  "M040": { team1: "新西兰", team2: "埃及", date: "2026-06-21", result: null },
  // ===== 小组赛第 12 =====
  "M041": { team1: "阿根廷", team2: "奥地利", date: "2026-06-22", result: null },
  "M042": { team1: "法国", team2: "伊拉克", date: "2026-06-22", result: null },
  "M043": { team1: "挪威", team2: "塞内加尔", date: "2026-06-22", result: null },
  "M044": { team1: "约旦", team2: "阿尔及利亚", date: "2026-06-22", result: null },
  // ===== 小组赛第 13 =====
  "M045": { team1: "葡萄牙", team2: "乌兹别克斯坦", date: "2026-06-23", result: null },
  "M046": { team1: "英格兰", team2: "加纳", date: "2026-06-23", result: null },
  "M047": { team1: "巴拿马", team2: "克罗地亚", date: "2026-06-23", result: null },
  "M048": { team1: "哥伦比亚", team2: "民主刚果", date: "2026-06-23", result: null },
  // ===== 小组赛第 14 =====
  "M049": { team1: "瑞士", team2: "加拿大", date: "2026-06-24", result: null },
  "M050": { team1: "波黑", team2: "卡塔尔", date: "2026-06-24", result: null },
  "M051": { team1: "苏格兰", team2: "巴西", date: "2026-06-24", result: null },
  "M052": { team1: "摩洛哥", team2: "海地", date: "2026-06-24", result: null },
  "M053": { team1: "捷克", team2: "墨西哥", date: "2026-06-24", result: null },
  "M054": { team1: "南非", team2: "韩国", date: "2026-06-24", result: null },
  // ===== 小组赛第 15 =====
  "M055": { team1: "库拉索", team2: "科特迪瓦", date: "2026-06-25", result: null },
  "M056": { team1: "厄瓜多尔", team2: "德国", date: "2026-06-25", result: null },
  "M057": { team1: "日本", team2: "瑞典", date: "2026-06-25", result: null },
  "M058": { team1: "突尼斯", team2: "荷兰", date: "2026-06-25", result: null },
  "M059": { team1: "土耳其", team2: "美国", date: "2026-06-25", result: null },
  "M060": { team1: "巴拉圭", team2: "澳大利亚", date: "2026-06-25", result: null },
  // ===== 小组赛第 16 =====
  "M061": { team1: "挪威", team2: "法国", date: "2026-06-26", result: null },
  "M062": { team1: "塞内加尔", team2: "伊拉克", date: "2026-06-26", result: null },
  "M063": { team1: "佛得角", team2: "沙特阿拉伯", date: "2026-06-26", result: null },
  "M064": { team1: "乌拉圭", team2: "西班牙", date: "2026-06-26", result: null },
  "M065": { team1: "埃及", team2: "伊朗", date: "2026-06-26", result: null },
  "M066": { team1: "新西兰", team2: "比利时", date: "2026-06-26", result: null },
  // ===== 小组赛第 17 =====
  "M067": { team1: "巴拿马", team2: "英格兰", date: "2026-06-27", result: null },
  "M068": { team1: "克罗地亚", team2: "加纳", date: "2026-06-27", result: null },
  "M069": { team1: "哥伦比亚", team2: "葡萄牙", date: "2026-06-27", result: null },
  "M070": { team1: "民主刚果", team2: "乌兹别克斯坦", date: "2026-06-27", result: null },
  "M071": { team1: "阿尔及利亚", team2: "奥地利", date: "2026-06-27", result: null },
  "M072": { team1: "约旦", team2: "阿根廷", date: "2026-06-27", result: null },
  // ===== 32 强淘汰赛 =====
  "M073": { team1: "2A", team2: "2B", date: "2026-06-28", result: null },
  "M074": { team1: "1C", team2: "2F", date: "2026-06-29", result: null },
  "M075": { team1: "1E", team2: "3A/B/C/D/F", date: "2026-06-29", result: null },
  "M076": { team1: "1F", team2: "2C", date: "2026-06-29", result: null },
  "M077": { team1: "2E", team2: "2I", date: "2026-06-30", result: null },
  "M078": { team1: "1I", team2: "3C/D/F/G/H", date: "2026-06-30", result: null },
  "M079": { team1: "1A", team2: "3C/E/F/H/I", date: "2026-06-30", result: null },
  "M080": { team1: "1L", team2: "3E/H/I/J/K", date: "2026-07-01", result: null },
  "M081": { team1: "1G", team2: "3A/E/H/I/J", date: "2026-07-01", result: null },
  "M082": { team1: "1D", team2: "3B/E/F/I/J", date: "2026-07-01", result: null },
  "M083": { team1: "1H", team2: "2J", date: "2026-07-02", result: null },
  "M084": { team1: "2K", team2: "2L", date: "2026-07-02", result: null },
  "M085": { team1: "1B", team2: "3E/F/G/I/J", date: "2026-07-02", result: null },
  "M086": { team1: "2D", team2: "2G", date: "2026-07-03", result: null },
  "M087": { team1: "1J", team2: "2H", date: "2026-07-03", result: null },
  "M088": { team1: "1K", team2: "3D/E/I/J/L", date: "2026-07-03", result: null },
  // ===== 16 强淘汰赛 =====
  "M089": { team1: "W73", team2: "W75", date: "2026-07-04", result: null },
  "M090": { team1: "W74", team2: "W77", date: "2026-07-04", result: null },
  "M091": { team1: "W76", team2: "W78", date: "2026-07-05", result: null },
  "M092": { team1: "W79", team2: "W80", date: "2026-07-05", result: null },
  "M093": { team1: "W83", team2: "W84", date: "2026-07-06", result: null },
  "M094": { team1: "W81", team2: "W82", date: "2026-07-06", result: null },
  "M095": { team1: "W86", team2: "W88", date: "2026-07-07", result: null },
  "M096": { team1: "W85", team2: "W87", date: "2026-07-07", result: null },
  // ===== 1/4 决赛 =====
  "M097": { team1: "W89", team2: "W90", date: "2026-07-09", result: null },
  "M098": { team1: "W93", team2: "W94", date: "2026-07-10", result: null },
  "M099": { team1: "W91", team2: "W92", date: "2026-07-11", result: null },
  "M100": { team1: "W95", team2: "W96", date: "2026-07-11", result: null },
  // ===== 半决赛 =====
  "M101": { team1: "W97", team2: "W98", date: "2026-07-14", result: null },
  "M102": { team1: "W99", team2: "W100", date: "2026-07-15", result: null },
  // ===== 三四名决赛 =====
  "M103": { team1: "L101", team2: "L102", date: "2026-07-18", result: null },
  // ===== 决赛 =====
  "M104": { team1: "W101", team2: "W102", date: "2026-07-19", result: null },
};
