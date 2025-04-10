document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const collapseButton = document.getElementById('collapseSidebarButton');
    
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
    const root = document.documentElement;

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        themeOptions.forEach(option => {
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
    let chatInitialized = false;
    let chatMessages; // newly created chat messages container

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
    }
    
    function addMessage(text, isUser = false) {
        const message = document.createElement('div');
        message.classList.add('message', isUser ? 'user' : 'ai');
        message.textContent = text;
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
        // Add user message (appears on right)
        addMessage(text, true);
        chatInput.value = '';

        // Simulate AI response ("haii :3" on left)
        setTimeout(() => {
            addMessage("haii :3", false);
        }, 500);
    }

    sendButton.addEventListener('click', handleMessage);
    chatInput.addEventListener('keypress', handleMessage);
});
