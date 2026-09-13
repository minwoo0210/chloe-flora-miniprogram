# 花屿花艺工作室 · 设计指南 (design_guidelines.md)

高端花艺商城小程序，风格参考爱马仕：**爱马仕橙 + 奶油米白 + 鎏金点缀**，留白充足、排版大气、字体优雅。

## 1. 配色方案（Tailwind 语义类）
| 用途 | 语义 Token | 色值 | Tailwind 类 |
| --- | --- | --- | --- |
| 页面底色 | background | `#FBF6EE` 奶油 | `bg-background` |
| 正文文字 | foreground | `#2B2118` 浓咖啡 | `text-foreground` |
| 主按钮/主色 | primary | `#E8830C` 爱马仕橙 | `bg-primary text-primary-foreground` |
| 鎏金点缀 | secondary | `#C9A063` | `bg-secondary text-secondary-foreground` / `text-secondary` |
| 弱化文字 | muted-foreground | `#99897A` | `text-muted-foreground` |
| 浅底/标签底 | muted / accent | `#F3EBDF` / `#F6EEDF` | `bg-muted` / `bg-accent` |
| 卡片面 | card | `#FFFFFF` | `bg-card text-card-foreground` |
| 描边/分隔线 | border / input | `#E9DFCE` | `border` / `border-border` |
| 聚焦环 | ring | `#C9A063` | `ring-ring` |
| 危险操作 | destructive | `#C0392B` | `bg-destructive text-destructive-foreground` |

- 禁止使用指南外的颜色类；少量品牌点缀可用既定语义类。
- 图片一律使用风格化占位块（奶油底 + 细描边 + 居中图标 + "建议尺寸"文字），不使用占位符服务/示例域名/虚构路径/本地打包大图。

## 2. 字体与排版
- 标题：字重大、`tracking-wide`，衬线气质，营造杂志封面感
- 正文：清晰、字距适中；价格与主按钮是视觉锚点
- 垂直文本一律加 `block`（小程序 Text 换行）

## 3. 间距与容器系统
- 页面边距：`px-5` / `px-6`
- 区块间隔：`mb-6` / `space-y-5`
- 卡片内边距：`p-4` / `p-5`
- 容器：`bg-card` + `rounded-xl` + 细描边 `border`（圆角克制，不超 rounded-lg 档位则更沉稳）
- 圆角档位：`rounded-md` / `rounded-lg` / `rounded-xl`，禁过度圆形

## 4. 组件选型（强制）
通用 UI 一律优先 `@/components/ui/*`，禁止 `View/Text` 手搓：
- 按钮：`Button`（primary 主操作 / outline 次操作 / ghost）
- 卡片：`Card + CardContent`
- 标签/角标：`Badge`
- 分类/分段：`Tabs`
- 数量步进：`ButtonGroup` + `Button`
- 输入：`Input`（包 `View`）、`Textarea`（包 `View`）
- 弹层/确认：`Dialog` / `AlertDialog`
- 加载态：`Skeleton`
- 空状态：组件内用 `bg-muted` + 图标 + 文案自制小型空状态块
- 图标：`lucide-react-taro`（统一用 `color/size/strokeWidth` 设色，勿用 `className` 改色）

仅 TabBar 图标为本地 PNG（`src/assets/tabbar/`），其余无本地图片。

## 5. 导航结构
- TabBar：首页 / 花礼(分类) / 购物车 / 我的
- 路由：
  - `pages/index/index` 首页
  - `pages/category/index` 花礼分类/列表
  - `pages/product/index?id=` 商品详情
  - `pages/cart/index` 购物车
  - `pages/checkout/index` 结算下单
  - `pages/orders/index` 我的订单
  - `pages/address/index` 地址管理
  - `pages/favorites/index` 我的收藏
  - `pages/my/index` 我的
- TabBar 页面跳转用 `Taro.switchTab`，普通页面用 `Taro.navigateTo`

## 6. 跨端/性能约束
- 全用 Tailwind，避免硬编码 `px`；fixed+flex 用 inline style；bottom 固定避开 TabBar(`bottom: 46`)
- 数据用 Taro Storage（zustand store 持久化），无后端依赖，保证可运行可预览
- 图片占位块不得嵌套真实网络图