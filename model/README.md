# 使用说明

## model（模型数据包）

该模式通过模型数据包获取数据，仅加载模型

### 开发

获取模型数据包，一般其名称为 `模型名称_模型id`，将数据包解压到文件夹中，文件夹名称建议为模型 id

在文件夹外层，本地启动一个服务，例如：使用 `http-server`，在离线数据包文件夹中运行 `http-server --cors`

在 .env.model 中配置 `VITE_BASE_URL` 为本地启动的服务的 ip + 端口号

例如：配置 `VITE_BASE_URL` 为 `http://127.0.0.1:8080`，通过 `http://127.0.0.1:8080/model_id/info/model_version/raw_settings.txt` 可获取到模型数据包中的 `raw_settings.txt` 文件

注：数据包中，info 或 model 内的文件夹名称，为 model_version，它的格式是一个时间，例如 2023-06-08-00-22-01

单场景示例数据 [下载](https://3dnest-custom-bak.oss-cn-beijing.aliyuncs.com/sdk-smaple-data/model/9dccd8b4_rJHu_b6f9_3Q0.zip)

```sh
# 启动开发环境
npm run dev:model

# 访问
http://localhost:5173/?model_id=模型id&model_version=模型version
```

### 打包

```sh
# 构建生产环境
npm run build:model

# 打包结果在 dist 目录中，根据需求部署
```
