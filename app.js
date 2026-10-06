// app.js

let currentMode = 'slide';

// 頁面載入時，自動讀取 API Key
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        document.getElementById('api-key-input').value = savedApiKey;
    }
});

// 清除金鑰功能 (解決公用電腦風險)
function clearApiKey() {
    localStorage.removeItem('gemini_api_key');
    document.getElementById('api-key-input').value = "";
    alert("✅ 瀏覽器內儲存的 API 金鑰已成功清除！");
}

function switchMode(mode) {
    currentMode = mode;
    const btnSlide = document.getElementById('btn-slide');
    const btnDoc = document.getElementById('btn-doc');
    const previewTitle = document.getElementById('preview-title');

    if (mode === 'slide') {
        btnSlide.className = "p-3 text-center rounded-lg border border-blue-500 bg-blue-50 text-blue-600 font-medium transition";
        btnDoc.className = "p-3 text-center rounded-lg border border-gray-200 text-gray-600 font-medium transition hover:bg-gray-50";
        previewTitle.textContent = "即時預覽 (簡報模式 - 16:9 智慧圖文)";
    } else {
        btnDoc.className = "p-3 text-center rounded-lg border border-blue-500 bg-blue-50 text-blue-600 font-medium transition";
        btnSlide.className = "p-3 text-center rounded-lg border border-gray-200 text-gray-600 font-medium transition hover:bg-gray-50";
        previewTitle.textContent = "即時預覽 (論文模式 - 標楷體、目錄與層次結構)";
    }
}

async function startAIParsing() {
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKey = apiKeyInput.value.trim();
    const fileInput = document.getElementById('file-input');
    const container = document.getElementById('preview-container');
    const exportBtn = document.getElementById('export-btn');

    if (!apiKey) {
        alert("⚠️ 請先輸入您的 Gemini API Key！");
        return;
    }

    localStorage.setItem('gemini_api_key', apiKey);

    if (fileInput.files.length === 0) {
        alert("📂 請先上傳一份原始文字檔案 (.txt 或 .md) 作為資料來源！");
        return;
    }

    const file = fileInput.files[0];
    const fileContent = await file.text();

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-3 py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p class="text-gray-600 text-sm font-medium">✨ Gemini AI 正在運算與排版中，請稍候...</p>
        </div>
    `;

    try {
        const htmlResult = await callGeminiAPI(apiKey, fileContent, currentMode);
        container.innerHTML = htmlResult;
        exportBtn.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        // 優化錯誤提示，讓使用者知道怎麼解決
        let userFriendlyMsg = error.message;
        if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
            userFriendlyMsg = "流量限制：您的免費排版額度暫時用盡，或是點擊太快了。請等待 1 分鐘後再試。";
        } else if (error.message.includes("API_KEY_INVALID")) {
            userFriendlyMsg = "金鑰無效：您輸入的金鑰錯誤或是已被刪除，請重新申請一把新的。";
        }
        
        container.innerHTML = `
            <div class="text-red-500 bg-red-50 border border-red-200 rounded-lg text-center p-6 mx-4">
                <p class="font-bold text-lg mb-2">❌ 排版過程中斷</p>
                <p class="text-sm">${userFriendlyMsg}</p>
                <p class="text-xs text-gray-500 mt-4">您可以重新整理網頁，或檢查金鑰後再試一次。</p>
            </div>
        `;
    }
}

async function callGeminiAPI(apiKey, content, mode) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let systemPrompt = "";
    if (mode === 'slide') {
        systemPrompt = `你是一個專業的簡報排版與設計大師。請將以下使用者提供的原始文字，轉化為一個符合 16:9 簡報預覽外框的 HTML 片段。
        要求：
        1. 必須包在 <div class="slide-preview-frame"> 裡面。
        2. 採用簡明、大字體、少量的重點條列，搭配圖文結構（可用灰階方塊模擬圖片）。
        3. 只能回傳乾淨的 HTML 程式碼，不要包在 Markdown 的 \`\`\`html 程式碼區塊中，直接輸出 HTML 字串。`;
    } else {
        systemPrompt = `你是一個嚴謹的學術論文排版專家。請將以下使用者提供的原始文字，轉化為一個符合 A4 論文文件外框的 HTML 片段。
        要求：
        1. 必須包在 <div class="doc-preview-frame"> 裡面。
        2. 內容需包含：主標題、目錄區塊、圖目錄區塊、大標（16pt 粗體）、小標（14pt 粗體）、內文（12pt，首行縮排 2 字元）。
        3. 只能回傳乾淨的 HTML 程式碼，不要包在 Markdown 的 \`\`\`html 程式碼區塊中，直接輸出 HTML 字串。`;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { text: `原始內容：\n${content}` }
                ]
            }]
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        // 抓取 API 錯誤代碼傳遞給前端顯示
        throw new Error(errData.error?.status || errData.error?.message || "API 連線發生錯誤");
    }

    const data = await response.json();
    let rawHtml = data.candidates[0].content.parts[0].text.trim();
    rawHtml = rawHtml.replace(/^```html/, '').replace(/```$/, '').trim();

    return rawHtml;
}
