/**
 * Lineage M v77.125 UI Module (Full Fix)
 * ---------------------------------------------------
 * [更新記錄 - v77.113_Hotfix]
 * 1. [緊急修復] 補回因縮寫導致遺失的所有核心函式 (toggleWin, renderShop, etc.)。
 * 2. [核心] 整合完整的 getItemTierClass() 階級判斷邏輯。
 * 3. [特效] 整合 injectRainbowStyles() 全色系光暈動畫。
 * ---------------------------------------------------
 */

// --- CSS 動態注入系統 (Style Injection) ---
function injectRainbowStyles() {
    var styleId = 'ui-injected-styles';
    if (document.getElementById(styleId)) return; 

    var css = `
        /* 1. 炎變系列 (Tier 7) - 七彩霓光動畫 */
        @keyframes neon-rainbow {
            0%   { border-color: #ff0000; box-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000 inset; }
            16%  { border-color: #ffff00; box-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00 inset; }
            33%  { border-color: #00ff00; box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00 inset; }
            50%  { border-color: #00ffff; box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff inset; }
            66%  { border-color: #0000ff; box-shadow: 0 0 5px #0000ff, 0 0 10px #0000ff inset; }
            83%  { border-color: #ff00ff; box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff inset; }
            100% { border-color: #ff0000; box-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000 inset; }
        }
        .tier-flame { animation: neon-rainbow 2s linear infinite; border-width: 2px !important; border-style: solid !important; }

        /* 2. 虛空系列 (Tier 6) - 紫色呼吸燈 */
        @keyframes pulse-purple {
            0% { border-color: #b0f; box-shadow: 0 0 3px #b0f; }
            50% { border-color: #d0f; box-shadow: 0 0 8px #d0f, 0 0 5px #d0f inset; }
            100% { border-color: #b0f; box-shadow: 0 0 3px #b0f; }
        }
        .tier-purple { border: 1px solid #b0f !important; color: #d0f !important; animation: pulse-purple 2s infinite; }

        /* 3. 鮮血系列 (Tier 5) - 紅色呼吸燈 */
        @keyframes pulse-red {
            0% { border-color: #f00; box-shadow: 0 0 3px #f00; }
            50% { border-color: #ff4444; box-shadow: 0 0 8px #ff4444, 0 0 5px #900 inset; }
            100% { border-color: #f00; box-shadow: 0 0 3px #f00; }
        }
        .tier-red { border: 1px solid #f00 !important; color: #ff5555 !important; animation: pulse-red 2s infinite; }

        /* 4. 幻影系列 (Tier 4) - 藍色恆亮 */
        .tier-blue { border: 1px solid #0af !important; color: #4df !important; box-shadow: 0 0 3px #0af; }

        /* 5. 翡翠系列 (Tier 3) - 綠色恆亮 */
        .tier-green { border: 1px solid #0f0 !important; color: #4f4 !important; }

        /* 6. 皇家系列 (Tier 2) - 黃色恆亮 */
        .tier-yellow { border: 1px solid #fd0 !important; color: #ff0 !important; }
        
        /* 7. 一般系列 (Tier 1) - 白色/灰色 */
        .tier-white { border: 1px solid #aaa !important; color: #eee !important; }
    `;

    var style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = css;
    document.head.appendChild(style);
    console.log('[UI] Rainbow & Tier Styles Injected');
}

// 立即注入樣式
injectRainbowStyles();

// --- 音效系統 (Audio System) ---
var AudioSys = { 
    ctx: null, 
    bgmNode: null,
    defaultAudio: null, 

    init: function() { 
        try { 
            window.AudioContext = window.AudioContext || window.webkitAudioContext; 
            if(window.AudioContext) { 
                if (!this.ctx) this.ctx = new AudioContext(); 
                if(this.ctx.state === 'suspended') this.ctx.resume(); 
            } 
            if (!this.defaultAudio) {
                this.defaultAudio = new Audio('lineage.mp3');
                this.defaultAudio.loop = true;
                this.defaultAudio.volume = 0.4;
            }
        } catch(e) { console.warn("Audio init failed:", e); } 
    }, 

    playDefault: function() {
        this.init();
        if (this.defaultAudio) {
            var playPromise = this.defaultAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => { console.log("自動播放預設音樂失敗:", error); });
            }
        }
    },

    playFile: function(file) { 
        if(!this.ctx) this.init(); 
        if(!file || !this.ctx) return; 
        if (this.defaultAudio) { this.defaultAudio.pause(); this.defaultAudio.currentTime = 0; }
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
        o.connect(g); g.connect(this.ctx.destination);

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

// --- 介面控制函式 (UI Control) ---
function resize(){ if(typeof cvs !== 'undefined') { W=window.innerWidth; H=window.innerHeight; cvs.width=W; cvs.height=H; } } 
window.addEventListener('resize',resize); 

function syncUISettings() {
    if (typeof player === 'undefined') return;
    var potVal = document.getElementById('pot-val'); if (potVal) potVal.innerText = player.autoPotLimit;
    var potRange = document.querySelector('input[oninput*="hp"]'); if (potRange) potRange.value = player.autoPotLimit;
    var potTypeSel = document.querySelector('select[onchange*="type"]'); if (potTypeSel && player.autoPotType) potTypeSel.value = player.autoPotType;
    var setCB = (id, val) => { var el = document.getElementById(id); if(el) el.checked = val; };
    if (player.autoBuffs) {
        setCB('cb_haste', player.autoBuffs.haste); setCB('cb_brave', player.autoBuffs.brave); setCB('cb_blue', player.autoBuffs.blue);
        setCB('cb_auto_solid', player.autoBuffs.solid_carriage); setCB('cb_auto_counter', player.autoBuffs.counter_barrier);
        setCB('cb_auto_fire', player.autoBuffs.fire); setCB('cb_auto_wind', player.autoBuffs.wind); setCB('cb_auto_storm', player.autoBuffs.storm);
        setCB('cb_auto_immune', player.autoBuffs.immune_to_harm); setCB('cb_auto_soul', player.autoBuffs.soul_elevation);
    }
    setCB('cb_auto_b2m', player.autoB2M);
    var setVal = (id, val) => { var el = document.getElementById(id); if(el) el.value = val; };
    setVal('b2m-hp-input', player.autoB2M_HP); setVal('b2m-mp-input', player.autoB2M_MP);
    setVal('fire-mp-limit', player.autoFireMp); setVal('wind-mp-limit', player.autoWindMp); setVal('storm-mp-limit', player.autoStormMp);
    setVal('immune-mp-limit', player.autoImmuneMpLimit); setVal('soul-mp-limit', player.autoSoulMpLimit);
    var healSel = document.querySelector('select[onchange*="auto_heal_skill"]'); if (healSel && player.autoHealSkill) healSel.value = player.autoHealSkill;
    var healInputs = document.querySelectorAll('input[onchange*="auto_heal"]');
    if (healInputs.length >= 2) { healInputs[0].value = player.autoHealVal; healInputs[1].value = player.autoHealMpLimit; }
    var rangeCB = document.querySelector('input[onchange*="show_range"]'); if(rangeCB) rangeCB.checked = player.showRange;
    updateHotkeys();
}

function updateAutoBtn() { 
    var btn = document.getElementById('btn-auto'); 
    if(btn && typeof player !== 'undefined') {
        btn.innerHTML = player.autoCombat ? "自動: ON" : "自動: OFF"; 
        if(!player.autoCombat) btn.classList.add('off'); else btn.classList.remove('off'); 
    }
}

function applyGMSettings() { 
    if(typeof GM_EXP_MULT === 'undefined') return;
    GM_EXP_MULT = parseFloat(document.getElementById('gm-exp').value); GM_GOLD_MULT = parseFloat(document.getElementById('gm-gold').value); 
    GM_SPAWN_MULT = parseInt(document.getElementById('gm-spawn').value); GM_DROP_MULT_USE = parseFloat(document.getElementById('gm-drop-use').value); 
    GM_DROP_MULT_EQUIP = parseFloat(document.getElementById('gm-drop-equip').value); GM_DROP_MULT_RARE = parseFloat(document.getElementById('gm-drop-rare').value); 
    document.getElementById('gm-console').style.display='none'; document.getElementById('start-screen').style.display='flex'; 
    document.getElementById('login-box-main').style.display='block'; logMsg("GM 模式已啟動 (EXP x" + GM_EXP_MULT + ")", "#f0f"); 
}

function updateUI() { 
    if(typeof player === 'undefined') return;
    document.getElementById('ui-lvl').innerText=player.lvl; 
    document.getElementById('ui-class').innerText=(player.class==='knight'?'騎士':(player.class==='elf'?'妖精':'法師')); 
    document.getElementById('bar-exp').style.width = Math.min(100, (player.exp / player.nextExp * 100)) + "%"; 
    document.getElementById('bar-hp').style.width = Math.min(100, (player.hp/player.maxHp*100))+"%"; 
    document.getElementById('txt-hp').innerText=Math.floor(player.hp)+"/"+Math.floor(player.maxHp); 
    document.getElementById('bar-mp').style.width = Math.min(100, (player.mp/player.maxMp*100))+"%"; 
    document.getElementById('txt-mp').innerText=Math.floor(player.mp)+"/"+Math.floor(player.maxMp); 
    document.getElementById('ui-gold').innerText=Math.floor(player.gold); 
    document.getElementById('st-pts').innerText=player.points; 
    var stats = getPlayerStats(); var fmt = (base, total) => total > base ? `${base} (+${total-base})` : base; 
    document.getElementById('st-str').innerText=fmt(player.str, stats.str); document.getElementById('st-dex').innerText=fmt(player.dex, stats.dex); 
    document.getElementById('st-con').innerText=fmt(player.con, stats.con); document.getElementById('st-int').innerText=fmt(player.int, stats.int); 
    var bb = document.getElementById('buff-bar'); bb.innerHTML = ''; var now = Date.now(); 
    for(var k in player.buffs) { 
        var s = Math.ceil((player.buffs[k]-now)/1000); var label = k.substr(0,2); 
        if(k==='haste') label='速'; if(k==='brave') label='勇'; if(k==='wafer') label='精'; if(k==='wisdom') label='慎'; 
        if(k==='blue_potion') label='魔'; if(k==='wind_shot') label='風'; if(k==='fire_weapon') label='火'; if(k==='storm_shot') label='暴'; 
        if(k==='solid_carriage') label='盾'; if(k==='counter_barrier') label='反'; if(k==='soul_elevation') label='昇'; if(k==='immune_to_harm') label='聖'; 
        bb.innerHTML+=`<div class="buff-icon"><div class="buff-name">${label}</div><div class="buff-time">${s}s</div></div>`; 
    } 
    var wAtk = player.equip.weapon ? (ITEMS[player.equip.weapon.key].atk + (player.equip.weapon.en||0)) : 0; 
    var displayDef = Math.floor(stats.dex/3) + stats.ac + stats.dmgReduc; 
    if (player.buffs.solid_carriage) { var k2Lv = player.skillLevels['k2'] || 1; displayDef += (15 + (k2Lv * 5)); } 
    var displayAtk = stats.str + wAtk; var isBow = player.equip.weapon && ITEMS[player.equip.weapon.key].icon === '🏹'; if (player.class === 'elf' || isBow) { displayAtk = stats.dex + wAtk; } 
    document.getElementById('st-atk').innerText = displayAtk; document.getElementById('st-def').innerText = displayDef; 
    var hudStats = document.getElementById('hud-stats'); if(!hudStats) { hudStats = document.createElement('span'); hudStats.id='hud-stats'; hudStats.style.cssText='font-size:12px; color:#aaa; margin-left:10px;'; document.getElementById('hud-top-left').appendChild(hudStats); } 
    hudStats.innerHTML = `⚔️ ${displayAtk} 🛡️ ${displayDef}`; 
    updateHotkeys(); 
}

// [UPDATED] 取得物品的階級 CSS Class
function getItemTierClass(key) {
    if (!ITEMS[key]) return '';
    var it = ITEMS[key];

    // 1. 神話武器 (Flame/Girtao)
    if (key.includes('flame') || key.includes('girtao')) return 'tier-flame';

    // 2. 套裝/系列優先判斷
    if (it.set) {
        if (it.set === 'set_void') return 'tier-purple';      // T6
        if (it.set === 'set_blood') return 'tier-red';        // T5
        if (it.set === 'set_phantom') return 'tier-blue';     // T4
        if (it.set === 'set_emerald') return 'tier-green';    // T3
        if (['set_royal', 'set_commander'].includes(it.set)) return 'tier-yellow'; // T2
        if (['set_soldier', 'set_mercenary', 'set_explorer', 'set_skeleton'].includes(it.set)) return 'tier-white'; // T1
    }

    // 3. 關鍵 Boss 飾品與單品判斷 (強制覆蓋)
    // T6 (Purple)
    if (['sword_void', 'armor_void', 'helm_void'].includes(key)) return 'tier-purple';
    
    // T5 (Red)
    if (['sword_blood', 'neck_brave', 'shirt_str', 'sword_wind', 'staff_crystal'].includes(key)) return 'tier-red';

    // T4 (Blue)
    if (['cloak_protect', 'shirt_elf', 'glove_stone', 'rapier'].includes(key)) return 'tier-blue';

    // T3 (Green)
    if (['cloak_mr', 'neck_str', 'neck_dex'].includes(key)) return 'tier-green';

    // T2 (Yellow)
    if (['zel_b', 'dai_b', 'sword_tsurugi', 'sword_royal', 'bow_royal', 'sword_great'].includes(key)) return 'tier-yellow';

    return 'tier-white';
}

function getItemColor(key) {
    if (!ITEMS[key]) return '#aaa'; 
    var c = getItemTierClass(key);
    if(c.includes('flame')) return '#f00';
    if(c.includes('purple')) return '#d0f';
    if(c.includes('red')) return '#f44';
    if(c.includes('blue')) return '#0bf';
    if(c.includes('green')) return '#0f0';
    if(c.includes('yellow')) return '#ffd700';
    return '#ccc';
}

function renderInv() { 
    var d = document.getElementById('inv-list'); d.innerHTML=""; 
    if(typeof enchantMode !== 'undefined' && enchantMode) { 
        var sc = player.inventory[enchantScroll.idx]; 
        if(!sc || sc.count <= 0) { enchantMode = false; updateUI(); return; } 
        d.innerHTML = `<div style="background:#040;color:#0f0;padding:5px;display:flex;justify-content:space-between;align-items:center;"><span>強化中: ${ITEMS[sc.key].name}</span><button class="glass-btn" onclick="enchantMode=false;renderInv()">取消</button></div>`; 
    } 
    player.inventory.forEach((item, idx) => { 
        if (!ITEMS[item.key]) return; 
        var i=ITEMS[item.key]; 
        var canEnchant = false; 
        if (typeof enchantMode !== 'undefined' && enchantMode && i.type === 'equip') { 
            if (enchantScroll.target === 'armor_all') { canEnchant = ['helm','armor','boot','glove','cloak','shirt','neck'].includes(i.slot); } 
            else { canEnchant = i.slot === enchantScroll.target; } 
        } 
        var actBtn = (typeof enchantMode !== 'undefined' && enchantMode) ? (canEnchant ? `<button class="glass-btn btn-plus" onclick="doEnchantInv(${idx})">強化</button>` : '') : `<button class="glass-btn" onclick="useItemIdx(${idx})">${i.type==='equip'?'裝備':'使用'}</button>`; 
        actBtn += `<button class="glass-btn" onclick="openAssign(${idx})">設</button>`; 
        var tierClass = getItemTierClass(item.key);
        var row = `<div class="item-row"><div style="display:flex;align-items:center;" onclick="showItemInfo(${idx})"><div class="item-icon ${tierClass}">${i.icon}</div><div>${i.name} ${item.en>0?'+'+item.en:''} x${item.count}</div></div><div>${actBtn}</div></div>`; 
        d.appendChild(document.createRange().createContextualFragment(row)); 
    }); 
}

function updateStatsUI() { 
    ['helm','neck','shirt','armor','cloak','weapon','glove','boot'].forEach(s => { 
        var el = document.getElementById('slot-'+s); 
        if(player.equip[s] && ITEMS[player.equip[s].key]) { 
            el.classList.add('filled'); 
            el.innerHTML = `<div style="font-size:24px">${ITEMS[player.equip[s].key].icon}</div><div class="pd-lbl" style="color:#0f0">+${player.equip[s].en||0} ${ITEMS[player.equip[s].key].name}</div>`; 
        } else { 
            el.classList.remove('filled'); 
            var slotNames = { 'helm':'頭盔', 'neck':'項鍊', 'shirt':'內衣', 'armor':'盔甲', 'cloak':'斗篷', 'weapon':'武器', 'glove':'手套', 'boot':'靴子' }; 
            el.innerHTML = `<div class="pd-lbl">${slotNames[s]}</div>`; 
        } 
    }); 
}

function showItemInfo(idx) { 
    var item = player.inventory[idx]; 
    if(ITEMS[item.key]) {
        var i = ITEMS[item.key]; var txt = i.desc;
        if (i.set && typeof SETS !== 'undefined' && SETS[i.set]) { txt += `\n✨ ${SETS[i.set].desc}`; }
        document.getElementById('inv-info').innerText = txt; 
    }
} 

function showItemInfoShop(key) { 
    var el = document.getElementById('shop-info'); 
    if(el && ITEMS[key]) {
        var i = ITEMS[key]; var txt = i.desc;
        if (i.set && typeof SETS !== 'undefined' && SETS[i.set]) { txt += `\n✨ ${SETS[i.set].desc}`; }
        el.innerText = txt; 
    }
}

function openAssign(k) { pendingAssign=k; document.getElementById('assign-modal').style.display='flex'; } 
function bindHotkey(i) { 
    hotkeys[i] = typeof pendingAssign==='number'?player.inventory[pendingAssign]:pendingAssign; 
    updateHotkeys(); document.getElementById('assign-modal').style.display='none'; 
    if(typeof saveGame === 'function') saveGame();
} 
function assignHotkey(i) { if(typeof useHotkey === 'function') useHotkey(i); } 

function updateHotkeys() { 
    for(let i=0;i<10;i++) { 
        var v=hotkeys[i]; var el=document.getElementById('hk-'+i); var qt=document.getElementById('qt-'+i); 
        if (v) { 
            if (v.key) { 
                if (ITEMS[v.key]) { el.innerText = ITEMS[v.key].icon; var invItem = player.inventory.find(it => it.key === v.key); qt.innerText = invItem ? invItem.count : 0; } else { el.innerText = '❓'; qt.innerText = ''; }
            } else if (typeof v === 'string') { 
                if (SKILLS[v]) { el.innerText = SKILLS[v].icon; qt.innerText = ''; } else { el.innerText = '❓'; qt.innerText = ''; }
            } 
        } else { el.innerText = ''; qt.innerText = ''; } 
    } 
}

function openTeleportMenu() { 
    var d=document.getElementById('tele-list'); d.innerHTML=""; 
    Object.keys(MAPS).forEach(k=>{ 
        var b=document.createElement('button'); b.className='glass-btn'; b.style.width='100%'; b.innerText=MAPS[k].name; 
        b.onclick=()=>teleport(k); d.appendChild(b); 
    }); 
    document.getElementById('teleport-menu').style.display='block'; 
} 
function closeTeleport() { document.getElementById('teleport-menu').style.display='none'; }

function updateSkillsUI() { 
    var d = document.getElementById('skill-tree-list'); d.innerHTML=""; 
    document.getElementById('sp-pts').innerText = player.skillPoints; 
    var sortedKeys = Object.keys(SKILLS).sort((a,b) => SKILLS[a].lv - SKILLS[b].lv); 
    sortedKeys.forEach(k => { 
        if(SKILLS[k].class !== player.class) return; 
        var s = SKILLS[k]; var learnt = player.skills.includes(k); var lv = player.skillLevels[k] || 1; 
        var btn = learnt ? `<button class="glass-btn" onclick="openAssign('${k}')">設</button>` : (player.lvl >= s.lv ? `<button class="glass-btn" onclick="learnSkill('${k}')">學習</button>` : `<span style="color:#666">Lv.${s.lv}</span>`); 
        if(learnt && player.skillPoints > 0) btn += `<button class="glass-btn btn-plus" onclick="upgradeSkill('${k}')">升</button>`; 
        d.innerHTML += `<div class="item-row"><div>${s.icon} ${s.name} <span style="font-size:10px;color:#0ff">Lv.${lv}</span></div><div>${btn}</div></div>`; 
    }); 
} 

function toggleAutoSellKey(key) { 
    if(!player.autoSellKeys) player.autoSellKeys = []; 
    var idx = player.autoSellKeys.indexOf(key); 
    if(idx > -1) player.autoSellKeys.splice(idx, 1); else player.autoSellKeys.push(key); 
    renderAutoSell(); saveGame(); 
} 

function renderAutoSell() { 
    var d = document.getElementById('autosell-list'); d.innerHTML = ""; 
    Object.keys(ITEMS).forEach(k => { 
        var i = ITEMS[k]; 
        if (i.price > 0) { 
            var checked = player.autoSellKeys && player.autoSellKeys.includes(k) ? "checked" : ""; 
            d.innerHTML += `<div class="item-row"><div style="display:flex;align-items:center;"><div class="item-icon">${i.icon}</div><div style="font-size:12px;">${i.name}</div></div><div><input type="checkbox" class="as-cb" onchange="toggleAutoSellKey('${k}')" ${checked}></div></div>`; 
        } 
    }); 
}

// [CRITICAL RESTORE] toggleWin 函式
function toggleWin(id) { 
    ['inv','shop','stats','skills','settings','autosell','map','guide'].forEach(k=>{ if(k!==id) document.getElementById('win-'+k).style.display='none'; }); 
    var w=document.getElementById('win-'+id); 
    if(!w) return; 
    w.style.display = w.style.display==='flex'?'none':'flex'; 
    if(id==='inv') renderInv(); 
    if(id==='shop') renderShop(); 
    if(id==='stats') updateStatsUI(); 
    if(id==='skills') updateSkillsUI(); 
    if(id==='autosell') renderAutoSell(); 
    if(id==='guide') renderGuide(); 
    if(id==='map') drawWorldMap();
} 

function drawWorldMap() {
    var canvas = document.getElementById('map-canvas'); if (!canvas) return;
    var ctx = canvas.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 600);
    var mapScale = 0.05; var centerX = 300; var centerY = 300; 
    Object.keys(MAPS).forEach(key => {
        var m = MAPS[key]; if (key === '0') return; 
        var x = centerX + (m.x * mapScale); var y = centerY + (m.y * mapScale);
        var w = (m.w || 100) * 1.5; var h = (m.h || 100) * 1.5;
        ctx.fillStyle = m.c1 || '#333'; ctx.fillRect(x - w/2, y - h/2, w, h);
        ctx.strokeStyle = '#fff'; ctx.strokeRect(x - w/2, y - h/2, w, h);
        ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m.name, x, y + 4);
        if (typeof currentMapId !== 'undefined' && currentMapId == key) { ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(x, y - 15, 5, 0, Math.PI * 2); ctx.fill(); }
    });
}

function initMapInteraction() {
    var canvas = document.getElementById('map-canvas'); if (!canvas) return;
    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect(); var mx = e.clientX - rect.left; var my = e.clientY - rect.top;
        var mapScale = 0.05; var centerX = 300; var centerY = 300; var clickedMapId = null;
        Object.keys(MAPS).forEach(key => {
            if (key === '0') return; var m = MAPS[key];
            var x = centerX + (m.x * mapScale); var y = centerY + (m.y * mapScale);
            var w = (m.w || 100) * 1.5; var h = (m.h || 100) * 1.5;
            if (mx >= x - w/2 && mx <= x + w/2 && my >= y - h/2 && my <= y + h/2) { clickedMapId = key; }
        });
        if (clickedMapId && typeof teleport === 'function') { teleport(clickedMapId); toggleWin('map'); }
    });
}

function setShopTab(t) { shopTab=t; renderShop(); } 

// [Modified] 商店過濾與顯示
function renderShop() { 
    var d=document.getElementById('shop-list'); var scrollTop = d.scrollTop; d.innerHTML=""; 
    if(shopTab==='buy') { 
        Object.keys(ITEMS).forEach(k=>{ 
            var i=ITEMS[k];
            var isFlameWeapon = k.includes('_flame_'); 
            var isDisplayOnly = false;
            if (i.set) isDisplayOnly = true;
            if (['sword_royal', 'bow_royal', 'sword_blood', 'sword_void'].includes(k)) isDisplayOnly = true;
            if (isFlameWeapon) isDisplayOnly = true;

            var shouldShow = false;
            if (i.price) { if (i.buyable !== false) shouldShow = true; if (isDisplayOnly) shouldShow = true; }

            if(shouldShow) { 
                var btnHtml = ''; var priceHtml = '';
                if (isDisplayOnly) {
                    priceHtml = `<span style="font-size:11px; color:#aaa; margin-right:5px;">[展示]</span>`;
                    btnHtml = `<button class="glass-btn" style="border-color:#444; color:#666; cursor:not-allowed; font-size:11px; padding:2px 6px;" disabled>非賣品</button>`;
                } else {
                    priceHtml = `<span style="font-size:11px; color:#ffd700; margin-right:5px;">$${i.price}</span>`;
                    btnHtml = `<button class="glass-btn" onclick="buy('${k}',1)" style="font-size:11px; padding:2px 6px;">買</button>`; 
                    if(i.stackable) btnHtml += `<button class="glass-btn btn-buy-10" onclick="buy('${k}',10)" style="font-size:11px; padding:2px 6px; margin-left:4px;">x10</button>`; 
                }
                var tierClass = getItemTierClass(k);
                d.innerHTML += `
                <div class="item-row" style="display:flex; align-items:center; justify-content:space-between; padding:5px;">
                    <div style="display:flex; align-items:center; flex:1; overflow:hidden; cursor:pointer;" onclick="showItemInfoShop('${k}')">
                        <div class="item-icon ${tierClass}" style="flex-shrink:0;">${i.icon}</div>
                        <div style="font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-left:5px; min-width:0; color:#ddd;">${i.name}</div>
                    </div>
                    <div style="display:flex; align-items:center; flex-shrink:0; margin-left:5px;">${priceHtml}${btnHtml}</div>
                </div>`; 
            } 
        }); 
    } else { 
        player.inventory.forEach((item,idx)=>{ 
            var i=ITEMS[item.key]; if (!i) return;
            var p=Math.floor(i.price*0.2); var tierClass = getItemTierClass(item.key);
            d.innerHTML += `
            <div class="item-row" style="display:flex; align-items:center; justify-content:space-between; padding:5px;">
                <div style="display:flex; align-items:center; flex:1; overflow:hidden; cursor:pointer;" onclick="showItemInfoShop('${item.key}')">
                    <div class="item-icon ${tierClass}" style="flex-shrink:0;">${i.icon}</div>
                    <div style="font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-left:5px; min-width:0; color:#ddd;">
                        ${i.name} <span style="color:#aaa;font-size:10px;">x${item.count}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; flex-shrink:0; margin-left:5px;">
                    <span style="font-size:11px; color:#aaa; margin-right:5px;">$${p}</span>
                    <button class="glass-btn" onclick="sell(${idx})" style="font-size:11px; padding:2px 6px;">賣</button>
                </div>
            </div>`; 
        }); 
    } 
    document.getElementById('shop-gold').innerText = Math.floor(player.gold); d.scrollTop = scrollTop; 
} 

function renderGuide() { 
    var d = document.getElementById('guide-content'); d.innerHTML = ""; 
    var html = `<h3>🗺️ 掉落指南 (Drop Guide)</h3>`; 
    Object.keys(MAPS).forEach(mid => { 
        var map = MAPS[mid]; if(!map.mobs) return; 
        var dropList = [];
        map.mobs.forEach(mobKey => { 
            var mob = MOB_TYPES[mobKey]; 
            if(mob && mob.drops) { 
                mob.drops.forEach(drop => { 
                    var item = ITEMS[drop.k]; 
                    if(item && !dropList.some(d => d.name === item.name)) {
                        dropList.push({ name: item.name, key: drop.k, color: getItemColor(drop.k) });
                    }
                }); 
            } 
        }); 
        if(dropList.length > 0) { 
            var dropHtml = dropList.map(d => `<span style="color:${d.color}">${d.name}</span>`).join(', ');
            html += `<div style="background:#222; margin-bottom:5px; padding:5px; border:1px solid #444;"><div style="display:flex; justify-content:space-between; align-items:center;"><strong style=\"color:#da0\">${map.name}</strong><button class=\"glass-btn\" onclick=\"teleport(${mid})\">前往</button></div><div style=\"font-size:11px; color:#aaa; margin-top:3px; line-height:1.4;\">掉落: ${dropHtml}</div></div>`; 
        } 
    }); 
    d.innerHTML = html; 
}

function logMsg(t,c) { var d=document.getElementById('msg-log'); if(d) { d.innerHTML+=`<div style="color:${c}">${t}</div>`; d.scrollTop=d.scrollHeight; } } 
function addFloat(x,y,t,c,l) { if(typeof texts !== 'undefined') { texts.push({x:x,y:y,txt:t,c:c,life:l||40}); } } 

function showDeathModal() { 
    var dropExp = Math.floor(player.nextExp * 0.1); 
    player.exp=Math.max(0, player.exp-dropExp); player.hp=player.maxHp; player.x=0; player.y=0; 
    if(typeof currentMapId !== 'undefined') currentMapId=0; 
    var m = document.createElement('div'); m.id='death-modal'; 
    m.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#d00;"; 
    m.innerHTML=`<h1>YOU DIED</h1><div>EXP -${dropExp}</div><button class="glass-btn" onclick="document.getElementById('death-modal').remove();initMap(0);saveGame();gameState='PLAY';">重生</button>`; 
    document.body.appendChild(m); gameState='DEAD'; 
}

function updateSettings(val, type) { 
    if(typeof player === 'undefined') return;
    if(type==='hp') { player.autoPotLimit = val; document.getElementById('pot-val').innerText = val; } 
    if(type==='type') player.autoPotType = val; 
    if(type.startsWith('auto_')) { var k=type.replace('auto_',''); player.autoBuffs[k]=val; } 
    if(type.includes('b2m')) { if(type==='auto_b2m') player.autoB2M=val; if(type==='b2m_hp') player.autoB2M_HP=val; if(type==='b2m_mp') player.autoB2M_MP=val; } 
    if(type.includes('heal')) { if(type==='auto_heal_skill') player.autoHealSkill=val; if(type==='auto_heal_val') player.autoHealVal=val; if(type==='auto_heal_mp_limit') player.autoHealMpLimit=val; } 
    if(type === 'auto_immune_to_harm') player.autoBuffs.immune_to_harm = val;
    if(type === 'immune_mp_limit') player.autoImmuneMpLimit = val;
    if(type === 'auto_soul_elevation') player.autoBuffs.soul_elevation = val;
    if(type === 'soul_mp_limit') player.autoSoulMpLimit = val;
    if(type.includes('limit')) { if(type==='fire_mp_limit') player.autoFireMp=val; if(type==='wind_mp_limit') player.autoWindMp=val; if(type==='storm_mp_limit') player.autoStormMp=val; } 
    if(type === 'show_range') { player.showRange = val; } 
    if(typeof saveGame === 'function') saveGame();
}

initMapInteraction();
console.log("UI Module Loaded (v77.113 Full Fix)");