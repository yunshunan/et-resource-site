#!/bin/bash

# 自动部署脚本 - 用于自动检测更改并提交到GitHub
# 同时支持重要版本标记和自动备份分支

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ET资源站 - 自动部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 确保在正确的目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "无法进入脚本目录"; exit 1; }

# 首先拉取最新代码，避免冲突
echo -e "${BLUE}拉取最新代码...${NC}"
git pull origin main || { echo -e "${RED}拉取代码失败${NC}"; exit 1; }

# 检查是否有未提交的更改
if [[ -z $(git status -s) ]]; then
  echo -e "${GREEN}没有检测到文件更改，不需要部署。${NC}"
  exit 0
fi

# 显示更改的文件
echo -e "${YELLOW}检测到以下文件更改:${NC}"
git status -s

# 当天日期，用于提交信息
TODAY=$(date +"%Y-%m-%d")
TIME=$(date +"%H:%M:%S")

# 检查是否是周一，用于创建每周备份分支
DAYOFWEEK=$(date +"%u")
if [ "$DAYOFWEEK" = "1" ]; then
  # 周一创建备份分支
  BACKUP_BRANCH="auto-backup-$(date +"%Y%m%d")"
  echo -e "${YELLOW}创建每周备份分支: $BACKUP_BRANCH${NC}"
  git checkout -b "$BACKUP_BRANCH" || { echo -e "${RED}创建备份分支失败${NC}"; }
  git push origin "$BACKUP_BRANCH" || { echo -e "${RED}推送备份分支失败${NC}"; }
  # 切回主分支
  git checkout main || { echo -e "${RED}切回主分支失败${NC}"; exit 1; }
fi

# 添加所有更改
echo -e "${BLUE}添加所有更改到暂存区...${NC}"
git add .

# 提交更改
COMMIT_MSG="[自动更新] $TODAY $TIME - 定时提交"
echo -e "${BLUE}提交更改: $COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG"

# 推送到远程仓库
echo -e "${BLUE}推送到GitHub...${NC}"
git push origin main

# 显示提交结果
if [ $? -eq 0 ]; then
  echo -e "${GREEN}成功推送更改到GitHub!${NC}"
  echo -e "${GREEN}提交信息: $COMMIT_MSG${NC}"
else
  echo -e "${RED}推送失败，请手动解决冲突。${NC}"
  exit 1
fi

echo -e "${YELLOW}============= 版本管理提示 =============${NC}"
echo -e "${YELLOW}如需标记重要版本，请使用以下命令:${NC}"
echo -e "${GREEN}git tag -a v版本号 -m \"版本说明\"${NC}"
echo -e "${GREEN}git push origin v版本号${NC}"
echo -e "${YELLOW}=======================================${NC}" 