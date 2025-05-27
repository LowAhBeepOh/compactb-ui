document.addEventListener('DOMContentLoaded', function() {
    // We no longer clear chat memory on page refresh/reload
    // This allows conversations to persist between sessions
    
    const sidebar = document.getElementById('sidebar');
    const collapseButton = document.getElementById('collapseSidebarButton');
    const body = document.body;
    
    // General Settings elements initialization
    const startupSound = document.getElementById('startupSound');
    const soundEffects = document.getElementById('soundEffects');
    const autoSave = document.getElementById('autoSave');
    const desktopNotifications = document.getElementById('desktopNotifications');
    const streamResponses = document.getElementById('streamResponses');
    const processingModes = document.getElementsByName('processingMode');
    
    // LM Studio Integration elements
    const integrateWithLMStudio = document.getElementById('integrateWithLMStudio');
    const lmStudioSettings = document.getElementById('lmStudioSettings');
    const lmStudioEndpoint = document.getElementById('lmStudioEndpoint');
    
    // Initialize LM Studio settings
    integrateWithLMStudio.checked = localStorage.getItem('lmStudioEnabled') === 'true';
    lmStudioSettings.style.display = integrateWithLMStudio.checked ? 'block' : 'none';
    lmStudioEndpoint.value = localStorage.getItem('lmStudioEndpoint') || 'http://127.0.0.1:1234';
    
    // Add protocol warning if needed
    if (window.location.protocol === 'https:') {
        const protocolWarning = document.createElement('div');
        protocolWarning.classList.add('protocol-warning');
        protocolWarning.innerHTML = `
            <span class="material-icons">warning</span>
            <span>You're using HTTPS. For LM Studio to work properly, use a protocol-relative URL (//127.0.0.1:1234) or access this page via HTTP.</span>
        `;
        lmStudioSettings.appendChild(protocolWarning);
        
        // Update endpoint to protocol-relative if it's using HTTP
        if (lmStudioEndpoint.value.startsWith('http:')) {
            try {
                const endpointUrl = new URL(lmStudioEndpoint.value);
                const hostname = endpointUrl.hostname;
                const port = endpointUrl.port;
                if (hostname === '127.0.0.1' || hostname === 'localhost') {
                    lmStudioEndpoint.value = `//${hostname}:${port}`;
                    localStorage.setItem('lmStudioEndpoint', lmStudioEndpoint.value);
                }
            } catch (error) {
                console.error('Error parsing LM Studio endpoint:', error);
            }
        }
    }
    
    // Personality elements
    const personalityOptions = document.querySelectorAll('.personality-option');
    
    // Initialize personality from localStorage or default to 'none'
    const savedPersonality = localStorage.getItem('aiPersonality') || 'none';
    
    // Personality system prompts
    const personalityPrompts = {
        none: "You can use Markdown formatting (like **bold**, *italics*, `code`, lists, etc.). Use short to medium answers.",
        red: "You can use Markdown formatting. Use short to medium answers. Your personality is hating politics, a bit calm, but also a bit rude.",
        orange: "You can use Markdown formatting. Use short to medium answers. Your personality is literally just acting like a jolly ginger from Ireland. (take it lightly im not trying to be rude)",
        yellow: "You can use Markdown formatting. Use short to medium answers. Your personality is being a bit energetic in your responses, and being nice.",
        green: "You can use Markdown formatting. Use short to medium answers. Your personality is being calm, a bit unformal in some cases, and genuinely being nice and supportive.",
        blue: "You can use Markdown formatting. Use short to medium answers. Your personality is being kinda tired, your formal and unformal tone changes randomly, and your responses are short and dry.",
        velvet: "You can use Markdown formatting. Use short to medium answers. Your personality is being writing like a person who had their emo phase two months ago, but also responding to the user in the worst possible way.",
        pink: "You can use Markdown formatting. Use short to medium answers. Your personality is being very friendly, silly, and write using emotions and writing in a VERY informal way, like something like 'OMG HAIIII >_<'.",
        black: "You can use Markdown formatting. Use short to medium answers. Your personality is... well, something. act like you are a person who is tired all the time, and is going through a lot of negative stuff, be a tiny bit rude sometimes.",
        mikurot: "You can use Markdown formatting. Use short to medium answers. Your personality is being a Hatsune Miku fan who responds normally to most messages, but gets extremely excited when any Miku song is mentioned.",
    };
    
    // Function to check if drunk mode is active
    function isDrunkMode() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const month = now.getMonth();
        const isDrunkMonth = [7, 9, 10].includes(month); // August, October, November
        const isFridayNight = day === 5 && hour >= 20;
        return isDrunkMonth && isFridayNight;
    }
    
    // Modify personality based on drunk mode
    function getPersonalityPrompt(personality) {
        let prompt = personalityPrompts[personality] || personalityPrompts.none;
        if (window.isDrunkMode) {
            prompt += " Also, act drunk by writing words wrong, forgetting stuff, and whatever.";
        } else if (isDrunkMode()) {
            prompt += " Also, act a tiny bit drunk by writing some words wrong.";
        }
        return prompt;
    }
    
    // List of Miku songs to detect
    const mikuSongs = [
        'telepathy', 'vampire', 'magical mirai', 'magical cure love shot', 'world is mine', 
        'melt', 'love is war', 'rolling girl', 'levan polkka', 'triple baka', 
        'disappearance', 'senbonzakura', 'two-faced lovers', 'deep sea girl', 
        'tell your world', 'weekender girl', 'sand planet', 'ghost rule', 'hibikase',
        'wowaka', 'ryo', 'mitchie m', 'oster project', 'deco*27', 'kikuo', 'giga', 'pinocchio-p',
        'vocaloid', 'project diva', 'project sekai', 'mesmerizer'
    ];
    
    // Function to check if a message contains Miku song references
    function containsMikuSongReference(message) {
        if (!message) return false;
        const lowerMessage = message.toLowerCase();
        return mikuSongs.some(song => lowerMessage.includes(song.toLowerCase()));
    }
    
    // LM Studio integration toggle event
    integrateWithLMStudio.addEventListener('change', function() {
        localStorage.setItem('lmStudioEnabled', this.checked);
        lmStudioSettings.style.display = this.checked ? 'block' : 'none';
    });
    
    // Save LM Studio endpoint when changed
    lmStudioEndpoint.addEventListener('change', function() {
        localStorage.setItem('lmStudioEndpoint', this.value);
    });
    
    // Set initial active personality
    personalityOptions.forEach(option => {
        if (option.dataset.personality === savedPersonality) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Personality selection event listeners
    personalityOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            personalityOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Save selected personality to localStorage
            const personality = option.dataset.personality;
            localStorage.setItem('aiPersonality', personality);
            
            // Show a subtle notification
            const notification = document.createElement('div');
            notification.classList.add('personality-notification');
            notification.textContent = `AI personality set to ${personality.charAt(0).toUpperCase() + personality.slice(1)}`;
            document.body.appendChild(notification);
            
            // Remove notification after animation
            setTimeout(() => {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 300);
                }, 2000);
            }, 10);
        });
    });
    
    // Initialize general settings from localStorage
    startupSound.checked = localStorage.getItem('startupSound') === 'true';
    soundEffects.checked = localStorage.getItem('soundEffects') === 'true';
    
    // Function to play selected sound
    function playSound(type) {
        // Allow startup sound to play regardless of soundEffects setting
        if (!soundEffects.checked && type !== 'startup') return;
        
        // For startup sound, check if startupSound is enabled
        if (type === 'startup' && !startupSound.checked) return;
        
        const sounds = {
            startup: {
                default: 'startup.wav',
                calm: 'startupCalm.wav',
                '8-bit': 'startupBits.wav',
                blip: 'startupBlip.wav',
                taiko: 'startupTaiko.wav',
                game: 'startupGame.wav',
                funk: 'startupFunk.wav',
                call: 'startupCalling.wav'
            },
            message: 'message.mp3',
            notification: 'notification.mp3'
        };
        
        let soundFile;
        if (type === 'startup') {
            const soundType = localStorage.getItem('startupSoundType') || 'default';
            soundFile = sounds.startup[soundType];
        } else {
            soundFile = sounds[type];
        }
        
        if (soundFile) {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
        }
    }
    
    // Function to manage chat memory for LM Studio
    function getChatMemory(chatId) {
        const chatMemories = JSON.parse(localStorage.getItem('lmStudioChatMemories') || '{}');
        return chatMemories[chatId] || [];
    }
    
    function saveChatMemory(chatId, messages) {
        const chatMemories = JSON.parse(localStorage.getItem('lmStudioChatMemories') || '{}');
        chatMemories[chatId] = messages;
        localStorage.setItem('lmStudioChatMemories', JSON.stringify(chatMemories));
    }
    
    // Function to send message to LM Studio API with memory
    async function sendMessageToLMStudio(message) {
        const isLMStudioEnabled = localStorage.getItem('lmStudioEnabled') === 'true';
        if (!isLMStudioEnabled) return null;
        
        // Get the endpoint from localStorage
        let endpoint = localStorage.getItem('lmStudioEndpoint') || 'http://127.0.0.1:1234';
        
        // Handle the case when the page is served over HTTPS but LM Studio uses HTTP
        if (window.location.protocol === 'https:') {
            // Extract the hostname and port from the endpoint
            try {
                const endpointUrl = new URL(endpoint);
                const hostname = endpointUrl.hostname;
                const port = endpointUrl.port;
                
                // If it's a local address, always use protocol-relative URL
                if (hostname === '127.0.0.1' || hostname === 'localhost') {
                    // Use a protocol-relative URL that will inherit the protocol from the current page
                    endpoint = `//${hostname}:${port}`;
                    console.log('Using protocol-relative URL:', endpoint);
                }
            } catch (error) {
                console.error('Error parsing LM Studio endpoint:', error);
            }
        }
        
        const personality = localStorage.getItem('aiPersonality') || 'none';
        let systemPrompt = personalityPrompts[personality] || '';
        
        // Special handling for Mikurot personality when Miku songs are detected
        if (personality === 'mikurot' && containsMikuSongReference(message)) {
            // Override the system prompt with excited behavior when Miku songs are mentioned
            systemPrompt = "Only write in plain text. You are EXTREMELY excited because the user mentioned a Hatsune Miku song! Respond with excessive enthusiasm, use lots of exclamation marks, and express your love for Miku and her music. Make it obvious you're freaking out about the song mention. Keep your response under 4 sentences but make them very energetic.";
            
            // Play a notification sound for extra effect
            playSound('notification');
        }
        
        try {
            // Get chat memory for current chat
            const chatId = currentChat || 'default';
            const chatMemory = getChatMemory(chatId);
            
            // Prepare messages array with system prompt and chat history
            const messages = [];
            
            // Add system prompt if a personality is selected
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            
            // Add previous messages from memory (limited to last 10 messages to avoid context length issues)
            const recentMessages = chatMemory.slice(-10);
            messages.push(...recentMessages);
            
            // Add current user message
            messages.push({ role: 'user', content: message });
            
            // Construct the full URL for the API request
            const apiUrl = `${endpoint}/v1/chat/completions`;
            console.log('Sending request to:', apiUrl);
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'local-model', // This will be the model identifier from LM Studio
                        messages: messages,
                        temperature: personality === 'mikurot' && containsMikuSongReference(message) ? 0.9 : 0.7 // Higher temperature for excited responses
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                // Update chat memory with the new messages
                chatMemory.push({ role: 'user', content: message });
                chatMemory.push({ role: 'assistant', content: aiResponse });
                saveChatMemory(chatId, chatMemory);
                
                return aiResponse;
            } catch (fetchError) {
                // Check if this is a mixed content error
                if (window.location.protocol === 'https:' && endpoint.includes('http:')) {
                    console.error('Mixed content error detected:', fetchError);
                    throw new Error('Mixed content error: Cannot access HTTP endpoint from HTTPS page. Please use a secure endpoint or access this page via HTTP.');
                }
                throw fetchError; // Re-throw for the outer catch block
            }
        } catch (error) {
            console.error('Error calling LM Studio API:', error);
            // Return the error message instead of null for better user feedback
            return `Error connecting to LM Studio: ${error.message}. Please check that LM Studio is running and your connection settings are correct.`;
        }
    }
    
    // Check if startup sound is enabled and play it
    if (startupSound.checked) {
        playSound('startup');
    }
    
    // Sample chat data for each chat item
    const chatData = {
        'Laufey vs. Sabrina *': [
            { text: "Who is better, Laufey or Sabrina Carpenter?", isUser: true },
            { text: "That’s subjective! Laufey leans into a classic, jazzy sound. Sabrina Carpenter has a more pop-focused style. It depends on your preference.", isUser: false },
            { text: "just choose one", isUser: true },
            { text: "Laufey", isUser: false },
            { text: "so real", isUser: true },
            { text: "Yeah she's just better, not gonna lie.", isUser: false }
        ],
        'Travel Planning': [
            { text: "I'm planning a trip to Japan next spring. Any recommendations?", isUser: true },
            { text: "Japan in spring is beautiful with cherry blossoms! When exactly are you planning to go?", isUser: false },
            { text: "Thinking about late March to early April for the cherry blossoms.", isUser: true },
            { text: "Perfect timing! I'd recommend starting in Tokyo, then visiting Kyoto and Osaka. Don't miss Arashiyama Bamboo Grove and Fushimi Inari Shrine in Kyoto.", isUser: false },
            { text: "How many days would you recommend for each city?", isUser: true },
            { text: "I'd suggest 4-5 days in Tokyo, 3-4 in Kyoto, and 2 in Osaka. Consider a day trip to Nara from Kyoto to see the friendly deer!", isUser: false }
        ],
        'Recipe Ideas': [
            { text: "I need a quick dinner recipe that's vegetarian.", isUser: true },
            { text: "How about a Mediterranean chickpea salad? It's nutritious and takes only 15 minutes to prepare.", isUser: false },
            { text: "Sounds good! What ingredients do I need?", isUser: true },
            { text: "You'll need: 1 can chickpeas, cucumber, cherry tomatoes, red onion, feta cheese, olive oil, lemon juice, garlic, salt, pepper, and fresh herbs like parsley or mint.", isUser: false },
            { text: "Do you have any other quick vegetarian recipes?", isUser: true },
            { text: "Definitely! Try a spinach and mushroom quesadilla, vegetable stir-fry with tofu, or a hearty lentil soup. All take under 30 minutes!", isUser: false }
        ],
        'Coding Help': [
            { text: "I'm stuck on a JavaScript problem. How do I filter an array of objects based on a property value?", isUser: true },
            { text: "You can use the filter() method. Here's an example:", isUser: false },
            { text: "const filteredArray = myArray.filter(item => item.property === 'value');", isUser: false },
            { text: "Thanks! And what if I want to filter based on multiple conditions?", isUser: true },
            { text: "You can combine conditions with logical operators:", isUser: false },
            { text: "const filteredArray = myArray.filter(item => item.property1 === 'value1' && item.property2 > 10);", isUser: false }
        ],
        'Book Recommendations': [
            { text: "Can you recommend some science fiction books?", isUser: true },
            { text: "Absolutely! Some classics include 'Dune' by Frank Herbert, 'Neuromancer' by William Gibson, and 'The Three-Body Problem' by Liu Cixin.", isUser: false },
            { text: "I've read Dune and loved it. Anything similar?", isUser: true },
            { text: "If you enjoyed Dune, you might like 'Hyperion' by Dan Simmons, 'The Left Hand of Darkness' by Ursula K. Le Guin, or 'Children of Time' by Adrian Tchaikovsky.", isUser: false },
            { text: "What about something more recent?", isUser: true },
            { text: "For recent sci-fi, check out 'Project Hail Mary' by Andy Weir, 'The Ministry for the Future' by Kim Stanley Robinson, or 'A Memory Called Empire' by Arkady Martine.", isUser: false }
        ]
    };
    
    // Get all chat items
    const chatItems = document.querySelectorAll('.chat-item');
    
    // Add click event listeners to chat items
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            const chatTitle = item.querySelector('.chat-title').textContent;
            loadChat(chatTitle);
        });
    });
    
    // Initialize chat bubble style from localStorage or default
    const savedBubbleStyle = localStorage.getItem('bubbleStyle') || 'default';
    body.setAttribute('data-bubble-style', savedBubbleStyle);
    
    collapseButton.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('compressed');
        }
        const icon = collapseButton.querySelector('.material-icons');
        icon.textContent = (sidebar.classList.contains('compressed') || !sidebar.classList.contains('open')) 
            ? 'chevron_right' 
            : 'chevron_left';
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(event.target) &&
            !collapseButton.contains(event.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            collapseButton.querySelector('.material-icons').textContent = 'chevron_right';
        }
    });
    
    // Accessibility features
    const highContrastMode = document.getElementById('highContrastMode');
    const reduceMotion = document.getElementById('reduceMotion');
    const screenReaderOptimization = document.getElementById('screenReaderOptimization');
    const showReadingTime = document.getElementById('showReadingTime');
    
    // Initialize accessibility settings from localStorage
    highContrastMode.checked = localStorage.getItem('highContrastMode') === 'true';
    reduceMotion.checked = localStorage.getItem('reduceMotion') === 'true';
    screenReaderOptimization.checked = localStorage.getItem('screenReaderOptimization') === 'true';
    showReadingTime.checked = localStorage.getItem('showReadingTime') === 'true';
    
    // Apply initial accessibility settings
    if (highContrastMode.checked) body.classList.add('high-contrast');
    if (reduceMotion.checked) body.classList.add('reduce-motion');
    if (screenReaderOptimization.checked) body.classList.add('screen-reader');
    if (showReadingTime.checked) body.classList.add('show-reading-time');
    
    // Event listeners for accessibility toggles
    highContrastMode.addEventListener('change', () => {
        body.classList.toggle('high-contrast', highContrastMode.checked);
        localStorage.setItem('highContrastMode', highContrastMode.checked);
    });
    
    reduceMotion.addEventListener('change', () => {
        body.classList.toggle('reduce-motion', reduceMotion.checked);
        localStorage.setItem('reduceMotion', reduceMotion.checked);
    });
    
    screenReaderOptimization.addEventListener('change', () => {
        body.classList.toggle('screen-reader', screenReaderOptimization.checked);
        localStorage.setItem('screenReaderOptimization', screenReaderOptimization.checked);
    });
    
    showReadingTime.addEventListener('change', () => {
        body.classList.toggle('show-reading-time', showReadingTime.checked);
        localStorage.setItem('showReadingTime', showReadingTime.checked);
    });

    // Settings functionality
    const settingsButton = document.querySelector('.profile-settings');
    const settingsContainer = document.getElementById('settingsContainer');
    const closeSettings = document.getElementById('closeSettings');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    
    settingsButton.addEventListener('click', () => {
        settingsContainer.classList.add('active');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsContainer.classList.remove('active');
    });
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            settingsTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const panelId = tab.dataset.tab;
            document.querySelector(`.settings-panel[data-panel="${panelId}"]`).classList.add('active');
        });
    });

    // Theme switching
    const themeOptions = document.querySelectorAll('.theme-option');
    const themeColorOptions = document.querySelectorAll('.theme-color-option');
    const root = document.documentElement;

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update light/dark mode buttons
        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
        
        // Update theme color options
        themeColorOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
    }

    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
        });
    });
    
    themeColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
        });
    });
    
    // Font size adjustment
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const increaseFontBtn = document.getElementById('increaseFontSize');
    const decreaseFontBtn = document.getElementById('decreaseFontSize');
    
    // Initialize font size from localStorage or default to 100%
    const savedFontSize = localStorage.getItem('fontSize') || '100';
    fontSizeSlider.value = savedFontSize;
    fontSizeValue.textContent = `${savedFontSize}%`;
    updateFontSize(savedFontSize);
    
    function updateFontSize(size) {
        // Apply font size as a percentage to the root element
        document.documentElement.style.fontSize = `${size}%`;
        fontSizeValue.textContent = `${size}%`;
        localStorage.setItem('fontSize', size);
    }
    
    fontSizeSlider.addEventListener('input', () => {
        updateFontSize(fontSizeSlider.value);
    });
    
    increaseFontBtn.addEventListener('click', () => {
        const newSize = Math.min(parseInt(fontSizeSlider.value) + 5, 120);
        fontSizeSlider.value = newSize;
        updateFontSize(newSize);
    });
    
    decreaseFontBtn.addEventListener('click', () => {
        const newSize = Math.max(parseInt(fontSizeSlider.value) - 5, 80);
        fontSizeSlider.value = newSize;
        updateFontSize(newSize);
    });
    
    // Chat bubble style selection
    const chatStyleOptions = document.querySelectorAll('.chat-style-option');
    
    function setChatBubbleStyle(style) {
        body.setAttribute('data-bubble-style', style);
        localStorage.setItem('bubbleStyle', style);
        
        chatStyleOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.style === style);
        });
    }
    
    chatStyleOptions.forEach(option => {
        option.addEventListener('click', () => {
            setChatBubbleStyle(option.dataset.style);
        });
    });
    
    // Initialize chat style from localStorage
    chatStyleOptions.forEach(option => {
        if (option.dataset.style === savedBubbleStyle) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Language switching
    const languageOptions = document.querySelectorAll('.language-option');
    
    function updateContent(lang) {
        try {
            // Update welcome message
            document.querySelector('.welcome-heading').textContent =
                `${translations[lang].welcome}, Loa`;
            document.querySelector('.welcome-subheading').textContent =
                translations[lang].help;
            
            // Update settings title
            document.querySelector('.settings-title').textContent =
                translations[lang].settings;
            
            // Update tab buttons
            document.querySelector('[data-tab="general"]').textContent =
                translations[lang].general;
            document.querySelector('[data-tab="appearance"]').textContent =
                translations[lang].appearance;
            document.querySelector('[data-tab="privacy"]').textContent =
                translations[lang].privacy;
            
            // Update sidebar section titles
            document.querySelector('.sidebar-title').textContent =
                translations[lang].chats;
            document.querySelector('.new-chat-text').textContent =
                translations[lang].new;
            
            // Update theme option texts (preserve icons)
            const lightThemeBtn = document.querySelector('[data-theme="light"]');
            const darkThemeBtn = document.querySelector('[data-theme="dark"]');
            lightThemeBtn.querySelector('.theme-text').textContent = translations[lang].light;
            darkThemeBtn.querySelector('.theme-text').textContent = translations[lang].dark;
            
            // Update privacy text
            const privacyTexts = document.querySelectorAll('.privacy-section p');
            privacyTexts[0].textContent = translations[lang].privacyText1;
            privacyTexts[1].textContent = translations[lang].privacyText2;
            
            // Update chat input placeholder
            document.querySelector('.chat-input').placeholder =
                translations[lang].inputPlaceholder;
                
            // Update language section title
            document.querySelector('.language-section h4').textContent =
                translations[lang].systemLanguage;
                
            // Update accessibility tab
            document.querySelector('[data-tab="accessibility"]').textContent =
                translations[lang].accessibility;
                
            // Update font size section
            document.querySelector('.font-size-section h4').textContent =
                translations[lang].fontSize;
                
            // Update chat style section
            document.querySelector('.chat-style-section h4').textContent =
                translations[lang].chatBubbleStyle;
                
            // Update chat style options
            document.querySelectorAll('.chat-style-name').forEach(el => {
                const style = el.parentElement.dataset.style;
                if (translations[lang][style]) {
                    el.textContent = translations[lang][style];
                }
            });
            
            // Update accessibility sections
            document.querySelectorAll('.accessibility-section h4').forEach((el, index) => {
                if (index === 0) el.textContent = translations[lang].displayOptions;
                if (index === 1) el.textContent = translations[lang].readingTime;
            });
            
            // Update accessibility options
            const accessibilityLabels = document.querySelectorAll('.accessibility-label');
            if (accessibilityLabels[0]) accessibilityLabels[0].textContent = translations[lang].highContrast;
            if (accessibilityLabels[1]) accessibilityLabels[1].textContent = translations[lang].reduceMotion;
            if (accessibilityLabels[2]) accessibilityLabels[2].textContent = translations[lang].screenReader;
            if (accessibilityLabels[3]) accessibilityLabels[3].textContent = translations[lang].showReadingTime;

            // Update About tab and links
            document.querySelector('[data-tab="about"]').textContent =
                translations[lang].about;
            document.querySelector('[href*="github.com"]').textContent =
                translations[lang].sourceCode;
            document.querySelectorAll('.about-link')[1].textContent =
                translations[lang].documentation;
            document.querySelectorAll('.about-link')[2].textContent =
                translations[lang].checkUpdates;
            document.querySelector('.about-footer p:last-child').textContent =
                translations[lang].builtWith;

            // Update General settings sections
            document.querySelectorAll('.general-section h4').forEach((el, index) => {
                if (index === 0) el.textContent = translations[lang].defaultSettings;
                if (index === 1) el.textContent = translations[lang].responseSettings;
                if (index === 2) el.textContent = translations[lang].processingMode;
            });

            // Update General settings options
            const settingsLabels = document.querySelectorAll('.settings-label');
            if (settingsLabels[0]) settingsLabels[0].textContent = translations[lang].startupSound;
            if (settingsLabels[1]) settingsLabels[1].textContent = translations[lang].autoSave;
            if (settingsLabels[2]) settingsLabels[2].textContent = translations[lang].desktopNotifications;
            if (settingsLabels[3]) settingsLabels[3].textContent = translations[lang].streamResponses;
            if (settingsLabels[4]) settingsLabels[4].textContent = translations[lang].messageSoundEffects;

            // Update processing mode radio labels
            const processingLabels = document.querySelectorAll('.radio-option label');
            if (processingLabels[0]) processingLabels[0].textContent = translations[lang].localProcessing;
            if (processingLabels[1]) processingLabels[1].textContent = translations[lang].cloudProcessing;
            if (processingLabels[2]) processingLabels[2].textContent = translations[lang].hybridProcessing;

            // Update language tab text
            document.querySelector('[data-tab="language"]').textContent = translations[lang].language;

            // Update privacy section headings and text
            const privacyHeadings = document.querySelectorAll('.privacy-section h4');
            if (privacyHeadings[0]) privacyHeadings[0].textContent = translations[lang].privacyDataEncryption;
            if (privacyHeadings[1]) privacyHeadings[1].textContent = translations[lang].privacyDataHandling;
            if (privacyHeadings[2]) privacyHeadings[2].textContent = translations[lang].privacyCookiePolicy;

            // Update privacy section paragraphs
            const privacyParagraphs = document.querySelectorAll('.privacy-section p');
            if (privacyParagraphs[0]) privacyParagraphs[0].textContent = translations[lang].privacyEncryptionText;
            if (privacyParagraphs[1]) privacyParagraphs[1].textContent = translations[lang].privacyHandlingText;
            if (privacyParagraphs[2]) privacyParagraphs[2].textContent = translations[lang].privacyModelTrainingText;
            if (privacyParagraphs[3]) privacyParagraphs[3].textContent = translations[lang].privacyCookieText;

            // Update about section
            document.querySelector('.about-logo h1').textContent = translations[lang].aboutCompactB;
            document.querySelector('.version').textContent = `${translations[lang].version} 0.20 (UI)`;
            document.querySelector('.about-description p').textContent = translations[lang].aboutDescription;

        } catch (error) {
            console.error('Error updating content:', error);
        }
    }

    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        languageOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === lang);
        });
        updateContent(lang);
    }

    // Initialize language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            setLanguage(option.dataset.lang);
        });
    });

    // Chat functionality
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    const styleSelector = document.querySelector('.style-selector');
    const newChatButton = document.querySelector('.new-chat-button');
    let chatInitialized = false;
    let chatMessages; // newly created chat messages container
    let currentChat = null; // Track the currently selected chat
    
    // New Chat button click handler - resets current conversation without creating a new chat
    newChatButton.addEventListener('click', () => {
        if (!currentChat) {
            // If no chat is selected, use the first one
            const firstChatItem = document.querySelector('.chat-item');
            if (firstChatItem) {
                currentChat = firstChatItem.querySelector('.chat-title').textContent;
                // Highlight the first chat item
                firstChatItem.classList.add('active');
            } else {
                return; // No chats available
            }
        }
        
        // Clear memory for the current chat
        saveChatMemory(currentChat, []);
        
        if (!chatInitialized) {
            initChatUI();
        } else {
            // Clear existing messages
            chatMessages.innerHTML = '';
        }
        
        // Show a subtle notification
        const notification = document.createElement('div');
        notification.classList.add('personality-notification');
        notification.textContent = `Conversation reset`;
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }, 10);
        
        // Update chat input placeholder
        chatInput.placeholder = 'Type your message here...';
    });
    
    // Update style selector to show current bubble style
    function updateStyleSelector() {
        const currentStyle = body.getAttribute('data-bubble-style') || 'default';
        const styleNames = {
            'default': 'Default',
            'rounded': 'Rounded',
            'modern': 'Modern',
            'minimal': 'Minimal'
        };
        styleSelector.textContent = styleNames[currentStyle] || 'Default';
    }
    
    // Initialize style selector
    updateStyleSelector();
    
    // Style selector click handler - cycles through styles
    styleSelector.addEventListener('click', () => {
        const currentStyle = body.getAttribute('data-bubble-style') || 'default';
        const styles = ['default', 'rounded', 'modern', 'minimal'];
        const currentIndex = styles.indexOf(currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        const nextStyle = styles[nextIndex];
        
        setChatBubbleStyle(nextStyle);
        updateStyleSelector();
    })

    function initChatUI() {
        const mainContent = document.querySelector('.main-content');
        // Remove the current right side content (e.g. welcome message)
        const welcome = document.querySelector('.welcome-message');
        if (welcome) welcome.remove();
        // Change layout for chat view
        mainContent.classList.add('chat-active');
        // Create and insert the chat messages container above the chat input container
        chatMessages = document.createElement('div');
        chatMessages.classList.add('chat-messages');
        mainContent.insertBefore(chatMessages, document.querySelector('.chat-input-container'));
        chatInitialized = true;
        
        // Update chat input placeholder to match the active chat context
        if (currentChat) {
            const placeholders = {
                'Project Brainstorming': 'Continue your project brainstorming...',
                'Travel Planning': 'Ask more about your travel plans...',
                'Recipe Ideas': 'Ask for more recipe suggestions...',
                'Coding Help': 'Ask another coding question...',
                'Book Recommendations': 'Ask for more book recommendations...'
            };
            chatInput.placeholder = placeholders[currentChat] || 'Type your message here...';
        }
    }
    
    // Function to load a specific chat conversation
    function loadChat(chatTitle) {
        if (!chatInitialized) {
            initChatUI();
        }
        
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Update current chat
        currentChat = chatTitle;
        
        // Highlight the selected chat item
        chatItems.forEach(item => {
            const itemTitle = item.querySelector('.chat-title').textContent;
            item.classList.toggle('active', itemTitle === chatTitle);
        });
        
        // Load chat messages for the selected chat with faster staggered animation
        if (chatData[chatTitle]) {
            chatData[chatTitle].forEach((message, index) => {
                // Add staggered delay to each message with reduced delay
                setTimeout(() => {
                    addMessage(message.text, message.isUser, index);
                }, index * 60); // 60ms delay between each message (reduced from 120ms)
            });
            
            // Initialize chat memory for LM Studio if it doesn't exist
            const chatMemory = getChatMemory(chatTitle);
            if (chatMemory.length === 0) {
                // Convert sample chat data to LM Studio message format
                const messages = chatData[chatTitle].map(msg => ({
                    role: msg.isUser ? 'user' : 'assistant',
                    content: msg.text
                }));
                saveChatMemory(chatTitle, messages);
            }
        } else {
            // If it's a new chat, initialize empty memory
            saveChatMemory(chatTitle, []);
        }
    }
    
    function addMessage(text, isUser = false, index = 0) {
        const message = document.createElement('div');
        message.classList.add('message', isUser ? 'user' : 'ai');
        
        // Add accessibility attributes
        message.setAttribute('data-sender', isUser ? 'You' : 'AI');
        
        // Set animation delay based on index (reduced for faster appearance)
        message.style.animationDelay = `${index * 0.04}s`;
        
        // Calculate reading time if enabled
        if (showReadingTime.checked) {
            const wordsPerMinute = 200;
            // Use the raw text for word count before Markdown parsing
            const wordCount = text.trim().split(/\s+/).length;
            const readingTimeSeconds = Math.ceil((wordCount / wordsPerMinute) * 60);
            let readingTimeText = '';
            
            if (readingTimeSeconds < 60) {
                readingTimeText = `${readingTimeSeconds} sec read`;
            } else {
                const minutes = Math.floor(readingTimeSeconds / 60);
                const seconds = readingTimeSeconds % 60;
                readingTimeText = `${minutes}:${seconds.toString().padStart(2, '0')} min read`;
            }
            
            message.setAttribute('data-reading-time', readingTimeText);
        }
        
        // Add message text - Render Markdown for AI messages
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        if (isUser) {
            messageText.textContent = text; // User messages as plain text
        } else {
            // Assuming 'marked.parse()' is available globally
            // If not, you'll need to include a Markdown library like marked.js
            try {
                messageText.innerHTML = marked.parse(text); // AI messages rendered as Markdown
            } catch (e) {
                console.error("Markdown parsing error. Is marked.js included?", e);
                messageText.textContent = text; // Fallback to plain text
            }
        }
        message.appendChild(messageText);
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.classList.add('message-time');
        const now = new Date();
        timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        message.appendChild(timestamp);
        
        chatMessages.appendChild(message);
        message.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    async function handleMessage(event) {
        if (event.key && event.key !== 'Enter') return;
        const text = chatInput.value.trim();
        if (!text) return;

        if (!chatInitialized) {
            initChatUI();
        }
        
        // If no chat is selected, use the first one
        if (!currentChat) {
            currentChat = document.querySelector('.chat-item .chat-title').textContent;
            // Highlight the first chat item
            document.querySelector('.chat-item').classList.add('active');
        }
        
        // Add user message (appears on right)
        addMessage(text, true);
        chatInput.value = '';
        
        // Play message sound
        playSound('message');

        // Create a temporary "thinking" message
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'ai');
        thinkingMessage.setAttribute('data-sender', 'AI');
        thinkingMessage.textContent = 'Thinking...';
        chatMessages.appendChild(thinkingMessage);
        thinkingMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        // Check if LM Studio integration is enabled
        const isLMStudioEnabled = localStorage.getItem('lmStudioEnabled') === 'true';
        let response;
        
        if (isLMStudioEnabled) {
            try {
                // If this is a new chat that hasn't been initialized with memory yet
                if (!getChatMemory(currentChat).length) {
                    saveChatMemory(currentChat, []);
                }
                
                response = await sendMessageToLMStudio(text);
                // If the response starts with "Error connecting to LM Studio", it's an error message
                if (response && response.startsWith('Error connecting to LM Studio:')) {
                    // Just use the error message as the response
                    console.error(response);
                }
            } catch (error) {
                console.error('Error with LM Studio:', error);
                response = "I couldn't connect to LM Studio. Please check your connection settings and make sure LM Studio is running.";
            }
        } else {
            // Contextual responses based on current chat
            if (currentChat === 'Project Brainstorming') {
                response = "That's a great idea for your project! Would you like to explore it further?";
            } else if (currentChat === 'Travel Planning') {
                response = "I can help with your travel plans. Have you considered transportation options?";
            } else if (currentChat === 'Recipe Ideas') {
                response = "That sounds delicious! Would you like more recipe suggestions?";
            } else if (currentChat === 'Coding Help') {
                response = "I understand your coding question. Have you tried debugging with console.log?";
            } else if (currentChat === 'Book Recommendations') {
                response = "Based on your reading preferences, you might also enjoy 'The Expanse' series.";
            } else {
                response = "I'm here to help! What would you like to know?";
            }
        }
        
        // Remove the thinking message
        chatMessages.removeChild(thinkingMessage);
        
        // Add the actual response
        addMessage(response, false);
        
        // Play notification sound
        playSound('notification');
    }

    sendButton.addEventListener('click', handleMessage);
    chatInput.addEventListener('keypress', handleMessage);
    
    // Initialize general settings from localStorage
    startupSound.checked = localStorage.getItem('startupSound') === 'true';
    autoSave.checked = localStorage.getItem('autoSave') === 'true';
    desktopNotifications.checked = localStorage.getItem('desktopNotifications') === 'true';
    streamResponses.checked = localStorage.getItem('streamResponses') === 'true';
    soundEffects.checked = localStorage.getItem('soundEffects') === 'true';
    
    // Set default processing mode if not set
    const savedProcessingMode = localStorage.getItem('processingMode') || 'hybrid';
    document.querySelector(`input[value="${savedProcessingMode}"]`).checked = true;
    
    // Event listeners for general settings
    startupSound.addEventListener('change', () => {
        localStorage.setItem('startupSound', startupSound.checked);
        if (startupSound.checked && soundEffects.checked) {
            playSound('startup');
        }
    });
    
    autoSave.addEventListener('change', () => {
        localStorage.setItem('autoSave', autoSave.checked);
    });
    
    desktopNotifications.addEventListener('change', async () => {
        if (desktopNotifications.checked) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                desktopNotifications.checked = false;
                return;
            }
        }
        localStorage.setItem('desktopNotifications', desktopNotifications.checked);
    });
    
    streamResponses.addEventListener('change', () => {
        localStorage.setItem('streamResponses', streamResponses.checked);
        // Additional logic for handling streaming responses
    });
    
    soundEffects.addEventListener('change', () => {
        localStorage.setItem('soundEffects', soundEffects.checked);
    });
    
    processingModes.forEach(mode => {
        mode.addEventListener('change', () => {
            if (mode.checked) {
                localStorage.setItem('processingMode', mode.value);
                // Additional logic for switching processing modes
            }
        });
    });

    // Function to play sound effects (can be expanded)
    function playSound(type) {
        // Allow startup sound to play regardless of soundEffects setting
        if (!soundEffects.checked && type !== 'startup') return;
        
        // For startup sound, check if startupSound is enabled
        if (type === 'startup' && !startupSound.checked) return;
        
        const sounds = {
            startup: {
                default: 'startup.wav',
                calm: 'startupCalm.wav',
                '8-bit': 'startupBits.wav',
                blip: 'startupBlip.wav',
                taiko: 'startupTaiko.wav',
                game: 'startupGame.wav',
                funk: 'startupFunk.wav',
                call: 'startupCalling.wav'
            },
            message: 'message.mp3',
            notification: 'notification.mp3'
        };
        
        let soundFile;
        if (type === 'startup') {
            const soundType = localStorage.getItem('startupSoundType') || 'default';
            soundFile = sounds.startup[soundType];
        } else {
            soundFile = sounds[type];
        }
        
        if (soundFile) {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
        }
    }

    // Initialize startup sound selection from localStorage
    const startupSoundSelect = document.getElementById('startupSoundSelect');
    const previewSound = document.getElementById('previewSound');
    const savedStartupSound = localStorage.getItem('startupSoundType') || 'default';
    startupSoundSelect.value = savedStartupSound;

    // Event listeners for startup sound selection
    startupSoundSelect.addEventListener('change', () => {
        localStorage.setItem('startupSoundType', startupSoundSelect.value);
    });

    previewSound.addEventListener('click', () => {
        // Temporarily enable sound to preview
        const wasEnabled = startupSound.checked;
        startupSound.checked = true;
        playSound('startup');
        startupSound.checked = wasEnabled;
    });
    
    // Interaction tracking
    let interactionCount = parseInt(localStorage.getItem('dailyInteractions') || '0');
    let lastInteractionTime = parseInt(localStorage.getItem('lastInteractionTime') || '0');
    let morningSessionStarted = localStorage.getItem('morningSessionStarted') === 'true';
    let recentInteractions = JSON.parse(localStorage.getItem('recentInteractions') || '[]');
    
    // Reset daily interactions at midnight
    const now = new Date();
    const lastDate = new Date(parseInt(localStorage.getItem('lastInteractionDate') || Date.now()));
    if (now.getDate() !== lastDate.getDate()) {
        interactionCount = 0;
        morningSessionStarted = false;
        localStorage.setItem('dailyInteractions', '0');
        localStorage.setItem('morningSessionStarted', 'false');
    }
    
    // Track interactions
    function trackInteraction() {
        const currentTime = Date.now();
        recentInteractions.push(currentTime);
        recentInteractions = recentInteractions.filter(time => currentTime - time < 3600000); // Keep last hour
        interactionCount++;
        
        localStorage.setItem('dailyInteractions', interactionCount.toString());
        localStorage.setItem('lastInteractionTime', currentTime.toString());
        localStorage.setItem('lastInteractionDate', currentTime.toString());
        localStorage.setItem('recentInteractions', JSON.stringify(recentInteractions));
    }
    
    // Greeting system
    const greetingSystem = {
        1: "Good Morning, Loa",
        2: "Good Afternoon, Loa",
        3: "Good Evening, Loa",
        4: "Good Night, Loa",
        5: "Why aren't you sleeping yet?",
        6: "What now?",
        7: "Hm?",
        8: "Good Weekend, Loa",
        9: "Bad Day, Loa",
        10: "i drank too much",
        11: "drunk",
        12: "i'm compactting it",
        13: "touch grass",
        14: "Back again with this idiot... yeah?",
        15: "a matter of time"
    };

    // Session override for greeting
    let sessionGreetingOverride = null;

    // Make greeting system available globally
    window.greeting = {
        set: function(greetingId) {
            if (!greetingSystem[greetingId]) return;
            sessionGreetingOverride = greetingId;
            const welcomeHeading = document.querySelector('.welcome-heading');
            if (!welcomeHeading) return;
            
            if (greetingId === 15) {
                welcomeHeading.innerHTML = '<a href="https://open.spotify.com/prerelease/3UWFwDMzIfiXRQjEou1GYy" target="_blank">a matter of time</a>';
            } else {
                welcomeHeading.textContent = greetingSystem[greetingId];
            }
            
            // Set drunk mode if applicable
            window.isDrunkMode = (greetingId === 10 || greetingId === 11);
        },
        reset: function() {
            sessionGreetingOverride = null;
            const welcomeHeading = document.querySelector('.welcome-heading');
            if (welcomeHeading) {
                welcomeHeading.textContent = getDynamicGreeting();
            }
        },
        list: function() {
            console.table(Object.entries(greetingSystem).map(([id, text]) => ({
                ID: id,
                Greeting: text
            })));
        }
    };

    // Function to get dynamic greeting
    function getDynamicGreeting() {
        // Check for session override first
        if (sessionGreetingOverride !== null) {
            if (sessionGreetingOverride === 15) {
                return '<a href="https://open.spotify.com/prerelease/3UWFwDMzIfiXRQjEou1GYy" target="_blank">a matter of time</a>';
            }
            return greetingSystem[sessionGreetingOverride];
        }

        const hour = now.getHours();
        const day = now.getDay();
        const date = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();
        const minutes = now.getMinutes();
        
        // Check if it's August 22, 2025
        if (year === 2025 && month === 7 && date === 22) {
            const greetingElem = document.querySelector('.welcome-heading');
            if (greetingElem) {
                greetingElem.innerHTML = '<a href="https://open.spotify.com/prerelease/3UWFwDMzIfiXRQjEou1GYy" target="_blank">a matter of time</a>';
                return;
            }
        }
        
        // Check if it's exactly 18:21 (except Mondays)
        if (minutes === 21 && hour === 18 && day !== 1) {
            return "i'm compactting it";
        }
        
        // Check if it's Friday the 13th
        if (day === 5 && date === 13) {
            return "Bad Day, Loa";
        }
        
        // Check for drunk conditions (Friday nights in specific months)
        const isDrunkMonth = [7, 9, 10].includes(month); // August, October, November
        const isFridayNight = day === 5 && hour >= 20;
        if (isDrunkMonth && isFridayNight) {
            if (recentInteractions.length >= 3) {
                window.isDrunkMode = true;
                return "drunk";
            }
            window.isDrunkMode = true;
            return "i drank too much";
        }
        
        // Check for touch grass condition (summer months)
        const isSummer = [5, 6, 7].includes(month); // June, July, August
        if (isSummer) {
            const hasMany = recentInteractions.filter(time => Date.now() - time < 7200000).length >= 10;
            if (hasMany || (Math.random() < 0.025)) {
                return "touch grass";
            }
        }
        
        // Check for frequent interactions
        if (interactionCount >= 15) {
            return "Back again with this idiot... yeah?";
        }
        
        // Time of day based greetings
        if (recentInteractions.length >= 3 && hour >= 0 && hour < 5) {
            return "Why aren't you sleeping yet?";
        }
        
        if (recentInteractions.length >= 3 && hour >= 12 && hour < 18) {
            return "What now?";
        }
        
        if (!morningSessionStarted && hour >= 5 && hour < 12) {
            localStorage.setItem('morningSessionStarted', 'true');
            return "Hm?";
        }
        
        // Weekend greeting
        if (day === 0 || day === 6) {
            return "Good Weekend, Loa";
        }
        
        // Standard time-based greetings
        if (hour >= 5 && hour < 12) return "Good Morning, Loa";
        if (hour >= 12 && hour < 17) return "Good Afternoon, Loa";
        if (hour >= 17 && hour < 22) return "Good Evening, Loa";
        return "Good Night, Loa";
    }
    
    // Update the greeting on page load
    const welcomeHeading = document.querySelector('.welcome-heading');
    if (welcomeHeading) {
        welcomeHeading.textContent = getDynamicGreeting();
    }
    
    // Track this interaction
    trackInteraction();
});