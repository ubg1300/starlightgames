// === CONFIGURATION CONSTANTS (Global Scope) ===
const FADE_DURATION_MS = 300; // 300 milliseconds
const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`; // Creates "0.3s" for CSS

// --- GLOBAL FLAG ---
let manualExitIntent = false;


// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
(function initializeSetup() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const css = `
        /* Overlay Base Styles */
        #offscreen-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: white; z-index: 99999; display: none;
            flex-direction: column; justify-content: center; align-items: center;
            color: black; font-family: sans-serif; opacity: 1;
            transition: opacity ${FADE_DURATION_CSS} ease-in-out;
        }
        #offscreen-overlay.fade-out { opacity: 0 !important; }

    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === GLOBAL TOGGLE FUNCTIONS (Defined immediately for HTML onclick events to work) ===

window.toggleTabProtection = function() {
    let tabProtectionEnabled = localStorage.getItem('tabProtectionState') !== 'false'; 
    tabProtectionEnabled = !tabProtectionEnabled; 
    localStorage.setItem('tabProtectionState', tabProtectionEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleRedirect = function() {
    let redirectEnabled = localStorage.getItem('redirectToggleState') === 'true'; 
    redirectEnabled = !redirectEnabled;
    localStorage.setItem('redirectToggleState', redirectEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleOverlay = function() {
    // Default state: ON (visible overlay) unless explicitly set to 'false'
    let overlayEnabled = localStorage.getItem('overlayToggleState') !== 'false';
    overlayEnabled = !overlayEnabled;
    localStorage.setItem('overlayToggleState', overlayEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.dispatchEvent(new Event('themeToggle'));
}

window.toggleStats = function() {
    const currentState = localStorage.getItem('statsToggleState') === 'true'; 
    const newState = !currentState;
    localStorage.setItem('statsToggleState', newState ? 'true' : 'false');
    document.dispatchEvent(new Event('statsToggle'));
    console.log(`[SETTINGSYNC] Show Stats toggled to: ${newState}`);
};

window.addEventListener('load', () => {

// === MAIN SETUP LOGIC (Runs 700ms after script load) ===
setTimeout(() => {
    
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const STORAGE_KEY_OVERLAY = 'overlayToggleState'; // NEW KEY
    const STORAGE_KEY_STATS = 'statsToggleState';
    const REDIRECT_DELAY = 65; 
    const REDIRECT_URL = "https://www.google.com";

    // === DOM ELEMENTS ===
    // Security UI
    const toggleSwitch = document.getElementById('protection-toggle-switch'); 
    const switchIcon = document.getElementById('switch-icon-protection');    
    const statusText = document.getElementById('protection-status');         
    const redirectToggleBtn = document.getElementById('blur-toggle-switch'); 
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect');
    let overlay = document.getElementById('offscreen-overlay');

    // NEW OVERLAY ELEMENTS
    const overlayOptionContainer = document.getElementById('overlay-option-container'); // Container to hide/show
    const overlayToggleSwitch = document.getElementById('overlay-toggle-switch');
    const overlaySwitchIcon = document.getElementById('switch-icon-overlay');
    
    // Theme UI
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 
    
    // Stats UI
    const statsToggleContainer = document.getElementById('stats-toggle-switch');
    const statsIcon = document.getElementById('switch-icon-stats');
    const infoBtn = document.getElementById('info-btn'); 
    const modal = document.getElementById('performance-modal');
    const fpsValue = document.getElementById('fps-value');
    const pingValue = document.getElementById('ping-value');

    let timeoutHandle = null;

    // --- Create Overlay Element if it doesn't exist ---
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offscreen-overlay';
        overlay.innerHTML = `<div></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    } else {
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    }
    
    function handleOverlayTransitionEnd(event) {
        if (event.propertyName === 'opacity' && overlay.classList.contains('fade-out')) {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out'); 
        }
    }


    // === UI UPDATE FUNCTIONS ===
    
    function updateProtectionUI(isEnabled) { 

        if (isEnabled) {
                    localStorage.setItem(STORAGE_KEY_PROTECTION, 'true'); // may fix errors
            const closepreventionwarning = 'closepreventionwarning'; 
            if (localStorage.getItem(closepreventionwarning) === null) {
                localStorage.setItem(closepreventionwarning, 'true');
            }
            if(toggleSwitch) toggleSwitch.classList.add('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(switchIcon) switchIcon.classList.add('text-white');
            if(switchIcon) switchIcon.classList.remove('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'ACTIVE';
            if(statusText) statusText.classList.add('text-[#3498db]'); 
            if(statusText) statusText.classList.remove('text-white/80');
        } else {
            if(toggleSwitch) toggleSwitch.classList.remove('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(switchIcon) switchIcon.classList.remove('text-white');
            if(switchIcon) switchIcon.classList.add('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'DISABLED';
            if(statusText) statusText.classList.remove('text-[#3498db]');
            if(statusText) statusText.classList.add('text-white/80');
        }
    }
    
    function updateRedirectUI(isEnabled) { 
        if (!redirectToggleBtn) return;
        if (isEnabled) {
            redirectToggleBtn.classList.add('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-[#bdc3c7]');
        } else {
            redirectToggleBtn.classList.remove('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-[#bdc3c7]');
        }
    }
    
    // NEW: Function to update the Overlay button's visual state
    function updateOverlayUI(isEnabled) { 
        if (!overlayToggleSwitch) return;
        if (isEnabled) {
            overlayToggleSwitch.classList.add('switch-on');
            // Icon for ON (Visible Eye)
            if(overlaySwitchIcon) overlaySwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
        } else {
            overlayToggleSwitch.classList.remove('switch-on');
            // Icon for OFF (Slashed Eye)
            if(overlaySwitchIcon) overlaySwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A10.05 10.05 0 0112 15c4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.065-7-9.542-7a9.97 9.97 0 00-2.31 1.708m-1.72-1.72l-1.81 1.81M14.25 18.75l-1.72-1.72M5.25 5.25l1.81 1.81M18.75 18.75l-1.81-1.81" />`;
        }
    }

    function applyThemeUI(theme) { 
        if (theme === 'dark') {
            if (themeSwitchContainer) themeSwitchContainer.classList.add('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
            if (themeStatusSpan) themeStatusSpan.textContent = 'Dark Mode';
        } else {
            if (themeSwitchContainer) themeSwitchContainer.classList.remove('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
            if (themeStatusSpan) themeStatusSpan.textContent = 'Light Mode';
        }
    }

    function updateStatsUI(isVisible) { 
        const displayStyle = isVisible ? 'initial' : 'none';
        if (infoBtn) infoBtn.style.display = displayStyle;
        if (modal) modal.style.display = displayStyle;
        if (fpsValue) fpsValue.style.display = displayStyle;
        if (pingValue) pingValue.style.display = displayStyle;

        if (statsToggleContainer) {
            if (isVisible) {
                statsToggleContainer.classList.add('switch-on');
                if (statsIcon) statsIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`; 
            } else {
                statsToggleContainer.classList.remove('switch-on');
                if (statsIcon) statsIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`; 
            }
        }
    }


    // === CORE OVERLAY LOGIC ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            overlay.classList.add('fade-out');
        } else {
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }

    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        manualExitIntent = true; 
        window.location.replace(REDIRECT_URL);
    }

    // === EVENT LISTENERS ===

    window.addEventListener('beforeunload', function(e) {
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true' && !manualExitIntent) { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    document.addEventListener('visibilitychange', () => {
        const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
        const overlayEnabled = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false'; // NEW: Check Overlay state

        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                // REDIRECT ON: Redirect immediately
                timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
            } else if (overlayEnabled) {
                // REDIRECT OFF & OVERLAY ON: Show the 'Content Hidden' overlay
                toggleContentVisibility(false); 
            } else {
                // REDIRECT OFF & OVERLAY OFF: Do nothing (stealth bypass)
            }
        } else {
            // Tab is visible/focused again
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        }
    });

    window.addEventListener('focus', function () {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (overlay && overlay.style.display === 'flex') {
            if (event.key.toUpperCase() === 'E') {
                toggleContentVisibility(true);
                event.preventDefault();
            }
            if (event.key === ' ') {
                redirect(true);
                event.preventDefault();
            }
        }
    });
    
    // Listen for custom events triggered by the global toggle functions to update the UI
    document.addEventListener('securityToggle', () => {
        const protEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false';
        const redirEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true';
        const overlayEnabled = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false'; // NEW state check

        updateProtectionUI(protEnabled);
        updateRedirectUI(redirEnabled);
        updateOverlayUI(overlayEnabled); // NEW UI update

        // NEW LOGIC: Control the visibility of the Overlay option
        if (overlayOptionContainer) {
            overlayOptionContainer.style.display = redirEnabled ? 'none' : 'flex';
        }
    });
    
    document.addEventListener('themeToggle', () => {
        const theme = localStorage.getItem('theme') || 'light';
        applyThemeUI(theme);
    });
    
    document.addEventListener('statsToggle', () => {
        const statsEnabled = localStorage.getItem(STORAGE_KEY_STATS) === 'true';
        updateStatsUI(statsEnabled);
    });


    // === INITIALIZATION LOGIC (Runs inside setTimeout) ===

    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false'; 
    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
    const savedOverlayState = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false'; // NEW: Default ON
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedStatsState = localStorage.getItem(STORAGE_KEY_STATS) === 'true'; 

    // Apply initial UI states
    updateProtectionUI(savedProtectionState);
    updateRedirectUI(savedRedirectState);
    updateOverlayUI(savedOverlayState); // NEW UI update
    applyThemeUI(savedTheme);
    updateStatsUI(savedStatsState);

    // Initial check for Overlay option visibility
    if (overlayOptionContainer) {
        overlayOptionContainer.style.display = savedRedirectState ? 'none' : 'flex';
    }
    
}, 1000);
}); 
