/**
 * Lineage M v77.90 Game Engine (Progressive EXP Update)
 * ---------------------------------------------------
 * [更新記錄 - v77.90_MapExpBonus]
 * 1. [平衡] 實裝地圖階梯式經驗值加成系統。
 * - 從 Map 8 (象牙塔) 開始，每張地圖經驗值提升 10% (1.1x)。
 * - 依序遞增至 Map 17 (異界裂縫) 為 2.0x 經驗值。
 * - 此加成針對怪物「生成時」的基礎經驗值進行運算，可與 GM 倍率疊加。
 * ---------------------------------------------------
 * [修正記錄 - v77.90_Fix_UI]
 * 1. [修正] 修復 HP 血條顯示錯誤，解決出現 "Math.floor..." 文字的問題。
 * ---------------------------------------------------
 * [修正記錄 - v77.90_HiddenValley]
 * 1. [生態] 隱藏之谷 (Map 0) 怪物上限由 600 提升至 900。
 * 2. [機制] 解鎖隱藏之谷的自動重生機制，現在怪物會無限重生。
 * 3. [平衡] 隱藏之谷的「紅色藥水」掉落率提升 2 倍 (新手福利)。
 * ---------------------------------------------------
 */

// --- 全域變數與設定 (Global Settings) ---
var GM_EXP_MULT = 1.0; 
var GM_GOLD_MULT = 1.0; 
var GM_SPAWN_MULT = 1; 
var GM_DROP_MULT_USE = 1.0; 
var GM_DROP_MULT_EQUIP = 1.0; 
var GM_DROP_MULT_RARE = 1.0;  

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
function resize(){ 
    W=window.innerWidth; 
    H=window.innerHeight; 
    cvs.width=W; 
    cvs.height=H; 
} 
window.addEventListener('resize',resize); 
resize();

// --- 音效系統 (Audio System v3.0 - Hybrid) ---
var AudioSys = { 
    ctx: null, 
    bgmNode: null,
    defaultAudio: null, // 用來存儲 lineage.mp3 的 HTMLAudioElement

    init: function() { 
        try { 
            window.AudioContext = window.AudioContext || window.webkitAudioContext; 
            if(window.AudioContext) { 
                if (!this.ctx) this.ctx = new AudioContext(); 
                if(this.ctx.state === 'suspended') this.ctx.resume(); 
            } 
            // 預備預設音樂物件
            if (!this.defaultAudio) {
                this.defaultAudio = new Audio('lineage.mp3');
                this.defaultAudio.loop = true;
                this.defaultAudio.volume = 0.4;
            }
        } catch(e) { console.warn("Audio init failed:", e); } 
    }, 

    // [New] 播放預設音樂 (lineage.mp3)
    playDefault: function() {
        this.init();
        if (this.defaultAudio) {
            var playPromise = this.defaultAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("自動播放預設音樂失敗 (可能缺少檔案或瀏覽器阻擋):", error);
                });
            }
        }
    },

    playFile: function(file) { 
        if(!this.ctx) this.init(); 
        if(!file || !this.ctx) return; 
        
        // 如果正在播放預設音樂，先停止
        if (this.defaultAudio) {
            this.defaultAudio.pause();
            this.defaultAudio.currentTime = 0;
        }

        var r = new FileReader(); 
        r.onload = e => this.ctx.decodeAudioData(e.target.result, b => { 
            if(this.bgmNode) this.bgmNode.stop(); 
            this.bgmNode = this.ctx.createBufferSource(); 
            this.bgmNode.buffer = b; 
            this.bgmNode.loop = true; 
            var g = this.ctx.createGain(); 
            g.gain.value = 0.4; 
            this.bgmNode.connect(g); 
            g.connect(this.ctx.destination); 
            this.bgmNode.start(0); 
        }); 
        r.readAsArrayBuffer(file); 
    }, 
    
    playTone: function(type) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.ctx.destination);

        switch (type) {
            case 'bow': o.type = 'triangle'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(100, t + 0.1); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1); o.start(t); o.stop(t + 0.1); break;
            case 'bow_magic': o.type = 'sine'; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(1200, t + 0.2); g.gain.setValueAtTime(0.2, t); g.gain.linearRampToValueAtTime(0, t + 0.2); o.start(t); o.stop(t + 0.2); break;
            case 'bow_triple': o.type = 'sawtooth'; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.15); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.15); o.start(t); o.stop(t + 0.15); break;
            case 'sword': case 'sword_heavy': o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(0.01, t + 0.15); g.gain.setValueAtTime(0.2, t); g.gain.linearRampToValueAtTime(0, t + 0.15); o.start(t); o.stop(t + 0.15); break;
            case 'sword_magic': o.type = 'square'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.25); g.gain.setValueAtTime(0.15, t); g.gain.linearRampToValueAtTime(0, t + 0.25); o.start(t); o.stop(t + 0.25); break;
            case 'magic_arrow': o.type = 'triangle'; o.frequency.setValueAtTime(1000, t); o.frequency.linearRampToValueAtTime(500, t + 0.3); g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0, t + 0.3); o.start(t); o.stop(t + 0.3); break;
            case 'fireball': o.type = 'sawtooth'; o.frequency.setValueAtTime(100, t); o.frequency.exponentialRampToValueAtTime(10, t + 0.6); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.6); o.start(t); o.stop(t + 0.6); break;
            case 'fire_storm': o.type = 'lowpass'; o.frequency.setValueAtTime(200, t); o.frequency.linearRampToValueAtTime(50, t + 1.0); g.gain.setValueAtTime(0.4, t); g.gain.linearRampToValueAtTime(0, t + 1.0); o.start(t); o.stop(t + 1.0); break;
            case 'meteor': o.type = 'square'; o.frequency.setValueAtTime(80, t); o.frequency.linearRampToValueAtTime(20, t + 1.2); g.gain.setValueAtTime(0.4, t); g.gain.linearRampToValueAtTime(0, t + 1.2); o.start(t); o.stop(t + 1.2); break;
            case 'heal': o.type = 'sine'; o.frequency.setValueAtTime(200, t); o.frequency.linearRampToValueAtTime(600, t + 0.5); g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0, t + 0.5); o.start(t); o.stop(t + 0.5); break;
            case 'magic_def': o.type = 'sine'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(100, t + 0.8); g.gain.setValueAtTime(0.2, t); g.gain.linearRampToValueAtTime(0, t + 0.8); o.start(t); o.stop(t + 0.8); break;
            case 'click': default: o.type = 'triangle'; o.frequency.setValueAtTime(800, t); g.gain.setValueAtTime(0.05, t); o.start(t); o.stop(t + 0.05); break;
        }
    },
    sfx: function(type) { this.playTone(type); } 
};
if(document.getElementById('bgm-input')) document.getElementById('bgm-input').addEventListener('change',e=>AudioSys.playFile(e.target.files[0])); 
if(document.getElementById('bgm-input-2')) document.getElementById('bgm-input-2').addEventListener('change',e=>AudioSys.playFile(e.target.files[0])); 

// --- 遊戲狀態與玩家資料 ---
var gameState = 'MENU'; 
var currentMapId = 0; 
var accountId = "guest";
// [Update] 玩家物件擴充
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

// --- 輔助函式 ---
function getPlayerStats() { 
    var s = {str:player.str, dex:player.dex, int:player.int, con:player.con}; 
    for(var k in player.equip) { 
        var it = player.equip[k]; 
        if(ITEMS[it.key]) { 
            var d = ITEMS[it.key]; 
            if(d.str) s.str += d.str; 
            if(d.dex) s.dex += d.dex; 
            if(d.int) s.int += d.int; 
            if(d.con) s.con += d.con; 
        } 
    } 
    return s; 
}

// --- GM 控制 ---
function applyGMSettings() { 
    GM_EXP_MULT = parseFloat(document.getElementById('gm-exp').value); 
    GM_GOLD_MULT = parseFloat(document.getElementById('gm-gold').value); 
    GM_SPAWN_MULT = parseInt(document.getElementById('gm-spawn').value); 
    GM_DROP_MULT_USE = parseFloat(document.getElementById('gm-drop-use').value); 
    GM_DROP_MULT_EQUIP = parseFloat(document.getElementById('gm-drop-equip').value); 
    GM_DROP_MULT_RARE = parseFloat(document.getElementById('gm-drop-rare').value); 
    document.getElementById('gm-console').style.display='none'; 
    document.getElementById('start-screen').style.display='flex'; 
    document.getElementById('login-box-main').style.display='block'; 
    logMsg("GM 模式已啟動 (EXP x" + GM_EXP_MULT + ")", "#f0f"); 
}

// --- 遊戲啟動流程 ---
function loginAndStart(cls) { 
    if (typeof ITEMS === 'undefined') { alert("資料庫載入失敗: ITEMS 未定義"); return; } 
    if (typeof Assets === 'undefined') { alert("資源庫載入失敗: Assets 未定義"); return; }
    
    try { 
        // [New] 啟動預設背景音樂
        AudioSys.playDefault(); 
        
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
        } 
        document.getElementById('start-screen').style.display='none'; 
        document.getElementById('game-ui').style.display='block'; 
        document.getElementById('elf-settings').style.display = (player.class === 'elf' ? 'block' : 'none'); 
        document.getElementById('knight-settings').style.display = (player.class === 'knight' ? 'block' : 'none'); 
        if(document.getElementById('mage-settings')) {
            document.getElementById('mage-settings').style.display = (player.class === 'mage' ? 'block' : 'none');
        }

        updateAutoBtn(); 
        updateUI(); 
        gameState='PLAY'; 
        initMap(0); 
        loop(); 
    } catch(e) { 
        console.error(e); 
        alert("啟動失敗: " + e.message); 
    } 
}

// --- 存檔與讀檔 ---
function toggleAutoCombat() { player.autoCombat = !player.autoCombat; if (!player.autoCombat && !player.manualTarget) player.target = null; updateAutoBtn(); AudioSys.sfx('click'); }
function updateAutoBtn() { var btn = document.getElementById('btn-auto'); btn.innerHTML = player.autoCombat ? "自動: ON" : "自動: OFF"; if(!player.autoCombat) btn.classList.add('off'); else btn.classList.remove('off'); }
function saveGame() { if(gameState!=='PLAY') return; try { var cleanPlayer = Object.assign({}, player); cleanPlayer.target = null; cleanPlayer.pets = []; localStorage.setItem('linm_v77_'+accountId, JSON.stringify(cleanPlayer)); } catch(e) {} }
function loadGame() { var data = localStorage.getItem('linm_v77_'+accountId); if(data) { try { Object.assign(player, JSON.parse(data)); if(!player.skillCD) player.skillCD = {}; if(!player.baseMaxHp) player.baseMaxHp = player.maxHp; if(!player.baseMaxMp) player.baseMaxMp = player.maxMp; player.pets = []; if(!player.direction) player.direction = 1; if(!player.forceMoveTimer) player.forceMoveTimer = 0; return true; } catch(e) { return false; } } return false; }
function saveAndLogout() { saveGame(); location.reload(); }
function deleteAccountData() { var id = document.getElementById('login-id').value.trim(); if(!id) return; localStorage.removeItem('linm_v77_'+id); alert("資料已刪除"); }

// --- 物品系統 ---
function addItem(key, count=1) { 
    if(!ITEMS[key]) return; 
    if (player.autoSellKeys && player.autoSellKeys.includes(key)) { 
        var price = ITEMS[key].price || 1; 
        player.gold += price * count; 
        logMsg("自動賣出: " + ITEMS[key].name + " (+" + (price*count) + "G)", "#ff0"); 
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

// --- 地圖與生成 ---
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
    if (id !== 0) { portals.push({x: mapInfo.x + 200, y: mapInfo.y + 200, r: 50, dest: 0}); } else { portals.push({x: 200, y: 200, r: 50, dest: 1}); } 
    generateEnvironment(mapInfo.theme, g); 
    if (id == 0) { for(let i=0; i<5; i++) entities.push({name:'新手導師', hp:1000, maxHp:1000, s:24, c:'#aaa', x:600+(Math.random()-0.5)*200, y:900+(Math.random()-0.5)*200, isFakePlayer:true, chatTimer:0, chatText:''}); } 
    
    // [Fix v77.88] 調整怪物基礎數量
    // Map 0 (隱藏之谷) 提升至 900 (v77.90 Update), 一般地圖為 350 或 200
    var baseMobCount = (id === 0) ? 900 : ((mapInfo.w && mapInfo.w > 100) ? 350 : 200); 
    
    var mobCount = baseMobCount * GM_SPAWN_MULT; 
    for(let i=0; i<mobCount; i++) spawnMob(true); 
    if(mapInfo.boss) checkAndSpawnBoss(mapInfo.boss); 
}

function generateEnvironment(theme, gCtx) { 
    var range = (MAPS[currentMapId].w > 100) ? 4000 : 2000; 
    var trees = ['prop_tree_green', 'prop_tree_yellow', 'prop_tree_red']; 
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
        for(let i=0; i<Math.random()*5+3; i++) envProps.push({x:cx+(Math.random()-0.5)*300, y:cy+(Math.random()-0.5)*300, key:key, scale:0.8+Math.random()*0.5, type:'prop'}); 
    } 
}

function checkAndSpawnBoss(bossKey) { 
    var exist = entities.find(e => e.type === bossKey && e.isBoss); 
    if (exist) return; 
    var nextSpawn = player.bossTimers[bossKey]; 
    if (!nextSpawn || Date.now() >= nextSpawn) spawnBoss(bossKey); 
}

// [v77.91] 地圖經驗值加成計算函式
function getMapExpBonus(mapId) {
    if (mapId === 8) return 1.1; // 象牙塔
    if (mapId === 9) return 1.2; // 龍之谷
    if (mapId === 10) return 1.3; // 火龍窟
    if (mapId === 11) return 1.4; // 傲慢塔
    if (mapId === 12) return 1.5; // 古魯丁7F
    if (mapId === 13) return 1.6; // 遺忘之島
    if (mapId === 14) return 1.7; // 拉斯塔巴德
    if (mapId === 15) return 1.8; // 提卡爾
    if (mapId === 16) return 1.9; // 底比斯
    if (mapId === 17) return 2.0; // 異界裂縫
    return 1.0; // 其他地圖無加成
}

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
    
    // [Fix v77.88] 地圖難度動態調整: Map 2 (Lv.15) 以上地圖，血量 2 倍
    var multiplier = (currentMapId >= 2) ? 2 : 1;
    var finalHp = Math.floor(t.hp * multiplier);
    
    // [v77.91] 應用地圖經驗值加成
    var expBonus = getMapExpBonus(currentMapId);
    var finalExp = t.exp * expBonus;
    
    entities.push({ name:t.name, hp:finalHp, maxHp:finalHp, exp:finalExp, s:t.s, c:t.c, isBoss:false, type:mobKey, drops:t.drops, x:mx, y:my, atkTimer:0, aggro: false, magic: t.magic, stunTimer: 0, direction: 1 }); 
}

function spawnBoss(key) { 
    var t = MOB_TYPES[key]; 
    if(!t) return; 
    var d = (currentMapId >= 14 || currentMapId === 1) ? 3500 : 2000; 
    var a = Math.random()*6.28; 
    
    // [Fix v77.88] BOSS 也要應用 2 倍血量規則 (若在地圖 2 以上)
    var multiplier = (currentMapId >= 2) ? 2 : 1;
    var finalHp = Math.floor(t.hp * multiplier);

    // [v77.91] 應用地圖經驗值加成 (BOSS 同步加成)
    var expBonus = getMapExpBonus(currentMapId);
    var finalExp = t.exp * expBonus;

    entities.push({ name: t.name, hp: finalHp, maxHp: finalHp, exp: finalExp, s: t.s, c: t.c, isBoss: true, type: key, drops: t.drops, x: Math.cos(a)*d, y: Math.sin(a)*d, atkTimer: 0, aggro: t.aggro, magic: t.magic, scale: t.scale || 2.0, stunTimer: 0, direction: 1 }); 
    logMsg("BOSS 出現了: " + t.name, "#f0f"); 
}

function summonPet(count) { 
    var t = MOB_TYPES['summon_creature']; 
    for(let i=0; i<count; i++) { 
        player.pets.push({ name: '召喚獸', hp: t.hp, maxHp: t.hp, atk: t.atk, def: t.def, s: t.s, c: t.c, x: player.x + (Math.random()-0.5)*100, y: player.y + (Math.random()-0.5)*100, isPet: true, target: null, atkTimer: 0, type: 'summon_creature', direction: 1 }); 
        addPart(player.x, player.y, '#aaf', 20); 
    } 
    logMsg(`召喚了 ${count} 隻召喚獸`, '#0ff'); 
}

function addVisualEffect(x, y, key, duration=1000, scale=1.0) {
    visualEffects.push({
        x: x, y: y, key: key, 
        startTime: Date.now(), 
        duration: duration, 
        scale: scale
    });
}

// --- 遊戲迴圈更新 ---
function update() {
    var now = Date.now();
    for(var k in player.buffs) { if(player.buffs[k] < now) { if (k === 'soul_elevation') { player.maxHp = player.baseMaxHp; player.maxMp = player.baseMaxMp; if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp; logMsg("靈魂昇華效果結束", "#aaa"); } delete player.buffs[k]; } }
    
    visualEffects = visualEffects.filter(e => now - e.startTime < e.duration);

    for(let i=groundEffects.length-1; i>=0; i--) {
        let ge = groundEffects[i];
        if (now - ge.startTime > ge.duration) { groundEffects.splice(i, 1); continue; }
        if (now - ge.lastTick > ge.tickInterval) {
            ge.lastTick = now;
            if (ge.type === 'fire_storm') {
                entities.forEach(e => {
                    if (!e.isFakePlayer && Math.hypot(e.x - ge.x, e.y - ge.y) < ge.range) {
                        hit(e, ge.dmg);
                        addPart(e.x, e.y, '#f80', 5);
                    }
                });
            }
        }
    }

    var atkDelay = 600; if (player.class === 'mage') atkDelay = 800;
    if (player.lvl >= 52) atkDelay = 400; if (player.lvl >= 60) atkDelay = 350; if (player.lvl >= 70) atkDelay = 300; 
    if (player.buffs.haste) atkDelay = Math.floor(atkDelay * 0.75); if (player.buffs.brave) atkDelay = Math.floor(atkDelay * 0.66); if (player.buffs.wafer) atkDelay = Math.floor(atkDelay * 0.7); if (atkDelay < 150) atkDelay = 150;

    if (player.autoBuffs.haste && !player.buffs.haste) useItemByKey('potion_green');
    if (player.autoBuffs.blue && !player.buffs.blue_potion) useItemByKey('mana');
    if (player.autoBuffs.brave) { if(player.class==='knight' && !player.buffs.brave) useItemByKey('potion_brave'); if(player.class==='elf' && !player.buffs.wafer) useItemByKey('cookie_elf'); if(player.class==='mage' && !player.buffs.wisdom) useItemByKey('potion_wisdom'); }
    
    // 騎士自動技能
    if (player.class === 'knight') { if (player.autoBuffs.solid_carriage && !player.buffs.solid_carriage && player.skills.includes('k2')) { if(player.mp >= 15) { player.mp -= 15; player.buffs.solid_carriage = now + 60000; AudioSys.sfx('magic_def'); addPart(player.x, player.y, '#888', 10); } } if (player.autoBuffs.counter_barrier && !player.buffs.counter_barrier && player.skills.includes('k3')) { if(player.mp >= 20) { player.mp -= 20; player.buffs.counter_barrier = now + 120000; AudioSys.sfx('magic_atk'); addPart(player.x, player.y, '#fff', 15); } } }
    
    // 妖精自動技能
    if(player.class === 'elf') { var hasMp = (cost) => player.mp >= cost; if(now % 1000 < 50) { if(player.autoBuffs.fire && !player.buffs.fire_weapon && hasMp(30) && player.skills.includes('e3')) { player.mp -= 30; player.buffs.fire_weapon = now + 960000; AudioSys.sfx('magic_fire'); addPart(player.x, player.y, '#f80', 10); } if(player.autoBuffs.wind && !player.buffs.wind_shot && hasMp(20) && player.skills.includes('e5')) { player.mp -= 20; player.buffs.wind_shot = now + 960000; AudioSys.sfx('magic_wind'); addPart(player.x, player.y, '#afa', 10); } if(player.autoBuffs.storm && !player.buffs.storm_shot && hasMp(40) && player.skills.includes('e6')) { player.mp -= 40; player.buffs.storm_shot = now + 960000; AudioSys.sfx('magic_wind'); addPart(player.x, player.y, '#0f0', 10); } } if(player.autoB2M && player.skills.includes('e2') && player.hp > player.maxHp * (player.autoB2M_HP / 100) && player.mp < player.maxMp * (player.autoB2M_MP / 100)) { if (now % 1000 < 50) { player.hp -= 50; player.mp = Math.min(player.maxMp, player.mp + 20); AudioSys.sfx('magic_soul'); logMsg("魂體轉換", "#aaf"); updateUI(); } } }
    
    // [Update] 法師自動技能邏輯 (Auto Mage)
    if(player.class === 'mage') {
        if(now % 1000 < 50) { // 每秒檢查一次
            // 自動聖結界 (Immune to Harm)
            if (player.autoBuffs.immune_to_harm && !player.buffs.immune_to_harm && player.skills.includes('m6')) {
                var skill = SKILLS['m6'];
                if (skill && player.mp >= skill.mp && player.mp >= player.maxMp * (player.autoImmuneMpLimit/100)) {
                    player.mp -= skill.mp;
                    player.buffs['immune_to_harm'] = now + skill.duration;
                    AudioSys.sfx('magic_def');
                    addPart(player.x, player.y, '#fff', 20);
                    logMsg("自動施放: 聖結界", "#fff");
                }
            }
            // 自動靈魂昇華 (Soul Elevation)
            if (player.autoBuffs.soul_elevation && !player.buffs.soul_elevation && player.skills.includes('m10')) {
                var skill = SKILLS['m10'];
                if (skill && player.mp >= skill.mp && player.mp >= player.maxMp * (player.autoSoulMpLimit/100)) {
                    player.mp -= skill.mp;
                    player.buffs['soul_elevation'] = now + skill.duration;
                    player.maxHp = Math.floor(player.baseMaxHp * 1.3); 
                    player.maxMp = Math.floor(player.baseMaxMp * 1.3); 
                    player.hp = Math.min(player.hp + (player.maxHp - player.baseMaxHp), player.maxHp);
                    AudioSys.sfx('magic');
                    addPart(player.x, player.y, '#fff', 30);
                    logMsg("自動施放: 靈魂昇華", "#fff");
                }
            }
        }
    }

    if (now - player.lastRegenTime > 3000) { player.lastRegenTime = now; if (player.hp > 0) { var stats = getPlayerStats(); var hpRegen = Math.floor(player.lvl / 2) + stats.con; player.hp = Math.min(player.maxHp, player.hp + hpRegen); var mpRegen = Math.floor(player.lvl / 3) + stats.int; if (player.buffs.blue_potion) mpRegen += 5; if (player.equip.armor && player.equip.armor.key === 'armor_robe') mpRegen += 5; if (player.equip.weapon && player.equip.weapon.key === 'staff_crystal') mpRegen += 5; player.mp = Math.min(player.maxMp, player.mp + mpRegen); } if (MAPS[currentMapId].boss) checkAndSpawnBoss(MAPS[currentMapId].boss); }
    
    // [Mod v77.90] 更新 Map 0 的怪物上限與重生邏輯
    // Map 0: 900, Map W>100: 350, Others: 200
    var baseMaxMobs = (currentMapId === 0) ? 900 : ((MAPS[currentMapId].w > 100) ? 350 : 200); 
    
    var maxMobs = baseMaxMobs * GM_SPAWN_MULT; if (maxMobs > 3000) maxMobs = 3000;
    
    // [Mod v77.90] 移除 currentMapId != 0 限制，允許隱藏之谷重生
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
    
    portals.forEach(p => { if(Math.hypot(player.x-p.x, player.y-p.y) < p.r) { if (Date.now() - player.lastPortalTime > 3000) { if (document.getElementById('teleport-menu').style.display !== 'block') openTeleportMenu(); } } });

    player.pets = player.pets.filter(p => p.hp > 0); player.pets.forEach(p => { var target = player.target || p.target; var destX = player.x, destY = player.y; if (target && target.hp > 0) { destX = target.x; destY = target.y; var distToT = Math.hypot(destX - p.x, destY - p.y); if (distToT < 40) { if (Date.now() - p.atkTimer > 1000) { p.atkTimer = Date.now(); hit(target, p.atk, null, p); addPart(target.x, target.y, '#aaf', 5); } } else { var ang = Math.atan2(destY - p.y, destX - p.x); var mx = Math.cos(ang) * 8; p.x += mx; p.y += Math.sin(ang) * 8; if (mx > 0) p.direction = 1; if (mx < 0) p.direction = -1; } } else { var distToP = Math.hypot(player.x - p.x, player.y - p.y); if (distToP > 80) { var ang = Math.atan2(player.y - p.y, player.x - p.x); var mx = Math.cos(ang) * 9; p.x += mx; p.y += Math.sin(ang) * 9; if (mx > 0) p.direction = 1; if (mx < 0) p.direction = -1; } } });

    entities.forEach(m => { 
        if(m.isFakePlayer) return; 
        
        if(m.stunTimer && Date.now() < m.stunTimer) return; 
        
        var dToPlayer = Math.hypot(player.x-m.x, player.y-m.y); 
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

                // [Fix v77.88] 怪物攻擊力倍率 (Map 2+ 兩倍傷害)
                if (currentMapId >= 2 && !m.isPet && !m.isFakePlayer) {
                    var baseAtk = (mobData.atk || 10) * 2;
                    rawDmg = baseAtk + Math.random()*5;
                }

                if (target === player) { 
                    if (player.buffs.counter_barrier) { 
                        var k3Lv = player.skillLevels['k3'] || 1; 
                        var chance = 0.10 + (k3Lv * 0.02); 
                        if (Math.random() < chance) { 
                            var wAtk = player.equip.weapon ? (ITEMS[player.equip.weapon.key].atk + (player.equip.weapon.en||0)) : 0;
                            var playerStr = getPlayerStats().str;
                            var reflectDmg = Math.floor((playerStr * 2) + (wAtk * 2) + (rawDmg * 0.2));
                            hit(m, reflectDmg, 'counter'); AudioSys.sfx('magic_atk'); addPart(player.x, player.y, '#fff', 20); addFloat(player.x, player.y-40, "反擊!", "#fff"); 
                            return; 
                        } 
                    } 
                    try { 
                        var def = 0; ['helm','armor','boot','glove','cloak','shirt'].forEach(s=>{ if(player.equip[s] && ITEMS[player.equip[s].key]) def += (ITEMS[player.equip[s].key].def||0)+(player.equip[s].en||0); }); var stats = getPlayerStats(); var playerDef = Math.floor(stats.dex/3) + def; if (player.buffs.solid_carriage) { var k2Lv = player.skillLevels['k2'] || 1; playerDef += 15 + (k2Lv * 5); } 
                        var dmg = Math.max(1, Math.floor(rawDmg - playerDef)); 
                        if (player.buffs.immune_to_harm) { dmg = Math.floor(dmg * 0.5); }
                        player.hp -= dmg; AudioSys.sfx('hit'); screenShake = 5; addFloat(player.x, player.y-40, "-"+dmg, "#f00"); 
                        if(player.hp<=0) showDeathModal(); 
                    } catch(e) {} 
                } else { var dmg = Math.max(1, Math.floor(rawDmg - (target.def||0))); target.hp -= dmg; addFloat(target.x, target.y-30, "-"+dmg, "#faa"); } 
            } 
        } 
    });

    if(!player.target && !joyActive && player.autoCombat) { let nearest = null; let minD = 600; entities.forEach(e => { let d = Math.hypot(e.x - player.x, e.y - player.y); if(d < minD && !e.isFakePlayer) { minD = d; nearest = e; } }); if(nearest) { player.target = nearest; player.manualTarget = false; } }
    
    if(player.target && player.target.hp > 0 && !joyActive) { 
        var d = Math.hypot(player.target.x - player.x, player.target.y - player.y); 
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
                    AudioSys.sfx(sfxKey); 
                } else { 
                    hit(player.target); if (player.target) { addPart(player.target.x, player.target.y, '#fff', 3); } 
                    var wKey = player.equip.weapon ? player.equip.weapon.key : null; var sfxKey = wKey ? (ITEMS[wKey].sound || 'sword') : 'sword'; if (!wKey) sfxKey = 'click'; AudioSys.sfx(sfxKey);
                } 
            } 
        } else if (shouldChase) { player.tx = player.target.x; player.ty = player.target.y; } 
    }
    
    // [New] 自動治癒術邏輯 (同步執行，不影響喝水)
    if (player.class === 'mage' && player.autoHealSkill !== 'none') {
        if (Date.now() - player.lastHealSpellTime > 1000) { // 1秒檢查一次與冷卻
            var hpLimit = player.maxHp * (player.autoHealVal / 100);
            var mpLimit = player.maxMp * (player.autoHealMpLimit / 100);
            if (player.hp < hpLimit && player.mp > mpLimit) {
                // 映射選項至技能 Key
                var skillKey = '';
                if (player.autoHealSkill === 'heal_1') skillKey = 'm3';
                if (player.autoHealSkill === 'heal_2') skillKey = 'm4';
                if (player.autoHealSkill === 'heal_3') skillKey = 'm5';
                if (player.autoHealSkill === 'e_heal' && player.class === 'elf') skillKey = 'e4'; // 妖精支援
                
                if (skillKey) {
                    var s = SKILLS[skillKey];
                    // 檢查是否學會該技能
                    if (s && player.skills.includes(skillKey) && player.mp >= s.mp) {
                        player.mp -= s.mp;
                        player.lastHealSpellTime = Date.now();
                        
                        // 治癒量公式 (含 INT 加成)
                        var baseAmt = 30; var intMulti = 2;
                        if (skillKey === 'm4') { baseAmt = 70; intMulti = 3; }
                        if (skillKey === 'm5') { baseAmt = 150; intMulti = 5; }
                        var healAmt = Math.floor(baseAmt + (player.int * intMulti));
                        
                        player.hp = Math.min(player.maxHp, player.hp + healAmt);
                        AudioSys.sfx('heal');
                        addPart(player.x, player.y, '#fff', 10);
                        // logMsg("自動治癒: +" + healAmt, "#0f0"); // 避免洗版，可註解
                    }
                }
            }
        }
    }

    // 自動喝水 (與自動治癒獨立，可同時觸發)
    if (Date.now() - player.lastPotionTime > 500 && player.hp < player.maxHp * (player.autoPotLimit/100)) { 
        var potPriority = [];
        if (player.autoPotType === 'ultimate') { potPriority = ['potion_ultimate', 'potion_white', 'potion_orange', 'potion']; } else if (player.autoPotType === 'white') { potPriority = ['potion_white', 'potion_orange', 'potion']; } else if (player.autoPotType === 'orange') { potPriority = ['potion_orange', 'potion']; } else { potPriority = ['potion']; }
        var foundIdx = -1;
        for (let i = 0; i < potPriority.length; i++) { var key = potPriority[i]; var idx = player.inventory.findIndex(item => item.key === key); if (idx !== -1) { foundIdx = idx; break; } }
        if (foundIdx !== -1) { useItemIdx(foundIdx); player.lastPotionTime = Date.now(); } 
    }
    updateUI(); draw();
}

// --- 戰鬥系統 ---
function hit(m, extra=0, effect=null, source=null) { 
    if(!m) return; 
    try { 
        var mx = m.x; var my = m.y; 
        m.aggro = true; 
        if (effect === 'counter') { 
            m.hp -= extra; addFloat(mx, my-70, "反擊! "+extra, "#fff", 30); 
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
                if (player.buffs.storm_shot) rawDmg += 5; 
                if (isStaff && wItem.key === 'staff') player.mp = Math.min(player.maxMp, player.mp + 3); 
            } 
            var mobDef = MOB_TYPES[m.type] ? (MOB_TYPES[m.type].def || 0) : 0; 
            
            // [Fix v77.88] 怪物防禦力倍率 (Map 2+ 兩倍防禦)
            if (currentMapId >= 2 && !m.isPet && !m.isFakePlayer) {
                mobDef *= 2;
            }

            var dmg = Math.max(1, Math.floor(rawDmg - mobDef/2 + extra + Math.floor(player.lvl/5))); 
            if (effect === 'stun') { var k1Lv = player.skillLevels['k1'] || 1; var duration = 3000 + (k1Lv-1)*1000; m.stunTimer = Date.now() + duration; addFloat(mx, my-80, `暈眩 (${duration/1000}s)!`, "#ff0", 30); } 
            m.hp -= dmg; 
            if (!source) AudioSys.sfx('hit'); 
            addFloat(mx, my-50, ""+dmg, "#fff", 20); 
        } 
        if(m.hp <= 0) { 
            var mobData = MOB_TYPES[m.type];
            var expGain = (m.exp * 5000) * GM_EXP_MULT; 
            var goldDrop = 0;
            if (mobData && mobData.minGold !== undefined && mobData.maxGold !== undefined) { var range = mobData.maxGold - mobData.minGold; goldDrop = Math.floor(mobData.minGold + Math.random() * (range + 1)); } else { goldDrop = Math.floor(m.exp * 20); }
            goldDrop = Math.floor(goldDrop * GM_GOLD_MULT);
            player.exp += expGain; player.gold += goldDrop; 
            addFloat(player.x, player.y-60, "+"+expGain+" XP", "#fd0"); 
            if (goldDrop > 0) { addFloat(player.x, player.y-80, "+$"+goldDrop, "#ff0"); logMsg(`獲得金幣: ${goldDrop}`, "#ff0"); }
            if(m.drops) { 
                m.drops.forEach(d => { 
                    var rate = d.c; 
                    var itemInfo = ITEMS[d.k]; 
                    if (itemInfo) { 
                        if (itemInfo.price > 10000) rate *= GM_DROP_MULT_RARE; 
                        else if (itemInfo.type === 'equip') rate *= GM_DROP_MULT_EQUIP; 
                        else rate *= GM_DROP_MULT_USE; 
                        
                        // [Mod v77.90] 隱藏之谷(Map 0) 紅色藥水掉落率加倍
                        if (currentMapId === 0 && d.k === 'potion') {
                            rate *= 2;
                        }
                    } 
                    if(Math.random() < rate) { addItem(d.k, 1); logMsg(m.name + " 給你: " + itemInfo.name, "#0f0"); } 
                }); 
            } 
            if(player.exp >= player.nextExp) { 
                player.exp -= player.nextExp; player.lvl++; 
                var multiplier = 1.1; if (player.lvl >= 45) multiplier = 1.1; if (player.lvl >= 52) multiplier = 1.2; if (player.lvl >= 60) multiplier = 1.3; if (player.lvl >= 70) multiplier = 1.4;
                player.nextExp = Math.floor(player.nextExp * multiplier); 
                player.points+=3; player.skillPoints+=1; 
                player.baseMaxHp += (player.con * 2); player.maxHp = player.baseMaxHp; player.hp = player.maxHp; 
                player.baseMaxMp += (player.int * 2); player.maxMp = player.baseMaxMp; player.mp = player.maxMp; 
                if (player.lvl === 52) { logMsg("恭喜! 達成 Lv.52 變身死亡騎士!", "#fd0"); AudioSys.sfx('enchant'); } 
                else if (player.lvl === 60) { logMsg("恭喜! 達成 Lv.60 第三階進化!", "#0ff"); AudioSys.sfx('enchant'); }
                else if (player.lvl === 70) { logMsg("恭喜! 達成 Lv.70 七彩變身!", "#f0f"); AudioSys.sfx('enchant'); } 
                else { logMsg("升級! HP/MP UP", "#0ff"); AudioSys.sfx('enchant'); } 
            } 
            entities = entities.filter(e=>e!==m); player.target = null; hoverTarget = null; 
            if(m.isBoss) { var t = MOB_TYPES[m.type]; player.bossTimers[m.type] = Date.now() + (t.respawnTime * 1000); logMsg(m.name + " 已死亡", "#f00"); saveGame(); } 
        } 
    } catch(e) { entities = entities.filter(e=>e!==m); player.target = null; } 
}

// --- 道具使用 ---
function useItemByKey(key) { var idx = player.inventory.findIndex(i => i.key === key); if(idx !== -1) useItemIdx(idx); }
function useItemIdx(idx) { 
    var item = player.inventory[idx]; 
    var i = ITEMS[item.key]; 
    if (i.class && i.class !== player.class) { var cName = i.class==='knight'?'騎士':(i.class==='elf'?'妖精':'法師'); logMsg("職業不符 (" + cName + "專用)", "#f00"); return; } 
    // [Fix] 瞬間傳送卷軸：使用絕對座標範圍，防止飛出地圖
    if (i.key === 'scroll_teleport') { 
        var mapRange = (MAPS[currentMapId].w > 100) ? 5000 : 2500;
        player.x = (Math.random() - 0.5) * mapRange; 
        player.y = (Math.random() - 0.5) * mapRange;
        player.tx = player.x; player.ty = player.y; 
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        AudioSys.sfx('magic_soul'); logMsg("瞬間移動!", "#0ff"); addPart(player.x, player.y, "#aaf", 20); renderInv(); updateUI(); return; 
    } 
    // [Fix] 回家卷軸：強制指定 Map 0 (隱藏之谷) 傳送點旁
    if (i.key === 'scroll_return') { 
        teleport(0); 
        player.x = 280; player.y = 280; // 強制設定在傳送點旁
        player.tx = 280; player.ty = 280;
        if(item.count>1) item.count--; else player.inventory.splice(idx,1); 
        AudioSys.sfx('magic_soul'); logMsg("傳送回村莊", "#0ff"); renderInv(); updateUI(); return; 
    } 
    if(i.buff) { player.buffs[i.buff] = Date.now() + i.duration; if(item.count>1) item.count--; else player.inventory.splice(idx,1); AudioSys.sfx('magic_def'); updateUI(); renderInv(); return; } 
    if(i.type === 'scroll') { enchantMode = true; enchantScroll = { idx: idx, target: i.target }; renderInv(); return; } 
    if(i.type === 'use') { if(i.heal) player.hp = Math.min(player.hp+i.heal, player.maxHp); if(item.count>1) item.count--; else player.inventory.splice(idx,1); AudioSys.sfx('heal'); } 
    else if(i.type === 'equip') { var slot = i.slot; var old = player.equip[slot]; player.equip[slot] = item; if(item.count>1) item.count--; else player.inventory.splice(idx,1); if(old) player.inventory.push(old); AudioSys.sfx('click'); } 
    updateUI(); renderInv(); 
}

// --- UI 更新 ---
function updateUI() { 
    document.getElementById('ui-lvl').innerText=player.lvl; 
    document.getElementById('ui-class').innerText=(player.class==='knight'?'騎士':(player.class==='elf'?'妖精':'法師')); 
    document.getElementById('bar-exp').style.width = Math.min(100, (player.exp / player.nextExp * 100)) + "%"; 
    document.getElementById('bar-hp').style.width = Math.min(100, (player.hp/player.maxHp*100))+"%"; 
    
    // [Fix] 修正血量文字顯示錯誤
    document.getElementById('txt-hp').innerText=Math.floor(player.hp)+"/"+Math.floor(player.maxHp); 
    
    document.getElementById('bar-mp').style.width = Math.min(100, (player.mp/player.maxMp*100))+"%"; 
    document.getElementById('txt-mp').innerText=Math.floor(player.mp)+"/"+Math.floor(player.maxMp); 
    document.getElementById('ui-gold').innerText=Math.floor(player.gold); 
    
    document.getElementById('st-pts').innerText=player.points; 
    var stats = getPlayerStats(); 
    var fmt = (base, total) => total > base ? `${base} (+${total-base})` : base; 
    document.getElementById('st-str').innerText=fmt(player.str, stats.str); 
    document.getElementById('st-dex').innerText=fmt(player.dex, stats.dex); 
    document.getElementById('st-con').innerText=fmt(player.con, stats.con); 
    document.getElementById('st-int').innerText=fmt(player.int, stats.int); 
    var bb = document.getElementById('buff-bar'); bb.innerHTML = ''; 
    var now = Date.now(); 
    for(var k in player.buffs) { 
        var s = Math.ceil((player.buffs[k]-now)/1000); 
        var label = k.substr(0,2); 
        if(k==='haste') label='速'; if(k==='brave') label='勇'; if(k==='wafer') label='精'; if(k==='wisdom') label='慎'; 
        if(k==='blue_potion') label='魔'; if(k==='wind_shot') label='風'; if(k==='fire_weapon') label='火'; if(k==='storm_shot') label='暴'; 
        if(k==='solid_carriage') label='盾'; if(k==='counter_barrier') label='反'; 
        if(k==='soul_elevation') label='昇'; if(k==='immune_to_harm') label='聖'; 
        bb.innerHTML+=`<div class="buff-icon"><div class="buff-name">${label}</div><div class="buff-time">${s}s</div></div>`; 
    } 
    var wAtk = player.equip.weapon ? (ITEMS[player.equip.weapon.key].atk + (player.equip.weapon.en||0)) : 0; 
    var def = 0; ['helm','armor','boot','glove','cloak','shirt'].forEach(s=>{ if(player.equip[s] && ITEMS[player.equip[s].key]) def += (ITEMS[player.equip[s].key].def||0)+(player.equip[s].en||0); }); 
    var displayDef = Math.floor(stats.dex/3) + def; 
    if (player.buffs.solid_carriage) { var k2Lv = player.skillLevels['k2'] || 1; displayDef += (15 + (k2Lv * 5)); } 
    var displayAtk = stats.str + wAtk; 
    var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; 
    if (player.class === 'elf' || isBow) { displayAtk = stats.dex + wAtk; } 
    document.getElementById('st-atk').innerText = displayAtk; 
    document.getElementById('st-def').innerText = displayDef; 
    var hudStats = document.getElementById('hud-stats'); 
    if(!hudStats) { hudStats = document.createElement('span'); hudStats.id='hud-stats'; hudStats.style.cssText='font-size:12px; color:#aaa; margin-left:10px;'; document.getElementById('hud-top-left').appendChild(hudStats); } 
    hudStats.innerHTML = `⚔️ ${displayAtk} 🛡️ ${displayDef}`; 
    updateHotkeys(); 
}

function renderInv() { 
    var d = document.getElementById('inv-list'); d.innerHTML=""; 
    if(enchantMode) { 
        var sc = player.inventory[enchantScroll.idx]; 
        if(!sc || sc.count <= 0) { enchantMode = false; updateUI(); return; } 
        d.innerHTML = `<div style="background:#040;color:#0f0;padding:5px;display:flex;justify-content:space-between;align-items:center;"><span>強化中: ${ITEMS[sc.key].name}</span><button class="glass-btn" onclick="enchantMode=false;renderInv()">取消</button></div>`; 
    } 
    player.inventory.forEach((item, idx) => { 
        if (!ITEMS[item.key]) return; 
        var i=ITEMS[item.key]; 
        var canEnchant = false; 
        if (enchantMode && i.type === 'equip') { 
            if (enchantScroll.target === 'armor_all') { canEnchant = ['helm','armor','boot','glove','cloak','shirt','neck'].includes(i.slot); } 
            else { canEnchant = i.slot === enchantScroll.target; } 
        } 
        var actBtn = enchantMode ? (canEnchant ? `<button class="glass-btn btn-plus" onclick="doEnchantInv(${idx})">強化</button>` : '') : `<button class="glass-btn" onclick="useItemIdx(${idx})">${i.type==='equip'?'裝備':'使用'}</button>`; 
        actBtn += `<button class="glass-btn" onclick="openAssign(${idx})">設</button>`; 
        var row = `<div class="item-row"><div style="display:flex;align-items:center;" onclick="showItemInfo(${idx})"><div class="item-icon">${i.icon}</div><div>${i.name} ${item.en>0?'+'+item.en:''} x${item.count}</div></div><div>${actBtn}</div></div>`; 
        d.appendChild(document.createRange().createContextualFragment(row)); 
    }); 
}

function performEnchant(scrollItem, targetItem, scrollIdx) { 
    if(scrollItem.count > 0) { 
        if(scrollItem.count > 1) scrollItem.count--; else { player.inventory.splice(scrollIdx, 1); enchantMode = false; } 
        targetItem.en = (targetItem.en || 0) + 1; 
        AudioSys.sfx('enchant'); logMsg("強化成功! +" + targetItem.en, "#0ff"); 
        renderInv(); updateUI(); saveGame(); 
    } else { enchantMode = false; renderInv(); } 
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
    var shakeX = (Math.random()-0.5) * screenShake; var shakeY = (Math.random()-0.5) * screenShake; if(screenShake>0) screenShake*=0.9;
    ctx.save(); ctx.translate(-player.x + W/2 + shakeX, -player.y + H/2 + shakeY); 
    if(groundCanvas) { ctx.fillStyle = ctx.createPattern(groundCanvas, 'repeat'); ctx.fillRect(player.x-W/2, player.y-H/2, W, H); }
    if(player.showRange) { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; if(isBow || player.class === 'elf') { ctx.save(); ctx.translate(player.x, player.y); ctx.scale(1, 0.6); ctx.beginPath(); ctx.arc(0, 0, 400, 0, Math.PI*2); ctx.setLineDash([10, 10]); ctx.strokeStyle = "rgba(255, 255, 100, 0.3)"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); } }
    var renderList = [...entities, ...player.pets, player, ...envProps.filter(e=>Math.abs(e.x-player.x)<W && Math.abs(e.y-player.y)<H)]; renderList.sort((a,b)=>a.y-b.y);
    renderList.forEach(e => {
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
        
        // [Fix Visual v77.87] 衝擊之暈：Canvas 繪製旋轉金星
        if (e.stunTimer && Date.now() < e.stunTimer) { 
            ctx.save();
            // 自動計算高度：根據怪物圖片高度，若無圖片則用預設值，再往上偏移
            var mobH = (img && img.complete) ? img.height * (e.scale||1) : 120;
            var stunY = sy - mobH - 20; 
            ctx.translate(sx, stunY); // 移動到頭頂
            
            // 旋轉動畫
            var rot = (Date.now() / 5) % 360; 
            ctx.rotate(rot * Math.PI / 180);
            
            // 繪製五角星
            ctx.beginPath();
            var spikes = 5; var outerRadius = 30; var innerRadius = 15;
            // 脈衝縮放
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
            ctx.strokeStyle = '#fff'; // 白邊
            ctx.stroke();
            ctx.fillStyle = '#ffd700'; // 金色填充
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fff'; // 強力白光
            ctx.fill();
            ctx.restore();
        }

        if(e!==player && !e.key) { var barH = 120; if(img && img.complete) barH = img.height * (e.scale||1); var barY = sy - barH + 10; ctx.fillStyle = "#300"; ctx.fillRect(sx-20, barY, 40, 4); ctx.fillStyle = "#f00"; ctx.fillRect(sx-20, barY, 40*(e.hp/e.maxHp), 4); ctx.font="10px sans-serif"; ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.shadowColor="black"; ctx.shadowBlur=2; ctx.fillText(e.name, sx, barY-5); ctx.shadowBlur=0; }
        if (player.target === e) { ctx.strokeStyle = "rgba(255, 50, 50, 0.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy - 20, 40, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx-50, sy-20); ctx.lineTo(sx-30, sy-20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx+30, sy-20); ctx.lineTo(sx+50, sy-20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx, sy-70); ctx.lineTo(sx, sy-50); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx, sy+10); ctx.lineTo(sx, sy+30); ctx.stroke(); }
    });
    
    portals.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); var t = Date.now() / 500; var scale = 1 + Math.sin(t) * 0.1; var g = ctx.createRadialGradient(0,0,10,0,0,p.r); g.addColorStop(0, 'rgba(255, 50, 50, 0.8)'); g.addColorStop(1, 'rgba(255, 0, 0, 0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,p.r*scale,0,Math.PI*2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255, 100, 100, 0.9)`; ctx.beginPath(); ctx.arc(0, 0, p.r*0.8, 0, Math.PI * 2); ctx.stroke(); ctx.rotate(t); ctx.strokeStyle = `rgba(255, 200, 200, 0.7)`; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 1.5); ctx.stroke(); ctx.rotate(-t*2); ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("傳送點", 0, -p.r - 10); ctx.restore(); var dx = p.x - player.x; var dy = p.y - player.y; var dist = Math.sqrt(dx*dx + dy*dy); if(dist > 300) { var angle = Math.atan2(dy, dx); var arrowDist = Math.min(W/2, H/2) - 80; var ax = player.x + Math.cos(angle) * arrowDist; var ay = player.y + Math.sin(angle) * arrowDist; ctx.save(); ctx.translate(ax, ay); ctx.rotate(angle + Math.PI/2); var pScale = 1 + Math.sin(Date.now()/200)*0.2; ctx.scale(pScale, pScale); ctx.fillStyle = "rgba(255, 50, 50, 0.9)"; ctx.shadowColor = "#f00"; ctx.shadowBlur = 15; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, 10); ctx.lineTo(0, 5); ctx.lineTo(-15, 10); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); } });
    
    for(let i=projectiles.length-1; i>=0; i--) { 
        let p = projectiles[i]; let pdx = p.tx - p.x; let pdy = p.ty - p.y; let pd = Math.sqrt(pdx*pdx + pdy*pdy); 
        if(pd < p.spd) { 
            if(p.target) hit(p.target); 
            if (p.type === 'fireball') {
                var explosionRange = 300;
                addVisualEffect(p.x, p.y, 'effect_fire_area', 600, 1.5); 
                AudioSys.sfx('fireball');
                entities.forEach(e => { if (e !== p.target && Math.hypot(e.x - p.x, e.y - p.y) < explosionRange) { hit(e, player.int * 1.5); addPart(e.x, e.y, '#f40', 10); } });
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
    ctx.save(); ctx.translate(-player.x + W/2, -player.y + H/2); texts.forEach(t => { ctx.font="bold 16px sans-serif"; ctx.fillStyle=t.c; ctx.fillText(t.txt, t.x, t.y); t.y-=1; t.life--; }); texts=texts.filter(t=>t.life>0); ctx.restore();
    mCtx.fillStyle="#000"; mCtx.fillRect(0,0,130,130); var drawMiniDot = (tx, ty, color, isPortal=false) => { var dx = tx - player.x; var dy = ty - player.y; var dist = Math.sqrt(dx*dx + dy*dy); var mapScale = 0.06; var mx, my; if (dist * mapScale < 60) { mx = dx * mapScale + 65; my = dy * mapScale + 65; } else if (isPortal) { var angle = Math.atan2(dy, dx); mx = 65 + Math.cos(angle) * 60; my = 65 + Math.sin(angle) * 60; } else { return; } mCtx.fillStyle = color; if (isPortal) { mCtx.beginPath(); mCtx.arc(mx, my, 4, 0, Math.PI*2); mCtx.fill(); } else { mCtx.fillRect(mx, my, 2, 2); } }; entities.forEach(e=>{ drawMiniDot(e.x, e.y, "#f00"); }); player.pets.forEach(p=>{ drawMiniDot(p.x, p.y, "#0af"); }); portals.forEach(p=>{ drawMiniDot(p.x, p.y, "#0ff", true); }); mCtx.fillStyle="#fff"; mCtx.fillRect(63,63,4,4); 
    var cursorSet = false; if (gameState === 'PLAY' && hoverTarget) { var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; var dist = Math.hypot(hoverTarget.x - player.x, hoverTarget.y - player.y); if (isBow && dist <= 400) { cvs.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><text y=\"20\" font-size=\"20\">🏹</text></svg>'), auto"; cursorSet = true; } else { cvs.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><text y=\"20\" font-size=\"20\">⚔️</text></svg>'), auto"; cursorSet = true; } } if (!cursorSet) cvs.style.cursor = "default";
}

function loop() { if(gameState==='PLAY'){update();} requestAnimationFrame(loop); }

// --- UI 事件處理 ---
function showItemInfo(idx) { var item = player.inventory[idx]; document.getElementById('inv-info').innerText = ITEMS[item.key].desc; } 
function showItemInfoShop(key) { var el = document.getElementById('shop-info'); if(el && ITEMS[key]) el.innerText = ITEMS[key].desc; }
function unequip(slot) { var item = player.equip[slot]; if(item) { delete player.equip[slot]; player.inventory.push(item); updateUI(); updateStatsUI(); renderInv(); } }
function updateStatsUI() { ['helm','neck','shirt','armor','cloak','weapon','glove','boot'].forEach(s => { var el = document.getElementById('slot-'+s); if(player.equip[s]) { el.classList.add('filled'); el.innerHTML = `<div style="font-size:24px">${ITEMS[player.equip[s].key].icon}</div><div class="pd-lbl" style="color:#0f0">+${player.equip[s].en||0} ${ITEMS[player.equip[s].key].name}</div>`; } else { el.classList.remove('filled'); var slotNames = { 'helm':'頭盔', 'neck':'項鍊', 'shirt':'內衣', 'armor':'盔甲', 'cloak':'斗篷', 'weapon':'武器', 'glove':'手套', 'boot':'靴子' }; el.innerHTML = `<div class="pd-lbl">${slotNames[s]}</div>`; } }); }
function openAssign(k) { pendingAssign=k; document.getElementById('assign-modal').style.display='flex'; } 
function bindHotkey(i) { hotkeys[i] = typeof pendingAssign==='number'?player.inventory[pendingAssign]:pendingAssign; updateHotkeys(); document.getElementById('assign-modal').style.display='none'; } 
function assignHotkey(i) { useHotkey(i); } 
function updateHotkeys() { for(let i=0;i<10;i++) { var v=hotkeys[i]; var el=document.getElementById('hk-'+i); var qt=document.getElementById('qt-'+i); if (v) { if (v.key) { el.innerText = ITEMS[v.key].icon; var invItem = player.inventory.find(it => it.key === v.key); qt.innerText = invItem ? invItem.count : 0; } else { el.innerText = SKILLS[v].icon; qt.innerText = ''; } } else { el.innerText = ''; qt.innerText = ''; } } }
window.addEventListener('keydown', e=>{ var k=parseInt(e.key); if(k>=0&&k<=9) useHotkey(k===0?9:k-1); });

function useHotkey(i) { 
    var v=hotkeys[i]; if(!v)return; 
    if(v.key) useItemByKey(v.key); 
    else if(typeof v === 'string') { 
        var s=SKILLS[v]; if(!s) return; 
        var now = Date.now(); 
        var cd = player.skillCD[v] || 0; 
        if (now < cd) { logMsg("技能冷卻中...", "#888"); return; } 
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
                    AudioSys.sfx('magic'); 
                    var dmg = player.int * 3.5; 
                    hit(t, dmg); 
                    addVisualEffect(t.x, t.y, 'effect_fire_area', 500, 2.0);
                    addPart(t.x, t.y, '#f00', 30); 
                    addFloat(t.x, t.y-20, "💥", "#f00", 30); 
                    logMsg("烈炎術!", "#f44"); updateUI(); 
                } 
                else logMsg("MP 不足", "#f00"); 
            } else logMsg("無目標", "#f00"); return; 
        } 
        if (s.name === '火風暴') { 
            if(player.mp >= s.mp) { 
                player.mp -= s.mp; setCD(2000); AudioSys.sfx('fire_storm'); 
                addVisualEffect(player.x, player.y, 'effect_fire_storm', 2000, 3.5);
                groundEffects.push({
                    x: player.x,
                    y: player.y,
                    type: 'fire_storm',
                    startTime: now,
                    duration: 2000,     
                    range: 350,         
                    dmg: player.int * 1.5, 
                    tickInterval: 500,  
                    lastTick: 0
                });
                logMsg("火風暴! 地面持續燃燒", "#f80"); updateUI(); 
            } 
            else logMsg("MP 不足", "#f00"); return; 
        } 
        if (s.name === '靈魂昇華') { 
            if(player.mp >= s.mp) { if (player.buffs['soul_elevation']) { logMsg("已有效果", "#aaa"); return; } player.mp -= s.mp; player.buffs['soul_elevation'] = now + s.duration; player.maxHp = Math.floor(player.baseMaxHp * 1.3); player.maxMp = Math.floor(player.baseMaxMp * 1.3); player.hp = Math.min(player.hp + (player.maxHp - player.baseMaxHp), player.maxHp); AudioSys.sfx('magic'); addPart(player.x, player.y, '#fff', 30); logMsg("靈魂昇華!", "#fff"); updateUI(); } 
            else logMsg("MP 不足", "#f00"); return; 
        } 
        if (s.name === '召喚術') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; setCD(3000); AudioSys.sfx('magic'); var count = Math.floor(player.int / 8) + 1; if (count > 3) count = 3; summonPet(count); updateUI(); } 
            else logMsg("MP 不足", "#f00"); return; 
        } 
        if(s.name === '衝擊之暈') { 
            if(t && t.hp > 0 && Math.hypot(t.x-player.x, t.y-player.y) < 600) { if(player.mp >= s.mp) { player.mp -= s.mp; hit(t, 0, 'stun'); setCD(2000); AudioSys.sfx('click'); updateUI(); } else { logMsg("MP 不足!", "#00f"); } } 
            else { logMsg("無目標或距離太遠", "#f00"); } return; 
        } 
        if(s.name === '增幅防禦') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs['solid_carriage'] = Date.now() + s.duration; AudioSys.sfx('magic_def'); logMsg("增幅防禦!", "#aaa"); updateUI(); addPart(player.x, player.y, '#888', 10); } return; 
        } 
        if(s.name === '反擊屏障') { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs['counter_barrier'] = Date.now() + s.duration; AudioSys.sfx('magic_atk'); logMsg("反擊屏障!", "#fff"); updateUI(); addPart(player.x, player.y, '#fff', 15); } return; 
        } 
        if(s.name === '聖結界') {
             if(player.mp >= s.mp) { 
                 player.mp -= s.mp; 
                 player.buffs['immune_to_harm'] = Date.now() + s.duration; 
                 AudioSys.sfx('magic_def'); 
                 logMsg("聖結界! 傷害減半", "#fff"); 
                 updateUI(); 
                 addPart(player.x, player.y, '#fff', 20); 
             } else { logMsg("MP 不足!", "#00f"); }
             return;
        }

        if(s.buff) { 
            if(player.mp >= s.mp) { player.mp -= s.mp; player.buffs[s.buff] = Date.now() + s.duration; AudioSys.sfx('magic'); logMsg("施放: " + s.name, "#0f0"); addPart(player.x, player.y, '#0f0', 10); updateUI(); } else { logMsg("MP 不足!", "#00f"); } 
        } else if(s.name==='魂體轉換') { 
            if (player.hp > 50) { player.hp -= 50; player.mp = Math.min(player.maxMp, player.mp + 20); addPart(player.x, player.y, '#aaf', 5); AudioSys.sfx('magic'); logMsg("魂體轉換", "#aaf"); updateUI(); } 
        } else if(s.name === '三重矢') { 
            if(t && t.hp > 0 && Math.hypot(t.x-player.x, t.y-player.y) < 600) { if(player.mp >= s.mp) { player.mp -= s.mp; setCD(800); for(let k=0; k<3; k++) setTimeout(()=> { projectiles.push({x:player.x, y:player.y-20, tx:t.x, ty:t.y-20, spd:20, target:t, color:'#fff', type:'arrow_triple'}); }, k*100); AudioSys.sfx('click'); } } 
        } else if(player.mp>=s.mp) { 
            if(s.name === '流星雨') { 
                player.mp -= s.mp; 
                AudioSys.sfx('meteor'); 
                screenShake = 20; 
                setCD(12000); 
                for (let i = entities.length - 1; i >= 0; i--) { if (!e.isFakePlayer && Math.hypot(e.x - player.x, e.y - player.y) < Math.max(W, H)) { hit(e, player.int * 8); } }
                for(let i=0; i<6; i++) {
                    let rx = player.x + (Math.random()-0.5)*W*0.8;
                    let ry = player.y + (Math.random()-0.5)*H*0.8;
                    setTimeout(() => { addVisualEffect(rx, ry, 'effect_meteor_rain', 800, 3.0); screenShake += 8; }, i * 200);
                }
                logMsg("流星雨! 毀滅降臨", "#f00"); updateUI();
            } else if(s.name.includes('治癒')) { 
                // [Update] 治癒術數值修正: 加入 INT 加成
                player.mp-=s.mp; 
                
                var baseAmt = 30; // 初級預設
                var intMulti = 2; // 初級 INT 係數
                
                if(s.name.includes('中級')) { baseAmt = 70; intMulti = 3; }
                if(s.name.includes('高級')) { baseAmt = 150; intMulti = 5; }
                
                // 公式: 基礎值 + (智力 * 係數)
                var healAmt = Math.floor(baseAmt + (player.int * intMulti));
                
                player.hp = Math.min(player.maxHp, player.hp + healAmt); 
                addPart(player.x, player.y, '#fff', 10); 
                AudioSys.sfx('magic'); 
                addFloat(player.x, player.y-40, "+"+healAmt, "#0f0", 30);
                
            } else if(t && t.hp>0) { 
                var d = Math.hypot(t.x-player.x, t.y-player.y); 
                if(d <= 850) { 
                    player.mp-=s.mp; AudioSys.sfx('click'); setCD(s.name==='光箭' ? 500 : 1000); 
                    var magicMult = player.buffs.wisdom ? 2 : 1; var dmg = player.int * 1.5 * magicMult; 
                    if (s.name === '火球術') { hit(t, dmg); for(let i=0; i<360; i+=15) { let rad = i * (Math.PI/180); let px = t.x + Math.cos(rad) * 100; let py = t.y + Math.sin(rad) * 100; addPart(px, py, '#f40', 1); } addPart(t.x, t.y, '#f40', 30); } else hit(t, dmg); 
                    var projColor = s.name === '火球術' ? '#ff4400' : '#00ffff'; var projType = s.name === '火球術' ? 'fireball' : 'magic_arrow';
                    projectiles.push({x:player.x, y:player.y-20, tx:t.x, ty:t.y-20, spd:15, target:t, color:projColor, type:projType}); 
                } 
            } 
        } 
    } 
}

function openTeleportMenu() { var d=document.getElementById('tele-list'); d.innerHTML=""; Object.keys(MAPS).forEach(k=>{ var b=document.createElement('button'); b.className='glass-btn'; b.style.width='100%'; b.innerText=MAPS[k].name; b.onclick=()=>teleport(k); d.appendChild(b); }); document.getElementById('teleport-menu').style.display='block'; } 
function teleport(id) { document.getElementById('teleport-menu').style.display='none'; document.getElementById('win-guide').style.display='none'; document.getElementById('win-map').style.display='none'; if (typeof closeTeleport === 'function') closeTeleport(); initMap(id); if(portals.length > 0) { player.x = portals[0].x + 80; player.y = portals[0].y + 80; } else { player.x=0; player.y=0; } player.tx = player.x; player.ty = player.y; player.lastPortalTime = Date.now() + 2000; } 
function closeTeleport() { document.getElementById('teleport-menu').style.display='none'; }
function updateSkillsUI() { var d = document.getElementById('skill-tree-list'); d.innerHTML=""; document.getElementById('sp-pts').innerText = player.skillPoints; var sortedKeys = Object.keys(SKILLS).sort((a,b) => SKILLS[a].lv - SKILLS[b].lv); sortedKeys.forEach(k => { if(SKILLS[k].class !== player.class) return; var s = SKILLS[k]; var learnt = player.skills.includes(k); var lv = player.skillLevels[k] || 1; var btn = learnt ? `<button class="glass-btn" onclick="openAssign('${k}')">設</button>` : (player.lvl >= s.lv ? `<button class="glass-btn" onclick="learnSkill('${k}')">學習</button>` : `<span style="color:#666">Lv.${s.lv}</span>`); if(learnt && player.skillPoints > 0) btn += `<button class="glass-btn btn-plus" onclick="upgradeSkill('${k}')">升</button>`; d.innerHTML += `<div class="item-row"><div>${s.icon} ${s.name} <span style="font-size:10px;color:#0ff">Lv.${lv}</span></div><div>${btn}</div></div>`; }); } 
function learnSkill(k) { if(player.skillPoints>0){player.skillPoints--; player.skills.push(k); player.skillLevels[k]=1; updateSkillsUI(); AudioSys.sfx('enchant'); saveGame();} } 
function upgradeSkill(k) { if(player.skillPoints>0){player.skillPoints--; player.skills.push(k); player.skillLevels[k]++; updateSkillsUI(); AudioSys.sfx('enchant'); saveGame();} }
function toggleAutoSellKey(key) { if(!player.autoSellKeys) player.autoSellKeys = []; var idx = player.autoSellKeys.indexOf(key); if(idx > -1) player.autoSellKeys.splice(idx, 1); else player.autoSellKeys.push(key); renderAutoSell(); saveGame(); } 
function renderAutoSell() { var d = document.getElementById('autosell-list'); d.innerHTML = ""; Object.keys(ITEMS).forEach(k => { var i = ITEMS[k]; if (i.price > 0) { var checked = player.autoSellKeys && player.autoSellKeys.includes(k) ? "checked" : ""; d.innerHTML += `<div class="item-row"><div style="display:flex;align-items:center;"><div class="item-icon">${i.icon}</div><div style="font-size:12px;">${i.name}</div></div><div><input type="checkbox" class="as-cb" onchange="toggleAutoSellKey('${k}')" ${checked}></div></div>`; } }); }
function toggleWin(id) { ['inv','shop','stats','skills','settings','autosell','map','guide'].forEach(k=>{ if(k!==id) document.getElementById('win-'+k).style.display='none'; }); var w=document.getElementById('win-'+id); if(!w) return; w.style.display = w.style.display==='flex'?'none':'flex'; if(id==='inv') renderInv(); if(id==='shop') renderShop(); if(id==='stats') updateStatsUI(); if(id==='skills') updateSkillsUI(); if(id==='autosell') renderAutoSell(); if(id==='guide') renderGuide(); } 
function setShopTab(t) { shopTab=t; renderShop(); } 
function renderShop() { 
    var d=document.getElementById('shop-list'); 
    var scrollTop = d.scrollTop; 
    d.innerHTML=""; 
    if(shopTab==='buy') { 
        Object.keys(ITEMS).forEach(k=>{ 
            var i=ITEMS[k]; 
            if(i.price && i.buyable !== false) { 
                var btn = `<button class="glass-btn" onclick="buy('${k}',1)">買</button>`; 
                if(i.stackable) btn += `<button class="glass-btn btn-buy-10" onclick="buy('${k}',10)">買10</button>`; 
                d.innerHTML += `<div class="item-row"><div style="display:flex;align-items:center;cursor:pointer;flex-grow:1;overflow:hidden;" onclick="showItemInfoShop('${k}')"><div class="item-icon">${i.icon}</div><div style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;">${i.name}</div></div><div style="flex-shrink:0;">$${i.price} ${btn}</div></div>`; 
            } 
        }); 
    } else { 
        player.inventory.forEach((item,idx)=>{ 
            var i=ITEMS[item.key]; 
            var p=Math.floor(i.price*0.2); 
            d.innerHTML+=`<div class="item-row"><div>${i.icon} ${i.name} x${item.count}</div><div>$${p} <button class="glass-btn" onclick="sell(${idx})">賣</button></div></div>`; 
        }); 
    } 
    document.getElementById('shop-gold').innerText = Math.floor(player.gold); 
    d.scrollTop = scrollTop; 
} 
function buy(k,n) { var p=ITEMS[k].price*n; if(player.gold>=p) { player.gold-=p; addItem(k,n); renderShop(); AudioSys.sfx('buy'); } } 
function sell(i) { var it=player.inventory[i]; player.gold+=Math.floor(ITEMS[it.key].price*0.2); if(it.count>1)it.count--;else player.inventory.splice(i,1); renderShop(); AudioSys.sfx('buy'); }
function logMsg(t,c) { var d=document.getElementById('msg-log'); d.innerHTML+=`<div style="color:${c}">${t}</div>`; d.scrollTop=d.scrollHeight; } 
function addFloat(x,y,t,c,l) { texts.push({x:x,y:y,txt:t,c:c,life:l||40}); } 
function addPart(x,y,c,n) { for(let i=0;i<n;i++) particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,c:c,life:20}); } 
function showDeathModal() { var dropExp = Math.floor(player.nextExp * 0.1); player.exp=Math.max(0, player.exp-dropExp); player.hp=player.maxHp; player.x=0; player.y=0; currentMapId=0; var m = document.createElement('div'); m.id='death-modal'; m.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#d00;"; m.innerHTML=`<h1>YOU DIED</h1><div>EXP -${dropExp}</div><button class="glass-btn" onclick="document.getElementById('death-modal').remove();initMap(0);saveGame();gameState='PLAY';">重生</button>`; document.body.appendChild(m); gameState='DEAD'; } 
function addStat(s) { if(player.points > 0) { player.points--; player[s]++; updateUI(); saveGame(); AudioSys.sfx('click'); } }

// [Update] 設定更新函式擴充 (接收來自 index.html 的輸入)
function updateSettings(val, type) { 
    if(type==='hp') { player.autoPotLimit = val; document.getElementById('pot-val').innerText = val; } 
    if(type==='type') player.autoPotType = val; 
    
    // Auto Buffs Logic
    if(type.startsWith('auto_')) { 
        var k=type.replace('auto_',''); 
        player.autoBuffs[k]=val; 
    } 
    
    // Auto B2M Logic
    if(type.includes('b2m')) { if(type==='auto_b2m') player.autoB2M=val; if(type==='b2m_hp') player.autoB2M_HP=val; if(type==='b2m_mp') player.autoB2M_MP=val; } 
    
    // Auto Heal Logic
    if(type.includes('heal')) { if(type==='auto_heal_skill') player.autoHealSkill=val; if(type==='auto_heal_val') player.autoHealVal=val; if(type==='auto_heal_mp_limit') player.autoHealMpLimit=val; } 
    
    // Mage Auto Logic (New)
    if(type === 'auto_immune_to_harm') player.autoBuffs.immune_to_harm = val;
    if(type === 'immune_mp_limit') player.autoImmuneMpLimit = val;
    if(type === 'auto_soul_elevation') player.autoBuffs.soul_elevation = val;
    if(type === 'soul_mp_limit') player.autoSoulMpLimit = val;

    if(type.includes('limit')) { if(type==='fire_mp_limit') player.autoFireMp=val; if(type==='wind_mp_limit') player.autoWindMp=val; if(type==='storm_mp_limit') player.autoStormMp=val; } 
    if(type === 'show_range') { player.showRange = val; } 
}

cvs.addEventListener('mousemove', e=>{ if(gameState!=='PLAY') return; var rect = cvs.getBoundingClientRect(); mouseX = e.clientX - rect.left - W/2 + player.x; mouseY = e.clientY - rect.top - H/2 + player.y; hoverTarget = null; entities.forEach(e => { if(Math.hypot(e.x - mouseX, e.y - mouseY)<60 && !e.isFakePlayer) hoverTarget=e; }); });
cvs.addEventListener('mousedown', e=>{ 
    if(gameState!=='PLAY') return; 
    var move = true; 
    if(hoverTarget) { 
        player.target = hoverTarget; 
        player.manualTarget = true; 
        var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; 
        var range = isBow ? 400 : 60; 
        var d = Math.hypot(hoverTarget.x - player.x, hoverTarget.y - player.y); 
        var atkDelay = 600; if (player.class === 'mage') atkDelay = 800;
        if (player.lvl >= 52) atkDelay = 400; if (player.lvl >= 60) atkDelay = 350; if (player.lvl >= 70) atkDelay = 300; 
        if (player.buffs.haste) atkDelay = Math.floor(atkDelay * 0.75); if (player.buffs.brave) atkDelay = Math.floor(atkDelay * 0.66); if (player.buffs.wafer) atkDelay = Math.floor(atkDelay * 0.7); if (atkDelay < 150) atkDelay = 150;
        if (d <= range && Date.now() - player.atkTimer > atkDelay && hoverTarget.hp > 0) { 
            player.atkTimer = Date.now(); 
            if(isBow) { projectiles.push({x:player.x, y:player.y-20, tx:player.target.x, ty:player.target.y-20, spd:15, target:player.target, color:'#0f0'}); AudioSys.sfx('click'); } else { hit(player.target); if (player.target) { addPart(player.target.x, player.target.y, '#fff', 3); } } 
            move = false; player.tx = player.x; player.ty = player.y;
        } else if (d <= range) { move = false; player.tx = player.x; player.ty = player.y; }
    } else { player.forceMoveTimer = Date.now() + 800; player.manualTarget = false; player.autoCombatDelay = Date.now() + 1500; } 
    if(move) { player.tx = mouseX; player.ty = mouseY; } 
});
function renderGuide() { var d = document.getElementById('guide-content'); d.innerHTML = ""; var html = `<h3>🗺️ 掉落指南 (Drop Guide)</h3>`; Object.keys(MAPS).forEach(mid => { var map = MAPS[mid]; if(!map.mobs) return; var mapDrops = new Set(); map.mobs.forEach(mobKey => { var mob = MOB_TYPES[mobKey]; if(mob && mob.drops) { mob.drops.forEach(drop => { var item = ITEMS[drop.k]; if(item) mapDrops.add(item.name); }); } }); if(mapDrops.size > 0) { html += `<div style="background:#222; margin-bottom:5px; padding:5px; border:1px solid #444;"><div style="display:flex; justify-content:space-between; align-items:center;"><strong style=\"color:#da0\">${map.name}</strong><button class=\"glass-btn\" onclick=\"teleport(${mid})\">前往</button></div><div style=\"font-size:11px; color:#aaa; margin-top:3px;\">掉落: ${Array.from(mapDrops).join(', ')}</div></div>`; } }); d.innerHTML = html; }