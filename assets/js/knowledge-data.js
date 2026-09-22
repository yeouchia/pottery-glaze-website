// assets/js/knowledge-data.js
// 陶藝與釉藥知識庫 - 分類樹狀結構 (標籤完美對應升級版)

const knowledgeTree = [
    {
        category: "陶藝入門",
        icon: "fa-seedling",
        articles: [
            { id: "intro-1", title: "陶土與瓷土怎麼選？新手買泥全指南", tag: "陶土與材料", url: "./book/intro/intro-1.html" },
            { id: "intro-2", title: "陶藝是什麼？探索陶的起源與特性", tag: "認識陶藝", url: "./book/intro/intro-2.html" },
            { id: "intro-3", title: "陶藝是什麼？", tag: "認識陶藝", url: "./book/intro/intro-3.html" },
            { id: "intro-4", title: "陶瓷是什麼？", tag: "認識陶藝", url: "./book/intro/intro-4.html" },
            { id: "intro-5", title: "陶藝與陶瓷有什麼不同？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-5.html" },
            { id: "intro-6", title: "陶藝的基本製作流程", tag: "陶藝製作流程", url: "./book/intro/intro-6.html" },
            { id: "intro-7", title: "初學者如何開始學陶藝？", tag: "認識陶藝", url: "./book/intro/intro-7.html" },
            { id: "intro-8", title: "學陶藝需要準備什麼？", tag: "認識陶藝", url: "./book/intro/intro-8.html" },
            { id: "intro-9", title: "什麼是揉土？", tag: "陶藝製作流程", url: "./book/intro/intro-9.html" },
            { id: "intro-10", title: "什麼是修坯？", tag: "陶藝製作流程", url: "./book/intro/intro-10.html" },
            { id: "intro-11", title: "陶土的保存方法？", tag: "陶土與材料", url: "./book/intro/intro-11.html" },
            { id: "intro-12", title: "陶土從哪裡得來？", tag: "陶土與材料", url: "./book/intro/intro-12.html" },
            { id: "intro-13", title: "陶土去哪買？", tag: "陶土與材料", url: "./book/intro/intro-13.html" },
            { id: "intro-14", title: "陶土硬掉怎處理？", tag: "初學者常見問題", url: "./book/intro/intro-14.html" },
            { id: "intro-15", title: "自己可以調配陶土嗎？", tag: "陶土與材料", url: "./book/intro/intro-15.html" },
            { id: "intro-16", title: "陶土是由什麼組成？", tag: "陶土與材料", url: "./book/intro/intro-16.html" },
            { id: "intro-17", title: "陶土為什麼可以塑形？", tag: "陶土與材料", url: "./book/intro/intro-17.html" },
            { id: "intro-18", title: "陶土為什麼會縮收？", tag: "初學者常見問題", url: "./book/intro/intro-18.html" },
            { id: "intro-19", title: "陶土有哪些種類？", tag: "陶土與材料", url: "./book/intro/intro-19.html" },
            { id: "intro-20", title: "不同陶土可以混合嗎？", tag: "陶土與材料", url: "./book/intro/intro-20.html" },
            { id: "intro-21", title: "陶土收縮率怎麼測？", tag: "陶土與材料", url: "./book/intro/intro-21.html" },
            { id: "intro-22", title: "陶土的燒結溫度怎麼判斷？", tag: "陶土與材料", url: "./book/intro/intro-22.html" },
            { id: "intro-23", title: "陶土為什麼會裂？", tag: "初學者常見問題", url: "./book/intro/intro-23.html" },
            { id: "intro-24", title: "陶土為什麼要燒？", tag: "初學者常見問題", url: "./book/intro/intro-24.html" },
            { id: "intro-25", title: "陶土裂掉還能救嗎？", tag: "初學者常見問題", url: "./book/intro/intro-25.html" },
            { id: "intro-26", title: "陶土和瓷土有什麼不同？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-26.html" },
            { id: "intro-27", title: "陶土和瓷土哪一種比較適合初學者？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-27.html" },
            { id: "intro-28", title: "陶土和瓷土可以混在一起使用嗎？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-28.html" },
            { id: "intro-29", title: "陶土和瓷土燒成溫度有什麼不同？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-29.html" },
            { id: "intro-30", title: "陶土和瓷土哪一種比較好？", tag: "陶與瓷的基本知識", url: "./book/intro/intro-30.html" },
            { id: "intro-31", title: "高嶺土是什麼？陶瓷材料中的重要黏土原料", tag: "陶土與材料", url: "./book/intro/intro-31.html" },
            { id: "intro-32", title: "陶土中影響燒成後的呈色原因是什麼？", tag: "陶土與材料", url: "./book/intro/intro-32.html" },
            { id: "intro-33", title: "球黏土（Ball Clay）是什麼？陶瓷材料中的塑性黏土", tag: "陶土與材料", url: "./book/intro/intro-33.html" },
            { id: "intro-34", title: "陶土中的石英、長石和黏土各有什麼作用？", tag: "陶土與材料", url: "./book/intro/intro-34.html" },
            { id: "intro-35", title: "陶土中的可塑性與非塑性材料是什麼？", tag: "陶土與材料", url: "./book/intro/intro-35.html" },
            { id: "intro-36", title: "陶土的燒成方式，氧化燒與還原燒的結果差異變化？", tag: "初學者常見問題", url: "./book/intro/intro-36.html" },
            { id: "intro-37", title: "同一種陶土為什麼燒出不同結果？溫度、氣氛、時間與冷卻的影響", tag: "初學者常見問題", url: "./book/intro/intro-37.html" },
            { id: "intro-38", title: "陶土燒成後為什麼會變形、裂開或膨脹？", tag: "初學者常見問題", url: "./book/intro/intro-38.html" },
            { id: "intro-39", title: "陶土吸水率是什麼？從多孔陶土到緻密陶瓷的差異", tag: "陶土與材料", url: "./book/intro/intro-39.html" },
            { id: "intro-40", title: "如何燒製出密度不同的陶土？孔洞與密度的變化形成", tag: "陶土與材料", url: "./book/intro/intro-40.html" }
        ]
    },
    {
        category: "成型技法",
        icon: "fa-hands-holding",
        articles: [
            { id: "shaping-1", title: "陶土的成形技法有哪些主要方式？", tag: "成型技法", url: "./book/shaping/shaping-1.html" },
            { id: "shaping-2", title: "手捏陶藝是什麼？", tag: "手捏成型", url: "./book/shaping/shaping-2.html" },
            { id: "shaping-3", title: "手捏陶藝基本技法", tag: "手捏成型", url: "./book/shaping/shaping-3.html" },
            { id: "shaping-4", title: "手捏成型常見問題", tag: "手捏成型", url: "./book/shaping/shaping-4.html" },
            { id: "shaping-5", title: "手捏陶工作桌的選擇與材質", tag: "手捏成型", url: "./book/shaping/shaping-5.html" },
            { id: "shaping-6", title: "盤築法是什麼？", tag: "盤築成型", url: "./book/shaping/shaping-6.html" },
            { id: "shaping-7", title: "陶藝盤築技巧", tag: "盤築成型", url: "./book/shaping/shaping-7.html" },
            { id: "shaping-8", title: "如何讓盤築作品不倒？", tag: "盤築成型", url: "./book/shaping/shaping-8.html" },
            { id: "shaping-9", title: "盤築成型常見問題", tag: "盤築成型", url: "./book/shaping/shaping-9.html" },
            { id: "shaping-10", title: "大型作品如何盤築？", tag: "盤築成型", url: "./book/shaping/shaping-10.html" },
            { id: "shaping-11", title: "土板成型是什麼？", tag: "陶板成型", url: "./book/shaping/shaping-11.html" },
            { id: "shaping-12", title: "陶板如何製作？", tag: "陶板成型", url: "./book/shaping/shaping-12.html" },
            { id: "shaping-13", title: "土板厚度如何控制？", tag: "陶板成型", url: "./book/shaping/shaping-13.html" },
            { id: "shaping-14", title: "土板為什麼會翹曲？", tag: "陶板成型", url: "./book/shaping/shaping-14.html" },
            { id: "shaping-15", title: "土板作品如何組合？", tag: "陶板成型", url: "./book/shaping/shaping-15.html" },
            { id: "shaping-16", title: "模具成型是什麼？需要什麼設備？", tag: "石膏模具", url: "./book/shaping/shaping-16.html" },
            { id: "shaping-17", title: "陶藝石膏模具的製作", tag: "石膏模具", url: "./book/shaping/shaping-17.html" },
            { id: "shaping-18", title: "單面模、多片模", tag: "石膏模具", url: "./book/shaping/shaping-18.html" },
            { id: "shaping-19", title: "壓模成型、注將成型", tag: "石膏模具", url: "./book/shaping/shaping-19.html" },
            { id: "shaping-20", title: "模具成型的優缺點", tag: "石膏模具", url: "./book/shaping/shaping-20.html" },
            { id: "shaping-21", title: "手拉坯成型是什麼？陶藝最常見的輪製成型法", tag: "手拉坯", url: "./book/shaping/shaping-21.html" },
            { id: "shaping-22", title: "手拉坯為什麼要對中心？陶土定中心的重要性", tag: "手拉坯", url: "./book/shaping/shaping-22.html" },
            { id: "shaping-23", title: "手拉坯怎麼開孔與拉高？基本成型步驟", tag: "手拉坯", url: "./book/shaping/shaping-23.html" },
            { id: "shaping-24", title: "手拉坯常見問題與失敗原因", tag: "手拉坯", url: "./book/shaping/shaping-24.html" },
            { id: "shaping-25", title: "手拉坯成型後為什麼要修坯？", tag: "手拉坯", url: "./book/shaping/shaping-25.html" },
            { id: "shaping-26", title: "為什麼陶藝作品都不做成實心？都是空心造型？", tag: "成型技法", url: "./book/shaping/shaping-26.html" },
            { id: "shaping-27", title: "手拉坯成型後的坯體常用的裝飾技法？", tag: "手拉坯", url: "./book/shaping/shaping-27.html" },
            { id: "shaping-28", title: "手拉坯如何控制陶壁厚度？", tag: "手拉坯", url: "./book/shaping/shaping-28.html" },
            { id: "shaping-29", title: "擠出成型是什麼？", tag: "成型技法", url: "./book/shaping/shaping-29.html" },
            { id: "shaping-30", title: "旋壓成型是什麼？", tag: "成型技法", url: "./book/shaping/shaping-30.html" },
            { id: "shaping-31", title: "注漿成型是什麼？液態陶土如何進入石膏模具", tag: "注漿成型", url: "./book/shaping/shaping-31.html" },
            { id: "shaping-32", title: "什麼是高壓注漿？", tag: "注漿成型", url: "./book/shaping/shaping-32.html" },
            { id: "shaping-33", title: "注漿量產的馬桶是透過怎樣組合坯體？", tag: "注漿成型", url: "./book/shaping/shaping-33.html" },
            { id: "shaping-34", title: "什麼是陶瓷泥漿？為什麼要用石膏模？", tag: "注漿成型", url: "./book/shaping/shaping-34.html" },
            { id: "shaping-35", title: "注漿的過程？如何控制泥漿厚度？", tag: "注漿成型", url: "./book/shaping/shaping-35.html" }
        ]
    },
    {
        category: "實用技巧",
        icon: "fa-lightbulb",
        articles: [
            { id: "skills-1", title: "為什麼作品乾了總會裂開？", tag: "乾燥技巧", url: "./book/skills/skills-1.html" },
            { id: "skills-2", title: "乾掉的土千萬別丟！教你如何練土", tag: "陶土處理", url: "./book/skills/skills-2.html" }
        ]
    },
    {
        category: "釉藥基礎",
        icon: "fa-flask",
        articles: [
            { id: "glaze_basics-1", title: "釉陶藝釉藥基礎", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-1.html" },
            { id: "glaze_basics-2", title: "什麼是釉藥？", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-2.html" },
            { id: "glaze_basics-3", title: "釉藥的形成與作用", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-3.html" },
            { id: "glaze_basics-4", title: "釉藥與陶瓷坯體的關係", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-4.html" },
            { id: "glaze_basics-5", title: "釉藥在陶瓷中的功能", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-5.html" },
            { id: "glaze_basics-6", title: "認識釉藥的基本組成概念", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-6.html" },
            { id: "glaze_basics-7", title: "釉藥從生料到熔融的過程", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-7.html" },
      { id: "glaze_basics-8", title: "釉藥與玻璃的關係", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-8.html" },
      { id: "glaze_basics-9", title: "釉藥在生活與科技上的應用", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-9.html" },
      { id: "glaze_basics-10", title: "釉藥有毒嗎？", tag: "認識釉藥", url: "./book/glaze_basics/glaze_basics-10.html" },

      { id: "glaze_basics-11", title: "釉藥組成", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-11.html" },
      { id: "glaze_basics-12", title: "釉藥的三大基本成分", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-12.html" },
      { id: "glaze_basics-13", title: "釉藥的三大基本成分~二氧化矽 SiO₂", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-13.html" },
      { id: "glaze_basics-14", title: "釉藥的三大基本成分~氧化鋁 Al₂O₃", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-14.html" },
      { id: "glaze_basics-15", title: "釉藥的三大基本成分~助熔劑的作用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-15.html" },


   { id: "glaze_basics-16", title: "助熔劑~鹼性氧化物", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-16.html" },
   { id: "glaze_basics-17", title: "助熔劑~鹼土類氧化物", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-17.html" },
   { id: "glaze_basics-18", title: "釉藥的中性氧化物", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-18.html" },
   { id: "glaze_basics-19", title: "釉藥中的氧化物", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-19.html" },
   { id: "glaze_basics-20", title: "氧化物與釉面性質", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-20.html" },


   { id: "glaze_basics-21", title: "釉藥組成與熔融溫度", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-21.html" },
   { id: "glaze_basics-22", title: "常見釉藥原料的氧化物來源", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-22.html" },
   { id: "glaze_basics-23", title: "釉藥組成與熔融行為", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-23.html" },
   { id: "glaze_basics-24", title: "釉面硬度與耐久性", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-24.html" },
   { id: "glaze_basics-25", title: "光澤釉與霧面釉的形成", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-25.html" },
   { id: "glaze_basics-26", title: "B₂O₃ 硼氧化物與硼熔塊", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-26.html" },
   { id: "glaze_basics-27", title: "B₂O₃ 的助熔作用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-27.html" },
   { id: "glaze_basics-28", title: "釉藥原料與氧化物的關係", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-28.html" },
   { id: "glaze_basics-29", title: "氧化物之間的相互作用與比例", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-29.html" },
   { id: "glaze_basics-30", title: "釉藥配方 → 氧化物 → Seger／UMF", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-30.html" },



   { id: "glaze_basics-31", title: "熔塊（Frit）基礎：從原料到釉藥應用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-31.html" },
   { id: "glaze_basics-32", title: "熔塊（Frit）是什麼？", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-32.html" },
   { id: "glaze_basics-33", title: "為什麼要把生釉原料製成熔塊（Frit）？", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-33.html" },
   { id: "glaze_basics-34", title: "熔塊（Frit）如何製作？", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-34.html" },
   { id: "glaze_basics-35", title: "熔塊（Frit）在釉中的作用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-35.html" },
   { id: "glaze_basics-36", title: "熔塊（Frit）與生釉的差異", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-36.html" },
   { id: "glaze_basics-37", title: "不同種類熔塊（Frit）的應用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-37.html" },
   { id: "glaze_basics-38", title: "熔塊（Frit）在釉藥配方計算中的角色", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-38.html" },
   { id: "glaze_basics-39", title: "熔塊（Frit）的化學組成", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-39.html" },
   { id: "glaze_basics-40", title: "如何從輕鬆從生活中取得熔塊（Frit）", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-40.html" },

   { id: "glaze_basics-41", title: "認識「SiO₂／Al₂O₃ 線性圖」", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-41.html" },
   { id: "glaze_basics-42", title: "什麼是 SiO₂／Al₂O₃ 比例？", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-42.html" },
   { id: "glaze_basics-43", title: "SiO₂／Al₂O₃ 比例計算公式", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-43.html" },
   { id: "glaze_basics-44", title: "SiO₂／Al₂O₃線性圖表示法", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-44.html" },
   { id: "glaze_basics-45", title: "如何閱讀 SiO₂／Al₂O₃ 線性圖？", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-45.html" },
   { id: "glaze_basics-46", title: "實際案例：從配方到線性圖", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-46.html" },
   { id: "glaze_basics-47", title: "SiO₂／Al₂O₃比例與釉藥性質", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-47.html" },
   { id: "glaze_basics-48", title: "SiO₂／Al₂O₃線性圖上的釉藥配方比較", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-48.html" },
   { id: "glaze_basics-49", title: "SiO₂／Al₂O₃比例不能單獨判斷釉藥", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-49.html" },
   { id: "glaze_basics-50", title: "SiO₂／Al₂O₃線性圖的實際應用", tag: "釉藥組成", url: "./book/glaze_basics/glaze_basics-50.html" },

  { id: "glaze_basics-51", title: "釉藥原料的基本認識", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-51.html" },
  { id: "glaze_basics-52", title: "鹼金屬類／R₂O 原料", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-52.html" },
  { id: "glaze_basics-53", title: "RO 類／鹼土與二價金屬原料", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-53.html" },
  { id: "glaze_basics-54", title: "Al₂O₃／鋁質與中間體原料", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-54.html" },
  { id: "glaze_basics-55", title: "硼系原料／B₂O₃", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-55.html" },
  { id: "glaze_basics-56", title: "SiO₂／RO₂ 類網絡形成與特殊氧化物", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-56.html" },
  { id: "glaze_basics-57", title: "磷系原料／P₂O₅", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-57.html" },
  { id: "glaze_basics-58", title: "釉藥的著色氧化物", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-58.html" },
  { id: "glaze_basics-59", title: "特殊功能與特殊效果原料", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-59.html" },
  { id: "glaze_basics-60", title: "陶瓷顏料與色料", tag: "釉藥原料", url: "./book/glaze_basics/glaze_basics-60.html" },
 

  { id: "glaze_basics-61", title: "釉藥的種類與全面解析", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-61.html" },
  { id: "glaze_basics-62", title: "釉藥的基礎釉類", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-62.html" },
  { id: "glaze_basics-63", title: "依釉面效果分類", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-63.html" },
  { id: "glaze_basics-64", title: "釉藥的溫度與氣氛", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-64.html" },
  { id: "glaze_basics-65", title: "釉藥的表面質感", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-65.html" },

  { id: "glaze_basics-66", title: "釉藥的燒成", tag: "釉藥的種類", url: "./book/glaze_basics/glaze_basics-66.html" },
  { id: "glaze_basics-67", title: "釉藥的特性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-67.html" },
  { id: "glaze_basics-68", title: "釉藥的特性-透明性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-68.html" },
  { id: "glaze_basics-69", title: "釉藥的特性-乳濁性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-69.html" },
  { id: "glaze_basics-70", title: "釉藥的特性-光澤與霧面", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-70.html" },

  { id: "glaze_basics-71", title: "釉藥的熔融性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-71.html" },
  { id: "glaze_basics-72", title: "釉藥的流動性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-72.html" },
  { id: "glaze_basics-73", title: "釉藥的黏度", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-73.html" },
  { id: "glaze_basics-74", title: "釉藥的表面張力", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-74.html" },
  { id: "glaze_basics-75", title: "釉藥的收縮與膨脹", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-75.html" },
  { id: "glaze_basics-76", title: "釉藥與坯體的適合性", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-76.html" },
  { id: "glaze_basics-77", title: "釉藥的結晶", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-77.html" },
  { id: "glaze_basics-78", title: "釉藥的失透", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-78.html" },
  { id: "glaze_basics-79", title: "釉面質感的形成", tag: "釉藥的特性", url: "./book/glaze_basics/glaze_basics-79.html" },




  { id: "glaze_basics-80", title: "釉藥的呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-80.html" },
  { id: "glaze_basics-81", title: "為什麼釉藥會有顏色？", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-81.html" },
  { id: "glaze_basics-82", title: "釉藥呈色的基本原理", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-82.html" },
  { id: "glaze_basics-83", title: "金屬氧化物與呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-83.html" },
  { id: "glaze_basics-84", title: "氧化鐵呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-84.html" },
  { id: "glaze_basics-85", title: "氧化銅呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-85.html" },
  { id: "glaze_basics-86", title: "氧化鈷呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-86.html" },
  { id: "glaze_basics-87", title: "氧化鉻呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-87.html" },
  { id: "glaze_basics-88", title: "二氧化錳呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-88.html" },
  { id: "glaze_basics-89", title: "其他金屬氧化物呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-89.html" },
  { id: "glaze_basics-90", title: "釉藥發色劑與色料呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-90.html" },

  { id: "glaze_basics-91", title: "氧化燒與還原燒的呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-91.html" },
  { id: "glaze_basics-92", title: "陶土與瓷土對釉的呈色影響", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-92.html" },
  { id: "glaze_basics-93", title: "釉中結晶與呈色", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-93.html" },
  { id: "glaze_basics-94", title: "基礎色釉的調製概念", tag: "釉藥的呈色", url: "./book/glaze_basics/glaze_basics-94.html" },
  { id: "glaze_basics-95", title: "釉藥施用與調製", tag: "釉藥的應用", url: "./book/glaze_basics/glaze_basics-95.html" },
  { id: "glaze_basics-96", title: "釉藥燒成與變化", tag: "釉藥的燒成", url: "./book/glaze_basics/glaze_basics-96.html" }



        ]
    },
    {
        category: "窯燒知識",
        icon: "fa-fire-burner",
        articles: [
     
   { id: "firing-1", title: "窯爐與釉燒", tag: "窯爐與釉燒", url: "./book/firing/firing-1.html" },    
   { id: "firing-2", title: "釉藥加熱後的變化", tag: "窯爐與釉燒", url: "./book/firing/firing-2.html" }, 
   { id: "firing-3", title: "釉藥的熔融與玻璃化過程", tag: "窯爐與釉燒", url: "./book/firing/firing-3.html" }, 
   { id: "firing-4", title: "釉藥與坯體的反應", tag: "窯爐與釉燒", url: "./book/firing/firing-4.html" }, 
   { id: "firing-5", title: "釉藥未燒熟、成熟、過熟(火)", tag: "窯爐與釉燒", url: "./book/firing/firing-5.html" }, 
   { id: "firing-6", title: "窯爐燒成溫度對釉藥的影響", tag: "窯爐與釉燒", url: "./book/firing/firing-6.html" }, 
   { id: "firing-7", title: "窯爐燒成氣氛對釉藥的影響", tag: "窯爐與釉燒", url: "./book/firing/firing-7.html" }, 
   { id: "firing-8", title: "燒成曲線對釉面的影響", tag: "窯爐與釉燒", url: "./book/firing/firing-8.html" }, 
   { id: "firing-9", title: "保溫對釉藥的影響", tag: "窯爐與釉燒", url: "./book/firing/firing-9.html" }, 
   { id: "firing-10", title: "冷卻速度與釉面變化", tag: "窯爐與釉燒", url: "./book/firing/firing-10.html" }, 


   { id: "firing-11", title: "結晶形成", tag: "窯爐與釉燒", url: "./book/firing/firing-11.html" },    
   { id: "firing-12", title: "坯釉適合性與燒成", tag: "窯爐與釉燒", url: "./book/firing/firing-12.html" }, 
   { id: "firing-13", title: "常見陶藝窯爐種類與特性解析", tag: "認識窯爐", url: "./book/firing/firing-13.html" }, 
   { id: "firing-14", title: "如何選購適合的窯爐", tag: "認識窯爐", url: "./book/firing/firing-14.html" }, 
   { id: "firing-15", title: "客製化窯爐需求", tag: "認識窯爐", url: "./book/firing/firing-15.html" }, 
   { id: "firing-16", title: "電窯基本結構與運作原理", tag: "認識窯爐", url: "./book/firing/firing-16.html" }, 
   { id: "firing-17", title: "瓦斯窯基本結構與運作原理", tag: "認識窯爐", url: "./book/firing/firing-17.html" }, 




   { id: "firing-21", title: "燒窯溫度曲線設計", tag: "窯爐燒成技術", url: "./book/firing/firing-21.html" },
   { id: "firing-22", title: "什麼是素燒與釉燒？", tag: "窯爐與釉燒", url: "./book/firing/firing-22.html" },
   { id: "firing-23", title: "燒成技術~氧化燒", tag: "窯爐燒成技術", url: "./book/firing/firing-23.html" },
   { id: "firing-24", title: "燒成技術~還原燒", tag: "窯爐燒成技術", url: "./book/firing/firing-24.html" }








        ]
    },
    {
        category: "配方實驗",
        icon: "fa-vial",
        articles: [
            { id: "experiments-1", title: "釉藥的奧秘~三角座標", tag: "配方系統", url: "./book/experiments/experiments-1.html" }
        ]
    },
    {
        category: "陶釉講義 (黃老師編著)",
        icon: "fa-book-open-reader",
        articles: [
            { 
                id: "ch1_history", 
                title: "第一章 陶瓷的歷史和類型", 
                url: "./book/lecture/ch1_history.html",
                subTopics: [
                    { id: "ch1-1", title: "第一節 中國和世界陶瓷的歷史簡介" },
                    { id: "ch1-2", title: "第二節 各種陶瓷類型的探討" },
                    { id: "ch1-3", title: "第三節 陶瓷作品的時期和風格辨識" },
                    { id: "ch1-4", title: "第四節 不同文化中的陶瓷藝術" },
                    { id: "ch1-5", title: "第五節 陶瓷在不同時代和地區的重要性" }
                ]
            },
            { 
                id: "ch2_basics", 
                title: "第二章 基礎釉藥知識", 
                url: "./book/lecture/ch2_glaze_basics.html",
                subTopics: [
                    { id: "ch2-1", title: "第一節 釉藥的定義和功能" },
                    { id: "ch2-2", title: "第二節 陶瓷釉藥的常用原料" },
                    { id: "ch2-3", title: "第三節 釉藥的基本組成三大元素" },
                    { id: "ch2-4", title: "第四節 釉藥對作品的影響" },
                    { id: "ch2-5", title: "第五節 各種類型的釉藝方式" }
                ]
            },
            { 
                id: "ch3_mixing", 
                title: "第三章 釉藥調配基礎", 
                url: "./book/lecture/ch3_glaze_mixing.html",
                subTopics: [
                    { id: "ch3-1", title: "第一節 釉藥配方的基本結構瞭解" },
                    { id: "ch3-2", title: "第二節 重要材料的掌握" },
                    { id: "ch3-3", title: "第三節 三角座標法的運用" },
                    { id: "ch3-4", title: "第四節 賽格爾的計算運用" },
                    { id: "ch3-5", title: "第五節 三角座標法與賽格爾式" }
                ]
            },
            { 
                id: "ch4_application", 
                title: "第四章 釉藥施釉技術", 
                url: "./book/lecture/ch4_glaze_application.html",
                subTopics: [
                    { id: "ch4-1", title: "第一節 釉藥施釉方法的介紹" },
                    { id: "ch4-2", title: "第二節 釉藥彩繪方式的多樣性" },
                    { id: "ch4-3", title: "第三節 實際操作" }
                ]
            },
            { 
                id: "ch5_making", 
                title: "第五章 陶瓷製作與燒製過程", 
                url: "./book/lecture/ch5_pottery_making.html",
                subTopics: [
                    { id: "ch5-1", title: "第一節 陶瓷製作工具與設備" },
                    { id: "ch5-2", title: "第二節 陶瓷成形方式與技法" },
                    { id: "ch5-3", title: "第三節 釉料施加與彩繪裝飾" },
                    { id: "ch5-4", title: "第四節 乾燥與燒制" },
                    { id: "ch5-5", title: "第五節 出窯檢視與回顧" }
                ]
            },
            { 
                id: "ch6_safety", 
                title: "第六章 陶瓷工作安全與實踐環保", 
                url: "./book/lecture/ch6_safety_env.html",
                subTopics: [
                    { id: "ch6-1", title: "第一節 陶瓷作業的安全性" },
                    { id: "ch6-2", title: "第二節 可重複性原料再利用" },
                    { id: "ch6-3", title: "第三節 廢棄物處理和環境友好" }
                ]
            },
            { 
                id: "ch7_aesthetics", 
                title: "第七章 陶瓷的美學和創作", 
                url: "./book/lecture/ch7_aesthetics.html",
                subTopics: [
                    { id: "ch7-1", title: "第一節 鼓勵創意發揮" },
                    { id: "ch7-2", title: "第二節 展示和推廣陶瓷作品的討論" }
                ]
            }
        ]
    }
];

function findArticleById(articleId) {
    for (const group of knowledgeTree) {
        const found = group.articles.find(art => art.id === articleId);
        if (found) {
            return { ...found, category: group.category };
        }
    }
    return null;
}