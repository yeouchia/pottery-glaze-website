document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById('site-header-container');
    if (container) {
        const isDirectOpen = !document.referrer || !document.referrer.includes(window.location.hostname);
        
        if (isDirectOpen) {
            container.innerHTML = `
                <style>
                    .site-top-header {
                        max-width: 1000px;
                        margin: 0 auto 10px auto;
                        background: #14213d;
                        color: white;
                        padding: 8px 15px;
                        border-radius: 8px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-family: 'Microsoft JhengHei', sans-serif;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                    }
                    .site-top-header a.brand-link {
                        color: #fca311;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 0.85rem;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .site-top-header a.return-btn {
                        background: #fca311;
                        color: #14213d;
                        padding: 4px 12px;
                        border-radius: 15px;
                        text-decoration: none;
                        font-weight: 800;
                        font-size: 0.78rem;
                        white-space: nowrap;
                    }
                    @media screen and (max-width: 768px) {
                        .site-top-header {
                            padding: 6px 10px !important;
                            margin: 0 auto 8px auto !important;
                        }
                        .site-top-header a.brand-link {
                            font-size: 2.8vw !important;
                        }
                        .site-top-header a.return-btn {
                            padding: 3px 10px !important;
                            font-size: 2.8vw !important;
                        }
                    }
                </style>

                <div class="site-top-header">
                    <a href="../index.html" class="brand-link">
                        <i class="fa-solid fa-jar"></i> 
                        <span>黃明文老師陶藝知識庫</span>
                    </a>
                    <a href="../index.html" class="return-btn">
                        返回大廳
                    </a>
                </div>
            `;
        }
    }
});