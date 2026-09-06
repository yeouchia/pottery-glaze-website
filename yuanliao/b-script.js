// ===================================================
// 陶瓷釉藥賽格式計算器 V10.7 JavaScript 核心邏輯
// 作用：處理數據、計算釉式、控制介面互動
// 【V10.7.5 更新】強制 Word 表格極致緊湊排版 (消除預設段落行高)
// ===================================================

// --- A. 數據庫：氧化物分子量 ---
const OXIDE_MOL_WEIGHT = {
    'K2O': 94.20, 'Na2O': 61.98, 'CaO': 56.08, 'MgO': 40.31,
    'Li2O': 29.88, 'ZnO': 81.38, 'BaO': 153.33, 'SrO': 103.62,
    'PbO': 223.20, 'Al2O3': 101.96, 'Fe2O3': 159.69, 'Cr2O3': 152.00,
    'B2O3': 69.62, 'SiO2': 60.09, 'TiO2': 79.88, 'SnO2': 150.71,
    'ZrO2': 123.22, 'P2O5': 141.94
};

// --- B. 數據庫：原料化學組成 ---
const RAW_MATERIAL_DATA = {
    '釜戶長石': { K2O: 0.0683, Na2O: 0.0524, CaO: 0.0059, MgO: 0.0001, Al2O3: 0.1659, Fe2O3: 0.0012, SiO2: 0.7026, LOI: 0.0000 },
    'A200': { K2O: 0.0460, Na2O: 0.0980, CaO: 0.0070, MgO: 0.0010, Al2O3: 0.2330, Fe2O3: 0.0007, SiO2: 0.6070, LOI: 0.0000 },
    '日化長石': { K2O: 0.0436, Na2O: 0.0339, CaO: 0.0032, MgO: 0.0001, Al2O3: 0.1262, Fe2O3: 0.0016, SiO2: 0.7814, LOI: 0.0000 },
    '澳洲鉀長石': { K2O: 0.1080, Na2O: 0.0370, Al2O3: 0.1880, SiO2: 0.6590, LOI: 0.0000 },
    '葉長石A38': { K2O: 0.0050, Na2O: 0.0060, CaO: 0.0030, MgO: 0.0010, Li2O: 0.0400, Al2O3: 0.1600, Fe2O3: 0.0010, SiO2: 0.7800, LOI: 0.0000 },
    '鋰輝石T38': { K2O: 0.0010, Na2O: 0.0040, CaO: 0.0020, MgO: 0.0010, Li2O: 0.0730, Al2O3: 0.2700, Fe2O3: 0.0030, SiO2: 0.6400, LOI: 0.0000 },
    '合成土灰': { CaO: 0.359, MgO: 0.061, Al2O3: 0.027, P2O5: 0.027, SiO2: 0.174, LOI: 0.352 },
    '鈉硼酸鈣': { Na2O: 0.08, CaO: 0.20, B2O3: 0.40, SiO2: 0.32, LOI: 0.00 }, 
    '1124熔塊': { Na2O: 0.1613, CaO: 0.1248, ZnO: 0.1044, Al2O3: 0.0833, B2O3: 0.2872, SiO2: 0.7655, LOI: 0.0000 },
    'G2溶塊': { Na2O: 0.02, CaO: 0.15, B2O3: 0.05, SiO2: 0.78, LOI: 0.00 }, 
    '850溶塊': { Na2O: 0.1, CaO: 0.1, Al2O3: 0.08, SiO2: 0.72, LOI: 0.00 }, 
    '3110溶塊': { K2O: 0.0253, Na2O: 0.1521, CaO: 0.0624, Al2O3: 0.0352, SiO2: 0.6983, B2O3: 0.0267, LOI: 0.0000 }, 
    '3134熔塊': { K2O: 0.0000, Na2O: 0.1014, CaO: 0.1951, Al2O3: 0.0200, SiO2: 0.4546, B2O3: 0.2279, LOI: 0.0010 },

    // ==== 碳酸鹽 / 氧化物類 (Carbonates / Oxides) ====
    '石灰石': { CaO: 0.5600, LOI: 0.4400 }, 
    '輕鈣': { CaO: 0.5600, LOI: 0.4400 }, 
    '碳酸鎂': { MgO: 0.4786, LOI: 0.5214 },
    '氧化鎂': { MgO: 1.0000, LOI: 0.0000 },
    '碳酸鋇': { BaO: 0.7767, LOI: 0.2233 },
    '鋅': { ZnO: 1.0000, LOI: 0.0000 }, 
    '白雲石': { CaO: 0.304, MgO: 0.218, LOI: 0.478 }, 
    '碳酸鉀': { K2O: 0.6816, LOI: 0.3184 },
    '碳酸鈉': { Na2O: 0.5847, LOI: 0.4153 },
    '碳酸鋰': { Li2O: 0.4044, LOI: 0.5956 },
    '碳酸鍶': { SrO: 0.7019, LOI: 0.2981 }, 
    '氧化鍶': { SrO: 1.0000, LOI: 0.0000 },
    
    // ==== 黏土 / 穩定劑類 (Clays / Stabilizers) ====
    '高嶺土': { Al2O3: 0.3950, SiO2: 0.4650, LOI: 0.1400 },
    '滑石': { MgO: 0.3170, SiO2: 0.6350, LOI: 0.0480 },
    '硼酸': { B2O3: 0.5629, LOI: 0.4371 }, 
    '硼砂': { Na2O: 0.1625, B2O3: 0.3562, LOI: 0.4813 }, 
    '氧化鋁': { Al2O3: 1.0000, LOI: 0.0000 },
    '氧化鐵': { Fe2O3: 1.0000, LOI: 0.0000 },
    '氧化鉻': { Cr2O3: 1.0000, LOI: 0.0000 },
    '球土': { K2O: 0.0110, Na2O: 0.0020, CaO: 0.0030, MgO: 0.0020, TiO2: 0.0040, Al2O3: 0.3500, Fe2O3: 0.0090, SiO2: 0.4570, LOI: 0.1620 }, 
    
    // ==== 玻璃形成劑類 (Glass Formers) ====
    '石英': { SiO2: 1.0000, LOI: 0.0000 },
    '矽灰石': { CaO: 0.4820, SiO2: 0.5180, LOI: 0.0000 }, 
    '二氧化鈦': { TiO2: 1.0000, LOI: 0.0000 },
    '氧化錫': { SnO2: 1.0000, LOI: 0.0000 },
    '氧化鋯': { ZrO2: 1.0000, LOI: 0.0000 },
    '鉛白': { PbO: 0.8630, LOI: 0.1370 }
};

// --- C. 定義三大類別的氧化物 ---
const RO_FLUXES = ['K2O', 'Na2O', 'CaO', 'MgO', 'Li2O', 'ZnO', 'BaO', 'SrO', 'PbO'];
const R2O3_AMPHOTERICS = ['Al2O3', 'Fe2O3', 'B2O3', 'P2O5'];
const RO2_GLASS_FORMERS = ['SiO2', 'TiO2', 'SnO2', 'ZrO2'];

// --- D. 原料分類順序 ---
const RAW_MATERIAL_GROUPS = {
    1: ['釜戶長石', 'A200', '日化長石', '澳洲鉀長石', '葉長石A38', '鋰輝石T38'],
    2: ['石灰石', '輕鈣', '碳酸鎂', '氧化鎂', '白雲石', '碳酸鋇', '碳酸鍶', '氧化鍶', '鋅', '滑石'], 
    3: ['高嶺土', '球土','氧化鋁', '氧化鐵', '氧化鉻', '硼酸', '硼砂'], 
    4: ['石英', '矽灰石', '二氧化鈦', '氧化錫', '氧化鋯'], 
    5: ['合成土灰', '鈉硼酸鈣', '1124熔塊', 'G2溶塊', '850溶塊', '3110溶塊', '3134熔塊'], 
    6: ['碳酸鉀', '碳酸鈉', '碳酸鋰', '鉛白'] 
};

// --- E. 介面元素與操作函數 ---
const recipeTableBody = document.querySelector('#recipe-table tbody');
const addRowBtn = document.querySelector('#add-row-btn');
const calculateBtn = document.querySelector('#calculate-btn');
const totalWeightDisplay = document.querySelector('#total-weight-display');

let RAW_MATERIAL_SELECT_HTML = '';

function generateRawMaterialSelect() {
    let html = '<select class="raw-name">';
    html += '<option value="">--- 請選擇原料 ---</option>'; 

    const classifiedNames = Object.values(RAW_MATERIAL_GROUPS).flat();
    const allRawMaterials = Object.keys(RAW_MATERIAL_DATA);

    for (const key of Object.keys(RAW_MATERIAL_GROUPS).sort((a, b) => a - b)) {
        let groupName = '';
        if (key == 1) groupName = '長石類 (Feldspars)';
        else if (key == 2) groupName = '碳酸鹽/氧化物 (Carbonates/Oxides)';
        else if (key == 3) groupName = '黏土/穩定劑 (Clays/Stabilizers)';
        else if (key == 4) groupName = '玻璃形成劑 (Glass Formers)';
        else if (key == 5) groupName = '特殊熔塊/釉料 (Frits/Glazes)';
        else if (key == 6) groupName = '純鹼/高活性助熔劑 (High Fluxes)';
        else groupName = '其他分類';
        
        html += `<optgroup label="${groupName}">`;
        RAW_MATERIAL_GROUPS[key].sort().forEach(name => {
            if(RAW_MATERIAL_DATA.hasOwnProperty(name)) {
                html += `<option value="${name}">${name}</option>`;
            }
        });
        html += '</optgroup>';
    }

    const unclassified = allRawMaterials.filter(name => !classifiedNames.includes(name));
    if (unclassified.length > 0) {
        html += `<optgroup label="--- 未分類原料 (請檢查數據) ---">`;
        unclassified.sort().forEach(name => {
             html += `<option value="${name}">${name}</option>`;
        });
        html += '</optgroup>';
    }

    html += '</select>';
    RAW_MATERIAL_SELECT_HTML = html;
}

function addRecipeRow(name = '', weight = '') {
    const row = recipeTableBody.insertRow();
    
    const rawSelectHtml = RAW_MATERIAL_SELECT_HTML.replace('value=""', `value="${name}"`);
    
    row.innerHTML = `
        <td>${rawSelectHtml}</td>
        <td><input type="number" value="${weight}" class="raw-weight" min="0" step="0.01" placeholder="例如: 50.00"></td>
        <td><button class="remove-row-btn">移除</button></td>
    `;
    
    row.querySelector('.remove-row-btn').addEventListener('click', function() {
        row.remove();
        updateTotalWeight();
    });
    row.querySelector('.raw-weight').addEventListener('input', updateTotalWeight);
    row.querySelector('.raw-name').addEventListener('change', updateTotalWeight); 

    updateTotalWeight();
}

function updateTotalWeight() {
    let totalWeight = 0;
    document.querySelectorAll('.raw-weight').forEach(input => {
        totalWeight += parseFloat(input.value) || 0;
    });
    totalWeightDisplay.textContent = `總計: ${totalWeight.toFixed(2)} %`;

    if (Math.abs(totalWeight - 100.0) < 0.1) {
        totalWeightDisplay.style.color = '#28a745'; 
    } else {
        totalWeightDisplay.style.color = '#dc3545'; 
    }
}


// --- F. 核心：賽格式計算邏輯 ---
function calculateSegerFormula() {
    const oxideMoles = {};
    let totalRO = 0;
    let totalLOI = 0;

    const recipe = [];
    document.querySelectorAll('#recipe-table tbody tr').forEach(row => {
        const name = row.querySelector('.raw-name').value.trim(); 
        const weight = parseFloat(row.querySelector('.raw-weight').value);
        
        if (name && weight > 0 && RAW_MATERIAL_DATA[name]) {
            recipe.push({ name, weight });
        } else if (name && weight > 0 && !RAW_MATERIAL_DATA[name]) {
            alert(`錯誤: 原料 "${name}" 找不到化學組成數據！`);
        }
    });

    if (recipe.length === 0) {
        alert("請輸入有效的原料配方。");
        return;
    }
    
    recipe.forEach(item => {
        const rawData = RAW_MATERIAL_DATA[item.name];
        
        for (const oxide in rawData) {
            const oxideRatioInRaw = rawData[oxide];

            if (oxide === 'LOI') {
                totalLOI += item.weight * oxideRatioInRaw; 
                continue;
            }

            const oxideWeightInRecipe = item.weight * oxideRatioInRaw; 
            const mole = oxideWeightInRecipe / OXIDE_MOL_WEIGHT[oxide];

            oxideMoles[oxide] = (oxideMoles[oxide] || 0) + mole;
        }
    });

    RO_FLUXES.forEach(oxide => {
        totalRO += oxideMoles[oxide] || 0;
    });

    if (totalRO === 0) {
        alert("配方中沒有 RO 組助熔劑，無法進行賽格式標準化。");
        return;
    }

    const segerFormula = {};
    for (const oxide in oxideMoles) {
        segerFormula[oxide] = oxideMoles[oxide] / totalRO;
    }

    displaySegerFormula(segerFormula, totalLOI);
}

// --- G. 輸出顯示邏輯 ---
function displaySegerFormula(seger, totalLOI) {
    const r2o3MoleDisplay = document.querySelector('#r2o3-mole');
    const ro2MoleDisplay = document.querySelector('#ro2-mole');
    const roDetails = document.querySelector('#ro-details');
    const r2o3Details = document.querySelector('#r2o3-details');
    const ro2Details = document.querySelector('#ro2-details');
    const siAlRatioDisplay = document.querySelector('#si-al-ratio');
    const totalLoiDisplay = document.querySelector('#total-loi');

    roDetails.innerHTML = '';
    r2o3Details.innerHTML = '';
    ro2Details.innerHTML = '';

    let totalR2O3 = 0;
    let totalRO2 = 0;
    let al2o3Mole = seger['Al2O3'] || 0;
    let sio2Mole = seger['SiO2'] || 0;

    const k2oMole = seger['K2O'] || 0;
    const na2oMole = seger['Na2O'] || 0;
    const knaoMole = k2oMole + na2oMole; 

    const alkaliOxides = []; 
    const otherRoOxides = []; 
    let hasAlkali = false;

    RO_FLUXES.forEach(oxide => {
        if (seger[oxide] > 0) {
            if (oxide === 'K2O' || oxide === 'Na2O') {
                alkaliOxides.push({ oxide, mole: seger[oxide] });
                hasAlkali = true;
            } else {
                otherRoOxides.push({ oxide, mole: seger[oxide] });
            }
        }
    });

    alkaliOxides.sort((a, b) => a.oxide.localeCompare(b.oxide));
    otherRoOxides.sort((a, b) => a.oxide.localeCompare(b.oxide));

    alkaliOxides.forEach(item => {
        roDetails.innerHTML += `<p><span>${item.oxide}</span><span>${item.mole.toFixed(3)}</span></p>`;
    });

    if (hasAlkali && knaoMole > 0) {
        roDetails.innerHTML += `<p class="knao-total"><span>KNaO</span><span>${knaoMole.toFixed(3)}</span></p>`;
    }

    otherRoOxides.forEach(item => {
        roDetails.innerHTML += `<p><span>${item.oxide}</span><span>${item.mole.toFixed(3)}</span></p>`;
    });
    
    R2O3_AMPHOTERICS.forEach(oxide => {
        if (seger[oxide] > 0) {
            totalR2O3 += seger[oxide];
            r2o3Details.innerHTML += `<p><span>${oxide}</span><span>${seger[oxide].toFixed(3)}</span></p>`;
        }
    });

    RO2_GLASS_FORMERS.forEach(oxide => {
        if (seger[oxide] > 0) {
            totalRO2 += seger[oxide];
            ro2Details.innerHTML += `<p><span>${oxide}</span><span>${seger[oxide].toFixed(3)}</span></p>`;
        }
    });

    r2o3MoleDisplay.textContent = totalR2O3.toFixed(3);
    ro2MoleDisplay.textContent = totalRO2.toFixed(3);

    totalLoiDisplay.textContent = `${totalLOI.toFixed(2)} %`;
    
    let ratio = 'N/A';
    if (al2o3Mole > 0) {
        ratio = (sio2Mole / al2o3Mole).toFixed(2);
        siAlRatioDisplay.textContent = `${ratio} : 1`;
    } else {
        siAlRatioDisplay.textContent = `無限大 (Al2O3=0)`;
    }
}

// =========================================================
// 【修改】一鍵複製 Word 格式功能 (強制緊湊排版，消除預設行高)
// =========================================================

function copyToWordFormat() {
    let recipeRowsHTML = '';
    let totalWeight = 0;
    let hasRecipe = false;
    
    document.querySelectorAll('#recipe-table tbody tr').forEach(row => {
        const rawName = row.querySelector('.raw-name').value.trim();
        const weight = parseFloat(row.querySelector('.raw-weight').value) || 0;
        
        if (rawName && weight > 0) {
            // 強制使用 <p> 並設定 margin: 0 和 line-height: 1 徹底消除 Word 行距
            recipeRowsHTML += `
                <tr>
                    <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                        <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;">${rawName}</p>
                    </td>
                    <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                        <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;">${weight}</p>
                    </td>
                </tr>`;
            totalWeight += weight;
            hasRecipe = true;
        }
    });

    if (!hasRecipe) {
        alert("請先輸入原料並計算出結果，再進行複製！");
        return;
    }

    const getGroupText = (selector) => {
        let html = '';
        document.querySelectorAll(`${selector} p`).forEach(p => {
            const spans = p.querySelectorAll('span');
            if (spans.length === 2) {
                let name = spans[0].textContent;
                let val = spans[1].textContent;
                // 同理，將釉式的每一行數值也包裝進無間距的 <p> 中
                if (name === 'KNaO') {
                    html += `<p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;"><b>${name}${val}</b></p>`;
                } else {
                    html += `<p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;">${name}${val}</p>`;
                }
            }
        });
        return html;
    };
    
    const roText = getGroupText('#ro-details');
    const r2o3Text = getGroupText('#r2o3-details');
    const ro2Text = getGroupText('#ro2-details');
    const siAlRatio = document.querySelector('#si-al-ratio').textContent;
    const totalLoi = document.querySelector('#total-loi').textContent;

    // 將所有元素使用 <p style="margin:0"> 控制，徹底壓扁表格
    const wordHtmlPayload = `
    <div style="font-family: '微軟正黑體', 'Microsoft JhengHei', sans-serif; background-color: white; color: black;">
        
        <p style="font-weight: bold; font-size: 11pt; margin: 0 0 3px 0;">原料配方 (重量 %)</p>
        <table style="border-collapse: collapse; width: 40%; text-align: left; border: 1px solid black; background-color: white;">
            <tr>
                <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;">原料名稱</p>
                </td>
                <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt;">重量 (%)</p>
                </td>
            </tr>
            ${recipeRowsHTML}
            <tr>
                <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt; color: blue; font-weight: bold;">總計</p>
                </td>
                <td style="border: 1px solid black; padding: 0 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt; color: blue; font-weight: bold;">${totalWeight.toFixed(2)}</p>
                </td>
            </tr>
        </table>
        
        <p style="margin: 5px 0; font-size: 2pt;">&nbsp;</p>
        
        <table style="border-collapse: collapse; width: 100%; text-align: left; border: 1px solid black; background-color: white;">
            <tr>
                <td colspan="3" style="border: 1px solid black; padding: 2px; text-align: center; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 12pt; font-weight: bold;">釉藥分析結果</p>
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: #d4edda;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt; font-weight: bold;">RO 組 - 助熔劑</p>
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: #f8d7da;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt; font-weight: bold;">R₂O₃ 組 - 中性/穩定劑</p>
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: #d1ecf1;">
                    <p style="margin: 0; padding: 0; line-height: 1; font-size: 10pt; font-weight: bold;">RO₂ 組 - 酸性/形成劑</p>
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 2px 5px; vertical-align: top; background-color: #d4edda;">
                    ${roText}
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; vertical-align: top; background-color: #f8d7da;">
                    ${r2o3Text}
                </td>
                <td style="border: 1px solid black; padding: 2px 5px; vertical-align: top; background-color: #d1ecf1;">
                    ${ro2Text}
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1.1; font-size: 10pt;"><strong>SiO₂ : Al₂O₃ 比</strong></p>
                    <p style="color: #c0392b; font-weight: bold; margin: 0; padding: 0; line-height: 1.1; font-size: 10pt;">${siAlRatio}</p>
                </td>
                <td colspan="2" style="border: 1px solid black; padding: 2px 5px; background-color: white;">
                    <p style="margin: 0; padding: 0; line-height: 1.1; font-size: 10pt;"><strong>總燒失量 (L.O.I.)</strong></p>
                    <p style="color: #c0392b; font-weight: bold; margin: 0; padding: 0; line-height: 1.1; font-size: 10pt;">${totalLoi}</p>
                </td>
            </tr>
        </table>
    </div>
    `;

    executeCopy(wordHtmlPayload);
}

function executeCopy(htmlContent) {
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
        alert('🎉 已成功複製！請直接開啟 Word 貼上 (Ctrl+V)。');
    } catch (err) {
        console.error('複製失敗: ', err);
        alert('複製失敗，您的瀏覽器可能不支援此功能。');
    }
    
    selection.removeAllRanges();
    document.body.removeChild(container);
}

// --- H. 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    generateRawMaterialSelect();
    
    addRecipeRow('釜戶長石', '50');
    addRecipeRow('石灰石', '20');
    addRecipeRow('高嶺土', '10');
    addRecipeRow('石英', '20');

    addRowBtn.addEventListener('click', () => addRecipeRow());
    calculateBtn.addEventListener('click', calculateSegerFormula);
    
    // 綁定一鍵複製按鈕
    document.getElementById('copy-word-btn').addEventListener('click', copyToWordFormat);

    updateTotalWeight();
});