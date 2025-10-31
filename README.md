# 瓷器衍生IP官网

一个多页面网站，主推三个IP动画形象：陶陶、思思、琦琦。包含：
- 首页（合照、亮点、表情包预览）
- 人物小传（年代、个性、爱好、转折点、背景故事）
- 三人故事（分幕）
- 文创周边商品页（购物车）
- 支付/结算页（模拟支付流程）
- 售后页面（联系与政策）
- 表情包展示页

## 本地运行
直接双击 `index.html` 用浏览器打开即可（纯前端，无需服务）。

如需本地静态服务（可选）：
- Node: `npx serve .`
- Python: `python -m http.server 8000`

## 资源替换
将图片放到 `assets/images/` 目录：
- `trio-hero.jpg`：三人合照（首页横幅）
- `taotao.png`, `sisi.png`, `qiqi.png`：单人立绘（人物页）
- `emoji/` 目录下放置表情包 PNG/SVG/GIF
- `products/` 放产品图（产品页）

文件路径：
- 公共样式：`styles.css`
- 公共脚本：`app.js`
- 页面：`index.html`, `characters.html`, `story.html`, `products.html`, `checkout.html`, `support.html`, `emojis.html`

## 支付说明（模拟）
结算页仅做表单与流程演示，不会真实扣款。提交后会显示支付成功并清空购物车。

## 目录结构
```
.
├─ index.html
├─ characters.html
├─ story.html
├─ products.html
├─ checkout.html
├─ support.html
├─ emojis.html
├─ styles.css
├─ app.js
└─ assets/
   └─ images/
      ├─ trio-hero.jpg (自备)
      ├─ taotao.png (自备)
      ├─ sisi.png (自备)
      ├─ qiqi.png (自备)
      ├─ products/ (自备)
      └─ emoji/ (自备)
```

## 自定义
- 修改人物与故事文案：在对应页面内搜索“文案起点”注释。
- 产品与价格：修改 `products.html` 中的产品数据块。
- 主题色：在 `styles.css` 顶部的 CSS 变量中调整。
