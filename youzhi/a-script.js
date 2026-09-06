// ===================================================
// 陶瓷釉藥賽格式計算器 V5.1 - 圖表邏輯與定位修正
// 【V5.1 進階修正】加入骨灰 (P2O5) 與白雲石 (MgO) 獨立優先計算邏輯，消除反推誤差。
// 【V5.1 一鍵複製優化】導入 Word 原生表格隱藏節點技術，保持極致緊湊。
// 【V5.1 排序優化】複製時置頂 KNaO、放寬配方表格、移除不要的比值。
// 【V5.1 視覺優化】複製到 Word 時，僅針對名稱 (KNaO, Al2O3, SiO2) 使用彩色粗體，數值保持黑色細體。
// 【V5.1 空白修正】強制加入 4 格空白 (&nbsp;)，將氧化物名稱與數值完美拉開。
// 【V5.1 標題修正】縮短 Word 釉式表格標題並加入 white-space: nowrap 強制一行顯示。
// ===================================================

// --- A. 數據庫：氧化物分子量 ---
const OXIDE_MOL_WEIGHT = {
    'K2O': 94.20, 'Na2O': 61.98, 'CaO': 56.08, 'MgO': 40.31,
    'Li2O': 29.88, 'ZnO': 81.38, 'BaO': 153.33, 'SrO': 103.62,
    'PbO': 223.20, 'Al2O3': 101.96, 'Fe2O3': 159.69, 'Cr2O3': 152.00,
    'B2O3': 69.62, 'SiO2': 60.09, 'TiO2': 79.88, 'SnO2': 150.71,
    'ZrO2': 123.22, 'P2O5': 141.94, 
};

// --- B. 數據庫：原料化學組成 (重量百分比) ---
const RAW_MATERIAL_DATA = {
    'A200': { K2O: 0.046, Na2O: 0.098, CaO: 0.007, MgO: 0.001, Al2O3: 0.233, Fe2O3: 0.0007, SiO2: 0.607, LOI: 0.00763 }, 
    '日化長石': { K2O: 0.021, Na2O: 0.082, CaO: 0.0, MgO: 0.0, Al2O3: 0.178, SiO2: 0.669, LOI: 0.050 }, 
    '澳洲鉀長石': { K2O: 0.1080, Na2O: 0.0370, Al2O3: 0.1880, SiO2: 0.6590, LOI: 0.0000 },
    '釜戶長石': { K2O: 0.0683, Na2O: 0.0524, Al2O3: 0.1659, SiO2: 0.7026, LOI: 0.0000 }, 
    '印度鉀長石': { K2O: 0.100, Na2O: 0.020, Al2O3: 0.190, SiO2: 0.680, LOI: 0.010 }, 
    '3110熔塊': { K2O: 0.0253, Na2O: 0.1521, CaO: 0.0624, Al2O3: 0.0352, SiO2: 0.6983, B2O3: 0.0267, LOI: 0.000 }, 
    '3134熔塊': { K2O: 0.0000, Na2O: 0.1014, CaO: 0.1951, Al2O3: 0.0200, SiO2: 0.4546, B2O3: 0.2279, LOI: 0.0010 },
    '1124熔塊': { K2O: 0.0000, Na2O: 0.1000, CaO: 0.0700, ZnO: 0.0850, Al2O3: 0.0850, SiO2: 0.4600, B2O3: 0.2000, LOI: 0.0000 },
    
    '碳酸鉀': { K2O: 0.6820, LOI: 0.3180 }, 
    '碳酸鈉': { Na2O: 0.5847, LOI: 0.4153 }, 

    '石灰石': { CaO: 0.5600, LOI: 0.4400 }, 
    '輕鈣': { CaO: 0.5600, LOI: 0.4400 }, 
    '矽灰石': { CaO: 0.4828, SiO2: 0.5172, LOI: 0.000 }, 
    '碳酸鎂': { MgO: 0.4764, LOI: 0.5236 }, 
    '氧化鎂': { MgO: 1.0000, LOI: 0.0000 }, 
    '滑石': { MgO: 0.3170, SiO2: 0.6350, LOI: 0.0480 },
    '白雲石': { CaO: 0.304, MgO: 0.218, LOI: 0.478 },
    '碳酸鋇': { BaO: 0.7767, LOI: 0.2233 },
    '鋅': { ZnO: 1.0000, LOI: 0.0000 }, 
    '螢石': { CaO: 0.7183, LOI: 0.0000 }, 
    '磷酸鈣(骨灰)': { CaO: 0.546, P2O5: 0.425, LOI: 0.029 }, 
    '碳酸鋰': { Li2O: 0.4044, LOI: 0.5956 }, 
    '氧化鍶': { SrO: 1.0000, LOI: 0.0000 }, 
    '碳酸鍶': { SrO: 0.7019, LOI: 0.2981 }, 
    '鉛白': { PbO: 0.900, LOI: 0.100 }, 
    
    '合成土灰': { CaO: 0.359, MgO: 0.061, Al2O3: 0.027, P2O5: 0.027, SiO2: 0.174, LOI: 0.352 }, 
    '葉長石A38': { Li2O: 0.043, Al2O3: 0.170, SiO2: 0.778, LOI: 0.009 }, 
    '鋰輝石T38': { Li2O: 0.058, Al2O3: 0.280, SiO2: 0.660, LOI: 0.002 }, 
    
    '高嶺土': { Al2O3: 0.3950, SiO2: 0.4650, LOI: 0.1400 }, 
    '球土': { K2O: 0.0110, Na2O: 0.0020, CaO: 0.0030, MgO: 0.0020, TiO2: 0.0040, Al2O3: 0.3500, Fe2O3: 0.0090, SiO2: 0.4570, LOI: 0.1620 }, 
    '氧化鋁': { Al2O3: 1.0000, LOI: 0.0000 },
    '氧化鐵': { Fe2O3: 1.0000, LOI: 0.0000 },
    '鉻綠': { Cr2O3: 1.0000, LOI: 0.0000 },
    '硬硼酸鈣': { CaO: 0.272, B2O3: 0.509, LOI: 0.219 }, 
    '鈉硼酸鈣': { Na2O: 0.07, CaO: 0.15, B2O3: 0.45, SiO2: 0.20, LOI: 0.13 }, 
    '硼酸': { B2O3: 0.563, LOI: 0.437 }, 
    '硼砂': { Na2O: 0.162, B2O3: 0.354, LOI: 0.484 }, 
    
    '石英': { SiO2: 1.0000, LOI: 0.0000 },
    '二氧化鈦': { TiO2: 1.0000, LOI: 0.0000 }, 
    '矽酸鋯': { ZrO2: 0.672, SiO2: 0.328, LOI: 0.000 }, 
    '氧化錫': { SnO2: 1.0000, LOI: 0.0000 }, 

    '850': { Na2O: 0.15, CaO: 0.10, PbO: 0.30, Al2O3: 0.05, B2O3: 0.20, SiO2: 0.20, LOI: 0.00 }, 
    'G2': { CaO: 0.15, MgO: 0.10, PbO: 0.25, Al2O3: 0.10, SiO2: 0.40, LOI: 0.00 },
};

const RO_FLUXES = ['K2O', 'Na2O', 'CaO', 'MgO', 'BaO', 'ZnO', 'PbO', 'SrO', 'Li2O'];
const R2O3_AMPHOTERICS = ['Al2O3', 'Fe2O3', 'Cr2O3', 'B2O3', 'P2O5'];
const RO2_GLASS_FORMERS = ['SiO2', 'TiO2', 'SnO2', 'ZrO2'];

const RAW_MATERIAL_GROUPS = {
    1: ['A200', '日化長石', '澳洲鉀長石', '釜戶長石', '印度鉀長石', '3110熔塊', '3134熔塊', '1124熔塊'], 
    2: ['碳酸鉀', '碳酸鈉'],
    3: [ '石灰石', '輕鈣', '矽灰石', '碳酸鎂', '氧化鎂', '滑石', '白雲石', '碳酸鋇', '鋅', '螢石', '磷酸鈣(骨灰)', '合成土灰', '碳酸鋰', '氧化鍶', '碳酸鍶', '鉛白', '葉長石A38', '鋰輝石T38'], 
    4: ['高嶺土','球土', '氧化鋁', '氧化鐵', '鉻綠', '硬硼酸鈣', '鈉硼酸鈣', '硼酸', '硼砂'],
    5: ['石英', '二氧化鈦', '矽酸鋯', '氧化錫'], 
    6: ['850', 'G2'],
};

function round(num, places = 6) {
    if (!isFinite(num)) return 0; 
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

const calculateBtn = document.querySelector('#calculate-btn');
const roTotalDisplay = document.querySelector('#ro-umf-total'); 
const knaoSumInput = document.querySelector('#umf-KNaO-sum'); 
const recipeTableBody = document.querySelector('#recipe-tbody');
const addRawBtn = document.querySelector('#add-raw-btn');
const feldsparWarningDisplay = document.querySelector('#feldspar-warning'); 

let RAW_MATERIAL_SELECT_HTML = ''; 

function generateRawMaterialSelect() {
    let html = '<select class="raw-name">';
    html += '<option value="">--- 請選擇原料 ---</option>'; 
    
    for (const key of Object.keys(RAW_MATERIAL_GROUPS).sort((a, b) => a - b)) {
        let groupName = `分類 ${key}`; 
        if (key == 1) groupName = 'ro組-長石類 (K₂O, Na₂O 主導者)'; 
        else if (key == 2) groupName = 'ro組-鉀鈉補充';
        else if (key == 3) groupName = 'ro組助溶劑 (含Li₂O來源)';
        else if (key == 4) groupName = 'R₂O₃ 組 - 中性/穩定劑';
        else if (key == 5) groupName = 'RO₂ 組 - 酸性/形成劑';
        else if (key == 6) groupName = '熔塊系列';

        html += `<optgroup label="${groupName}">`;
        RAW_MATERIAL_GROUPS[key].forEach(name => {
            if(RAW_MATERIAL_DATA.hasOwnProperty(name)) {
                let displayName = name;
                if(name === '白雲石') displayName = '白雲石 (主供MgO)';
                if(name === '磷酸鈣(骨灰)') displayName = '磷酸鈣(骨灰) (主供P2O5)';
                if(name === '鋰輝石T38' || name === '葉長石A38') displayName = `${name} (主供Li2O)`;
                html += `<option value="${name}">${displayName}</option>`;
            }
        });
        html += '</optgroup>';
    }
    html += '</select>';
    RAW_MATERIAL_SELECT_HTML = html;
}

function updateSelectOptions() {
    const allRows = document.querySelectorAll('#recipe-tbody tr');
    const selectedMaterials = Array.from(allRows).map(row => row.querySelector('.raw-name')?.value).filter(name => name); 

    allRows.forEach(row => {
        const currentSelect = row.querySelector('.raw-name');
        if (!currentSelect) return;
        Array.from(currentSelect.options).forEach(option => {
            const rawName = option.value;
            if (!rawName) return; 
            const isSelectedElsewhere = selectedMaterials.includes(rawName) && rawName !== currentSelect.value;
            option.disabled = isSelectedElsewhere;
        });
    });
}

function addRecipeRow(name = '') {
    const row = recipeTableBody.insertRow();
    const rawSelectHtml = RAW_MATERIAL_SELECT_HTML.replace(`value="${name}"`, `value="${name}" selected`);
    row.innerHTML = `
        <td>${rawSelectHtml}</td>
        <td class="calculated-weight-cell"><span class="calculated-weight">0.00 %</span></td> 
        <td><button class="remove-row-btn">移除</button></td>
    `;
    
    row.querySelector('.remove-row-btn').addEventListener('click', function() {
        row.remove();
        updateSelectOptions(); 
        updateKNaOInputs(); 
        calculateBatchFromUMF(false); 
    });
    const select = row.querySelector('.raw-name');
    select.addEventListener('change', function() {
        updateSelectOptions(); 
        updateKNaOInputs(); 
        calculateBatchFromUMF(false); 
    }); 

    updateSelectOptions(); 
    updateKNaOInputs(); 
    calculateBatchFromUMF(false);
}

function getPrimaryFeldspar() {
    for (const row of document.querySelectorAll('#recipe-tbody tr')) {
        const name = row.querySelector('.raw-name')?.value;
        if (name && RAW_MATERIAL_DATA[name]) {
            if (RAW_MATERIAL_GROUPS[1].includes(name)) {
                 return { name: name, data: RAW_MATERIAL_DATA[name] };
            }
        }
    }
    return null;
}

function updateROTotal() {
    let total = 0;
    RO_FLUXES.forEach(oxide => {
        const input = document.querySelector(`#umf-${oxide}`);
        if (input) { total += round(parseFloat(input.value) || 0, 8); }
    });
    
    roTotalDisplay.textContent = `合計: ${total.toFixed(3)}`;
    
    if (Math.abs(total - 1.000) < 0.001) {
        roTotalDisplay.style.color = '#28a745';
        if (!feldsparWarningDisplay.textContent.startsWith('【成功】')) {
            feldsparWarningDisplay.textContent = getPrimaryFeldspar() ? "請點擊「重新計算配方」以顯示結果。" : "【提示】請選定一項長石類原料。";
            feldsparWarningDisplay.classList.remove('error-box');
            feldsparWarningDisplay.classList.add('notice-box');
        }
    } else {
        roTotalDisplay.style.color = '#dc3545';
        feldsparWarningDisplay.textContent = "【錯誤】RO 組合計必須為 1.000 才能計算原料重量。請調整左側 UMF 輸入。";
        feldsparWarningDisplay.classList.remove('notice-box');
        feldsparWarningDisplay.classList.add('error-box');
    }
}

function updateKNaOInputs() {
    const knaoTotal = parseFloat(knaoSumInput.value) || 0;
    const primaryFeldspar = getPrimaryFeldspar();
    let currentNotice = "簡化模擬計算中：請確認原料選擇與 UMF 目標。";
    
    document.querySelector('#umf-K2O').value = 0.0000.toFixed(4);
    document.querySelector('#umf-Na2O').value = 0.0000.toFixed(4);
    
    if (primaryFeldspar) {
        const data = primaryFeldspar.data;
        const feldsparName = primaryFeldspar.name;
        const k2oPct = data.K2O || 0;
        const na2oPct = data.Na2O || 0;
        
        if (k2oPct > 0 || na2oPct > 0) {
            const k2oMol = k2oPct / OXIDE_MOL_WEIGHT.K2O;
            const na2oMol = na2oPct / OXIDE_MOL_WEIGHT.Na2O;
            const r2oMolTotal = k2oMol + na2oMol;
            let targetMol = knaoTotal; 
            
            if (r2oMolTotal > 0 && targetMol > 0) {
                let k2oTarget = round(knaoTotal * (k2oMol / r2oMolTotal), 6);
                let na2oTarget = round(knaoTotal * (na2oMol / r2oMolTotal), 6);
                document.querySelector('#umf-K2O').value = k2oTarget.toFixed(4);
                document.querySelector('#umf-Na2O').value = na2oTarget.toFixed(4);
                currentNotice = `【提示】R₂O (鉀鈉) 目標已按 ${feldsparName} 的莫耳比例分配完畢。`;
            } else {
                currentNotice = `【提示】選定的 ${feldsparName} 不含 K₂O/Na₂O。請檢查原料資料。`;
            }
        } else {
            currentNotice = `【提示】選定的 ${feldsparName} 不含 K₂O/Na₂O。請檢查原料資料。`;
        }
    }

    updateROTotal();

    if(Math.abs(parseFloat(roTotalDisplay.textContent.replace('合計: ', '')) - 1.000) < 0.001){
        feldsparWarningDisplay.textContent = currentNotice;
        feldsparWarningDisplay.classList.remove('error-box');
        feldsparWarningDisplay.classList.add('notice-box');
    }
}

function calculateBatchFromUMF(isInitialLoad = false) {
    const umfTarget = {};
    let roTargetTotal = 0; 
    
    [...RO_FLUXES, ...R2O3_AMPHOTERICS, ...RO2_GLASS_FORMERS].forEach(oxide => {
        const input = document.querySelector(`#umf-${oxide}`);
        if (input) { umfTarget[oxide] = round(parseFloat(input.value) || 0, 8); } else { umfTarget[oxide] = 0; }
        if (RO_FLUXES.includes(oxide)) { roTargetTotal += umfTarget[oxide]; }
    });

    if (Math.abs(roTargetTotal - 1.000) > 0.001) {
        updateROTotal(); 
        updateGlazeChart({Al2O3: 0, SiO2: 0});
        feldsparWarningDisplay.classList.remove('success-pulse'); 
        return;
    }
    
    let umfNeededMol = {...umfTarget}; 
    const calculatedWeights = {}; 
    const rawMaterialsUsed = new Set();
    const recipeRows = document.querySelectorAll('#recipe-tbody tr');
    const primaryFeldspar = getPrimaryFeldspar();

    if (primaryFeldspar && (umfNeededMol.K2O > 0 || umfNeededMol.Na2O > 0)) {
        const data = primaryFeldspar.data;
        const feldsparName = primaryFeldspar.name;
        const k2oPct = data.K2O || 0;
        const na2oPct = data.Na2O || 0;
        const k2oMol = k2oPct / OXIDE_MOL_WEIGHT.K2O;
        const na2oMol = na2oPct / OXIDE_MOL_WEIGHT.Na2O;
        const r2oMolTotal = k2oMol + na2oMol;
        let targetMol = umfNeededMol.K2O + umfNeededMol.Na2O;
        
        if (r2oMolTotal > 0 && targetMol > 0) {
            const k2oTargetWeight = umfNeededMol.K2O * OXIDE_MOL_WEIGHT.K2O;
            const na2oTargetWeight = umfNeededMol.Na2O * OXIDE_MOL_WEIGHT.Na2O;
            const r2oTargetWeight = k2oTargetWeight + na2oTargetWeight;
            const r2oPctTotal = k2oPct + na2oPct;
            
            if (r2oPctTotal > 0) {
                let feldsparRawWeight = round(r2oTargetWeight / r2oPctTotal, 6); 
                calculatedWeights[feldsparName] = feldsparRawWeight;
                rawMaterialsUsed.add(feldsparName);
                
                for (const oxide in data) {
                    if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                        let oxideMolContributed = round((feldsparRawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8); 
                        umfNeededMol[oxide] -= oxideMolContributed;
                        umfNeededMol[oxide] = round(umfNeededMol[oxide], 8); 
                        if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                    }
                }
                umfNeededMol.K2O = 0;
                umfNeededMol.Na2O = 0;
            }
        }
    }

    const P2O5_SOURCE = '合成土灰';
    const isP2O5SourceSelected = Array.from(recipeRows).some(row => row.querySelector('.raw-name')?.value === P2O5_SOURCE);
    if (isP2O5SourceSelected && (umfNeededMol['P2O5'] || 0) > 0.00000001) { 
        const rawName = P2O5_SOURCE;
        const data = RAW_MATERIAL_DATA[rawName];
        const oxidePct = data['P2O5'] || 0; 
        const umfMol = umfNeededMol['P2O5'];
        if (oxidePct > 0) {
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT['P2O5']) / oxidePct, 6);
            calculatedWeights[rawName] = rawWeight;
            rawMaterialsUsed.add(rawName); 
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                    if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }

    const BONE_ASH_SOURCE = '磷酸鈣(骨灰)';
    const isBoneAshSelected = Array.from(recipeRows).some(row => row.querySelector('.raw-name')?.value === BONE_ASH_SOURCE);
    if (isBoneAshSelected && (umfNeededMol['P2O5'] || 0) > 0.00000001) { 
        const data = RAW_MATERIAL_DATA[BONE_ASH_SOURCE];
        const oxidePct = data['P2O5'] || 0; 
        const umfMol = umfNeededMol['P2O5'];
        if (oxidePct > 0) {
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT['P2O5']) / oxidePct, 6);
            calculatedWeights[BONE_ASH_SOURCE] = rawWeight;
            rawMaterialsUsed.add(BONE_ASH_SOURCE); 
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                    if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }

    const talcRow = Array.from(recipeRows).find(row => row.querySelector('.raw-name')?.value === '滑石');
    const umfMgO = umfNeededMol.MgO;
    if (talcRow && umfMgO > 0) {
        const talcData = RAW_MATERIAL_DATA['滑石'];
        const mgoPctInTalc = talcData.MgO || 0;
        if (mgoPctInTalc > 0) {
            let mgoTargetWeight = umfMgO * OXIDE_MOL_WEIGHT.MgO;
            let talcRawWeight = round(mgoTargetWeight / mgoPctInTalc, 6); 
            calculatedWeights['滑石'] = talcRawWeight;
            rawMaterialsUsed.add('滑石');
            for (const oxide in talcData) {
                 if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((talcRawWeight * talcData[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8); 
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                    if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }

    const DOLOMITE_SOURCE = '白雲石';
    const isDolomiteSelected = Array.from(recipeRows).some(row => row.querySelector('.raw-name')?.value === DOLOMITE_SOURCE);
    if (isDolomiteSelected && (umfNeededMol['MgO'] || 0) > 0.00000001) {
        const data = RAW_MATERIAL_DATA[DOLOMITE_SOURCE];
        const oxidePct = data['MgO'] || 0; 
        const umfMol = umfNeededMol['MgO'];
        if (oxidePct > 0) {
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT['MgO']) / oxidePct, 6);
            calculatedWeights[DOLOMITE_SOURCE] = rawWeight;
            rawMaterialsUsed.add(DOLOMITE_SOURCE);
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8); 
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                    if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }

    for (const row of recipeRows) {
        const rawName = row.querySelector('.raw-name')?.value;
        if (!rawName || rawMaterialsUsed.has(rawName)) continue; 
        const data = RAW_MATERIAL_DATA[rawName];
        let satisfiedOxide = null;
        for (const oxide of RO_FLUXES) {
            if ((data[oxide] || 0) > 0 && umfNeededMol[oxide] > 0) { satisfiedOxide = oxide; break; }
        }
        if (satisfiedOxide) {
            const oxidePct = data[satisfiedOxide];
            const umfMol = umfNeededMol[satisfiedOxide];
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT[satisfiedOxide]) / oxidePct, 6);
            calculatedWeights[rawName] = rawWeight;
            rawMaterialsUsed.add(rawName);
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                    if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }
    
    for (const row of recipeRows) {
        const rawName = row.querySelector('.raw-name')?.value;
        if (!rawName || rawMaterialsUsed.has(rawName)) continue;
        const data = RAW_MATERIAL_DATA[rawName];
        let satisfiedOxide = null;
        for (const oxide of R2O3_AMPHOTERICS) {
            if ((data[oxide] || 0) > 0 && umfNeededMol[oxide] > 0) { satisfiedOxide = oxide; break; }
        }
        if (satisfiedOxide) {
            const oxidePct = data[satisfiedOxide];
            const umfMol = umfNeededMol[satisfiedOxide];
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT[satisfiedOxide]) / oxidePct, 6);
            calculatedWeights[rawName] = rawWeight;
            rawMaterialsUsed.add(rawName);
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    umfNeededMol[oxide] = round(umfNeededMol[oxide], 8);
                     if (umfNeededMol[oxide] < -0.0000001) { umfNeededMol[oxide] = 0; }
                }
            }
        }
    }

    const quartzRow = Array.from(recipeRows).find(row => row.querySelector('.raw-name')?.value === '石英');
    if (quartzRow && umfNeededMol['SiO2'] > 0.0001) {
        const rawName = '石英';
        const data = RAW_MATERIAL_DATA[rawName];
        const oxidePct = data['SiO2'] || 0; 
        const umfMol = umfNeededMol['SiO2'];
        if (oxidePct > 0) {
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT['SiO2']) / oxidePct, 6);
            calculatedWeights[rawName] = (calculatedWeights[rawName] || 0) + rawWeight; 
            rawMaterialsUsed.add(rawName);
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    if (umfNeededMol[oxide] < -0.0000001) umfNeededMol[oxide] = 0;
                }
            }
        }
    }
    
    for (const row of recipeRows) {
        const rawName = row.querySelector('.raw-name')?.value;
        if (!rawName || rawMaterialsUsed.has(rawName)) continue; 
        const data = RAW_MATERIAL_DATA[rawName];
        let satisfiedOxide = null;
        for (const oxide of RO2_GLASS_FORMERS.filter(o => o !== 'SiO2')) { 
            if ((data[oxide] || 0) > 0 && umfNeededMol[oxide] > 0.0001) { satisfiedOxide = oxide; break; }
        }
        if (satisfiedOxide) {
            const oxidePct = data[satisfiedOxide];
            const umfMol = umfNeededMol[satisfiedOxide];
            let rawWeight = round((umfMol * OXIDE_MOL_WEIGHT[satisfiedOxide]) / oxidePct, 6);
            calculatedWeights[rawName] = (calculatedWeights[rawName] || 0) + rawWeight;
            rawMaterialsUsed.add(rawName);
            for (const oxide in data) {
                if (umfNeededMol.hasOwnProperty(oxide) && OXIDE_MOL_WEIGHT.hasOwnProperty(oxide)) {
                    let oxideMolContributed = round((rawWeight * data[oxide]) / OXIDE_MOL_WEIGHT[oxide], 8);
                    umfNeededMol[oxide] -= oxideMolContributed;
                    if (umfNeededMol[oxide] < -0.0000001) umfNeededMol[oxide] = 0;
                }
            }
        }
    }

    let totalBatchWeight = 0; 
    let totalLOI = 0;         
    rawMaterialsUsed.forEach(rawName => {
        if (calculatedWeights.hasOwnProperty(rawName)) {
            const rawWeight = calculatedWeights[rawName];
            const LOI_percentage = RAW_MATERIAL_DATA[rawName].LOI || 0;
            totalBatchWeight += rawWeight;
            totalLOI += rawWeight * LOI_percentage;
        }
    });

    let totalUMFMol = 0; 
    let umfOutputMol = {}; 
    const umfOutput = {}; 

    [...RO_FLUXES, ...R2O3_AMPHOTERICS, ...RO2_GLASS_FORMERS].forEach(oxide => { umfOutputMol[oxide] = 0; });

    rawMaterialsUsed.forEach(rawName => {
        if (calculatedWeights.hasOwnProperty(rawName)) {
            const rawWeight = calculatedWeights[rawName]; 
            const data = RAW_MATERIAL_DATA[rawName];
            for (const oxide in data) {
                if (OXIDE_MOL_WEIGHT.hasOwnProperty(oxide) && data[oxide] > 0) {
                    const oxideMol = round((data[oxide] * rawWeight) / OXIDE_MOL_WEIGHT[oxide], 8); 
                    umfOutputMol[oxide] += oxideMol;
                    if (RO_FLUXES.includes(oxide)) { totalUMFMol += oxideMol; }
                }
            }
        }
    });

    if (totalUMFMol > 0) {
        for (const oxide in umfOutputMol) { umfOutput[oxide] = round(umfOutputMol[oxide] / totalUMFMol, 6); }
    }
    
    if (totalBatchWeight === 0) {
        document.querySelectorAll('.calculated-weight').forEach(span => { span.textContent = '0.00 %'; span.style.color = 'inherit'; });
        document.querySelector('#total-weight-display').textContent = `0.00 %`;
        document.querySelector('#total-loi').textContent = `0.00 %`;
        document.querySelector('#si-al-ratio').textContent = 'N/A';
        document.querySelector('#fe-al-ratio').textContent = 'N/A';
        updateGlazeChart({Al2O3: 0, SiO2: 0});
        feldsparWarningDisplay.classList.remove('success-pulse'); 
        return; 
    }
    
    let umfNotMet = [];
    const oxidesToCheck = [...RO_FLUXES.filter(o => o !== 'K2O' && o !== 'Na2O'), ...R2O3_AMPHOTERICS, ...RO2_GLASS_FORMERS]; 
    for (const oxide of oxidesToCheck) {
        if (umfNeededMol[oxide] > 0.0001) { umfNotMet.push(oxide); }
    }
    const calculationSuccessful = (umfNotMet.length === 0);

    document.querySelectorAll('#recipe-tbody tr').forEach(row => {
        const rawName = row.querySelector('.raw-name')?.value;
        const weightSpanContainer = row.querySelector('.calculated-weight-cell'); 
        const weightSpan = weightSpanContainer.querySelector('.calculated-weight'); 
        weightSpan.style.color = '#28a745'; 
        
        const oldWarning = weightSpanContainer.querySelector('.raw-material-warning-text');
        if (oldWarning) { oldWarning.remove(); }

        if (rawName && calculatedWeights.hasOwnProperty(rawName)) {
            const rawWeight = calculatedWeights[rawName];
            const weightPercentage = round((rawWeight / totalBatchWeight) * 100, 2); 
            
            if (weightPercentage < 0.01) { 
                weightSpan.textContent = '0.00 %'; 
                weightSpan.style.color = '#dc3545'; 
                let unsatisfiedOxidesList = [];
                for(const oxide in umfNeededMol) {
                    if (umfNeededMol[oxide] > 0.0001 && RAW_MATERIAL_DATA[rawName]?.[oxide] > 0) { unsatisfiedOxidesList.push(oxide); }
                }
                let hintText = '';
                if (!calculationSuccessful && unsatisfiedOxidesList.length > 0) { hintText = `請選擇 ${unsatisfiedOxidesList.join('/')} 來源`; } 
                else if (calculationSuccessful) { hintText = '配方計算完畢，此原料可移除'; } 
                else { hintText = '此原料無作用'; }
                const warningText = document.createElement('span');
                warningText.className = 'raw-material-warning-text'; 
                warningText.textContent = `(${hintText})`;
                weightSpanContainer.appendChild(warningText);
            } else {
                weightSpan.textContent = `${weightPercentage.toFixed(2)} %`; 
            }
        } else if (rawName === '') {
            weightSpan.textContent = '0.00 %'; 
            weightSpan.style.color = 'inherit';
        } else {
            weightSpan.textContent = '0.00 %'; 
            weightSpan.style.color = 'inherit';
            const hintText = calculationSuccessful ? '配方計算完畢，此原料可移除' : '此原料無作用';
            const warningText = document.createElement('span');
            warningText.className = 'raw-material-warning-text';
            warningText.textContent = `(${hintText})`;
            weightSpanContainer.appendChild(warningText);
            weightSpan.style.color = '#dc3545';
        }
    });

    document.querySelector('#total-weight-display').textContent = `100.00 %`; 
    const finalLOIPercentage = round((totalLOI / totalBatchWeight) * 100, 2);
    document.querySelector('#total-loi').textContent = `${finalLOIPercentage.toFixed(2)} %`; 
    const siAlRatioDenom = (umfOutput.Al2O3 || 0);
    const calculatedRatio = (siAlRatioDenom > 0) ? round((umfOutput.SiO2 || 0) / siAlRatioDenom, 2).toFixed(2) : 'N/A';
    document.querySelector('#si-al-ratio').textContent = (calculatedRatio !== 'N/A') ? `1:${calculatedRatio}` : 'N/A';
    const feAlRatio = (umfOutput.Fe2O3 || 0);
    document.querySelector('#fe-al-ratio').textContent = (siAlRatioDenom > 0) ? round(feAlRatio / siAlRatioDenom, 3).toFixed(3) : 'N/A';

    updateGlazeChart(umfTarget);
    
    if (!calculationSuccessful) {
        feldsparWarningDisplay.textContent = `【警告】有 ${umfNotMet.length} 個氧化物目標未滿足 (例如: ${umfNotMet.join(', ').substring(0, 50)}...)。請添加或調整原料。`;
        feldsparWarningDisplay.classList.remove('notice-box');
        feldsparWarningDisplay.classList.add('error-box');
        roTotalDisplay.style.color = '#dc3545'; 
        feldsparWarningDisplay.classList.remove('success-pulse');
    } else {
        feldsparWarningDisplay.textContent = "【成功】配方計算完畢，請檢查配方重量。";
        feldsparWarningDisplay.classList.remove('error-box');
        feldsparWarningDisplay.classList.add('notice-box');
        roTotalDisplay.style.color = '#28a745';
        feldsparWarningDisplay.classList.remove('success-pulse'); 
        void feldsparWarningDisplay.offsetWidth; 
        feldsparWarningDisplay.classList.add('success-pulse'); 
        setTimeout(() => { feldsparWarningDisplay.classList.remove('success-pulse'); }, 2000); 
    }
}

function updateGlazeChart(umfOutput) {
    const al2o3 = umfOutput.Al2O3 || 0;
    const sio2 = umfOutput.SiO2 || 0;
    const pointElement = document.getElementById('current-glaze-point');
    const valueElement = pointElement ? pointElement.querySelector('.point-value') : null;
    if (!pointElement) return;
    if (al2o3 === 0 && sio2 === 0) { pointElement.style.display = 'none'; return; }
    pointElement.style.display = 'block';

    const MAX_SIO2 = 10.0;   
    const MAX_AL2O3 = 1.0; 
    let xPercent = (sio2 / MAX_SIO2) * 100;
    let yPercent = (al2o3 / MAX_AL2O3) * 100;
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));
    
    pointElement.style.left = `${xPercent}%`;
    pointElement.style.bottom = `${yPercent}%`; 
    if (valueElement) { valueElement.textContent = `Al₂O₃: ${al2o3.toFixed(3)}, SiO₂: ${sio2.toFixed(2)}`; }
    if (sio2 > MAX_SIO2 || al2o3 > MAX_AL2O3 || sio2 < 0 || al2o3 < 0) { pointElement.style.backgroundColor = '#dc3545'; } else { pointElement.style.backgroundColor = '#007bff'; }
}

// =========================================================
// 【V5.1 新增】一鍵複製 Word 格式技術 (完美對齊與隱形表格)
// =========================================================

function copyUMFToClipboard() {
    const otherRoOxides = ['CaO', 'MgO', 'BaO', 'ZnO', 'SrO', 'PbO', 'Li2O'];
    const r2o3Oxides = ['Al2O3', 'Fe2O3', 'Cr2O3', 'B2O3', 'P2O5'];
    const ro2Oxides = ['SiO2', 'TiO2', 'SnO2', 'ZrO2'];
    
    const space = '&nbsp;&nbsp;&nbsp;&nbsp;'; // 使用隱藏寬白拉開距離
    
    let roText = '';
    const knaoSum = parseFloat(document.getElementById('umf-KNaO-sum').value) || 0;
    const k2oVal = parseFloat(document.getElementById('umf-K2O').value) || 0;
    const na2oVal = parseFloat(document.getElementById('umf-Na2O').value) || 0;
    
    if (knaoSum > 0) {
        roText += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;"><span style="color: #006400; font-weight: bold;">KNaO</span>${space}${knaoSum.toFixed(3)}</p>`;
    }
    if (k2oVal > 0 || knaoSum > 0) {
        roText += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">K2O${space}${k2oVal.toFixed(4)}</p>`;
    }
    if (na2oVal > 0 || knaoSum > 0) {
        roText += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">Na2O${space}${na2oVal.toFixed(4)}</p>`;
    }

    otherRoOxides.forEach(ox => {
        const val = parseFloat(document.getElementById('umf-' + ox).value) || 0;
        if (val > 0) {
            roText += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">${ox}${space}${val.toFixed(4)}</p>`;
        }
    });

    let r2o3Text = '';
    r2o3Oxides.forEach(ox => {
        const val = parseFloat(document.getElementById('umf-' + ox).value) || 0;
        if (val > 0) {
            if (ox === 'Al2O3') {
                r2o3Text += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;"><span style="color: red; font-weight: bold;">${ox}</span>${space}${val.toFixed(4)}</p>`;
            } else {
                r2o3Text += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">${ox}${space}${val.toFixed(4)}</p>`;
            }
        }
    });

    let ro2Text = '';
    ro2Oxides.forEach(ox => {
        const val = parseFloat(document.getElementById('umf-' + ox).value) || 0;
        if (val > 0) {
            if (ox === 'SiO2') {
                ro2Text += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;"><span style="color: blue; font-weight: bold;">${ox}</span>${space}${val.toFixed(4)}</p>`;
            } else {
                ro2Text += `<p style="margin: 0; padding: 0; line-height: 1.2; font-size: 10pt;">${ox}${space}${val.toFixed(4)}</p>`;
            }
        }
    });

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

function copyRecipeToClipboard() {
    let recipeRowsHTML = '';
    let totalWeight = 0;
    let hasRecipe = false;
    
    document.querySelectorAll('#recipe-tbody tr').forEach(row => {
        const rawName = row.querySelector('.raw-name')?.value;
        const weightSpan = row.querySelector('.calculated-weight');
        
        if (rawName && weightSpan) {
            const weight = parseFloat(weightSpan.textContent.trim().replace(' %', ''));
            if (rawName && !isNaN(weight) && weight > 0) {
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
        }
    });

    if (!hasRecipe) {
        alert("配方未成功計算或沒有任何原料重量 > 0。請先點擊「重新計算配方」。");
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
    executeCopy(wordHtmlPayload, "原料配方結果");
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
        alert(`🎉 ${typeName} 已成功複製！請直接開啟 Word 貼上 (Ctrl+V)。`);
    } catch (err) {
        console.error('複製失敗: ', err);
        alert('複製失敗，您的瀏覽器可能不支援此功能。');
    }
    
    selection.removeAllRanges();
    document.body.removeChild(container);
}

document.addEventListener('DOMContentLoaded', () => {
    generateRawMaterialSelect();
    addRecipeRow('A200'); addRecipeRow('滑石'); addRecipeRow('石灰石'); addRecipeRow('高嶺土'); addRecipeRow('石英');

    document.querySelectorAll('.umf-inputs input[type="number"]').forEach(input => {
        if (input.id === 'umf-KNaO-sum') { input.addEventListener('input', updateKNaOInputs); } 
        else if (RO_FLUXES.some(oxide => input.id.includes(oxide)) && input.readOnly) { } 
        else if (RO_FLUXES.some(oxide => input.id.includes(oxide))) { input.addEventListener('input', updateROTotal); } 
        else { input.addEventListener('input', () => calculateBatchFromUMF(false)); }
    });

    calculateBtn.addEventListener('click', () => calculateBatchFromUMF(false));
    addRawBtn.addEventListener('click', () => addRecipeRow());
    document.getElementById('copy-umf-btn').addEventListener('click', copyUMFToClipboard);
    document.getElementById('copy-batch-btn').addEventListener('click', copyRecipeToClipboard);

    updateKNaOInputs();
    calculateBatchFromUMF(true);
});