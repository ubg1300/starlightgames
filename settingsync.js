// === CONFIGURATION CONSTANTS (Global Scope) ===
const FADE_DURATION_MS =300;
const STORAGE_KEY_PROTECTION = 'tabProtectionState';
const STORAGE_KEY_REDIRECT = 'redirectToggleState';
const REDIRECT_DELAY = 65; 
const REDIRECT_URL = "https://www.google.com"; // Your desired redirect location

// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
(function initializeSetup() {
    // 1. Load Theme Attribute (Flash prevention)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Inject Dynamic CSS for Overlay Fading and Styling (Required for the overlay functionality)
    const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`;
    const css = `
        #offscreen-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: white; /* Customize your background */
            z-index: 99999;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: black;
            font-family: sans-serif;
            opacity: 1;
            transition: opacity ${FADE_DURATION_CSS} ease-in-out;
        }
        #offscreen-overlay.fade-out {
            opacity: 0 !important;
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === CORE SYNCRONIZATION LOGIC (Delayed Execution) ===
// Runs after a short delay to ensure the DOM is stable.
setTimeout(() => {
    
    // === DOM ELEMENT (Overlay is the only required element) ===
    let overlay = document.getElementById('offscreen-overlay');
    let timeoutHandle = null;

    // --- Create Overlay Element if it doesn't exist ---
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offscreen-overlay';
        overlay.innerHTML = `
            <div style="text-align: center;">
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    // === CORE OVERLAY AND REDIRECT FUNCTIONS ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            // FADE OUT LOGIC
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('fade-out');
            }, FADE_DURATION_MS);
        } else {
            // SHOW OVERLAY
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }

    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        
        // Temporarily disable tab protection before redirecting if it was enabled.
        if (isKeypress || localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true') {
            localStorage.setItem(STORAGE_KEY_PROTECTION, 'false');
            // NOTE: UI update functions removed. We just modify localStorage.
        }
        
        window.location.replace(REDIRECT_URL);
    }

    // === EVENT LISTENERS (Enforcing the security states from localStorage) ===

    // 1. Tab Close Protection Enforcement
    window.addEventListener('beforeunload', function(e) {
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true') { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    // 2. Redirect/Overlay Enforcement
    document.addEventListener('visibilitychange', () => {
        const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null;

        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
            } else {
                toggleContentVisibility(false); // Show overlay
            }
        } else {
            // Tab regained focus
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        }
    });

    // 3. Cancel Redirect on Focus
    window.addEventListener('focus', function () {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
    });

    // 4. Keypress Handlers ('E' to dismiss, 'SPACE' to force redirect)
    document.addEventListener('keydown', (event) => {
        if (overlay && overlay.style.display === 'flex') {
            if (event.key.toUpperCase() === 'E') {
                toggleContentVisibility(true); // Hide overlay (starts fade-out)
                event.preventDefault();
            }
            if (event.key === ' ') {
                redirect(true); // Redirect immediately (disables protection)
                event.preventDefault();
            }
        }
    });

    console.log('[SYNCMONITOR] Background security script is active and enforcing states.');
    
}, 800);
