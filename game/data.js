/**
 * ---------------------------------------------------
 * [更新記錄 - v77.125_Elf_Buff_Rebalance]
 * 1. [技能調整] 妖精技能與消耗品數值平衡調整。
 * - 風之神射: [遠攻命中+6] -> [遠攻爆擊+20%], MP:100, Time:600s
 * - 暴風神射: [遠攻傷害+5] -> [遠攻傷害+50], MP:200, Time:600s
 * - 精靈餅乾: 攻速提升調整為 x1.5
 * ---------------------------------------------------
 * [更新記錄 - v77.124_Boss_EXP_Balance]
 * 1. [平衡] 修正 v77.123 過度下修 Boss 經驗值的問題。
 * - 問題：小怪經驗提升後，後期 Boss (如吉爾塔斯) 的 EXP 效益比僅剩 40倍小怪，嚴重失衡。
 * - 修正：將所有 Boss 的經驗值重新定錨在「同級小怪的 150~200倍」。
 * - Example: 
 * - 惡魔: 25,000 -> 60,000 (約 160倍)
 * - 吉爾塔斯: 300,000 -> 1,500,000 (約 200倍)
 * ---------------------------------------------------
 * [更新記錄 - v77.122_EXP_Boost_PlanB]
 * 1. [練功優化] 實施方案 B：大幅提升 Lv.50 以上怪物的基礎經驗值 (EXP)。
 * ---------------------------------------------------
 */

// --- 套裝效果定義 (Set Bonuses) ---
const SETS = {
    // --- 白裝 (Tier 1) ---
    'set_soldier': { name: '士兵套裝', desc: '全套效果: 防禦+5, 減傷+2%', ac: 5, dmgReduc: 2 },
    'set_mercenary': { name: '傭兵套裝', desc: '全套效果: 防禦+10, 減傷+3%', ac: 10, dmgReduc: 3 },
    'set_explorer': { name: '探險家套裝', desc: '全套效果: 防禦+15, 減傷+4%', ac: 15, dmgReduc: 4 },
    'set_skeleton': { name: '骷髏套裝', desc: '全套效果: 防禦+8, HP+50', ac: 8, hp: 50 },

    // --- 黃裝 (Tier 2) ---
    'set_royal': { name: '皇家守衛套裝', desc: '全套效果: 防禦+20, 減傷+3%, 攻擊+2', ac: 20, dmgReduc: 3, dmg: 2 },
    'set_commander': { name: '指揮官套裝', desc: '全套效果: 防禦+20, 減傷+5%, HP+50', ac: 20, dmgReduc: 5, hp: 50 },

    // --- 綠裝 (Tier 3) ---
    'set_emerald': { name: '翡翠遊俠套裝', desc: '全套效果: 防禦+30, 減傷+6%, DEX+2', ac: 30, dmgReduc: 6, dex: 2 },

    // --- 藍裝 (Tier 4) ---
    'set_phantom': { name: '幻影殺手套裝', desc: '全套效果: 防禦+40, 減傷+7%, 爆擊率UP', ac: 40, dmgReduc: 7, crit: 5 },

    // --- 紅裝 (Tier 5) ---
    'set_blood': { name: '鮮血領主套裝', desc: '全套效果: 防禦+50, 減傷+8%, 快速回魔', ac: 50, dmgReduc: 8, mpRegen: 10 },

    // --- 紫裝 (Tier 6) ---
    'set_void': { name: '虛空主宰套裝', desc: '全套效果: 防禦+60, 減傷+10%, 快速回血', ac: 60, dmgReduc: 10, hpRegen: 15 }
};

// --- 物品資料 (Items) ---
const ITEMS = {
    // ==========================================
    // [區塊 1] 消耗品 (Potions & Consumables)
    // ==========================================
    'potion': {name:'紅色藥水', icon:'🍷', color:'#ff4444', type:'use', heal:50, price:30, stackable:true, desc:'恢復 HP+50'},
    'potion_orange': {name:'橙色藥水', icon:'🍹', color:'#ffaa44', type:'use', heal:70, price:80, stackable:true, desc:'恢復 HP+70'},
    'potion_white': {name:'白色藥水', icon:'🥛', color:'#ffffff', type:'use', heal:100, price:150, stackable:true, desc:'恢復 HP+100 (高效)'},
    'potion_ultimate': {name:'終極治癒藥水', icon:'🍶', color:'#ffffaa', type:'use', heal:200, price:400, stackable:true, desc:'恢復 HP+200 (最強)'}, 
    'mana': {name:'藍色藥水', icon:'🧪', color:'#0044ff', type:'use', buff:'blue_potion', duration:600000, price:300, stackable:true, desc:'MP回復量+5 (600s)'},
    'antidote': {name:'解毒藥水', icon:'🍵', color:'#2f2', type:'use', price:20, stackable:true, desc:'解除中毒狀態'},
    
    'potion_green': {name:'綠色藥水', icon:'🧪', color:'#00ff00', type:'use', buff:'haste', duration:300000, price:300, stackable:true, desc:'一段加速 (300s)'},
    'potion_brave': {name:'勇敢藥水', icon:'🍺', color:'#ffaa00', type:'use', buff:'brave', duration:300000, price:1000, stackable:true, class:'knight', desc:'騎士二段加速 (300s)'},
    
    // [Updated] 精靈餅乾描述更新
    'cookie_elf': {name:'精靈餅乾', icon:'🍪', color:'#aaffaa', type:'use', buff:'wafer', duration:300000, price:800, stackable:true, class:'elf', desc:'妖精攻速 x1.5 (300s)'},
    
    'potion_wisdom': {name:'慎重藥水', icon:'🧪', color:'#aa00ff', type:'use', buff:'wisdom', duration:300000, price:1000, stackable:true, class:'mage', desc:'法師施法加速 (300s)'},

    'scroll_teleport': {name:'瞬間移動卷軸', icon:'📜', color:'#ccf', type:'use', price:50, stackable:true, desc:'隨機傳送'},
    'scroll_return': {name:'回家卷軸', icon:'📜', color:'#fff', type:'use', price:20, stackable:true, desc:'傳送回村莊 (Map 1)'},
    'zel': {name:'對武器施法的卷軸', icon:'📜', color:'#faa', type:'scroll', target:'weapon', price:88000, stackable:true, desc:'強化武器攻擊力'},
    'dai': {name:'對盔甲施法的卷軸', icon:'📜', color:'#aaf', type:'scroll', target:'armor_all', price:40000, stackable:true, desc:'強化各類防具 (盔甲/頭/手/腳/內衣/斗篷)'},
    'zel_b': {name:'受祝福的武卷', icon:'📜', color:'#fd0', type:'scroll', target:'weapon', price:150000, stackable:true, desc:'強化武器 (高機率+2)'},
    'dai_b': {name:'受祝福的防卷', icon:'📜', color:'#fd0', type:'scroll', target:'armor_all', price:70000, stackable:true, desc:'強化各類防具 (高機率+2)'},

    // ==========================================
    // [區塊 2] 可購買裝備 (Buyable Equipment)
    // ==========================================
    'dagger': {name:'歐西里斯短劍', icon:'🗡️', type:'equip', slot:'weapon', atk:8, price:50, sound:'sword', desc:'[Atk:8] 新手短劍'},
    'sword_long': {name:'長劍', icon:'🗡️', type:'equip', slot:'weapon', atk:12, price:500, sound:'sword', desc:'[Atk:12] 標準單手劍'},
    'bow': {name:'獵人之弓', icon:'🏹', type:'equip', slot:'weapon', atk:10, price:2000, class:'elf', projType:'magic_arrow', sound:'bow', desc:'[Atk:10] 遠距離攻擊'},
    'staff': {name:'瑪那魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:4, price:2500, class:'mage', sound:'staff', desc:'[Atk:4] 攻擊吸取MP'},
    
    'sword_katana': {name:'武士刀', icon:'🗡️', type:'equip', slot:'weapon', atk:16, price:3000, class:'knight', sound:'sword_heavy', desc:'[Atk:16] 攻速快/不損壞'},
    'sword_tsurugi': {name:'瑟魯基之劍', icon:'🗡️', type:'equip', slot:'weapon', atk:20, price:15000, class:'knight', sound:'sword_heavy', desc:'[Atk:20] 騎士高傷武器'},
    'sword_great': {name:'雙手劍', icon:'🗡️', type:'equip', slot:'weapon', atk:22, price:5000, class:'knight', sound:'sword_heavy', desc:'[Atk:22] 雙手/衝暈加成'},
    'bow_cross': {name:'十字弓', icon:'🏹', type:'equip', slot:'weapon', atk:12, price:5000, class:'elf', projType:'magic_arrow', sound:'bow', desc:'[Atk:12] 攻速快'},
    'staff_crystal': {name:'水晶魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:8, price:15000, class:'mage', sound:'staff', desc:'[Atk:8] 快速回魔'},
    'rapier': {name:'細劍', icon:'🗡️', type:'equip', slot:'weapon', atk:11, price:4000, class:'elf', sound:'sword', desc:'[Atk:11] 妖精與騎士的輕型武器'},
    'sword_wind': {name:'風之刃', icon:'🗡️', type:'equip', slot:'weapon', atk:14, price:20000, sound:'sword_magic', desc:'[Atk:14] 蘊含風屬性的利刃'},

    'armor_chain': {name:'鎖子甲', icon:'🛡️', type:'equip', slot:'armor', def:7, price:3500, desc:'[AC-7] 優良防護'},
    'armor_plate': {name:'鋼鐵金屬盔甲', icon:'🛡️', type:'equip', slot:'armor', def:8, price:5000, desc:'[AC-8] 堅固的鋼鐵盔甲'},
    
    'glove_power': {name:'力量手套', icon:'🥊', type:'equip', slot:'glove', def:1, str:2, price:5000, desc:'[AC-1] [STR+2]'},
    'glove_stone': {name:'岩石手套', icon:'🥊', type:'equip', slot:'glove', def:3, price:10000, desc:'[AC-3] 堅硬如石的手套'},
    
    'cloak_mr': {name:'抗魔法斗篷', icon:'🧥', type:'equip', slot:'cloak', def:1, price:10000, desc:'[AC-1] [MR+10]'},
    'cloak_protect': {name:'保護者斗篷', icon:'🧥', type:'equip', slot:'cloak', def:3, price:50000, desc:'[AC-3] [MR+20] 巨蟻女皇的寶物'},
    
    'neck_str': {name:'力量項鍊', icon:'📿', type:'equip', slot:'neck', str:1, price:10000, desc:'[STR+1] 增強近戰攻擊'},
    'neck_dex': {name:'敏捷項鍊', icon:'📿', type:'equip', slot:'neck', dex:1, price:10000, desc:'[DEX+1] 增強遠攻與防禦'},
    'neck_brave': {name:'勇氣項鍊', icon:'🏅', type:'equip', slot:'neck', def:1, str:1, price:100000, desc:'[AC-1] [STR+1] 飛龍的秘寶'},
    'shirt_str': {name:'力量T恤', icon:'👕', type:'equip', slot:'shirt', def:1, str:1, price:80000, desc:'[AC-1] [STR+1] 惡魔的珍藏'},
    'shirt_elf': {name:'精靈T恤', icon:'👕', type:'equip', slot:'shirt', def:1, dex:1, price:80000, desc:'[AC-1] [DEX+1] 精靈的加護'},

    // ==========================================
    // [區塊 2.5] 稀有單品武器 (Rare Single Weapons) - [Price Rebalanced]
    // ==========================================
    // 皇家劍/弓 (非賣品，但若打到可賣店) -> Price: 100,000 (賣店 20,000)
    'sword_royal': {name:'皇家之劍', icon:'🗡️', type:'equip', slot:'weapon', atk:30, price:100000, class:'knight', sound:'sword', desc:'[Atk:30] 皇家配劍'},
    'bow_royal': {name:'皇家長弓', icon:'🏹', type:'equip', slot:'weapon', atk:25, price:100000, class:'elf', projType:'magic_arrow', sound:'bow', desc:'[Atk:25] 皇家御用弓'},
    // 紅武 -> Price: 250,000 (賣店 50,000)
    'sword_blood': {name:'嗜血巨劍', icon:'🗡️', type:'equip', slot:'weapon', atk:60, price:250000, class:'knight', sound:'sword_heavy', desc:'[Atk:60] 吸取敵人生命'},
    // 紫武 -> Price: 1,000,000 (賣店 200,000)
    'sword_void': {name:'虛空魔劍', icon:'⚔️', type:'equip', slot:'weapon', atk:120, price:1000000, class:'knight', sound:'sword_magic', desc:'[Atk:120] 來自虛空的毁滅力量'},

    // ==========================================
    // [區塊 3] 材料 (Materials)
    // ==========================================
    'mat_leather': {name:'皮革', icon:'📜', color:'#aa8', type:'material', price:10, stackable:true, buyable:false, desc:'基礎材料'},
    'mat_iron': {name:'鐵塊', icon:'🧱', color:'#889', type:'material', price:20, stackable:true, buyable:false, desc:'基礎材料'},
    'mat_mithril': {name:'粗糙米索莉塊', icon:'💎', color:'#eff', type:'material', price:100, stackable:true, buyable:false, desc:'貴重材料'},
    'quest_map': {name:'藏寶圖碎片', icon:'🗺️', color:'#fd0', type:'material', price:500, stackable:true, buyable:false, desc:'古老的碎片'},

    // ==========================================
    // [區塊 4] 展示與套裝區 (Display & Sets)
    // ==========================================

    // --- Tier 1 (白裝) ---
    'helm_skull': {name:'骷髏頭盔', icon:'💀', type:'equip', slot:'helm', def:3, price:1500, set:'set_skeleton', desc:'[AC-3] 骷髏套裝'},
    'armor_skull': {name:'骷髏盔甲', icon:'🦴', type:'equip', slot:'armor', def:6, price:2500, set:'set_skeleton', desc:'[AC-6] 骷髏套裝'},
    'shield_skull': {name:'骷髏盾牌', icon:'🛡️', type:'equip', slot:'shield', def:2, price:1000, set:'set_skeleton', desc:'[AC-2] 骷髏套裝'},
    'glove_skull': {name:'骷髏手套', icon:'🧤', type:'equip', slot:'glove', def:2, price:1200, set:'set_skeleton', desc:'[AC-2] 骷髏套裝'},
    'boot_skull': {name:'骷髏長靴', icon:'🥾', type:'equip', slot:'boot', def:3, price:1200, set:'set_skeleton', desc:'[AC-3] 骷髏套裝'},

    'helm_soldier': {name:'士兵頭盔', icon:'🪖', type:'equip', slot:'helm', def:4, price:1000, set:'set_soldier', desc:'[AC-4] 士兵套裝(白)'},
    'armor_soldier': {name:'士兵盔甲', icon:'🛡️', type:'equip', slot:'armor', def:6, price:1500, set:'set_soldier', desc:'[AC-6] 士兵套裝(白)'},
    'glove_soldier': {name:'士兵手套', icon:'🧤', type:'equip', slot:'glove', def:2, price:800, set:'set_soldier', desc:'[AC-2] 士兵套裝(白)'},
    'boot_soldier': {name:'士兵長靴', icon:'🥾', type:'equip', slot:'boot', def:3, price:1000, set:'set_soldier', desc:'[AC-3] 士兵套裝(白)'},
    'cloak_magic': {name:'抗魔斗篷(白)', icon:'🧥', type:'equip', slot:'cloak', def:1, price:2000, set:'set_soldier', desc:'[AC-1] [MR+5] 基礎抗魔'},
    'neck_basic': {name:'守護項鍊', icon:'📿', type:'equip', slot:'neck', def:1, price:1500, set:'set_soldier', desc:'[AC-1] 基礎防護'},
    'shirt_old': {name:'陳舊的T恤', icon:'👕', type:'equip', slot:'shirt', def:1, price:1000, set:'set_soldier', desc:'[AC-1] 舒適的內衣'},
    
    'helm_merc': {name:'傭兵頭盔', icon:'🪖', type:'equip', slot:'helm', def:5, price:2000, set:'set_mercenary', desc:'[AC-5] 傭兵套裝(白)'},
    'armor_merc': {name:'傭兵鱗甲', icon:'🛡️', type:'equip', slot:'armor', def:7, price:3000, set:'set_mercenary', desc:'[AC-7] 傭兵套裝(白)'},
    'glove_merc': {name:'傭兵護手', icon:'🧤', type:'equip', slot:'glove', def:3, price:1500, set:'set_mercenary', desc:'[AC-3] 傭兵套裝(白)'},
    'boot_merc': {name:'傭兵戰靴', icon:'🥾', type:'equip', slot:'boot', def:4, price:2000, set:'set_mercenary', desc:'[AC-4] 傭兵套裝(白)'},

    'helm_exp': {name:'探險家皮帽', icon:'🧢', type:'equip', slot:'helm', def:4, price:2500, set:'set_explorer', desc:'[AC-4] 探險家套裝(白)'},
    'armor_exp': {name:'探險家皮甲', icon:'👕', type:'equip', slot:'armor', def:6, price:3500, set:'set_explorer', desc:'[AC-6] 探險家套裝(白)'},
    'glove_exp': {name:'探險家皮手套', icon:'🧤', type:'equip', slot:'glove', def:2, price:1800, set:'set_explorer', desc:'[AC-2] 探險家套裝(白)'},
    'boot_exp': {name:'探險家皮靴', icon:'👢', type:'equip', slot:'boot', def:3, price:2200, set:'set_explorer', desc:'[AC-3] 探險家套裝(白)'},

    // --- Tier 2 (黃裝) ---
    'helm_royal': {name:'皇家頭盔', icon:'👑', type:'equip', slot:'helm', def:6, price:8000, set:'set_royal', desc:'[AC-6] 皇家套裝(黃)'},
    'armor_royal': {name:'皇家鎧甲', icon:'🛡️', type:'equip', slot:'armor', def:9, price:12000, set:'set_royal', desc:'[AC-9] 皇家套裝(黃)'},
    'glove_royal': {name:'皇家手套', icon:'🧤', type:'equip', slot:'glove', def:3, price:6000, set:'set_royal', desc:'[AC-3] 皇家套裝(黃)'},
    'boot_royal': {name:'皇家長靴', icon:'🥾', type:'equip', slot:'boot', def:5, price:7000, set:'set_royal', desc:'[AC-5] 皇家套裝(黃)'},
    'cloak_royal': {name:'皇家斗篷', icon:'🧥', type:'equip', slot:'cloak', def:2, price:8000, set:'set_royal', desc:'[AC-2] [MR+8]'},
    'neck_royal': {name:'皇家項鍊', icon:'📿', type:'equip', slot:'neck', def:1, hp:20, price:8000, set:'set_royal', desc:'[AC-1] [HP+20]'},
    'shirt_royal': {name:'皇家T恤', icon:'👕', type:'equip', slot:'shirt', def:2, price:8000, set:'set_royal', desc:'[AC-2]'},
    
    'helm_cmd': {name:'指揮官戰盔', icon:'⛑️', type:'equip', slot:'helm', def:6, price:9000, set:'set_commander', desc:'[AC-6] 指揮官套裝(黃)'},
    'armor_cmd': {name:'指揮官戰甲', icon:'🛡️', type:'equip', slot:'armor', def:10, price:14000, set:'set_commander', desc:'[AC-10] 指揮官套裝(黃)'},
    'glove_cmd': {name:'指揮官護手', icon:'🧤', type:'equip', slot:'glove', def:3, price:6500, set:'set_commander', desc:'[AC-3] 指揮官套裝(黃)'},
    'boot_cmd': {name:'指揮官戰靴', icon:'🥾', type:'equip', slot:'boot', def:5, price:8000, set:'set_commander', desc:'[AC-5] 指揮官套裝(黃)'},
    'cloak_cmd': {name:'指揮官斗篷', icon:'🧥', type:'equip', slot:'cloak', def:2, price:9000, set:'set_commander', desc:'[AC-2] [MR+10]'},
    'neck_cmd': {name:'指揮官項鍊', icon:'📿', type:'equip', slot:'neck', def:1, hp:30, price:9000, set:'set_commander', desc:'[AC-1] [HP+30]'},
    'shirt_cmd': {name:'指揮官T恤', icon:'👕', type:'equip', slot:'shirt', def:2, hp:10, price:9000, set:'set_commander', desc:'[AC-2] [HP+10]'},

    // --- Tier 3 (綠裝) ---
    'helm_emerald': {name:'翡翠頭飾', icon:'🥬', type:'equip', slot:'helm', def:7, price:20000, set:'set_emerald', desc:'[AC-7] 翡翠套裝(綠)'},
    'armor_emerald': {name:'翡翠鏈甲', icon:'🛡️', type:'equip', slot:'armor', def:11, price:30000, set:'set_emerald', desc:'[AC-11] 翡翠套裝(綠)'},
    'glove_emerald': {name:'翡翠手套', icon:'🧤', type:'equip', slot:'glove', def:4, price:15000, set:'set_emerald', desc:'[AC-4] 翡翠套裝(綠)'},
    'boot_emerald': {name:'翡翠長靴', icon:'👢', type:'equip', slot:'boot', def:6, price:18000, set:'set_emerald', desc:'[AC-6] 翡翠套裝(綠)'},
    'cloak_emerald': {name:'翡翠斗篷', icon:'🥬', type:'equip', slot:'cloak', def:3, price:25000, set:'set_emerald', desc:'[AC-3] [MR+10]'},
    'neck_emerald': {name:'翡翠項鍊', icon:'📿', type:'equip', slot:'neck', def:1, dex:1, price:25000, set:'set_emerald', desc:'[AC-1] [DEX+1]'},
    'shirt_emerald': {name:'翡翠T恤', icon:'👕', type:'equip', slot:'shirt', def:3, price:25000, set:'set_emerald', desc:'[AC-3]'},

    // --- Tier 4 (藍裝) ---
    'helm_phantom': {name:'幻影面具', icon:'🎭', type:'equip', slot:'helm', def:8, price:50000, set:'set_phantom', desc:'[AC-8] 幻影套裝(藍)'},
    'armor_phantom': {name:'幻影皮甲', icon:'👕', type:'equip', slot:'armor', def:13, price:80000, set:'set_phantom', desc:'[AC-13] 幻影套裝(藍)'},
    'glove_phantom': {name:'幻影手套', icon:'🧤', type:'equip', slot:'glove', def:5, price:40000, set:'set_phantom', desc:'[AC-5] 幻影套裝(藍)'},
    'boot_phantom': {name:'幻影長靴', icon:'👢', type:'equip', slot:'boot', def:7, price:45000, set:'set_phantom', desc:'[AC-7] 幻影套裝(藍)'},
    'cloak_phantom': {name:'幻影斗篷', icon:'🎭', type:'equip', slot:'cloak', def:4, price:50000, set:'set_phantom', desc:'[AC-4] [MR+12]'},
    'neck_phantom': {name:'幻影項鍊', icon:'📿', type:'equip', slot:'neck', def:1, str:1, price:50000, set:'set_phantom', desc:'[AC-1] [STR+1]'},
    'shirt_phantom': {name:'幻影T恤', icon:'👕', type:'equip', slot:'shirt', def:4, price:50000, set:'set_phantom', desc:'[AC-4]'},

    // --- Tier 5 (紅裝) ---
    'helm_blood': {name:'鮮血頭盔', icon:'🩸', type:'equip', slot:'helm', def:9, price:200000, set:'set_blood', desc:'[AC-9] 鮮血套裝(紅)'},
    'armor_blood': {name:'鮮血鎧甲', icon:'🛡️', type:'equip', slot:'armor', def:15, price:200000, set:'set_blood', desc:'[AC-15] 鮮血套裝(紅)'},
    'glove_blood': {name:'鮮血護手', icon:'🧤', type:'equip', slot:'glove', def:6, price:200000, set:'set_blood', desc:'[AC-6] 鮮血套裝(紅)'},
    'boot_blood': {name:'鮮血戰靴', icon:'🥾', type:'equip', slot:'boot', def:8, price:200000, set:'set_blood', desc:'[AC-8] 鮮血套裝(紅)'},
    'cloak_blood': {name:'鮮血斗篷', icon:'🩸', type:'equip', slot:'cloak', def:5, price:200000, set:'set_blood', desc:'[AC-5] [MR+15] [MP回+2]'},
    'neck_blood': {name:'鮮血項鍊', icon:'📿', type:'equip', slot:'neck', def:2, con:1, price:200000, set:'set_blood', desc:'[AC-2] [CON+1] [HP回+5]'},
    'shirt_blood': {name:'鮮血T恤', icon:'👕', type:'equip', slot:'shirt', def:5, price:200000, set:'set_blood', desc:'[AC-5] [MP回+2]'},
    
    // --- Tier 6 (紫裝) ---
    'helm_void': {name:'虛空之冠', icon:'👑', type:'equip', slot:'helm', def:12, price:750000, set:'set_void', desc:'[AC-12] 虛空套裝(紫)'},
    'armor_void': {name:'虛空神鎧', icon:'🛡️', type:'equip', slot:'armor', def:20, price:750000, set:'set_void', desc:'[AC-20] 虛空套裝(紫)'},
    'glove_void': {name:'虛空神手', icon:'🧤', type:'equip', slot:'glove', def:8, price:750000, set:'set_void', desc:'[AC-8] 虛空套裝(紫)'},
    'boot_void': {name:'虛空神靴', icon:'🥾', type:'equip', slot:'boot', def:10, price:750000, set:'set_void', desc:'[AC-10] 虛空套裝(紫)'},
    'cloak_void': {name:'虛空斗篷', icon:'👑', type:'equip', slot:'cloak', def:7, price:750000, set:'set_void', desc:'[AC-7] [MR+25] [減傷+2]'},
    'neck_void': {name:'虛空項鍊', icon:'📿', type:'equip', slot:'neck', def:3, int:1, price:750000, set:'set_void', desc:'[AC-3] [INT+1] [全能力+1]'},
    'shirt_void': {name:'虛空T恤', icon:'👕', type:'equip', slot:'shirt', def:7, price:750000, set:'set_void', desc:'[AC-7] [減傷+1]'},
    
    // --- Tier 7 (炎變 - Flame/God) ---
    'sword_flame_1': {name:'炎變烈焰劍', icon:'⚔️', type:'equip', slot:'weapon', atk:100, price:2500000, buyable:false, class:'knight', sound:'sword_magic', desc:'[Atk:100] 機率發動烈炎術 / HP回復UP'},
    'sword_flame_2': {name:'炎變轉生劍', icon:'🗡️', type:'equip', slot:'weapon', atk:100, price:2500000, buyable:false, class:'knight', sound:'sword_magic', desc:'[Atk:100] 機率發動火球術 / 吸血'},
    
    'bow_flame_1': {name:'炎變烈焰弓', icon:'🏹', type:'equip', slot:'weapon', atk:50, price:2500000, buyable:false, class:'elf', projType:'magic_arrow', sound:'bow_magic', desc:'[Atk:50] 機率發動三重矢'},
    'bow_flame_2': {name:'炎變轉生弓', icon:'🏹', type:'equip', slot:'weapon', atk:50, price:2500000, buyable:false, class:'elf', projType:'magic_arrow', sound:'bow_magic', desc:'[Atk:50] 機率發動烈炎術'},
    
    'staff_flame_1': {name:'炎變烈焰魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:50, price:2500000, buyable:false, class:'mage', sound:'staff', desc:'[Atk:50] 機率發動烈炎術 / 雙倍吸魔'},
    'staff_flame_2': {name:'炎變轉生魔杖', icon:'🥢', type:'equip', slot:'weapon', atk:50, price:2500000, buyable:false, class:'mage', sound:'staff', desc:'[Atk:50] 機率發動範圍衝擊之暈 / 雙倍回魔'},
};

// --- 技能資料 (Skills) ---
const SKILLS = {
    'k1': {name:'衝擊之暈', mp:15, lv:15, class:'knight', icon:'💫', sound:'stun', desc:'使敵人暈眩3秒 (隨技能等級增加時間)'},
    'k2': {name:'增幅防禦', mp:15, lv:30, class:'knight', icon:'🛡️', buff:'solid_carriage', duration:60000, sound:'magic_def', desc:'60秒內減傷 (隨技能等級增加)'},
    'k3': {name:'反擊屏障', mp:20, lv:45, class:'knight', icon:'⚔️', buff:'counter_barrier', duration:120000, sound:'magic_atk', desc:'機率迴避近戰傷害並反擊 (隨技能等級增傷)'},
    
    'e_heal_1': {name:'初級治癒術', mp:10, lv:10, class:'elf', icon:'❤️', sound:'heal', desc:'恢復HP (MP:10)'}, 
    'e_heal_2': {name:'中級治癒術', mp:20, lv:20, class:'elf', icon:'🧡', sound:'heal', desc:'恢復更多HP (MP:20)'}, 
    'e_heal_3': {name:'高級治癒術', mp:40, lv:40, class:'elf', icon:'💛', sound:'heal_full', desc:'強力恢復HP (MP:40)'}, 
    'e2': {name:'魂體轉換', mp:0, lv:30, class:'elf', icon:'🌀', sound:'magic_soul', desc:'消耗HP轉換MP'}, 
    'e3': {name:'烈炎武器', mp:30, lv:45, class:'elf', icon:'🔥', buff:'fire_weapon', duration:960000, sound:'magic_fire', desc:'[近戰攻擊+8]'}, 
    'e1': {name:'三重矢', mp:15, lv:52, class:'elf', icon:'🏹', projType:'arrow_triple', sound:'bow_triple', desc:'快速三連射'}, 

    // [Updated] 風之神射：MP 100, 10分鐘, 爆擊+20%
    'e5': {name:'風之神射', mp:100, lv:15, class:'elf', icon:'🍃', buff:'wind_shot', duration:600000, sound:'magic_wind', desc:'[遠攻爆擊+20%]'}, 
    
    // [Updated] 暴風神射：MP 200, 10分鐘, 傷害+50
    'e6': {name:'暴風神射', mp:200, lv:45, class:'elf', icon:'🌪️', buff:'storm_shot', duration:600000, sound:'magic_wind', desc:'[遠攻傷害+50]'}, 

    'm1': {name:'光箭', mp:10, lv:1, class:'mage', icon:'⚡', projType:'arrow', sound:'magic_arrow', desc:'基礎遠程魔法'},
    'm2': {name:'火球術', mp:80, lv:15, class:'mage', icon:'🔥', effectType:'fire_area', areaRange: 300, sound:'fireball', desc:'大範圍爆炸傷害 (MP:80)'}, 
    'm3': {name:'初級治癒術', mp:10, lv:5, class:'mage', icon:'❤️', sound:'heal', desc:'恢復HP'},
    'm4': {name:'中級治癒術', mp:20, lv:20, class:'mage', icon:'🧡', sound:'heal', desc:'恢復更多HP'},
    'm5': {name:'高級治癒術', mp:40, lv:40, class:'mage', icon:'💛', sound:'heal_full', desc:'強力恢復HP'},
    'm6': {name:'聖結界', mp:600, lv:45, class:'mage', icon:'🛡️', buff:'immune_to_harm', duration:120000, sound:'magic_def', desc:'[Lv.45] 受到傷害減半 (MP:600)'},
    'm8': {name:'烈炎術', mp:150, lv:50, class:'mage', icon:'💥', effectType:'explosion', sound:'fire_bang', desc:'[Lv.50] 巨大單體爆發 (MP:200)'},
    'm9': {name:'火風暴', mp:200, lv:55, class:'mage', icon:'🌪️', effectType:'fire_storm', sound:'fire_storm', desc:'[Lv.55] 地面持續燃燒，持續傷害 (MP:1000)'},
    'm7': {name:'流星雨', mp:500, lv:60, class:'mage', icon:'☄️', effectType:'meteor_rain', cooldown:12000, sound:'meteor', desc:'[Lv.60] 全畫面毀滅性隕石 (MP:2000)'},
    'm10': {name:'靈魂昇華', mp:500, lv:60, class:'mage', icon:'✨', buff:'soul_elevation', duration:1200000, sound:'magic_soul', desc:'[Lv.60] HP/MP最大值增加30% (MP:500)'},
    'm11': {name:'召喚術', mp:100, lv:40, class:'mage', icon:'🐺', sound:'summon', desc:'[Lv.40] 召喚強力怪物協助戰鬥'},
};

// --- 怪物資料 (Mobs) ---
const MOB_TYPES = {
    // 0. 新手木樁
    'dummy': {
        name:'木人', hp:100, exp:1.0, atk:0, def:0, s:20, c:'#8b4513', aggro:false, 
        drops:[{k:'potion_green',c:0.15},{k:'potion_brave',c:0.05},{k:'cookie_elf',c:0.05},{k:'potion_wisdom',c:0.05}], 
        minGold:0, maxGold:0
    }, 
    
    'summon_creature': {name:'召喚獸', hp:2000, exp:0, atk:150, def:20, s:15, c:'#4169e1', aggro:false, drops:[], isPet:true, minGold:0, maxGold:0},

    // 1-3. 初級區域
    'goblin': {name:'哥布林 Lv.5', hp:80, exp:0.8, atk:15, def:0, s:20, c:'#32cd32', aggro:false, drops:[{k:'potion',c:0.5},{k:'mat_leather',c:0.2}], minGold:10, maxGold:30}, 
    'kobold': {name:'地靈 Lv.8', hp:120, exp:1.2, atk:20, def:1, s:22, c:'#cd853f', aggro:false, drops:[{k:'potion',c:0.4},{k:'mat_iron',c:0.1},{k:'dagger',c:0.05}], minGold:15, maxGold:40}, 
    'orc': {name:'妖魔 Lv.10', hp:160, exp:1.5, atk:25, def:2, s:24, c:'#556b2f', aggro:false, drops:[{k:'potion',c:0.6},{k:'mat_leather',c:0.3}], minGold:20, maxGold:50},
    'dwarf': {name:'侏儒 Lv.12', hp:200, exp:2.0, atk:30, def:3, s:22, c:'#8b4513', aggro:false, drops:[{k:'mat_iron',c:0.4}], minGold:25, maxGold:55},
    
    // Map 2-4
    'orc_fighter': {name:'妖魔鬥士 Lv.25', hp:450, exp:5.0, atk:65, def:5, s:28, c:'#8fbc8f', aggro:true, drops:[{k:'dagger',c:0.1}], minGold:40, maxGold:80}, 
    'werewolf': {name:'狼人 Lv.28', hp:650, exp:6.0, atk:75, def:3, s:30, c:'#708090', aggro:true, drops:[{k:'potion_green',c:0.1},{k:'mat_leather',c:0.5}], minGold:50, maxGold:100}, 
    'ungoliant': {name:'楊果里恩 Lv.32', hp:800, exp:7.0, atk:90, def:5, s:35, c:'#4b0082', aggro:true, drops:[{k:'antidote',c:0.5},{k:'zel',c:0.0006},{k:'bow',c:0.05}], minGold:60, maxGold:120}, 
    'skeleton': {name:'骷髏 Lv.25', hp:600, exp:5.5, atk:75, def:6, s:24, c:'#f5f5f5', aggro:true, drops:[
        {k:'helm_skull',c:0.1},{k:'armor_skull',c:0.1},{k:'zel',c:0.0006},
        {k:'shield_skull',c:0.05}, {k:'glove_skull',c:0.05}, {k:'boot_skull',c:0.05}
    ], minGold:55, maxGold:110}, 
    'ghoul': {name:'食屍鬼 Lv.28', hp:800, exp:6.5, atk:90, def:4, s:28, c:'#556b2f', aggro:true, drops:[{k:'dai',c:0.0006},{k:'antidote',c:0.3}], minGold:65, maxGold:130},
    'lycanthrope': {name:'萊肯 Lv.30', hp:900, exp:8.0, atk:100, def:8, s:35, c:'#4a4a4a', aggro:true, drops:[{k:'zel',c:0.0008}, {k:'cloak_mr',c:0.005}], minGold:70, maxGold:140}, 
    'ant': {name:'巨蟻 Lv.32', hp:700, exp:7.5, atk:85, def:10, s:24, c:'#1a1a1a', aggro:true, drops:[{k:'potion_orange',c:0.3}], minGold:60, maxGold:120}, 

    // Lv.35-49 區域
    'gast': {name:'食人妖精 Lv.35', hp:1200, exp:15.0, atk:120, def:5, s:50, c:'#696969', aggro:true, drops:[
        {k:'glove_power',c:0.05},{k:'potion_brave',c:0.2},{k:'bow_cross',c:0.05},
        {k:'zel',c:0.002},
        {k:'neck_str',c:0.001}, {k:'neck_dex',c:0.001},
        {k:'glove_soldier',c:0.05}, {k:'boot_soldier',c:0.05} 
    ], minGold:80, maxGold:150},
    
    'lizardman': {name:'蜥蜴人 Lv.45', hp:1500, exp:25.0, atk:130, def:12, s:35, c:'#6b8e23', aggro:true, drops:[
        {k:'sword_long',c:0.1},{k:'potion_orange',c:0.3},
        {k:'helm_soldier',c:0.05}, {k:'armor_soldier',c:0.05} 
    ], minGold:100, maxGold:200}, 
    
    'bandit': {name:'奇岩盜賊 Lv.48', hp:1600, exp:30.0, atk:150, def:10, s:32, c:'#d2b48c', aggro:true, drops:[
        {k:'zel_b',c:0.002},{k:'sword_tsurugi',c:0.02},
        {k:'zel',c:0.002}, {k:'dai',c:0.002},
        {k:'glove_merc',c:0.03}, {k:'boot_merc',c:0.03}, 
        {k:'quest_map',c:0.01}, {k:'neck_royal',c:0.005} 
    ], minGold:120, maxGold:250}, 
    
    // --- [EXP Boost - Plan B] ---
    'yeti': {name:'雪怪 Lv.50', hp:2000, exp:40.0, atk:180, def:15, s:45, c:'#f0ffff', aggro:true, drops:[
        {k:'potion_white',c:0.5},{k:'armor_chain',c:0.05},
        {k:'dai',c:0.0025},
        {k:'helm_merc',c:0.03}, {k:'armor_merc',c:0.03},
        {k:'shirt_royal',c:0.005} 
    ], minGold:150, maxGold:300},

    'elmore_soldier': {name:'艾爾摩士兵 Lv.52', hp:2200, exp:55.0, atk:170, def:18, s:35, c:'#8b4513', aggro:true, drops:[
        {k:'dai',c:0.002},
        {k:'glove_exp',c:0.03}, {k:'boot_exp',c:0.03},
        {k:'armor_exp',c:0.03}
    ], minGold:160, maxGold:320}, 
    
    'living_armor_weak': {name:'被詛咒的盔甲 Lv.55', hp:2500, exp:65.0, atk:200, def:25, s:40, c:'#708090', aggro:true, drops:[
        {k:'zel',c:0.002}, {k:'dai',c:0.002},
        {k:'helm_exp',c:0.03}, {k:'armor_exp',c:0.03}
    ], minGold:180, maxGold:350},

    'medusa': {name:'梅杜莎 Lv.60', hp:2800, exp:90.0, atk:220, def:20, s:35, c:'#9acd32', aggro:true, drops:[
        {k:'cloak_mr',c:0.05},{k:'zel',c:0.002},
        {k:'glove_royal',c:0.01}, {k:'boot_royal',c:0.01},
        {k:'cloak_royal',c:0.005} 
    ], minGold:200, maxGold:400},

    'skeleton_marksman': {name:'骷髏神射手 Lv.62', hp:3200, exp:100.0, atk:280, def:15, s:26, c:'#eef', aggro:true, drops:[
        {k:'bow_cross',c:0.05},{k:'zel',c:0.002},
        {k:'helm_royal',c:0.01}, {k:'bow_royal',c:0.005},
        {k:'neck_cmd',c:0.005}, {k:'neck_emerald',c:0.002} 
    ], minGold:220, maxGold:420}, 

    'dragon_fly_elite': {name:'精英飛龍 (Mini Boss) Lv.65', hp:20000, exp:3000.0, atk:600, def:40, s:80, c:'#8B0000', aggro:true, drops:[
        {k:'zel',c:0.5}, {k:'dai',c:0.5},
        {k:'armor_royal',c:0.1}, {k:'armor_cmd',c:0.1}
    ], magic:'fireball', isBoss:true, respawnTime:300, scale:1.5, minGold:1000, maxGold:2000},

    'fire_egg': {name:'火靈 Lv.70', hp:3500, exp:130.0, atk:250, def:10, s:25, c:'#ff4500', aggro:true, drops:[
        {k:'potion_ultimate',c:0.3},
        {k:'glove_cmd',c:0.01}, {k:'boot_cmd',c:0.01},
        {k:'sword_royal',c:0.005},
        {k:'cloak_cmd',c:0.005} 
    ], magic:'fireball', minGold:250, maxGold:500}, 

    'succubus': {name:'思克巴 Lv.75', hp:4000, exp:160.0, atk:350, def:15, s:32, c:'#9932cc', aggro:true, drops:[
        {k:'dai_b',c:0.001},{k:'scroll_teleport',c:1.0},
        {k:'cloak_mr',c:0.02},
        {k:'helm_cmd',c:0.01}, {k:'armor_cmd',c:0.005},
        {k:'shirt_cmd',c:0.005}, {k:'cloak_emerald',c:0.002}, {k:'cloak_phantom',c:0.002}
    ], magic:'magic', minGold:300, maxGold:600},

    'living_armor': {name:'活鎧甲 Lv.78', hp:6000, exp:300.0, atk:320, def:40, s:40, c:'#708090', aggro:true, drops:[
        {k:'armor_plate',c:0.3},{k:'sword_great',c:0.1},
        {k:'armor_emerald',c:0.005}, {k:'helm_emerald',c:0.01},
        {k:'neck_phantom',c:0.002}
    ], minGold:350, maxGold:700}, 
    
    'skeleton_guard': {name:'骷髏警衛 Lv.80', hp:5000, exp:375.0, atk:380, def:30, s:26, c:'#eef', aggro:true, drops:[
        {k:'helm_skull',c:0.1},{k:'zel',c:0.005},
        {k:'glove_emerald',c:0.01}, {k:'boot_emerald',c:0.01},
        {k:'shirt_phantom',c:0.002}
    ], minGold:400, maxGold:800},

    'ghoul_poison': {name:'劇毒食屍鬼 Lv.82', hp:6500, exp:450.0, atk:420, def:25, s:30, c:'#464', aggro:true, drops:[
        {k:'dai',c:0.005},{k:'antidote',c:0.5},
        {k:'armor_emerald',c:0.005},
        {k:'cloak_emerald',c:0.002}, {k:'cloak_blood',c:0.001}
    ], minGold:450, maxGold:900},

    'minotaur': {name:'米諾斯 Lv.85', hp:9000, exp:625.0, atk:450, def:30, s:60, c:'#daa520', aggro:true, drops:[
        {k:'glove_phantom',c:0.005}, {k:'boot_phantom',c:0.005},
        {k:'helm_emerald',c:0.01},
        {k:'neck_blood',c:0.001}
    ], minGold:500, maxGold:1000},

    'lycanthrope_hunter': {name:'萊肯獵人 Lv.88', hp:8000, exp:750.0, atk:480, def:35, s:38, c:'#333', aggro:true, drops:[
        {k:'zel_b',c:0.002},
        {k:'helm_phantom',c:0.005}, {k:'armor_phantom',c:0.002},
        {k:'shirt_blood',c:0.001}
    ], minGold:600, maxGold:1200},

    'dark_elf': {name:'暗殺軍王下屬 Lv.92', hp:11000, exp:1200.0, atk:550, def:25, s:32, c:'#ffd700', aggro:true, drops:[
        {k:'zel_b',c:0.003},{k:'rapier',c:0.05},
        {k:'armor_phantom',c:0.005},
        {k:'glove_blood',c:0.002},
        {k:'cloak_void',c:0.0005} 
    ], minGold:700, maxGold:1400},

    'lizardman_warrior': {name:'蜥蜴人戰士 Lv.95', hp:10000, exp:1500.0, atk:550, def:45, s:38, c:'#572', aggro:true, drops:[
        {k:'glove_stone',c:0.1},
        {k:'boot_blood',c:0.002}, {k:'helm_blood',c:0.002},
        {k:'neck_void',c:0.0005}, 
        {k:'sword_flame_1',c:0.001}, {k:'sword_flame_2',c:0.001},
        {k:'bow_flame_1',c:0.001}, {k:'bow_flame_2',c:0.001},
        {k:'staff_flame_1',c:0.001}, {k:'staff_flame_2',c:0.001}
    ], minGold:800, maxGold:1600},

    'snake_woman': {name:'蛇人 Lv.96', hp:12000, exp:1800.0, atk:500, def:35, s:35, c:'#9acd32', aggro:true, drops:[
        {k:'potion_ultimate',c:0.8},
        {k:'armor_blood',c:0.001},
        {k:'glove_blood',c:0.002},
        {k:'shirt_void',c:0.0005}, 
        {k:'sword_flame_1',c:0.001}, {k:'sword_flame_2',c:0.001},
        {k:'bow_flame_1',c:0.001}, {k:'bow_flame_2',c:0.001},
        {k:'staff_flame_1',c:0.001}, {k:'staff_flame_2',c:0.001}
    ], magic:'magic', minGold:900, maxGold:1800},

    'giant_ant_soldier': {name:'巨蟻士兵 Lv.100', hp:12000, exp:2400.0, atk:600, def:50, s:28, c:'#000', aggro:true, drops:[
        {k:'potion_ultimate',c:0.5},{k:'dai_b',c:0.003},
        {k:'sword_blood',c:0.001},
        {k:'glove_void',c:0.0005}, {k:'boot_void',c:0.0005},
        {k:'sword_flame_1',c:0.00125}, {k:'sword_flame_2',c:0.00125},
        {k:'bow_flame_1',c:0.00125}, {k:'bow_flame_2',c:0.00125},
        {k:'staff_flame_1',c:0.00125}, {k:'staff_flame_2',c:0.00125}
    ], minGold:1000, maxGold:2000},

    'anubis': {name:'阿努比斯 Lv.105', hp:18000, exp:3600.0, atk:650, def:50, s:40, c:'#ffd700', aggro:true, drops:[
        {k:'zel_b',c:0.005},{k:'dai_b',c:0.005},
        {k:'helm_void',c:0.0005}, {k:'armor_void',c:0.0002},
        {k:'sword_flame_1',c:0.00125}, {k:'sword_flame_2',c:0.00125},
        {k:'bow_flame_1',c:0.00125}, {k:'bow_flame_2',c:0.00125},
        {k:'staff_flame_1',c:0.00125}, {k:'staff_flame_2',c:0.00125}
    ], magic:'fireball', minGold:1200, maxGold:2400},

    'void_spirit': {name:'虛空之靈 Lv.115', hp:25000, exp:5400.0, atk:800, def:10, s:35, c:'#000000', aggro:true, drops:[
        {k:'potion_ultimate',c:1.0},
        {k:'armor_void',c:0.001}, {k:'sword_void',c:0.0005},
        {k:'sword_flame_1',c:0.002}, {k:'sword_flame_2',c:0.002},
        {k:'bow_flame_1',c:0.002}, {k:'bow_flame_2',c:0.002},
        {k:'staff_flame_1',c:0.002}, {k:'staff_flame_2',c:0.002}
    ], magic:'meteor', minGold:1500, maxGold:3000},

    'dragon_fly_void': {name:'虛空飛龍 Lv.115', hp:20000, exp:7500.0, atk:900, def:60, s:90, c:'#313', aggro:true, drops:[
        {k:'zel_b',c:0.01},{k:'mat_mithril',c:1.0},
        {k:'glove_void',c:0.001}, {k:'boot_void',c:0.001},
        {k:'sword_flame_1',c:0.002}, {k:'sword_flame_2',c:0.002},
        {k:'bow_flame_1',c:0.002}, {k:'bow_flame_2',c:0.002},
        {k:'staff_flame_1',c:0.002}, {k:'staff_flame_2',c:0.002}
    ], magic:'fireball', minGold:2000, maxGold:4000},

    // --- Bosses (EXP Balance Fix: Target 150-200x of Mobs) ---
    // Rule: 小怪提升後，Boss 經驗必須同步上調，否則打王變虧本。
    
    'araneid': {name:'巨大蜘蛛 (Boss) Lv.25', hp:10000, exp:100.0, atk:300, def:20, s:60, c:'#8b4513', aggro:true, drops:[ // 1000 -> 2000
        {k:'zel',c:0.5},{k:'sword_long',c:0.5},
        {k:'helm_soldier',c:0.2}, {k:'armor_soldier',c:0.2}, {k:'glove_soldier',c:0.2}, {k:'boot_soldier',c:0.2},
        {k:'shield_skull',c:0.1}
    ], isBoss:true, respawnTime:3600, scale:2.2, minGold:2500, maxGold:3750},
    
    'necromancer': {name:'死靈法師 (Boss) Lv.30', hp:1500, exp:150.0, atk:450, def:30, s:50, c:'#483d8b', aggro:true, drops:[ // 1800 -> 3500
        {k:'staff',c:1.0},{k:'zel_b',c:0.05},
        {k:'helm_merc',c:0.2}, {k:'armor_merc',c:0.2}
    ], isBoss:true, magic:'fireball', respawnTime:7200, scale:2.0, minGold:3000, maxGold:4500},
    
    'giant_ant_queen': {name:'巨蟻女皇 (Boss) Lv.45', hp:30000, exp:800.0, atk:600, def:50, s:100, c:'#2a2a2a', aggro:true, drops:[ // 3000 -> 8000
        {k:'cloak_protect',c:1.0},{k:'dai_b',c:0.1},
        {k:'helm_exp',c:0.2}, {k:'armor_exp',c:0.2}, {k:'glove_exp',c:0.2}, {k:'boot_exp',c:0.2},
        {k:'shirt_elf',c:0.1}
    ], isBoss:true, respawnTime:14400, scale:2.5, minGold:3750, maxGold:5000}, 
    
    'giant_crocodile': {name:'巨大鱷魚 (Boss) Lv.50', hp:45000, exp:1000.0, atk:800, def:60, s:90, c:'#228b22', aggro:true, drops:[ // 5000 -> 12000 (Mob: 50 EXP -> 240x)
        {k:'dai',c:0.5},{k:'potion_brave',c:1.0},
        {k:'helm_royal',c:0.2}, {k:'armor_royal',c:0.2}, {k:'glove_royal',c:0.2}, {k:'boot_royal',c:0.2},
        {k:'cloak_royal',c:0.1}, {k:'neck_royal',c:0.1}, {k:'shirt_royal',c:0.1}
    ], isBoss:true, respawnTime:14400, scale:2.5, minGold:4500, maxGold:5500}, 
    
    'drake': {name:'飛龍 (Boss) Lv.60', hp:60000, exp:2000.0, atk:1000, def:70, s:80, c:'#5d4037', aggro:true, drops:[ // 10000 -> 20000 (Mob: 100 EXP -> 200x)
        {k:'neck_brave',c:1.0}, {k:'mat_mithril',c:1.0},
        {k:'zel',c:0.8}, {k:'dai',c:0.8},
        {k:'zel_b',c:0.2}, {k:'dai_b',c:0.2},
        {k:'helm_cmd',c:0.2}, {k:'armor_cmd',c:0.2}, {k:'glove_cmd',c:0.2}, {k:'boot_cmd',c:0.2},
        {k:'cloak_cmd',c:0.1}, {k:'neck_cmd',c:0.1}, {k:'shirt_cmd',c:0.1}
    ], isBoss:true, magic:'fireball', respawnTime:21600, scale:2.8, minGold:20000, maxGold:30000}, 
    
    'demon': {name:'惡魔 (Boss) Lv.80', hp:120000, exp:2000.0, atk:1500, def:80, s:100, c:'#b22222', aggro:true, drops:[ // 25000 -> 60000 (Mob: 375 EXP -> 160x)
        {k:'shirt_str',c:1.0},{k:'glove_power',c:0.5},
        {k:'helm_emerald',c:0.3}, {k:'armor_emerald',c:0.3}, {k:'glove_emerald',c:0.3}, {k:'boot_emerald',c:0.3},
        {k:'cloak_emerald',c:0.1}, {k:'neck_emerald',c:0.1}, {k:'shirt_emerald',c:0.1}
    ], isBoss:true, magic:'meteor', respawnTime:43200, scale:2.2, minGold:5500, maxGold:7000}, 
    
    'death_knight': {name:'死亡騎士 (Boss) Lv.85', hp:25000, exp:120000.0, atk:2000, def:100, s:70, c:'#ffd700', aggro:true, drops:[ // 40000 -> 120000 (Mob: 600 EXP -> 200x)
        {k:'zel_b',c:1.0},
        {k:'helm_phantom',c:0.3}, {k:'armor_phantom',c:0.3}, {k:'glove_phantom',c:0.3}, {k:'boot_phantom',c:0.3}
    ], isBoss:true, magic:'meteor', respawnTime:21600, scale:2.0, minGold:6250, maxGold:7500}, 
    
    'baphomet': {name:'巴風特 (Boss) Lv.90', hp:180000, exp:2500.0, atk:2200, def:90, s:90, c:'#191970', aggro:true, drops:[ // 60000 -> 200000 (Mob: 1200 EXP -> 166x)
        {k:'staff_crystal',c:1.0},
        {k:'helm_blood',c:0.2}, {k:'armor_blood',c:0.2}, {k:'glove_blood',c:0.2}, {k:'boot_blood',c:0.2},
        {k:'cloak_blood',c:0.1}, {k:'neck_blood',c:0.1}, {k:'shirt_blood',c:0.1},
        {k:'sword_flame_1',c:0.005}, {k:'sword_flame_2',c:0.005},
        {k:'bow_flame_1',c:0.005}, {k:'bow_flame_2',c:0.005},
        {k:'staff_flame_1',c:0.005}, {k:'staff_flame_2',c:0.005}
    ], isBoss:true, magic:'fireball', respawnTime:43200, scale:2.2, minGold:7000, maxGold:8000}, 
    
    'dante': {name:'丹特斯 (Boss) Lv.95', hp:250000, exp:3000.0, atk:2500, def:120, s:75, c:'#4b0082', aggro:true, drops:[ // 100000 -> 300000 (Mob: 1500 EXP -> 200x)
        {k:'sword_void',c:0.01},
        {k:'helm_void',c:0.1}, {k:'armor_void',c:0.1}
    ], isBoss:true, magic:'meteor', respawnTime:43200, scale:2.0, minGold:7500, maxGold:8750}, 
    
    // [Tier 1 Boss: 0.5%]
    'zebulon': {name:'傑弗雷肯 (Boss) Lv.100', hp:300000, exp:5000.0, atk:2800, def:130, s:120, c:'#556b2f', aggro:true, drops:[ // 150000 -> 500000 (Mob: 2400 EXP -> 200x)
        {k:'sword_wind',c:0.05},
        {k:'glove_void',c:0.1}, {k:'boot_void',c:0.1}, {k:'bow_royal',c:0.5},
        {k:'sword_flame_1',c:0.005}, {k:'sword_flame_2',c:0.005},
        {k:'bow_flame_1',c:0.005}, {k:'bow_flame_2',c:0.005},
        {k:'staff_flame_1',c:0.005}, {k:'staff_flame_2',c:0.005}
    ], isBoss:true, magic:'fireball', respawnTime:43200, scale:2.5, minGold:7500, maxGold:8750}, 
    
    // [Tier 2 Boss: 1.0%]
    'osiris': {name:'歐西里斯 (Boss) Lv.110', hp:450000, exp:8000.0, atk:3500, def:150, s:80, c:'#ffd700', aggro:true, drops:[ // 200000 -> 800000 (Mob: 3600 EXP -> 220x)
        {k:'helm_void',c:0.3}, {k:'armor_void',c:0.3}, {k:'glove_void',c:0.3}, {k:'boot_void',c:0.3},
        {k:'cloak_void',c:0.1}, {k:'neck_void',c:0.1}, {k:'shirt_void',c:0.1},
        {k:'sword_flame_1',c:0.01}, {k:'sword_flame_2',c:0.01},
        {k:'bow_flame_1',c:0.01}, {k:'bow_flame_2',c:0.01},
        {k:'staff_flame_1',c:0.01}, {k:'staff_flame_2',c:0.01}
    ], isBoss:true, magic:'meteor', respawnTime:86400, scale:2.2, minGold:7500, maxGold:8750}, 
    
    // [Tier 3 Boss: 2.0%]
    'girtao': {name:'吉爾塔斯 (Boss) Lv.120', hp:1000000, exp:15000.0, atk:5000, def:200, s:150, c:'#4b0082', aggro:true, drops:[ // 300000 -> 1500000 (Mob: 7500 EXP -> 200x)
        {k:'sword_void',c:0.5}, // 虛空魔劍必掉
        {k:'armor_void',c:1.0}, {k:'helm_void',c:1.0}, {k:'glove_void',c:1.0}, {k:'boot_void',c:1.0}, 
        {k:'cloak_void',c:0.5}, {k:'neck_void',c:0.5}, {k:'shirt_void',c:0.5},
        {k:'sword_flame_1',c:0.02}, {k:'sword_flame_2',c:0.02},
        {k:'bow_flame_1',c:0.02}, {k:'bow_flame_2',c:0.02},
        {k:'staff_flame_1',c:0.02}, {k:'staff_flame_2',c:0.02}
    ], isBoss:true, magic:'meteor', respawnTime:86400, scale:3.0, minGold:7500, maxGold:8750},
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
    8: {name:'象牙塔 8F (Lv.50-60)', c1:'#334', c2:'#dda', desc:'魔法生物與活鎧甲', mobs:['living_armor_weak','yeti','elmore_soldier'], boss:'demon', x:1000, y:-2500, w:80, h:100, t:'snow', theme:'ivory_tower', returnMap:7},
    9: {name:'龍之谷 (Lv.60-70)', c1:'#422', c2:'#311', desc:'巨大的骨骸與飛龍', mobs:['skeleton','skeleton_marksman','skeleton_guard'], boss:'drake', boss2: 'dragon_fly_elite', x:2000, y:-500, w:150, h:120, t:'dirt', theme:'wasteland', returnMap:7},
    10: {name:'火龍窟 (Lv.70-75)', c1:'#611', c2:'#400', desc:'灼熱的煉獄', mobs:['fire_egg','skeleton_marksman','succubus'], x:3000, y:-1000, w:100, h:100, t:'dirt', theme:'volcano', returnMap:7},
    11: {name:'傲慢之塔 (Lv.75-80)', c1:'#303', c2:'#202', desc:'最頂層的挑戰', mobs:['medusa','succubus','minotaur'], boss:'baphomet', x:0, y:-3000, w:80, h:150, t:'stone', theme:'ivory_tower', returnMap:7},
    12: {name:'古魯丁地監 7F (Lv.80-85)', c1:'#000', c2:'#200', desc:'死亡騎士的領地', mobs:['skeleton_guard','ghoul_poison','living_armor'], boss:'death_knight', x:-2200, y:-1200, w:60, h:60, t:'cave', theme:'dungeon', returnMap:1},
    13: {name:'遺忘之島 (Lv.85-90)', c1:'#244', c2:'#133', desc:'被遺忘的強力怪物', mobs:['minotaur','lycanthrope_hunter'], boss:'drake', x:-3000, y:-3000, w:120, h:120, t:'grass', theme:'forest', returnMap:7},
    14: {name:'拉斯塔巴德 (Lv.90-95)', c1:'#222', c2:'#100', desc:'黑暗妖精的地下要塞', mobs:['dark_elf','minotaur','living_armor'], boss:'dante', x:4000, y:0, w:200, h:200, t:'stone', theme:'lastabad', returnMap:7},
    15: {name:'提卡爾神廟 (Lv.95-100)', c1:'#242', c2:'#131', desc:'時空裂痕中的古文明', mobs:['snake_woman','lizardman_warrior','fire_egg'], boss:'zebulon', x:4000, y:2500, w:200, h:200, t:'grass', theme:'tikal', returnMap:3},
    16: {name:'底比斯沙漠 (Lv.100-110)', c1:'#da8', c2:'#b86', desc:'異界的黃金文明', mobs:['anubis','giant_ant_soldier','dragon_fly_void'], boss:'osiris', x:4000, y:-2500, w:200, h:200, t:'sand', theme:'thebes', returnMap:3},
    17: {name:'異界裂縫 (Lv.110-120)', c1:'#102', c2:'#000', desc:'吉爾塔斯的虛空領域', mobs:['void_spirit','dragon_fly_void','baphomet'], boss:'girtao', x:0, y:-5000, w:200, h:200, t:'void', theme:'void', returnMap:7},
};