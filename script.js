let apiKey = '';
let recognition;
let isRecording = false;
let currentFiles = { html: '', css: '', js: '' };
let currentTab = 'html';

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    apiKey = input.value.trim();
    
    if (!apiKey) {
        alert('Please enter your API key');
        return;
    }
    
    document.getElementById('apiKeySection').classList.add('hidden');
    document.getElementById('mainInterface').classList.remove('hidden');
    
    initSpeechRecognition();
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        displayTranscript(transcript);
        generateApp(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
        alert('Error with speech recognition. Please try again.');
    };
    
    recognition.onend = () => {
        stopRecording();
    };
}

function toggleRecording() {
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
        startRecording();
    }
}

function startRecording() {
    isRecording = true;
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordStatus');
    
    btn.classList.add('recording');
    status.textContent = '🎤 Listening... Speak now!';
}

function stopRecording() {
    isRecording = false;
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordStatus');
    
    btn.classList.remove('recording');
    status.textContent = 'Click to start recording';
}

function displayTranscript(text) {
    document.getElementById('transcriptBox').classList.remove('hidden');
    document.getElementById('transcriptText').textContent = text;
}

function useExample(text) {
    displayTranscript(text);
    generateApp(text);
}

async function generateApp(description) {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');
    
    try {
        // Step 1: Structure requirements with Cerebras
        updateLoadingStep('Analyzing your idea with AI...');
        const structuredPrompt = await structureWithCerebras(description);
        
        // Step 2: Generate HTML
        updateLoadingStep('Generating HTML structure...');
        currentFiles.html = await generateHTML(structuredPrompt, description);
        
        // Step 3: Generate CSS
        updateLoadingStep('Creating beautiful styles...');
        currentFiles.css = await generateCSS(structuredPrompt, description);
        
        // Step 4: Generate JavaScript
        updateLoadingStep('Adding interactivity...');
        currentFiles.js = await generateJS(structuredPrompt, description);
        
        // Step 5: Display result
        updateLoadingStep('Preparing preview...');
        displayResult();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating app: ' + error.message);
        document.getElementById('loadingState').classList.add('hidden');
    }
}

async function structureWithCerebras(description) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [{
                role: 'user',
                content: 'Analyze this app idea and create detailed specifications: "' + description + '"\n\nProvide:\n1. Core features (list 5-8 specific features)\n2. UI sections and layout structure\n3. Design aesthetic (modern/minimal/colorful/dark/glassmorphism/etc)\n4. Color scheme (specific colors, gradients)\n5. Animations and interactions needed\n6. Key JavaScript functionality\n\nBe specific and detailed. Think of a premium, modern web app.'
            }],
            temperature: 0.7,
            max_tokens: 800
        })
    });
    
    if (!response.ok) throw new Error('Cerebras API error');
    
    const data = await response.json();
    return data.choices[0].message.content;
}

async function generateHTML(requirements, description) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [{
                role: 'user',
                content: 'Create semantic, modern HTML for: "' + description + '"\n\nRequirements:\n' + requirements + '\n\nCRITICAL RULES:\n- Clean, semantic HTML5\n- Link to external style.css: <link rel="stylesheet" href="style.css">\n- Link to external script.js at end: <script src="script.js"></script>\n- Use meaningful IDs and classes\n- Include all sections mentioned in requirements\n- Add data attributes for JavaScript interaction\n- Use modern HTML elements (section, article, nav, etc)\n- Add Font Awesome CDN for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n- NO inline styles or scripts\n- For internal page navigation, use IDs: <a href="#section-id">\n\nReturn ONLY the HTML code, no explanations.'
            }],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) throw new Error('HTML generation error');
    
    const data = await response.json();
    let code = data.choices[0].message.content;
    code = code.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    return code;
}

async function generateCSS(requirements, description) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [{
                role: 'user',
                content: 'Create beautiful, modern CSS for: "' + description + '"\n\nRequirements:\n' + requirements + '\n\nCRITICAL RULES:\n- Modern, premium design\n- Use CSS Grid and Flexbox\n- Smooth transitions and animations\n- Responsive design (mobile-first)\n- Beautiful gradients and shadows\n- Hover effects on interactive elements\n- Custom scrollbar styling\n- Glass morphism effects where appropriate\n- Professional color palette\n- Proper spacing and typography\n- Add smooth scroll behavior\n- Include @keyframes for animations\n\nReturn ONLY the CSS code, no explanations.'
            }],
            temperature: 0.8,
            max_tokens: 2500
        })
    });
    
    if (!response.ok) throw new Error('CSS generation error');
    
    const data = await response.json();
    let code = data.choices[0].message.content;
    code = code.replace(/```css\n?/g, '').replace(/```\n?/g, '').trim();
    return code;
}

async function generateJS(requirements, description) {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [{
                role: 'user',
                content: 'Create functional JavaScript for: "' + description + '"\n\nRequirements:\n' + requirements + '\n\nCRITICAL RULES:\n- Vanilla JavaScript (no frameworks)\n- DOMContentLoaded wrapper\n- Event listeners for all interactions\n- Smooth scroll for anchor links\n- Form validation if forms present\n- Local storage for data persistence\n- Error handling\n- Clean, commented code\n- Modern ES6+ syntax\n- Actual functionality, no placeholders\n- Add console logs for debugging\n\nReturn ONLY the JavaScript code, no explanations.'
            }],
            temperature: 0.7,
            max_tokens: 2500
        })
    });
    
    if (!response.ok) throw new Error('JS generation error');
    
    const data = await response.json();
    let code = data.choices[0].message.content;
    code = code.replace(/```javascript\n?/g, '').replace(/```js\n?/g, '').replace(/```\n?/g, '').trim();
    return code;
}

function updateLoadingStep(step) {
    document.getElementById('loadingStep').textContent = step;
}

function displayResult() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultSection').classList.remove('hidden');
    
    // Combine files for iframe preview
    const styleTag = '<style>' + currentFiles.css + '</style>';
    const scriptTag = '<script>' + currentFiles.js + '<\/script>';
    
    const combinedHTML = currentFiles.html
        .replace('<link rel="stylesheet" href="style.css">', styleTag)
        .replace('<script src="script.js"></script>', scriptTag);
    
    // Display in iframe
    const iframe = document.getElementById('previewFrame');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(combinedHTML);
    iframeDoc.close();
    
    // Display code in tabs
    document.getElementById('htmlCode').textContent = currentFiles.html;
    document.getElementById('cssCode').textContent = currentFiles.css;
    document.getElementById('jsCode').textContent = currentFiles.js;
    
    showFile('html');
}

function showFile(type) {
    currentTab = type;
    
    // Update tab buttons
    const tabs = ['html', 'css', 'js'];
    tabs.forEach(function(t) {
        const tabButton = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
        const codeElement = document.getElementById(t + 'Code');
        
        if (t === type) {
            tabButton.classList.add('tab-active');
            codeElement.classList.remove('hidden');
        } else {
            tabButton.classList.remove('tab-active');
            codeElement.classList.add('hidden');
        }
    });
}

function copyCurrentFile() {
    const code = document.getElementById(currentTab + 'Code').textContent;
    navigator.clipboard.writeText(code);
    alert(currentTab.toUpperCase() + ' code copied to clipboard!');
}

function downloadAllFiles() {
    downloadFile('index.html', currentFiles.html);
    setTimeout(function() { downloadFile('style.css', currentFiles.css); }, 100);
    setTimeout(function() { downloadFile('script.js', currentFiles.js); }, 200);
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function openInNewTab() {
    const styleTag = '<style>' + currentFiles.css + '</style>';
    const scriptTag = '<script>' + currentFiles.js + '<\/script>';
    
    const combinedHTML = currentFiles.html
        .replace('<link rel="stylesheet" href="style.css">', styleTag)
        .replace('<script src="script.js"></script>', scriptTag);
    
    const newWindow = window.open();
    newWindow.document.write(combinedHTML);
    newWindow.document.close();
}

function startOver() {
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('transcriptBox').classList.add('hidden');
    currentFiles = { html: '', css: '', js: '' };
}