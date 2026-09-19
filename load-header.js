document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById('site-header-container');
    if (container) {
        // 判斷是否為直接開單一檔案或外部搜尋進入（非站內連結進入）
        const isDirectOpen = !document.referrer || !document.referrer.includes(window.location.hostname);
        
        if (isDirectOpen) {
            container.innerHTML = `
                <style>
                    /* 頂部導覽列精裝版樣式（含手機版自動壓縮） */
                    .site-top-header {
                        max-width: 1000px;
                        margin: 0 auto 15px auto;
                        background: #14213d;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-family: 'Microsoft JhengHei', sans-serif;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    }
                    .site-top-header a.brand-link {
                        color: #fca311;
                        text-decoration: none;
                        font-weight: 800;
                        font-size: 0.95rem;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .site-top-header a.return-btn {
                        background: #fca311;
                        color: #14213d;
                        padding: 6px 16px;
                        border-radius: 20px;
                        text-decoration: none;
                        font-weight: 800;
                        font-size: 0.85rem;
                        white-space: nowrap;
                        box-shadow: 0 2px 6px rgba(252, 163, 17, 0.3);
                        transition: transform 0.2s;
                    }
                    .site-top-header a.return-btn:hover {
                        transform: scale(1.05);
                    }

                    /* 手機版 RWD 極致壓縮 */
                    @media screen and (max-width: 768px) {
                        .site-top-header {
                            padding: 8px 12px !important;
                            margin: 0 auto 10px auto !important;
                            border-radius: 8px !important;
                        }
                        .site-top-header a.brand-link {
                            font-size: 3.2vw !important; /* 自動隨手機螢幕縮放，絕不換行過多 */
                            gap: 5px !important;
                        }
                        .site-top-header a.return-btn {
                            padding: 5px 12px !important;
                            font-size: 3.2vw !important;
                        }
                    }
                </style>

                <div class="site-top-header">
                    <a href="../index.html" class="brand-link">
                        <i class="fa-solid fa-jar" style="font-size: 1.1rem;"></i> 
                        <span>陶藝與釉藥調配 | 黃明文老師</span>
                    </a>
                    <a href="../index.html" class="return-btn">
                        返回首頁大廳
                    </a>
                </div>
            `;
        }
    }
});