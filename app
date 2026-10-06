// app.js

let currentMode = 'slide';

// 頁面載入時，自動從瀏覽器記憶中讀取 API Key
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        document.getElementById('api-key-input').value = savedApiKey;
    }
});

// 切換模式函式
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

// 開始 AI 智慧排版處理
async function startAIParsing() {
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKey = apiKeyInput.value.trim();
    const fileInput = document.getElementById('file-input');
    const container = document.getElementById('preview-container');
    const exportBtn = document.getElementById('export-btn');

    if (!apiKey) {
        alert("請先輸入您的 Gemini API Key！");
        return;
    }

    // 自動將 API Key 儲存到瀏覽器，下次不用再輸入
    localStorage.setItem('gemini_api_key', apiKey);

    if (fileInput.files.length === 0) {
        alert("請先上傳您的原始文字檔案 (.txt 或 .md)！");
        return;
    }

    const file = fileInput.files[0];
    const fileContent = await file.text();

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-3 py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p class="text-gray-600 text-sm font-medium">Gemini AI 正在深度運算與排版中...</p>
        </div>
    `;

    try {
        const htmlResult = await callGeminiAPI(apiKey, fileContent, currentMode);
        container.innerHTML = htmlResult;
        exportBtn.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="text-red-500 text-center p-6">
                <p class="font-bold">API 呼叫失敗</p>
                <p class="text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

// 實際發送請求至 Gemini API 的函式
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
        throw new Error(errData.error?.message || "API 連線發生錯誤");
    }

    const data = await response.json();
    let rawHtml = data.candidates[0].content.parts[0].text.trim();
    rawHtml = rawHtml.replace(/^```html/, '').replace(/```$/, '').trim();

    return rawHtml;
}
