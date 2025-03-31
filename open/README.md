# 使用说明

## openAPI（开放平台）

该模式通过众趣开放平台接口获取数据，使用前请先了解[众趣开放平台](https://test-openplatform.3dnest.cn/api/docs/auth.html)

获取 appId 与 app_secret 后

在 .env.open 中配置 `VITE_QVERSE_APP_ID` 为 appId，`VITE_QVERSE_APP_SECRET` 为 app_secret

该 appId 与 app_secret 在 src/plugins/Space/DataCenter/platform/open.js 文件中使用

### 开发

```sh
# 启动开发环境
npm run dev:open

# 访问
http://localhost:5173/?work_id=作品id
```

### 打包

```sh
# 构建生产环境
npm run build:open

# 打包结果在 dist 目录中，根据需求部署
```
