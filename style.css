/* style.css */

/* --- 16:9 簡報預覽外框 --- */
.slide-preview-frame {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
    background: #ffffff;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
    display: none; /* 預設隱藏，由 JS 控制顯示哪一頁 */
}

.slide-preview-frame.active {
    display: flex; /* 只顯示有 active class 的幻燈片 */
    flex-direction: column;
}

/* 簡報頂部裝飾條 */
.slide-header {
    height: 8px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
    width: 100%;
}

/* 簡報內文區 */
.slide-content {
    flex: 1;
    padding: 2.5rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.slide-title {
    font-size: 2rem;
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 0.5rem;
    line-height: 1.2;
}

.slide-bullets {
    font-size: 1.2rem;
    color: #334155;
    line-height: 1.6;
    margin-top: 1rem;
}
.slide-bullets li {
    margin-bottom: 0.8rem;
    display: flex;
    align-items: flex-start;
}
.slide-bullets li::before {
    content: "■";
    color: #2563eb;
    font-size: 0.8em;
    margin-right: 12px;
    margin-top: 4px;
}

/* 簡報右側/底圖佔位 */
.slide-image-box {
    border-radius: 8px;
    background-color: #f1f5f9;
    background-size: cover;
    background-position: center;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
}

/* 出處標記上標 */
.cite-mark {
    font-size: 0.7em;
    vertical-align: super;
    color: #7c3aed;
    font-weight: bold;
    margin-left: 2px;
}

/* 簡報頁尾 */
.slide-footer {
    padding: 1rem 3rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: #94a3b8;
}

/* --- A4 論文文件預覽外觀 --- */
.doc-preview-frame {
    width: 100%;
    max-width: 210mm;
    min-height: 297mm;
    background: white;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    padding: 25mm 20mm;
    margin: 0 auto;
    font-family: "BiauKai", "DFKai-SB", "KaiTi", serif;
    color: #1a1a1a;
    line-height: 1.8;
    text-align: justify;
}

.doc-preview-frame h1 { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 2rem; }
.doc-preview-frame h2 { font-size: 16pt; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #000; padding-bottom: 0.2rem;}
.doc-preview-frame h3 { font-size: 14pt; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.doc-preview-frame p { font-size: 12pt; text-indent: 2em; margin-bottom: 1rem; }

/* 參考資料頁區塊 */
.references-section {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 2px solid #000;
}
.references-section p {
    text-indent: 0;
    padding-left: 2em;
    text-indent: -2em; /* 懸掛縮排 (學術規範) */
    font-size: 12pt;
    margin-bottom: 0.5rem;
}
