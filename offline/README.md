# 使用说明

## offline（离线数据包）

该模式通过离线数据包获取数据

### 开发

获取离线数据包后，可在本地启动一个服务，例如：使用 `http-server`，在离线数据包文件夹中运行 `http-server --cors`

在 .env.offline 中配置 `VITE_BASE_URL` 为本地启动的服务的 ip + 端口号

例如：配置 `VITE_BASE_URL` 为 `http://127.0.0.1:8080`，通过 `http://127.0.0.1:8080/base.json` 可获取到离线数据包中的 `base.json` 文件

示例作品数据 [下载](https://3dnest-custom-bak.oss-cn-beijing.aliyuncs.com/sdk-smaple-data/work/JoHx605LGr4.zip)

```sh
# 启动开发环境
npm run dev:offline

# 访问
http://localhost:5173/?work_id=作品id
```

### 打包

情况1：将打包结果复制粘贴到离线数据包中，再将数据包部署到服务器

需将 .env.offline 中 `VITE_BASE_URL_PROD` 配置为 ""（空字符串）

情况2：离线数据部署到单独服务（需包含离线数据包以作品 id 为名称的外层文件夹），前端项目通过指定地址获取数据

需将 .env.offline 中 `VITE_BASE_URL_PROD` 配置为目标服务地址

例如：配置 `VITE_BASE_URL` 为 `http://abc.com/file`，通过 `http://abc.com/file/作品id/base.json` 可获取到离线数据包中的 `base.json` 文件

```sh
# 构建生产环境
npm run build:offline

# 打包结果在 dist 目录中，根据需求部署
```
