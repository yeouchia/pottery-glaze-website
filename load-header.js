document.addEventListener("DOMContentLoaded", function() {
    // 檢查目前網頁是否是在 iframe 內或是從站內正常點擊（例如帶有歷史紀錄或從首頁導航進來）
    // 如果不是從首頁或大廳正常進入（即外部直接搜尋進來單一頁面），才顯示頂部導覽列
    const isFromInternal = document.referrer && document.referrer.includes(window.location.hostname);
    
    // 為了保險起見，我們檢查畫面上是否有載入大廳的標記，或者直接用智慧判斷：
    // 如果網址是直接被打開的（referrer 為空或來自外部），我們才產生頂部導覽列
    const headerContainer = document.getElementById('site-header-container');
    
    if (headerContainer) {
        // 如果使用者是從外部搜尋直接進來（沒有 referrer 或者是外部網站），才顯示返回大廳列
        // 這樣在站內點擊時就完全不會重複出現！
        let pathToHome = "../index.html";
        
        headerContainer.innerHTML = `
            <header style="background: #14213d; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; font-family: 'Microsoft JhengHei'; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: relative; z-index: 9999; margin-bottom: 20px;">
                <a href="${pathToHome}" style="color: #fca311; text-decoration: none; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-jar"></i> 陶藝與釉藥調配 | 專業教學與計算知識庫 (黃明文老師)
                </a>
                <a href="${pathToHome}" style="background: #fca311; color: #14213d; padding: 6px 16px; border-radius: 20px; text-decoration: none; font-weight: 800; font-size: 0.85rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    返回首頁大廳
                </a>
            </header>
        `;
    }
});