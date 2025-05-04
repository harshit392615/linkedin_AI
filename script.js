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
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }

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
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1;
            utterance.pitch = 1;
            
            speechSynthesis.speak(utterance);
        }
    }

    // Text-to-speech functionality
    let isTTSEnabled = false;
    const ttsButtons = document.querySelectorAll('.tts-btn');

    ttsButtons.forEach(button => {
        button.addEventListener('click', () => {
            isTTSEnabled = !isTTSEnabled;
            button.classList.toggle('active');
            
            if (isTTSEnabled) {
                button.innerHTML = '<i class="fas fa-volume-mute"></i>';
                // Stop any ongoing speech
                responsiveVoice.cancel();
            } else {
                button.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });
    });

    // Modify the existing sendMessage function to include TTS
    function sendMessage(message, isUser = true) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!isUser && isTTSEnabled) {
            responsiveVoice.speak(message, "US English Female");
        }
    }

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

        // Add click handlers for AI Assistant options
        const aiOptions = aiAssistantContainer.querySelectorAll('.ai-option');
        aiOptions.forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.getAttribute('data-option');
                handleAIOptionClick(optionType);
            });
        });
    } else {
        console.error('Some AI Assistant elements not found:', {
            button: !!aiAssistantBtn,
            container: !!aiAssistantContainer,
            closeBtn: !!aiAssistantCloseBtn
        });
    }

    // Add category selection functionality
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Hide all option sections
            document.querySelectorAll('.options-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected category options
            const selectedOptions = document.querySelector(`.${category}-options`);
            if (selectedOptions) {
                selectedOptions.style.display = 'block';
            }
            
            // Update active state
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
    });

    // Update handleAIOptionClick function
    function handleAIOptionClick(option) {
        console.log('AI option clicked:', option);
        
        // Hide all modals first
        const modals = [
            'resumeAnalysisModal',
            'resumeImproveModal',
            'coverLetterModal',
            'jobSearchModal',
            'interviewPrepModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        });

        // Show the selected modal
        switch(option) {
            case 'resume':
                document.getElementById('resumeModal').style.display = 'block';
                break;
            case 'analyze':
                document.getElementById('resumeAnalysisModal').style.display = 'block';
                break;
            case 'improve':
                document.getElementById('resumeImproveModal').style.display = 'block';
                break;
            case 'cover-letter':
                document.getElementById('coverLetterModal').style.display = 'block';
                break;
            case 'job-search':
                document.getElementById('jobSearchModal').style.display = 'block';
                break;
            case 'interview-prep':
                document.getElementById('interviewPrepModal').style.display = 'block';
                break;
        }
    }

    // Add CSS for the options container and buttons
    const style = document.createElement('style');
    style.textContent = `
        .options-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .option-button {
            background: none;
            border: 1px solid var(--accent-color);
            color: var(--accent-color);
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .option-button:hover {
            background-color: var(--accent-color);
            color: white;
        }
        
        .option-button i {
            font-size: 16px;
        }
    `;
    document.head.appendChild(style);

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

    // Face detection and metrics implementation
    let faceDetectionInterval;
    let emotionHistory = [];
    let confidenceHistory = [];
    let postureHistory = [];

    async function loadFaceDetectionModels() {
        try {
            console.log('Loading face detection models...');
            await faceapi.nets.tinyFaceDetector.loadFromUri('../models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('../models');
            await faceapi.nets.faceExpressionNet.loadFromUri('../models');
            console.log('Face detection models loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading face detection models:', error);
            return false;
        }
    }

    async function detectFaceAndUpdateMetrics() {
        const video = document.getElementById('camera-feed');
        if (!video) return;

        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detections.length > 0) {
            const detection = detections[0];
            
            // Update emotion
            const expressions = detection.expressions;
            const dominantEmotion = Object.entries(expressions)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            document.getElementById('emotion-value').textContent = dominantEmotion;
            emotionHistory.push(dominantEmotion);

            // Update confidence (based on speech and facial expressions)
            const confidence = Math.min(100, Math.round(
                (expressions.happy * 0.4 + expressions.neutral * 0.3 + expressions.surprised * 0.3) * 100
            ));
            document.getElementById('confidence-value').textContent = `${confidence}%`;
            confidenceHistory.push(confidence);

            // Update posture (based on face landmarks)
            const landmarks = detection.landmarks;
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            const eyeLevel = (leftEye[0].y + rightEye[0].y) / 2;
            const noseLevel = nose[0].y;
            const postureDeviation = Math.abs(eyeLevel - noseLevel);
            
            let postureStatus = 'Good';
            if (postureDeviation > 20) postureStatus = 'Fair';
            if (postureDeviation > 40) postureStatus = 'Poor';
            
            document.getElementById('posture-value').textContent = postureStatus;
            postureHistory.push(postureStatus);

            // Update overall score
            const recentEmotions = emotionHistory.slice(-10);
            const recentConfidence = confidenceHistory.slice(-10);
            const recentPosture = postureHistory.slice(-10);

            const emotionScore = recentEmotions.filter(e => e === 'happy' || e === 'neutral').length / recentEmotions.length * 100;
            const avgConfidence = recentConfidence.reduce((a, b) => a + b, 0) / recentConfidence.length;
            const postureScore = recentPosture.filter(p => p === 'Good').length / recentPosture.length * 100;

            const overallScore = Math.round((emotionScore * 0.3 + avgConfidence * 0.4 + postureScore * 0.3));
            document.getElementById('overall-score').textContent = `${overallScore}%`;
        }
    }

    // Modify startCamera function to include face detection
    async function startCamera() {
        try {
            console.log('Requesting camera access...');
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const video = document.getElementById('camera-feed');
            if (video) {
                video.srcObject = stream;
                console.log('Camera access granted and video feed started');

                // Load face detection models and start detection
                const modelsLoaded = await loadFaceDetectionModels();
                if (modelsLoaded) {
                    faceDetectionInterval = setInterval(detectFaceAndUpdateMetrics, 100);
                }
            } else {
                console.error('Camera feed element not found');
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    }

    // Modify stopCamera function to clear face detection interval
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            const video = document.getElementById('camera-feed');
            if (video) {
                video.srcObject = null;
            }
            if (faceDetectionInterval) {
                clearInterval(faceDetectionInterval);
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

    // Resume Creation Functionality
    const resumeModal = document.getElementById('resumeModal');
    const closeBtn = resumeModal.querySelector('.close');
    const resumeForm = document.getElementById('resumeForm');
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', function() {
        resumeModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resumeModal) {
            resumeModal.style.display = 'none';
        }
    });
    
    // Resume form submission
    document.getElementById('resumeForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const formData = {
                personalInfo: {
                    name: this.querySelector('[name="name"]').value,
                    email: this.querySelector('[name="email"]').value,
                    phone: this.querySelector('[name="phone"]').value,
                    location: this.querySelector('[name="location"]').value,
                    linkedin: this.querySelector('[name="linkedin"]').value || '',
                    portfolio: this.querySelector('[name="portfolio"]').value || ''
                },
                summary: this.querySelector('[name="summary"]').value,
                experience: [],
                education: [],
                skills: [],
                certifications: []
            };

            // Collect experience
            this.querySelectorAll('.experience-item').forEach(exp => {
                formData.experience.push({
                    jobTitle: exp.querySelector('[name="jobTitle"]').value,
                    company: exp.querySelector('[name="company"]').value,
                    location: exp.querySelector('[name="location"]').value,
                    duration: exp.querySelector('[name="duration"]').value,
                    description: exp.querySelector('[name="description"]').value
                });
            });

            // Collect education
            this.querySelectorAll('.education-item').forEach(edu => {
                formData.education.push({
                    degree: edu.querySelector('[name="degree"]').value,
                    institution: edu.querySelector('[name="institution"]').value,
                    location: edu.querySelector('[name="location"]').value,
                    duration: edu.querySelector('[name="duration"]').value
                });
            });

            // Collect skills
            this.querySelectorAll('.skills-category').forEach(cat => {
                const category = cat.querySelector('[name="category"]').value;
                const skills = Array.from(cat.querySelectorAll('[name="skill"]')).map(skill => skill.value);
                formData.skills.push({ category, skills });
            });

            // Collect certifications
            this.querySelectorAll('.certification-item').forEach(cert => {
                formData.certifications.push({
                    name: cert.querySelector('[name="certName"]').value,
                    organization: cert.querySelector('[name="organization"]').value,
                    date: cert.querySelector('[name="date"]').value
                });
            });

            // Log the collected data for debugging
            console.log('Form data collected:', formData);

            // Get the base URL based on environment
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const baseUrl = isDevelopment ? 'http://localhost:5000' : '';

            // Save resume data
            const saveResponse = await fetch(`${baseUrl}/save-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Save response status:', saveResponse.status);
            console.log('Save response headers:', saveResponse.headers);

            if (!saveResponse.ok) {
                let errorMessage = 'Failed to save resume';
                try {
                    const errorText = await saveResponse.text();
                    console.error('Error response text:', errorText);
                    if (errorText) {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            // Generate PDF
            const pdfResponse = await fetch(`${baseUrl}/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!pdfResponse.ok) {
                const errorData = await pdfResponse.json();
                throw new Error(errorData.message || 'Failed to generate PDF');
            }

            // Download the PDF
            const blob = await pdfResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            alert('Resume created successfully!');
            document.getElementById('resumeModal').style.display = 'none';
            this.reset();

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Add event listeners for dynamic form fields
    document.getElementById('addExperience').addEventListener('click', function() {
        const container = document.getElementById('experienceContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'experience-item';
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="jobTitle">Job Title *</label>
                <input type="text" name="jobTitle" required>
            </div>
            <div class="form-group">
                <label for="company">Company *</label>
                <input type="text" name="company" required>
            </div>
            <div class="form-group">
                <label for="location">Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label for="duration">Duration *</label>
                <input type="text" name="duration" placeholder="e.g., Jan 2020 - Present" required>
            </div>
            <div class="form-group">
                <label for="description">Description *</label>
                <textarea name="description" required></textarea>
            </div>
        `;
        container.appendChild(newEntry);
    });
    
    document.getElementById('addEducation').addEventListener('click', function() {
        const container = document.getElementById('educationContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'education-item';
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="degree">Degree *</label>
                <input type="text" name="degree" required>
            </div>
            <div class="form-group">
                <label for="institution">Institution *</label>
                <input type="text" name="institution" required>
            </div>
            <div class="form-group">
                <label for="location">Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label for="duration">Duration *</label>
                <input type="text" name="duration" placeholder="e.g., 2016 - 2020" required>
            </div>
        `;
        container.appendChild(newEntry);
    });
    
    document.getElementById('addSkills').addEventListener('click', function() {
        const container = document.getElementById('skillsContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'skills-category';
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="category">Category *</label>
                <input type="text" name="category" placeholder="e.g., Technical Skills" required>
            </div>
            <div class="skill-input">
                <input type="text" name="skill" placeholder="Add a skill" required>
                <button type="button" class="remove-btn">Remove</button>
            </div>
        `;
        container.appendChild(newEntry);
    });
    
    document.getElementById('addCertification').addEventListener('click', function() {
        const container = document.getElementById('certificationsContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'certification-item';
        newEntry.innerHTML = `
            <div class="form-group">
                <label for="certName">Certification Name</label>
                <input type="text" name="certName">
            </div>
            <div class="form-group">
                <label for="organization">Issuing Organization</label>
                <input type="text" name="organization">
            </div>
            <div class="form-group">
                <label for="date">Date Obtained</label>
                <input type="text" name="date" placeholder="e.g., May 2023">
            </div>
        `;
        container.appendChild(newEntry);
    });

    // Add event listener for remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const skillInput = e.target.closest('.skill-input');
            if (skillInput) {
                skillInput.remove();
            }
        }
    });

    // Resume Analysis Modal Functionality
    const resumeAnalysisModal = document.getElementById('resumeAnalysisModal');
    const resumeAnalysisCloseBtn = resumeAnalysisModal.querySelector('.close');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resumeFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const analysisResults = document.getElementById('analysisResults');

    // Close resume analysis modal
    resumeAnalysisCloseBtn.addEventListener('click', function() {
        resumeAnalysisModal.style.display = 'none';
        resetAnalysisModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resumeAnalysisModal) {
            resumeAnalysisModal.style.display = 'none';
            resetAnalysisModal();
        }
    });

    // Reset analysis modal
    function resetAnalysisModal() {
        fileInput.value = '';
        fileInfo.style.display = 'none';
        analysisResults.style.display = 'none';
        dropZone.style.display = 'block';
    }

    // Remove uploaded file
    function removeFile() {
        fileInput.value = '';
        fileInfo.style.display = 'none';
        analysisResults.style.display = 'none';
        dropZone.style.display = 'block';
    }

    // Handle file input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Handle drag and drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                handleFileUpload(file);
            } else {
                alert('Please upload a PDF file');
            }
        }
    });

    // Handle file upload
    function handleFileUpload(file) {
        // For now, we'll just show the analysis results directly
        // In a real implementation, this would send the file to the server for analysis
        
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
        dropZone.style.display = 'none';
        
        // Simulate analysis delay
        setTimeout(() => {
            analysisResults.style.display = 'block';
        }, 1000);
    }

    // Resume Improvement Modal Functionality
    const resumeImproveModal = document.getElementById('resumeImproveModal');
    const resumeImproveCloseBtn = resumeImproveModal.querySelector('.close');
    const improveDropZone = document.getElementById('improveDropZone');
    const improveFileInput = document.getElementById('improveResumeFile');
    const improveFileInfo = document.getElementById('improveFileInfo');
    const improveFileName = document.getElementById('improveFileName');
    const improveResults = document.getElementById('improveResults');

    // Close resume improvement modal
    resumeImproveCloseBtn.addEventListener('click', function() {
        resumeImproveModal.style.display = 'none';
        resetImproveModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === resumeImproveModal) {
            resumeImproveModal.style.display = 'none';
            resetImproveModal();
        }
    });

    // Reset improve modal
    function resetImproveModal() {
        improveFileInput.value = '';
        improveFileInfo.style.display = 'none';
        improveResults.style.display = 'none';
        improveDropZone.style.display = 'block';
    }

    // Remove uploaded file
    function removeImproveFile() {
        improveFileInput.value = '';
        improveFileInfo.style.display = 'none';
        improveResults.style.display = 'none';
        improveDropZone.style.display = 'block';
    }

    // Handle file input change
    improveFileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImproveFileUpload(e.target.files[0]);
        }
    });

    // Handle drag and drop
    improveDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        improveDropZone.classList.add('dragover');
    });

    improveDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        improveDropZone.classList.remove('dragover');
    });

    improveDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        improveDropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                handleImproveFileUpload(file);
            } else {
                alert('Please upload a PDF file');
            }
        }
    });

    // Handle file upload
    function handleImproveFileUpload(file) {
        // For now, we'll just show the improvement results directly
        // In a real implementation, this would send the file to the server for analysis
        
        improveFileName.textContent = file.name;
        improveFileInfo.style.display = 'flex';
        improveDropZone.style.display = 'none';
        
        // Simulate analysis delay
        setTimeout(() => {
            improveResults.style.display = 'block';
        }, 1000);
    }

    // Add event listeners for action buttons
    document.querySelector('.download-btn').addEventListener('click', function() {
        // Simulate downloading improved resume
        alert('Downloading improved resume...');
    });

    document.querySelector('.apply-btn').addEventListener('click', function() {
        // Simulate applying changes
        alert('Changes applied successfully!');
    });

    // Cover Letter Modal Functionality
    const coverLetterModal = document.getElementById('coverLetterModal');
    const coverLetterCloseBtn = coverLetterModal.querySelector('.close');
    const generateCoverLetterBtn = coverLetterModal.querySelector('.generate-btn');
    const downloadCoverLetterBtn = coverLetterModal.querySelector('.download-btn');

    coverLetterCloseBtn.addEventListener('click', () => {
        coverLetterModal.style.display = 'none';
    });

    generateCoverLetterBtn.addEventListener('click', () => {
        const formData = {
            jobTitle: document.getElementById('jobTitle').value,
            companyName: document.getElementById('companyName').value,
            jobDescription: document.getElementById('jobDescription').value,
            yourName: document.getElementById('yourName').value,
            yourEmail: document.getElementById('yourEmail').value,
            yourPhone: document.getElementById('yourPhone').value,
            keySkills: document.getElementById('keySkills').value,
            achievements: document.getElementById('achievements').value
        };

        // Validate required fields
        const requiredFields = ['jobTitle', 'companyName', 'jobDescription', 'yourName', 'yourEmail', 'keySkills', 'achievements'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert('Please fill in all required fields');
            return;
        }

        // Simulate cover letter generation
        setTimeout(() => {
            alert('Cover letter generated successfully!');
            downloadCoverLetterBtn.disabled = false;
        }, 1500);
    });

    downloadCoverLetterBtn.addEventListener('click', () => {
        // Simulate cover letter download
        alert('Cover letter downloaded successfully!');
    });

    // Job Search Modal Functionality
    const jobSearchModal = document.getElementById('jobSearchModal');
    const jobSearchCloseBtn = jobSearchModal.querySelector('.close');
    const searchBtn = jobSearchModal.querySelector('.search-btn');

    jobSearchCloseBtn.addEventListener('click', () => {
        jobSearchModal.style.display = 'none';
    });

    searchBtn.addEventListener('click', () => {
        const searchData = {
            jobType: document.getElementById('jobType').value,
            experience: document.getElementById('experience').value,
            location: document.getElementById('location').value
        };

        // Simulate job search
        setTimeout(() => {
            alert('Searching for jobs...');
        }, 1000);
    });

    // Interview Preparation Modal Functionality
    const interviewPrepModal = document.getElementById('interviewPrepModal');
    const interviewPrepCloseBtn = interviewPrepModal.querySelector('.close');
    const generatePrepBtn = interviewPrepModal.querySelector('.generate-prep-btn');
    const practiceBtn = interviewPrepModal.querySelector('.practice-btn');
    const downloadPrepBtn = interviewPrepModal.querySelector('.download-prep-btn');

    interviewPrepCloseBtn.addEventListener('click', () => {
        interviewPrepModal.style.display = 'none';
    });

    generatePrepBtn.addEventListener('click', () => {
        const jobRole = document.getElementById('jobRole').value;
        const experienceLevel = document.getElementById('experienceLevel').value;

        if (!jobRole) {
            alert('Please enter a job role');
            return;
        }

        // Simulate preparation plan generation
        setTimeout(() => {
            alert('Preparation plan generated successfully!');
            practiceBtn.disabled = false;
            downloadPrepBtn.disabled = false;
        }, 1500);
    });

    practiceBtn.addEventListener('click', () => {
        // Simulate practice session
        alert('Starting practice session...');
    });

    downloadPrepBtn.addEventListener('click', () => {
        // Simulate guide download
        alert('Interview preparation guide downloaded successfully!');
    });

    // Add click event listeners to all AI options
    document.querySelectorAll('.ai-option').forEach(option => {
        option.addEventListener('click', () => {
            const optionType = option.getAttribute('data-option');
            handleAIOptionClick(optionType);
        });
    });
});