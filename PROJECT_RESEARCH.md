# SandBox-Game 本地部署与项目研究

本文为首次部署时的研究快照。第三章已在此基础上加入九处剧场、27 张故事卡、60 种造型与 v6 存档，最新说明见 [WORLD_TALES.md](docs/WORLD_TALES.md)。

后续城市密度与立体道路扩展见 [CITY_AND_SKYWAYS.md](docs/CITY_AND_SKYWAYS.md)，包括十片街区、四条可通行高架和桥上存档。

研究日期：2026-10-23。上游：https://github.com/404-NOT-FOUND-ERROR/SandBox-Game 。本地基线：`6987092`（Add original character look series and life corners）。

## 部署结果与使用

项目位于 `D:\比赛展板\SandBox-Game`，默认访问地址为 http://127.0.0.1:8080/ 。这是本机部署，尚未发布到公网。Python 静态服务器只监听回环地址。

在项目目录执行：

```powershell
# 后台启动，可选打开浏览器
powershell -ExecutionPolicy Bypass -File .\start-local.ps1 -OpenBrowser
# 停止本项目服务
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
```

重启电脑后需重新启动服务。运行日志在 `.local/server.out.log` 和 `.local/server.err.log`。如端口被占用，可给启动和停止命令都添加 `-Port 8081`。浏览器存档按来源隔离，改变端口、使用 localhost 代替 127.0.0.1、或更换浏览器，都不会共享原有 localStorage；迁移时使用导出／导入 JSON。

本次通过 Windows 已配置的代理 `http://127.0.0.1:7897` 拉取代码，并仅在此仓库设置 `http.proxy`，未修改全局 Git 配置。Three.js 0.161.0 已下载至 vendor，保留 MIT 许可证，游戏运行不再依赖 CDN；后续 Git 拉取仍依赖代理。

## 产品与实现范围

这是偏温暖探索与轻量创作的 3D 浏览器游戏原型。核心循环为：探索区域 → 认识居民／触发奇遇 → 接取和完成活动 → 获取材料 → 制作、种植、改造地形 → 保存旅程。

源码包含 9 个区域、10 位居民、4 个造型系列，共 40 种可预览外观；前 5 位可成为玩家化身，因此实际可穿 20 种。9 处生活角将人物对话、场景与已有冒险连接起来。18 段活动包括投递、钓鱼、照料、修补、寻宝和巡游。4 款载具支持地面或空中移动。天气、昼夜、资源、花朵、设施、地形操作与任务进度均进入存档体系。

地图是一张有限、连续的岛屿；地形和部分自然物随种子生成，区域中心、道路和活动站点主要由代码固定配置。它不是无限生成世界，也不是任意建筑编辑器。没有联机、服务端、账号、战斗、声音、角色关系数值、成熟的长线主线或自动保存。生活角的烘焙、演奏等设定目前主要体现在造型与对话，并不是独立小游戏。

## 源码结构

`index.html` 约 205 KB，约 1,650 行，包含 CSS、DOM、全部游戏数据和逻辑；大量函数压缩在单行中，实际复杂度高于行数给人的印象。没有 npm 工程、构建步骤和后端。

| 部分 | 入口／关键符号 | 工作方式 |
| --- | --- | --- |
| 状态与场景 | `state`、`scene`、`renderer` | 单个闭包管理资源、进度、天气、玩家和对象集合 |
| 地形 | `noise`、`fbm`、`baseHeight`、`terrainHeight` | 分形噪声叠加固定区域整形，编辑记录继续叠加高度变化 |
| 渲染 | `toon`、`meshWithOutline` | 三阶卡通材质、反向外壳描边、正交相机、阴影与雾 |
| 世界配置 | `REGIONS`、`CAST`、`ACTIVITIES`、`REGION_LIFE` | 区域、人物、任务站点和生活角数据直接内嵌 |
| 角色与衣橱 | `makeCharacter`、`changeAvatar`、`buildPortraits` | 几何体组合角色，离屏渲染 256×256 肖像并缓存 |
| 世界构建 | `buildWorld`、`makeWideNature` | 生成建筑道路、自然物、资源与天气；远方植被使用实例化绘制 |
| 活动 | `startActivity`、`performActivity`、`updateActivities` | 按任务类型和站点推进，首次完成发放材料 |
| 帧循环 | `loop` | 更新移动、环境、载具、剧情演出、活动、相机后渲染 |
| 持久化 | `snapshot`、`save`、`restoreData` | JSON v5，localStorage 和文件导入导出，兼容 v2–v4 |

`docs/WORLD_BIBLE.md` 是世界与角色的扩展基线；`GAME_DESIGN.md` 含历史需求和规划，不能把其中所有设定当成已经实现的功能。`scripts/verify-wardrobe.cjs` 是仓库现有的 Playwright 回归测试。

## 技术判断与后续优先级

优点是运行链路简单，模型和视觉资产主要由程序生成，不需要下载模型包；区域、人物与任务已经有相对集中的配置表；存档恢复会校验类型和范围，并提供历史版本迁移；共享材质、实例化植被、肖像缓存和对象释放体现了性能管理意识。

建议按下面顺序继续开发，以下属于研究建议，本次没有扩大修改游戏功能：

1. **先改善存档体验。** 当前必须手动保存；`save()` 直接调用 localStorage，没有捕获容量不足或存储不可用异常。适合增加错误提示、可恢复的备份和经过明确设计的自动保存。
2. **处理存档上限与运行时上限的一致性。** `restoreData()` 最多保留 800 次地形操作和 1,500 个放置物，但游戏中的 `sculpt()`、`plant()`、`placeCraft()` 没有同等上限。长时间游玩后，超过部分可能在读档时被截断。这是源码静态分析发现，尚未进行超大存档压力复现。
3. **再做性能测量。** 地形使用 208×208 网格，转为非索引几何后约 259,584 个顶点。每次塑形遍历整个地形，而每个高度计算又遍历历史编辑，因此编辑越多开销越大；随后还重算法线、复制描边几何、刷新贴地对象。可考虑局部网格更新、空间索引或烘焙高度数据。当前没有可靠 FPS 基准，不应声称已达某一帧率。
4. **拆分模块以支撑扩展。** 建议先拆出世界配置、存档、任务状态机，再拆渲染与输入。后续增加区域主要扩配置与场景构建；增加任务类型则需要同步修改执行、HUD、存档和验证逻辑。
5. **发布前补充真实设备与长流程测试。** 当前测试覆盖衣橱、迁移和基础交互，仍不能证明全部 18 段冒险能在所有设备上完整完成，也未覆盖数小时游玩、弱 GPU、大量地形编辑和所有载具的操作体验。

若未来公开部署，只需把 `index.html` 与 `vendor/` 等静态文件发布到静态主机；无需 Python 后端。不要将 `.git`、`.local` 测试存档和运行日志发布出去。公网域名与当前本机地址的存档相互独立。

## 本次修改与验证文件

验证结果：仓库衣橱回归测试 **101 项通过**；实际部署检查 **12 项通过**，浏览器异常、控制台错误、外部网络请求均为 0。实际检查覆盖键盘移动、九区地图、海港传送、十八项活动列表、任务接取、天气恢复、v5 存档及 JSON 导入导出。没有逐个通关所有冒险。

- `index.html`：把 Three.js 的 CDN import 改成本地路径，保持版本一致。
- `vendor/three-0.161.0/`：原版模块、许可证、来源与 SHA-256。
- `start-local.ps1` / `stop-local.ps1`：后台启动、端口冲突检查与停止脚本。
- `scripts/verify-wardrobe.cjs`：测试服务器支持本地依赖；修正不带 `--screenshots` 运行时未关闭弹窗便切换到移动端的测试流程问题。
- `scripts/verify-local.cjs`：测试真实部署地址上的移动、天气、地图、冒险接取、保存／读取和 JSON 导入导出，并拦截外部请求验证本地依赖。
- `.local/wardrobe-test.json`、`.local/smoke-test.json`：实际执行产生的报告；`.local/local-game.png` 为本机运行截图。

验证使用本机 Edge 与已安装的 Playwright，测试在独立浏览器上下文进行，不操作用户现有存档。执行时可用 `PLAYWRIGHT_MODULE` 指定 Playwright 模块目录，用 `BROWSER_EXECUTABLE` 指定浏览器路径，然后运行 `node scripts/verify-wardrobe.cjs` 和 `node scripts/verify-local.cjs`。后者要求默认 8080 端口的服务已启动。

WASD／方向键移动，Shift 奔跑，Space 跳跃，E 交谈或采集，M 地图，Q 奇遇，T 活动，V 上下车。离开前点击“保存进度”，重要进度额外导出 JSON。
