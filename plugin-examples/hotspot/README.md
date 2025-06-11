# QSpace Hotspot Plugin 示例

qspace Hotspot 插件使用示例，展示了插件的主要功能和 API 调用方式。

## 功能特性

### 🎯 核心功能

- ✅ 渲染模型并挂载 hotspot 插件
- ✅ 加载标签数据
- ✅ 添加/取消添加标签
- ✅ 删除指定标签
- ✅ 显示/隐藏标签
- ✅ 设置/取消设置标签可见范围
- ✅ 删除所有标签

### 🔍 可见性检测

- ✅ 计算标签头中点是否超出显示范围
- ✅ 计算标签头中点是否超出相机可视范围
- ✅ 计算标签头中点是否被模型遮挡

### 📡 事件处理

- ✅ 标签头点击事件
- ✅ 所有标签加载完成事件
- ✅ 新标签摆放成功事件
- ✅ 点击标签头事件
- ✅ 标签悬停事件
- ...

## 项目结构
```md
hotspot-plugin-example/
├── index.html # 主页面
├── README.md # 说明文档
├── public/
│ └── mock/
│ └── tags.json # 模拟标签数据
└── src/
├── main.js # 应用入口
├── constants/
│ └── index.js # 常量定义
├── services/
│ └── HotspotTagService.js # 标签服务封装
├── utils/
│ └── logger.js # 日志工具
└── styles/
└── main.css # 样式文件
```


## 核心架构

### 1. 服务层封装 (HotspotTagService)

```javascript
// 初始化服务
const hotspotService = new HotspotTagService()
await hotspotService.init(qspace, config)

// 加载标签
await hotspotService.loadTags(tagDataList)

// 添加标签
hotspotService.startAddingTag(tagTemplate)

// 可见性检测
const results = hotspotService.computeTagsVisibility()
```

### 2. 事件驱动架构

```javascript
// 注册事件监听
hotspotService.on('tagHeadClick', (tag) => {
  console.log('标签被点击:', tag)
})

hotspotService.on('tagsLoadComplete', (tags) => {
  console.log('标签加载完成:', tags.length)
})
```

## 使用方法

### 1. 基础设置

```html
<!-- 引入必要的脚本 -->
<script src="https://lib.3dnest.cn/release/qspace/2.0.0/umd/qspace.js"></script>
<script src="https://lib.3dnest.cn/release/qspace-plugin/hotspot-tag/1.1.2/umd/HotspotTag.js"></script>
```

### 2. 初始化服务

```javascript
import { HotspotTagService } from './services/HotspotTagService.js'

const hotspotService = new HotspotTagService()
await hotspotService.init(qspace, {
  res: {
    head_bg: './assets/images/tag-head-bg.png',
    base_plate: './assets/images/tag-base-plate.png',
    // ... 其他资源配置
  }
})
```
### 3. 主要 API 调用

```javascript
// 加载标签
await hotspotService.loadTags(tagDataList)

// 标签管理
hotspotService.showAllTags()
hotspotService.hideAllTags()
hotspotService.removeAllTags()

// 可见范围设置
hotspotService.setTagVisibleRange(5)

// 可见性检测
const visibilityResults = hotspotService.computeTagsVisibility()
```

## 运行示例

1. 启动本地服务器(`npm run dev`)；
2. 打开 `index.html`；
3. 使用控制面板测试各项功能；
4. 查看右侧事件日志了解执行情况；

## 注意事项

1. **资源路径**: 确保所有图片资源路径正确。
2. **模型数据**: 示例使用的是单个模型的渲染。作品渲染可以参考[离线数据包示例代码](https://openplatform.3dnest.cn/3dspace-sdk/docs/samplecode/offline.html)。