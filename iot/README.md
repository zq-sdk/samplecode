# IOT 功能 demo

## 项目概述

本项目是一个基于 Vue 3 的 IoT 设备集成示例项目，用于演示如何基于 qspace、热点标签插件（HotspotTag）、2D 物品摆放插件（Put2D）实现 IoT 相关功能。

## 技术栈

- Vue 3.5.3
- Vite 5.4.3
- Less 4.3.0
- mockjs 1.1.0
- echarts 5.6.0
- aliyun-aliplayer 2.8.2
- element-plus 2.9.10

## 项目结构

```md
iot/
├── src/
│ ├── components/
│ │ ├── IOTScreen/                # IoT 数字大屏组件，用于在空间中以面板的形式展示设备数据
│ │ │ ├── iotScreenDashboard.js   # CSS3D 模式仪表盘创建逻辑
│ │ │ ├── iotScreenText.js        # Canvas 模式文本大屏创建逻辑
│ │ │ ├── IoTScreenLoader.js      # 大屏加载器
│ │ │ ├── Canvas/                 # Canvas 渲染模式相关实现
│ │ │ │ └── CanvasManager.js      # 数据展示的Canvas 具体实现
│ │ │ └── CSS3D/                  # CSS3D 渲染模式相关实现
│ │ │ │ └── DashboardManager.js   # 数据展示的CSS3D 具体实现
│ │ ├── TagPopup/                 # 点击热点标签后显示的弹窗组件，展示设备详情和告警
│ │ ├── TagSearch/                # 热点标签搜索及看板组件
│ │ ├── SceneContainer.vue        # 场景容器，负责初始化空间、加载模型、初始化设备服务等
│ │ ├── SceneTagList.vue          # 场景标签列表组件（可能已废弃或备用，SceneContainer 中被注释）
│ │ └── ViewModeSwitch/           # 视图模式切换组件
│ ├── constants/                  # 定义项目中的常量和枚举，如设备状态、IoT 类型、显示方式等
│ ├── hooks/                      # 全局或通用的 Vue Composition API hooks
│ ├── plugins/
│ │ ├── Space/                    # qspace SDK 集成相关
│ │ │ ├── DataCenter/             # 数据中心，负责解析和管理场景数据
│ │ │ │ ├── offline.js     # 离线作品数据解析
│ │ │ │ └── iot.js         # IoT 相关的标签和 2D 物品数据解析及映射建立
│ │ │ ├── descriptor.js    # 空间能力集成类定义
│ │ │ └── Feature/         # 封装 qspace 的特性能力
│ │ │     └── Tag/         # 热点标签功能封装，集成 HotspotTag 插件
│ ├── services/            # 业务服务层
│ │ ├── equipment.js       # 设备服务，负责设备数据获取、状态监听、告警处理等
│ │ └── video.js           # 视频服务，用于摄像头视频播放
└── .env.offline           # 离线模式环境配置文件

```

## 项目启动说明

示例使用离线数据包的方式获取数据。

### 开发

获取离线数据包后，可在本地启动一个服务，例如：使用 `http-server`，在离线数据包文件夹中运行 `http-server --cors`

在 .env.offline 中配置 `VITE_BASE_URL` 为本地启动的服务的 ip + 端口号

例如：配置 `VITE_BASE_URL` 为 `http://127.0.0.1:8080`，通过 `http://127.0.0.1:8080/base.json` 可获取到离线数据包中的 `base.json` 文件

示例作品数据 [下载](https://3dnest-custom-bak.oss-cn-beijing.aliyuncs.com/sdk-smaple-data/work/JoHx605LGr4.zip)

```sh
# 启动开发环境
pnpm run dev:offline

# 访问
http://localhost:5173
```

### 打包

情况1：将打包结果复制粘贴到离线数据包中，再将数据包部署到服务器

需将 .env.offline 中 `VITE_BASE_URL_PROD` 配置为 ""（空字符串）

情况2：离线数据部署到单独服务（需包含离线数据包以作品 id 为名称的外层文件夹），前端项目通过指定地址获取数据

需将 .env.offline 中 `VITE_BASE_URL_PROD` 配置为目标服务地址

例如：配置 `VITE_BASE_URL` 为 `http://abc.com/file`，通过 `http://abc.com/file/作品id/base.json` 可获取到离线数据包中的 `base.json` 文件

```sh
# 构建生产环境
pnpm run build:offline

# 打包结果在 dist 目录中，根据需求部署
```

## 热点标签

### 设备关联

在作品渲染前时会解析标签数据，建立设备ID与标签ID的双向映射关系，便于后续数据更新和状态监控。标签数据解析流程：

1. 通过`parseIOTDataFromWork`函数将场景中的标签按类型（iot 设备、摄像头）进行分类；
2. 为IOT类型标签创建`iotIdMap`和`iotTagIdMap`映射，实现设备ID和标签ID的相互查询；
3. 标签状态变更时，通过`equipmentService`通知UI组件更新显示；

### 监控告警

- 监听`iot/src/plugins/Space/Feature/Tag/index.js`中发出的`SPACE_EVENT_NAME_ENUM.TAG.HEAD_CLICK`事件，显示弹窗;
- 通过`equipmentService.registerDeviceDataUpdate`注册数据更新监听器;
- 使用`equipmentService.getDeviceAlerts`获取告警状态;
- 使用`equipmentService.addStateChangeListener`注册设备告警状态更新；
- 在`iot/src/plugins/Space/Feature/Tag/index.js`的`qspace.extension.mount`回调中注册设备状态更新回调，更改标签图标；

---

## IOT 数字大屏

IOTScreen是设备数据可视化组件，在编辑作品时，通过摆放 2D 物品关联设备，支持Canvas和CSS3D两种渲染模式。

### 设备关联

2D 物品的名称以`iot_deviceId_mode`的格式填写，与标签的 keyword 设备关联方式一致，其中第三个字段表示：

- `mode`：设备数字大屏渲染方式（0：canvas 模式；1：CSS3D 模式；默认为0）；

### 渲染模式

- Canvas模式：基于 Put2D 插件，将 Canvas 中绘制的内容渲染到场景中；
- CSS3D模式：基于 three.js CSS3DRenderer，借助 qspace 提供的API，将 自定义 DOM 内容渲染到场景中。

### 示例

可参考以下示例了解具体用法：

- `iot/src/components/IOTScreen/iotScreenText.js` - Canvas模式示例
- `iot/src/components/IOTScreen/iotScreenDashboard.js` - CSS3D模式示例
