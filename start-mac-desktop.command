#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$ROOT_DIR/src-tauri/target/release/bundle/macos/世界杯预测看板.app"

cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm，请先安装 Node.js。"
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "首次启动：正在安装依赖..."
  npm install
fi

if [ ! -d "$APP_PATH" ]; then
  echo "未找到 Mac 桌面端构建产物，正在打包..."
  npm run desktop:build
fi

echo "正在启动 世界杯预测看板..."
open "$APP_PATH"
