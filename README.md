# ICEY: Genesis & Meta / 艾希：旁白破防先行版

原创程序化美术、非官方粉丝致敬动作短篇。无外部资源、CDN、运行时依赖或后端。Canvas 2D / Web Audio / 可选 Web Speech。不是官方《ICEY》，不提供真实支票或支付功能。

## 运行与发布

直接打开 `index.html`，或在本目录运行 `python -m http.server 8080`，访问 http://localhost:8080 。所有资源采用相对路径，可部署到 GitHub Pages 任意子目录。发布入口就是本目录的 `index.html`，无需构建。

部署交接对象：专用 GitHub Pages 部署专员，目标账号 `yukikazechan`；本开发阶段没有创建仓库或执行发布，因此尚无线上 URL。

## 操作

- A D / 左右箭头：移动。
- W / 上箭头 / 空格：跳跃、二段跳。
- Shift：闪（短时无敌，残影）；S / 下箭头：翻滚。
- J：点按三连斩；K：短按挑空，长按至少 0.45 秒再松开重劈。
- L：范围感电终结，消耗 60 电荷；命中恢复电荷。
- E：终端/核心/纪念碑交互；Esc：暂停。
- 触屏：虚拟按键，多指移动+攻击，长按「重」蓄力；推荐横屏。
- 音效默认开启，语音默认关闭；点击语音按钮启用浏览器中文 TTS。无中文语音的设备仍可阅读字幕。

## 内容与彩蛋

约 5–10 分钟的单关短篇，含机械蜘蛛自爆、激光浮空机蓄能预警、暴食原型机双阶段震地攻击、解放核心结局和自由探索。打击顿帧、震屏、数字反馈、光刃粒子、银白发黑青战衣角色的程序化骨骼多姿态动画、分层雨夜废墟/全息标牌/雾气。

向左走会触发吐槽；左侧坠落三次解锁出生点隐藏终端（自动重构，不必重新开局），按 E 进入制作人房间，在纪念碑附近按 E 阅读，右侧终端按 E 返回。挂机 12 秒触发脱口秀。是否找到小黑屋决定核心结局文字，通关后可继续找秘密。众筹相关台词为戏仿。

## 验证

```
node --check engine.js
node --check game.js
node test-engine.cjs
python validate-browser.py
```

逻辑测试无依赖。浏览器验证脚本需要开发环境 Python Playwright + Chromium，不影响游戏运行。脚本自动启动本地临时端口 HTTP 服务，验证桌面与手机横竖屏，输出 `validation-browser.json` 及预览截图。

14 组逻辑场景覆盖所有已编写的剧情分支、动作、敌人预警、两种结局、死亡重构和十分钟随机模拟。这是确定性场景验证，不意味着所有设备/输入组合都 100% 无缺陷。

## 文件

- `index.html` / `style.css`：界面、菜单、HUD、触控。
- `engine.js`：独立可测试模拟，无 DOM。
- `game.js`：Canvas 绘制、输入、音频、旁白队列。
- `test-engine.cjs` / `validate-browser.py`：自动化验证。
- `validation-browser.json` / `validation-engine.txt` / `preview-*.png`：验证与交接产物。

仅发布游戏时可忽略测试脚本和预览图片。诊断入口 `window.iceyDebug` 供自动化检查使用，不持久化任何用户数据。
