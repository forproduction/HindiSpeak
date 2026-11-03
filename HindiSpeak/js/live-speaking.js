document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const micBtn = document.getElementById('micBtn');
    const btnText = document.getElementById('btnText');
    const statusText = document.getElementById('statusText');
    const chatContainer = document.getElementById('chatContainer');
    const scenarioSelect = document.getElementById('scenarioSelect');

    let isListening = false;

    // ------------------------------------------------------------------
    // API CONFIGURATION: Insert your Gemini API Key below.
    // Obtain a free API key at: https://aistudio.google.com/
    // ------------------------------------------------------------------
    const GEMINI_API_KEY = "AIzaSyAh4NVKL4HFiAMzKVZQpyhVNWnPZh11cQY"; 

    // System instruction prompts defining AI roleplay personas
    const scenarioPrompts = {
        dhaba: "You are a friendly roadside Dhaba owner in Delhi. Talk to the user in short, natural, conversational Hindi (using Devanagari script). Keep your replies concise (1-2 sentences maximum) so it feels like a real voice conversation.",
        market: "You are a street vegetable vendor (Sabziwala) in a local market in India. Bargain and chat with the user in simple, realistic Hindi using Devanagari script. Keep answers under 2 sentences.",
        directions: "You are a helpful local resident standing near a metro station in Delhi. Give clear, simple directions in Hindi using Devanagari script. Keep answers under 2 sentences."
    };

    // 2. Initialize Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (!SpeechRecognition) {
        console.warn("Speech Recognition API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        if (statusText) {
            statusText.innerText = "Speech API Not Supported";
            statusText.className = "badge bg-warning text-dark fs-6 fw-normal px-3 py-2";
        }
    } else {
        recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Force Hindi input
        recognition.continuous = false;
        recognition.interimResults = false;

        // Recognition started (Microphone Active)
        recognition.onstart = () => {
            isListening = true;
            if (btnText) btnText.innerText = "Stop Listening";
            if (micBtn) micBtn.className = "btn btn-danger btn-lg px-4 d-flex align-items-center gap-2";
            if (statusText) {
                statusText.innerText = "Listening for Hindi...";
                statusText.className = "badge bg-danger fs-6 fw-normal px-3 py-2";
            }
        };

        // Recognition ended
        recognition.onend = () => {
            isListening = false;
            if (btnText) btnText.innerText = "Start Speaking";
            if (micBtn) micBtn.className = "btn btn-primary btn-lg px-4 d-flex align-items-center gap-2";
        };

        // Handle Speech Input and fetch dynamic AI response
        recognition.onresult = async (event) => {
            const userText = event.results[0][0].transcript;
            
            // 1. Display User Message in Chat
            appendMessage('user', userText);

            // 2. Show AI Processing Status
            if (statusText) {
                statusText.innerText = "AI is thinking...";
                statusText.className = "badge bg-info text-dark fs-6 fw-normal px-3 py-2";
            }

            // 3. Fetch reply from Gemini AI
            const currentScenario = scenarioSelect ? scenarioSelect.value : 'dhaba';
            const botReplyText = await fetchAIResponse(userText, currentScenario);
            
            // 4. Display Bot Message & Speak Back
            appendMessage('bot', botReplyText);
            speakHindiResponse(botReplyText);

            // Reset Status Badge to Idle
            if (statusText) {
                statusText.innerText = "Idle";
                statusText.className = "badge bg-secondary fs-6 fw-normal px-3 py-2";
            }
        };

        // Handle Errors (e.g., No Speech, Mic Blocked)
        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            if (statusText) {
                statusText.innerText = "Error: " + event.error;
                statusText.className = "badge bg-warning text-dark fs-6 fw-normal px-3 py-2";
            }
            isListening = false;
            if (btnText) btnText.innerText = "Start Speaking";
            if (micBtn) micBtn.className = "btn btn-primary btn-lg px-4 d-flex align-items-center gap-2";
        };
    }

    // 3. Microphone Button Click Listener
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (!recognition) {
                alert("Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.");
                return;
            }

            if (!isListening) {
                try {
                    recognition.start();
                } catch (err) {
                    console.error("Recognition start error:", err);
                }
            } else {
                recognition.stop();
            }
        });
    }

    // 4. Fetch dynamic response from Gemini API
    async function fetchAIResponse(userText, scenario) {
        const systemPrompt = scenarioPrompts[scenario] || scenarioPrompts.dhaba;

        // if (GEMINI_API_KEY === "AQ.Ab8RN6J_I6L_b4r1rguWMG_CKNvNLl-joSipw8PBH31lq9wMTg") {
        //     return "कृपया js/live-speaking.js फ़ाइल में अपनी Gemini API Key जोड़ें।";
        // }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `${systemPrompt}\n\nUser said: "${userText}"\nReply:` }]
                        }
                    ]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                return "क्षमा करें, मैं आपकी बात पूरी तरह समझ नहीं पाया।";
            }
        } catch (error) {
            console.error("AI API Fetch Error:", error);
            return "क्षमा करें, नेटवर्क में कुछ समस्या आ रही है।";
        }
    }

    // 5. Append message bubble to UI with Bootstrap styling
    function appendMessage(sender, text) {
        if (!chatContainer) return;
        const isUser = sender === 'user';
        const msgDiv = document.createElement('div');
        
        msgDiv.className = `p-3 rounded-3 shadow-sm ${
            isUser 
                ? 'bg-primary text-white align-self-end ms-auto' 
                : 'bg-light text-dark border align-self-start me-auto'
        }`;
        msgDiv.style.maxWidth = '75%';
        msgDiv.innerHTML = `<p class="mb-0"><strong>${isUser ? 'You' : 'Partner'}:</strong> ${text}</p>`;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 6. Text-to-Speech (Speaks Hindi back to the user)
    function speakHindiResponse(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any pending utterances
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.85; // Slightly slower for language learners
            window.speechSynthesis.speak(utterance);
        }
    }
});