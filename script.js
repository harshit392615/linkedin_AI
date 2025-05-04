document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition) {
        console.log('Speech Recognition available');
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        let isListening = false;
        
        // Add speech recognition button functionality
        document.querySelectorAll('.speech-btn').forEach(button => {
            button.addEventListener('click', () => {
                if (isListening) {
                    recognition.stop();
                    button.classList.remove('active');
                    console.log('Speech recognition stopped by user');
                    isListening = false;
                } else {
                    recognition.start();
                    button.classList.add('active');
                    console.log('Speech recognition started');
                    speak('Listening...');
                    isListening = true;
                }
            });
        });

        // Handle speech recognition results
        recognition.onresult = (event) => {
            const activeInput = document.activeElement;
            if (activeInput && activeInput.tagName === 'INPUT') {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                activeInput.value = transcript;
                console.log('Text updated in input:', transcript);
            }
        };

        // Handle speech recognition errors
        recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error);
            if (event.error === 'aborted') {
                console.log('Speech recognition stopped normally');
                return;
            }
            if (event.error === 'no-speech') {
                return;
            }
            speak('Sorry, I couldn\'t understand that. Please try again.');
        };

        // Handle speech recognition end
        recognition.onend = () => {
            console.log('Speech recognition ended');
            document.querySelectorAll('.speech-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            isListening = false;
        };
    } else {
        console.warn('Speech Recognition not supported in this browser');
        // Hide speech buttons if not supported
        document.querySelectorAll('.speech-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }

    // Function to speak text
    function speak(text) {
        if (SpeechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    // Function to send message
    async function sendMessage(input) {
        const message = input.value.trim();
        if (message) {
            console.log('Processing message:', message);
            
            // Find the chat container and messages
            const chatContainer = input.closest('.ai-assistant-chat, .interview-chat');
            if (!chatContainer) {
                console.error('Chat container not found');
                return;
            }
            
            const chatMessages = chatContainer.querySelector('.chat-messages');
            if (!chatMessages) {
                console.error('Chat messages element not found');
                return;
            }

            // Add user message to chat
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.innerHTML = `<p>${message}</p>`;
            chatMessages.appendChild(userMessage);
            
            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Add thinking message
            const thinkingMessage = document.createElement('div');
            thinkingMessage.className = 'message ai-message';
            thinkingMessage.innerHTML = `<p>Thinking...</p>`;
            chatMessages.appendChild(thinkingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remove thinking message
            chatMessages.removeChild(thinkingMessage);

            // Generate response based on message content
            let response;
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                response = "Hello! How can I help you today?";
            } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
                response = "I can help you create a professional resume. What kind of experience do you have?";
            } else if (lowerMessage.includes('interview')) {
                response = "I can help you prepare for interviews. Would you like to practice some common questions?";
            } else if (lowerMessage.includes('job')) {
                response = "What kind of job are you looking for? I can help you with your job search.";
            } else {
                response = "I'm here to help with your career needs. Would you like help with your resume, interview preparation, or job search?";
            }
            
            // Add AI response to chat
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `<p>${response}</p>`;
            chatMessages.appendChild(aiMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Speak the response
            speak(response);
        }
    }

    // Add send button functionality
    document.querySelectorAll('.send-btn').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                sendMessage(input);
            }
        });
    });

    // Add enter key functionality
    document.querySelectorAll('.chat-input input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(input);
            }
        });
    });

    // AI Assistant functionality
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    const aiAssistantContainer = document.querySelector('.ai-assistant-container');
    const aiAssistantCloseBtn = aiAssistantContainer?.querySelector('.close-btn');

    if (aiAssistantBtn && aiAssistantContainer && aiAssistantCloseBtn) {
        console.log('AI Assistant elements found');
        aiAssistantBtn.addEventListener('click', () => {
            console.log('AI Assistant button clicked');
            aiAssistantContainer.classList.add('active');
            speak('Welcome to AI Assistant! How can I help you today?');
        });

        aiAssistantCloseBtn.addEventListener('click', () => {
            console.log('AI Assistant close button clicked');
            aiAssistantContainer.classList.remove('active');
        });
    } else {
        console.error('Some AI Assistant elements not found:', {
            button: !!aiAssistantBtn,
            container: !!aiAssistantContainer,
            closeBtn: !!aiAssistantCloseBtn
        });
    }

    // AI Interview functionality
    const aiInterviewBtn = document.getElementById('aiInterviewBtn');
    const aiInterviewContainer = document.querySelector('.ai-interview-container');
    const aiInterviewBox = aiInterviewContainer?.querySelector('.ai-interview-box');
    const aiInterviewCloseBtn = aiInterviewBox?.querySelector('.close-btn');

    if (aiInterviewBtn && aiInterviewContainer && aiInterviewBox && aiInterviewCloseBtn) {
        console.log('AI Interview elements found');
        aiInterviewBtn.addEventListener('click', () => {
            console.log('AI Interview button clicked');
            aiInterviewContainer.classList.add('active');
            speak('Welcome to your AI Interview! I will be asking you questions and analyzing your responses. Are you ready to begin?');
            startCamera();
        });

        aiInterviewCloseBtn.addEventListener('click', () => {
            console.log('AI Interview close button clicked');
            aiInterviewContainer.classList.remove('active');
            stopCamera();
        });
    } else {
        console.error('Some AI Interview elements not found:', {
            button: !!aiInterviewBtn,
            container: !!aiInterviewContainer,
            box: !!aiInterviewBox,
            closeBtn: !!aiInterviewCloseBtn
        });
    }

    // Camera functionality
    let stream = null;

    async function startCamera() {
        try {
            console.log('Requesting camera access...');
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const video = document.getElementById('camera-feed');
            if (video) {
                video.srcObject = stream;
                console.log('Camera access granted and video feed started');
            } else {
                console.error('Camera feed element not found');
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            const video = document.getElementById('camera-feed');
            if (video) {
                video.srcObject = null;
            }
            console.log('Camera feed stopped');
        }
    }

    // Video controls functionality
    const toggleCameraBtn = document.getElementById('toggle-camera');
    const toggleMicBtn = document.getElementById('toggle-mic');
    const endInterviewBtn = document.getElementById('end-interview');

    console.log('Video control buttons:', {
        camera: !!toggleCameraBtn,
        mic: !!toggleMicBtn,
        end: !!endInterviewBtn
    });

    let isCameraOn = true;
    let isMicOn = true;

    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', () => {
            isCameraOn = !isCameraOn;
            console.log('Camera toggled:', isCameraOn ? 'on' : 'off');
            const video = document.getElementById('camera-feed');
            if (video) {
                video.style.display = isCameraOn ? 'block' : 'none';
                toggleCameraBtn.innerHTML = `<i class="fas fa-video${isCameraOn ? '' : '-slash'}"></i>`;
                speak(isCameraOn ? 'Camera turned on' : 'Camera turned off');
            }
        });
    }

    if (toggleMicBtn) {
        toggleMicBtn.addEventListener('click', () => {
            isMicOn = !isMicOn;
            console.log('Microphone toggled:', isMicOn ? 'on' : 'off');
            toggleMicBtn.innerHTML = `<i class="fas fa-microphone${isMicOn ? '' : '-slash'}"></i>`;
            speak(isMicOn ? 'Microphone turned on' : 'Microphone turned off');
        });
    }

    if (endInterviewBtn) {
        endInterviewBtn.addEventListener('click', () => {
            console.log('Interview ended');
            if (aiInterviewContainer) {
                aiInterviewContainer.classList.remove('active');
                stopCamera();
                speak('Interview session ended. Thank you for your time!');
            }
        });
    }
});