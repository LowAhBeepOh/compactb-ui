document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const collapseButton = document.getElementById('collapseSidebarButton');
    const body = document.body;
    
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
    let chatInitialized = false;
    let chatMessages; // newly created chat messages container
    let currentChat = null; // Track the currently selected chat
    
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
        
        // Load chat messages for the selected chat
        if (chatData[chatTitle]) {
            chatData[chatTitle].forEach(message => {
                addMessage(message.text, message.isUser);
            });
        }
    }
    
    function addMessage(text, isUser = false) {
        const message = document.createElement('div');
        message.classList.add('message', isUser ? 'user' : 'ai');
        
        // Add accessibility attributes
        message.setAttribute('data-sender', isUser ? 'You' : 'AI');
        
        // Calculate reading time if enabled
        if (showReadingTime.checked) {
            const wordsPerMinute = 200;
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
        
        // Add message text
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.textContent = text;
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



    function handleMessage(event) {
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

        // Simulate AI response based on context
        setTimeout(() => {
            let response = "I'm here to help! What would you like to know?";
            
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
            }
            
            addMessage(response, false);
        }, 500);
    }

    sendButton.addEventListener('click', handleMessage);
    chatInput.addEventListener('keypress', handleMessage);
});
