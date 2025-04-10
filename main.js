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
});
