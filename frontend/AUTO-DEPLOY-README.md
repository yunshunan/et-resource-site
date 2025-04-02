# 自动部署与版本管理指南

本文档介绍如何使用自动部署脚本并设置定时任务，同时保持清晰的版本历史。

## 自动部署脚本

项目包含一个`auto-deploy.sh`脚本，用于自动检测更改并提交到GitHub。脚本具有以下功能：

- 自动检测未提交的更改
- 自动拉取最新代码，避免冲突
- 使用时间戳创建提交
- 每周一自动创建备份分支
- 提供版本管理使用说明

## 手动运行自动部署

通过以下命令手动运行自动部署：

```bash
# 使用npm脚本
npm run deploy

# 或直接运行脚本
bash auto-deploy.sh
```

## 设置定时自动部署（保持同步）

### macOS/Linux系统

1. 编辑crontab：
   ```bash
   crontab -e
   ```

2. 添加以下内容以每小时自动部署一次：
   ```
   0 * * * * cd /Volumes/syh/project01/et-resource-site/frontend && bash auto-deploy.sh >> /tmp/auto-deploy.log 2>&1
   ```

3. 或设置为每天早8点和晚8点部署：
   ```
   0 8,20 * * * cd /Volumes/syh/project01/et-resource-site/frontend && bash auto-deploy.sh >> /tmp/auto-deploy.log 2>&1
   ```

### Windows系统

1. 创建一个批处理文件`auto-deploy.bat`：
   ```batch
   cd /d \path\to\et-resource-site\frontend
   bash auto-deploy.sh > %TEMP%\auto-deploy.log 2>&1
   ```

2. 打开任务计划程序
3. 创建基本任务 → 设置名称(如"Et站点自动部署")
4. 设置触发器(每天或每小时)
5. 选择"启动程序"并指向批处理文件

## 版本管理最佳实践

为了保持清晰的版本历史，请遵循以下做法：

### 1. 对重要更改进行手动提交

当完成重要功能或修复关键bug时：

```bash
git add .
git commit -m "完成XX功能" 或 "修复XX问题"
git push origin main
```

### 2. 使用标签标记重要版本

完成重要里程碑时创建标签：

```bash
# 创建标签
git tag -a v1.0 -m "第一个稳定版本"

# 推送标签到GitHub
git push origin v1.0
```

### 3. 回到特定版本

如需回到特定版本的代码：

```bash
# 使用标签
git checkout v1.0

# 或使用提交哈希
git checkout <commit-hash>
```

### 4. 查看自动备份分支

```bash
# 列出所有分支
git branch -a

# 切换到备份分支
git checkout auto-backup-20240402
```

## 使用GitHub界面查看历史版本

1. 访问项目GitHub仓库
2. 点击"Code" → "Commits"查看所有提交历史
3. 点击"Tags"查看所有版本标签
4. 点击"Branches"查看所有分支，包括自动备份分支 