// assets/js/related.js
// 陶藝與釉藥知識庫 - 全自動頂部品牌導流與底部相關文章派發引擎

document.addEventListener("DOMContentLoaded", function() {
    // 0. 自動注入專屬樣式表（包含頂部品牌橫幅與手機最佳化之底部相關文章排版）
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

            /* 底部相關文章清單樣式 (手機最佳化輕巧版) */
            .related {
                margin-top: 20px;
                padding: 12px 16px;
                background-color: #f8f9fa;
                border-radius: 6px;
                border: 1px solid #e9ecef;
            }
            .related h3 {
                margin-top: 0;
                font-size: 0.95rem;
                color: #14213d;
                margin-bottom: 8px;
                border-bottom: 2px solid #fca311;
                padding-bottom: 4px;
            }
            .related a {
                display: block !important;          
                margin-top: 6px !important;         
                padding: 8px 10px !important;
                background-color: #ffffff !important;
                border-radius: 4px !important;
                border: 1px solid #e2e8f0 !important;
                text-decoration: none !important;   
                color: #1565c0 !important;          
                font-weight: 600 !important;        
                font-size: 0.88rem !important;
                transition: background-color 0.2s ease;
            }
            .related a:hover {
                background-color: #f1f5f9 !important;
                color: #0d47a1 !important;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // 1. 自動檢查：若文章被獨立開啟（未透過首頁 iframe），自動安插頂部品牌橫幅
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

    // 2. 自動取得當前網頁路徑與對應文章資料
    const currentPath = window.location.pathname;
    
    if (typeof knowledgeTree === 'undefined') {
        console.warn("Knowledge base data (knowledgeTree) not found.");
        return;
    }

    let currentArticle = null;
    let currentCategoryGroup = null;

    for (const group of knowledgeTree) {
        const found = group.articles.find(art => currentPath.includes(art.id) || currentPath.endsWith(art.url.replace('./', '')));
        if (found) {
            currentArticle = found;
            currentCategoryGroup = group;
            break;
        }
    }

    if (!currentArticle) return;

    // 3. 篩選相同 Tag 的相關文章
    let candidateArticles = [];
    
    knowledgeTree.forEach(group => {
        group.articles.forEach(art => {
            if (art.id !== currentArticle.id && art.tag === currentArticle.tag) {
                let adjustedUrl = art.url;
                if (currentPath.includes('/book/')) {
                    adjustedUrl = art.url.replace('./book/', '../');
                }
                candidateArticles.push({
                    ...art,
                    resolvedUrl: adjustedUrl
                });
            }
        });
    });

    // 4. 隨機選取最多 3 篇
    candidateArticles.sort(() => 0.5 - Math.random());
    const selectedArticles = candidateArticles.slice(0, 3);

    // 5. 動態產生底部相關文章
    const container = document.getElementById("dynamic-related-articles");
    if (!container) return;

    if (selectedArticles.length === 0) {
        container.innerHTML = `
            <div class="related">
                <h3>相關文章</h3>
                <p style="font-size: 0.9rem; color: #666;">目前此標籤下尚無其他相關文章，歡迎繼續探索其他分類！</p>
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