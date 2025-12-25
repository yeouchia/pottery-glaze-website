/**
 * Lineage M v77.84 Data Module (Mage Balance Overhaul)
 * ---------------------------------------------------
 * [更新記錄 - 第五階段 v77.84_Balance]
 * * Ver 77.84 (Magic Cost Adjustment):
 * - [平衡] 大幅調升法師技能 MP 消耗，避免職業過強。
 * - [修正] 聖結界 (Immune to Harm): MP 30 -> 600。
 * - [修正] 火風暴 (Fire Storm): MP 50 -> 1000。
 * - [修正] 流星雨 (Meteor Rain): MP 100 -> 2000。
 * - [修正] 烈炎術 (Sunburst): MP 30 -> 200。
 * - [修正] 火球術 (Fireball): MP 25 -> 80。
 * - [修正] 靈魂昇華 (Soul Elevation): MP 60 -> 500。
 * ---------------------------------------------------
 */

// --- 物品資料 (Items) ---
const ITEMS = {
    // --- 基礎消耗品 ---
    'potion': {name:'紅色藥水', icon:'🍷', color:'#ff4444', type:'use', heal:50, price:30, stackable:true, desc:'恢復 HP+50'},
    'potion_orange': {name:'橙色藥水', icon:'🍹', color:'#ffaa44', type:'use', heal:70, price:80, stackable:true, desc:'恢復 HP+70'},
    'potion_white': {name:'白色藥水', icon:'🥛', color:'#ffffff', type:'use', heal:100, price:150, stackable:true, desc:'恢復 HP+100 (高效)'},
    'potion_ultimate': {name:'終極治癒藥水', icon:'🍶', color:'#ffffaa', type:'use', heal:200, price:400, stackable:true, desc:'恢復 HP+200 (最強)'}, 
    'mana': {name:'藍色藥水', icon:'🧪', color:'#0044ff', type:'use', buff:'blue_potion', duration:600000, price:300, stackable:true, desc:'MP回復量+5 (600s)'},
    
    // 卷軸
    'scroll_teleport': {name:'瞬間移動卷軸', icon:'📜', color:'#ccf', type:'use', price:50, stackable:true, desc:'隨機傳送'},
    'scroll_return': {name:'回家卷軸', icon:'📜', color:'#fff', type:'use', price:20, stackable:true, desc:'傳送回村莊 (Map 1)'},
    'antidote': {name:'解毒藥水', icon:'🍵', color:'#2f2', type:'use', price:20, stackable:true, desc:'解除中毒狀態'},

    // --- 強化與加速 ---
    'zel': {name:'對武器施法的卷軸', icon:'📜', color:'#faa', type:'scroll', target:'weapon', price:88000, stackable:true, desc:'強化武器攻擊力'},
    'dai': {name:'對盔甲施法的卷軸', icon:'📜', color:'#aaf', type:'scroll', target:'armor_all', price:40000, stackable:true, desc:'強化各類防具 (盔甲/頭/手/腳/內衣/斗篷)'},
    'zel_b': {name:'受祝福的武卷', icon:'📜', color:'#fd0', type:'scroll', target:'weapon', price:150000, stackable:true, desc:'強化武器 (高機率+2)'},
    'dai_b': {name:'受祝福的防卷', icon:'📜', color:'#fd0', type:'scroll', target:'armor_all', price:70000, stackable:true, desc:'強化各類防具 (高機率+2)'},
    
    'potion_green': {name:'綠色藥水', icon:'🧪', color:'#00ff00', type:'use', buff:'haste', duration:300000, price:300, stackable:true, desc:'一段加速 (300s)'},
    'potion_brave': {name:'勇敢藥水', icon:'🍺', color:'#ffaa00', type:'use', buff:'brave', duration:300000, price:1000, stackable:true, class:'knight', desc:'騎士二段加速 (300s)'},
    'cookie_elf': {name:'精靈餅乾', icon:'🍪', color:'#aaffaa', type:'use', buff:'wafer', duration:300000, price:800, stackable:true, class:'elf', desc:'妖精二段加速 (300s)'},
    'potion_wisdom': {name:'慎重藥水', icon:'🧪', color:'#aa00ff', type:'use', buff:'wisdom', duration:300000, price:1000, stackable:true, class:'mage', desc:'法師施法加速 (300s)'},

    // --- 武器類 (Weapon) ---
    // 新手/通用
    'dagger': {name:'歐西里斯短劍', icon:'🗡️', type:'equip', slot:'weapon', atk:8, price:50, sound:'sword', desc:'[Atk:8] 新手短劍'},
    'sword_long': {name:'長劍', icon:'🗡️', type:'equip', slot:'weapon', atk:12, price:500, sound:'sword', desc:'[Atk:12] 標準單手劍'},
    
    // 騎士專用 (Knight)
    'sword_katana': {name:'武士刀', icon:'🗡️', type:'equip', slot:'weapon', atk:16, price:3000, class:'knight', sound:'sword_heavy', desc:'[Atk:16] 攻速快/不損壞'},
    'sword_tsurugi': {name:'瑟魯基之劍', icon:'🗡️', type:'equip', slot:'weapon', atk:20, price:15000, class:'knight', sound:'sword_heavy', desc:'[Atk:20] 騎士高傷武器'},
    'sword_great': {name:'雙手劍', icon:'🗡️', type:'equip', slot:'weapon', atk:22, price:5000, class:'knight', sound:'sword_heavy', desc:'[Atk:22] 雙手/衝暈加成'},
    'sword_cb': {name:'鎖子甲破壞者', icon:'🔱', type:'equip', slot:'weapon', atk:15, price:8000, class:'knight', sound:'sword', desc:'[Atk:15] 破甲/硬皮特效'},
    'sword_dk': {name:'死亡騎士烈炎劍', icon:'🔥', type:'equip', slot:'weapon', atk:32, price:200000, class:'knight', sound:'sword_magic', desc:'[Atk:32] 傳說/火風暴'},
    'sword_execution': {name:'真．冥皇執行劍', icon:'⚔️', type:'equip', slot:'weapon', atk:45, price:1000000, class:'knight', sound:'sword_magic', desc:'[Atk:45] 神話/最強武器'},
    
    // 妖精專用 (Elf)
    'bow': {name:'獵人之弓', icon:'🏹', type:'equip', slot:'weapon', atk:10, price:2000, class:'elf', projType:'magic_arrow', sound:'bow', desc:'[Atk:10] 遠距離攻擊'},
    'bow_cross': {name:'十字弓', icon:'🏹', type:'equip', slot:'weapon', atk:12, price:5000, class:'elf', projType:'magic_arrow', sound:'bow', desc:'[Atk:12] 攻速快'},
    'bow_sayha': {name:'沙哈之弓', icon:'🏹', type:'equip', slot:'weapon', atk:16, price:50000, class:'elf', projType:'magic_arrow', sound:'bow_magic', desc:'[Atk:16] 魔法箭矢(不耗箭)'},
    'rapier': {name:'細劍', icon:'🗡️', type:'equip', slot:'weapon', atk:14, price:2500, class:'elf', sound:'sword', desc:'[Atk:14] 近戰/不死系加成'},
    'sword_wind': {name:'風刃短劍', icon:'🗡️', type:'equip', slot:'weapon', atk:25, price:500000, class:'elf', sound:'sword_magic', desc:'[Atk:25] 神話/最強近戰'},
    'bow_dk': {name:'死亡騎士烈炎弓', icon:'🏹', type:'equip', slot:'weapon', atk:30, price:200000, class:'elf', projType:'magic_arrow', sound:'bow_magic', desc:'[Atk:30] 傳說/火風暴/全職通用'},

    // 法師專用 (Mage)
    'staff': {name:'瑪那魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:4, price:2500, class:'mage', sound:'staff', desc:'[Atk:4] 攻擊吸取MP'},
    'staff_crystal': {name:'水晶魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:8, price:15000, class:'mage', sound:'staff', desc:'[Atk:8] 快速回魔'},
    'staff_lich': {name:'巴列斯魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:12, price:100000, class:'mage', sound:'staff_magic', desc:'[Atk:12] [INT+5] 巫妖之力'},
    'staff_girtao': {name:'吉爾塔斯魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:20, price:800000, class:'mage', sound:'staff_magic', desc:'[Atk:20] 神話/最強魔杖'},
    'staff_dk': {name:'死亡騎士烈炎杖', icon:'🥢', type:'equip', slot:'weapon', atk:28, price:200000, class:'mage', sound:'staff_magic', desc:'[Atk:28] 傳說/火風暴/全職通用'},

    // --- 防具類 (Armor) ---
    // 頭盔
    'helm_leather': {name:'皮頭盔', icon:'🧢', type:'equip', slot:'helm', def:2, price:500, desc:'[AC-2]'},
    'helm_skull': {name:'骷髏頭盔', icon:'💀', type:'equip', slot:'helm', def:3, price:1500, desc:'[AC-3] 新手神裝'},
    'helm_iron': {name:'鋼鐵頭盔', icon:'🪖', type:'equip', slot:'helm', def:3, price:1200, class:'knight', desc:'[AC-3] 騎士專用'},
    'helm_magic': {name:'抗魔法頭盔', icon:'⛑️', type:'equip', slot:'helm', def:2, price:8000, desc:'[AC-2] [MR+10]'},
    'helm_dk': {name:'死亡騎士頭盔', icon:'👹', type:'equip', slot:'helm', def:5, price:200000, desc:'[AC-5] 全職通用/套裝'},

    // 盔甲
    'armor_leather': {name:'皮盔甲', icon:'👕', type:'equip', slot:'armor', def:4, price:800, desc:'[AC-4]'},
    'armor_skull': {name:'骷髏盔甲', icon:'🦴', type:'equip', slot:'armor', def:6, price:2500, desc:'[AC-6] 新手神裝'},
    'armor_plate': {name:'金屬盔甲', icon:'🛡️', type:'equip', slot:'armor', def:8, price:3000, class:'knight', desc:'[AC-8] 騎士專用'},
    'armor_elven': {name:'精靈金屬鍊甲', icon:'🛡️', type:'equip', slot:'armor', def:6, price:4000, class:'elf', desc:'[AC-6] 妖精專用'},
    'armor_robe': {name:'法師長袍', icon:'👘', type:'equip', slot:'armor', def:4, price:2000, class:'mage', desc:'[AC-4] [MP回復+5]'},
    'armor_dk': {name:'死亡騎士盔甲', icon:'🧛', type:'equip', slot:'armor', def:10, price:300000, desc:'[AC-10] 全職通用/套裝'},
    
    // 斗篷
    'cloak_protect': {name:'保護者斗篷', icon:'🧥', type:'equip', slot:'cloak', def:3, price:2000, desc:'[AC-3]'},
    'cloak_mr': {name:'抗魔法斗篷', icon:'🧥', type:'equip', slot:'cloak', def:1, price:10000, desc:'[AC-1] [MR+20]'},
    'cloak_lich': {name:'巫妖斗篷', icon:'🧥', type:'equip', slot:'cloak', def:3, price:200000, class:'mage', desc:'[AC-3] [MP上限+50]'},

    // 手套
    'glove_leather': {name:'皮手套', icon:'🧤', type:'equip', slot:'glove', def:1, price:200, desc:'[AC-1]'},
    'glove_iron': {name:'鋼鐵手套', icon:'🧤', type:'equip', slot:'glove', def:3, price:1000, class:'knight', desc:'[AC-3] 騎士專用'},
    'glove_power': {name:'力量手套', icon:'🥊', type:'equip', slot:'glove', def:1, str:2, price:5000, desc:'[AC-1] [STR+2]'},
    'glove_dk': {name:'死亡騎士手套', icon:'🧤', type:'equip', slot:'glove', def:3, str:3, price:200000, desc:'[AC-3] [STR+3] 全職通用'},

    // 靴子
    'boot_leather': {name:'皮長靴', icon:'👢', type:'equip', slot:'boot', def:2, price:400, desc:'[AC-2]'},
    'boot_iron': {name:'鋼鐵長靴', icon:'🥾', type:'equip', slot:'boot', def:3, price:1200, class:'knight', desc:'[AC-3] 騎士專用'},
    'boot_dk': {name:'死亡騎士長靴', icon:'👢', type:'equip', slot:'boot', def:5, price:200000, desc:'[AC-5] 全職通用'},

    // 內衣與飾品 (新增屬性系列)
    'shirt_old': {name:'老舊內衣', icon:'🎽', type:'equip', slot:'shirt', def:1, price:100, desc:'[AC-1]'},
    'shirt_str': {name:'武力內衣', icon:'🎽', type:'equip', slot:'shirt', def:1, str:1, price:10000, desc:'[AC-1] [STR+1]'},
    'shirt_dex': {name:'敏捷內衣', icon:'🎽', type:'equip', slot:'shirt', def:1, dex:1, price:10000, desc:'[AC-1] [DEX+1]'},
    'shirt_int': {name:'智力內衣', icon:'🎽', type:'equip', slot:'shirt', def:1, int:1, price:10000, desc:'[AC-1] [INT+1]'},
    
    'neck_brave': {name:'勇氣項鍊', icon:'📿', type:'equip', slot:'neck', hp:30, price:4000, desc:'[HP+30]'},
    'neck_str': {name:'力量項鍊', icon:'📿', type:'equip', slot:'neck', str:1, price:5000, desc:'[STR+1]'},
    'neck_dex': {name:'敏捷項鍊', icon:'📿', type:'equip', slot:'neck', dex:1, price:5000, desc:'[DEX+1]'},
    'neck_int': {name:'智力項鍊', icon:'📿', type:'equip', slot:'neck', int:1, price:5000, desc:'[INT+1]'},
    
    // 材料 (不可購買，僅可販售) - buyable: false
    'mat_leather': {name:'皮革', icon:'📜', color:'#aa8', type:'material', price:10, stackable:true, buyable:false, desc:'基礎材料'},
    'mat_iron': {name:'鐵塊', icon:'🧱', color:'#889', type:'material', price:20, stackable:true, buyable:false, desc:'基礎材料'},
    'mat_mithril': {name:'粗糙米索莉塊', icon:'💎', color:'#eff', type:'material', price:100, stackable:true, buyable:false, desc:'貴重材料'},
    'quest_map': {name:'藏寶圖碎片', icon:'🗺️', color:'#fd0', type:'material', price:500, stackable:true, buyable:false, desc:'古老的碎片'},
};

// --- 技能資料 (Skills) ---
const SKILLS = {
    // 騎士
    'k1': {name:'衝擊之暈', mp:15, lv:15, class:'knight', icon:'💫', sound:'stun', desc:'使敵人暈眩3秒 (隨技能等級增加時間)'},
    'k2': {name:'增幅防禦', mp:15, lv:30, class:'knight', icon:'🛡️', buff:'solid_carriage', duration:60000, sound:'magic_def', desc:'60秒內減傷 (隨技能等級增加)'},
    'k3': {name:'反擊屏障', mp:20, lv:45, class:'knight', icon:'⚔️', buff:'counter_barrier', duration:120000, sound:'magic_atk', desc:'機率迴避近戰並反擊 (隨技能等級增傷)'},
    
    // 妖精 (新增 projType 與 sound)
    'e4': {name:'治癒術', mp:20, lv:10, class:'elf', icon:'💖', sound:'heal', desc:'恢復少量HP'}, 
    'e5': {name:'風之神射', mp:20, lv:15, class:'elf', icon:'🍃', buff:'wind_shot', duration:960000, sound:'magic_wind', desc:'[遠攻命中+6]'}, 
    'e2': {name:'魂體轉換', mp:0, lv:30, class:'elf', icon:'🌀', sound:'magic_soul', desc:'消耗HP轉換MP'}, 
    'e3': {name:'烈炎武器', mp:30, lv:45, class:'elf', icon:'🔥', buff:'fire_weapon', duration:960000, sound:'magic_fire', desc:'[近戰攻擊+8]'}, 
    'e6': {name:'暴風神射', mp:40, lv:45, class:'elf', icon:'🌪️', buff:'storm_shot', duration:960000, sound:'magic_wind', desc:'[遠攻傷害+5]'}, 
    'e1': {name:'三重矢', mp:15, lv:52, class:'elf', icon:'🏹', projType:'arrow_triple', sound:'bow_triple', desc:'快速三連射'}, 

    // 法師 (Mage Balance Update v77.84)
    'm1': {name:'光箭', mp:10, lv:1, class:'mage', icon:'⚡', projType:'arrow', sound:'magic_arrow', desc:'基礎遠程魔法'},
    'm2': {name:'火球術', mp:80, lv:15, class:'mage', icon:'🔥', effectType:'fire_area', areaRange: 300, sound:'fireball', desc:'大範圍爆炸傷害 (MP:80)'}, 
    'm3': {name:'初級治癒術', mp:10, lv:5, class:'mage', icon:'❤️', sound:'heal', desc:'恢復HP'},
    'm4': {name:'中級治癒術', mp:20, lv:20, class:'mage', icon:'🧡', sound:'heal', desc:'恢復更多HP'},
    'm5': {name:'高級治癒術', mp:40, lv:40, class:'mage', icon:'💛', sound:'heal_full', desc:'強力恢復HP'},
    'm6': {name:'聖結界', mp:600, lv:45, class:'mage', icon:'🛡️', buff:'immune_to_harm', duration:120000, sound:'magic_def', desc:'[Lv.45] 受到傷害減半 (MP:600)'},
    
    // Advanced Mage Skills (High MP Cost)
    'm8': {name:'烈炎術', mp:150, lv:50, class:'mage', icon:'💥', effectType:'explosion', sound:'fire_bang', desc:'[Lv.50] 巨大單體爆發 (MP:200)'},
    'm9': {name:'火風暴', mp:200, lv:55, class:'mage', icon:'🌪️', effectType:'fire_storm', sound:'fire_storm', desc:'[Lv.55] 地面持續燃燒，持續傷害 (MP:1000)'},
    'm7': {name:'流星雨', mp:500, lv:60, class:'mage', icon:'☄️', effectType:'meteor_rain', cooldown:12000, sound:'meteor', desc:'[Lv.60] 全畫面毀滅性隕石 (MP:2000)'},
    'm10': {name:'靈魂昇華', mp:500, lv:60, class:'mage', icon:'✨', buff:'soul_elevation', duration:1200000, sound:'magic_soul', desc:'[Lv.60] HP/MP最大值增加30% (MP:500)'},
    'm11': {name:'召喚術', mp:100, lv:40, class:'mage', icon:'🐺', sound:'summon', desc:'[Lv.40] 召喚強力怪物協助戰鬥'},
};

// --- 怪物資料 (Mobs) ---
const MOB_TYPES = {
    // 0. 新手木樁
    'dummy': {name:'木人', hp:500, exp:0.005, atk:0, def:0, s:20, c:'#8b4513', aggro:false, drops:[], minGold:0, maxGold:0}, 
    
    // Special
    'summon_creature': {name:'召喚獸', hp:2000, exp:0, atk:150, def:20, s:15, c:'#4169e1', aggro:false, drops:[], isPet:true, minGold:0, maxGold:0},

    // 1. 初級 (Lv 1-15) - HP ~100, ATK ~15, Gold 10-30
    'goblin': {name:'哥布林 Lv.5', hp:80, exp:0.01, atk:15, def:0, s:20, c:'#32cd32', aggro:false, drops:[{k:'potion',c:0.5},{k:'mat_leather',c:0.2},{k:'shirt_old',c:0.01}], minGold:10, maxGold:30}, 
    'kobold': {name:'地靈 Lv.8', hp:120, exp:0.015, atk:20, def:1, s:22, c:'#cd853f', aggro:false, drops:[{k:'potion',c:0.4},{k:'mat_iron',c:0.1},{k:'dagger',c:0.05}], minGold:15, maxGold:35}, 
    'orc': {name:'妖魔 Lv.10', hp:160, exp:0.02, atk:25, def:2, s:24, c:'#556b2f', aggro:false, drops:[{k:'potion',c:0.6},{k:'mat_leather',c:0.3},{k:'cloak_protect',c:0.01}], minGold:20, maxGold:40},
    'dwarf': {name:'侏儒 Lv.12', hp:200, exp:0.03, atk:30, def:3, s:22, c:'#8b4513', aggro:false, drops:[{k:'mat_iron',c:0.4},{k:'helm_iron',c:0.05},{k:'helm_leather',c:0.1}], minGold:25, maxGold:45},
    
    // 2. 說話之島冒險 (Lv 15-25) - HP ~400, ATK ~50, Gold 40-80
    'orc_fighter': {name:'妖魔鬥士 Lv.15', hp:300, exp:0.05, atk:45, def:4, s:28, c:'#8fbc8f', aggro:true, drops:[{k:'helm_leather',c:0.1},{k:'dagger',c:0.1},{k:'armor_leather',c:0.05}], minGold:40, maxGold:60},
    'werewolf': {name:'狼人 Lv.18', hp:400, exp:0.08, atk:55, def:2, s:30, c:'#708090', aggro:true, drops:[{k:'potion_green',c:0.1},{k:'mat_leather',c:0.5},{k:'glove_leather',c:0.1}], minGold:50, maxGold:70}, 
    'ungoliant': {name:'楊果里恩 Lv.22', hp:500, exp:0.12, atk:60, def:5, s:35, c:'#4b0082', aggro:true, drops:[{k:'antidote',c:0.5},{k:'zel',c:0.0003},{k:'bow',c:0.05}], minGold:60, maxGold:80}, 
    
    // 3. 地監與沙漠 (Lv 25-40) - HP ~800, ATK ~80, Gold 70-120
    'skeleton': {name:'骷髏 Lv.25', hp:600, exp:0.15, atk:75, def:6, s:24, c:'#f5f5f5', aggro:true, drops:[{k:'helm_skull',c:0.1},{k:'armor_skull',c:0.1},{k:'zel',c:0.0003},{k:'boot_leather',c:0.1}], minGold:70, maxGold:90}, 
    'ghoul': {name:'食屍鬼 Lv.28', hp:800, exp:0.18, atk:90, def:4, s:28, c:'#556b2f', aggro:true, drops:[{k:'dai',c:0.0003},{k:'antidote',c:0.3},{k:'helm_magic',c:0.01}], minGold:80, maxGold:100},
    'lycanthrope': {name:'萊肯 Lv.30', hp:900, exp:0.25, atk:100, def:8, s:35, c:'#4a4a4a', aggro:true, drops:[{k:'zel',c:0.0004},{k:'sword_katana',c:0.05},{k:'shirt_str',c:0.005}], minGold:90, maxGold:110}, 
    'ant': {name:'巨蟻 Lv.32', hp:700, exp:0.22, atk:85, def:10, s:24, c:'#1a1a1a', aggro:true, drops:[{k:'potion_orange',c:0.3},{k:'armor_plate',c:0.01}], minGold:85, maxGold:105}, 
    'gast': {name:'食人妖精 Lv.35', hp:1200, exp:0.35, atk:120, def:5, s:50, c:'#696969', aggro:true, drops:[{k:'glove_power',c:0.05},{k:'potion_brave',c:0.2},{k:'bow_cross',c:0.05}], minGold:100, maxGold:120},
    
    // 4. 進階區域 (Lv 40-55) - HP ~1800, ATK ~150, Gold 110-160
    'lizardman': {name:'蜥蜴人 Lv.45', hp:1500, exp:0.45, atk:130, def:12, s:35, c:'#6b8e23', aggro:true, drops:[{k:'glove_leather',c:0.2},{k:'sword_long',c:0.1},{k:'shirt_dex',c:0.005}], minGold:110, maxGold:140}, 
    'bandit': {name:'奇岩盜賊 Lv.48', hp:1600, exp:0.55, atk:150, def:10, s:32, c:'#d2b48c', aggro:true, drops:[{k:'zel_b',c:0.0001},{k:'sword_tsurugi',c:0.02},{k:'armor_elven',c:0.02}], minGold:120, maxGold:150}, 
    'yeti': {name:'雪怪 Lv.50', hp:2000, exp:0.6, atk:180, def:15, s:45, c:'#f0ffff', aggro:true, drops:[{k:'potion_white',c:0.5},{k:'glove_power',c:0.05},{k:'boot_iron',c:0.05}], minGold:130, maxGold:160},
    'elmore_soldier': {name:'艾爾摩士兵 Lv.52', hp:2200, exp:0.7, atk:170, def:18, s:35, c:'#8b4513', aggro:true, drops:[{k:'armor_plate',c:0.1},{k:'dai',c:0.0004},{k:'helm_iron',c:0.1}], minGold:135, maxGold:165}, 
    
    // 5. 高難度 (Lv 60-80) - HP ~3000, ATK ~250, Gold 150-200
    'medusa': {name:'梅杜莎 Lv.60', hp:2800, exp:1.0, atk:220, def:20, s:35, c:'#9acd32', aggro:true, drops:[{k:'helm_magic',c:0.05},{k:'zel',c:0.0005},{k:'shirt_int',c:0.005}], minGold:150, maxGold:180},
    'dragon_fly': {name:'飛龍 Lv.65', hp:4500, exp:2.0, atk:300, def:25, s:80, c:'#5d4037', aggro:true, drops:[{k:'zel',c:0.0006},{k:'mat_mithril',c:0.5},{k:'neck_brave',c:0.01}], magic:'fireball', minGold:160, maxGold:190}, 
    'fire_egg': {name:'火靈 Lv.70', hp:3500, exp:1.5, atk:250, def:10, s:25, c:'#ff4500', aggro:true, drops:[{k:'potion_ultimate',c:0.3},{k:'staff_crystal',c:0.01}], magic:'fireball', minGold:170, maxGold:200},
    'succubus': {name:'思克巴 Lv.75', hp:4000, exp:2.5, atk:350, def:15, s:32, c:'#9932cc', aggro:true, drops:[{k:'dai_b',c:0.0002},{k:'scroll_teleport',c:1.0},{k:'neck_int',c:0.01}], magic:'magic', minGold:180, maxGold:210},
    'living_armor': {name:'活鎧甲 Lv.78', hp:6000, exp:3.0, atk:320, def:40, s:40, c:'#708090', aggro:true, drops:[{k:'armor_plate',c:0.3},{k:'sword_great',c:0.1},{k:'glove_iron',c:0.1}], minGold:190, maxGold:220},
    
    // 6. 終局怪物 (Lv 85-110) - HP ~10000, ATK ~500, Gold 200-250
    'minotaur': {name:'米諾斯 Lv.85', hp:9000, exp:5.0, atk:450, def:30, s:60, c:'#daa520', aggro:true, drops:[{k:'sword_cb',c:0.1},{k:'neck_str',c:0.02}], minGold:200, maxGold:230}, 
    'dark_elf': {name:'暗殺軍王下屬 Lv.92', hp:11000, exp:7.0, atk:550, def:25, s:32, c:'#ffd700', aggro:true, drops:[{k:'zel_b',c:0.0005},{k:'rapier',c:0.05},{k:'neck_dex',c:0.02}], minGold:210, maxGold:240}, 
    'snake_woman': {name:'蛇人 Lv.96', hp:12000, exp:9.0, atk:500, def:35, s:35, c:'#9acd32', aggro:true, drops:[{k:'potion_ultimate',c:0.8},{k:'armor_robe',c:0.05}], magic:'magic', minGold:220, maxGold:250}, 
    'anubis': {name:'阿努比斯 Lv.105', hp:18000, exp:15.0, atk:650, def:50, s:40, c:'#ffd700', aggro:true, drops:[{k:'zel_b',c:0.001},{k:'dai_b',c:0.001},{k:'cloak_mr',c:0.05}], magic:'fireball', minGold:230, maxGold:250}, 
    'void_spirit': {name:'虛空之靈 Lv.115', hp:25000, exp:20.0, atk:800, def:10, s:35, c:'#000000', aggro:true, drops:[{k:'potion_ultimate',c:1.0},{k:'cloak_lich',c:0.005}], magic:'meteor', minGold:230, maxGold:250}, 

    // --- Bosses - HP ~100000+, ATK ~1000+, Gold 10000-35000 ---
    'araneid': {name:'巨大蜘蛛 (Boss) Lv.25', hp:10000, exp:10.0, atk:300, def:20, s:60, c:'#8b4513', aggro:true, drops:[
        {k:'zel',c:0.05},{k:'sword_long',c:0.5},
        {k:'helm_dk',c:0.0005}, {k:'armor_dk',c:0.0001}, {k:'glove_dk',c:0.0002}, {k:'boot_dk',c:0.0002}
    ], isBoss:true, respawnTime:3600, scale:2.2, minGold:10000, maxGold:15000},
    
    'necromancer': {name:'死靈法師 (Boss) Lv.30', hp:15000, exp:20.0, atk:450, def:30, s:50, c:'#483d8b', aggro:true, drops:[
        {k:'staff',c:1.0},{k:'zel_b',c:0.01},
        {k:'helm_dk',c:0.001}, {k:'armor_dk',c:0.0005}, {k:'glove_dk',c:0.001}, {k:'boot_dk',c:0.001}
    ], isBoss:true, magic:'fireball', respawnTime:7200, scale:2.0, minGold:12000, maxGold:18000},
    
    'giant_ant_queen': {name:'巨蟻女皇 (Boss) Lv.45', hp:30000, exp:50.0, atk:600, def:50, s:100, c:'#2a2a2a', aggro:true, drops:[
        {k:'cloak_protect',c:1.0},{k:'dai_b',c:0.02},{k:'glove_power',c:0.2},
        {k:'helm_dk',c:0.001}, {k:'armor_dk',c:0.0005}, {k:'glove_dk',c:0.001}, {k:'boot_dk',c:0.001}
    ], isBoss:true, respawnTime:14400, scale:2.5, minGold:15000, maxGold:20000}, 
    
    'giant_crocodile': {name:'巨大鱷魚 (Boss) Lv.50', hp:45000, exp:80.0, atk:800, def:60, s:90, c:'#228b22', aggro:true, drops:[
        {k:'dai',c:0.1},{k:'potion_brave',c:1.0},{k:'sword_tsurugi',c:0.2},
        {k:'helm_dk',c:0.002}, {k:'armor_dk',c:0.001}, {k:'glove_dk',c:0.002}, {k:'boot_dk',c:0.002}
    ], isBoss:true, respawnTime:14400, scale:2.5, minGold:18000, maxGold:22000}, 
    
    'drake': {name:'飛龍 (Boss) Lv.60', hp:60000, exp:150.0, atk:1000, def:70, s:80, c:'#5d4037', aggro:true, drops:[
        {k:'neck_brave',c:1.0},{k:'mat_mithril',c:1.0},{k:'sword_great',c:0.1},
        {k:'helm_dk',c:0.005}, {k:'armor_dk',c:0.002}, {k:'glove_dk',c:0.005}, {k:'boot_dk',c:0.005}
    ], isBoss:true, magic:'fireball', respawnTime:21600, scale:2.8, minGold:20000, maxGold:25000}, 
    
    'demon': {name:'惡魔 (Boss) Lv.80', hp:120000, exp:500.0, atk:1500, def:80, s:100, c:'#b22222', aggro:true, drops:[
        {k:'rapier',c:1.0},{k:'glove_dk',c:0.1},{k:'shirt_str',c:0.1},
        {k:'helm_dk',c:0.01}, {k:'armor_dk',c:0.005}, {k:'boot_dk',c:0.01}
    ], isBoss:true, magic:'meteor', respawnTime:43200, scale:2.2, minGold:22000, maxGold:28000}, 
    
    'death_knight': {name:'死亡騎士 (Boss) Lv.85', hp:150000, exp:800.0, atk:2000, def:100, s:70, c:'#ffd700', aggro:true, drops:[
        {k:'sword_dk',c:0.1}, {k:'bow_dk',c:0.1}, {k:'staff_dk',c:0.1}, 
        {k:'helm_dk',c:0.1}, {k:'armor_dk',c:0.05}, {k:'glove_dk',c:0.05}, {k:'boot_dk',c:0.05}, 
        {k:'zel_b',c:1.0}
    ], isBoss:true, magic:'meteor', respawnTime:21600, scale:2.0, minGold:25000, maxGold:30000}, 
    
    'baphomet': {name:'巴風特 (Boss) Lv.90', hp:180000, exp:1000.0, atk:2200, def:90, s:90, c:'#191970', aggro:true, drops:[
        {k:'staff_crystal',c:1.0},{k:'staff_lich',c:0.1},{k:'armor_dk',c:0.1},{k:'cloak_lich',c:0.1},
        {k:'helm_dk',c:0.05}, {k:'glove_dk',c:0.05}, {k:'boot_dk',c:0.05}
    ], isBoss:true, magic:'fireball', respawnTime:43200, scale:2.2, minGold:28000, maxGold:32000}, 
    
    'dante': {name:'丹特斯 (Boss) Lv.95', hp:250000, exp:2000.0, atk:2500, def:120, s:75, c:'#4b0082', aggro:true, drops:[
        {k:'boot_dk',c:0.3},{k:'sword_execution',c:0.01},{k:'glove_dk',c:0.1},
        {k:'helm_dk',c:0.05}, {k:'armor_dk',c:0.05}
    ], isBoss:true, magic:'meteor', respawnTime:43200, scale:2.0, minGold:30000, maxGold:35000}, 
    
    'zebulon': {name:'傑弗雷肯 (Boss) Lv.100', hp:300000, exp:3000.0, atk:2800, def:130, s:120, c:'#556b2f', aggro:true, drops:[
        {k:'glove_dk',c:0.3},{k:'sword_wind',c:0.05},{k:'armor_dk',c:0.1},
        {k:'helm_dk',c:0.05}, {k:'boot_dk',c:0.05}
    ], isBoss:true, magic:'fireball', respawnTime:43200, scale:2.5, minGold:30000, maxGold:35000}, 
    
    'osiris': {name:'歐西里斯 (Boss) Lv.110', hp:450000, exp:5000.0, atk:3500, def:150, s:80, c:'#ffd700', aggro:true, drops:[
        {k:'helm_dk',c:0.3},{k:'bow_sayha',c:0.1},{k:'neck_int',c:0.1},
        {k:'armor_dk',c:0.05}, {k:'glove_dk',c:0.05}, {k:'boot_dk',c:0.05}
    ], isBoss:true, magic:'meteor', respawnTime:86400, scale:2.2, minGold:30000, maxGold:35000}, 
    
    'girtao': {name:'吉爾塔斯 (Boss) Lv.120', hp:1000000, exp:10000.0, atk:5000, def:200, s:150, c:'#4b0082', aggro:true, drops:[
        {k:'armor_dk',c:0.5},{k:'staff_girtao',c:0.05},{k:'neck_str',c:0.1},
        {k:'helm_dk',c:0.1}, {k:'glove_dk',c:0.1}, {k:'boot_dk',c:0.1}
    ], isBoss:true, magic:'meteor', respawnTime:86400, scale:3.0, minGold:30000, maxGold:35000},
};

// --- 地圖資料 (Maps) ---
const MAPS = {
    0: {name:'隱藏之谷 (Lv.1-5)', c1:'#363', c2:'#252', desc:'安全的新手訓練場', mobs:['dummy','goblin'], x:600, y:900, w:80, h:60, t:'grass', theme:'valley', returnMap:0},
    1: {name:'說話之島 (Lv.5-15)', c1:'#122', c2:'#0a1a0a', desc:'冒險的起點', mobs:['goblin','kobold','orc','dwarf'], boss:'araneid', x:800, y:800, w:100, h:100, t:'grass', theme:'forest', returnMap:1},
    2: {name:'古魯丁地監 1F (Lv.15-25)', c1:'#222', c2:'#111', desc:'不死系的巢穴', mobs:['skeleton','ghoul','orc_fighter'], boss:'necromancer', x:-2000, y:-1000, w:80, h:80, t:'cave', theme:'dungeon', returnMap:1},
    3: {name:'燃柳村 (Lv.25-30)', c1:'#432', c2:'#321', desc:'妖魔與萊肯出沒', mobs:['orc_fighter','lycanthrope','werewolf'], x:-1500, y:-1500, w:80, h:80, t:'dirt', theme:'wasteland', returnMap:1},
    4: {name:'風木城沙漠 (Lv.30-35)', c1:'#554433', c2:'#443322', desc:'危險的沙漠生物', mobs:['ant','ungoliant','lycanthrope'], boss:'giant_ant_queen', x:0, y:2500, w:100, h:100, t:'sand', theme:'desert', returnMap:3},
    5: {name:'奇岩地監 (Lv.35-40)', c1:'#212', c2:'#101', desc:'貪婪的罪犯與怪物', mobs:['gast','bandit','werewolf'], boss:'giant_crocodile', x:200, y:200, w:80, h:80, t:'cave', theme:'dungeon', returnMap:3},
    6: {name:'海音地監 (Lv.40-45)', c1:'#123', c2:'#012', desc:'水中生物的領域', mobs:['lizardman','gast','ant'], x:2500, y:500, w:100, h:100, t:'grass', theme:'forest', returnMap:3},
    7: {name:'歐瑞村 (Lv.45-50)', c1:'#eef', c2:'#dde', desc:'冰雪覆蓋的村莊', mobs:['yeti','elmore_soldier','bandit'], x:1500, y:-2000, w:80, h:80, t:'snow', theme:'snow', returnMap:7},
    8: {name:'象牙塔 8F (Lv.50-60)', c1:'#334', c2:'#dda', desc:'魔法生物與活鎧甲', mobs:['living_armor','yeti','elmore_soldier'], boss:'demon', x:1000, y:-2500, w:80, h:100, t:'snow', theme:'ivory_tower', returnMap:7},
    9: {name:'龍之谷 (Lv.60-70)', c1:'#422', c2:'#311', desc:'巨大的骨骸與飛龍', mobs:['skeleton','drake','dragon_fly'], boss:'drake', x:2000, y:-500, w:150, h:120, t:'dirt', theme:'wasteland', returnMap:7},
    10: {name:'火龍窟 (Lv.70-75)', c1:'#611', c2:'#400', desc:'灼熱的煉獄', mobs:['fire_egg','dragon_fly','succubus'], x:3000, y:-1000, w:100, h:100, t:'dirt', theme:'volcano', returnMap:7},
    11: {name:'傲慢之塔 (Lv.75-80)', c1:'#303', c2:'#202', desc:'最頂層的挑戰', mobs:['medusa','succubus','minotaur'], boss:'baphomet', x:0, y:-3000, w:80, h:150, t:'stone', theme:'ivory_tower', returnMap:7},
    12: {name:'古魯丁地監 7F (Lv.80-85)', c1:'#000', c2:'#200', desc:'死亡騎士的領地', mobs:['skeleton','ghoul','living_armor'], boss:'death_knight', x:-2200, y:-1200, w:60, h:60, t:'cave', theme:'dungeon', returnMap:1},
    13: {name:'遺忘之島 (Lv.85-90)', c1:'#244', c2:'#133', desc:'被遺忘的強力怪物', mobs:['minotaur','drake','lycanthrope'], x:-3000, y:-3000, w:120, h:120, t:'grass', theme:'forest', returnMap:7},
    14: {name:'拉斯塔巴德 (Lv.90-95)', c1:'#222', c2:'#100', desc:'黑暗妖精的地下要塞', mobs:['dark_elf','minotaur','living_armor'], boss:'dante', x:4000, y:0, w:200, h:200, t:'stone', theme:'lastabad', returnMap:7},
    15: {name:'提卡爾神廟 (Lv.95-100)', c1:'#242', c2:'#131', desc:'時空裂痕中的古文明', mobs:['snake_woman','lizardman','fire_egg'], boss:'zebulon', x:4000, y:2500, w:200, h:200, t:'grass', theme:'tikal', returnMap:3},
    16: {name:'底比斯沙漠 (Lv.100-110)', c1:'#da8', c2:'#b86', desc:'異界的黃金文明', mobs:['anubis','ant','scorpion'], boss:'osiris', x:4000, y:-2500, w:200, h:200, t:'sand', theme:'thebes', returnMap:3},
    17: {name:'異界裂縫 (Lv.110-120)', c1:'#102', c2:'#000', desc:'吉爾塔斯的虛空領域', mobs:['void_spirit','dragon_fly','baphomet'], boss:'girtao', x:0, y:-5000, w:200, h:200, t:'void', theme:'void', returnMap:7},
};