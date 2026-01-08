/**
 * Lineage M v77.125 Game Engine (Leveling Curve Fix)
 * ---------------------------------------------------
 * [更新記錄 - v77.125_Leveling_Fix]
 * 1. [平衡] 修正 Lv.30~45 升級速度過快 (秒升) 的問題。
 * - 原本: Lv.1~45 係數皆為 1.1 (過低)。
 * - 修正: Lv.30 起係數調整為 1.3，增加升級難度以匹配該區間的高經驗值怪物。
 * ---------------------------------------------------
 * [更新記錄 - v77.125_Elf_Buff_Logic]
 * 1. [緊急修復] 重建完整遊戲引擎，解決 loginAndStart 未定義的錯誤。
 * 2. [技能實裝] 風之神射 (e5): 修正為增加 20% 遠攻爆擊率。
 * 3. [技能實裝] 暴風神射 (e6): 修正為增加 +50 遠攻傷害。
 * 4. [技能實裝] 精靈餅乾: 攻速修正為真正的 x1.5 倍 (Delay / 1.5)。
 * 5. [AI修正] 修正 e5/e6 自動施法的 MP 檢查門檻 (100/200)。
 * ---------------------------------------------------
 */

// --- 全域變數與設定 ---
var GM_EXP_MULT = 1.0; 
var GM_GOLD_MULT = 1.0; 
var GM_SPAWN_MULT = 1; 
var GM_DROP_MULT_USE = 1.0; 
var GM_DROP_MULT_EQUIP = 1.0; 
var GM_DROP_MULT_RARE = 1.0;  
var BASE_EXP_SCALE = 300.0; 

// --- Canvas 與 Context ---
var cvs = document.getElementById('cvs'); 
var ctx = cvs.getContext('2d'); 
var mCtx = document.getElementById('mm-cvs').getContext('2d'); 
var mapCanvas = document.getElementById('map-canvas'); 
var mapCtx = mapCanvas ? mapCanvas.getContext('2d') : null; 
var W, H; 
var hoverTarget = null; 
var mouseX = 0, mouseY = 0; 

// --- 初始化視窗大小 ---
if (typeof resize === 'function') resize();

// --- 遊戲狀態與玩家資料 ---
var gameState = 'MENU'; 
var currentMapId = 0; 
var accountId = "guest";
var player = { 
    x:0, y:0, hp:100, maxHp:100, mp:50, maxMp:50, str:10, dex:10, con:10, int:10, 
    class:'knight', exp:0, nextExp:1000, lvl:1, points:0, skillPoints:0, gold:1000, 
    inventory: [], equip: {}, buffs:{}, tx:0, ty:0, target:null, atkTimer:0, 
    skills:[], skillLevels:{}, skillCD: {}, 
    autoPotLimit:80, autoMpLimit:20, autoPotType:'white', lastPotionTime:0, lastRegenTime:0, 
    autoBuffs:{haste:false, brave:false, blue:false, wind:false, fire:false, storm:false, solid_carriage:false, counter_barrier:false, immune_to_harm:false, soul_elevation:false}, 
    autoHealSkill:'none', autoHealVal:60, autoHealMpLimit: 20, 
    lastHealSpellTime: 0, 
    autoFireMp: 30, autoWindMp: 30, autoStormMp: 40, 
    autoImmuneMpLimit: 60, autoSoulMpLimit: 80,
    manualTarget: false, autoCombat: true, autoCombatDelay: 0, autoSellKeys: [], 
    autoB2M: false, autoB2M_HP: 80, autoB2M_MP: 50, bossTimers: {}, lastPortalTime: 0, 
    baseMaxHp: 100, baseMaxMp: 50, pets: [], showRange: false, direction: 1,
    forceMoveTimer: 0 
};

// --- 實體與物件池 ---
var entities=[], portals=[], particles=[], projectiles=[], visualEffects=[], groundEffects=[], texts=[], hotkeys=[null,null,null,null,null,null,null,null,null,null]; 
var pendingAssign=null; 
var shopTab='buy'; 
var groundCanvas=null; 
var enchantMode=false, enchantScroll=null; 
var joyActive=false; 
var screenShake=0; 
var envProps = []; 

// --- 寬螢幕射程計算核心 ---
function getEffectiveDistance(p, target, isBow) {
    if (!p || !target) return 9999;
    var dx = Math.abs(p.x - target.x);
    var dy = Math.abs(p.y - target.y);
    
    if (isBow) {
        return Math.sqrt(Math.pow(dx * 0.6, 2) + Math.pow(dy, 2));
    } else {
        return Math.hypot(dx, dy);
    }
}

// --- [Updated v77.125] 屬性計算 (含爆擊) ---
function getPlayerStats() { 
    var s = {
        str:player.str, dex:player.dex, int:player.int, con:player.con, 
        mr: Math.floor(player.lvl / 2),
        ac: 0, // 總防禦 (含套裝)
        dmg: 0,
        dmgReduc: Math.floor(player.lvl / 2), // 等級減傷
        hpMax: 0, mpMax: 0,
        hpRegen: 0, mpRegen: 0,
        crit: 0,
        activeSets: []
    }; 

    // 1. 遍歷裝備
    var setCounts = {};
    for(var k in player.equip) { 
        var it = player.equip[k]; 
        if(ITEMS[it.key]) { 
            var d = ITEMS[it.key]; 
            if(d.str) s.str += d.str; 
            if(d.dex) s.dex += d.dex; 
            if(d.int) s.int += d.int; 
            if(d.con) s.con += d.con; 
            
            if(d.def) s.ac += (d.def + (it.en || 0)); 
            
            if(d.atk) s.dmg += d.atk; 
            if(d.desc && d.desc.includes('MR+')) {
                var mrMatch = d.desc.match(/MR\+(\d+)/);
                if (mrMatch) s.mr += parseInt(mrMatch[1]);
            }
            
            // 統計套裝
            if (d.set) {
                if (!setCounts[d.set]) setCounts[d.set] = 0;
                setCounts[d.set]++;
            }
        } 
    } 

    // 2. 套裝加成
    if (typeof SETS !== 'undefined') {
        for (var setKey in setCounts) {
            if (setCounts[setKey] >= 4) { // 需滿 4 件
                var bonus = SETS[setKey];
                if (bonus) {
                    if (bonus.ac) s.ac += bonus.ac; 
                    if (bonus.dmgReduc) s.dmgReduc += bonus.dmgReduc;
                    if (bonus.str) s.str += bonus.str;
                    if (bonus.dex) s.dex += bonus.dex;
                    if (bonus.con) s.con += bonus.con;
                    if (bonus.int) s.int += bonus.int;
                    if (bonus.hp) s.hpMax += bonus.hp;
                    if (bonus.mp) s.mpMax += bonus.mp;
                    if (bonus.hpRegen) s.hpRegen += bonus.hpRegen;
                    if (bonus.mpRegen) s.mpRegen += bonus.mpRegen;
                    if (bonus.dmg) s.dmg += bonus.dmg;
                    if (bonus.crit) s.crit += bonus.crit;
                    s.activeSets.push(bonus.name);
                }
            }
        }
    }

    // 3. [Phase 2] 風之神射 爆擊加成
    if (player.buffs.wind_shot) s.crit += 20;

    return s; 
}

// --- 遊戲啟動流程 ---
function loginAndStart(cls) { 
    if (typeof ITEMS === 'undefined') { alert("資料庫載入失敗: ITEMS 未定義"); return; } 
    if (typeof Assets === 'undefined') { alert("資源庫載入失敗: Assets 未定義"); return; }
    
    try { 
        if(typeof AudioSys !== 'undefined') AudioSys.playDefault(); 
        
        initAssets(); 
        
        var idInput = document.getElementById('login-id').value.trim(); 
        var pwInput = document.getElementById('login-pw').value.trim(); 
        if (idInput === '0521' && pwInput === '0521') { 
            document.getElementById('login-box-main').style.display='none'; 
            document.getElementById('gm-console').style.display='flex'; 
            return; 
        } 
        accountId = idInput || "guest"; 
        var loaded = loadGame(); 
        if(!loaded) { 
            player.class = cls; 
            if(cls==='knight') { player.str=16; player.con=16; player.dex=12; player.int=8; } 
            if(cls==='elf') { player.str=11; player.con=12; player.dex=16; player.int=12; } 
            if(cls==='mage') { player.str=8; player.con=12; player.dex=10; player.int=16; } 
            player.baseMaxHp = player.con*15; player.maxHp = player.baseMaxHp; player.hp = player.maxHp; 
            player.baseMaxMp = player.int*8; player.maxMp = player.baseMaxMp; player.mp = player.maxMp; 
            player.inventory=[]; player.equip={}; player.gold = 1000; player.pets = []; 
            addItem('potion',20); addItem('scroll_return',5); addItem('scroll_teleport',5); addItem('zel', 5); addItem('dai', 5); 
            if(cls==='knight') addItem('sword_long',1); 
            if(cls==='elf') addItem('bow',1); 
            if(cls==='mage') addItem('staff',1); 
            player.x = 0; player.y = 0; currentMapId = 0; 
            hotkeys = [null,null,null,null,null,null,null,null,null,null]; 
        } 

        if (isNaN(player.x) || isNaN(player.y)) {
            console.warn("偵測到損壞座標，重置為 0,0");
            player.x = 0; player.y = 0; player.tx = 0; player.ty = 0;
        }

        document.getElementById('start-screen').style.display='none'; 
        document.getElementById('game-ui').style.display='block'; 
        document.getElementById('elf-settings').style.display = (player.class === 'elf' ? 'block' : 'none'); 
        document.getElementById('knight-settings').style.display = (player.class === 'knight' ? 'block' : 'none'); 
        if(document.getElementById('mage-settings')) {
            document.getElementById('mage-settings').style.display = (player.class === 'mage' ? 'block' : 'none');
        }

        if(typeof updateAutoBtn === 'function') updateAutoBtn(); 
        if(typeof updateUI === 'function') updateUI(); 
        if(typeof syncUISettings === 'function') syncUISettings();

        gameState='PLAY'; 
        if (typeof resize === 'function') resize();
        initMap(currentMapId || 0); 
        
        loop(); 
        
    } catch(e) { 
        console.error(e); 
        alert("啟動失敗: " + e.message); 
    } 
}

// --- 存檔與讀檔 ---
function toggleAutoCombat() { 
    player.autoCombat = !player.autoCombat; 
    if (!player.autoCombat && !player.manualTarget) player.target = null; 
    if(typeof updateAutoBtn === 'function') updateAutoBtn(); 
    if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); 
}

function saveGame() { 
    if(gameState!=='PLAY') return; 
    try { 
        var cleanPlayer = Object.assign({}, player); 
        cleanPlayer.target = null; 
        cleanPlayer.pets = []; 
        cleanPlayer.savedHotkeys = hotkeys;
        localStorage.setItem('linm_v77_'+accountId, JSON.stringify(cleanPlayer)); 
    } catch(e) {} 
}

function loadGame() { 
    var data = localStorage.getItem('linm_v77_'+accountId); 
    if(data) { 
        try { 
            var loadedData = JSON.parse(data);
            Object.assign(player, loadedData); 
            
            if(!player.skillCD) player.skillCD = {}; 
            if(!player.baseMaxHp) player.baseMaxHp = player.maxHp; 
            if(!player.baseMaxMp) player.baseMaxMp = player.maxMp; 
            player.pets = []; 
            if(!player.direction) player.direction = 1; 
            if(!player.forceMoveTimer) player.forceMoveTimer = 0; 

            if (loadedData.savedHotkeys) {
                hotkeys = loadedData.savedHotkeys;
            } else {
                hotkeys = [null,null,null,null,null,null,null,null,null,null];
            }
            
            if (isNaN(player.x)) player.x = 0;
            if (isNaN(player.y)) player.y = 0;

            return true; 
        } catch(e) { return false; } 
    } 
    return false; 
}

function saveAndLogout() { saveGame(); location.reload(); }

function deleteAccountData() { 
    var id = document.getElementById('login-id').value.trim();
    if(!id && accountId) id = accountId; 
    
    if (confirm("警告：確定要刪除 " + (id || "guest") + " 的所有存檔嗎？")) {
        localStorage.removeItem('linm_v77_'+(id || "guest"));
        localStorage.removeItem('lineage_save'); 
        alert("資料已刪除，頁面將重新整理。");
        location.reload();
    }
}

// --- 物品系統 ---
function addItem(key, count=1) { 
    if(!ITEMS[key]) return; 
    if (player.autoSellKeys && player.autoSellKeys.includes(key)) { 
        var price = ITEMS[key].price || 1; 
        player.gold += price * count; 
        if(typeof logMsg === 'function') logMsg("自動賣出: " + ITEMS[key].name + " (+" + (price*count) + "G)", "#ff0"); 
        return; 
    } 
    var item = ITEMS[key]; 
    if(item.stackable) { 
        var exist = player.inventory.find(i => i.key === key); 
        if(exist) exist.count += count; else player.inventory.push({key:key, count:count}); 
    } else { 
        for(let i=0; i<count; i++) player.inventory.push({key:key, count:1, uid:Math.random(), en:0}); 
    } 
    saveGame(); 
}

// --- 地圖與環境生成 ---
function initMap(id) { 
    currentMapId = id; 
    var mapInfo = MAPS[id]; 
    document.getElementById('ui-map-name').innerText = mapInfo.name; 
    
    groundCanvas = document.createElement('canvas'); 
    groundCanvas.width=512; groundCanvas.height=512; 
    var g = groundCanvas.getContext('2d'); 
    var tileKey = 'tile_' + (mapInfo.t || 'grass'); 
    
    if(Assets[tileKey]) { 
        var pat = g.createPattern(Assets[tileKey], 'repeat'); 
        g.fillStyle = pat; g.fillRect(0,0,512,512); 
    } else { 
        g.fillStyle = mapInfo.c1; g.fillRect(0,0,512,512); 
    } 
    
    entities = []; portals = []; envProps = []; groundEffects = []; player.target=null; 
    player.pets.forEach(p => { p.x = player.x; p.y = player.y; }); 
    
    if (id !== 0) { portals.push({x: mapInfo.x + 200, y: mapInfo.y + 200, r: 50, dest: 0}); } 
    else { portals.push({x: 200, y: 200, r: 50, dest: 1}); } 
    
    generateEnvironment(mapInfo.theme, g); 
    
    if (id == 0) { for(let i=0; i<5; i++) entities.push({name:'新手導師', hp:1000, maxHp:1000, s:24, c:'#aaa', x:600+(Math.random()-0.5)*200, y:900+(Math.random()-0.5)*200, isFakePlayer:true, chatTimer:0, chatText:''}); } 
    
    var baseMobCount = (id === 0) ? 900 : ((mapInfo.w && mapInfo.w > 100) ? 350 : 200); 
    var mobCount = baseMobCount * GM_SPAWN_MULT; 
    for(let i=0; i<mobCount; i++) spawnMob(true); 
    
    if(mapInfo.boss) checkAndSpawnBoss(mapInfo.boss); 
    if(mapInfo.boss2) checkAndSpawnBoss(mapInfo.boss2); 
}

function generateEnvironment(theme, gCtx) { 
    var range = (MAPS[currentMapId].w > 100) ? 4000 : 2000; 
    var trees = ['prop_tree_green', 'prop_tree_yellow', 'prop_tree_red']; 
    if (theme === 'snow') trees = ['prop_tree_green']; 
    
    for(let i=0; i<15; i++) { 
        var key = trees[Math.floor(Math.random()*trees.length)]; 
        spawnCluster(20, key, range); 
        spawnCluster(15, 'prop_rock', range); 
    } 
}

function spawnCluster(count, key, range) { 
    for(let c=0; c<Math.ceil(count/5); c++) { 
        var cx = (Math.random()-0.5)*2*range; 
        var cy = (Math.random()-0.5)*2*range; 
        if (Math.hypot(cx,cy) < 300) continue; 
        for(let i=0; i<Math.random()*5+3; i++) {
            envProps.push({
                x: cx+(Math.random()-0.5)*300, 
                y: cy+(Math.random()-0.5)*300, 
                key: key, 
                scale: 0.8+Math.random()*0.5, 
                type: 'prop'
            }); 
        }
    } 
}

function checkAndSpawnBoss(bossKey) { 
    var exist = entities.find(e => e.type === bossKey && e.isBoss); 
    if (exist) return; 
    var nextSpawn = player.bossTimers[bossKey]; 
    if (!nextSpawn || Date.now() >= nextSpawn) spawnBoss(bossKey); 
}

function getMapExpBonus(mapId) {
    var id = parseInt(mapId); 
    if (id === 8) return 2.1; 
    if (id === 9) return 2.2; 
    if (id === 10) return 2.3; 
    if (id === 11) return 2.4; 
    if (id === 12) return 2.5; 
    if (id === 13) return 2.6; 
    if (id === 14) return 2.7; 
    if (id === 15) return 2.8; 
    if (id === 16) return 2.9; 
    if (id === 17) return 3.0; 
    return 1.0; 
}

function getLevelExpBonus(lvl) { return 1.0; }

function spawnMob(isInitial = false) { 
    if (entities.length >= 3000) return; 
    if (currentMapId == 0 && Math.random() > 0.6) return; 
    var mapInfo = MAPS[currentMapId]; 
    if (!mapInfo.mobs || mapInfo.mobs.length === 0) return; 
    var mobKey = mapInfo.mobs[Math.floor(Math.random() * mapInfo.mobs.length)]; 
    var t = MOB_TYPES[mobKey]; 
    if (!t) return; 
    var range = (mapInfo.w > 100) ? 6000 : 4000; 
    var mx = (Math.random()-0.5)*2*range; 
    var my = (Math.random()-0.5)*2*range; 
    if (t.aggro && Math.hypot(mx,my)<600) mx+=1000; 
    
    var multiplier = 1.0; 
    var finalHp = Math.floor(t.hp * multiplier);
    var expBonus = getMapExpBonus(currentMapId);
    var finalExp = t.exp * expBonus;
    
    entities.push({ name:t.name, hp:finalHp, maxHp:finalHp, exp:finalExp, s:t.s, c:t.c, isBoss:false, type:mobKey, drops:t.drops, x:mx, y:my, atkTimer:0, aggro: false, magic: t.magic, stunTimer: 0, direction: 1 }); 
}

function spawnBoss(key) { 
    var t = MOB_TYPES[key]; 
    if(!t) return; 
    var d = (currentMapId >= 14 || currentMapId === 1) ? 3500 : 2000; 
    var a = Math.random()*6.28; 
    var multiplier = 1.0;
    var finalHp = Math.floor(t.hp * multiplier);
    var expBonus = getMapExpBonus(currentMapId);
    var finalExp = t.exp * expBonus;

    entities.push({ name: t.name, hp: finalHp, maxHp: finalHp, exp: finalExp, s: t.s, c: t.c, isBoss: true, type: key, drops: t.drops, x: Math.cos(a)*d, y: Math.sin(a)*d, atkTimer: 0, aggro: t.aggro, magic: t.magic, scale: t.scale || 2.0, stunTimer: 0, direction: 1 }); 
    if(typeof logMsg === 'function') logMsg("BOSS 出現了: " + t.name, "#f0f"); 
}

function summonPet(count) { 
    var t = MOB_TYPES['summon_creature']; 
    for(let i=0; i<count; i++) { 
        player.pets.push({ name: '召喚獸', hp: t.hp, maxHp: t.hp, atk: t.atk, def: t.def, s: t.s, c: t.c, x: player.x + (Math.random()-0.5)*100, y: player.y + (Math.random()-0.5)*100, isPet: true, target: null, atkTimer: 0, type: 'summon_creature', direction: 1 }); 
        addPart(player.x, player.y, '#aaf', 20); 
    } 
    if(typeof logMsg === 'function') logMsg(`召喚了 ${count} 隻召喚獸`, '#0ff'); 
}

function addVisualEffect(x, y, key, duration=1000, scale=1.0) {
    visualEffects.push({
        x: x, y: y, key: key, 
        startTime: Date.now(), 
        duration: duration, 
        scale: scale
    });
}

// --- 遊戲迴圈更新 (Updated) ---
function update() {
    if (isNaN(player.x) || isNaN(player.y)) { player.x = 0; player.y = 0; }

    var now = Date.now();
    for(var k in player.buffs) { if(player.buffs[k] < now) { if (k === 'soul_elevation') { player.maxHp = player.baseMaxHp; player.maxMp = player.baseMaxMp; if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp; if(typeof logMsg === 'function') logMsg("靈魂昇華效果結束", "#aaa"); } delete player.buffs[k]; } }
    
    visualEffects = visualEffects.filter(e => now - e.startTime < e.duration);

    for(let i=groundEffects.length-1; i>=0; i--) {
        let ge = groundEffects[i];
        if (now - ge.startTime > ge.duration) { groundEffects.splice(i, 1); continue; }
        if (now - ge.lastTick > ge.tickInterval) {
            ge.lastTick = now;
            if (ge.type === 'fire_storm') {
                entities.forEach(e => {
                    if (!e.isFakePlayer && Math.hypot(e.x - ge.x, e.y - ge.y) < ge.range) {
                        hit(e, ge.dmg, 'proc', player); // source: player, effect: proc (prevent loop)
                        addPart(e.x, e.y, '#f80', 5);
                    }
                });
            }
        }
    }

    var atkDelay = 600; if (player.class === 'mage') atkDelay = 800;
    if (player.lvl >= 52) atkDelay = 400; if (player.lvl >= 60) atkDelay = 350; if (player.lvl >= 70) atkDelay = 300; 
    
    // 加速藥水與精靈餅乾
    if (player.buffs.haste) atkDelay = Math.floor(atkDelay * 0.75); 
    if (player.buffs.brave) atkDelay = Math.floor(atkDelay * 0.66); 
    // [Phase 2] 精靈餅乾修正為 / 1.5
    if (player.buffs.wafer) atkDelay = Math.floor(atkDelay / 1.5); 
    
    if (atkDelay < 150) atkDelay = 150;

    if (player.autoBuffs.haste && !player.buffs.haste) useItemByKey('potion_green');
    if (player.autoBuffs.blue && !player.buffs.blue_potion) useItemByKey('mana');
    if (player.autoBuffs.brave) { if(player.class==='knight' && !player.buffs.brave) useItemByKey('potion_brave'); if(player.class==='elf' && !player.buffs.wafer) useItemByKey('cookie_elf'); if(player.class==='mage' && !player.buffs.wisdom) useItemByKey('potion_wisdom'); }
    
    if (player.class === 'knight') { if (player.autoBuffs.solid_carriage && !player.buffs.solid_carriage && player.skills.includes('k2')) { if(player.mp >= 15) { player.mp -= 15; player.buffs.solid_carriage = now + 60000; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_def'); addPart(player.x, player.y, '#888', 10); } } if (player.autoBuffs.counter_barrier && !player.buffs.counter_barrier && player.skills.includes('k3')) { if(player.mp >= 20) { player.mp -= 20; player.buffs.counter_barrier = now + 120000; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_atk'); addPart(player.x, player.y, '#fff', 15); } } }
    
    // [Phase 2] 妖精自動施法 MP 修正
    if(player.class === 'elf') { 
        var hasMp = (cost) => player.mp >= cost; 
        if(now % 1000 < 50) { 
            if(player.autoBuffs.fire && !player.buffs.fire_weapon && hasMp(30) && player.skills.includes('e3')) { player.mp -= 30; player.buffs.fire_weapon = now + 960000; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_fire'); addPart(player.x, player.y, '#f80', 10); } 
            // e5 (MP: 100)
            if(player.autoBuffs.wind && !player.buffs.wind_shot && hasMp(100) && player.skills.includes('e5')) { player.mp -= 100; player.buffs.wind_shot = now + 600000; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_wind'); addPart(player.x, player.y, '#afa', 10); } 
            // e6 (MP: 200)
            if(player.autoBuffs.storm && !player.buffs.storm_shot && hasMp(200) && player.skills.includes('e6')) { player.mp -= 200; player.buffs.storm_shot = now + 600000; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_wind'); addPart(player.x, player.y, '#0f0', 10); } 
        } 
        if(player.autoB2M && player.skills.includes('e2') && player.hp > player.maxHp * (player.autoB2M_HP / 100) && player.mp < player.maxMp * (player.autoB2M_MP / 100)) { if (now % 1000 < 50) { player.hp -= 50; player.mp = Math.min(player.maxMp, player.mp + 20); if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_soul'); if(typeof logMsg === 'function') logMsg("魂體轉換", "#aaf"); if(typeof updateUI === 'function') updateUI(); } } 
    }
    
    if (player.class === 'mage') {
        if(now % 1000 < 50) { 
            if (player.autoBuffs.immune_to_harm && !player.buffs.immune_to_harm && player.skills.includes('m6')) {
                var skill = SKILLS['m6'];
                if (skill && player.mp >= skill.mp && player.mp >= player.maxMp * (player.autoImmuneMpLimit/100)) {
                    player.mp -= skill.mp;
                    player.buffs['immune_to_harm'] = now + skill.duration;
                    if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_def');
                    addPart(player.x, player.y, '#fff', 20);
                    if(typeof logMsg === 'function') logMsg("自動施放: 聖結界", "#fff");
                }
            }
            if (player.autoBuffs.soul_elevation && !player.buffs.soul_elevation && player.skills.includes('m10')) {
                var skill = SKILLS['m10'];
                if (skill && player.mp >= skill.mp && player.mp >= player.maxMp * (player.autoSoulMpLimit/100)) {
                    player.mp -= skill.mp;
                    player.buffs['soul_elevation'] = now + skill.duration;
                    player.maxHp = Math.floor(player.baseMaxHp * 1.3); 
                    player.maxMp = Math.floor(player.baseMaxMp * 1.3); 
                    player.hp = Math.min(player.hp + (player.maxHp - player.baseMaxHp), player.maxHp);
                    if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic');
                    addPart(player.x, player.y, '#fff', 30);
                    if(typeof logMsg === 'function') logMsg("自動施放: 靈魂昇華", "#fff");
                }
            }
        }
    }

    if (now - player.lastRegenTime > 3000) { 
        player.lastRegenTime = now; 
        if (player.hp > 0) { 
            var stats = getPlayerStats(); 
            var hpRegen = Math.floor(player.lvl / 2) + Math.floor(stats.con/2) + (stats.hpRegen || 0); 
            
            // [New] 炎變武器 HP 回復加成
            var w = player.equip.weapon;
            if (w && w.key === 'sword_flame_1') { hpRegen += 20; } // 炎變烈焰劍: HP回復UP

            player.hp = Math.min(player.maxHp, player.hp + hpRegen); 
            
            var mpRegen = Math.floor(player.lvl / 3) + Math.floor(stats.int/2) + (stats.mpRegen || 0); 
            if (player.buffs.blue_potion) mpRegen += 5; 
            if (player.equip.armor && player.equip.armor.key === 'armor_robe') mpRegen += 5; 
            if (player.equip.weapon && player.equip.weapon.key === 'staff_crystal') mpRegen += 5; 

            // [New] 炎變武器 MP 回復加成
            if (w && w.key === 'staff_flame_2') { mpRegen += 20; } // 炎變轉生魔杖: 雙倍回魔

            player.mp = Math.min(player.maxMp, player.mp + mpRegen); 
        } 
        if (MAPS[currentMapId].boss) checkAndSpawnBoss(MAPS[currentMapId].boss); 
        if (MAPS[currentMapId].boss2) checkAndSpawnBoss(MAPS[currentMapId].boss2);
    }
    
    var baseMaxMobs = (currentMapId === 0) ? 900 : ((MAPS[currentMapId].w > 100) ? 350 : 200); 
    var maxMobs = baseMaxMobs * GM_SPAWN_MULT; if (maxMobs > 3000) maxMobs = 3000;
    if(entities.length < maxMobs && Math.random()>0.9) spawnMob();
    
    var speed = player.buffs.haste ? 9 : 6; if (player.lvl >= 52) speed += 1; if (player.lvl >= 60) speed += 1; if (player.lvl >= 70) speed += 1;
    var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; var attackRange = isBow ? 400 : 50; 
    
    var dx = player.tx - player.x; 
    var dy = player.ty - player.y; 
    var dist = Math.sqrt(dx*dx + dy*dy); 
    
    if(dist > 0) { 
        if (dist < speed) {
            player.x = player.tx;
            player.y = player.ty;
        } else {
            player.x += (dx/dist)*speed; 
            player.y += (dy/dist)*speed; 
        }
        if (Math.abs(dx) > 2) {
            if (dx > 0) player.direction = 1; 
            if (dx < 0) player.direction = -1; 
        }
    }
    
    portals.forEach(p => { if(Math.hypot(player.x-p.x, player.y-p.y) < p.r) { if (Date.now() - player.lastPortalTime > 3000) { if (document.getElementById('teleport-menu').style.display !== 'block') { if(typeof openTeleportMenu === 'function') openTeleportMenu(); } } } });

    player.pets = player.pets.filter(p => p.hp > 0); player.pets.forEach(p => { var target = player.target || p.target; var destX = player.x, destY = player.y; if (target && target.hp > 0) { destX = target.x; destY = target.y; var distToT = Math.hypot(destX - p.x, destY - p.y); if (distToT < 40) { if (Date.now() - p.atkTimer > 1000) { p.atkTimer = Date.now(); hit(target, p.atk, null, p); addPart(target.x, target.y, '#aaf', 5); } } else { var ang = Math.atan2(destY - p.y, destX - p.x); var mx = Math.cos(ang) * 8; p.x += mx; p.y += Math.sin(ang) * 8; if (mx > 0) p.direction = 1; if (mx < 0) p.direction = -1; } } else { var distToP = Math.hypot(player.x - p.x, player.y - p.y); if (distToP > 80) { var ang = Math.atan2(player.y - p.y, player.x - p.x); var mx = Math.cos(ang) * 9; p.x += mx; p.y += Math.sin(ang) * 9; if (mx > 0) p.direction = 1; if (mx < 0) p.direction = -1; } } });

    entities.forEach(m => { 
        if(m.isFakePlayer) return; 
        if(m.stunTimer && Date.now() < m.stunTimer) return; 
        
        var dToPlayer = getEffectiveDistance(player, m, false); 
        if (!m.aggro && currentMapId !== 1) { var t = MOB_TYPES[m.type]; if (t && t.aggro && dToPlayer < 300) m.aggro = true; } 
        if (dToPlayer > 3000) m.aggro = false; 
        
        if (m.aggro) { 
            var target = player; 
            if (player.pets.length > 0) { var nearestPet = player.pets.reduce((prev, curr) => Math.hypot(curr.x-m.x, curr.y-m.y) < Math.hypot(prev.x-m.x, prev.y-m.y) ? curr : prev, player.pets[0]); if (Math.hypot(nearestPet.x-m.x, nearestPet.y-m.y) < dToPlayer) target = nearestPet; } 
            var dToTarget = Math.hypot(target.x - m.x, target.y - m.y); 
            if (dToTarget > 60) { 
                var ang = Math.atan2(target.y - m.y, target.x - m.x); 
                var mx = Math.cos(ang) * 3; 
                var my = Math.sin(ang) * 3;
                entities.forEach(other => {
                    if (m !== other && Math.abs(m.x - other.x) < 40 && Math.abs(m.y - other.y) < 40) {
                        var dist = Math.hypot(m.x - other.x, m.y - other.y);
                        if (dist < 30 && dist > 0) {
                            var pushX = (m.x - other.x) / dist;
                            var pushY = (m.y - other.y) / dist;
                            mx += pushX * 1; 
                            my += pushY * 1;
                        }
                    }
                });
                m.x += mx; m.y += my; 
                if (mx > 0) m.direction = 1; if (mx < 0) m.direction = -1; 
            } else if (Date.now() - m.atkTimer > 1500) { 
                m.atkTimer = Date.now(); var mobData = MOB_TYPES[m.type] || {atk:10}; var rawDmg = (mobData.atk || 10) + Math.random()*5; 

                if (target === player) { 
                    if (player.buffs.counter_barrier) { 
                        var k3Lv = player.skillLevels['k3'] || 1; 
                        var chance = 0.10 + (k3Lv * 0.02); 
                        if (Math.random() < chance) { 
                            var wAtk = player.equip.weapon ? (ITEMS[player.equip.weapon.key].atk + (player.equip.weapon.en||0)) : 0;
                            var playerStr = getPlayerStats().str;
                            var reflectDmg = Math.floor((playerStr * 2) + (wAtk * 2) + (rawDmg * 0.2));
                            hit(m, reflectDmg, 'counter'); 
                            if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_atk'); 
                            addPart(player.x, player.y, '#fff', 20); 
                            if(typeof addFloat === 'function') addFloat(player.x, player.y-40, "反擊!", "#fff"); 
                            return; 
                        } 
                    } 
                    try { 
                        var stats = getPlayerStats(); 
                        
                        var playerDef = Math.floor(stats.dex/3) + stats.ac + stats.dmgReduc; 
                        
                        if (player.buffs.solid_carriage) { var k2Lv = player.skillLevels['k2'] || 1; playerDef += 15 + (k2Lv * 5); } 
                        
                        var dmg = Math.max(1, Math.floor(rawDmg - playerDef)); 
                        
                        if (player.buffs.immune_to_harm) { dmg = Math.floor(dmg * 0.5); }
                        
                        if (mobData.magic) {
                            var mr = stats.mr || 0;
                            var mrReduction = Math.min(1.0, mr / 100); 
                            dmg = Math.floor(dmg * (1 - mrReduction));
                        }

                        if (dmg < 1) dmg = 1;

                        player.hp -= dmg; 
                        if(typeof AudioSys !== 'undefined') AudioSys.sfx('hit'); 
                        screenShake = 5; 
                        if(typeof addFloat === 'function') addFloat(player.x, player.y-40, "-"+dmg, "#f00"); 
                        if(player.hp<=0 && typeof showDeathModal === 'function') showDeathModal(); 
                    } catch(e) {} 
                } else { var dmg = Math.max(1, Math.floor(rawDmg - (target.def||0))); target.hp -= dmg; if(typeof addFloat === 'function') addFloat(target.x, target.y-30, "-"+dmg, "#faa"); } 
            } 
        } 
    });

    if(!player.target && !joyActive && player.autoCombat) { let nearest = null; let minD = 600; entities.forEach(e => { let d = getEffectiveDistance(player, e, false); if(d < minD && !e.isFakePlayer) { minD = d; nearest = e; } }); if(nearest) { player.target = nearest; player.manualTarget = false; } }
    
    if(player.target && player.target.hp > 0 && !joyActive) { 
        var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; 
        var d = getEffectiveDistance(player, player.target, isBow);
        var shouldChase = player.autoCombat || player.manualTarget; 
        if (player.forceMoveTimer && Date.now() < player.forceMoveTimer) { shouldChase = false; }
        if (d <= attackRange) { 
            if (player.target.x > player.x) player.direction = 1; else player.direction = -1; 
            if (shouldChase) { player.tx = player.x; player.ty = player.y; }
            if (Date.now() - player.atkTimer > atkDelay) { 
                player.atkTimer = Date.now(); 
                if(isBow) { 
                    var wKey = player.equip.weapon.key; var wData = ITEMS[wKey]; var projType = wData.projType || 'magic_arrow'; var sfxKey = wData.sound || 'bow_magic';
                    projectiles.push({ x:player.x, y:player.y-20, tx:player.target.x, ty:player.target.y-20, spd:15, target:player.target, color:'#0f0', type: projType }); 
                    if(typeof AudioSys !== 'undefined') AudioSys.sfx(sfxKey); 
                } else { 
                    hit(player.target, 0, null, player); 
                    if (player.target) { addPart(player.target.x, player.target.y, '#fff', 3); } 
                    var wKey = player.equip.weapon ? player.equip.weapon.key : null; var sfxKey = wKey ? (ITEMS[wKey].sound || 'sword') : 'sword'; if (!wKey) sfxKey = 'click'; 
                    if(typeof AudioSys !== 'undefined') AudioSys.sfx(sfxKey);
                } 
            } 
        } else if (shouldChase) { player.tx = player.target.x; player.ty = player.target.y; } 
    }
    
    // 自動治癒邏輯
    if (player.autoHealSkill !== 'none') {
        if (Date.now() - player.lastHealSpellTime > 1000) { 
            var setHpVal = parseInt(player.autoHealVal) || 60;
            var setMpVal = parseInt(player.autoHealMpLimit) || 20;
            var hpLimit = player.maxHp * (setHpVal / 100);
            var mpLimit = player.maxMp * (setMpVal / 100);
            
            if (player.hp < hpLimit && player.mp > mpLimit) {
                var skillKey = '';
                if (player.class === 'mage') {
                    if (player.autoHealSkill === 'heal_1') skillKey = 'm3';
                    if (player.autoHealSkill === 'heal_2') skillKey = 'm4';
                    if (player.autoHealSkill === 'heal_3') skillKey = 'm5';
                } else if (player.class === 'elf') {
                    if (player.autoHealSkill === 'heal_1') skillKey = 'e_heal_1';
                    if (player.autoHealSkill === 'heal_2') skillKey = 'e_heal_2';
                    if (player.autoHealSkill === 'heal_3') skillKey = 'e_heal_3';
                    if (player.autoHealSkill === 'e_heal') skillKey = 'e_heal_1'; 
                }
                
                if (skillKey) {
                    var s = SKILLS[skillKey];
                    if (s && player.skills.includes(skillKey)) {
                        if (player.mp >= s.mp) {
                            player.mp -= s.mp;
                            player.lastHealSpellTime = Date.now();
                            var baseAmt = 30; var intMulti = 2;
                            if (skillKey === 'm4' || skillKey === 'e_heal_2') { baseAmt = 70; intMulti = 3; }
                            if (skillKey === 'm5' || skillKey === 'e_heal_3') { baseAmt = 150; intMulti = 5; }
                            var healAmt = Math.floor(baseAmt + (player.int * intMulti));
                            player.hp = Math.min(player.maxHp, player.hp + healAmt);
                            if(typeof AudioSys !== 'undefined') AudioSys.sfx(skillKey.endsWith('3') ? 'heal_full' : 'heal');
                            addPart(player.x, player.y, '#fff', 10);
                        }
                    }
                }
            }
        }
    }

    if (Date.now() - player.lastPotionTime > 500 && player.hp < player.maxHp * (player.autoPotLimit/100)) { 
        var potPriority = [];
        if (player.autoPotType === 'ultimate') { potPriority = ['potion_ultimate', 'potion_white', 'potion_orange', 'potion']; } else if (player.autoPotType === 'white') { potPriority = ['potion_white', 'potion_orange', 'potion']; } else if (player.autoPotType === 'orange') { potPriority = ['potion_orange', 'potion']; } else { potPriority = ['potion']; }
        var foundIdx = -1;
        for (let i = 0; i < potPriority.length; i++) { var key = potPriority[i]; var idx = player.inventory.findIndex(item => item.key === key); if (idx !== -1) { foundIdx = idx; break; } }
        if (foundIdx !== -1) { useItemIdx(foundIdx); player.lastPotionTime = Date.now(); } 
    }
    if(typeof updateUI === 'function') updateUI(); 
    draw();
}

// --- 戰鬥系統 ---
function hit(m, extra=0, effect=null, source=null) { 
    if(!m) return; 
    try { 
        var mx = m.x; var my = m.y; 
        m.aggro = true; 
        if (effect === 'counter') { 
            m.hp -= extra; 
            if(typeof addFloat === 'function') addFloat(mx, my-70, "反擊! "+extra, "#fff", 30); 
        } else { 
            var rawDmg = 0; 
            if (source && source.isPet) { 
                rawDmg = source.atk + Math.random()*10; 
            } else { 
                var wItem = player.equip.weapon; 
                var wAtk = 0; 
                var isBow = false; 
                var isStaff = false; 
                if (wItem && ITEMS[wItem.key]) { wAtk = ITEMS[wItem.key].atk + (wItem.en||0); isBow = (ITEMS[wItem.key].icon === '🏹'); isStaff = (ITEMS[wItem.key].icon === '🥢'); } 
                var stats = getPlayerStats(); 
                if (player.class === 'knight') rawDmg = Math.floor(stats.str * 1.5) + wAtk; 
                else if (player.class === 'elf') { rawDmg = isBow ? (Math.floor(stats.dex * 1.2) + wAtk) : (Math.floor(stats.str) + wAtk); }
                else if (player.class === 'mage') rawDmg = Math.floor(stats.str * 0.5) + wAtk; 
                if (player.buffs.fire_weapon) rawDmg += 8; 
                // [Phase 2] 暴風神射傷害修正 +50
                if (player.buffs.storm_shot) rawDmg += 50; 
                
                // [Modified] 基礎魔杖回魔與炎變魔杖強化
                if (isStaff && source === player) {
                    var mpAbsorb = 3;
                    // 炎變烈焰魔杖: 雙倍吸魔 (+10)
                    if (wItem && wItem.key === 'staff_flame_1') { mpAbsorb = 10; }
                    player.mp = Math.min(player.maxMp, player.mp + mpAbsorb);
                }
                
                // 套裝/新武器傷害加成
                if (stats.dmg) rawDmg += stats.dmg;
            } 
            var mobDef = MOB_TYPES[m.type] ? (MOB_TYPES[m.type].def || 0) : 0; 
            var dmg = Math.max(1, Math.floor(rawDmg - mobDef/2 + extra + Math.floor(player.lvl/5))); 
            
            // 爆擊處理 (Updated)
            var stats = getPlayerStats(); // Get fresh stats including wind_shot bonus
            if (source === player && stats.crit > 0) {
                if (Math.random() * 100 < stats.crit) {
                    dmg = Math.floor(dmg * 1.5);
                    if(typeof addFloat === 'function') addFloat(mx, my-70, "CRIT!", "#ff0", 40); 
                }
            }
            
            // [New] 神級武器特效判定區 (God Weapon Proc)
            // 確保來源是玩家且不是特效觸發的 (防止遞迴)
            if (source === player && effect !== 'proc') {
                var wKey = player.equip.weapon ? player.equip.weapon.key : '';
                
                // 1. 炎變轉生劍: 吸血 20%
                if (wKey === 'sword_flame_2') {
                    var vamp = Math.floor(dmg * 0.2);
                    if (vamp > 0) {
                        player.hp = Math.min(player.maxHp, player.hp + vamp);
                        // Visual for vampiric? maybe subtle
                    }
                }

                // 2. 機率魔法觸發
                var rand = Math.random();
                var procChance = 0.10; // 基礎觸發率 10%
                if (wKey === 'bow_flame_1' || wKey === 'staff_flame_1') procChance = 0.15; // 烈焰系列機率稍高

                if (rand < procChance) {
                    var intDmg = player.int * 3.0;
                    var textYOffset = 100; // 上移高度 (避免與特效重疊)
                    var textSize = 24;     // 加大字體

                    if (wKey === 'sword_flame_1' || wKey === 'bow_flame_2' || wKey === 'staff_flame_1') {
                        // 觸發: 烈炎術 (Sunburst)
                        hit(m, intDmg, 'proc', player); // 遞迴呼叫但標記為 proc
                        addVisualEffect(m.x, m.y, 'effect_fire_area', 500, 1.5);
                        if(typeof AudioSys !== 'undefined') AudioSys.sfx('fireball'); // 使用火球音效替代
                        if(typeof addFloat === 'function') addFloat(m.x, m.y-textYOffset, "烈炎術!", "#f44", 30, textSize);
                    }
                    else if (wKey === 'sword_flame_2') {
                        // 觸發: 範圍火球術 (Fireball AOE)
                        // [Fix] 使用 effect_fire_storm 區分特效
                        var range = 250;
                        entities.forEach(e => {
                            if (!e.isFakePlayer && Math.hypot(e.x - m.x, e.y - m.y) < range) {
                                hit(e, intDmg * 0.8, 'proc', player);
                                addPart(e.x, e.y, '#f40', 10);
                            }
                        });
                        addVisualEffect(m.x, m.y, 'effect_fire_storm', 800, 1.5); // 使用不同特效
                        if(typeof AudioSys !== 'undefined') AudioSys.sfx('fireball');
                        if(typeof addFloat === 'function') addFloat(m.x, m.y-textYOffset, "火球術!", "#f40", 30, textSize);
                    }
                    else if (wKey === 'bow_flame_1') {
                        // 觸發: 三重矢 (Triple Arrow)
                        // 直接造成額外 2 次傷害 (模擬三連射)
                        hit(m, dmg, 'proc', player);
                        hit(m, dmg, 'proc', player);
                        if(typeof AudioSys !== 'undefined') AudioSys.sfx('bow_triple');
                        if(typeof addFloat === 'function') addFloat(m.x, m.y-textYOffset, "三重矢!", "#0ff", 30, textSize);
                    }
                    else if (wKey === 'staff_flame_2') {
                        // 觸發: 範圍衝擊之暈 (Area Shock Stun)
                        var range = 200;
                        entities.forEach(e => {
                            if (!e.isFakePlayer && Math.hypot(e.x - m.x, e.y - m.y) < range) {
                                e.stunTimer = Date.now() + 3000;
                                hit(e, 0, 'proc', player); // 僅觸發暈眩視覺與 aggro
                                if(typeof addFloat === 'function') addFloat(e.x, e.y-80, "暈眩!", "#ff0", 30, textSize);
                            }
                        });
                        if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); // Stun sound
                    }
                }
            }

            if (effect === 'stun') { var k1Lv = player.skillLevels['k1'] || 1; var duration = 3000 + (k1Lv-1)*1000; m.stunTimer = Date.now() + duration; if(typeof addFloat === 'function') addFloat(mx, my-80, `暈眩 (${duration/1000}s)!`, "#ff0", 30); } 
            m.hp -= dmg; 
            if (!source && typeof AudioSys !== 'undefined') AudioSys.sfx('hit'); 
            if(typeof addFloat === 'function') addFloat(mx, my-50, ""+dmg, "#fff", 20); 
        } 
        if(m.hp <= 0) { 
            var mobData = MOB_TYPES[m.type];
            var levelRate = getLevelExpBonus(player.lvl);
            var expGain = (m.exp * BASE_EXP_SCALE * levelRate) * GM_EXP_MULT; 
            
            var goldDrop = 0;
            if (mobData && mobData.minGold !== undefined && mobData.maxGold !== undefined) { var range = mobData.maxGold - mobData.minGold; goldDrop = Math.floor(mobData.minGold + Math.random() * (range + 1)); } else { goldDrop = Math.floor(m.exp * 20); }
            goldDrop = Math.floor(goldDrop * GM_GOLD_MULT);
            player.exp += expGain; player.gold += goldDrop; 
            if(typeof addFloat === 'function') addFloat(player.x, player.y-60, "+"+Math.floor(expGain)+" XP", "#fd0"); 
            if (goldDrop > 0) { if(typeof addFloat === 'function') addFloat(player.x, player.y-80, "+$"+goldDrop, "#ff0"); if(typeof logMsg === 'function') logMsg(`獲得金幣: ${goldDrop}`, "#ff0"); }
            if(m.drops) { 
                m.drops.forEach(d => { 
                    var rate = d.c; 
                    var itemInfo = ITEMS[d.k]; 
                    if (itemInfo) { 
                        if (itemInfo.price > 10000) rate *= GM_DROP_MULT_RARE; 
                        else if (itemInfo.type === 'equip') rate *= GM_DROP_MULT_EQUIP; 
                        else rate *= GM_DROP_MULT_USE; 
                        if (currentMapId === 0 && d.k === 'potion') { rate *= 2; }
                    } 
                    if(Math.random() < rate) { addItem(d.k, 1); if(typeof logMsg === 'function') logMsg(m.name + " 給你: " + itemInfo.name, "#0f0"); } 
                }); 
            } 
            if(player.exp >= player.nextExp) { 
                player.exp -= player.nextExp; player.lvl++; 
                
                // [Update v77.126] 升級曲線修正
                // 30~44級: 係數提升至 1.3 (對抗高經驗怪)
                // 45級+: 係數提升至 1.5
                var multiplier = 1.1; 
                if (player.lvl >= 30) multiplier = 1.3; 
                if (player.lvl >= 45) multiplier = 1.5; 
                if (player.lvl >= 52) multiplier = 2.0; 
                if (player.lvl >= 60) multiplier = 2.5; 
                if (player.lvl >= 70) multiplier = 3.0;
                player.nextExp = Math.floor(player.nextExp * multiplier); 
                
                player.points+=3; player.skillPoints+=1; 
                player.baseMaxHp += (player.con * 2); player.maxHp = player.baseMaxHp; player.hp = player.maxHp; 
                player.baseMaxMp += (player.int * 2); player.maxMp = player.baseMaxMp; player.mp = player.maxMp; 
                if (player.lvl === 52) { if(typeof logMsg === 'function') logMsg("恭喜! 達成 Lv.52 變身死亡騎士!", "#fd0"); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); } 
                else if (player.lvl === 60) { if(typeof logMsg === 'function') logMsg("恭喜! 達成 Lv.60 第三階進化!", "#0ff"); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); }
                else if (player.lvl === 70) { if(typeof logMsg === 'function') logMsg("恭喜! 達成 Lv.70 七彩變身!", "#f0f"); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); } 
                else { if(typeof logMsg === 'function') logMsg("升級! HP/MP UP", "#0ff"); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); } 
            } 
            entities = entities.filter(e=>e!==m); player.target = null; hoverTarget = null; 
            if(m.isBoss) { var t = MOB_TYPES[m.type]; player.bossTimers[m.type] = Date.now() + (t.respawnTime * 1000); if(typeof logMsg === 'function') logMsg(m.name + " 已死亡", "#f00"); saveGame(); } 
        } 
    } catch(e) { entities = entities.filter(e=>e!==m); player.target = null; } 
}

// --- 道具使用 ---
function useItemByKey(key) { var idx = player.inventory.findIndex(i => i.key === key); if(idx !== -1) useItemIdx(idx); }
function useItemIdx(idx) { 
    var item = player.inventory[idx]; 
    var i = ITEMS[item.key]; 
    if (i.class && i.class !== player.class) { var cName = i.class==='knight'?'騎士':(i.class==='elf'?'妖精':'法師'); if(typeof logMsg === 'function') logMsg("職業不符 (" + cName + "專用)", "#f00"); return; } 
    
    if (i.key === 'scroll_teleport') { 
        var mapRange = (MAPS[currentMapId].w > 100) ? 5000 : 2500;
        player.x = (Math.random() - 0.5) * mapRange; 
        player.y = (Math.random() - 0.5) * mapRange;
        player.tx = player.x; player.ty = player.y; 
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_soul'); 
        if(typeof logMsg === 'function') logMsg("瞬間移動!", "#0ff"); 
        addPart(player.x, player.y, "#aaf", 20); 
        if(typeof renderInv === 'function') renderInv(); 
        if(typeof updateUI === 'function') updateUI(); 
        return; 
    } 
    
    if (i.key === 'scroll_return') { 
        teleport(0); 
        player.x = 280; player.y = 280; 
        player.tx = 280; player.ty = 280;
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_soul'); 
        if(typeof logMsg === 'function') logMsg("傳送回村莊", "#0ff"); 
        if(typeof renderInv === 'function') renderInv(); 
        if(typeof updateUI === 'function') updateUI(); 
        return; 
    } 
    if(i.buff) { 
        player.buffs[i.buff] = Date.now() + i.duration; 
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_def'); 
        if(typeof updateUI === 'function') updateUI(); 
        if(typeof renderInv === 'function') renderInv(); 
        return; 
    } 
    if(i.type === 'scroll') { 
        enchantMode = true; 
        enchantScroll = { idx: idx, target: i.target }; 
        if(typeof renderInv === 'function') renderInv(); 
        return; 
    } 
    if(i.type === 'use') { 
        if(i.heal) player.hp = Math.min(player.hp+i.heal, player.maxHp); 
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('heal'); 
    } 
    else if(i.type === 'equip') { 
        var slot = i.slot; 
        var old = player.equip[slot]; 
        player.equip[slot] = item; 
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        if(old) player.inventory.push(old); 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); 
    } 
    if(typeof updateUI === 'function') updateUI(); 
    if(typeof renderInv === 'function') renderInv(); 
}

function performEnchant(scrollItem, targetItem, scrollIdx) { 
    if(scrollItem.count > 0) { 
        if(scrollItem.count > 1) scrollItem.count--; else { player.inventory.splice(scrollIdx, 1); enchantMode = false; } 
        targetItem.en = (targetItem.en || 0) + 1; 
        if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); 
        if(typeof logMsg === 'function') logMsg("強化成功! +" + targetItem.en, "#0ff"); 
        if(typeof renderInv === 'function') renderInv(); 
        if(typeof updateUI === 'function') updateUI(); 
        saveGame(); 
    } else { enchantMode = false; if(typeof renderInv === 'function') renderInv(); } 
} 
function doEnchantInv(idx) { performEnchant(player.inventory[enchantScroll.idx], player.inventory[idx], enchantScroll.idx); }

function getMorphKey() {
    if (player.lvl >= 70) { if (player.class === 'knight') return 'morph_dk_gold_70'; if (player.class === 'mage') return 'morph_dk_platinum_70'; if (player.class === 'elf') { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key] && ITEMS[player.equip.weapon.key].icon === '🏹'; if (isBow) return 'morph_high_elf_70'; return 'morph_dk_red_70'; } }
    if (player.lvl >= 60) { if (player.class === 'knight') return 'morph_dk_silver_60'; if (player.class === 'mage') return 'morph_dk_mystic_60'; if (player.class === 'elf') { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key] && ITEMS[player.equip.weapon.key].icon === '🏹'; if (isBow) return 'morph_ranger_60'; return 'morph_dk_orange_60'; } }
    if (player.lvl >= 52) { if (player.class === 'knight') return 'morph_dk_gold'; if (player.class === 'mage') return 'morph_dk_platinum'; if (player.class === 'elf') { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key] && ITEMS[player.equip.weapon.key].icon === '🏹'; if (isBow) return 'morph_high_elf'; return 'morph_dk_red'; } }
    return 'char_' + player.class;
}

// --- 繪圖循環 ---
function draw() {
    if(gameState!=='PLAY') return;
    
    ctx.setLineDash([]);
    ctx.strokeStyle = '#000'; 
    
    var shakeX = (Math.random()-0.5) * screenShake; var shakeY = (Math.random()-0.5) * screenShake; if(screenShake>0) screenShake*=0.9;
    ctx.save(); ctx.translate(-player.x + W/2 + shakeX, -player.y + H/2 + shakeY); 
    
    if(groundCanvas) { ctx.fillStyle = ctx.createPattern(groundCanvas, 'repeat'); ctx.fillRect(player.x-W/2, player.y-H/2, W, H); }
    
    if(player.showRange) { 
        var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; 
        if(isBow || player.class === 'elf') { 
            ctx.save(); 
            ctx.translate(player.x, player.y); 
            ctx.scale(1 / 0.6, 1); 
            ctx.beginPath(); 
            ctx.arc(0, 0, 400, 0, Math.PI*2); 
            ctx.setLineDash([10, 10]); 
            ctx.strokeStyle = "rgba(255, 255, 100, 0.3)"; 
            ctx.lineWidth = 2; 
            ctx.stroke(); 
            ctx.restore(); 
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        } 
    }

    var renderList = [...entities, ...player.pets, player, ...envProps.filter(e=>Math.abs(e.x-player.x)<W && Math.abs(e.y-player.y)<H)]; 
    renderList.sort((a,b)=>a.y-b.y);
    
    renderList.forEach(e => {
        ctx.beginPath();

        if (e.type === 'prop') { var sx=e.x; var sy=e.y; if(e.key && Assets[e.key]) { var img = Assets[e.key]; var w = img.width * (e.scale||1); var h = img.height * (e.scale||1); if (img.complete) ctx.drawImage(img, sx-w/2, sy-h+15, w, h); } return; }
        var sx=e.x; var sy=e.y; var assetKey = e.key; if (!assetKey && e.type) assetKey = 'mob_' + e.type;
        if (e === player) { assetKey = getMorphKey(); }
        var img = Assets[assetKey]; var size = e.s || 20;
        
        if (e === player && Date.now() - player.atkTimer < 300) {
            var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹';
            if (!isBow) {
                var effectKey = null;
                if (player.class === 'knight') effectKey = 'effect_slash';
                if (player.class === 'mage') effectKey = 'effect_staff_swing';
                if (!effectKey && !isBow) effectKey = 'effect_slash'; 
                if (effectKey && Assets[effectKey]) { var slashImg = Assets[effectKey]; var progress = (Date.now() - player.atkTimer) / 300; var swingAngle = (progress - 0.5) * 2; ctx.save(); var handOffsetX = (player.direction === 1) ? 25 : -25; var handOffsetY = -45; ctx.translate(sx, sy); ctx.translate(handOffsetX, handOffsetY); if (player.direction === -1) { ctx.scale(-1, 1); } ctx.rotate(swingAngle); ctx.drawImage(slashImg, -60, -60, 120, 120); ctx.restore(); }
            }
        }
        if(img && img.complete) { var scale = e.scale || 1; var w = img.width * scale; var h = img.height * scale; ctx.save(); ctx.translate(sx, sy); var dir = e.direction || 1; ctx.scale(dir, 1); ctx.drawImage(img, -w/2, -h + 20, w, h); ctx.restore(); } else { ctx.fillStyle = e.c || '#555'; ctx.fillRect(sx - size/1.5, sy - size*1.8, size*1.3, size*1.8); }
        
        if (e.stunTimer && Date.now() < e.stunTimer) { 
            ctx.save();
            var mobH = (img && img.complete) ? img.height * (e.scale||1) : 120;
            var stunY = sy - mobH - 20; 
            ctx.translate(sx, stunY); 
            var rot = (Date.now() / 5) % 360; 
            ctx.rotate(rot * Math.PI / 180);
            ctx.beginPath();
            var spikes = 5; var outerRadius = 30; var innerRadius = 15;
            var pulse = 1 + Math.sin(Date.now() / 100) * 0.2;
            outerRadius *= pulse; innerRadius *= pulse;
            for (var i = 0; i < spikes; i++) {
                var x = Math.cos((18 + i * 72) * Math.PI / 180) * outerRadius;
                var y = Math.sin((18 + i * 72) * Math.PI / 180) * outerRadius;
                ctx.lineTo(x, -y);
                x = Math.cos((54 + i * 72) * Math.PI / 180) * innerRadius;
                y = Math.sin((54 + i * 72) * Math.PI / 180) * innerRadius;
                ctx.lineTo(x, -y);
            }
            ctx.closePath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#fff'; 
            ctx.stroke();
            ctx.fillStyle = '#ffd700'; 
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fff'; 
            ctx.fill();
            ctx.restore();
        }

        if(e!==player && !e.key) { var barH = 120; if(img && img.complete) barH = img.height * (e.scale||1); var barY = sy - barH + 10; ctx.fillStyle = "#300"; ctx.fillRect(sx-20, barY, 40, 4); ctx.fillStyle = "#f00"; ctx.fillRect(sx-20, barY, 40*(e.hp/e.maxHp), 4); ctx.font="10px sans-serif"; ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.shadowColor="black"; ctx.shadowBlur=2; ctx.fillText(e.name, sx, barY-5); ctx.shadowBlur=0; }
        
        if (e === player) return; 

        if (player.target === e) { 
            ctx.setLineDash([]); 
            if (e.isPet) { ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"; } else { ctx.strokeStyle = "rgba(255, 50, 50, 0.8)"; }
            ctx.lineWidth = 2; 
            ctx.beginPath(); ctx.arc(sx, sy - 20, 40, 0, Math.PI*2); ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(sx-50, sy-20); ctx.lineTo(sx-30, sy-20); ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(sx+30, sy-20); ctx.lineTo(sx+50, sy-20); ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(sx, sy-70); ctx.lineTo(sx, sy-50); ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(sx, sy+10); ctx.lineTo(sx, sy+30); ctx.stroke(); 
        }
    });
    
    portals.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); var t = Date.now() / 500; var scale = 1 + Math.sin(t) * 0.1; var g = ctx.createRadialGradient(0,0,10,0,0,p.r); g.addColorStop(0, 'rgba(255, 50, 50, 0.8)'); g.addColorStop(1, 'rgba(255, 0, 0, 0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,p.r*scale,0,Math.PI*2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255, 100, 100, 0.9)`; ctx.beginPath(); ctx.arc(0, 0, p.r*0.8, 0, Math.PI * 2); ctx.stroke(); ctx.rotate(t); ctx.strokeStyle = `rgba(255, 200, 200, 0.7)`; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 1.5); ctx.stroke(); ctx.rotate(-t*2); ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("傳送點", 0, -p.r - 10); ctx.restore(); var dx = p.x - player.x; var dy = p.y - player.y; var dist = Math.sqrt(dx*dx + dy*dy); if(dist > 300) { var angle = Math.atan2(dy, dx); var arrowDist = Math.min(W/2, H/2) - 80; var ax = player.x + Math.cos(angle) * arrowDist; var ay = player.y + Math.sin(angle) * arrowDist; ctx.save(); ctx.translate(ax, ay); ctx.rotate(angle + Math.PI/2); var pScale = 1 + Math.sin(Date.now()/200)*0.2; ctx.scale(pScale, pScale); ctx.fillStyle = "rgba(255, 50, 50, 0.9)"; ctx.shadowColor = "#f00"; ctx.shadowBlur = 15; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, 10); ctx.lineTo(0, 5); ctx.lineTo(-15, 10); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); } });
    
    for(let i=projectiles.length-1; i>=0; i--) { 
        let p = projectiles[i]; let pdx = p.tx - p.x; let pdy = p.ty - p.y; let pd = Math.sqrt(pdx*pdx + pdy*pdy); 
        if(pd < p.spd) { 
            if(p.target) {
                // [Fix] 投射物命中時，傳入 player 作為 source，以觸發神武特效
                hit(p.target, 0, null, player); 
            }
            if (p.type === 'fireball') {
                var explosionRange = 300;
                addVisualEffect(p.x, p.y, 'effect_fire_area', 600, 1.5); 
                if(typeof AudioSys !== 'undefined') AudioSys.sfx('fireball');
                entities.forEach(e => { if (e !== p.target && Math.hypot(e.x - p.x, e.y - p.y) < explosionRange) { hit(e, player.int * 1.5, null, player); addPart(e.x, e.y, '#f40', 10); } });
            }
            projectiles.splice(i,1); 
        } else { 
            p.x += (pdx/pd)*p.spd; p.y += (pdy/pd)*p.spd; 
            var assetKey = 'proj_' + (p.type || 'arrow'); var img = Assets[assetKey];
            if (img && img.complete) { var angle = Math.atan2(pdy, pdx); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle); if (p.type === 'magic_arrow') { ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'; } if (p.type === 'fireball') { var scale = 1 + Math.sin(Date.now()/50)*0.2; ctx.scale(scale, scale); } ctx.drawImage(img, -img.width/4, -img.height/4, img.width/2, img.height/2); ctx.restore(); } else { ctx.fillStyle = p.color; ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; }
        } 
    }
    
    visualEffects.forEach(e => {
        var img = Assets[e.key];
        if (img && img.complete) { var elapsed = Date.now() - e.startTime; var progress = elapsed / e.duration; var alpha = 1.0; if (progress > 0.8) alpha = (1 - progress) * 5; ctx.save(); ctx.globalAlpha = alpha; ctx.translate(e.x, e.y); ctx.scale(e.scale, e.scale); ctx.drawImage(img, -img.width/2, -img.height/2); ctx.restore(); }
    });

    ctx.restore();
    
    // [Fix] 繪製浮動文字時，支援個別文字大小 (t.size)
    ctx.save(); ctx.translate(-player.x + W/2, -player.y + H/2); 
    texts.forEach(t => { 
        var fontSize = t.size || 16;
        ctx.font="bold " + fontSize + "px sans-serif"; 
        ctx.fillStyle=t.c; 
        ctx.fillText(t.txt, t.x, t.y); 
        t.y-=1; t.life--; 
    }); 
    texts=texts.filter(t=>t.life>0); ctx.restore();
    
    mCtx.fillStyle="#000"; mCtx.fillRect(0,0,130,130); var drawMiniDot = (tx, ty, color, isPortal=false) => { var dx = tx - player.x; var dy = ty - player.y; var dist = Math.sqrt(dx*dx + dy*dy); var mapScale = 0.06; var mx, my; if (dist * mapScale < 60) { mx = dx * mapScale + 65; my = dy * mapScale + 65; } else if (isPortal) { var angle = Math.atan2(dy, dx); mx = 65 + Math.cos(angle) * 60; my = 65 + Math.sin(angle) * 60; } else { return; } mCtx.fillStyle = color; if (isPortal) { mCtx.beginPath(); mCtx.arc(mx, my, 4, 0, Math.PI*2); mCtx.fill(); } else { mCtx.fillRect(mx, my, 2, 2); } }; entities.forEach(e=>{ drawMiniDot(e.x, e.y, "#f00"); }); player.pets.forEach(p=>{ drawMiniDot(p.x, p.y, "#0af"); }); portals.forEach(p=>{ drawMiniDot(p.x, p.y, "#0ff", true); }); mCtx.fillStyle="#fff"; mCtx.fillRect(63,63,4,4); 
    var cursorSet = false; if (gameState === 'PLAY' && hoverTarget) { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; var dist = Math.hypot(hoverTarget.x - player.x, hoverTarget.y - player.y); if (isBow && dist <= 400) { cvs.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><text y=\"20\" font-size=\"20\">🏹</text></svg>'), auto"; cursorSet = true; } else { cvs.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><text y=\"20\" font-size=\"20\">⚔️</text></svg>'), auto"; cursorSet = true; } } if (!cursorSet) cvs.style.cursor = "default";
}

function loop() { if(gameState==='PLAY'){update();} requestAnimationFrame(loop); }

// --- UI 事件處理 ---
function unequip(slot) { var item = player.equip[slot]; if(item) { delete player.equip[slot]; player.inventory.push(item); if(typeof updateUI === 'function') updateUI(); if(typeof updateStatsUI === 'function') updateStatsUI(); if(typeof renderInv === 'function') renderInv(); } }

window.addEventListener('keydown', e=>{ var k=parseInt(e.key); if(k>=0&&k<=9) useHotkey(k===0?9:k-1); });

function useHotkey(i) { 
    var v=hotkeys[i]; if(!v)return; 
    if(v.key) useItemByKey(v.key); 
    else if(typeof v === 'string') { 
        var s=SKILLS[v]; if(!s) return; 
        var now = Date.now(); 
        var cd = player.skillCD[v] || 0; 
        if (now < cd) { if(typeof logMsg === 'function') logMsg("技能冷卻中...", "#888"); return; } 
        var setCD = (ms) => player.skillCD[v] = now + ms; 
        var t = player.target || hoverTarget; 
        if (!t && ['m1','m2','m7','k1','e1','m8'].includes(v)) { 
            let nearest = null; let minD = 600; 
            entities.forEach(e => { let d = Math.hypot(e.x - player.x, e.y - player.y); if(d < minD && !e.isFakePlayer) { minD = d; nearest = e; } }); 
            if(nearest) t = nearest; 
        } 
        
        if (s.name === '烈炎術') { 
            if(t && t.hp > 0 && Math.hypot(t.x-player.x, t.y-player.y) < 600) { 
                if(player.mp >= s.mp) { 
                    player.mp -= s.mp; setCD(1000); 
                    if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); 
                    var dmg = player.int * 20.0 + 150; 
                    hit(t, dmg); 
                    addVisualEffect(t.x, t.y, 'effect_fire_area', 500, 1.5);
                    addPart(t.x, t.y, '#f00', 30); 
                    if(typeof addFloat === 'function') addFloat(t.x, t.y-20, "💥", "#f00", 30); 
                    if(typeof logMsg === 'function') logMsg("烈炎術!", "#f44"); if(typeof updateUI === 'function') updateUI(); 
                } 
                else if(typeof logMsg === 'function') logMsg("MP 不足", "#f00"); 
            } else if(typeof logMsg === 'function') logMsg("無目標", "#f00"); return; 
        } 
        if (s.name === '火風暴') { 
            if(player.mp >= s.mp) { 
                player.mp -= s.mp; setCD(2000); if(typeof AudioSys !== 'undefined') AudioSys.sfx('fire_storm'); 
                addVisualEffect(player.x, player.y, 'effect_fire_storm', 2000, 3.5);
                groundEffects.push({
                    x: player.x,
                    y: player.y,
                    type: 'fire_storm',
                    startTime: now,
                    duration: 2000,     
                    range: 500,         
                    dmg: player.int * 20.0 + 100 , 
                    tickInterval: 500,  
                    lastTick: 0
                });
                if(typeof logMsg === 'function') logMsg("火風暴! 地面持續燃燒", "#f80"); if(typeof updateUI === 'function') updateUI(); 
            } 
            else if(typeof logMsg === 'function') logMsg("MP 不足", "#f00"); return; 
        } 
        if (s.name === '靈魂昇華') { 
            if(player.mp >= s.mp) { if (player.buffs['soul_elevation']) { if(typeof logMsg === 'function') logMsg("已有效果", "#aaa"); return; } player.mp -= s.mp; player.buffs['soul_elevation'] = now + s.duration; player.maxHp = Math.floor(player.baseMaxHp * 1.3); player.maxMp = Math.floor(player.baseMaxMp * 1.3); player.hp = Math.min(player.hp + (player.maxHp - player.baseMaxHp), player.maxHp); if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); addPart(player.x, player.y, '#fff', 30); if(typeof logMsg === 'function') logMsg("靈魂昇華!", "#fff"); if(typeof updateUI === 'function') updateUI(); } 
            else if(typeof logMsg === 'function') logMsg("MP 不足", "#f00"); return; 
        } 
        if (s.name === '召喚術') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; setCD(3000); if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); var count = Math.floor(player.int / 8) + 1; if (count > 3) count = 3; summonPet(count); if(typeof updateUI === 'function') updateUI(); } 
            else if(typeof logMsg === 'function') logMsg("MP 不足", "#f00"); return; 
        } 
        if(s.name === '衝擊之暈') { 
            if(t && t.hp > 0 && Math.hypot(t.x-player.x, t.y-player.y) < 600) { if(player.mp >= s.mp) { player.mp -= s.mp; hit(t, 0, 'stun'); setCD(2000); if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); if(typeof updateUI === 'function') updateUI(); } else { if(typeof logMsg === 'function') logMsg("MP 不足!", "#00f"); } } 
            else { if(typeof logMsg === 'function') logMsg("無目標或距離太遠", "#f00"); } return; 
        } 
        if(s.name === '增幅防禦') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs['solid_carriage'] = Date.now() + s.duration; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_def'); if(typeof logMsg === 'function') logMsg("增幅防禦!", "#aaa"); if(typeof updateUI === 'function') updateUI(); addPart(player.x, player.y, '#888', 10); } return; 
        } 
        if(s.name === '反擊屏障') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs['counter_barrier'] = Date.now() + s.duration; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_atk'); if(typeof logMsg === 'function') logMsg("反擊屏障!", "#fff"); if(typeof updateUI === 'function') updateUI(); addPart(player.x, player.y, '#fff', 15); } return; 
        } 
        if(s.name === '聖結界') {
             if(player.mp >= s.mp) { 
                 player.mp -= s.mp; 
                 player.buffs['immune_to_harm'] = Date.now() + s.duration; 
                 if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic_def'); 
                 if(typeof logMsg === 'function') logMsg("聖結界! 傷害減半", "#fff"); 
                 if(typeof updateUI === 'function') updateUI(); 
                 addPart(player.x, player.y, '#fff', 20); 
             } else { if(typeof logMsg === 'function') logMsg("MP 不足!", "#00f"); }
             return;
        }

        if(s.buff) { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs[s.buff] = Date.now() + s.duration; if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); if(typeof logMsg === 'function') logMsg("施放: " + s.name, "#0f0"); addPart(player.x, player.y, '#0f0', 10); if(typeof updateUI === 'function') updateUI(); } else { if(typeof logMsg === 'function') logMsg("MP 不足!", "#00f"); } 
        } else if(s.name==='魂體轉換') { 
            if (player.hp > 50) { player.hp -= 50; player.mp = Math.min(player.maxMp, player.mp + 20); addPart(player.x, player.y, '#aaf', 5); if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); if(typeof logMsg === 'function') logMsg("魂體轉換", "#aaf"); if(typeof updateUI === 'function') updateUI(); } 
        } else if(s.name === '三重矢') { 
            if(t && t.hp > 0 && Math.hypot(t.x-player.x, t.y-player.y) < 600) { if(player.mp >= s.mp) { player.mp -= s.mp; setCD(800); for(let k=0; k<3; k++) setTimeout(()=> { projectiles.push({x:player.x, y:player.y-20, tx:t.x, ty:t.y-20, spd:20, target:t, color:'#fff', type:'arrow_triple'}); }, k*100); if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); } } 
        } else if(player.mp>=s.mp) { 
            if(s.name === '流星雨') { 
                player.mp -= s.mp; 
                if(typeof AudioSys !== 'undefined') AudioSys.sfx('meteor'); 
                screenShake = 20; 
                setCD(12000); 
                for (let i = entities.length - 1; i >= 0; i--) { if (!e.isFakePlayer && Math.hypot(e.x - player.x, e.y - player.y) < Math.max(W, H)) { hit(e, player.int * 8); } }
                for(let i=0; i<6; i++) {
                    let rx = player.x + (Math.random()-0.5)*W*0.8;
                    let ry = player.y + (Math.random()-0.5)*H*0.8;
                    setTimeout(() => { addVisualEffect(rx, ry, 'effect_meteor_rain', 800, 3.0); screenShake += 8; }, i * 200);
                }
                if(typeof logMsg === 'function') logMsg("流星雨! 毀滅降臨", "#f00"); if(typeof updateUI === 'function') updateUI();
            } else if(s.name.includes('治癒')) { 
                player.mp-=s.mp; 
                var baseAmt = 30; var intMulti = 2; 
                if(s.name.includes('中級')) { baseAmt = 70; intMulti = 3; }
                if(s.name.includes('高級')) { baseAmt = 150; intMulti = 5; }
                var healAmt = Math.floor(baseAmt + (player.int * intMulti));
                player.hp = Math.min(player.maxHp, player.hp + healAmt); 
                addPart(player.x, player.y, '#fff', 10); 
                if(typeof AudioSys !== 'undefined') AudioSys.sfx('magic'); 
                if(typeof addFloat === 'function') addFloat(player.x, player.y-40, "+"+healAmt, "#0f0", 30);
            } else if(t && t.hp>0) { 
                var d = Math.hypot(t.x-player.x, t.y-player.y); 
                if(d <= 850) { 
                    player.mp-=s.mp; if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); setCD(s.name==='光箭' ? 500 : 1000); 
                    var magicMult = player.buffs.wisdom ? 2 : 1; var dmg = player.int * 1.5 * magicMult; 
                    if (s.name === '火球術') { hit(t, dmg); for(let i=0; i<360; i+=15) { let rad = i * (Math.PI/180); let px = t.x + Math.cos(rad) * 100; let py = t.y + Math.sin(rad) * 100; addPart(px, py, '#f40', 1); } addPart(t.x, t.y, '#f40', 30); } else hit(t, dmg); 
                    var projColor = s.name === '火球術' ? '#ff4400' : '#00ffff'; var projType = s.name === '火球術' ? 'fireball' : 'magic_arrow';
                    projectiles.push({x:player.x, y:player.y-20, tx:t.x, ty:t.y-20, spd:15, target:t, color:projColor, type:projType}); 
                } 
            } 
        } 
    } 
}

function teleport(id) { 
    if(typeof closeTeleport === 'function') closeTeleport(); 
    initMap(id); 
    if(portals.length > 0) { player.x = portals[0].x + 80; player.y = portals[0].y + 80; } else { player.x=0; player.y=0; } 
    player.tx = player.x; player.ty = player.y; 
    player.lastPortalTime = Date.now() + 2000; 
} 

function learnSkill(k) { if(player.skillPoints>0){player.skillPoints--; player.skills.push(k); player.skillLevels[k]=1; if(typeof updateSkillsUI === 'function') updateSkillsUI(); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); saveGame();} } 
function upgradeSkill(k) { if(player.skillPoints>0){player.skillPoints--; player.skills.push(k); player.skillLevels[k]++; if(typeof updateSkillsUI === 'function') updateSkillsUI(); if(typeof AudioSys !== 'undefined') AudioSys.sfx('enchant'); saveGame();} }
function buy(k,n) { var p=ITEMS[k].price*n; if(player.gold>=p) { player.gold-=p; addItem(k,n); if(typeof renderShop === 'function') renderShop(); if(typeof AudioSys !== 'undefined') AudioSys.sfx('buy'); } } 
function sell(i) { var it=player.inventory[i]; player.gold+=Math.floor(ITEMS[it.key].price*0.2); if(it.count>1)it.count--;else player.inventory.splice(i,1); if(typeof renderShop === 'function') renderShop(); if(typeof AudioSys !== 'undefined') AudioSys.sfx('buy'); }
function addStat(s) { if(player.points > 0) { player.points--; player[s]++; if(typeof updateUI === 'function') updateUI(); saveGame(); if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); } }
function addPart(x,y,c,n) { for(let i=0;i<n;i++) particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,c:c,life:20}); } 

cvs.addEventListener('mousemove', e=>{ if(gameState!=='PLAY') return; var rect = cvs.getBoundingClientRect(); mouseX = e.clientX - rect.left - W/2 + player.x; mouseY = e.clientY - rect.top - H/2 + player.y; hoverTarget = null; entities.forEach(e => { if(Math.hypot(e.x - mouseX, e.y - mouseY)<60 && !e.isFakePlayer) hoverTarget=e; }); });
cvs.addEventListener('mousedown', e=>{ 
    if(gameState!=='PLAY') return; 
    var move = true; 
    if(hoverTarget) { 
        if (hoverTarget === player) return; 
        
        player.target = hoverTarget; 
        player.manualTarget = true; 
        var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; 
        var range = isBow ? 400 : 60; 
        var d = getEffectiveDistance(player, hoverTarget, isBow);
        var atkDelay = 600; if (player.class === 'mage') atkDelay = 800;
        if (player.lvl >= 52) atkDelay = 400; if (player.lvl >= 60) atkDelay = 350; if (player.lvl >= 70) atkDelay = 300; 
        if (player.buffs.haste) atkDelay = Math.floor(atkDelay * 0.75); if (player.buffs.brave) atkDelay = Math.floor(atkDelay * 0.66); 
        
        // [Phase 2] 精靈餅乾修正為 / 1.5
        if (player.buffs.wafer) atkDelay = Math.floor(atkDelay / 1.5); 
        
        if (atkDelay < 150) atkDelay = 150;
        if (d <= range && Date.now() - player.atkTimer > atkDelay && hoverTarget.hp > 0) { 
            player.atkTimer = Date.now(); 
            if(isBow) { projectiles.push({x:player.x, y:player.y-20, tx:player.target.x, ty:player.target.y-20, spd:15, target:player.target, color:'#0f0'}); if(typeof AudioSys !== 'undefined') AudioSys.sfx('click'); } else { hit(player.target); if (player.target) { addPart(player.target.x, player.target.y, '#fff', 3); } } 
            move = false; player.tx = player.x; player.ty = player.y;
        } else if (d <= range) { move = false; player.tx = player.x; player.ty = player.y; }
    } else { player.forceMoveTimer = Date.now() + 800; player.manualTarget = false; player.autoCombatDelay = Date.now() + 1500; } 
    if(move) { player.tx = mouseX; player.ty = mouseY; } 
});

// [New] 更新 addFloat 支援字體大小
function addFloat(x,y,t,c,l,s) { 
    if(typeof texts !== 'undefined') {
        texts.push({x:x,y:y,txt:t,c:c,life:l||40, size:s||16}); 
    }
}