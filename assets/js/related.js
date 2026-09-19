// assets/js/related.js
// 陶藝與釉藥知識庫 - 全自動頂部品牌導流與底部相關文章精準派發引擎

document.addEventListener("DOMContentLoaded", function() {
    // 0. 自動注入專屬樣式表
    if (!document.getElementById('dynamic-global-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'dynamic-global-style';
        styleEl.innerHTML = `
            /* 頂部品牌導流橫幅樣式 */
            .top-brand-banner {
                background: linear-gradient(135deg, #14213d 0%, #1f365c 100%);
                color: white;
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                font-family: 'Microsoft JhengHei', sans-serif;
                margin-bottom: 25px;
                border-radius: 6px;
            }
            .top-brand-banner .brand-title {
                font-size: 0.95rem;
                font-weight: 700;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #e5e5e5;
                text-decoration: none;
            }
            .top-brand-banner .brand-title span {
                color: #fca311;
            }
            .top-brand-banner .home-btn {
                background-color: #fca311;
                color: #14213d;
                padding: 6px 14px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 800;
                text-decoration: none;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .top-brand-banner .home-btn:hover {
                background-color: #ffffff;
                transform: translateY(-1px);
            }

            /* 底部相關文章清單樣式 */
            .related {
                margin-top: 30px;
                padding: 16px 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            .related h3 {
                margin-top: 0;
                font-size: 1rem;
                color: #14213d;
                margin-bottom: 12px;
                border-bottom: 2px solid #fca311;
                padding-bottom: 6px;
                font-weight: 700;
            }
            .related a {
                display: block !important;          
                margin-top: 8px !important;         
                padding: 10px 14px !important;
                background-color: #ffffff !important;
                border-radius: 6px !important;
                border: 1px solid #e2e8f0 !important;
                text-decoration: none !important;   
                color: #1565c0 !important;          
                font-weight: 600 !important;        
                font-size: 0.9rem !important;
                transition: all 0.2s ease;
            }
            .related a:hover {
                background-color: #f1f5f9 !important;
                color: #0d47a1 !important;
                transform: translateX(4px);
            }
        `;
        document.head.appendChild(styleEl);
    }

    // 1. 自動檢查：若文章被獨立開啟，安插頂部品牌橫幅
    if (window.self === window.top) {
        const topBannerHtml = `
            <div class="top-brand-banner">
                <a href="../../index.html" class="top-brand-banner" style="text-decoration: none; color: inherit; margin:0; padding:0; box-shadow:none; background:none;">
                    <i class="fa-solid fa-jar" style="color: #fca311; font-size: 1.2rem; margin-right: 8px;"></i>
                    <span>陶藝與釉藥調配</span> ｜ 專業教學與計算知識庫 (黃明文老師)
                </a>
                <a href="../../index.html" class="home-btn">返回首頁大廳</a>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', topBannerHtml);
    }

    // 2. 精準辨識當前文章：從 HTML 檔名（例如 shaping-21.html）反查 knowledgeTree
    const pathname = window.location.pathname;
    const filenameMatch = pathname.match(/([a-zA-Z0-9_-]+)\.html$/);
    const currentFileName = filenameMatch ? filenameMatch[1] : '';

    if (typeof knowledgeTree === 'undefined') {
        console.warn("Knowledge base data (knowledgeTree) not found.");
        return;
    }

    let currentArticle = null;

    // 透過比對文章 ID 或 url 是否包含檔名來精準定位
    for (const group of knowledgeTree) {
        const found = group.articles.find(art => {
            return art.id === currentFileName || art.url.includes(currentFileName);
        });
        if (found) {
            currentArticle = found;
            break;
        }
    }

    const container = document.getElementById("dynamic-related-articles");
    if (!container) return;

    if (!currentArticle) {
        container.innerHTML = `
            <div class="related">
                <h3>相關文章</h3>
                <p style="font-size: 0.9rem; color: #666;">目前此文章無對應標籤資料。</p>
            </div>
        `;
        return;
    }

    // 3. 精準篩選相同 Tag 的相關文章（排除自己）
    let candidateArticles = [];
    
    knowledgeTree.forEach(group => {
        group.articles.forEach(art => {
            if (art.id !== currentArticle.id && art.tag === currentArticle.tag) {
                let adjustedUrl = art.url;
                // 處理相對路徑轉換
                if (pathname.includes('/book/')) {
                    // 計算目前在 book 底下的哪一層，動態補上 ../
                    const depth = pathname.split('/book/')[1].split('/').length - 1;
                    adjustedUrl = '../'.repeat(depth) + art.url.replace('./book/', '');
                }
                candidateArticles.push({
                    ...art,
                    resolvedUrl: adjustedUrl
                });
            }
        });
    });

    // 4. 隨機選取最多 3 篇同標籤文章
    candidateArticles.sort(() => 0.5 - Math.random());
    const selectedArticles = candidateArticles.slice(0, 3);

    // 5. 動態產生底部相關文章
    if (selectedArticles.length === 0) {
        container.innerHTML = `
            <div class="related">
                <h3>相關文章 (${currentArticle.tag})</h3>
                <p style="font-size: 0.9rem; color: #666;">目前「${currentArticle.tag}」標籤下尚無其他相關文章，歡迎繼續探索其他分類！</p>
            </div>
        `;
        return;
    }

    let linksHtml = '';
    selectedArticles.forEach(art => {
        linksHtml += `<a href="${art.resolvedUrl}">👉 ${art.title}</a>\n`;
    });

    container.innerHTML = `
        <div class="related">
            <h3>相關文章 (${currentArticle.tag})</h3>
            ${linksHtml}
        </div>
    `;
});