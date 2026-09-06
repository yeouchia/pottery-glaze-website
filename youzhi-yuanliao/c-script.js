// ===================================================
// 全能陶瓷釉藥計算器 V31.0 (雙點定位版)
// 1. [Audio] 新增音效觸發指令 (在 forward 點擊與 wizard 完成時)。
// 2. [ShapeMap] 新增圖形對應：目標值前加 ◆(紅)，實際值前加 ●(黑)。
// 3. [BugFix] 修正 autoCalculateWeightForRow，加入主屬性判定。
// 4. [WordCopy] 導入隱形表格 HTML 複製技術。
// ===================================================

const OXIDE_MOL_WEIGHT = {
    'K2O': 94.20, 'Na2O': 61.98, 'CaO': 56.08, 'MgO': 40.31,
    'Li2O': 29.88, 'ZnO': 81.38, 'BaO': 153.33, 'SrO': 103.62,
    'PbO': 223.20, 'Al2O3': 101.96, 'Fe2O3': 159.69, 'Cr2O3': 152.00,
    'B2O3': 69.62, 'SiO2': 60.09, 'TiO2': 79.88, 'SnO2': 150.71,
    'ZrO2': 123.22, 'P2O5': 141.94
};

const RAW_MATERIALS = {
    '釜戶長石': { K2O: 0.0683, Na2O: 0.0524, CaO: 0.0059, MgO: 0.0001, Al2O3: 0.1659, Fe2O3: 0.0012, SiO2: 0.7026, LOI: 0.0000 },
    'A200': { K2O: 0.0460, Na2O: 0.0980, CaO: 0.0070, MgO: 0.0010, Al2O3: 0.2330, Fe2O3: 0.0007, SiO2: 0.6070, LOI: 0.0000 },
    '日化長石': { K2O: 0.0436, Na2O: 0.0339, CaO: 0.0032, MgO: 0.0001, Al2O3: 0.1262, Fe2O3: 0.0016, SiO2: 0.7814, LOI: 0.0000 },
    '澳洲鉀長石': { K2O: 0.1080, Na2O: 0.0370, Al2O3: 0.1880, SiO2: 0.6590, LOI: 0.0000 },
    '葉長石A38': { K2O: 0.0050, Na2O: 0.0060, CaO: 0.0030, MgO: 0.0010, Li2O: 0.0400, Al2O3: 0.1600, Fe2O3: 0.0010, SiO2: 0.7800, LOI: 0.0000 },
    '鋰輝石T38': { K2O: 0.0010, Na2O: 0.0040, CaO: 0.0020, MgO: 0.0010, Li2O: 0.0730, Al2O3: 0.2700, Fe2O3: 0.0030, SiO2: 0.6400, LOI: 0.0000 },
    
    '1124熔塊': { Na2O: 0.10, CaO: 0.07, ZnO: 0.085, Al2O3: 0.085, B2O3: 0.20, SiO2: 0.46 }, 
    '850鉛溶塊': { PbO: 0.845, SiO2: 0.155, LOI: 0.0000 }, 
    '合成土灰': { CaO: 0.359, MgO: 0.061, Al2O3: 0.027, P2O5: 0.027, SiO2: 0.174, LOI: 0.352 },
    '鈉硼酸鈣': { Na2O: 0.08, CaO: 0.20, B2O3: 0.40, SiO2: 0.32, LOI: 0.00 }, 
    'G2溶塊': { Na2O: 0.02, CaO: 0.15, B2O3: 0.05, SiO2: 0.78, LOI: 0.00 }, 
    '3110溶塊': { K2O: 0.0253, Na2O: 0.1521, CaO: 0.0624, Al2O3: 0.0352, SiO2: 0.6983, B2O3: 0.0267, LOI: 0.0000 }, 
    '3134熔塊': { K2O: 0.0000, Na2O: 0.1014, CaO: 0.1951, Al2O3: 0.0200, SiO2: 0.4546, B2O3: 0.2279, LOI: 0.0010 },

    '石灰石': { CaO: 0.5600, LOI: 0.4400 }, 
    '輕鈣': { CaO: 0.5600, LOI: 0.4400 }, 
    '碳酸鎂': { MgO: 0.4786, LOI: 0.5214 },
    '氧化鎂': { MgO: 1.0000, LOI: 0.0000 },
    '碳酸鋇': { BaO: 0.7767, LOI: 0.2233 },
    '鋅': { ZnO: 1.0000, LOI: 0.0000 }, 
    '碳酸鍶': { SrO: 0.7019, LOI: 0.2981 }, 
    '氧化鍶': { SrO: 1.0000, LOI: 0.0000 },
    '白雲石': { CaO: 0.3041, MgO: 0.2186, LOI: 0.4773 },
    '磷酸鈣(骨灰)': { CaO: 0.546, P2O5: 0.425, MgO: 0.02, K2O: 0.0003, Na2O: 0.0087, Al2O3: 0.0005, SiO2: 0.0005, LOI: 0.0 },
    
    '高嶺土': { Al2O3: 0.3950, SiO2: 0.4650, LOI: 0.1400 },
    '球土': { K2O: 0.0110, Na2O: 0.0020, CaO: 0.0030, MgO: 0.0020, TiO2: 0.0040, Al2O3: 0.3500, Fe2O3: 0.0090, SiO2: 0.4570, LOI: 0.1620 },
    '滑石': { MgO: 0.3170, SiO2: 0.6350, LOI: 0.0480 }, 
    '硼酸': { B2O3: 0.5629, LOI: 0.4371 }, 
    '硼砂': { Na2O: 0.1625, B2O3: 0.3562, LOI: 0.4813 }, 
    '氧化鋁': { Al2O3: 1.0000, LOI: 0.0000 },
    '氧化鐵': { Fe2O3: 1.0000, LOI: 0.0000 },
    '氧化鉻': { Cr2O3: 1.0000, LOI: 0.0000 },

    '石英': { SiO2: 1.0000, LOI: 0.0000 },
    '矽灰石': { CaO: 0.4820, SiO2: 0.5180, LOI: 0.0000 }, 
    '二氧化鈦': { TiO2: 1.0000, LOI: 0.0000 },
    '氧化錫': { SnO2: 1.0000, LOI: 0.0000 },
    '氧化鋯': { ZrO2: 1.0000, LOI: 0.0000 },

    '碳酸鉀': { K2O: 0.6816, LOI: 0.3184 },
    '碳酸鈉': { Na2O: 0.5847, LOI: 0.4153 },
    '碳酸鋰': { Li2O: 0.4044, LOI: 0.5956 },
    '鉛白': { PbO: 0.8630, LOI: 0.1370 }
};

const RAW_MATERIAL_GROUPS = {
    1: ['釜戶長石', 'A200', '日化長石', '澳洲鉀長石', '葉長石A38', '鋰輝石T38'], 
    2: ['石灰石', '輕鈣', '碳酸鎂', '氧化鎂', '碳酸鋇', '碳酸鍶', '氧化鍶', '鋅', '滑石', '白雲石', '磷酸鈣(骨灰)'], 
    3: ['高嶺土', '球土', '氧化鋁', '氧化鐵', '氧化鉻', '硼酸', '硼砂'], 
    4: ['石英', '矽灰石', '二氧化鈦', '氧化錫', '氧化鋯'], 
    5: ['1124熔塊', '850鉛溶塊', '合成土灰', '鈉硼酸鈣', 'G2溶塊', '3110溶塊', '3134熔塊'], 
    6: ['碳酸鉀', '碳酸鈉', '碳酸鋰', '鉛白'] 
};

const RO_FLUXES = ['K2O', 'Na2O', 'CaO', 'MgO', 'Li2O', 'ZnO', 'BaO', 'SrO', 'PbO'];
const R2O3_AMPHOTERICS = ['Al2O3', 'Fe2O3', 'B2O3', 'P2O5'];
const RO2_GLASS_FORMERS = ['SiO2', 'TiO2', 'SnO2', 'ZrO2'];

let stullChart = null;
let isWizardMode = false;

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    setupEventListeners();
    addRecipeRow();
    addRecipeRow();
    addRecipeRow();
    addRecipeRow();
    checkTotalWeight(); 
    updateTargetROSum(); 
    updateTargetChart(); 
});

function generateMaterialOptions(selectedValue = '') {
    let html = '<option value="">選擇原料...</option>';
    const groupNames = {
        1: '1. 長石 / 熔塊類', 2: '2. 碳酸鹽 / 氧化物類', 3: '3. 黏土 / 穩定劑類',
        4: '4. 玻璃形成劑類', 5: '5. 特殊熔塊 / 釉料', 6: '6. 純鹼 / 高活性助熔劑'
    };

    for (let i = 1; i <= 6; i++) {
        html += `<optgroup label="${groupNames[i]}">`;
        RAW_MATERIAL_GROUPS[i].forEach(name => {
            if (RAW_MATERIALS[name]) {
                const selected = name === selectedValue ? 'selected' : '';
                html += `<option value="${name}" ${selected}>${name}</option>`;
            }
        });
        html += '</optgroup>';
    }
    return html;
}

function addRecipeRow(matName = '', weight = 0) {
    const tbody = document.getElementById('recipe-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><select class="mat-select">${generateMaterialOptions(matName)}</select></td>
        <td><input type="number" class="mat-weight" value="${weight > 0 ? weight.toFixed(2) : 0}" step="0.01" min="0"></td>
        <td><button class="del-btn" onclick="removeRow(this)"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);
    
    const select = tr.querySelector('.mat-select');
    const input = tr.querySelector('.mat-weight');
    
    select.addEventListener('change', (e) => {
        if (checkDuplicate(e.target)) { e.target.value = ""; return; }
        if (isWizardMode) {
            autoCalculateWeightForRow(e.target);
        } else {
            updateKNaOAllocation(e.target.value);
        }
        checkTotalWeight();
    });
    
    input.addEventListener('input', checkTotalWeight);
}

function checkDuplicate(currentSelect) {
    const selects = document.querySelectorAll('.mat-select');
    const currentVal = currentSelect.value;
    if (!currentVal) return false;
    for (let s of selects) {
        if (s !== currentSelect && s.value === currentVal) {
            showToast("⚠️ 原料已存在，請勿重複新增！");
            return true;
        }
    }
    return false;
}

function removeRow(btn) {
    btn.closest('tr').remove();
    checkTotalWeight();
    if (isWizardMode) analyzeNeedsAndHint();
    updateKNaOAllocation(); 
}

function resetAll() {
    if(confirm("確定要清空所有數據重新開始嗎？")) {
        document.getElementById('recipe-body').innerHTML = '';
        addRecipeRow();
        addRecipeRow();
        
        document.getElementById('target-knao').value = '0.5';
        ['CaO','MgO','ZnO','BaO','SrO','Li2O','PbO','Al2O3','B2O3','Fe2O3','P2O5','SiO2','TiO2','ZrO2','SnO2'].forEach(id => {
            const el = document.getElementById(`target-${id}`);
            if(el) el.value = '';
        });
        
        updateTargetROSum();
        checkTotalWeight();
        calculateUMF();
        updateTargetChart(); 
        
        isWizardMode = false;
        document.getElementById('wizard-guide').classList.add('hidden');
        showToast("已全部清空重置");
    }
}

function setupEventListeners() {
    document.getElementById('add-row-btn').addEventListener('click', () => addRecipeRow());
    document.getElementById('reverse-calc-btn').addEventListener('click', startWizardMode);
    document.getElementById('reset-all-btn').addEventListener('click', resetAll);
    
    // 【修改點1】在原料轉換釉式的按鈕加入播放音效指令
    document.getElementById('forward-calc-btn').addEventListener('click', () => {
        calculateUMF();
        document.getElementById('forward-success-msg').classList.remove('hidden');
        
        // 播放「轉換成功」音效
        const audioFwd = document.getElementById('audio-forward');
        if (audioFwd) {
            audioFwd.currentTime = 0;
            audioFwd.play().catch(e => console.log('音效播放被瀏覽器阻擋 (需使用者先互動過網頁):', e));
        }
        
        setTimeout(() => document.getElementById('forward-success-msg').classList.add('hidden'), 3000);
    });

    const allInputs = document.querySelectorAll('.umf-grid input[type="number"]');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateTargetROSum();
            updateTargetChart(); 
        });
    });
}

function updateTargetROSum() {
    let sum = 0;
    const knao = parseFloat(document.getElementById('target-knao').value) || 0;
    sum += knao;
    
    ['CaO','MgO','ZnO','BaO','SrO','Li2O','PbO'].forEach(ox => {
        const val = parseFloat(document.getElementById(`target-${ox}`)?.value) || 0;
        sum += val;
    });

    const display = document.getElementById('ro-target-display');
    const reverseBtn = document.getElementById('reverse-calc-btn');
    const diff = 1.0 - sum;
    
    let symbol = `<span style="font-size: 1.8em; vertical-align: middle; line-height: 0.5; margin-right: 3px;">◆</span>`;
    
    if (Math.abs(diff) > 0.001) {
        display.classList.remove('text-success-pulse');
        reverseBtn.classList.remove('btn-pulse'); 
        
        let msg = `${symbol} 釉式轉換原料RO合計(目標): ${sum.toFixed(3)}`;
        
        if (diff > 0.001) {
            msg += ` <span class="warning-blink">(缺 ${diff.toFixed(3)})</span>`;
        } else if (diff < -0.001) {
            msg += ` <span class="warning-blink">(超 ${Math.abs(diff).toFixed(3)})</span>`;
        }
        
        display.innerHTML = msg; 
        display.style.color = "#c0392b"; 
        
        reverseBtn.disabled = true;
        reverseBtn.title = "RO 總和必須為 1.0 才能進行計算";
    } else {
        let msg = `${symbol} 釉式轉換原料RO合計(目標): 1.000 (已達標)`;
        display.innerHTML = msg; 
        display.style.color = "#27ae60"; 
        
        display.classList.remove('text-success-pulse');
        void display.offsetWidth; 
        display.classList.add('text-success-pulse');
        
        reverseBtn.disabled = false;
        reverseBtn.title = "點擊開始引導配方";
        reverseBtn.classList.add('btn-pulse'); 
    }
    
    updateKNaOAllocation();
}

function updateKNaOAllocation(specificMatName = null) {
    let matName = specificMatName;
    if (!matName) {
        const rows = document.querySelectorAll('#recipe-body tr');
        for (let r of rows) {
            const val = r.querySelector('.mat-select').value;
            if (RAW_MATERIAL_GROUPS[1].includes(val)) {
                matName = val;
                break;
            }
        }
    }
    if (!matName) matName = 'A200'; 

    const mat = RAW_MATERIALS[matName];
    if (mat && (mat.K2O || mat.Na2O)) {
        const knaoTarget = parseFloat(document.getElementById('target-knao').value) || 0;
        const totalKNa = (mat.K2O || 0) + (mat.Na2O || 0);
        if (totalKNa > 0) {
            const kRatio = mat.K2O / totalKNa;
            const naRatio = mat.Na2O / totalKNa;
            document.getElementById('curr-K2O-target').textContent = (knaoTarget * kRatio).toFixed(3);
            document.getElementById('curr-Na2O-target').textContent = (knaoTarget * naRatio).toFixed(3);
        } else {
            document.getElementById('curr-K2O-target').textContent = "0.000";
            document.getElementById('curr-Na2O-target').textContent = "0.000";
        }
    }
}

function updateTargetChart() {
    const al = parseFloat(document.getElementById('target-Al2O3').value) || 0;
    const si = parseFloat(document.getElementById('target-SiO2').value) || 0;
    
    if (stullChart) {
        stullChart.data.datasets[1].data = [{x: si, y: al}];
        stullChart.update();
    }
}

// ===================================================
// 引導模式
// ===================================================
function startWizardMode() {
    document.getElementById('recipe-body').innerHTML = '';
    isWizardMode = true;
    document.getElementById('wizard-guide').classList.remove('hidden');
    analyzeNeedsAndHint();
    showToast("已清空！請依提示選擇原料");
    updateKNaOAllocation(); 
}

function analyzeNeedsAndHint() {
    const currentMoles = calculateCurrentMoles(); 
    const targets = getTargets();
    const needs = {};
    
    const curKNaO = (currentMoles['K2O']||0) + (currentMoles['Na2O']||0);
    needs.KNaO = targets.KNaO - curKNaO;
    
    const allOxides = ['CaO', 'MgO', 'ZnO', 'BaO', 'SrO', 'PbO', 'Li2O', 'Al2O3', 'SiO2', 'B2O3', 'P2O5', 'TiO2', 'ZrO2', 'SnO2', 'Fe2O3'];
    allOxides.forEach(ox => {
        needs[ox] = (targets[ox] || 0) - (currentMoles[ox]||0);
    });

    let missingList = [];
    if (needs.KNaO > 0.001) missingList.push('KNaO');
    allOxides.forEach(ox => {
        if (needs[ox] > 0.001) missingList.push(ox);
    });

    const hintEl = document.getElementById('wizard-msg');
    
    if (missingList.length > 0) {
        hintEl.innerHTML = `缺少 <b>${missingList.length}</b> 個目標 (${missingList.slice(0, 4).join(', ')}${missingList.length>4?'...':''})。<br>請新增對應原料。`;
    } else {
        hintEl.innerHTML = `<span class="wizard-success-anim" style="color:#27ae60; font-weight:bold;">【完成計算】 釉式轉換原料目標已滿足！</span>`;
        
        // 【修改點2】當目標滿足時，播放「完成計算」音效
        // 為了避免重複播放，我們判斷 isWizardMode 還是 true 的狀態下才播放 (代表這是第一次達標)
        if (isWizardMode) {
            const audioWiz = document.getElementById('audio-wizard');
            if (audioWiz) {
                audioWiz.currentTime = 0;
                audioWiz.play().catch(e => console.log('音效播放被瀏覽器阻擋:', e));
            }
        }
        
        isWizardMode = false;
        normalizeRecipeTo100();
    }
}

function normalizeRecipeTo100() {
    const rows = document.querySelectorAll('#recipe-body tr');
    let total = 0;
    rows.forEach(r => total += parseFloat(r.querySelector('.mat-weight').value) || 0);
    
    if (total > 0 && Math.abs(total - 100) > 0.1) {
        const factor = 100 / total;
        rows.forEach(r => {
            const inp = r.querySelector('.mat-weight');
            const oldVal = parseFloat(inp.value) || 0;
            inp.value = (oldVal * factor).toFixed(2);
        });
        checkTotalWeight();
        showToast("已自動正規化總重為 100%");
    }
}

function autoCalculateWeightForRow(selectElement) {
    const matName = selectElement.value;
    const row = selectElement.closest('tr');
    const input = row.querySelector('.mat-weight');
    
    if (!matName || !RAW_MATERIALS[matName]) return;
    
    const mat = RAW_MATERIALS[matName];
    const targets = getTargets();
    const currentMoles = calculateCurrentMoles(row); 
    
    let weight = 0;
    let primaryOxide = null;

    if (RAW_MATERIAL_GROUPS[1].includes(matName)) {
        primaryOxide = 'KNaO';
    } else if (matName.includes('骨灰') || matName.includes('土灰')) {
        primaryOxide = 'P2O5';
    } else if (matName.includes('白雲石') || matName.includes('滑石') || matName.includes('鎂')) {
        primaryOxide = 'MgO';
    } else if (matName.includes('石灰') || matName.includes('輕鈣') || matName.includes('矽灰石')) {
        primaryOxide = 'CaO';
    } else if (matName.includes('石英')) {
        primaryOxide = 'SiO2';
    } else if (matName.includes('高嶺') || matName.includes('球土') || matName.includes('鋁')) {
        primaryOxide = 'Al2O3';
    } else if (matName.includes('鋇')) { primaryOxide = 'BaO';
    } else if (matName.includes('鋅')) { primaryOxide = 'ZnO';
    } else if (matName.includes('鍶')) { primaryOxide = 'SrO';
    } else if (matName.includes('鋰')) { primaryOxide = 'Li2O'; }

    if (primaryOxide === 'KNaO') {
        const curKNaO = (currentMoles['K2O']||0) + (currentMoles['Na2O']||0);
        const needKNaO = targets.KNaO - curKNaO;
        const matUnitKNaO = (mat.K2O/OXIDE_MOL_WEIGHT.K2O || 0) + (mat.Na2O/OXIDE_MOL_WEIGHT.Na2O || 0);
        if (needKNaO > 0.0001 && matUnitKNaO > 0) weight = needKNaO / matUnitKNaO;
    } else if (primaryOxide) {
        const need = (targets[primaryOxide] || 0) - (currentMoles[primaryOxide]||0);
        const unit = mat[primaryOxide]/OXIDE_MOL_WEIGHT[primaryOxide] || 0;
        if (need > 0.0001 && unit > 0) weight = need / unit;
    } else {
        const allOx = ['CaO', 'MgO', 'ZnO', 'BaO', 'SrO', 'PbO', 'Li2O', 'Al2O3', 'SiO2', 'B2O3', 'P2O5', 'TiO2', 'ZrO2', 'SnO2', 'Fe2O3'];
        for (let ox of allOx) {
            const need = (targets[ox] || 0) - (currentMoles[ox]||0);
            const unit = mat[ox]/OXIDE_MOL_WEIGHT[ox] || 0;
            if (need > 0.0001 && unit > 0 && mat[ox] > 0.01) { 
                weight = need / unit;
                break;
            }
        }
    }
    
    if (weight > 0) {
        input.value = weight.toFixed(2); 
        updateKNaOAllocation(matName); 
    } else {
        showToast("⚠️ 此原料無作用或目標已滿足，請移除！");
        selectElement.value = ""; 
        return;
    }
    
    setTimeout(analyzeNeedsAndHint, 100);
}

function calculateCurrentMoles(excludeRow = null) {
    const rows = document.querySelectorAll('#recipe-body tr');
    let moles = {};
    rows.forEach(r => {
        if (r === excludeRow) return;
        const mName = r.querySelector('.mat-select').value;
        const w = parseFloat(r.querySelector('.mat-weight').value) || 0;
        if (mName && RAW_MATERIALS[mName]) {
            const mat = RAW_MATERIALS[mName];
            for (let ox in OXIDE_MOL_WEIGHT) {
                if (mat[ox]) {
                    moles[ox] = (moles[ox] || 0) + (w * mat[ox] / OXIDE_MOL_WEIGHT[ox]);
                }
            }
        }
    });
    return moles;
}

function getTargets() {
    const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;
    let t = { KNaO: getVal('target-knao') };
    for (let ox in OXIDE_MOL_WEIGHT) {
        if (ox !== 'K2O' && ox !== 'Na2O') t[ox] = getVal(`target-${ox}`);
    }
    return t;
}

// ===================================================
// 正推計算
// ===================================================
function calculateUMF() {
    const rows = document.querySelectorAll('#recipe-body tr');
    let totalWeight = 0;
    let totalMoles = {}; 
    [...RO_FLUXES, ...R2O3_AMPHOTERICS, ...RO2_GLASS_FORMERS].forEach(ox => totalMoles[ox] = 0);

    rows.forEach(row => {
        const matName = row.querySelector('.mat-select').value;
        const weight = parseFloat(row.querySelector('.mat-weight').value) || 0;
        
        if (matName && RAW_MATERIALS[matName]) {
            totalWeight += weight;
            const mat = RAW_MATERIALS[matName];
            for (const ox in totalMoles) {
                if (mat[ox]) {
                    totalMoles[ox] += (weight * mat[ox]) / OXIDE_MOL_WEIGHT[ox];
                }
            }
        }
    });

    let roSum = 0;
    RO_FLUXES.forEach(ox => roSum += totalMoles[ox]);
    const divisor = roSum > 0 ? roSum : 1;

    [...RO_FLUXES, ...R2O3_AMPHOTERICS, ...RO2_GLASS_FORMERS].forEach(ox => {
        const val = totalMoles[ox] / divisor;
        const el = document.getElementById(`curr-${ox}`);
        if(el) el.textContent = val.toFixed(3);
    });

    const k2o = totalMoles['K2O'] / divisor;
    const na2o = totalMoles['Na2O'] / divisor;
    document.getElementById('curr-knao').textContent = (k2o + na2o).toFixed(3);
    
    const actDisplay = document.getElementById('ro-check-display');
    actDisplay.innerHTML = `<span style="font-size: 1.2em; vertical-align: middle; line-height: 0.5; margin-right: 3px;">●</span> 原料換算釉式RO合計(實際): ${roSum > 0 ? "1.000" : "0.000"}`;
    actDisplay.style.color = "#333333"; 

    const sio2 = totalMoles['SiO2'] / divisor;
    const al2o3 = totalMoles['Al2O3'] / divisor;
    updateChart(sio2, al2o3);
    document.getElementById('val-ratio').textContent = al2o3 > 0 ? (sio2/al2o3).toFixed(2) : "∞";
}

function checkTotalWeight() {
    const rows = document.querySelectorAll('#recipe-body tr');
    let total = 0;
    let loiWeight = 0;

    rows.forEach(row => {
        const matName = row.querySelector('.mat-select').value;
        const weight = parseFloat(row.querySelector('.mat-weight').value) || 0;
        total += weight;
        if (matName && RAW_MATERIALS[matName] && RAW_MATERIALS[matName].LOI) {
            loiWeight += weight * RAW_MATERIALS[matName].LOI;
        }
    });

    const totalEl = document.getElementById('total-weight');
    const warnEl = document.getElementById('weight-warning');
    const forwardBtn = document.getElementById('forward-calc-btn');
    
    totalEl.textContent = total.toFixed(1);
    document.getElementById('total-loi').textContent = total > 0 ? ((loiWeight / total) * 100).toFixed(2) : "0.0";

    const diff = 100 - total;
    if (Math.abs(diff) < 0.1) {
        totalEl.style.color = "green";
        warnEl.textContent = "OK";
        warnEl.style.color = "green";
        forwardBtn.disabled = false;
        if(isWizardMode) analyzeNeedsAndHint();
    } else {
        totalEl.style.color = "red";
        warnEl.textContent = diff > 0 ? `(缺 ${diff.toFixed(1)})` : `(超 ${Math.abs(diff).toFixed(1)})`;
        warnEl.style.color = "red";
        forwardBtn.disabled = true;
    }
}

// Chart
function initChart() {
    const ctx = document.getElementById('stullChart').getContext('2d');
    const bgPlugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            const drawRect = (xStart, yStart, xEnd, yEnd, color) => {
                const left = xAxis.getPixelForValue(xStart);
                const right = xAxis.getPixelForValue(xEnd);
                const top = yAxis.getPixelForValue(yEnd); 
                const bottom = yAxis.getPixelForValue(yStart);
                ctx.fillStyle = color;
                ctx.fillRect(left, top, right - left, bottom - top);
            };
            drawRect(0.0, 0.6, 4.0, 1.0, 'rgba(255, 182, 193, 0.3)'); 
            drawRect(4.0, 0.2, 8.0, 0.6, 'rgba(173, 216, 230, 0.3)');
            drawRect(4.0, 0.6, 8.0, 1.0, 'rgba(255, 255, 224, 0.5)'); 
        }
    };
    
    stullChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '實際配方(黑)',
                    data: [{x: 0, y: 0}],
                    backgroundColor: '#333333', 
                    pointRadius: 8
                },
                {
                    label: '目標值(紅)',
                    data: [{x: 0, y: 0}],
                    backgroundColor: '#c0392b', 
                    pointStyle: 'rectRot',
                    pointRadius: 8
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { 
                    title: { display: true, text: 'SiO₂', color: '#00008b', font: { weight: 'bold', size: 14 } }, 
                    min: 0, max: 10, ticks: { stepSize: 1 } 
                },
                y: { 
                    title: { display: true, text: 'Al₂O₃', color: '#8b0000', font: { weight: 'bold', size: 14 } }, 
                    min: 0, max: 1.0, ticks: { stepSize: 0.1 } 
                }
            },
            plugins: { 
                legend: { 
                    display: false 
                } 
            }
        },
        plugins: [bgPlugin]
    });
}

function updateChart(si, al) {
    if (stullChart) { 
        stullChart.data.datasets[0].data = [{x: si, y: al}]; 
        stullChart.update(); 
    }
}


// ===================================================
// Word 完美隱形表格複製技術
// ===================================================

function copyRecipeToClipboard() {
    let recipeRowsHTML = '';
    let totalWeight = 0;
    let hasRecipe = false;
    
    document.querySelectorAll('#recipe-body tr').forEach(row => {
        const rawName = row.querySelector('.mat-select').value;
        const weight = parseFloat(row.querySelector('.mat-weight').value) || 0;
        
        if (rawName && weight > 0) {
            recipeRowsHTML += `
                <tr>
                    <td style="border: 1px solid black; padding: 2px 5px; background-color: white; white-space: nowrap;">
                        <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">${rawName}</p>
                    </td>
                    <td style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                        <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">${weight.toFixed(2)}</p>
                    </td>
                </tr>`;
            totalWeight += weight;
            hasRecipe = true;
        }
    });

    if (!hasRecipe) {
        showToast("⚠️ 請先新增原料並確認重量大於 0");
        return;
    }

    const wordHtmlPayload = `
    <div style="font-family: '微軟正黑體', 'Microsoft JhengHei', sans-serif; background-color: white; color: black; font-size: 10.5pt;">
        <p style="font-weight: bold; font-size: 11pt; margin: 0 0 3px 0;">配方計算結果 (重量 %)</p>
        <table style="border-collapse: collapse; width: 60%; text-align: left; border: 1px solid black; background-color: white;">
            <tr>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: white; white-space: nowrap;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt; font-weight: bold;">原料名稱</p>
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt; font-weight: bold;">重量 (%)</p>
                </td>
            </tr>
            ${recipeRowsHTML}
            <tr>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt; color: blue; font-weight: bold;">總計</p>
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt; color: blue; font-weight: bold;">${totalWeight.toFixed(2)}</p>
                </td>
            </tr>
        </table>
        <br>
    </div>
    `;
    executeCopy(wordHtmlPayload, "配方");
}

function copyUmfToClipboard() {
    const tdLeftStyle = 'border: none; padding: 0 15px 0 0; vertical-align: middle; white-space: nowrap;';
    const tdRightStyle = 'border: none; padding: 0; vertical-align: middle; text-align: left;';
    const pStyle = 'margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;';

    // RO 組
    let roText = '<table style="border-collapse: collapse; border: none; width: auto;">';
    const knaoTarget = parseFloat(document.getElementById('target-knao').value) || 0;
    const knaoCurr = parseFloat(document.getElementById('curr-knao').textContent) || 0;
    if (knaoTarget > 0 || knaoCurr > 0) {
        roText += `<tr><td style="${tdLeftStyle}"><p style="${pStyle}"><span style="color: #006400; font-weight: bold;">KNaO</span></p></td><td style="${tdRightStyle}"><p style="${pStyle}">${knaoTarget.toFixed(3)}</p></td></tr>`;
    }
    ['K2O', 'Na2O'].forEach(ox => {
        const target = parseFloat(document.getElementById(`curr-${ox}-target`).textContent) || 0;
        if (target > 0) roText += `<tr><td style="${tdLeftStyle}"><p style="${pStyle}">${ox}</p></td><td style="${tdRightStyle}"><p style="${pStyle}">${target.toFixed(4)}</p></td></tr>`;
    });
    ['CaO', 'MgO', 'ZnO', 'BaO', 'SrO', 'Li2O', 'PbO'].forEach(ox => {
        const target = parseFloat(document.getElementById(`target-${ox}`).value) || 0;
        if (target > 0) roText += `<tr><td style="${tdLeftStyle}"><p style="${pStyle}">${ox}</p></td><td style="${tdRightStyle}"><p style="${pStyle}">${target.toFixed(4)}</p></td></tr>`;
    });
    roText += '</table>';

    // R2O3 組
    let r2o3Text = '<table style="border-collapse: collapse; border: none; width: auto;">';
    ['Al2O3', 'B2O3', 'Fe2O3', 'P2O5'].forEach(ox => {
        const target = parseFloat(document.getElementById(`target-${ox}`).value) || 0;
        if (target > 0) {
            const displayOx = ox === 'Al2O3' ? `<span style="color: red; font-weight: bold;">${ox}</span>` : ox;
            r2o3Text += `<tr><td style="${tdLeftStyle}"><p style="${pStyle}">${displayOx}</p></td><td style="${tdRightStyle}"><p style="${pStyle}">${target.toFixed(4)}</p></td></tr>`;
        }
    });
    r2o3Text += '</table>';

    // RO2 組
    let ro2Text = '<table style="border-collapse: collapse; border: none; width: auto;">';
    ['SiO2', 'TiO2', 'ZrO2', 'SnO2'].forEach(ox => {
        const target = parseFloat(document.getElementById(`target-${ox}`).value) || 0;
        if (target > 0) {
            const displayOx = ox === 'SiO2' ? `<span style="color: blue; font-weight: bold;">${ox}</span>` : ox;
            ro2Text += `<tr><td style="${tdLeftStyle}"><p style="${pStyle}">${displayOx}</p></td><td style="${tdRightStyle}"><p style="${pStyle}">${target.toFixed(4)}</p></td></tr>`;
        }
    });
    ro2Text += '</table>';

    const wordHtmlPayload = `
    <div style="font-family: '微軟正黑體', 'Microsoft JhengHei', sans-serif; background-color: white; color: black; font-size: 10.5pt;">
        <p style="font-weight: bold; font-size: 11pt; margin: 0 0 3px 0;">釉式目標 (UMF)</p>
        <table style="border-collapse: collapse; width: 100%; text-align: left; border: 1px solid black; background-color: white;">
            <tr>
                <td style="border: 1px solid black; padding: 5px; background-color: #d4edda; font-weight: bold; white-space: nowrap;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">RO 助熔劑</p>
                </td>
                <td style="border: 1px solid black; padding: 5px; background-color: #f8d7da; font-weight: bold; white-space: nowrap;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">R₂O₃ 穩定劑</p>
                </td>
                <td style="border: 1px solid black; padding: 5px; background-color: #d1ecf1; font-weight: bold; white-space: nowrap;">
                    <p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">RO₂ 形成劑</p>
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 5px; vertical-align: top; background-color: #d4edda;">${roText}</td>
                <td style="border: 1px solid black; padding: 5px; vertical-align: top; background-color: #f8d7da;">${r2o3Text}</td>
                <td style="border: 1px solid black; padding: 5px; vertical-align: top; background-color: #d1ecf1;">${ro2Text}</td>
            </tr>
        </table>
    </div>
    `;
    executeCopy(wordHtmlPayload, "釉式目標");
}

function executeCopy(htmlContent, typeName) {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.backgroundColor = 'white'; 
    document.body.appendChild(container);
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(container);
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        document.execCommand('copy');
        showToast(`🎉 ${typeName} 已複製 (Word格式)`);
    } catch (err) {
        showToast('⚠️ 複製失敗，瀏覽器不支援');
    }
    
    selection.removeAllRanges();
    document.body.removeChild(container);
}

function showToast(msg) {
    const t = document.getElementById('toast-msg'); t.textContent = msg;
    t.classList.remove('hidden'); t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); t.classList.add('hidden'); }, 2000);
}