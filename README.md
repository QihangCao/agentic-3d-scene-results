# Agentic 3D Scene Generation — result showcase

**Live site:** https://qihangcao.github.io/agentic-3d-scene-results/

静态、离线可打开的结果页，汇总两项任务：

1. 单张真实照片生成可编辑 Blender 场景，并与 GPT-5.6 baseline 做冻结协议比较。
2. 一段文本 brief 生成完整尺度场景，包括街区、专业后厨和住宅。

直接用浏览器打开 `index.html`。如果浏览器限制本地 MP4 播放，可在本目录运行：

```bash
python3 -m http.server 8000
```

然后访问 `http://127.0.0.1:8000/`。

页面只使用本地 HTML、CSS、JavaScript、WebP 与 MP4，不依赖外部 CDN。

## Evaluation image sources

The single-image evaluation examples use frames from these publicly released research datasets:

- [Mip-NeRF 360](https://jonbarron.info/mipnerf360/) — `room`
- [Deep Blending](https://www-sop.inria.fr/reves/publis/2018/HPPFDB18/datasets.html) — `playroom`
- [EyefulTower](https://github.com/facebookresearch/EyefulTower) — `apartment`

The reference frames remain attributable to their respective dataset authors. Generated renders,
evaluation text, and the website presentation are experimental outputs assembled for this report.
