// ============================================================
// example.js — HSPCB 轻插件示例
// 能力演示：① 订阅全局事件（连错 3 题给一句鼓励）② 注册仪表盘卡片
// ============================================================
if (window.HSPCBPlugin) {
    window.HSPCBPlugin.register({
        id: 'example',
        name: '示例插件',
        version: '1.0.0',
        apiVersion: '1.0.0',
        setup: function (ctx) {
            var wrongStreak = 0;
            if (ctx.bus) {
                ctx.bus.on('exam:answered', function (e) {
                    if (e && e.isCorrect === false) {
                        wrongStreak++;
                        if (wrongStreak >= 3) {
                            ctx.notify({
                                id: 'example.encourage',
                                level: 'info',
                                title: '别灰心',
                                message: '连续 3 题出错了。歇 30 秒，或先去错题本看看同类题。'
                            });
                            wrongStreak = 0;
                        }
                    } else {
                        wrongStreak = 0;
                    }
                });
            }
            if (ctx.widgets) {
                ctx.widgets.register({
                    id: 'example-quote',
                    name: '每日一句',
                    render: function (body) {
                        var quotes = ['慢慢来，比较快。', '错题是最好的老师。', '今天的积累，是考场的底气。', '先把会的做对，再攻不会的。'];
                        body.textContent = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
                    }
                });
            }
        }
    });
}
