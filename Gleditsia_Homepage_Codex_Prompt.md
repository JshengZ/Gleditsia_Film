# Gleditsia_Film 首页开发说明书 / Codex Prompt

> 用途：把本文件直接交给 Codex，让它在本地项目 `Gleditsia_Film` 中实现个人摄影网站首页 First Part。  
> 目标：实现一个极简胶片感、电影字幕开场、暗房显影、多图有机铺展、无导航、滚轮进入下一部分的首页原型。  
> 重要约束：`UI_design/` 文件夹里的图片只是视觉参考帧和胶片氛围素材，不是最终摄影作品。首页最终照片墙应使用用户自己的真实摄影作品。

---

## 0. 项目上下文

项目文件夹名：

```txt
Gleditsia_Film
```

用户会在项目根目录下创建一个文件夹：

```txt
Gleditsia_Film/UI_design
```

其中会存放已经生成好的首页视觉参考图和胶片氛围素材。Codex 需要参考这些图片的整体气质、排版、色彩、动效意图和胶片质感。

建议用户将图片重命名为以下结构，便于 Codex 理解：

```txt
UI_design/
  01_title_black_screen.png
  02_title_with_message.png
  03_darkroom_developing_first_image.png
  04_mosaic_mid_transition.png
  05_mosaic_final_wall.png
  06_mosaic_scroll_ready.png
  texture_film_grain.png
  texture_film_scratches.png
  texture_darkroom_chemical.png
  texture_warm_light_leak.png
```

如果文件名不是上述格式，Codex 也应该读取 `UI_design/` 内全部图片，并将它们理解为以下两类：

1. 首页关键视觉帧：
   - 黑场标题；
   - 标题 + 寄语；
   - 暗房显影；
   - 多图铺开中间态；
   - 最终照片墙；
   - 滚动进入下一部分前的状态。

2. 胶片氛围素材：
   - 颗粒；
   - 划痕；
   - 暗房化学纹理；
   - 轻微漏光。

---

## 1. 首页最终设计定义

请实现首页 First Part，而不是完整网站。

首页 First Part 的核心定义：

```txt
一个强仪式感、不可跳过的电影式开场：
从黑场进入，以英文网站名 Gleditsia 和寄语建立气质，
随后寄语完全消失，真实照片以暗房胶片显影的方式逐张出现，
最终形成一面自由、层叠、有机但受控的首页影像预览墙。
页面无传统导航，用户通过滚轮进入下一个 part。
```

网站名：

```txt
Gleditsia
```

首页风格关键词：

```txt
Minimal Analog
Quiet Film Archive
Cinematic Intro
Darkroom Development
Editorial Collage
Organic Layering
Controlled Chaos
Film Grain
Subtle Scratches
No Navigation
Scroll-driven Narrative
```

中文理解：

```txt
极简胶片感影像档案馆
带有胶片呼吸感的个人摄影展厅
```

---

## 2. 必须遵守的视觉原则

### 2.1 页面不是普通摄影模板

不能做成：

- 摄影工作室模板；
- 普通 portfolio 首页；
- 简历网站；
- 博客；
- 电商图库；
- 赛博科技风；
- 过度 AI 感；
- 过度复古贴纸风；
- 大量按钮、卡片、导航栏堆砌。

### 2.2 UI 元素必须克制

首页几乎不需要传统 UI。

允许出现的元素只有：

- 网站名 `Gleditsia`；
- 开场寄语；
- 真实照片；
- 胶片颗粒 / 划痕 / 暗房显影纹理；
- 极其微弱的 scroll cue；
- 下一部分占位区域。

禁止出现：

- 顶部导航栏；
- 汉堡菜单；
- CTA 按钮；
- About / Works / Contact 链接；
- 复杂 loading 进度条；
- 花哨 icon；
- 大面积玻璃拟态卡片；
- 社交媒体按钮；
- 商业模板式 hero 文案。

### 2.3 动效可以精致，但不能喧宾夺主

视觉元素复杂度约：

```txt
3 / 10
```

动效精致程度约：

```txt
7 / 10
```

这意味着：

- 页面看起来要干净、安静、克制；
- 但动画过程要有记忆点；
- 动效应该像胶片呼吸、暗房显影、影像浮现；
- 不要做成炫技型动画网站。

---

## 3. 首页分镜 Storyboard

Codex 必须按下面的顺序实现首页开场。

### Scene 01：Black Screen / 黑场开场

页面打开后：

- 全屏黑场；
- 背景不是纯黑，而是偏暖的深黑 / 黑褐色；
- 全局有轻微胶片颗粒；
- 有极少量尘埃、微小白点、极淡细线；
- 整体像：
  - 电影开场前的黑银幕；
  - 暗房中尚未显影的相纸；
  - 老胶片扫描的黑场。

推荐背景色：

```css
#080706
#0B0908
#0D0B09
```

不要使用纯 `#000000` 作为唯一背景。

---

### Scene 02：Gleditsia 居中出现

网站名 `Gleditsia` 先在屏幕中央出现。

要求：

- 使用优雅衬线字体；
- 居中；
- 字体颜色为暖白 / 米白 / 旧纸白；
- 出现方式像电影字幕 / 艺术电影片头；
- 不要像科技 logo；
- 不要像商业品牌开屏；
- 不要加夸张 glow；
- 不要加 3D、金属、霓虹、玻璃效果。

推荐字体：

```txt
Playfair Display
Cormorant Garamond
Libre Baskerville
EB Garamond
```

建议优先使用：

```txt
Cormorant Garamond
```

标题样式建议：

```css
font-family: "Cormorant Garamond", serif;
font-size: clamp(4rem, 9vw, 9rem);
font-weight: 400;
letter-spacing: -0.02em;
color: rgba(235, 225, 205, 0.92);
```

动画要求：

```txt
opacity: 0 -> 1
y: 12px -> 0
filter: blur(6px) -> blur(0px)
duration: 1.4s - 1.8s
ease: power3.out 或 cubic-bezier(0.22, 1, 0.36, 1)
```

---

### Scene 03：寄语逐行出现

寄语由用户后续替换，但请先放占位文案：

```txt
A quiet archive of light,
time, and passing traces.
Every frame remembers.
```

寄语要求：

- 在 `Gleditsia` 下方出现；
- 使用无衬线或等宽气质字体；
- 字号明显小于标题；
- 像电影字幕一样逐行出现；
- 每行之间有舒适间距；
- 寄语不应该比网站名抢戏；
- 寄语后续会完全消失。

推荐字体：

```txt
Inter
IBM Plex Sans
Suisse Int'l 替代风格
Space Mono（如果想更像字幕/档案）
```

建议优先使用：

```txt
Inter 或 Space Mono
```

寄语样式建议：

```css
font-family: "Inter", sans-serif;
font-size: clamp(0.95rem, 1.6vw, 1.35rem);
font-weight: 300;
letter-spacing: 0.08em;
line-height: 1.8;
color: rgba(230, 220, 198, 0.78);
```

动画要求：

- 逐行 stagger 出现；
- 每行有轻微上移和 blur 消失；
- 整体节奏像电影字幕，不像网页普通 fade-in。

建议时间：

```txt
line 1: title 出现后 0.4s 出现
line 2: line 1 后 0.35s 出现
line 3: line 2 后 0.35s 出现
```

---

### Scene 04：寄语完全消失

寄语出现一段时间后必须完全消失。

要求：

- 寄语消失后不能占用视觉中心；
- 不能常驻页面；
- 不能变成 slogan；
- 消失方式要柔和，像被黑暗或影像吞没；
- 可结合非常轻微的暗房纹理 / chemical bloom。

动画建议：

```txt
opacity: 1 -> 0
y: 0 -> -8px
filter: blur(0px) -> blur(6px)
duration: 0.9s - 1.2s
```

---

### Scene 05：第一张照片显影

寄语退出后，第一张真实照片开始出现。

注意：不要用 AI 生成照片作为最终作品。用户会提供自己的真实摄影图片。

照片出现方式不能是普通 `fade in`。

必须像暗房显影：

```txt
最开始低对比、低清晰度、低曝光；
然后边缘和暗部慢慢出现；
随后对比度、亮度、清晰度逐渐恢复；
最后成为一张可见照片。
```

CSS / 动画建议：

```css
.developing-photo {
  opacity: 0;
  filter: brightness(0.42) contrast(0.55) saturate(0.4) blur(18px);
  clip-path: inset(48% 48% 48% 48%);
}

.developing-photo.is-visible {
  opacity: 1;
  filter: brightness(0.92) contrast(1.02) saturate(0.86) blur(0px);
  clip-path: inset(0% 0% 0% 0%);
}
```

更高级的方式：

- 使用 CSS mask；
- 使用径向渐变 mask；
- 使用 pseudo-element 叠加 chemical texture；
- 使用 `mix-blend-mode: screen / overlay / soft-light`；
- 使用 GSAP timeline 分阶段控制 opacity/filter/mask/transform。

---

### Scene 06：多张照片逐张显影并铺开

照片数量：

```txt
15 - 25 张
```

照片比例：

```txt
横图 + 竖图 + 方图混合
```

照片类型：

```txt
黑白
扫街
风景
人像
安静情绪
局部静物
建筑/城市
```

布局方式：

```txt
自由层叠
有机铺展
Controlled Chaos
Editorial Collage
Organic Layering
```

不要使用普通 CSS grid 直接整齐排列。

不是：

```txt
3x5 网格
瀑布流
Pinterest
普通相册
Bootstrap card layout
```

而是：

```txt
像摄影师把照片自由摊开在黑色桌面上；
像策展式影像拼贴；
像接触印样和摄影书之间的状态；
自由但有视觉节奏。
```

必须满足：

- 视觉上自由；
- 但整体舒服；
- 层叠但不脏乱；
- 有 1-3 张视觉主图；
- 其余照片作为氛围和节奏；
- 左下角要为最终的 `Gleditsia` 小标题留空间；
- 底部中间可以留出极弱 scroll cue 的空间；
- 桌面端 15-25 张；
- 移动端必须减少到 8-12 张，并重新布局。

---

### Scene 07：Gleditsia 从中心退到左下角

用户已确认：

```txt
网站名先居中出现，后续退到左下角。
```

退场不是消失，而是变成左下角品牌锚点。

要求：

- 当照片墙开始形成后，`Gleditsia` 从中心缩小并移动到左下角；
- 移动过程要安静、顺滑；
- 不能突然跳变；
- 最终位置为左下角；
- 最终标题要低调，不抢照片。

左下角最终样式建议：

```css
.positioned-title {
  position: fixed;
  left: clamp(1.5rem, 4vw, 4rem);
  bottom: clamp(1.4rem, 4vw, 3rem);
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.25rem, 2vw, 2rem);
  color: rgba(232, 222, 204, 0.82);
  z-index: 20;
}
```

---

### Scene 08：最终 Preview Mosaic Wall

最终首页状态：

```txt
整个首屏背景被真实照片铺满，形成首页影像预览墙。
```

但要注意：

- 这不是完整作品浏览；
- 这只是第一印象；
- 不需要用户在这里逐张点开；
- 真正的主题浏览在下一个 part；
- 这里负责让用户理解：这是一个胶片感、私人化、安静、高级的摄影网站。

最终状态必须类似 `UI_design/05_mosaic_final_wall.png` 或 `UI_design/06_mosaic_scroll_ready.png` 的气质：

- 深色背景；
- 多照片层叠；
- 胶片质感；
- 不规则但舒服；
- 左下角小 `Gleditsia`；
- 不出现传统导航。

---

### Scene 09：滚轮进入下一 part

首页没有导航。

用户继续滚轮后进入下一个部分。

当前开发只需要做下一个 part 的占位区域即可，例如：

```txt
Next Part Placeholder
```

但是交互上要预留未来扩展：

- 使用滚轮继续向下；
- 首页 First Part 完成后，用户可以进入下一部分；
- 不能用按钮；
- 不能出现传统导航；
- 不允许跳过 opening sequence。

可以在首页最终状态底部中间加入极弱 scroll cue：

```txt
SCROLL
一根很短的竖线
```

但要求：

- 极其低调；
- 不像按钮；
- 不抢视觉；
- 只提示页面可以继续滚动。

---

## 4. 胶片效果强度参数

用户已确认以下参数：

```txt
胶片颗粒：7/10
胶片划痕 / 细线：4/10
胶片晃动：3/10
暗房显影感：8/10
漏光效果：2/10
```

解释：

- 颗粒和显影是主角；
- 划痕是辅助；
- 晃动必须很轻；
- 漏光只能偶尔出现，不能变俗；
- 整体不能变成粗糙复古贴纸风。

---

## 5. 技术栈要求

请优先使用以下技术栈：

```txt
Next.js
TypeScript
Tailwind CSS
GSAP
GSAP ScrollTrigger
Lenis
Framer Motion（可选）
fast-average-color 或 Color Thief / Vibrant.js
CSS mask / clip-path / filter
CSS pseudo-elements
Canvas 或 CSS noise overlay
```

### 5.1 推荐初始化方式

如果项目还没有初始化：

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

如果当前文件夹已经存在，不要覆盖用户已有内容。先检查目录结构。

### 5.2 安装依赖

建议安装：

```bash
npm install gsap @studio-freight/lenis framer-motion fast-average-color clsx
```

如果 `@studio-freight/lenis` 安装或类型报错，可以使用新版包：

```bash
npm install lenis
```

然后根据实际包文档调整 import。

### 5.3 依赖用途

| 库 | 用途 |
|---|---|
| GSAP | 复杂时间线动画：黑场、标题、寄语、照片显影、标题退角 |
| ScrollTrigger | 滚轮驱动首页进入下一 part |
| Lenis | 平滑滚动，提供高级滚动手感 |
| Framer Motion | 可选，用于局部淡入/小型过渡 |
| fast-average-color | 从当前照片或照片组提取平均色，驱动背景色 |
| Tailwind CSS | 快速写布局与响应式 |
| CSS filter/mask/clip-path | 暗房显影效果 |
| CSS pseudo-elements | 胶片颗粒、划痕、漏光 overlay |
| Canvas | 如果 CSS noise 不够自然，可以用 Canvas 动态噪声 |

---

## 6. 推荐项目结构

请按以下结构组织代码：

```txt
Gleditsia_Film/
  UI_design/
    ...视觉参考图片

  public/
    photos/
      home/
        01.jpg
        02.jpg
        03.jpg
        ...
    textures/
      film-grain.png              # 可选，从 UI_design 拷贝或自行生成
      film-scratches.png          # 可选
      darkroom-chemical.png       # 可选
      light-leak.png              # 可选

  src/
    app/
      globals.css
      layout.tsx
      page.tsx

    components/
      homepage/
        HomeIntro.tsx
        FilmOverlay.tsx
        FilmGrainOverlay.tsx
        FilmScratchesOverlay.tsx
        PhotoMosaicWall.tsx
        DevelopingPhoto.tsx
        ScrollCue.tsx
        NextPartPlaceholder.tsx

    data/
      homePhotos.ts

    hooks/
      useLenis.ts
      useDominantBackground.ts
      usePrefersReducedMotion.ts

    lib/
      animation.ts
      color.ts
      photoLayout.ts
```

---

## 7. 数据结构设计

在 `src/data/homePhotos.ts` 中定义首页照片数据。

示例：

```ts
export type HomePhoto = {
  id: string;
  src: string;
  alt: string;
  kind?: "portrait" | "landscape" | "square";
  tone?: "bw" | "warm" | "cool" | "neutral" | "green" | "brown";
  priority?: "hero" | "supporting" | "ambient";
  className?: string;
};

export const homePhotos: HomePhoto[] = [
  {
    id: "home-01",
    src: "/photos/home/01.jpg",
    alt: "Personal film photograph 01",
    kind: "landscape",
    tone: "neutral",
    priority: "hero",
  },
  {
    id: "home-02",
    src: "/photos/home/02.jpg",
    alt: "Personal film photograph 02",
    kind: "portrait",
    tone: "warm",
    priority: "supporting",
  },
];
```

注意：

- 不要硬编码 AI 参考图作为最终照片；
- `UI_design` 只作为参考；
- 最终照片路径应来自 `public/photos/home/`；
- 如果照片暂时没有准备好，可以用灰色占位块，但代码结构必须允许用户替换成真实照片。

---

## 8. 照片布局实现细节

### 8.1 不要普通 grid

不要写成：

```css
display: grid;
grid-template-columns: repeat(5, 1fr);
```

这会变成普通图库。

### 8.2 使用绝对定位 + 响应式 layout map

建议为每张照片设定桌面端布局数据：

```ts
export type MosaicLayoutItem = {
  id: string;
  x: number;       // vw
  y: number;       // vh
  w: number;       // vw
  rotate: number;  // deg
  z: number;
};

export const desktopMosaicLayout: MosaicLayoutItem[] = [
  { id: "home-01", x: 6, y: 9, w: 22, rotate: -1.5, z: 2 },
  { id: "home-02", x: 30, y: 8, w: 16, rotate: 0.8, z: 4 },
  { id: "home-03", x: 51, y: 6, w: 19, rotate: -0.4, z: 3 },
  { id: "home-04", x: 70, y: 10, w: 20, rotate: 1.2, z: 2 },
  { id: "home-05", x: 15, y: 36, w: 20, rotate: 0.2, z: 5 },
  { id: "home-06", x: 37, y: 31, w: 23, rotate: -0.8, z: 6 },
  { id: "home-07", x: 58, y: 34, w: 18, rotate: 0.6, z: 5 },
  { id: "home-08", x: 76, y: 40, w: 17, rotate: -1.0, z: 4 },
  { id: "home-09", x: 5, y: 65, w: 26, rotate: 1.1, z: 3 },
  { id: "home-10", x: 32, y: 66, w: 18, rotate: -0.7, z: 4 },
  { id: "home-11", x: 52, y: 66, w: 20, rotate: 0.9, z: 3 },
  { id: "home-12", x: 74, y: 66, w: 18, rotate: -0.3, z: 2 },
];
```

实际数量 15-25 张，以上只是示例。请根据 `UI_design` 参考图调成更自然的排布。

### 8.3 视觉节奏原则

布局应包含：

- 左上 / 中部 / 右下都有视觉重心；
- 中心区域可有 1 张主视觉图；
- 主图不要完全居中死板；
- 左下角保留 `Gleditsia`；
- 图片之间可以重叠 5%-18%；
- 不要让所有图片角度都不同，旋转应非常克制；
- rotation 建议范围：`-2deg` 到 `2deg`；
- 阴影要弱，不要像卡片 UI；
- 图片边框可以是细微 off-white 或无边框；
- 不要使用 Polaroid 卡通边框，除非真实照片本身有白边。

---

## 9. 动画实现细节

### 9.1 总 timeline

建议用 GSAP timeline 控制首页 opening：

```ts
const tl = gsap.timeline({
  defaults: {
    ease: "power3.out",
  },
});
```

时间线建议：

```txt
0.0s - 0.8s    黑场 + 胶片颗粒呼吸
0.8s - 2.3s    Gleditsia 居中出现
2.1s - 3.8s    寄语逐行出现
4.2s - 5.2s    寄语完全消失
4.8s - 7.8s    第一批照片开始显影
6.2s - 10.0s   多张照片逐张显影并铺开
8.5s - 10.2s   Gleditsia 缩小并移动到左下角
10.2s+         最终照片墙稳定，scroll cue 出现
```

用户要求：

```txt
不准跳过。
```

所以不要提供 skip 按钮，不要滚轮加速跳过 opening。

但注意：虽然不能跳过，opening 也不能过长。建议完整开场控制在 8-10 秒以内。

---

### 9.2 照片显影动画

每张照片初始状态：

```css
.photo {
  opacity: 0;
  transform: translate3d(var(--start-x), var(--start-y), 0) scale(0.96) rotate(var(--rotate-start));
  filter: brightness(0.35) contrast(0.5) saturate(0.35) blur(20px);
  clip-path: inset(45% 45% 45% 45%);
}
```

显影完成状态：

```css
.photo.is-developed {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1) rotate(var(--rotate));
  filter: brightness(0.92) contrast(1.04) saturate(0.82) blur(0px);
  clip-path: inset(0% 0% 0% 0%);
}
```

GSAP 建议：

```ts
tl.to(photoElements, {
  opacity: 1,
  filter: "brightness(0.92) contrast(1.04) saturate(0.82) blur(0px)",
  clipPath: "inset(0% 0% 0% 0%)",
  scale: 1,
  stagger: {
    each: 0.16,
    from: "random",
  },
  duration: 1.25,
  ease: "power2.out",
});
```

注意：

- `filter` 动画性能消耗较大；
- 照片数量多时要控制时长；
- 可对移动端减少照片数量；
- `clip-path` 和 `filter` 同时动画时，低端设备可能掉帧；
- 可在动画结束后清除 filter 或添加 `will-change`。

---

### 9.3 胶片颗粒动画

可以实现为 fixed overlay：

```tsx
<div className="film-grain-overlay" />
```

CSS 示例：

```css
.film-grain-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  opacity: 0.08;
  mix-blend-mode: overlay;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0 1px, transparent 1px),
    radial-gradient(circle at 70% 40%, rgba(255,255,255,0.08) 0 1px, transparent 1px);
  background-size: 140px 140px, 90px 90px;
  animation: grain-shift 1.4s steps(2) infinite;
}

@keyframes grain-shift {
  0% { transform: translate3d(0, 0, 0); }
  25% { transform: translate3d(-1%, 1%, 0); }
  50% { transform: translate3d(1%, -1%, 0); }
  75% { transform: translate3d(-0.5%, -0.5%, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
```

更高级方式：

- 用 `texture_film_grain.png` 作为 overlay；
- 或用 canvas 每隔 80-120ms 生成一次轻微噪声；
- 不要高频刷新到 60fps，否则会很费性能；
- 颗粒透明度控制在 0.05-0.12 之间。

---

### 9.4 胶片划痕 / 细线

创建 fixed overlay：

```tsx
<div className="film-scratches-overlay" />
```

CSS：

```css
.film-scratches-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 101;
  opacity: 0.18;
  mix-blend-mode: screen;
  background:
    linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 0.08%, transparent 0.16%),
    linear-gradient(90deg, transparent 62%, rgba(255,255,255,0.05) 62.08%, transparent 62.16%),
    linear-gradient(90deg, transparent 81%, rgba(255,255,255,0.04) 81.06%, transparent 81.14%);
  animation: scratch-flicker 4.5s steps(1) infinite;
}

@keyframes scratch-flicker {
  0%, 100% { opacity: 0.10; }
  20% { opacity: 0.16; }
  21% { opacity: 0.05; }
  56% { opacity: 0.13; }
  57% { opacity: 0.04; }
}
```

注意：

- 划痕强度 4/10；
- 不能让页面看起来脏；
- 不要太密集；
- 不要挡住照片主体。

---

### 9.5 胶片晃动 / Gate Weave

用户想要轻微胶片摄影机晃动感，但强度只有 3/10。

实现方式：

```css
.film-weave {
  animation: gate-weave 3.6s infinite steps(2);
}

@keyframes gate-weave {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); }
  25% { transform: translate3d(0.4px, -0.3px, 0) rotate(0.015deg); }
  50% { transform: translate3d(-0.3px, 0.5px, 0) rotate(-0.02deg); }
  75% { transform: translate3d(0.2px, 0.2px, 0) rotate(0.01deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}
```

注意：

- 只应用在背景照片墙或单张大图容器；
- 不要让文字晃动太明显；
- 不要让用户晕；
- `prefers-reduced-motion` 下必须关闭。

---

### 9.6 暗房 chemical texture

可使用 `texture_darkroom_chemical.png` 或 CSS radial gradient。

适用时机：

- 第一张照片显影；
- 寄语消失后；
- 照片显影初期。

不要常驻高强度显示。

实现方式：

```tsx
<div className="darkroom-bloom" />
```

```css
.darkroom-bloom {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 30;
  opacity: 0;
  mix-blend-mode: screen;
  background:
    radial-gradient(circle at 40% 50%, rgba(230,220,190,0.16), transparent 35%),
    radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08), transparent 42%);
  filter: blur(24px);
}
```

GSAP：

```ts
tl.to(".darkroom-bloom", {
  opacity: 0.28,
  duration: 0.8,
}, "developStart")
.to(".darkroom-bloom", {
  opacity: 0,
  duration: 1.4,
});
```

---

### 9.7 漏光效果

用户确认漏光强度为 2/10。

只允许在转场瞬间短暂出现。

不要让页面出现大面积红橙色常驻。

CSS：

```css
.light-leak {
  pointer-events: none;
  position: fixed;
  inset: 0;
  opacity: 0;
  z-index: 35;
  background: radial-gradient(circle at 0% 80%, rgba(255, 96, 34, 0.22), transparent 38%);
  mix-blend-mode: screen;
}
```

动画：

```ts
tl.to(".light-leak", { opacity: 0.18, duration: 0.25 })
  .to(".light-leak", { opacity: 0, duration: 0.7 });
```

注意：  
不要持续显示漏光，容易变俗。

---

## 10. 动态背景色

首页背景需要根据当前照片 / 当前照片组的色调动态变化。

推荐方式：

1. 初始背景为暖黑；
2. 照片墙出现时，从当前第一张主图或照片组中提取平均色；
3. 将颜色压暗、降低饱和度；
4. 用作背景渐变的一部分。

推荐使用：

```bash
npm install fast-average-color
```

示例逻辑：

```ts
import { FastAverageColor } from "fast-average-color";

const fac = new FastAverageColor();

async function getMutedBackground(imageEl: HTMLImageElement) {
  const color = await fac.getColorAsync(imageEl);
  // color.hex 是平均色
  // 注意需要手动压暗和降低饱和度
}
```

建议不要直接把提取色原样作为背景，否则会太亮太乱。

背景色处理规则：

```txt
dominant color -> 降饱和 -> 降亮度 -> 加黑色 overlay -> 形成 muted cinematic background
```

可以手动做一个函数：

```ts
export function muteColor(hex: string) {
  // 简化处理：
  // 1. 转 HSL
  // 2. saturation *= 0.35
  // 3. lightness = Math.min(lightness * 0.28, 18%)
  // 4. 返回 hsl 字符串
}
```

背景可以写成：

```css
background:
  radial-gradient(circle at 50% 40%, var(--dynamic-bg-soft), transparent 55%),
  linear-gradient(180deg, #0b0908 0%, var(--dynamic-bg) 100%);
```

注意：

- 动态背景变化要慢；
- 使用 `transition: background 1200ms ease`;
- 不要频繁每张图都突变背景；
- 可以只在第一张主图显影完成后更新一次；
- 或在照片墙最终形成时更新一次。

---

## 11. 不准跳过的实现原则

用户明确要求：

```txt
不准跳过
```

所以：

- 不要加 skip button；
- 不要让滚轮直接跳到最终照片墙；
- 不要点击跳过；
- 不要 localStorage 记住第二次访问后跳过。

但体验上仍然要避免太慢：

- opening 建议 8-10 秒；
- 不要超过 12 秒；
- 动效必须流畅；
- 加载图片要预加载；
- 如果图片没加载完，需要优雅等待，不要白屏。

---

## 12. 图片加载策略

首页使用 15-25 张真实照片，必须注意性能。

建议：

- 首页首批图片预加载 6-8 张；
- 其余图片 lazy load；
- 但 opening 过程中会出现的图片必须提前准备好；
- Next.js 使用 `next/image`；
- 但复杂绝对定位 + animation 时，`next/image` 需要仔细处理 `fill` 和 parent size；
- 如果 `next/image` 动画不方便，可以先用普通 `<img>`，但要设置合适尺寸和 `object-fit: cover`。

建议优先：

```tsx
<img
  src={photo.src}
  alt={photo.alt}
  draggable={false}
  className="..."
/>
```

在视觉原型阶段，普通 img 更容易调动画。

上线前再考虑替换为 Next Image 优化。

---

## 13. 响应式要求

### 桌面端

- 15-25 张照片；
- 形成完整 preview mosaic wall；
- `Gleditsia` 左下角；
- scroll cue 底部中间极淡显示；
- 动效完整。

### 平板端

- 12-16 张照片；
- 减少重叠；
- 标题字号减少；
- 左下角品牌位置保持。

### 移动端

- 8-12 张照片；
- 不要密集堆叠；
- 显影动画减少 filter 强度；
- gate weave 关闭或减弱；
- scroll cue 可以保留；
- 开场时长可以略短，但仍然不准跳过。

CSS breakpoints：

```txt
desktop: >= 1024px
tablet: 768px - 1023px
mobile: < 768px
```

---

## 14. 可访问性与 reduced motion

必须处理 `prefers-reduced-motion`：

如果用户系统设置减少动态效果：

- 关闭 gate weave；
- 降低 grain 动态；
- 不使用强烈 filter 动画；
- 仍然保留开场顺序，但用简单 opacity 替代复杂动态。

示例 hook：

```ts
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return reduced;
}
```

---

## 15. Codex 需要特别注意的坑

### 15.1 GSAP 与 Next.js SSR

GSAP 只能在客户端运行。

因此动画组件必须加：

```tsx
"use client";
```

并且在 `useEffect` 或 `useLayoutEffect` 中注册。

ScrollTrigger 需要：

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

注意不要在服务端执行 `window` 相关逻辑。

---

### 15.2 Lenis 包名问题

Lenis 可能有两个包：

```txt
@studio-freight/lenis
lenis
```

如果 `@studio-freight/lenis` 不可用或报错，改用：

```bash
npm install lenis
```

并根据当前版本调整：

```ts
import Lenis from "lenis";
```

或：

```ts
import Lenis from "@studio-freight/lenis";
```

Codex 必须检查实际安装版本。

---

### 15.3 filter 动画性能

`filter: blur/contrast/brightness` 很消耗性能。

优化方式：

- 不要同时给 25 张照片做长时间 blur；
- 使用 stagger 分批；
- 动画结束后清除不必要的 filter；
- 给动画元素加 `will-change: transform, opacity, filter`;
- 移动端减少照片数量；
- 移动端减少 blur 强度。

---

### 15.4 图片路径

`UI_design/` 里的图片是参考图，不一定在 public 里。

最终展示照片应放在：

```txt
public/photos/home/
```

如果没有真实照片，Codex 可以先创建占位说明，但不要把 `UI_design` 中的 AI 参考图当成最终摄影作品。

---

### 15.5 不要自动加导航

很多模板会默认加：

```txt
Home / Work / About / Contact
```

这里禁止。

首页必须无传统导航。

---

### 15.6 不要把 scroll cue 做成按钮

scroll cue 只是极弱提示，不是 CTA。

不能写：

```txt
Explore Works
View Gallery
Enter Site
```

可以写：

```txt
SCROLL
```

或者只用一根很细的线。

---

### 15.7 不要过度复古

胶片感不是：

- 大粗边框；
- 老相机 icon；
- 复古贴纸；
- 撕纸边；
- 泛黄纸张大面积铺底；
- 夸张漏光；
- 过多打字机字体；
- Polaroid 堆满页面。

正确方向是：

```txt
极简 + 胶片颗粒 + 暗房显影 + 安静拼贴 + 电影字幕
```

---

## 16. 首页组件功能要求

### HomeIntro.tsx

职责：

- 首页总容器；
- 初始化 GSAP timeline；
- 管理开场顺序；
- 包含标题、寄语、照片墙、overlay、scroll cue；
- 控制 `Gleditsia` 从中心移动到左下角。

### FilmOverlay.tsx

职责：

- 组合所有胶片层；
- 包括 grain、scratches、light leak、darkroom bloom。

### FilmGrainOverlay.tsx

职责：

- 全局颗粒；
- fixed；
- pointer-events none；
- 低透明度；
- 可动态轻微移动。

### FilmScratchesOverlay.tsx

职责：

- 细线、划痕；
- 强度 4/10；
- 低透明度；
- 偶尔 flicker。

### PhotoMosaicWall.tsx

职责：

- 渲染 15-25 张照片；
- 使用 layout map；
- 每张照片以 developing animation 出现；
- 不用普通 grid；
- 支持响应式数量降级。

### DevelopingPhoto.tsx

职责：

- 单张照片组件；
- 支持显影初始态和完成态；
- 支持不同 aspect ratio；
- 支持 z-index、旋转、尺寸；
- 支持 alt 文本。

### ScrollCue.tsx

职责：

- 渲染极弱 scroll cue；
- opening 完成后出现；
- 不可点击；
- 不作为导航按钮。

### NextPartPlaceholder.tsx

职责：

- 首页之后的下一部分占位；
- 只用于验证滚轮继续进入下一 part；
- 不要在这里设计正式主题章节。

---

## 17. 页面高度与滚动控制

建议结构：

```tsx
<main>
  <section className="home-intro">
    ...
  </section>

  <section className="next-part-placeholder">
    ...
  </section>
</main>
```

首页高度可以设为：

```css
.home-intro {
  min-height: 100svh;
  position: relative;
  overflow: hidden;
}
```

如果需要 ScrollTrigger pin 首页：

```ts
ScrollTrigger.create({
  trigger: homeRef.current,
  start: "top top",
  end: "+=140%",
  pin: true,
  scrub: false,
});
```

但注意：

- 用户要求 opening 不准跳过；
- opening 本身可以用时间线自动播放；
- 首页完成后再允许自然滚动进入下一 part；
- 不要让滚动位置一开始就控制 opening 进度，否则用户滚轮可能跳过。

更稳妥的方式：

1. Opening 自动播放；
2. Opening 期间锁定 body 滚动；
3. Opening 完成后释放滚动；
4. 用户滚轮进入 next part。

滚动锁定示例：

```ts
document.body.style.overflow = "hidden";
// opening complete
document.body.style.overflow = "";
```

注意：

- 要在 cleanup 时恢复；
- 不要造成页面永久无法滚动；
- 移动端 Safari 需要测试。

---

## 18. 具体 Codex 执行任务

请 Codex 按以下顺序工作：

### Task 1：检查项目

- 检查当前是否已有 Next.js 项目；
- 如果没有，初始化 Next.js + TypeScript + Tailwind；
- 不要覆盖用户已有文件；
- 确认 `UI_design/` 是否存在；
- 确认 `public/photos/home/` 是否存在，没有则创建；
- 如果没有真实照片，创建 README 提示用户放置照片，但仍实现组件结构。

### Task 2：安装依赖

安装：

```bash
npm install gsap framer-motion fast-average-color clsx
npm install lenis
```

如果 `lenis` 不可用，再尝试：

```bash
npm install @studio-freight/lenis
```

### Task 3：创建组件结构

创建：

```txt
src/components/homepage/HomeIntro.tsx
src/components/homepage/FilmOverlay.tsx
src/components/homepage/PhotoMosaicWall.tsx
src/components/homepage/DevelopingPhoto.tsx
src/components/homepage/ScrollCue.tsx
src/components/homepage/NextPartPlaceholder.tsx
src/data/homePhotos.ts
src/lib/photoLayout.ts
```

### Task 4：实现首页视觉

必须包括：

- 黑场；
- 居中 `Gleditsia`；
- 寄语逐行出现；
- 寄语完全消失；
- 第一张照片显影；
- 15-25 张照片逐张显影；
- 最终形成 preview mosaic wall；
- `Gleditsia` 移动到左下角；
- 胶片颗粒 overlay；
- 胶片划痕 overlay；
- 轻微 gate weave；
- 极弱 scroll cue；
- 滚轮进入 next placeholder。

### Task 5：实现响应式

桌面 / 平板 / 移动端分别适配。

### Task 6：验证

运行：

```bash
npm run dev
```

检查：

- 页面无导航；
- opening 不可跳过；
- 动画顺序正确；
- 照片墙布局不是普通 grid；
- 页面不卡顿；
- 移动端不崩；
- 控制台无报错；
- 关闭页面或热更新后不会 body 永久 overflow hidden。

---

## 19. 首页验收标准

最终实现必须满足以下标准：

1. 首页从黑场开始；
2. 黑场有轻微胶片颗粒，不是纯黑；
3. `Gleditsia` 先居中出现；
4. `Gleditsia` 使用优雅衬线体；
5. 寄语使用无衬线体；
6. 名字和寄语都像电影字幕一样逐行 / 渐次出现；
7. 寄语必须完全消失；
8. 第一张照片必须有暗房显影感；
9. 每张照片都必须有显影式出现过程；
10. 首页最终出现 15-25 张照片；
11. 照片比例必须混合：横图、竖图、方图；
12. 照片墙必须是自由层叠的 organic collage；
13. 不能是普通 grid、瀑布流或模板相册；
14. `Gleditsia` 最终退到左下角；
15. 页面没有任何传统导航；
16. 没有 skip 按钮；
17. 没有 CTA 按钮；
18. 用户只能通过滚轮进入下一 part；
19. 胶片颗粒明显但高级；
20. 划痕和细线克制；
21. 晃动非常轻微；
22. 漏光只能偶尔出现，不能常驻；
23. 整体感觉是极简胶片感，不是复古贴纸风；
24. UI 复杂度低，但动效精致；
25. `UI_design/` 参考图的气质需要被明显体现；
26. 首页最终必须给人“私人影像档案馆”的第一印象；
27. 真实照片应来自 `public/photos/home/`，不要把 AI 参考图当最终作品；
28. 移动端必须减少照片数量和动画强度；
29. `prefers-reduced-motion` 下应降级；
30. 控制台无错误，页面可正常运行。

---

## 20. 首页文案占位

当前使用占位寄语：

```txt
A quiet archive of light,
time, and passing traces.
Every frame remembers.
```

注意：

- 这只是占位；
- 用户后续会自己构思最终寄语；
- 请将寄语抽成常量，方便替换。

示例：

```ts
const INTRO_LINES = [
  "A quiet archive of light,",
  "time, and passing traces.",
  "Every frame remembers.",
];
```

---

## 21. 最终给 Codex 的核心提示词

请将以下内容作为 Codex 的核心实现目标：

```txt
请在 Gleditsia_Film 项目中实现一个极简胶片风个人摄影网站首页 First Part。
首页没有导航、没有按钮、没有普通 portfolio 模板结构。

视觉参考来自项目根目录的 UI_design 文件夹。请重点参考其中黑场标题、电影字幕、暗房显影、多图有机层叠照片墙、胶片颗粒、划痕、暗房化学纹理和微弱漏光的气质。

首页流程：
1. 黑场开场，带轻微胶片颗粒和极淡划痕。
2. 网站名 Gleditsia 以优雅衬线字体在屏幕中央出现。
3. 寄语以无衬线字体在标题下方像电影字幕一样逐行出现。
4. 寄语完全消失。
5. 第一张真实照片以暗房显影方式出现。
6. 后续 15-25 张真实照片逐张显影，并形成自由、层叠、有机但受控的 preview mosaic wall。
7. Gleditsia 从中心缩小并移动到左下角，成为低调品牌锚点。
8. 最终状态没有导航，只显示照片墙、左下角 Gleditsia 和极弱 scroll cue。
9. 用户通过鼠标滚轮进入下一个 part 的占位区域。
10. Opening 不允许跳过。

技术栈优先使用 Next.js + TypeScript + Tailwind CSS + GSAP + Lenis + fast-average-color。使用 GSAP timeline 控制复杂动画，使用 CSS filter/mask/clip-path 实现显影，使用 fixed overlay 实现 film grain、scratches、darkroom bloom 和 light leak。

必须保证：不是普通 grid，不是瀑布流，不是商业摄影模板，不是博客，不是简历网站，不是复古贴纸风。最终气质必须是 Minimal Analog / Quiet Film Archive / Cinematic Intro / Darkroom Development / Editorial Collage。
```

---

## 22. 用户后续需要准备的素材

用户需要在项目里放入真实照片：

```txt
public/photos/home/01.jpg
public/photos/home/02.jpg
...
public/photos/home/25.jpg
```

建议选择：

- 黑白照片 3-5 张；
- 扫街照片 3-5 张；
- 风景照片 3-5 张；
- 人像照片 3-5 张；
- 静物 / 局部 / 情绪图 3-5 张。

照片数量不足时：

- 最少先放 8-12 张；
- 桌面端最终推荐 15-25 张；
- 第一版可以先用 12 张测试布局。

---

## 23. 特别提醒

这个首页的核心不是“展示很多照片”，而是：

```txt
让用户通过一个不可跳过的胶片式 opening sequence，
进入 Gleditsia 的私人摄影世界。
```

所以：

- 不要为了炫而炫；
- 不要堆库；
- 不要堆 UI；
- 不要强行做 3D；
- 不要让照片墙像商品陈列；
- 不要让动画变成短视频转场模板；
- 要始终保持克制、安静、胶片、私密、策展感。
```

---

## 24. 推荐第一版完成标准

第一版只要完成首页 First Part，不做完整网站。

第一版成功标志：

```txt
打开网站时，用户先看到黑场；
Gleditsia 像电影片头一样出现；
寄语逐行出现后完全消失；
照片一张张像暗房显影一样浮现；
最终形成一面有机层叠的照片预览墙；
Gleditsia 退到左下角；
用户滚轮进入下一 part 占位；
整体像一个高级、克制、有胶片呼吸感的个人摄影网站入口。
```

如果第一版已经能做到这点，再继续设计第二个 part。
