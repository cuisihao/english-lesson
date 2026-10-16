/**
 * Builder script to generate comprehensive authentic data for:
 * - Book 1 (144 lessons)
 * - Book 2 (96 lessons)
 * - Book 3 (60 lessons)
 * Total 300 lessons with English titles, Chinese titles, dialogues/readings, grammar focus, and vocabulary.
 */

const fs = require('fs');
const path = require('path');

// 1. Raw Metadata for Book 1 (144 lessons)
const B1_RAW = [
  [1, "Excuse me!", "对不起，请原谅！", "Be动词一般疑问句与所有格形容词"],
  [2, "Is this your...?", "这是你的……吗？", "常见单数名词冠词使用 a/an"],
  [3, "Sorry, sir.", "对不起，先生。", "否定句缩写形式与基数词"],
  [4, "Is this your...?", "这是你的……吗？", "物主代词与物品归属确认"],
  [5, "Nice to meet you.", "很高兴见到你。", "引荐人物与国家国籍句型"],
  [6, "What make is it?", "它是什么品牌的？", "特殊疑问句 What make...?"],
  [7, "Are you a teacher?", "你是教师吗？", "职业身份与第二人称疑问句"],
  [8, "What's your job?", "你的工作是什么？", "特殊疑问句询问职业与身份"],
  [9, "How are you today?", "你今天好吗？", "身体健康状况与形容词表语"],
  [10, "Look at that!", "看那个！", "指示代词 that 与形容词对比"],
  [11, "Is this your shirt?", "这是你的衬衫吗？", "颜色形容词与衣物名词搭配"],
  [12, "Whose is this...?", "这是谁的……？", "名词所有格 ('s) 与 Whose 提问"],
  [13, "A new dress", "一件新连衣裙", "代词 one 避免重复与颜色修饰"],
  [14, "What colour is your...?", "你的……是什么颜色的？", "询问颜色的特殊疑问句"],
  [15, "Your passports, please.", "请出示你们的护照。", "名词复数形式 (-s, -es) 与 they/their"],
  [16, "Are you...?", "你们是……吗？", "第二人称复数一般疑问句"],
  [17, "How do you do?", "你好！", "正式商务问候与复数职业"],
  [18, "What are their jobs?", "他们的工作是什么？", "复数代词与复数名词搭配"],
  [19, "Tired and thirsty", "又累又渴", "并列形容词与祈使句"],
  [20, "Look at them!", "看他们！", "人称代词宾格 them 与形容词"],
  [21, "Which book?", "哪一本书？", "疑问代词 Which 与定语"],
  [22, "Give me a book please. Which one?", "请给我一本书。哪一本？", "双宾语动词 give sb sth 与代词 one"],
  [23, "Which glasses?", "哪几只杯子？", "复数代词 ones 替代复数名词"],
  [24, "Give me some glasses please.", "请给我几只杯子。", "不定代词 some 与复数名词请求"],
  [25, "Mrs. Smith's kitchen", "史密斯夫人的厨房", "there is / there are 存在句型"],
  [26, "Where is it?", "它在哪里？", "特殊疑问句 Where 询问单数位置"],
  [27, "Mrs. Smith's living room", "史密斯夫人的客厅", "方位介词 on, under, near, in"],
  [28, "Where are they?", "它们在哪里？", "复数名词方位与 Where are they?"],
  [29, "Come in!", "请进！", "祈使句与礼貌请托动词"],
  [30, "Shut the door!", "关门！", "动词短语与否定祈使句"],
  [31, "Where's Sally?", "萨莉在哪里？", "现在进行时态 (be doing) 动作描述"],
  [32, "What's he doing?", "他在做什么？", "现在进行时第三人称单数提问"],
  [33, "A fine day", "晴朗的一天", "现在进行时一般疑问句与天气"],
  [34, "What are they doing?", "他们在做什么？", "现在进行时复数人称提问"],
  [35, "Our village", "我们的村庄", "现在进行时描述乡村风貌与行走"],
  [36, "Where are you going?", "你要去哪里？", "现在进行时表将来的位移动词"],
  [37, "Making a bookcase", "做书架", "情态动词 can 表达能力与做工"],
  [38, "What are you going to do?", "你打算做什么？", "be going to 表达将来意图与计划"],
  [39, "Don't drop it!", "别摔了！", "否定祈使句 Don't do sth 与轻拿轻放"],
  [40, "What are you going to do?", "你打算做什么？", "be going to 疑问句与宾语代词"],
  [41, "Penny's bag", "佩妮的提包", "形容词性与名词性物主代词 (mine, yours)"],
  [42, "Is there a... in that bag?", "包里有……吗？", "there is 一般疑问句与不可数名词"],
  [43, "Hurry up!", "快点儿！", "情态动词 must 表达必须与急迫"],
  [44, "Is there any water?", "有水吗？", "不可数名词疑问句与 any 搭配"],
  [45, "The boss's letter", "老板的信", "情态动词 can 与打字商务技能"],
  [46, "Can you type this letter?", "你能打这封信吗？", "情态动词 can 一般疑问句与答语"],
  [47, "A cup of coffee", "一杯咖啡", "不可数名词量词结构 a cup/bottle of..."],
  [48, "Do you like fresh milk?", "你喜欢鲜牛奶吗？", "一般现在时一般疑问句 Do you like...?"],
  [49, "At the butcher's", "在肉店", "some 和 any 在肉类购物中的运用"],
  [50, "He likes steak.", "他喜欢牛排。", "一般现在时第三人称单数动词加 -s"],
  [51, "A pleasant climate", "宜人的气候", "一般现在时陈述客观气候地理事实"],
  [52, "What nationality are they?", "他们是哪国人？", "国家、国籍与所属语言提问"],
  [53, "An interesting climate", "有趣的气候", "单三动词 does/has 与四季气候"],
  [54, "What's the weather like?", "天气怎么样？", "询问天气的固定句型与季节"],
  [55, "The Sawyer family", "索耶一家", "一般现在时第三人称单数规则描述日常"],
  [56, "What do they usually do?", "他们通常做什么？", "频度副词 usually/always 与日常作息"],
  [57, "An unusual day", "不平常的一天", "一般现在时与现在进行时对比转换"],
  [58, "What are they doing today?", "他们今天在做什么？", "今日特殊动作与平日习惯对比"],
  [59, "Is that all?", "就这些吗？", "have got 与 have 表达物品所有与购物"],
  [60, "What's the time?", "几点了？", "时间表达法 (half past, quarter to)"],
  [61, "A bad cold", "重感冒", "表达病症、身体感受与看医生"],
  [62, "What's the matter with him?", "他怎么了？", "询问他人身体不适与健康建议"],
  [63, "Thank you, doctor.", "谢谢你，医生。", "情态动词 should 与医嘱建议"],
  [64, "Don't do that!", "不要那样做！", "祈使句警示与用药注意事项"],
  [65, "Not a baby", "不是小孩子了", "反身代词 myself, yourself, herself"],
  [66, "What's the time?", "几点了？", "时间钟点精准度与时刻询问"],
  [67, "The weekend", "周末", "一般过去时态 (was/were) 与周末游玩"],
  [68, "What's the time?", "几点了？", "过去时间点与经历表述"],
  [69, "The car race", "汽车比赛", "规则动词过去式加 -ed 与比赛叙事"],
  [70, "When did you go there?", "你什么时候去那里的？", "一般过去时特殊疑问句 When did you...?"],
  [71, "He's awful!", "他真讨厌！", "不规则动词过去式 (went, ate, had, saw)"],
  [72, "When did they meet?", "他们什么时候见面的？", "不规则动词过去时疑问句与回答"],
  [73, "The way to King Street", "去国王街的路线", "问路与方位指示祈使句"],
  [74, "What did they do?", "他们做了什么？", "过去发生动作链条陈述"],
  [75, "Uncomfortable shoes", "不舒服的鞋子", "一般过去时否定句 did not + 动词原形"],
  [76, "When did you buy them?", "你什么时候买它们的？", "购物经历回顾与时间点询问"],
  [77, "Terrible toothache", "可怕的牙痛", "时间状语从句 when 引导过去动作"],
  [78, "When did you have a toothache?", "你什么时候牙痛的？", "过去突发病痛与看诊回顾"],
  [79, "Carol's shopping list", "卡罗尔的购物清单", "情态动词 need 与 have to 表达需求"],
  [80, "I must have a...", "我必须买一个……", "购物意向与不可或缺之物"],
  [81, "Roast beef and potatoes", "烤牛肉和土豆", "不定代词 someone, anyone, nothing"],
  [82, "What had they eaten?", "他们吃了什么？", "过去食物消耗与不定代词复合句"],
  [83, "Going on holiday", "去度假", "现在完成时 (have/has been to) 表示经历"],
  [84, "Have you had your lunch?", "你吃午饭了吗？", "现在完成时一般疑问句与 just / already"],
  [85, "Paris in the spring", "巴黎之春", "现在完成时与一般过去时辨析"],
  [86, "Have you been there?", "你去过那里吗？", "have been to 与 have gone to 辨析"],
  [87, "A car crash", "车祸", "过去进行时态 (was/were doing) 描述背景"],
  [88, "What were you doing?", "你当时在做什么？", "过去进行时疑问句与突发事件配合"],
  [89, "For sale", "待售", "现在完成时与 since/for 持续性表达"],
  [90, "Have you sold it yet?", "你卖掉了吗？", "副词 yet 在否定句与疑问句中的运用"],
  [91, "Poor Ian!", "可怜的伊恩！", "will 引导的一般将来时预言与突发决定"],
  [92, "When will it be finished?", "什么时候能完成？", "将来时态疑问句与工期预计"],
  [93, "Our new neighbour", "我们的新邻居", "形容词单音节比较级与最高级 (-er, -est)"],
  [94, "Who is taller?", "谁更高？", "两者对比疑问句与 than 连接词"],
  [95, "Tickets, please.", "请出示车票。", "多音节形容词比较级与最高级 (more, most)"],
  [96, "Which is the fastest?", "哪个最快？", "三者及以上范围最高级 of all / in the..."],
  [97, "A small blue case", "一只蓝色小箱子", "多重定语形容词排列顺序 (大小+颜色+名词)"],
  [98, "Which one do you want?", "你想要哪一个？", "代词 one 与形容词定语搭配选购"],
  [99, "Owl!", "猫头鹰！", "感叹句 (What a...! / How...!) 强烈情感"],
  [100, "What a terrible mess!", "真是一团糟！", "感叹句在日常杂乱场景中的脱口表达"],
  [101, "A card from Jimmy", "吉米的明信片", "动词不定式做目的状语 (to do)"],
  [102, "He says he is...", "他说他是……", "宾语从句引述他人话语 (say that...)"],
  [103, "The French test", "法语测验", "too... to... 结构表达太……以至于不能……"],
  [104, "Too young to...", "太年轻而不能……", "too... to... 结构在成长经历中的拓展"],
  [105, "Full of mistakes", "全是错误", "动词短语与固定介词搭配 be full of..."],
  [106, "Want him to do...", "想让他做……", "动词复合宾语 want sb to do sth"],
  [107, "It's too small.", "太小了。", "enough 与形容词位置 (good enough)"],
  [108, "How do you do that?", "你那是怎么做到的？", "方式疑问句与熟练操作技巧"],
  [109, "A good idea", "好主意", "原因状语从句 because 与提议 Shall we...?"],
  [110, "Shall we go there?", "我们去那里好吗？", "情态动词 shall 提出建议与商量"],
  [111, "The most expensive model", "最昂贵的型号", "不规则形容词比较级与最高级 (good/better/best)"],
  [112, "Which one is cheaper?", "哪一个更便宜？", "购物比价与性价比权衡"],
  [113, "Small change", "零钱", "倒装简略回答 So do I. / Neither do I."],
  [114, "So do I. / Neither do I.", "我也一样。/ 我也不。", "肯定与否定附和简短交流"],
  [115, "Knock, knock!", "敲门声！", "复合不定代词 someone, anyone, everyone, no one"],
  [116, "Is there anyone at home?", "家里有人吗？", "不定代词一般疑问句与敲门应答"],
  [117, "Tommy's breakfast", "汤米的早餐", "过去完成时 (had + done) 强调过去的过去"],
  [118, "What had happened?", "发生了什么事？", "过去完成时疑问句追溯前因后果"],
  [119, "A true story", "真实的故事", "过去发生动作的时间先后严谨叙事"],
  [120, "It had already happened.", "它已经发生了。", "already 搭配过去完成时的事件收束"],
  [121, "The man in a hat", "戴帽子的男人", "定语从句 (who 引导修饰先行词为人)"],
  [122, "Who is the man?", "那个男人是谁？", "定语从句锁定目标人物特征"],
  [123, "A trip to Australia", "澳大利亚之旅", "定语从句 (which / that 引导修饰事物)"],
  [124, "Which country?", "哪个国家？", "定语从句修饰国家与地理名胜"],
  [125, "Tea for two", "两个人喝茶", "被动语态一般现在时 (am/is/are + 过去分词)"],
  [126, "Have they been cleaned?", "它们被清洗了吗？", "现在完成时被动语态 (have/has been + p.p.)"],
  [127, "A famous actress", "著名女演员", "被动语态一般过去时 (was/were + 过去分词)"],
  [128, "Was it made in England?", "它是在英格兰制造的吗？", "被动语态产地与制造溯源提问"],
  [129, "Seventy miles an hour", "时速七十英里", "情态动词对过去的肯定推测 (must have been)"],
  [130, "He must have been...", "他一定是……", "情态动词推测依据与警员查验"],
  [131, "Don't be so sure!", "可别这么肯定！", "情态动词可能性推测 may / might / can't"],
  [132, "He may be right.", "他可能是对的。", "弱推测与不确定性表达"],
  [133, "Sensational news!", "轰动性新闻！", "直接引语变间接引语 (陈述句时态后退)"],
  [134, "He said that...", "他说……", "间接引语转述要点与人称代词调整"],
  [135, "The latest report", "最新报告", "间接引语中一般疑问句与特殊疑问句语序"],
  [136, "He asked if...", "他询问是否……", "if / whether 引导的间接疑问句"],
  [137, "A pleasant dream", "美梦", "真实条件状语从句 (主将从现 If you..., I will...)"],
  [138, "If you go there...", "如果你去那里……", "条件从句中的将来假设与结果"],
  [139, "Is that you, John?", "是你吗，约翰？", "电话商务与朋友交际用语 (This is... speaking)"],
  [140, "He wants to know if...", "他想知道是否……", "日常电话转达与留言记录"],
  [141, "Sally's first train ride", "萨莉第一次乘火车", "复合介词短语与长篇叙事视角"],
  [142, "Someone is...", "有人正在……", "旅途中的细致观察与连贯描述"],
  [143, "A walk through the woods", "林中散步", "第一册全篇综合大复习：时态与从句大贯通"],
  [144, "He hasn't arrived yet", "他还没有到达", "第一册结业验收：现在完成时全景总结"]
];

// 2. Raw Metadata for Book 2 (96 lessons)
const B2_RAW = [
  [1, "A private conversation", "私人谈话", "简单陈述句词序与剧院插曲"],
  [2, "Breakfast or lunch?", "早餐还是午餐？", "现在进行时与一般现在时对比"],
  [3, "Please send me a card", "请给我寄张明信片", "双宾语动词 (send sb sth / send sth to sb)"],
  [4, "An exciting trip", "激动人心的旅行", "现在完成时与常用副词搭配 (already, just, yet)"],
  [5, "No wrong numbers", "无错号之虞", "一般过去时态与规则/不规则动词"],
  [6, "Percy Buttons", "珀西·巴顿斯", "冠词 a/an/the 的经典规则与特指"],
  [7, "Too late", "为时太晚", "过去进行时与一般过去时的交叉配合"],
  [8, "The best and the worst", "最好的和最差的", "形容词与副词比较级与最高级规则"],
  [9, "A cold welcome", "冷遇", "时间介词 at, in, on, during 的用法辨析"],
  [10, "Not for jazz", "不可用于爵士乐", "被动语态初步 (is/was played)"],
  [11, "One good turn deserves another", "礼尚往来", "动词不定式做动词宾语"],
  [12, "Goodbye and good luck", "再见，一路顺风", "一般将来时 (will do / be going to do)"],
  [13, "The Greenwood Boys", "绿林少年", "将来进行时态 (will be doing)"],
  [14, "Do you speak English?", "你会讲英语吗？", "过去完成时态 (had done) 在叙事中的应用"],
  [15, "Good news", "佳音", "直接引语转化为间接引语的基本原则"],
  [16, "A polite request", "礼貌的请求", "真实条件句与虚拟语气初步体验"],
  [17, "Always young", "青春常驻", "情态动词 must, have to, need 的辨析"],
  [18, "He often does this!", "他经常这样做！", "频度副词位置与一般现在时习惯行为"],
  [19, "Sold out", "票已售完", "情态动词 may / might 表示客观推测"],
  [20, "One man in a boat", "独坐孤舟", "动名词 (doing) 做主语与介词宾语"],
  [21, "Mad or not?", "疯了吗？", "动名词与动词不定式辨析 (stop doing / stop to do)"],
  [22, "A glass envelope", "玻璃信封", "定语从句入门 (who, whom, which, that)"],
  [23, "A new house", "新居", "完成时态的持续性动词与短暂性动词区别"],
  [24, "It could be worse", "情况可能更糟", "第一单元综合复习与核心句型总结"],
  [25, "Do the English speak English?", "英国人讲的是英语吗？", "并列连词 and, but, so, however 连接复合句"],
  [26, "The best art critics", "最佳艺术评论家", "现在完成进行时 (have been doing) 持续动作"],
  [27, "A wet night", "雨夜", "时间状语从句 (when, while, as) 精准运用"],
  [28, "No parking", "禁止停车", "原因状语从句 (because, as, since)"],
  [29, "Taxi!", "出租车！", "方式状语与副词构成规则"],
  [30, "Football or polo?", "足球还是马球？", "地点状语与空间介词搭配"],
  [31, "Success story", "成功者的故事", "过去完成进行时 (had been doing) 在长故事中的运用"],
  [32, "Shopping made easy", "购物变得容易了", "形式宾语 it 与动名词结构"],
  [33, "Out of the darkness", "冲出黑暗", "方向性动介词 into, out of, through, across"],
  [34, "Quick work", "破案神速", "被动语态中动作执行者 by sb 的呈现"],
  [35, "Stop thief!", "捉贼！", "现在分词做伴随状语与时间状语"],
  [36, "Across the Channel", "横渡海峡", "将来完成时态 (will have done)"],
  [37, "The Olympic Games", "奥林匹克运动会", "一般将来时被动语态 (will be held)"],
  [38, "Everything except the weather", "除了天气都好", "介词 except, besides, except for 区别"],
  [39, "Am I all right?", "我安然无恙吗？", "间接引语中一般疑问句引出 (ask whether/if)"],
  [40, "Food and talk", "进餐与交谈", "非谓语动词做定语与交谈礼仪"],
  [41, "Do you call that a hat?", "你把那个叫帽子吗？", "感叹句与带有修辞色彩的陈述句"],
  [42, "Not very musical", "并不很懂音乐", "动词后接双宾语的介词转换 (to vs for)"],
  [43, "Over the South Pole", "飞越竞争极", "冠词在地理专有名词中的运用规则"],
  [44, "Through the forest", "穿过森林", "动词短语与介词搭配 (look through, go through)"],
  [45, "Clear conscience", "问心无愧", "情态动词过去推测 (must have done / can't have done)"],
  [46, "Expensive and uncomfortable", "既昂贵又受罪", "并列形容词做表语与反义转折"],
  [47, "A thirsty ghost", "嗜酒的鬼魂", "幽默小品文叙事手法与从句衔接"],
  [48, "Did you want to tell me something?", "你想对我谈点什么吗？", "第二单元总结：时态体系进阶与长句解析"],
  [49, "The end of a dream", "美梦破灭", "从句套从句的复合长句解构"],
  [50, "Taken for a ride", "被骗了", "英语经典习语与双关语修辞手法"],
  [51, "Reward for virtue", "善举的报酬", "让步状语从句 (although, though, even if)"],
  [52, "A pretty carpet", "漂亮的地毯", "现在完成时与被动语态结合 (has been made)"],
  [53, "Hot snake", "触电的蛇", "过去进行时与一般过去时交织的惊险故事"],
  [54, "Sticky fingers", "粘糊糊的手指", "动词不定式做状语与做补语辨析"],
  [55, "Not a gold mine", "并非金矿", "反义疑问句规则与修辞反问语气"],
  [56, "Faster than sound!", "比声音还快！", "倍数与程度比较表达 (three times faster than)"],
  [57, "Can I help you, madam?", "夫人，您要买什么？", "商场交际与情态动词礼貌表达"],
  [58, "A blessing in disguise?", "因祸得福？", "定语从句先行词为整句话的 which 从句"],
  [59, "In or out?", "进来还是出去？", "动词短语小品词 (in, out, off, up) 的多义性"],
  [60, "The future", "未来", "将来时态大家族：多种表达将来方式的语义差别"],
  [61, "Trouble with the Picasso", "毕加索画像的麻烦", "名词从句作主语和同位语"],
  [62, "After the fire", "大火之后", "分词短语作原因和时间状语"],
  [63, "She was not amused", "她并不觉得好笑", "过去分词作形容词 (amused, amused vs amusing)"],
  [64, "The Channel Tunnel", "海峡隧道", "被动语态各种时态综合实战运用"],
  [65, "Jumbo versus the police", "小飞象与警察", "幽默新闻写作手法与短评结构"],
  [66, "Sweet as honey!", "甜得像蜜！", "比喻句式 as... as... 与同级比较"],
  [67, "Volcanoes", "火山", "科普说明文写作语调与客观事实陈述"],
  [68, "Persistent", "坚持不懈", "持续性动作与现在完成进行时深化"],
  [69, "But not murder!", "但不是谋杀！", "悬疑故事铺垫与反转情节构建"],
  [70, "Red for danger", "红色意味着危险", "动名词与动名词复合结构"],
  [71, "A famous clock", "著名的大钟", "过去分词短语作后置定语"],
  [72, "A car called Bluebird", "蓝鸟汽车", "第三单元总结：叙事文与说明文句式综合"],
  [73, "The record-holder", "纪录保持者", "虚拟语气与假设条件句 (If I were... I would...)"],
  [74, "Out of the limelight", "淡出聚光灯", "非限定性定语从句 (修饰逗号前先行词)"],
  [75, "SOS", "紧急呼救", "紧急求救信号与间接引语综合"],
  [76, "April Fools' Day", "愚人节", "文化节日习俗介绍与过去时态记叙"],
  [77, "A successful operation", "成功的手术", "情态动词 + 进行时态 (must be doing)"],
  [78, "The last one?", "最后一篇？", "过渡连接词 (meanwhile, furthermore, nevertheless)"],
  [79, "By air", "乘飞机", "交通工具介词 (by plane, on foot, in a car)"],
  [80, "The Crystal Palace", "水晶宫", "历史名胜建筑描摹与被动语态"],
  [81, "Escape", "逃跑", "越狱惊险动作描写与时间从句紧密配合"],
  [82, "Monster or fish?", "怪物还是鱼？", "神秘未知物探索与证据递进"],
  [83, "After the election", "大选之后", "政治社会新闻评述与未来时态推测"],
  [84, "On strike", "罢工", "劳资罢工事件报道与因果连词"],
  [85, "Never too old to learn", "活到老，学到老", "哲理性格言与老年生活特写"],
  [86, "Out of control", "失控", "突发事故机械失灵救援行动描写"],
  [87, "A perfect alibi", "无可挑剔的不在场证明", "法庭推理与不在场逻辑链条推演"],
  [88, "Trapped in a mine", "困于矿井", "地质灾害救援与时间紧迫感烘托"],
  [89, "A slip of the tongue", "口误", "社交场合口误闹剧与尴尬化解"],
  [90, "What's for supper?", "晚饭吃什么？", "家庭温馨日常与菜肴准备从句"],
  [91, "Three men in a basket", "热气球上的三个人", "高空气球探险与惊险降落过程"],
  [92, "Asking for trouble", "自讨苦吃", "惯用习语搭配与告诫性叙述"],
  [93, "A noble gift", "崇高的礼物", "自由女神像历史传奇与两国友谊"],
  [94, "Future champions", "未来的冠军", "青少年体育训练与奥运苗子培养"],
  [95, "A fantasy", "幻想", "科幻文学幻想世界与超现实描写"],
  [96, "The dead return", "亡者归来", "第二册全篇结业综合提升：经典大结局"]
];

// 3. Raw Metadata for Book 3 (60 lessons)
const B3_RAW = [
  [1, "A puma at large", "逃遁的美洲狮", "严谨客观新闻报道与目击证据链构建"],
  [2, "Thirteen equals one", "十三等于一", "乡村钟楼奇闻与幽默巧合叙事"],
  [3, "An unknown goddess", "无名女神", "爱琴海考古发掘与非限定性定语从句"],
  [4, "The double life of Alfred Bloggs", "阿尔弗雷德的双重生活", "社会阶层心理对比与虚荣的反讽"],
  [5, "The facts", "确切事实", "法庭证词陈述与间接引语严密转述"],
  [6, "Smash-and-grab", "砸橱窗抢劫", "短平快动作分解与紧凑悬念叙事"],
  [7, "Mutilated ladies", "残钞鉴别", "英格兰银行科研鉴定与精密被动语态"],
  [8, "A famous monastery", "著名修道院", "阿尔卑斯山圣伯纳犬与人道主义救援"],
  [9, "Flying cats", "飞猫", "动物奇特生理现象与纽约高楼生还奇迹"],
  [10, "The loss of the Titanic", "泰坦尼克号的沉没", "经典历史悲剧与虚拟语气假设反思"],
  [11, "Not guilty", "无罪释放", "英美法系辩护逻辑与陪审团心理"],
  [12, "Life on a desert island", "荒岛生活", "生存哲学、鲁滨逊情结与回归自然反思"],
  [13, "'It's only me'", "'是我，别怕'", "万圣节装鬼恶作剧与幽默错位"],
  [14, "A noble gangster", "贵族侠盗", "十七世纪传奇义贼与贵族身份反差"],
  [15, "Fifty pence worth of trouble", "五十便士的麻烦", "儿童执拗心理与生活小闹剧"],
  [16, "Mary had a little lamb", "玛丽有一只小羊羔", "经典欧美童谣原型与校园趣闻"],
  [17, "The longest suspension bridge", "最长的悬索桥", "现代桥梁力学工程与博斯普鲁斯海峡"],
  [18, "Electric currents in modern art", "现代艺术中的电流", "现代雕塑艺术批判与讽刺美学"],
  [19, "A very dear cat", "一只价值昂贵的猫", "富豪爱猫绑架案与赎金讽刺喜剧"],
  [20, "Pioneer pilots", "飞行先驱", "人类早期航空壮举与英吉利海峡飞跃"],
  [21, "Daniel Mendoza", "丹尼尔·门多萨", "现代科学拳击史先驱人物传记"],
  [22, "By heart", "熟记在心", "戏剧舞台忘词危机与临场急智救场"],
  [23, "One man's meat is another man's poison", "各有所好", "跨文化人类学与全球饮食风俗差异"],
  [24, "A skeleton in the cupboard", "家丑不可外扬", "英国名门望族秘密与讽刺文学笔法"],
  [25, "The Cutty Sark", "卡蒂萨克号", "十九世纪著名运茶帆船历史传奇"],
  [26, "Wanted: a large biscuit tin", "征集大饼干盒", "铸币厂硬币储蓄与民间幽默募捐"],
  [27, "Nothing to sell and nothing to buy", "不图买卖", "跳蚤市场古董收藏与人情冷暖"],
  [28, "Five pounds too dear", "贵了五英镑", "艺术拍卖行竞价博弈与戏剧性反转"],
  [29, "Funny or not?", "可笑还是不可笑？", "不同国家幽默感文化差异深度解析"],
  [30, "The death of a ghost", "幽灵之死", "古堡闹鬼传说与近代科学侦破揭秘"],
  [31, "A lovable eccentric", "可爱的怪人", "英国怪癖绅士特立独行的人格魅力"],
  [32, "A lost ship", "沉船寻踪", "水下考古潜水探险与深海打捞"],
  [33, "A day to remember", "难忘的一天", "荒诞遭遇与记忆深处的人生节点"],
  [34, "A happy discovery", "幸运的发现", "洞穴壁画意外发现与史前艺术瑰宝"],
  [35, "Justice was done", "正义得到伸张", "法律裁决与法理人情的博弈平衡"],
  [36, "A chance in a million", "百万分之一的机会", "极低概率巧合事件与命运交织"],
  [37, "The West Haven Express", "西港快车", "铁道列车晚点与乘客集体幽默应对"],
  [38, "The first calendar", "最早的日历", "古代文明天文学与历法起源考古"],
  [39, "Nothing to worry about", "不必担忧", "高空跳伞特情处置与冷静心理"],
  [40, "Who's who", "名人录", "名流社交圈浮夸生态与荒诞讽刺"],
  [41, "Illusions of pastoral peace", "宁静田园生活的幻象", "反田园浪漫主义批判性议论文"],
  [42, "Modern cavemen", "现代穴居人", "地下深洞极限探险与现代地质科考"],
  [43, "Fully insured", "全额保险", "财产保险欺诈与侦探反侦察博弈"],
  [44, "Speed and comfort", "舒适与速度", "现代交通革命对人类生活节奏重塑"],
  [45, "The power of the press", "新闻界的力量", "第四权力新闻自由与社会公义监督"],
  [46, "Do it yourself", "自己动手", "西方DIY家装文化与动手能力培养"],
  [47, "Too high a price?", "代价过高？", "工业化进步与自然生态破坏反思"],
  [48, "The silent village", "沉默的村庄", "战争创伤记忆与历史遗址沉默纪念"],
  [49, "The ideal detective", "理想的侦探", "侦探文学典范与福尔摩斯式推理范式"],
  [50, "New Year resolutions", "新年的决心", "新年立志心理机制与自律哲理"],
  [51, "Predicting the future", "预测未来", "科学预测与占卜迷信的历史分野"],
  [52, "Mud is mud", "泥土就是泥土", "唯物主义科学态度与本质探究"],
  [53, "In the public interest", "为了公众利益", "公共政策制定与公民知情权平衡"],
  [54, "Instinct or cleverness?", "本能还是聪颖？", "动物智力与直觉本能的生物学实验"],
  [55, "From the earth: Greetings", "来自地球的问候", "旅行者号金唱片与地外文明通讯探索"],
  [56, "Our neighbour, the river", "我们的邻居，河流", "河流对城市文明滋养与人水共生关系"],
  [57, "Back in the old days", "回到过去", "怀旧情怀与现代技术进步辩证思考"],
  [58, "A spot of bother", "一点小麻烦", "英式冷幽默客套话语与窘境应对"],
  [59, "Collecting", "收藏", "人类收藏癖好心理学剖析与物我关系"],
  [60, "Too early and too late", "太早和太晚", "第三册压轴哲理结语：时机、岁月与生命顿悟"]
];

function getUnitName(bookId, num) {
  if (bookId === 1) {
    if (num <= 24) return "第一单元 (第1-24课) 基础日常与物主代词";
    if (num <= 48) return "第二单元 (第25-48课) 存在句型与现在进行时";
    if (num <= 72) return "第三单元 (第49-72课) 一般现在时与一般过去时";
    if (num <= 96) return "第四单元 (第73-96课) 问路与形容词比较级";
    if (num <= 120) return "第五单元 (第97-120课) 冠词不定式与过去完成时";
    return "第六单元 (第121-144课) 定语从句、被动语态与综合结业";
  }
  if (bookId === 2) {
    if (num <= 24) return "第一单元 (第1-24课) 简单句型与核心时态";
    if (num <= 48) return "第二单元 (第25-48课) 复合句与非谓语动词";
    if (num <= 72) return "第三单元 (第49-72课) 语篇修辞与从句深化";
    return "第四单元 (第73-96课) 虚拟语气与结业综合实战";
  }
  if (num <= 20) return "第一单元 (第1-20课) 经典叙事与紧凑句式";
  if (num <= 40) return "第二单元 (第21-40课) 传奇人物与文化风俗";
  return "第三单元 (第41-60课) 议论文构架与哲理思辨";
}

function createCurriculumLesson(bookId, num, titleEn, titleZh, grammar) {
  const lessonId = `${bookId}-${num}`;
  const unit = getUnitName(bookId, num);

  let dialogue = [];
  let words = [];

  const mainWordCandidate = titleEn
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'you', 'are', 'what', 'this', 'that', 'with'].includes(w.toLowerCase()))[0] || 'lesson';
  
  const mainWord = mainWordCandidate.toLowerCase();

  if (bookId === 1) {
    dialogue = [
      { speaker: "Speaker A", en: `Excuse me, could you tell me about ${titleEn.toLowerCase()}?`, zh: `请原谅，您能给我讲讲关于“${titleZh}”吗？` },
      { speaker: "Speaker B", en: `Certainly! In Lesson ${num}, we focus on ${grammar.toLowerCase()}.`, zh: `当然可以！在第${num}课中，我们重点研习${grammar}。` },
      { speaker: "Speaker A", en: `That sounds very practical. Let's practice saying each sentence aloud.`, zh: `这听起来非常实用。让我们大声朗读练习每个句子。` },
      { speaker: "Speaker B", en: `Practice makes perfect. Listen carefully and repeat after the native voice.`, zh: `熟能生巧。请仔细聆听并跟读纯正地道的原版发音。` },
      { speaker: "Speaker A", en: `Thank you very much. I will practice typing and recitation now.`, zh: `非常感谢！我现在就开始进行打字和背诵专训。` }
    ];

    words = [
      { id: `${lessonId}-1`, word: mainWord, phonetic: `/${mainWord}/`, pos: "n.", meaning: `核心词汇：${titleZh}`, example: `Remember the word "${mainWord}" in Lesson ${num}.`, exampleZh: `牢记第${num}课核心生词 "${mainWord}"。` },
      { id: `${lessonId}-2`, word: "practice", phonetic: "/ˈpræktɪs/", pos: "n.&v.", meaning: "练习，实践，操练", example: "Daily practice is the key to mastering English.", exampleZh: "每日勤练是掌握英语的关键。" },
      { id: `${lessonId}-3`, word: "sentence", phonetic: "/ˈsentəns/", pos: "n.", meaning: "句子，句法", example: "Read this useful sentence aloud.", exampleZh: "请大声朗读这个实用的句子。" },
      { id: `${lessonId}-4`, word: "dialogue", phonetic: "/ˈdaɪəlɒɡ/", pos: "n.", meaning: "对话，交谈", example: "Listen to the dialogue between the two speakers.", exampleZh: "聆听两位发言者之间的日常对话。" }
    ];
  } else if (bookId === 2) {
    dialogue = [
      { speaker: "Narrator", en: `Last week, an interesting event happened regarding ${titleEn.toLowerCase()}.`, zh: `上周发生了一件关于“${titleZh}”的趣事。` },
      { speaker: "Narrator", en: `Everyone in the neighbourhood was talking about it with great enthusiasm.`, zh: `街坊邻里所有人都在兴致勃勃地谈论着这件事情。` },
      { speaker: "Narrator", en: `As we know, mastering ${grammar.toLowerCase()} helps us express this story clearly.`, zh: `正如我们所知，熟练掌握${grammar}能帮助我们准确生动地描绘这个故事。` },
      { speaker: "Narrator", en: `When the final surprise was revealed, everyone laughed with delight.`, zh: `当最后的结局意外揭晓时，大家都不禁开心地笑了起来。` },
      { speaker: "Narrator", en: `It turned out to be an unforgettable experience for all of us.`, zh: `事实证明，这对我们所有人而言都是一段难以忘怀的精彩经历。` }
    ];

    words = [
      { id: `${lessonId}-1`, word: mainWord, phonetic: `/${mainWord}/`, pos: "n.", meaning: `核心词：${titleZh}`, example: `This narrative centers around ${mainWord}.`, exampleZh: `本篇叙事紧密围绕 "${mainWord}" 展开。` },
      { id: `${lessonId}-2`, word: "narrative", phonetic: "/ˈnærətɪv/", pos: "n.", meaning: "叙述，记叙文", example: "A lively narrative captures the reader's attention.", exampleZh: "生动的叙述紧紧抓住了读者的注意力。" },
      { id: `${lessonId}-3`, word: "expression", phonetic: "/ɪkˈspreʃn/", pos: "n.", meaning: "表达，词语，措辞", example: "Learn to use authentic English expressions.", exampleZh: "学会使用地道地道的英语表达。" },
      { id: `${lessonId}-4`, word: "experience", phonetic: "/ɪkˈspɪəriəns/", pos: "n.", meaning: "经历，体验，经验", example: "It was truly a remarkable learning experience.", exampleZh: "这真是一次卓越非凡的学习经历。" }
    ];
  } else {
    dialogue = [
      { speaker: "Narrator", en: `In our examination of ${titleEn.toLowerCase()}, several fascinating questions arise.`, zh: `在我们审视“${titleZh}”这一课题时，几个发人深省的问题浮现出来。` },
      { speaker: "Narrator", en: `Historians and observers have long debated the true significance of these events.`, zh: `历史学家与观察家们长期以来一直在探讨这些历史事件的真正深远意义。` },
      { speaker: "Narrator", en: `Through precise reasoning and ${grammar.toLowerCase()}, we uncover the underlying principles.`, zh: `通过缜密的逻辑推导与${grammar}，我们逐步揭开了其深层的规律法则。` },
      { speaker: "Narrator", en: `Indeed, human nature has remained remarkably consistent across the centuries.`, zh: `的确，纵观千百年的历史长河，人类的天性始终保持着惊人的一致性。` },
      { speaker: "Narrator", en: `Such timeless reflections continue to inspire learners and scholars today.`, zh: `这样超越时空的深刻洞察，直至今日依然在启迪着求学者与思考者。` }
    ];

    words = [
      { id: `${lessonId}-1`, word: mainWord, phonetic: `/${mainWord}/`, pos: "n.", meaning: `核心词：${titleZh}`, example: `The essay provides deep insights into ${mainWord}.`, exampleZh: `本文对 "${mainWord}" 提供了深邃的洞察见解。` },
      { id: `${lessonId}-2`, word: "principle", phonetic: "/ˈprɪnsəpl/", pos: "n.", meaning: "原则，法则，原理", example: "Grasp the underlying grammatical principles.", exampleZh: "掌握深层的语法精髓与逻辑法则。" },
      { id: `${lessonId}-3`, word: "reflection", phonetic: "/rɪˈflekʃn/", pos: "n.", meaning: "反思，深思，映现", example: "Philosophical reflection enriches one's understanding.", exampleZh: "哲理性的深思极大地丰富了人们的认知。" },
      { id: `${lessonId}-4`, word: "scholar", phonetic: "/ˈskɒlə(r)/", pos: "n.", meaning: "学者，专家", example: "Scholars from all over the world gathered here.", exampleZh: "来自世界各地的学者专家齐聚于此。" }
    ];
  }

  return {
    id: lessonId,
    bookId,
    lessonNumber: num,
    titleEn,
    titleZh,
    unitGroup: unit,
    category: `第${bookId}册 · 第${num}课精读专训`,
    grammarFocus: grammar,
    grammarNotes: [
      `本课为《新概念英语》第${bookId}册核心课文，重点解析：${grammar}。`,
      `熟读课文、掌握句式语序，并在打字练习中强化词汇拼写与语感记忆。`,
      `配合真人朗读音轨反复跟读，攻克听力与发音难点。`
    ],
    dialogue,
    vocabulary: words
  };
}

function build() {
  // Read existing detailed lessons if available so we preserve handcrafted ones
  let existingB1 = [];
  let existingB2 = [];
  let existingB3 = [];
  try {
    const rawB1 = fs.readFileSync(path.join(__dirname, '../src/data/nceBook1Data.ts'), 'utf8');
    const match1 = rawB1.match(/export const BOOK1_LESSONS: Lesson\[\] = (\[[\s\S]*?\]);\s*$/);
    if (match1) existingB1 = eval(match1[1]);
  } catch (e) {}

  try {
    const rawB2 = fs.readFileSync(path.join(__dirname, '../src/data/nceBook2Data.ts'), 'utf8');
    const match2 = rawB2.match(/export const BOOK2_LESSONS: Lesson\[\] = (\[[\s\S]*?\]);\s*$/);
    if (match2) existingB2 = eval(match2[1]);
  } catch (e) {}

  try {
    const rawB3 = fs.readFileSync(path.join(__dirname, '../src/data/nceBook3Data.ts'), 'utf8');
    const match3 = rawB3.match(/export const BOOK3_LESSONS: Lesson\[\] = (\[[\s\S]*?\]);\s*$/);
    if (match3) existingB3 = eval(match3[1]);
  } catch (e) {}

  const mapB1 = new Map(existingB1.map(l => [l.lessonNumber, l]));
  const mapB2 = new Map(existingB2.map(l => [l.lessonNumber, l]));
  const mapB3 = new Map(existingB3.map(l => [l.lessonNumber, l]));

  console.log("Building Book 1 (144 lessons)...");
  const b1Lessons = B1_RAW.map(([num, en, zh, grammar]) => {
    return mapB1.get(num) || createCurriculumLesson(1, num, en, zh, grammar);
  });
  
  console.log("Building Book 2 (96 lessons)...");
  const b2Lessons = B2_RAW.map(([num, en, zh, grammar]) => {
    return mapB2.get(num) || createCurriculumLesson(2, num, en, zh, grammar);
  });

  console.log("Building Book 3 (60 lessons)...");
  const b3Lessons = B3_RAW.map(([num, en, zh, grammar]) => {
    return mapB3.get(num) || createCurriculumLesson(3, num, en, zh, grammar);
  });

  const b1Content = `import { Lesson } from './types.ts';\n\nexport const BOOK1_LESSONS: Lesson[] = ${JSON.stringify(b1Lessons, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../src/data/nceBook1Data.ts'), b1Content, 'utf8');

  const b2Content = `import { Lesson } from './types.ts';\n\nexport const BOOK2_LESSONS: Lesson[] = ${JSON.stringify(b2Lessons, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../src/data/nceBook2Data.ts'), b2Content, 'utf8');

  const b3Content = `import { Lesson } from './types.ts';\n\nexport const BOOK3_LESSONS: Lesson[] = ${JSON.stringify(b3Lessons, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../src/data/nceBook3Data.ts'), b3Content, 'utf8');

  console.log(`Successfully generated! B1: ${b1Lessons.length}, B2: ${b2Lessons.length}, B3: ${b3Lessons.length}. Total: ${b1Lessons.length + b2Lessons.length + b3Lessons.length} lessons.`);
}

build();
