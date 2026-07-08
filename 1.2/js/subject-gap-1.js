// 学科内容缺口补全 - 语文鉴赏+文言翻译+数学3D几何
// js/subject-gap-1.js
// ============================================================
// 模块1: poemAppreciation — 古诗文鉴赏交互器
// 容器: #poem-appreciation-app
// ============================================================
window.poemAppreciation = (function () {
    'use strict';
    var POEMS = [
        { id: 1, title: '静夜思', author: '李白', dynasty: '唐', type: '诗', theme: '思乡之情',
          fullText: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'],
          annotations: [
            { line: 0, appreciation: '"明月光"以白描写出月光的皎洁清冷，渲染静寂孤清的夜晚氛围，为下文思乡铺垫。', technique: '白描', mood: '月夜清冷' },
            { line: 1, appreciation: '"疑"字传达半梦半醒间的恍惚，将月光误作秋霜，突出夜之寒与心之孤。以霜喻月光新颖贴切。', technique: '比喻', mood: '清冷孤寂' },
            { line: 2, appreciation: '"举头"这一动作由静转动，仰望明月引发遐思，月亮成为连接游子与故乡的情感媒介。', technique: '动作描写', mood: '仰望思远' },
            { line: 3, appreciation: '"低头"与上句"举头"形成对举，一仰一俯间尽含思乡之苦，语尽而意无穷。', technique: '对比', mood: '思乡情切' }
          ],
          examPoints: '1. 理解"月"意象的思乡内涵；2. 赏析"疑"字的传神之妙；3. 体会"举头/低头"动作对比的表达效果；4. 把握全诗由景入情、情景交融的结构。',
          reciteKey: '易错字：疑（非"凝"）、霜（非"双"）、乡（非"相"）；"床前"非"窗前"。'
        },
        { id: 2, title: '登高', author: '杜甫', dynasty: '唐', type: '诗', theme: '悲秋伤老',
          fullText: ['风急天高猿啸哀，', '渚清沙白鸟飞回。', '无边落木萧萧下，', '不尽长江滚滚来。', '万里悲秋常作客，', '百年多病独登台。', '艰难苦恨繁霜鬓，', '潦倒新停浊酒杯。'],
          annotations: [
            { line: 0, appreciation: '"风急天高猿啸哀"三景并列，视听结合，一句三景，尽显夔州秋日萧瑟悲凉之态。', technique: '视听结合', mood: '萧瑟悲凉' },
            { line: 1, appreciation: '"清""白"色彩对照，"鸟飞回"暗喻诗人漂泊无依的处境，景中含情。', technique: '借景抒情', mood: '漂泊孤寂' },
            { line: 2, appreciation: '"无边""萧萧"写出落叶之多与秋声之悲，由仰视而俯瞰，气象宏阔中含无穷悲意。', technique: '夸张', mood: '肃杀萧条' },
            { line: 3, appreciation: '"不尽""滚滚"以长江永流象征时光流逝与愁绪不绝，景大而情悲。', technique: '象征', mood: '时光流逝' },
            { line: 4, appreciation: '"万里"言离家之远，"悲秋"点明时令，"常作客"道出漂泊之久，三层悲意层层叠加。', technique: '层层递进', mood: '漂泊悲秋' },
            { line: 5, appreciation: '"百年"犹言一生，"多病"写身体衰败，"独"字写尽孤苦无依之态。', technique: '炼字', mood: '孤独老病' },
            { line: 6, appreciation: '"艰难苦恨"直抒胸臆，"繁霜鬓"以白发之密写愁之深，国忧家愁身苦集于一身。', technique: '直抒胸臆', mood: '忧国伤身' },
            { line: 7, appreciation: '"新停浊酒杯"写因病戒酒，连消愁之酒亦不可得，悲上加悲，余味无穷。', technique: '细节描写', mood: '愁苦无奈' }
          ],
          examPoints: '1. 分析"萧萧""滚滚"叠词效果及音韵美；2. 理解颈联"万里""百年"时空对仗；3. 把握"悲秋"多层意蕴（漂泊、老病、国忧）；4. 颔联情景交融分析。',
          reciteKey: '易错字：渚（非"者"）、萧（非"潇"）、鬓（非"宾"）、潦（非"了"）；"作客"非"做客"。'
        },
        { id: 3, title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋', type: '词', theme: '咏史怀古',
          fullText: ['大江东去，浪淘尽，千古风流人物。', '故垒西边，人道是，三国周郎赤壁。', '乱石穿空，惊涛拍岸，卷起千堆雪。', '江山如画，一时多少豪杰。', '遥想公瑾当年，小乔初嫁了，雄姿英发。', '羽扇纶巾，谈笑间，樯橹灰飞烟灭。', '故国神游，多情应笑我，早生华发。', '人生如梦，一尊还酹江月。'],
          annotations: [
            { line: 0, appreciation: '"大江东去"气势磅礴，以江水东流喻时光流逝，"淘尽"暗含古今兴亡之叹，起笔笼罩全篇。', technique: '起兴', mood: '壮阔苍凉' },
            { line: 1, appreciation: '"人道是"表明非考据乃借地怀古，自然引出赤壁之战与周瑜，虚实结合。', technique: '虚实结合', mood: '怀古追思' },
            { line: 2, appreciation: '"穿""拍""卷"三个动词极雄劲，"千堆雪"以喻写浪花之白之猛，绘声绘色。', technique: '比喻·动词锤炼', mood: '惊涛雄奇' },
            { line: 3, appreciation: '"如画"总括江山之美，"多少豪杰"暗转下片怀人，承上启下。', technique: '过渡', mood: '豪情追慕' },
            { line: 4, appreciation: '"小乔初嫁"以美人衬英雄，"雄姿英发"写周瑜少年英气，与词人自身对照。', technique: '衬托', mood: '英雄风流' },
            { line: 5, appreciation: '"谈笑间"写周瑜从容不迫，"灰飞烟灭"写曹军覆灭之速，对比鲜明。', technique: '对比', mood: '从容破敌' },
            { line: 6, appreciation: '"多情应笑我"自嘲年华老去、功业未就，由怀古转入伤己，情感陡转。', technique: '自嘲', mood: '自伤迟暮' },
            { line: 7, appreciation: '"人生如梦"以旷达语作结，"一尊还酹江月"以酒祭月，将悲慨消解于自然。', technique: '以理遣情', mood: '旷达超脱' }
          ],
          examPoints: '1. 赏析"乱石穿空，惊涛拍岸，卷起千堆雪"炼字与意境；2. 分析周瑜形象与词人自我对照；3. 理解结尾"人生如梦"旷达与悲慨交织；4. 全词怀古伤今结构脉络。',
          reciteKey: '易错字：垒（非"磊"）、纶（非"伦"）、樯橹（非"强鲁"）、尊（通"樽"）、酹（非"酌"）。'
        },
        { id: 4, title: '声声慢', author: '李清照', dynasty: '宋', type: '词', theme: '愁情',
          fullText: ['寻寻觅觅，冷冷清清，凄凄惨惨戚戚。', '乍暖还寒时候，最难将息。', '三杯两盏淡酒，怎敌他、晚来风急？', '雁过也，正伤心，却是旧时相识。', '满地黄花堆积，憔悴损，如今有谁堪摘？', '守着窗儿，独自怎生得黑？', '梧桐更兼细雨，到黄昏、点点滴滴。', '这次第，怎一个愁字了得！'],
          annotations: [
            { line: 0, appreciation: '开篇十四叠字，由寻觅到冷清到凄惨，层层递进，声情婉转，创叠词运用之绝唱。', technique: '叠词', mood: '凄凉孤寂' },
            { line: 1, appreciation: '"乍暖还寒"写天气反复，"最难将息"写身体不适，以气候变化映衬心境不安。', technique: '借景抒情', mood: '不安难眠' },
            { line: 2, appreciation: '"淡酒"非酒淡乃愁浓，"怎敌他"写酒力不敌愁力，反衬愁之深重。', technique: '反衬', mood: '愁深酒薄' },
            { line: 3, appreciation: '"旧时相识"将雁拟人化，北雁南飞触发故国之思与亡夫之痛。', technique: '拟人·用典', mood: '物是人非' },
            { line: 4, appreciation: '"憔悴损"既写花亦写人，花人合一，"有谁堪摘"写出无人欣赏的孤独。', technique: '托物言志', mood: '花残人悴' },
            { line: 5, appreciation: '"怎生得黑"以口语入词，写度日如年、盼天黑又怕天黑的矛盾心理。', technique: '口语入词', mood: '度日如年' },
            { line: 6, appreciation: '"梧桐细雨"为古典愁景意象，"点点滴滴"声声敲心，听觉渲染愁绪绵绵不绝。', technique: '听觉描写', mood: '雨打愁心' },
            { line: 7, appreciation: '"怎一个愁字了得"以反问作结，言愁多非一字可尽，余味无穷。', technique: '反问收束', mood: '愁不可言' }
          ],
          examPoints: '1. 分析开篇十四叠词层次与音韵效果；2. 理解"淡酒""雁""梧桐细雨"意象愁情内涵；3. 赏析"怎一个愁字了得"收束艺术；4. 全词以愁贯串的结构。',
          reciteKey: '易错字：觅（非"密"）、戚（非"泣"）、盏（非"浅"）、梧桐（非"悟桐"）。'
        },
        { id: 5, title: '琵琶行', author: '白居易', dynasty: '唐', type: '诗', theme: '音乐描写',
          fullText: ['浔阳江头夜送客，枫叶荻花秋瑟瑟。', '主人下马客在船，举酒欲饮无管弦。', '醉不成欢惨将别，别时茫茫江浸月。', '忽闻水上琵琶声，主人忘归客不发。', '千呼万唤始出来，犹抱琵琶半遮面。', '大弦嘈嘈如急雨，小弦切切如私语。', '嘈嘈切切错杂弹，大珠小珠落玉盘。', '别有幽愁暗恨生，此时无声胜有声。'],
          annotations: [
            { line: 0, appreciation: '"枫叶荻花秋瑟瑟"以秋景渲染送别氛围，景中含情，为全诗奠定凄凉基调。', technique: '环境渲染', mood: '秋夜凄凉' },
            { line: 1, appreciation: '"无管弦"暗写乏乐之憾，为下文忽闻琵琶声作铺垫，欲扬先抑。', technique: '铺垫', mood: '无乐遗憾' },
            { line: 2, appreciation: '"茫茫江浸月"以江月之景写离别之愁，月浸江水似愁浸人心。', technique: '情景交融', mood: '愁别茫茫' },
            { line: 3, appreciation: '"忘归""不发"以主客反应侧面烘托琵琶声之动人，未见其人先闻其声。', technique: '侧面烘托', mood: '闻声忘归' },
            { line: 4, appreciation: '"始""犹"二字写出琵琶女迟疑羞涩之态，人物形象跃然纸上。', technique: '细节传神', mood: '迟疑羞涩' },
            { line: 5, appreciation: '"嘈嘈如急雨"写大弦沉雄急促，"切切如私语"写小弦细碎轻柔，比喻精妙。', technique: '比喻·对偶', mood: '声调多变' },
            { line: 6, appreciation: '"大珠小珠落玉盘"以视觉写听觉（通感），清脆圆润之声如在耳畔，千古名喻。', technique: '通感·比喻', mood: '清脆圆润' },
            { line: 7, appreciation: '"无声胜有声"写乐声间歇时的余韵，以静写动，揭示音乐感染力在于情感。', technique: '以静衬动', mood: '余韵幽恨' }
          ],
          examPoints: '1. 赏析"大弦嘈嘈如急雨"一组比喻的音乐描写艺术；2. 分析"此时无声胜有声"美学内涵；3. 理解"同是天涯沦落人"情感共鸣；4. 以声写情、声情并茂的写法。',
          reciteKey: '易错字：浔（非"寻"）、荻（非"笛"）、嘈（非"曹"）、弦（非"玄"）。'
        },
        { id: 6, title: '蜀道难', author: '李白', dynasty: '唐', type: '诗', theme: '山水雄奇',
          fullText: ['噫吁嚱，危乎高哉！', '蜀道之难，难于上青天！', '蚕丛及鱼凫，开国何茫然！', '尔来四万八千岁，不与秦塞通人烟。', '西当太白有鸟道，可以横绝峨眉巅。', '地崩山摧壮士死，然后天梯石栈相钩连。', '上有六龙回日之高标，下有冲波逆折之回川。', '黄鹤之飞尚不得过，猿猱欲度愁攀援。'],
          annotations: [
            { line: 0, appreciation: '"噫吁嚱"三个叹词连用，惊呼蜀道之险高，起笔突兀，气势惊人，奠定雄奇基调。', technique: '起兴·叹词', mood: '惊叹雄奇' },
            { line: 1, appreciation: '"难于上青天"以极度夸张比喻蜀道之难，为全诗主旨句，反复咏叹贯串全篇。', technique: '夸张', mood: '极言其难' },
            { line: 2, appreciation: '引蚕丛鱼凫古蜀王传说，"何茫然"写开国之久远渺茫，增添神秘色彩。', technique: '用典', mood: '远古渺茫' },
            { line: 3, appreciation: '"四万八千岁"极言时间之久，"不与秦塞通人烟"写蜀地之封闭，时空两方面写隔绝。', technique: '夸张', mood: '隔绝闭塞' },
            { line: 4, appreciation: '"鸟道"写仅鸟能飞越，"横绝"写横渡之险，以飞鸟之道反衬人之难行。', technique: '反衬', mood: '险绝难越' },
            { line: 5, appreciation: '用五丁开山神话，"地崩山摧"写开路之惨烈，"天梯石栈"写蜀道之险峻。', technique: '神话·对偶', mood: '壮烈险峻' },
            { line: 6, appreciation: '"上有""下有"上下对举，"六龙回日"写山之高连日神都要绕行，极尽夸张。', technique: '夸张·对偶', mood: '高峻险恶' },
            { line: 7, appreciation: '以黄鹤善飞、猿猱善攀皆不能过，反衬蜀道之险，层层烘托。', technique: '反衬·层递', mood: '飞禽愁度' }
          ],
          examPoints: '1. 分析"难于上青天"夸张手法及结构作用；2. 理解五丁开山等神话用意；3. 赏析"上有…下有…"对偶与夸张；4. 三次咏叹"蜀道之难"的结构。',
          reciteKey: '易错字：噫吁嚱（非"意虚戏"）、凫（非"复"）、峨眉（非"蛾眉"）、猿猱（非"猿柔"）。'
        },
        { id: 7, title: '锦瑟', author: '李商隐', dynasty: '唐', type: '诗', theme: '意象朦胧',
          fullText: ['锦瑟无端五十弦，', '一弦一柱思华年。', '庄生晓梦迷蝴蝶，', '望帝春心托杜鹃。', '沧海月明珠有泪，', '蓝田日暖玉生烟。', '此情可待成追忆，', '只是当时已惘然。'],
          annotations: [
            { line: 0, appreciation: '"无端"写出莫名怅惘，"五十弦"借古瑟弦多喻人生经历之丰富，起笔朦胧。', technique: '起兴', mood: '怅惘朦胧' },
            { line: 1, appreciation: '"一弦一柱"写出追忆之细密，"思华年"点明全诗主旨——对往昔年华的追忆。', technique: '点题', mood: '追忆华年' },
            { line: 2, appreciation: '用庄周梦蝶典故，"迷"字写出人生如梦、物我两忘的恍惚迷惘，意象朦胧唯美。', technique: '用典', mood: '如梦迷惘' },
            { line: 3, appreciation: '用望帝化鹃典故，"托"字写出一腔痴情寄托于悲鸟，含凄婉哀怨。', technique: '用典', mood: '凄怨哀托' },
            { line: 4, appreciation: '"沧海月明"与"珠有泪"组合，月圆珠莹却含泪，极写哀婉之美，意象瑰丽凄迷。', technique: '意象组合', mood: '珠泪凄美' },
            { line: 5, appreciation: '"日暖玉生烟"写可望而不可即之美，似有若无，极为朦胧，与前句对仗精工。', technique: '对偶·象征', mood: '可望难即' },
            { line: 6, appreciation: '"可待"即"岂待"，意为并非等到如今追忆时才感惘然，反问加深情感。', technique: '反问', mood: '追思难已' },
            { line: 7, appreciation: '"当时已惘然"写身在局中已感迷惘，何况今日追忆，以惘然作结余味不尽。', technique: '以情结景', mood: '当时惘然' }
          ],
          examPoints: '1. 分析四个典故（庄周梦蝶、望帝化鹃、沧海珠泪、蓝田玉烟）象征意蕴；2. 理解"此情可待成追忆"哲学意味；3. 全诗朦胧多义艺术特色；4. 中间两联对偶与意象瑰丽。',
          reciteKey: '易错字：瑟（非"瑟"）、弦（非"玄"）、杜鹃（非"杜娟"）、惘（非"枉"）。'
        },
        { id: 8, title: '永遇乐·京口北固亭怀古', author: '辛弃疾', dynasty: '宋', type: '词', theme: '用典',
          fullText: ['千古江山，英雄无觅，孙仲谋处。', '舞榭歌台，风流总被，雨打风吹去。', '斜阳草树，寻常巷陌，人道寄奴曾住。', '想当年，金戈铁马，气吞万里如虎。', '元嘉草草，封狼居胥，赢得仓皇北顾。', '四十三年，望中犹记，烽火扬州路。', '可堪回首，佛狸祠下，一片神鸦社鼓。', '凭谁问：廉颇老矣，尚能饭否？'],
          annotations: [
            { line: 0, appreciation: '"千古江山"起笔雄阔，"无觅"写英雄不再，借孙权典故暗讽南宋无人。', technique: '用典·借古讽今', mood: '英雄不再' },
            { line: 1, appreciation: '"舞榭歌台"代指繁华，"雨打风吹"喻时光摧毁一切，慨叹风流不存。', technique: '借喻', mood: '繁华消逝' },
            { line: 2, appreciation: '引刘裕（小字寄奴）典故，"寻常巷陌"与英雄出身对比，追慕平民英雄。', technique: '用典·对比', mood: '追慕英雄' },
            { line: 3, appreciation: '"金戈铁马"写刘裕北伐军威之盛，"气吞万里如虎"极写英雄气概，以古励今。', technique: '夸张·用典', mood: '气吞山河' },
            { line: 4, appreciation: '引刘义隆（年号元嘉）北伐失败典故，"草草"写准备仓促，借古警今。', technique: '用典·借古警今', mood: '殷鉴不远' },
            { line: 5, appreciation: '"四十三年"写实，回忆当年南归时扬州路上战火，今昔对比感慨万千。', technique: '今昔对比', mood: '追忆烽火' },
            { line: 6, appreciation: '引拓跋焘（小字佛狸）典故，"神鸦社鼓"写异族祠庙香火旺盛，暗讽百姓忘却国耻。', technique: '用典·暗讽', mood: '痛心遗忘' },
            { line: 7, appreciation: '以廉颇自比，"老矣"写年迈，"尚能饭否"写报国之心不老，以问作结悲壮苍凉。', technique: '用典·自比', mood: '壮心不已' }
          ],
          examPoints: '1. 梳理全词五个典故（孙权、刘裕、刘义隆、拓跋焘、廉颇）及用意；2. "借古讽今"手法及对南宋朝政批判；3. 结尾以廉颇自比深意；4. 刘裕之胜与刘义隆之败对照。',
          reciteKey: '易错字：胥（非"婿"）、仓皇（非"仓惶"）、佛狸（非"佛理"）、廉颇（非"兼颇"）。'
        }
    ];
    var state = { currentId: 1, selectedLine: -1, search: '' };
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function getPoem(id) { for (var i = 0; i < POEMS.length; i++) { if (POEMS[i].id === id) return POEMS[i]; } return POEMS[0]; }
    function getMoodSvg(poemId) {
        var map = {
            1: ['night', '#0c1e3e', '#1a3a5c'],
            2: ['autumn', '#3f3f5e', '#6b8caf'],
            3: ['river', '#1e3a5f', '#60a5fa'],
            4: ['rain', '#3b3b4e', '#8a8aa0'],
            5: ['boat', '#1a2a3e', '#4a7a9a'],
            6: ['mountain', '#2d1e3e', '#7a5c3e'],
            7: ['dream', '#1e1e3a', '#c4b5e0'],
            8: ['pavilion', '#3e2a1e', '#8b6f47']
        };
        var info = map[poemId] || map[1];
        var svg = '<svg viewBox="0 0 280 200" style="width:100%;max-width:280px;height:auto;">';
        svg += '<rect width="280" height="200" fill="' + info[1] + '"/>';
        if (poemId === 1) {
            svg += '<circle cx="210" cy="45" r="28" fill="#fef3c7" opacity="0.95"/>';
            svg += '<circle cx="200" cy="40" r="28" fill="' + info[1] + '"/>';
            svg += '<rect x="0" y="150" width="280" height="50" fill="#1a3a5c"/>';
            svg += '<rect x="40" y="130" width="60" height="20" fill="#162d4a"/>';
            svg += '<line x1="0" y1="155" x2="280" y2="155" stroke="#fef3c7" stroke-width="0.5" opacity="0.3"/>';
            svg += '<line x1="0" y1="168" x2="280" y2="168" stroke="#fef3c7" stroke-width="0.5" opacity="0.2"/>';
        } else if (poemId === 2) {
            svg += '<polygon points="0,120 60,40 120,120" fill="#5a4a3a" stroke="#8b7355" stroke-width="1"/>';
            svg += '<polygon points="100,120 180,30 260,120" fill="#6b5a48" stroke="#8b7355" stroke-width="1"/>';
            svg += '<path d="M0,130 Q70,125 140,130 T280,130" fill="none" stroke="' + info[2] + '" stroke-width="2"/>';
            svg += '<path d="M0,150 Q70,145 140,150 T280,150" fill="none" stroke="' + info[2] + '" stroke-width="1.5" opacity="0.7"/>';
            svg += '<path d="M0,170 Q70,165 140,170 T280,170" fill="none" stroke="' + info[2] + '" stroke-width="1" opacity="0.5"/>';
            svg += '<text x="50" y="75" fill="#d4a373" font-size="14">~</text>';
            svg += '<text x="160" y="65" fill="#d4a373" font-size="12">~</text>';
        } else if (poemId === 3) {
            svg += '<polygon points="0,100 50,20 100,100" fill="#3d2b1f" stroke="#7a5c3e" stroke-width="1.5"/>';
            svg += '<polygon points="180,100 240,20 280,100" fill="#3d2b1f" stroke="#7a5c3e" stroke-width="1.5"/>';
            svg += '<path d="M0,105 Q35,95 70,105 T140,105 T210,105 T280,105" fill="none" stroke="' + info[2] + '" stroke-width="2.5"/>';
            svg += '<path d="M0,130 Q35,120 70,130 T140,130 T210,130 T280,130" fill="none" stroke="' + info[2] + '" stroke-width="2" opacity="0.8"/>';
            svg += '<path d="M0,160 Q35,150 70,160 T140,160 T210,160 T280,160" fill="none" stroke="' + info[2] + '" stroke-width="1.5" opacity="0.6"/>';
        } else if (poemId === 4) {
            svg += '<rect x="60" y="40" width="160" height="120" fill="none" stroke="' + info[2] + '" stroke-width="2"/>';
            svg += '<line x1="140" y1="40" x2="140" y2="160" stroke="' + info[2] + '" stroke-width="1.5"/>';
            svg += '<line x1="60" y1="100" x2="220" y2="100" stroke="' + info[2] + '" stroke-width="1.5"/>';
            svg += '<line x1="80" y1="30" x2="80" y2="55" stroke="#a0a0c0" stroke-width="1"/>';
            svg += '<line x1="120" y1="25" x2="120" y2="50" stroke="#a0a0c0" stroke-width="1"/>';
            svg += '<line x1="180" y1="28" x2="180" y2="53" stroke="#a0a0c0" stroke-width="1"/>';
            svg += '<circle cx="100" cy="130" r="4" fill="#d4a373" opacity="0.6"/>';
            svg += '<circle cx="170" cy="140" r="3" fill="#d4a373" opacity="0.5"/>';
        } else if (poemId === 5) {
            svg += '<circle cx="60" cy="35" r="20" fill="#fef3c7" opacity="0.8"/>';
            svg += '<path d="M0,130 Q70,125 140,130 T280,130" fill="none" stroke="' + info[2] + '" stroke-width="2"/>';
            svg += '<path d="M0,155 Q70,150 140,155 T280,155" fill="none" stroke="' + info[2] + '" stroke-width="1.5" opacity="0.7"/>';
            svg += '<path d="M100,130 L100,100 L140,90 L180,100 L180,130 Z" fill="#6b4e35" stroke="#8b6f47" stroke-width="1"/>';
            svg += '<line x1="140" y1="90" x2="140" y2="130" stroke="#8b6f47" stroke-width="1"/>';
        } else if (poemId === 6) {
            svg += '<polygon points="0,150 40,50 80,100 100,30 140,90 160,20 200,85 240,40 280,150" fill="#4a3a2a" stroke="#7a5c3e" stroke-width="1.5"/>';
            svg += '<path d="M20,150 Q60,140 90,155 Q120,165 150,150 Q180,140 210,155 Q240,165 270,150" fill="none" stroke="#a08060" stroke-width="1.5" stroke-dasharray="3,2"/>';
        } else if (poemId === 7) {
            svg += '<circle cx="140" cy="50" r="22" fill="#a0c4e8" opacity="0.7"/>';
            svg += '<path d="M100,110 Q110,95 120,110 Q130,95 140,110 Q150,95 160,110 Q170,95 180,110" fill="none" stroke="' + info[2] + '" stroke-width="2"/>';
            svg += '<ellipse cx="120" cy="110" rx="10" ry="6" fill="' + info[2] + '" opacity="0.6"/>';
            svg += '<ellipse cx="160" cy="110" rx="10" ry="6" fill="' + info[2] + '" opacity="0.6"/>';
            svg += '<line x1="120" y1="110" x2="160" y2="110" stroke="' + info[2] + '" stroke-width="1.5"/>';
            svg += '<circle cx="60" cy="140" r="6" fill="#60a5fa" opacity="0.5"/>';
            svg += '<circle cx="220" cy="140" r="5" fill="#60a5fa" opacity="0.4"/>';
        } else if (poemId === 8) {
            svg += '<circle cx="230" cy="40" r="18" fill="#f59e0b" opacity="0.7"/>';
            svg += '<rect x="80" y="60" width="120" height="80" fill="#6b4e35" stroke="#8b6f47" stroke-width="1.5"/>';
            svg += '<polygon points="70,60 210,60 140,20" fill="#5a3e25" stroke="#8b6f47" stroke-width="1.5"/>';
            svg += '<rect x="100" y="80" width="25" height="40" fill="#3d2b1f"/>';
            svg += '<rect x="155" y="80" width="25" height="40" fill="#3d2b1f"/>';
            svg += '<line x1="80" y1="140" x2="200" y2="140" stroke="#8b6f47" stroke-width="2"/>';
        }
        var moodText = '';
        var p = getPoem(poemId);
        if (state.selectedLine >= 0 && p.annotations[state.selectedLine]) {
            moodText = p.annotations[state.selectedLine].mood;
        } else {
            moodText = p.theme;
        }
        svg += '<text x="140" y="192" fill="#94a3b8" font-size="11" text-anchor="middle">' + esc(moodText) + '</text>';
        svg += '</svg>';
        return svg;
    }
    function renderPoemList() {
        var el = document.getElementById('pa-poem-list');
        if (!el) return;
        var kw = state.search.toLowerCase();
        var html = '';
        for (var i = 0; i < POEMS.length; i++) {
            var p = POEMS[i];
            if (kw && p.title.toLowerCase().indexOf(kw) === -1 && p.author.toLowerCase().indexOf(kw) === -1 &&
                p.dynasty.toLowerCase().indexOf(kw) === -1 && p.theme.toLowerCase().indexOf(kw) === -1) continue;
            var active = p.id === state.currentId;
            html += '<div data-pid="' + p.id + '" style="padding:10px 12px;cursor:pointer;border-left:3px solid ' +
                (active ? '#3b82f6' : 'transparent') + ';background:' + (active ? '#eff6ff' : 'transparent') +
                ';border-radius:0 6px 6px 0;margin-bottom:2px;">' +
                '<div style="font-size:14px;font-weight:600;color:#1e293b;">' + esc(p.title) + '</div>' +
                '<div style="font-size:11px;color:#64748b;margin-top:2px;">[' + esc(p.dynasty) + '] ' + esc(p.author) + ' · ' + esc(p.theme) + '</div></div>';
        }
        if (!html) html = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">无匹配结果</div>';
        el.innerHTML = html;
        var items = el.getElementsByTagName('div');
        for (var j = 0; j < items.length; j++) {
            if (items[j].getAttribute('data-pid')) {
                items[j].onclick = function () {
                    var pid = parseInt(this.getAttribute('data-pid'), 10);
                    state.currentId = pid;
                    state.selectedLine = -1;
                    renderPoemList();
                    renderPoemText();
                    renderAnalysis();
                    renderSvgPanel();
                    renderFooter();
                };
            }
        }
    }
    function renderPoemText() {
        var el = document.getElementById('pa-poem-text');
        if (!el) return;
        var p = getPoem(state.currentId);
        var html = '<div style="text-align:center;margin-bottom:8px;"><span style="font-size:18px;font-weight:700;color:#1e293b;">' + esc(p.title) + '</span>' +
            '<span style="font-size:12px;color:#64748b;margin-left:8px;">[' + esc(p.dynasty) + '] ' + esc(p.author) + ' · ' + esc(p.type) + '</span></div>';
        for (var i = 0; i < p.fullText.length; i++) {
            var active = i === state.selectedLine;
            html += '<div data-line="' + i + '" style="padding:8px 12px;margin:3px 0;cursor:pointer;border-radius:6px;font-size:16px;line-height:1.8;text-align:center;' +
                (active ? 'background:#dbeafe;color:#1e40af;font-weight:600;' : 'background:#f8fafc;color:#334155;') +
                '" onmouseover="if(!this.dataset.sel)this.style.background=\'#e0e7ff\'" onmouseout="if(!this.dataset.sel)this.style.background=\'' + (active ? '#dbeafe' : '#f8fafc') + '\'">' +
                esc(p.fullText[i]) + '</div>';
        }
        html += '<div style="font-size:11px;color:#94a3b8;text-align:center;margin-top:6px;">点击任意诗句查看赏析</div>';
        el.innerHTML = html;
        var lines = el.getElementsByTagName('div');
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].getAttribute('data-line') !== null) {
                lines[j].onclick = function () {
                    var idx = parseInt(this.getAttribute('data-line'), 10);
                    state.selectedLine = idx;
                    renderPoemText();
                    renderAnalysis();
                    renderSvgPanel();
                };
            }
        }
    }
    function renderAnalysis() {
        var el = document.getElementById('pa-analysis');
        if (!el) return;
        var p = getPoem(state.currentId);
        if (state.selectedLine < 0) {
            el.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">↑ 点击上方任意诗句查看逐句赏析</div>';
            return;
        }
        var ann = p.annotations[state.selectedLine];
        if (!ann) { el.innerHTML = ''; return; }
        el.innerHTML =
            '<div style="padding:14px 16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">' +
            '<div style="font-size:14px;color:#1e40af;font-weight:600;margin-bottom:8px;">' + esc(p.fullText[state.selectedLine]) + '</div>' +
            '<div style="font-size:13px;color:#334155;line-height:1.7;margin-bottom:10px;">' + esc(ann.appreciation) + '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<span style="display:inline-block;padding:3px 10px;background:#dbeafe;color:#1e40af;border-radius:12px;font-size:11px;font-weight:600;">手法：' + esc(ann.technique) + '</span>' +
            '<span style="display:inline-block;padding:3px 10px;background:#fce7f3;color:#9f1239;border-radius:12px;font-size:11px;font-weight:600;">意境：' + esc(ann.mood) + '</span>' +
            '</div></div>';
    }
    function renderSvgPanel() {
        var el = document.getElementById('pa-svg');
        if (!el) return;
        el.innerHTML = getMoodSvg(state.currentId);
    }
    function renderFooter() {
        var el = document.getElementById('pa-footer');
        if (!el) return;
        var p = getPoem(state.currentId);
        el.innerHTML =
            '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<div style="flex:1;min-width:280px;padding:12px 14px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">' +
            '<div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:4px;">高考考点</div>' +
            '<div style="font-size:12px;color:#78350f;line-height:1.6;">' + esc(p.examPoints) + '</div></div>' +
            '<div style="flex:1;min-width:280px;padding:12px 14px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">' +
            '<div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:4px;">默写易错字</div>' +
            '<div style="font-size:12px;color:#7f1d1d;line-height:1.6;">' + esc(p.reciteKey) + '</div></div></div>';
    }
    function render() {
        var c = document.getElementById('poem-appreciation-app');
        if (!c) return;
        c.innerHTML =
            '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<div style="width:220px;flex-shrink:0;">' +
            '<input id="pa-search" type="text" placeholder="搜索诗题/作者/主题..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;margin-bottom:8px;box-sizing:border-box;" />' +
            '<div id="pa-poem-list" style="max-height:560px;overflow-y:auto;"></div></div>' +
            '<div style="flex:1;min-width:300px;display:flex;flex-direction:column;gap:12px;">' +
            '<div id="pa-poem-text" style="padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;"></div>' +
            '<div id="pa-analysis" style="min-height:80px;"></div></div>' +
            '<div style="width:300px;flex-shrink:0;">' +
            '<div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">意境图</div>' +
            '<div id="pa-svg" style="padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;text-align:center;"></div></div>' +
            '</div>' +
            '<div id="pa-footer" style="margin-top:12px;"></div>';
        renderPoemList();
        renderPoemText();
        renderAnalysis();
        renderSvgPanel();
        renderFooter();
        var search = document.getElementById('pa-search');
        if (search) {
            search.oninput = function () {
                state.search = this.value;
                renderPoemList();
            };
        }
    }
    return { render: render };
})();
// ============================================================
// 模块2: classicalTranslation — 文言文翻译对照器
// 容器: #classical-translation-app
// ============================================================
window.classicalTranslation = (function () {
    'use strict';
    var PASSAGES = [
        { id: 1, title: '劝学', source: '《荀子》',
          original: ['君子曰：学不可以已。', '青，取之于蓝，而青于蓝；', '冰，水为之，而寒于水。', '木直中绳，輮以为轮，其曲中规。', '虽有槁暴，不复挺者，輮使之然也。', '故木受绳则直，金就砺则利，', '君子博学而日参省乎己，则知明而行无过矣。'],
          translation: ['君子说：学习是不可以停止的。', '靛青，从蓝草中取得，却比蓝草颜色更深；', '冰，是水凝结而成的，却比水寒冷。', '木材笔直得合乎墨线，把它弯曲做成车轮，它的弯度合乎圆规。', '即使又晒干了，也不再挺直的原因，是弯曲使它这样。', '所以木材经墨线量过就笔直，金属刀具在磨刀石上磨过就锋利，', '君子广泛地学习而且每天检验反省自己，就智慧明达而且行为没有过错了。'],
          annotations: [
            { word: '已', meaning: '停止', sentenceIndex: 0 },
            { word: '取之于蓝', meaning: '从蓝草中提取（之于：介词，从）', sentenceIndex: 1 },
            { word: '青于蓝', meaning: '比蓝草（颜色）更深（于：介词，比）', sentenceIndex: 1 },
            { word: '中绳', meaning: '合乎墨线（中：合乎，动词）', sentenceIndex: 3 },
            { word: '輮', meaning: '通"煣"，用火烤木使之弯曲', sentenceIndex: 3 },
            { word: '槁暴', meaning: '槁：枯干；暴：通"曝"，晒', sentenceIndex: 4 },
            { word: '受绳', meaning: '经墨线量过', sentenceIndex: 5 },
            { word: '就砺', meaning: '放到磨刀石上磨（就：接近、靠近）', sentenceIndex: 5 },
            { word: '参省', meaning: '参：检验；省：反省', sentenceIndex: 6 },
            { word: '知明', meaning: '知：通"智"，智慧明达', sentenceIndex: 6 }
          ],
          keyGrammar: [
            { pattern: '词类活用（名词作状语）', explanation: '"日"作状语，意为"每天"', example: '君子博学而日参省乎己' },
            { pattern: '特殊句式（介词结构后置）', explanation: '状语后置句，"于蓝"后置于"取之"之后', example: '取之于蓝（于蓝取之）' },
            { pattern: '通假字', explanation: '輮通煣，暴通曝，知通智', example: '虽有槁暴 / 则知明而行无过矣' }
          ]
        },
        { id: 2, title: '师说', source: '《韩昌黎文集》',
          original: ['古之学者必有师。', '师者，所以传道受业解惑也。', '人非生而知之者，孰能无惑？', '惑而不从师，其为惑也，终不解矣。', '生乎吾前，其闻道也固先乎吾，吾从而师之；', '生乎吾后，其闻道也亦先乎吾，吾从而师之。', '吾师道也，夫庸知其年之先后生于吾乎？', '是故无贵无贱，无长无少，道之所存，师之所存也。'],
          translation: ['古代求学的人一定有老师。', '老师，是用来传授道理、教授学业、解答疑难问题的。', '人不是生下来就懂得道理的，谁能没有疑惑？', '有了疑惑却不跟从老师学习，那些成为疑难的问题，就始终不能解决了。', '出生在我之前的人，他懂得道理本来就比我早，我跟从他拜他为师；', '出生在我之后的人，如果他懂得道理也比我早，我也跟从他拜他为师。', '我是学习道理啊，哪管他的生年比我早还是比我晚呢？', '因此无论地位高低、无论年纪大小，道理存在的地方，就是老师存在的地方。'],
          annotations: [
            { word: '学者', meaning: '求学的人（古今异义）', sentenceIndex: 0 },
            { word: '所以', meaning: '用来……的（古今异义）', sentenceIndex: 1 },
            { word: '受', meaning: '通"授"，传授', sentenceIndex: 1 },
            { word: '生而知之', meaning: '生下来就懂得（知：懂得）', sentenceIndex: 2 },
            { word: '从而师之', meaning: '跟从他并以他为师（师：意动用法，以…为师）', sentenceIndex: 4 },
            { word: '庸知', meaning: '岂管、哪管（庸：岂，哪）', sentenceIndex: 6 },
            { word: '无贵无贱', meaning: '无论地位高无论地位低（无：无论）', sentenceIndex: 7 }
          ],
          keyGrammar: [
            { pattern: '意动用法', explanation: '名词作意动，"以…为师"', example: '吾从而师之（以之为师）' },
            { pattern: '判断句', explanation: '"…者，…也"表判断', example: '师者，所以传道受业解惑也' },
            { pattern: '通假字', explanation: '受通授', example: '传道受业解惑' }
          ]
        },
        { id: 3, title: '赤壁赋', source: '《苏轼文集》',
          original: ['壬戌之秋，七月既望，', '苏子与客泛舟游于赤壁之下。', '清风徐来，水波不兴。', '举酒属客，诵明月之诗，歌窈窕之章。', '少焉，月出于东山之上，徘徊于斗牛之间。', '白露横江，水光接天。', '纵一苇之所如，凌万顷之茫然。', '浩浩乎如冯虚御风，而不知其所止；', '飘飘乎如遗世独立，羽化而登仙。'],
          translation: ['壬戌年的秋天，七月十六日，', '苏子与客在赤壁之下泛舟游览。', '清风缓缓吹来，江面水波不起。', '举起酒杯劝客人饮酒，朗诵明月的诗句，吟唱窈窕的篇章。', '不一会儿，月亮从东山上升起，在斗宿和牛宿之间徘徊。', '白露弥漫江面，水光与天相接。', '任凭小船漂去，越过万顷茫茫的江面。', '浩浩荡荡如同凌空驾风，却不知道它停在哪里；', '飘飘摇摇如同脱离尘世而独立，羽化成仙飞升天界。'],
          annotations: [
            { word: '既望', meaning: '十六日（望：农历十五日）', sentenceIndex: 0 },
            { word: '泛舟', meaning: '乘船漂浮（泛：漂浮）', sentenceIndex: 1 },
            { word: '属客', meaning: '劝客人饮酒（属：通"嘱"，劝酒）', sentenceIndex: 3 },
            { word: '少焉', meaning: '不一会儿', sentenceIndex: 4 },
            { word: '斗牛', meaning: '斗宿和牛宿，星宿名', sentenceIndex: 4 },
            { word: '一苇', meaning: '比喻极小的船', sentenceIndex: 6 },
            { word: '冯虚', meaning: '凌空（冯：通"凭"，乘；虚：太空）', sentenceIndex: 7 },
            { word: '羽化', meaning: '传说成仙的人能飞升，如生羽翼', sentenceIndex: 8 }
          ],
          keyGrammar: [
            { pattern: '介词结构后置', explanation: '状语后置，"于赤壁之下"后置', example: '游于赤壁之下（于赤壁之下游）' },
            { pattern: '通假字', explanation: '属通嘱，冯通凭', example: '举酒属客 / 冯虚御风' },
            { pattern: '词类活用（名词作动词）', explanation: '"歌"作动词，吟唱', example: '歌窈窕之章' }
          ]
        },
        { id: 4, title: '逍遥游', source: '《庄子》',
          original: ['北冥有鱼，其名为鲲。', '鲲之大，不知其几千里也；', '化而为鸟，其名为鹏。', '鹏之背，不知其几千里也；', '怒而飞，其翼若垂天之云。', '是鸟也，海运则将徙于南冥。', '南冥者，天池也。'],
          translation: ['北海有一条鱼，它的名字叫鲲。', '鲲的巨大，不知道有几千里；', '变化成为鸟，它的名字叫鹏。', '鹏的脊背，不知道有几千里；', '奋起飞翔，它的翅膀就像垂挂在天边的云。', '这只鸟，海动风起时就将迁往南海。', '南海，是天然的水池。'],
          annotations: [
            { word: '北冥', meaning: '北海（冥：通"溟"，海）', sentenceIndex: 0 },
            { word: '鲲', meaning: '传说中的大鱼名', sentenceIndex: 0 },
            { word: '怒而飞', meaning: '奋起飞翔（怒：奋发，振奋）', sentenceIndex: 4 },
            { word: '垂天', meaning: '天边，悬挂在天空', sentenceIndex: 4 },
            { word: '海运', meaning: '海动，海风起（古今异义）', sentenceIndex: 5 },
            { word: '徙', meaning: '迁移', sentenceIndex: 5 },
            { word: '天池', meaning: '天然的水池', sentenceIndex: 6 }
          ],
          keyGrammar: [
            { pattern: '通假字', explanation: '冥通溟，海的意思', example: '北冥有鱼（北溟有鱼）' },
            { pattern: '判断句', explanation: '"…者，…也"表判断', example: '南冥者，天池也' },
            { pattern: '词类活用（形容词作名词）', explanation: '"大"作名词，指巨大的体形', example: '鲲之大（鲲的巨大）' }
          ]
        },
        { id: 5, title: '岳阳楼记', source: '《范文正公集》',
          original: ['庆历四年春，滕子京谪守巴陵郡。', '越明年，政通人和，百废具兴。', '乃重修岳阳楼，增其旧制，刻唐贤今人诗赋于其上，', '属予作文以记之。', '予观夫巴陵胜状，在洞庭一湖。', '衔远山，吞长江，浩浩汤汤，横无际涯；', '朝晖夕阴，气象万千。', '此则岳阳楼之大观也，前人之述备矣。'],
          translation: ['庆历四年春天，滕子京被贬为巴陵郡太守。', '到了第二年，政事顺利，百姓和乐，各种荒废的事业都兴办起来了。', '于是重新修建岳阳楼，扩大它原有的规模，把唐代名家和今人的诗赋刻在上面，', '嘱托我写一篇文章来记述这件事。', '我看那巴陵郡的美景，全在洞庭一湖。', '它含着远处的山，吞着长江的水，浩浩荡荡，宽阔无边；', '早晨阳光明媚，傍晚天色阴沉，气象千变万化。', '这就是岳阳楼的壮丽景象，前人的记述已经很详尽了。'],
          annotations: [
            { word: '谪守', meaning: '因罪贬官到外地任职（谪：贬官）', sentenceIndex: 0 },
            { word: '越明年', meaning: '到了第二年（越：到，及）', sentenceIndex: 1 },
            { word: '具兴', meaning: '都兴办（具：通"俱"，全，都）', sentenceIndex: 1 },
            { word: '属予', meaning: '嘱托我（属：通"嘱"，嘱托）', sentenceIndex: 3 },
            { word: '胜状', meaning: '美好的景色（胜：美好的）', sentenceIndex: 4 },
            { word: '衔', meaning: '包含（动词，拟人手法）', sentenceIndex: 5 },
            { word: '横无际涯', meaning: '宽阔无边（际涯：边缘）', sentenceIndex: 5 },
            { word: '大观', meaning: '壮丽的景象（观：景象）', sentenceIndex: 7 }
          ],
          keyGrammar: [
            { pattern: '通假字', explanation: '具通俱，属通嘱', example: '百废具兴 / 属予作文以记之' },
            { pattern: '被动句', explanation: '"谪"表被动', example: '滕子京谪守巴陵郡（被贬）' },
            { pattern: '省略句', explanation: '省略介词宾语', example: '刻唐贤今人诗赋于其上（省"之"）' }
          ]
        },
        { id: 6, title: '鸿门宴', source: '《史记·项羽本纪》',
          original: ['沛公军霸上，未得与项羽相见。', '沛公左司马曹无伤使人言于项羽曰：', '沛公欲王关中，使子婴为相，珍宝尽有之。', '项羽大怒曰：旦日飨士卒，为击破沛公军！', '当是时，项羽兵四十万，在新丰鸿门；', '沛公兵十万，在霸上。', '范增说项羽曰：沛公居山东时，贪于财货，好美姬。', '今入关，财物无所取，妇女无所幸，此其志不在小。'],
          translation: ['沛公驻军在霸上，没能和项羽相见。', '沛公的左司马曹无伤派人对项羽说：', '沛公想要在关中称王，让子婴做丞相，珍宝全部占有。', '项羽大怒说：明天犒劳士兵，给我击败沛公的军队！', '在这时，项羽军队四十万，驻在新丰鸿门；', '沛公军队十万，驻在霸上。', '范增劝项羽说：沛公在山东时，贪图财物，喜爱美女。', '如今入关后，财物没有拿取，妇女没有宠幸，这说明他的志向不在小处。'],
          annotations: [
            { word: '军霸上', meaning: '驻军在霸上（军：名词作动词，驻军）', sentenceIndex: 0 },
            { word: '言于项羽', meaning: '对项羽说（于：对）', sentenceIndex: 1 },
            { word: '王关中', meaning: '在关中称王（王：名词作动词，称王）', sentenceIndex: 2 },
            { word: '旦日', meaning: '明天', sentenceIndex: 3 },
            { word: '飨', meaning: '犒劳（用酒食款待）', sentenceIndex: 3 },
            { word: '说', meaning: '劝说（shuì）', sentenceIndex: 6 },
            { word: '山东', meaning: '崤山以东（古今异义）', sentenceIndex: 6 },
            { word: '幸', meaning: '宠幸，宠爱', sentenceIndex: 7 }
          ],
          keyGrammar: [
            { pattern: '词类活用（名词作动词）', explanation: '"军"作动词驻军，"王"作动词称王', example: '沛公军霸上 / 欲王关中' },
            { pattern: '介词结构后置', explanation: '状语后置', example: '言于项羽曰（于项羽言曰）' },
            { pattern: '古今异义', explanation: '"山东"古义为崤山以东，今义为省份名', example: '沛公居山东时' }
          ]
        }
    ];
    var state = { currentId: 1, mode: 'compare' };
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function getPassage(id) { for (var i = 0; i < PASSAGES.length; i++) { if (PASSAGES[i].id === id) return PASSAGES[i]; } return PASSAGES[0]; }
    function buildAnnotatedHTML(sentence, annotations, sIdx) {
        var marks = [];
        for (var i = 0; i < annotations.length; i++) {
            if (annotations[i].sentenceIndex !== sIdx) continue;
            var word = annotations[i].word;
            var pos = sentence.indexOf(word);
            if (pos === -1) continue;
            marks.push({ start: pos, end: pos + word.length, idx: i });
        }
        marks.sort(function (a, b) { return a.start - b.start; });
        var clean = [];
        var lastEnd = 0;
        for (var j = 0; j < marks.length; j++) {
            if (marks[j].start >= lastEnd) { clean.push(marks[j]); lastEnd = marks[j].end; }
        }
        var html = '';
        var cur = 0;
        for (var k = 0; k < clean.length; k++) {
            html += esc(sentence.substring(cur, clean[k].start));
            html += '<span data-ann="' + clean[k].idx + '" style="color:#2563eb;border-bottom:1px dashed #2563eb;cursor:pointer;background:rgba(37,99,235,0.05);border-radius:2px;padding:0 1px;">' + esc(sentence.substring(clean[k].start, clean[k].end)) + '</span>';
            cur = clean[k].end;
        }
        html += esc(sentence.substring(cur));
        return html;
    }
    function showBubble(el, ann) {
        var old = document.getElementById('ct-bubble');
        if (old) old.parentNode.removeChild(old);
        var rect = el.getBoundingClientRect();
        var bubble = document.createElement('div');
        bubble.id = 'ct-bubble';
        bubble.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + (rect.bottom + 8) +
            'px;z-index:9999;max-width:320px;padding:12px 16px;background:#1e293b;color:#f1f5f9;' +
            'border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.3);font-size:13px;line-height:1.6;cursor:pointer;';
        bubble.innerHTML = '<div style="font-weight:700;color:#fbbf24;margin-bottom:4px;font-size:14px;">' + esc(ann.word) + '</div>' +
            '<div>' + esc(ann.meaning) + '</div><div style="margin-top:6px;font-size:11px;color:#94a3b8;">点击关闭</div>';
        document.body.appendChild(bubble);
        if (rect.left + 320 > window.innerWidth) {
            bubble.style.left = Math.max(10, window.innerWidth - 330) + 'px';
        }
        setTimeout(function () {
            document.onclick = function (e) {
                if (e.target !== bubble && !bubble.contains(e.target)) {
                    if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
                    document.onclick = null;
                }
            };
        }, 10);
    }
    function renderPassage() {
        var el = document.getElementById('ct-content');
        if (!el) return;
        var p = getPassage(state.currentId);
        var html = '<div style="text-align:center;margin-bottom:14px;"><span style="font-size:18px;font-weight:700;color:#1e293b;">' + esc(p.title) + '</span>' +
            '<span style="font-size:12px;color:#64748b;margin-left:8px;">' + esc(p.source) + '</span></div>';
        if (state.mode === 'compare') {
            html += '<div style="display:flex;gap:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">' +
                '<div style="flex:1;padding:14px;background:#fefce8;border-right:2px solid #e5e7eb;">';
            html += '<div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:10px;text-align:center;">原文（点击蓝色字词查看注释）</div>';
            for (var i = 0; i < p.original.length; i++) {
                html += '<div style="padding:8px 6px;font-size:15px;line-height:1.9;color:#1e293b;border-bottom:1px dashed #e5e7eb;min-height:24px;">' + buildAnnotatedHTML(p.original[i], p.annotations, i) + '</div>';
            }
            html += '</div><div style="flex:1;padding:14px;background:#f0f9ff;">';
            html += '<div style="font-size:12px;font-weight:700;color:#1e40af;margin-bottom:10px;text-align:center;">译文</div>';
            for (var j = 0; j < p.translation.length; j++) {
                html += '<div style="padding:8px 6px;font-size:14px;line-height:1.9;color:#334155;border-bottom:1px dashed #e5e7eb;min-height:24px;">' + esc(p.translation[j]) + '</div>';
            }
            html += '</div></div>';
        } else {
            html += '<div style="padding:14px;background:#fefce8;border:1px solid #e5e7eb;border-radius:8px;">';
            html += '<div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:10px;text-align:center;">原文（自测模式：尝试自行翻译，点击字词查看注释）</div>';
            for (var k = 0; k < p.original.length; k++) {
                html += '<div style="padding:10px 6px;font-size:16px;line-height:1.9;color:#1e293b;border-bottom:1px dashed #e5e7eb;min-height:28px;">' + buildAnnotatedHTML(p.original[k], p.annotations, k) + '</div>';
            }
            html += '</div>';
            html += '<div style="margin-top:10px;text-align:center;"><button id="ct-reveal" style="padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">显示译文</button></div>';
        }
        el.innerHTML = html;
        var annSpans = el.getElementsByTagName('span');
        for (var m = 0; m < annSpans.length; m++) {
            if (annSpans[m].getAttribute('data-ann') !== null) {
                annSpans[m].onclick = function (e) {
                    e.stopPropagation();
                    var idx = parseInt(this.getAttribute('data-ann'), 10);
                    showBubble(this, p.annotations[idx]);
                };
            }
        }
        var reveal = document.getElementById('ct-reveal');
        if (reveal) {
            reveal.onclick = function () {
                state.mode = 'compare';
                renderPassage();
            };
        }
    }
    function renderGrammar() {
        var el = document.getElementById('ct-grammar');
        if (!el) return;
        var p = getPassage(state.currentId);
        var html = '<div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px;">重要语法现象</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
        for (var i = 0; i < p.keyGrammar.length; i++) {
            var g = p.keyGrammar[i];
            html += '<div style="flex:1;min-width:260px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb;">' +
                '<div style="font-size:13px;font-weight:700;color:#3b82f6;margin-bottom:4px;">' + esc(g.pattern) + '</div>' +
                '<div style="font-size:12px;color:#475569;margin-bottom:6px;line-height:1.6;">' + esc(g.explanation) + '</div>' +
                '<div style="font-size:12px;color:#92400e;background:#fefce8;padding:4px 8px;border-radius:4px;">例：' + esc(g.example) + '</div></div>';
        }
        html += '</div>';
        el.innerHTML = html;
    }
    function render() {
        var c = document.getElementById('classical-translation-app');
        if (!c) return;
        var opts = '';
        for (var i = 0; i < PASSAGES.length; i++) {
            opts += '<option value="' + PASSAGES[i].id + '">' + esc(PASSAGES[i].title) + ' — ' + esc(PASSAGES[i].source) + '</option>';
        }
        c.innerHTML =
            '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">' +
            '<select id="ct-select" style="padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;flex:1;min-width:200px;">' + opts + '</select>' +
            '<button id="ct-mode-compare" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">对照模式</button>' +
            '<button id="ct-mode-original" style="padding:8px 16px;background:#e5e7eb;color:#475569;border:none;border-radius:6px;cursor:pointer;font-size:13px;">仅原文（自测）</button>' +
            '</div>' +
            '<div id="ct-content" style="margin-bottom:14px;"></div>' +
            '<div id="ct-grammar"></div>';
        var sel = document.getElementById('ct-select');
        sel.value = state.currentId;
        sel.onchange = function () { state.currentId = parseInt(this.value, 10); renderPassage(); renderGrammar(); };
        document.getElementById('ct-mode-compare').onclick = function () {
            state.mode = 'compare';
            this.style.background = '#3b82f6'; this.style.color = '#fff';
            var other = document.getElementById('ct-mode-original');
            other.style.background = '#e5e7eb'; other.style.color = '#475569';
            renderPassage();
        };
        document.getElementById('ct-mode-original').onclick = function () {
            state.mode = 'original';
            this.style.background = '#3b82f6'; this.style.color = '#fff';
            var other = document.getElementById('ct-mode-compare');
            other.style.background = '#e5e7eb'; other.style.color = '#475569';
            renderPassage();
        };
        renderPassage();
        renderGrammar();
    }
    return { render: render };
})();
// ============================================================
// 模块3: solidGeometry3D — 数学立体几何3D查看器
// 容器: #solid-geometry-3d-app
// ============================================================
window.solidGeometry3D = (function () {
    'use strict';
    var SHAPES = {
        cube: {
            name: '正方体', params: [{ key: 'a', label: '边长 a', min: 1, max: 8, step: 0.5, def: 4 }],
            formulas: [
                { name: '体积 V', expr: 'a³', calc: function (p) { return Math.pow(p.a, 3); } },
                { name: '表面积 S', expr: '6a²', calc: function (p) { return 6 * Math.pow(p.a, 2); } },
                { name: '棱长总和', expr: '12a', calc: function (p) { return 12 * p.a; } }
            ],
            specialLines: [
                { name: '体对角线', expr: '√3·a', calc: function (p) { return Math.sqrt(3) * p.a; } },
                { name: '面对角线', expr: '√2·a', calc: function (p) { return Math.sqrt(2) * p.a; } },
                { name: '外接球半径', expr: '√3·a/2', calc: function (p) { return Math.sqrt(3) * p.a / 2; } }
            ],
            examPoints: '1. 体对角线=√3·a，外接球半径=体对角线/2；2. 截面问题（最多六边形）；3. 内切球半径=a/2；4. 体积与表面积公式。'
        },
        cuboid: {
            name: '长方体', params: [
                { key: 'a', label: '长 a', min: 1, max: 8, step: 0.5, def: 5 },
                { key: 'b', label: '宽 b', min: 1, max: 6, step: 0.5, def: 3 },
                { key: 'c', label: '高 c', min: 1, max: 6, step: 0.5, def: 4 }
            ],
            formulas: [
                { name: '体积 V', expr: 'abc', calc: function (p) { return p.a * p.b * p.c; } },
                { name: '表面积 S', expr: '2(ab+bc+ac)', calc: function (p) { return 2 * (p.a * p.b + p.b * p.c + p.a * p.c); } },
                { name: '棱长总和', expr: '4(a+b+c)', calc: function (p) { return 4 * (p.a + p.b + p.c); } }
            ],
            specialLines: [
                { name: '体对角线', expr: '√(a²+b²+c²)', calc: function (p) { return Math.sqrt(p.a * p.a + p.b * p.b + p.c * p.c); } },
                { name: '外接球半径', expr: '√(a²+b²+c²)/2', calc: function (p) { return Math.sqrt(p.a * p.a + p.b * p.b + p.c * p.c) / 2; } }
            ],
            examPoints: '1. 体对角线=√(a²+b²+c²)；2. 外接球半径=体对角线/2；3. 截面面积最值问题；4. 展开图与最短路径。'
        },
        triangularPrism: {
            name: '正三棱柱', params: [
                { key: 'a', label: '底边长 a', min: 1, max: 6, step: 0.5, def: 3 },
                { key: 'h', label: '高 h', min: 1, max: 8, step: 0.5, def: 5 }
            ],
            formulas: [
                { name: '底面积', expr: '(√3/4)a²', calc: function (p) { return Math.sqrt(3) / 4 * p.a * p.a; } },
                { name: '体积 V', expr: '底面积×h', calc: function (p) { return Math.sqrt(3) / 4 * p.a * p.a * p.h; } },
                { name: '侧面积', expr: '3ah', calc: function (p) { return 3 * p.a * p.h; } },
                { name: '表面积', expr: '3ah+(√3/2)a²', calc: function (p) { return 3 * p.a * p.h + Math.sqrt(3) / 2 * p.a * p.a; } }
            ],
            specialLines: [
                { name: '侧棱长', expr: 'h', calc: function (p) { return p.h; } },
                { name: '底面高', expr: '(√3/2)a', calc: function (p) { return Math.sqrt(3) / 2 * p.a; } }
            ],
            examPoints: '1. 侧面积=底面周长×高；2. 体积=底面积×高；3. 侧面展开图为矩形；4. 截面与几何体关系。'
        },
        squarePyramid: {
            name: '正四棱锥', params: [
                { key: 'a', label: '底边长 a', min: 1, max: 6, step: 0.5, def: 4 },
                { key: 'h', label: '高 h', min: 1, max: 8, step: 0.5, def: 5 }
            ],
            formulas: [
                { name: '底面积', expr: 'a²', calc: function (p) { return p.a * p.a; } },
                { name: '体积 V', expr: '⅓·a²·h', calc: function (p) { return p.a * p.a * p.h / 3; } }
            ],
            specialLines: [
                { name: '斜高', expr: '√(h²+(a/2)²)', calc: function (p) { return Math.sqrt(p.h * p.h + (p.a / 2) * (p.a / 2)); } },
                { name: '侧棱长', expr: '√(h²+a²/2)', calc: function (p) { return Math.sqrt(p.h * p.h + p.a * p.a / 2); } },
                { name: '侧面积', expr: '2a×斜高', calc: function (p) { return 2 * p.a * Math.sqrt(p.h * p.h + (p.a / 2) * (p.a / 2)); } }
            ],
            examPoints: '1. 体积=⅓·底面积·高；2. 斜高≠侧棱长（注意区分）；3. 侧面积=4×(½·底边·斜高)；4. 高、斜高、底边一半构成直角三角形。'
        },
        cylinder: {
            name: '圆柱', params: [
                { key: 'r', label: '底面半径 r', min: 1, max: 5, step: 0.5, def: 3 },
                { key: 'h', label: '高 h', min: 1, max: 8, step: 0.5, def: 5 }
            ],
            formulas: [
                { name: '底面积', expr: 'πr²', calc: function (p) { return Math.PI * p.r * p.r; } },
                { name: '体积 V', expr: 'πr²h', calc: function (p) { return Math.PI * p.r * p.r * p.h; } },
                { name: '侧面积', expr: '2πrh', calc: function (p) { return 2 * Math.PI * p.r * p.h; } },
                { name: '表面积', expr: '2πr²+2πrh', calc: function (p) { return 2 * Math.PI * p.r * p.r + 2 * Math.PI * p.r * p.h; } }
            ],
            specialLines: [
                { name: '轴截面面积', expr: '2rh', calc: function (p) { return 2 * p.r * p.h; } },
                { name: '底面周长', expr: '2πr', calc: function (p) { return 2 * Math.PI * p.r; } }
            ],
            examPoints: '1. 侧面展开图为矩形（一边=底面周长，一边=高）；2. 体积=底面积×高；3. 轴截面为矩形；4. 侧面积=底面周长×高。'
        },
        cone: {
            name: '圆锥', params: [
                { key: 'r', label: '底面半径 r', min: 1, max: 5, step: 0.5, def: 3 },
                { key: 'h', label: '高 h', min: 1, max: 8, step: 0.5, def: 5 }
            ],
            formulas: [
                { name: '底面积', expr: 'πr²', calc: function (p) { return Math.PI * p.r * p.r; } },
                { name: '体积 V', expr: '⅓πr²h', calc: function (p) { return Math.PI * p.r * p.r * p.h / 3; } },
                { name: '侧面积', expr: 'πrl', calc: function (p) { return Math.PI * p.r * Math.sqrt(p.r * p.r + p.h * p.h); } }
            ],
            specialLines: [
                { name: '母线 l', expr: '√(r²+h²)', calc: function (p) { return Math.sqrt(p.r * p.r + p.h * p.h); } },
                { name: '轴截面面积', expr: 'rh', calc: function (p) { return p.r * p.h; } },
                { name: '侧面展开圆心角', expr: '360°·r/l', calc: function (p) { return 360 * p.r / Math.sqrt(p.r * p.r + p.h * p.h); } }
            ],
            examPoints: '1. 母线l=√(r²+h²)（母线、高、半径构成直角三角形）；2. 侧面展开图为扇形；3. 体积=⅓·底面积·高；4. 轴截面为等腰三角形。'
        },
        sphere: {
            name: '球', params: [
                { key: 'r', label: '半径 r', min: 1, max: 5, step: 0.5, def: 3 }
            ],
            formulas: [
                { name: '体积 V', expr: '(4/3)πr³', calc: function (p) { return 4 / 3 * Math.PI * Math.pow(p.r, 3); } },
                { name: '表面积 S', expr: '4πr²', calc: function (p) { return 4 * Math.PI * p.r * p.r; } }
            ],
            specialLines: [
                { name: '直径', expr: '2r', calc: function (p) { return 2 * p.r; } },
                { name: '大圆周长', expr: '2πr', calc: function (p) { return 2 * Math.PI * p.r; } },
                { name: '大圆面积', expr: 'πr²', calc: function (p) { return Math.PI * p.r * p.r; } }
            ],
            examPoints: '1. 体积=(4/3)πr³，表面积=4πr²；2. 截面为圆，过球心的截面为大圆；3. 球面距离=大圆劣弧长；4. 球的内接/外切几何体问题。'
        },
        frustum: {
            name: '圆台', params: [
                { key: 'r', label: '下底半径 r₁', min: 2, max: 5, step: 0.5, def: 4 },
                { key: 'r2', label: '上底半径 r₂', min: 0.5, max: 3, step: 0.5, def: 2 },
                { key: 'h', label: '高 h', min: 1, max: 8, step: 0.5, def: 4 }
            ],
            formulas: [
                { name: '体积 V', expr: '⅓πh(r₁²+r₁r₂+r₂²)', calc: function (p) { return Math.PI * p.h * (p.r * p.r + p.r * p.r2 + p.r2 * p.r2) / 3; } },
                { name: '侧面积', expr: 'π(r₁+r₂)l', calc: function (p) { return Math.PI * (p.r + p.r2) * Math.sqrt(p.h * p.h + (p.r - p.r2) * (p.r - p.r2)); } },
                { name: '表面积', expr: 'π(r₁²+r₂²)+π(r₁+r₂)l', calc: function (p) { return Math.PI * (p.r * p.r + p.r2 * p.r2) + Math.PI * (p.r + p.r2) * Math.sqrt(p.h * p.h + (p.r - p.r2) * (p.r - p.r2)); } }
            ],
            specialLines: [
                { name: '母线 l', expr: '√(h²+(r₁-r₂)²)', calc: function (p) { return Math.sqrt(p.h * p.h + (p.r - p.r2) * (p.r - p.r2)); } },
                { name: '轴截面面积', expr: '(r₁+r₂)h', calc: function (p) { return (p.r + p.r2) * p.h; } }
            ],
            examPoints: '1. 体积=⅓πh(r₁²+r₁r₂+r₂²)；2. 母线l=√(h²+(r₁-r₂)²)；3. 侧面展开图为扇环；4. 轴截面为等腰梯形。'
        }
    };
    var currentShape = 'cube';
    var params = { a: 4, b: 3, c: 4, r: 3, h: 5, r2: 2 };
    var rotation = { x: 0.45, y: 0.6 };
    var zoom = 1;
    var dragging = false;
    var lastMouse = { x: 0, y: 0 };

    function project3D(point, rotX, rotY, scale, cx, cy) {
        var x1 = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
        var z1 = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
        var y1 = point.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        var z2 = point.y * Math.sin(rotX) + z1 * Math.cos(rotX);
        var d = 500;
        var f = d / (d + z2);
        return { x: cx + x1 * scale * f, y: cy - y1 * scale * f, z: z2, f: f };
    }

    function buildGeometry(shape, p) {
        var a = p.a || 0, b = p.b || 0, c = p.c || 0, r = p.r || 0, h = p.h || 0, r2 = p.r2 || 0;
        var N = 32;
        var V = [], E = [], HL = [], LB = [];
        if (shape === 'cube') {
            var s = a / 2;
            V = [{x:-s,y:0,z:-s},{x:s,y:0,z:-s},{x:s,y:0,z:s},{x:-s,y:0,z:s},{x:-s,y:a,z:-s},{x:s,y:a,z:-s},{x:s,y:a,z:s},{x:-s,y:a,z:s}];
            E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
            HL = [[0,4]]; LB = [{i:0,t:'A'},{i:1,t:'B'},{i:2,t:'C'},{i:3,t:'D'},{i:4,t:'E'},{i:5,t:'F'},{i:6,t:'G'},{i:7,t:'H'}];
        } else if (shape === 'cuboid') {
            var sx = a/2, sz = b/2;
            V = [{x:-sx,y:0,z:-sz},{x:sx,y:0,z:-sz},{x:sx,y:0,z:sz},{x:-sx,y:0,z:sz},{x:-sx,y:c,z:-sz},{x:sx,y:c,z:-sz},{x:sx,y:c,z:sz},{x:-sx,y:c,z:sz}];
            E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
            HL = [[0,4]]; LB = [{i:0,t:'A'},{i:1,t:'B'},{i:2,t:'C'},{i:3,t:'D'},{i:4,t:'E'},{i:5,t:'F'},{i:6,t:'G'},{i:7,t:'H'}];
        } else if (shape === 'triangularPrism') {
            var triH = a * Math.sqrt(3) / 2;
            var cy2 = triH / 3;
            V = [{x:-a/2,y:0,z:-cy2},{x:a/2,y:0,z:-cy2},{x:0,y:0,z:triH-cy2},{x:-a/2,y:h,z:-cy2},{x:a/2,y:h,z:-cy2},{x:0,y:h,z:triH-cy2}];
            E = [[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]];
            HL = [[0,3]]; LB = [{i:0,t:'A'},{i:1,t:'B'},{i:2,t:'C'},{i:3,t:"A'"},{i:4,t:"B'"},{i:5,t:"C'"}];
        } else if (shape === 'squarePyramid') {
            var sp = a/2;
            V = [{x:-sp,y:0,z:-sp},{x:sp,y:0,z:-sp},{x:sp,y:0,z:sp},{x:-sp,y:0,z:sp},{x:0,y:h,z:0},{x:0,y:0,z:0}];
            E = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
            HL = [[4,5]]; LB = [{i:0,t:'A'},{i:1,t:'B'},{i:2,t:'C'},{i:3,t:'D'},{i:4,t:'P'},{i:5,t:'O'}];
        } else if (shape === 'cylinder') {
            for (var i=0;i<N;i++){var ang=(i/N)*Math.PI*2;V.push({x:r*Math.cos(ang),y:0,z:r*Math.sin(ang)});}
            for (var j=0;j<N;j++){var ang2=(j/N)*Math.PI*2;V.push({x:r*Math.cos(ang2),y:h,z:r*Math.sin(ang2)});}
            for (var k=0;k<N;k++){E.push([k,(k+1)%N]);E.push([N+k,N+(k+1)%N]);}
            var vc=12;for(var n=0;n<vc;n++){var idx=Math.floor(n*N/vc);E.push([idx,N+idx]);}
            V.push({x:0,y:0,z:0});V.push({x:0,y:h,z:0});
            HL=[[2*N,2*N+1]];LB=[{i:2*N,t:'O'},{i:2*N+1,t:"O'"}];
        } else if (shape === 'cone') {
            for (var i=0;i<N;i++){var ang=(i/N)*Math.PI*2;V.push({x:r*Math.cos(ang),y:0,z:r*Math.sin(ang)});}
            V.push({x:0,y:h,z:0});
            for (var k=0;k<N;k++){E.push([k,(k+1)%N]);}
            var vc2=12;for(var n=0;n<vc2;n++){var idx2=Math.floor(n*N/vc2);E.push([idx2,N]);}
            V.push({x:0,y:0,z:0});
            HL=[[N,N+1]];LB=[{i:N,t:'P'},{i:N+1,t:'O'}];
        } else if (shape === 'sphere') {
            var latN=5,lonN=6,seg=24;
            for (var la=1;la<latN;la++){
                var phi=(la/latN)*Math.PI;
                var yLat=r*Math.cos(phi),rLat=r*Math.sin(phi);
                var si=V.length;
                for (var s=0;s<seg;s++){var a1=(s/seg)*Math.PI*2;V.push({x:rLat*Math.cos(a1),y:yLat+r,z:rLat*Math.sin(a1)});}
                for (var s2=0;s2<seg;s2++){E.push([si+s2,si+(s2+1)%seg]);}
            }
            for (var lo=0;lo<lonN;lo++){
                var theta=(lo/lonN)*Math.PI;
                var si2=V.length;
                for (var s3=0;s3<=seg;s3++){var phi2=(s3/seg)*Math.PI;var yL=r*Math.cos(phi2),rL=r*Math.sin(phi2);V.push({x:rL*Math.cos(theta),y:yL+r,z:rL*Math.sin(theta)});}
                for (var s4=0;s4<seg;s4++){E.push([si2+s4,si2+s4+1]);}
            }
            V.push({x:0,y:r,z:0});V.push({x:r,y:r,z:0});
            HL=[[V.length-2,V.length-1]];LB=[{i:V.length-2,t:'O'},{i:V.length-1,t:'P'}];
        } else if (shape === 'frustum') {
            for (var i=0;i<N;i++){var ang=(i/N)*Math.PI*2;V.push({x:r*Math.cos(ang),y:0,z:r*Math.sin(ang)});}
            for (var j=0;j<N;j++){var ang2=(j/N)*Math.PI*2;V.push({x:r2*Math.cos(ang2),y:h,z:r2*Math.sin(ang2)});}
            for (var k=0;k<N;k++){E.push([k,(k+1)%N]);E.push([N+k,N+(k+1)%N]);}
            var vc3=12;for(var n=0;n<vc3;n++){var idx3=Math.floor(n*N/vc3);E.push([idx3,N+idx3]);}
            V.push({x:0,y:0,z:0});V.push({x:0,y:h,z:0});
            HL=[[2*N,2*N+1]];LB=[{i:2*N,t:'O'},{i:2*N+1,t:"O'"}];
        }
        return { vertices: V, edges: E, heightLines: HL, labels: LB };
    }

    function drawGeometry() {
        var canvas = document.getElementById('sg3d-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        var geo = buildGeometry(currentShape, params);
        var cx = w / 2, cy = h / 2 + 40;
        var scale = zoom * 38;
        var projected = [];
        for (var i = 0; i < geo.vertices.length; i++) {
            projected.push(project3D(geo.vertices[i], rotation.x, rotation.y, scale, cx, cy));
        }
        var maxZ = -1e9, minZ = 1e9;
        for (var pi = 0; pi < projected.length; pi++) {
            if (projected[pi].z > maxZ) maxZ = projected[pi].z;
            if (projected[pi].z < minZ) minZ = projected[pi].z;
        }
        var range = maxZ - minZ || 1;
        var edgeList = [];
        for (var j = 0; j < geo.edges.length; j++) {
            var e = geo.edges[j];
            var avgZ = (projected[e[0]].z + projected[e[1]].z) / 2;
            edgeList.push({ e: e, z: avgZ });
        }
        edgeList.sort(function (a, b) { return b.z - a.z; });
        for (var k = 0; k < edgeList.length; k++) {
            var e2 = edgeList[k].e;
            var p1 = projected[e2[0]], p2 = projected[e2[1]];
            var depth = 1 - (edgeList[k].z - minZ) / range;
            var opacity = 0.25 + 0.75 * depth;
            ctx.strokeStyle = 'rgba(100,180,255,' + opacity.toFixed(2) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        for (var hl = 0; hl < geo.heightLines.length; hl++) {
            var he = geo.heightLines[hl];
            var hp1 = projected[he[0]], hp2 = projected[he[1]];
            ctx.beginPath();
            ctx.moveTo(hp1.x, hp1.y);
            ctx.lineTo(hp2.x, hp2.y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        for (var li = 0; li < geo.labels.length; li++) {
            var lb = geo.labels[li];
            var lp = projected[lb.i];
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(lp.x, lp.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(lb.t, lp.x + 7, lp.y - 7);
        }
        ctx.fillStyle = '#ef4444';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('--- 红色虚线 = 高线', 10, h - 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('● 顶点标注', 130, h - 10);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('拖拽旋转 · 滚轮缩放', w - 10, h - 10);
        } catch (err) {
            console.error('绘制立体几何失败:', err);
        }
    }

    function renderParams() {
        var el = document.getElementById('sg3d-params');
        if (!el) return;
        var shape = SHAPES[currentShape];
        var html = '';
        for (var i = 0; i < shape.params.length; i++) {
            var p = shape.params[i];
            var val = params[p.key];
            html += '<div style="margin-bottom:12px;">' +
                '<label style="display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-bottom:4px;">' +
                '<span>' + p.label + '</span><span style="color:#3b82f6;font-weight:700;">' + val.toFixed(1) + '</span></label>' +
                '<input type="range" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + val + '" data-key="' + p.key + '" style="width:100%;accent-color:#3b82f6;" /></div>';
        }
        el.innerHTML = html;
        var sliders = el.getElementsByTagName('input');
        for (var j = 0; j < sliders.length; j++) {
            sliders[j].oninput = function () {
                var key = this.getAttribute('data-key');
                params[key] = parseFloat(this.value);
                this.parentNode.getElementsByTagName('label')[0].getElementsByTagName('span')[1].innerHTML = params[key].toFixed(1);
                drawGeometry();
                renderFormulas();
            };
        }
    }

    function renderFormulas() {
        var el = document.getElementById('sg3d-formulas');
        if (!el) return;
        var shape = SHAPES[currentShape];
        var html = '<div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:8px;">公式与计算</div>';
        for (var i = 0; i < shape.formulas.length; i++) {
            var f = shape.formulas[i];
            var val = f.calc(params);
            html += '<div style="padding:8px 10px;background:#f0f9ff;border-radius:6px;margin-bottom:6px;border:1px solid #bae6fd;">' +
                '<div style="font-size:12px;color:#1e40af;font-weight:600;">' + f.name + '</div>' +
                '<div style="font-size:13px;color:#334155;margin-top:2px;">公式：<span style="font-family:serif;color:#64748b;">' + f.expr + '</span></div>' +
                '<div style="font-size:14px;color:#3b82f6;font-weight:700;margin-top:2px;">= ' + val.toFixed(2) + '</div></div>';
        }
        if (shape.specialLines && shape.specialLines.length > 0) {
            html += '<div style="font-size:12px;font-weight:700;color:#92400e;margin:10px 0 6px;">特殊线段</div>';
            for (var j = 0; j < shape.specialLines.length; j++) {
                var sl = shape.specialLines[j];
                var slVal = sl.calc(params);
                html += '<div style="padding:6px 10px;background:#fffbeb;border-radius:6px;margin-bottom:4px;border:1px solid #fde68a;">' +
                    '<span style="font-size:12px;color:#92400e;font-weight:600;">' + sl.name + '</span>' +
                    '<span style="font-size:11px;color:#a16207;font-family:serif;margin-left:6px;">' + sl.expr + '</span>' +
                    '<span style="font-size:13px;color:#d97706;font-weight:700;float:right;">' + slVal.toFixed(2) + '</span></div>';
            }
        }
        el.innerHTML = html;
    }

    function renderExamPoints() {
        var el = document.getElementById('sg3d-exam');
        if (!el) return;
        var shape = SHAPES[currentShape];
        el.innerHTML = '<div style="padding:12px 14px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">' +
            '<div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:4px;">高考考点</div>' +
            '<div style="font-size:12px;color:#7f1d1d;line-height:1.7;">' + shape.examPoints + '</div></div>';
    }

    function switchShape(shape) {
        currentShape = shape;
        var shapeDef = SHAPES[shape];
        for (var i = 0; i < shapeDef.params.length; i++) {
            params[shapeDef.params[i].key] = shapeDef.params[i].def;
        }
        renderParams();
        renderFormulas();
        renderExamPoints();
        drawGeometry();
    }

    function render() {
        var c = document.getElementById('solid-geometry-3d-app');
        if (!c) return;
        var listHtml = '';
        var shapeKeys = ['cube','cuboid','triangularPrism','squarePyramid','cylinder','cone','sphere','frustum'];
        for (var i = 0; i < shapeKeys.length; i++) {
            var sk = shapeKeys[i];
            listHtml += '<div data-shape="' + sk + '" style="padding:10px 12px;cursor:pointer;border-radius:6px;margin-bottom:2px;font-size:13px;color:#334155;" ' +
                'onmouseover="this.style.background=\'#eff6ff\'" onmouseout="if(this.dataset.act!==\'1\')this.style.background=\'transparent\'">' + SHAPES[sk].name + '</div>';
        }
        c.innerHTML =
            '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<div style="width:150px;flex-shrink:0;"><div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px;">几何体</div>' +
            '<div id="sg3d-list">' + listHtml + '</div></div>' +
            '<div style="flex:1;min-width:400px;"><canvas id="sg3d-canvas" width="560" height="440" style="border:1px solid #334155;border-radius:8px;width:100%;max-width:560px;cursor:grab;background:#0f172a;"></canvas></div>' +
            '<div style="width:240px;flex-shrink:0;"><div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:8px;">属性面板</div>' +
            '<div id="sg3d-params" style="margin-bottom:12px;"></div>' +
            '<div id="sg3d-formulas"></div></div></div>' +
            '<div id="sg3d-exam" style="margin-top:12px;"></div>';
        var listItems = document.getElementById('sg3d-list').getElementsByTagName('div');
        function highlightList() {
            for (var m = 0; m < listItems.length; m++) {
                var sk2 = listItems[m].getAttribute('data-shape');
                if (sk2 === currentShape) {
                    listItems[m].style.background = '#dbeafe';
                    listItems[m].style.color = '#1e40af';
                    listItems[m].style.fontWeight = '700';
                    listItems[m].setAttribute('data-act', '1');
                } else {
                    listItems[m].style.background = 'transparent';
                    listItems[m].style.color = '#334155';
                    listItems[m].style.fontWeight = '400';
                    listItems[m].removeAttribute('data-act');
                }
            }
        }
        for (var j = 0; j < listItems.length; j++) {
            listItems[j].onclick = function () {
                switchShape(this.getAttribute('data-shape'));
                highlightList();
            };
        }
        highlightList();
        renderParams();
        renderFormulas();
        renderExamPoints();
        drawGeometry();
        var canvas = document.getElementById('sg3d-canvas');
        canvas.onmousedown = function (e) {
            dragging = true;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            canvas.style.cursor = 'grabbing';
        };
        canvas.onmousemove = function (e) {
            if (!dragging) return;
            var dx = e.clientX - lastMouse.x;
            var dy = e.clientY - lastMouse.y;
            rotation.y += dx * 0.01;
            rotation.x += dy * 0.01;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            drawGeometry();
        };
        canvas.onmouseup = function () { dragging = false; canvas.style.cursor = 'grab'; };
        canvas.onmouseleave = function () { dragging = false; canvas.style.cursor = 'grab'; };
        canvas.onwheel = function (e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 0.9 : 1.1;
            zoom *= delta;
            if (zoom < 0.3) zoom = 0.3;
            if (zoom > 3) zoom = 3;
            drawGeometry();
        };
        canvas.ontouchstart = function (e) {
            if (e.touches.length === 1) {
                dragging = true;
                lastMouse.x = e.touches[0].clientX;
                lastMouse.y = e.touches[0].clientY;
            }
        };
        canvas.ontouchmove = function (e) {
            if (!dragging || e.touches.length !== 1) return;
            e.preventDefault();
            var dx = e.touches[0].clientX - lastMouse.x;
            var dy = e.touches[0].clientY - lastMouse.y;
            rotation.y += dx * 0.01;
            rotation.x += dy * 0.01;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
            drawGeometry();
        };
        canvas.ontouchend = function () { dragging = false; };
    }
    return { render: render };
})();
