// assets/js/knowledge-data.js
// 陶藝與釉藥知識庫 - 分類樹狀結構 (終極升級版 - 支援深度錨點)

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

{ id: "shaping-6", title: "盤築法是什麼？", tag: "手捏成型", url: "./book/shaping/shaping-6.html" },
{ id: "shaping-7", title: "陶藝盤築技巧", tag: "手捏成型", url: "./book/shaping/shaping-7.html" },
{ id: "shaping-8", title: "如何讓盤築作品不倒？", tag: "手捏成型", url: "./book/shaping/shaping-8.html" },
{ id: "shaping-9", title: "盤築成型常見問題", tag: "手捏成型", url: "./book/shaping/shaping-9.html" },
{ id: "shaping-10", title: "大型作品如何盤築？", tag: "手捏成型", url: "./book/shaping/shaping-10.html" }

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
            { id: "glaze_basics-1", title: "何謂釉藥、釉的本質？", tag: "基礎理論", url: "./book/glaze_basics/glaze_basics-1.html" },
            { id: "glaze_basics-2", title: "認識釉藥三大元素", tag: "基礎理論", url: "./book/glaze_basics/glaze_basics-2.html" },
            { id: "glaze_basics-3", title: "釉的種類？", tag: "基礎理論", url: "./book/glaze_basics/glaze_basics-3.html" },
            { id: "glaze_basics-4", title: "玻璃質如何結合在陶瓷？揭開釉藥燒熔的奧秘？", tag: "基礎理論", url: "./book/glaze_basics/glaze_basics-4.html" },
            { id: "glaze_basics-5", title: "上釉有那些方式？", tag: "實務技法", url: "./book/glaze_basics/glaze_basics-5.html" },
            { id: "glaze_basics-6", title: "何謂釉上彩與釉下彩？", tag: "呈色與裝飾", url: "./book/glaze_basics/glaze_basics-6.html" },
            { id: "glaze_basics-7", title: "金屬氧化物的發色：各種不同的金屬氧化物呈色", tag: "呈色與裝飾", url: "./book/glaze_basics/glaze_basics-7.html" }
        ]
    },
    {
        category: "窯燒知識",
        icon: "fa-fire-burner",
        articles: [
            { id: "firing-1", title: "燒窯溫度曲線設計", tag: "實務操作", url: "./book/firing/firing-1.html" },
            { id: "firing-2", title: "什麼是素燒與釉燒？", tag: "燒成觀念", url: "./book/firing/firing-2.html" },
            { id: "firing-3", title: "燒成技術~氧化燒", tag: "氣氛控制", url: "./book/firing/firing-3.html" },
            { id: "firing-4", title: "燒成技術~還原燒", tag: "氣氛控制", url: "./book/firing/firing-4.html" }
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