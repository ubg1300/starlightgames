// cloner.js content:
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if the current URL is NOT about:blank
    if (window.location.href !== 'about:blank') {

        // Try to open the new 'about:blank' tab
        const newWindow = window.open('about:blank', '_blank');

        if (newWindow) {
            // Success!

            // 1. Find the script element itself
            const scriptElement = document.getElementById('cloning-script');
            
            // 2. Remove the script element from the original document (MUST HAPPEN BEFORE capturing HTML)
            if (scriptElement) {
                scriptElement.remove();
            }

            // 3. Get the current page's entire HTML (now without the cloning script)
            const currentHtml = document.documentElement.outerHTML;

            // 4. Write that HTML into the new 'about:blank' tab
            newWindow.document.write(currentHtml);
            newWindow.document.close();

            // 5. Redirect the *original* tab to Google
            window.location.replace('https://www.google.com');

        } else {
            // Failure! Popup was blocked.
            alert("Please enable popups!");
        }
    }
});
