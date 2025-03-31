# 贡献指南

感谢您对Et资源小站项目的关注！本文档提供了参与项目开发的指南。

## Git工作流程

我们采用基于功能分支的Git工作流程：

### 分支结构

- `main`: 稳定的生产代码分支
- `develop`: 开发中的集成分支
- `feature/*`: 新功能开发分支
- `bugfix/*`: 错误修复分支
- `release/*`: 发布准备分支

### 开发流程

1. **功能开发**

   从`develop`分支创建新的功能分支：
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

   开发完成后，提交代码并推送到远程仓库：
   ```bash
   git add .
   git commit -m "实现了xxx功能"
   git push -u origin feature/your-feature-name
   ```

   然后创建Pull Request将功能分支合并到`develop`分支。

2. **Bug修复**

   从`develop`或`main`分支（取决于bug出现的环境）创建修复分支：
   ```bash
   git checkout develop
   git pull
   git checkout -b bugfix/bug-description
   ```

   修复完成后，提交代码并创建Pull Request。

3. **版本发布**

   当`develop`分支达到稳定状态，准备发布时：
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v1.0.0
   ```

   在发布分支上进行最终测试和调整，然后合并到`main`和`develop`分支。

## 代码提交规范

提交信息应该清晰描述变更内容，建议使用以下格式：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码风格调整
- `refactor`: 代码重构
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加用户登录功能
fix: 修复资源列表分页问题
docs: 更新API文档
```

## 代码审查

所有代码变更都需要通过Pull Request提交，并经过至少一名团队成员的代码审查。

## 开发环境设置

请参考项目根目录的README.md文件了解如何设置开发环境。 