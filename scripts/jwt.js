const jwt = {
    generateToken: function() {
        const header = document.getElementById('header').value;
        const payload = document.getElementById('payload').value;
        const secret = document.getElementById('secret').value;
        const token = btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.' + btoa(secret); // Simplified token generation
        document.getElementById('token').value = token;
    },
    copyToken: function() {
        const tokenField = document.getElementById('token');
        tokenField.select();
        tokenField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy token');
        }
    },
    toggleGenerateButton: function() {
        const header = document.getElementById('header').value;
        const payload = document.getElementById('payload').value;
        const secret = document.getElementById('secret').value;
        const generateButton = document.getElementById('generate-button');

        if (header && payload && secret) {
            generateButton.removeAttribute('disabled');
            generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            generateButton.setAttribute('disabled', 'true');
            generateButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    },
    generateSecret: function() {
        const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        document.getElementById('secret').value = secret;
        this.toggleGenerateButton();
    },
    showNotification: function() {
        const notification = document.getElementById('copy-notification');
        notification.classList.remove('hidden', 'opacity-0');
        notification.classList.add('opacity-100');
        setTimeout(() => {
            notification.classList.remove('opacity-100');
            notification.classList.add('opacity-0');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300); // Match the duration of the transition
        }, 2000);
    }
};

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    jwt.toggleGenerateButton();
});