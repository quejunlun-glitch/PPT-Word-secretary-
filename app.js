// app.js

let currentMode = 'slide';
let currentSource = 'file'; 

window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        document.getElementById('api-key-input').value = savedApiKey;
    }
});

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

function switchInputSource(source) {
    currentSource = source;
    
    ['file', 'text', 'url'].forEach(s => {
        document.getElementById(`tab-${s}`).className = "flex-1 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 transition";
        document.getElementById(`source-${s}`).classList.add('hidden');
        document.getElementById(`source-${s}`).classList.remove('block');
    });

    document.getElementById(`tab-${source}`).className = "flex-1 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm text-blue-600 transition";
    document.getElementById(`source-${source}`).classList.remove('hidden');
    document.getElementById(`source-${source}`).classList.add('block');
}

async function startAIParsing() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const container = document.getElementById('preview-container');

    if (!apiKey) {
        alert("⚠️ 請先輸入您的 Gemini API Key！");
        return;
    }
    localStorage.setItem('gemini_api_key', apiKey);

    let fileContent = "";

    try {
        if (currentSource === 'file') {
            const fileInput = document.getElementById('file-input');
            if (fileInput.files.length === 0) throw new Error("請先上傳檔案！");
            
            const file = fileInput.files[0];
            
            // 判斷是否為 Word 檔 (.docx)
            if (file.name.endsWith('.docx')) {
                // 使用 mammoth.js 來解析 Word 檔
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                fileContent = result.value;
                
                if (!fileContent.trim()) {
                    throw new Error("成功讀取 Word 檔，但裡面似乎沒有文字！");
                }
            } else {
                // 一般純文字檔 (.txt, .md)
                fileContent = await file.text();
            }
        } 
        else if (currentSource === 'text') {
            const textInput = document.getElementById('text-input');
            if (!textInput.value.trim()) throw new Error("請在輸入框中貼上內容！");
            fileContent = textInput.value.trim();
        } 
        else if (currentSource === 'url') {
            const urlInput = document.getElementById('url-input').value.trim();
            if (!urlInput) throw new Error("請輸入網址！");
            
            container.innerHTML = `<div class="flex flex-col items-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p class="text-sm mt-3">正在嘗試抓取網址資料...</p></div>`;
            const fetchRes = await fetch(urlInput);
            if (!fetchRes.ok) throw new Error("無法讀取該網址，可能是對方網站安全限制(CORS)阻擋。建議使用「直接貼上」功能。");
            fileContent = await fetchRes.text();
        }

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-3 py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                <p class="text-gray-600 text-sm font-medium">✨ 內容讀取成功！Gemini AI 正在為您智慧排版...</p>
            </div>
        `;

        const htmlResult = await callGeminiAPI(apiKey, fileContent, currentMode);
        container.innerHTML = htmlResult;

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="text-red-500 bg-red-50 border border-red-200 rounded-lg text-center p-6 mx-4">
                <p class="font-bold text-lg mb-2">❌ 讀取或排版失敗</p>
                <p class="text-sm">${error.message}</p>
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
        throw new Error("API 發生錯誤，請確認金鑰是否正確且額度未滿。(" + (errData.error?.status || "未知錯誤") + ")");
    }

    const data = await response.json();
    let rawHtml = data.candidates[0].content.parts[0].text.trim();
    rawHtml = rawHtml.replace(/^```html/, '').replace(/```$/, '').trim();

    return rawHtml;
}
