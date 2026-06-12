# WorldCup

世界杯比分 AI 预测分析看板。

## 简介

本项目基于公开赛程数据与球队/球员市场价值，构建简单的预测模型，为 2026 世界杯 104 场比赛生成比分、胜负概率、预期进球（xG）等预测信息，并以静态网页看板形式展示。

## 在线预览

直接打开 `世界杯预测/index.html` 即可在浏览器中查看看板（纯静态页面，无需服务器）。

## 目录结构

```
世界杯预测/
├── index.html              # 看板页面入口
├── assets/
│   ├── app.js               # 前端渲染与交互逻辑
│   ├── styles.css            # 页面样式
│   ├── players/              # 球星头像图片
│   └── data/
│       ├── app-data.js       # 构建生成的预测数据（前端加载）
│       ├── app-data.json     # 同上，JSON 格式
│       ├── worldcup-2026-source.json  # 原始赛程数据
│       ├── score-overrides.js # 手动比分覆盖
│       └── results.js        # 已结束比赛真实比分
└── scripts/
    └── build-data.js         # 数据构建脚本
```

## 数据构建

数据通过 `scripts/build-data.js` 脚本生成，主要流程：

1. 从 [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) 拉取 2026 世界杯赛程；
2. 从 Transfermarkt 抓取各国家队总身价及核心球员身价、头像；
3. 结合球队评分（攻防数据、风格、主场加成等）与市场价值，计算每场比赛的预测比分、胜平负概率、xG、进球数分布、置信度等；
4. 输出 `app-data.json` / `app-data.js` 供前端页面读取。

运行方式：

```bash
cd 世界杯预测
node scripts/build-data.js
```

> 脚本需要联网访问 GitHub 与 Transfermarkt，运行耗时取决于球员数量。

## 预测模型说明

预测基于以下加权因子：

| 因子 | 权重 |
| --- | --- |
| 球员身价 | 18% |
| 近期状态 | 17% |
| 攻守战法 | 20% |
| 赔率市场 | 15% |
| 过往成绩 | 10% |
| 外部因子 | 12% |
| 主客场 | 8% |

对于淘汰赛阶段尚未确定的对阵（占位队伍），预测结果会标注"晋级路径占位预测"。

## 手动数据维护

- `assets/data/score-overrides.js`：可手动覆盖某场比赛的预测比分。
- `assets/data/results.js`：记录已结束比赛的真实比分，用于看板展示与比分分布统计。

## License

详见 [LICENSE](LICENSE)。
