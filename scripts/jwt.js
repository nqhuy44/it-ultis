const jwt = {
    generateToken: function() {
        const payload = document.getElementById('payload').value;
        const secret = document.getElementById('secret').value;

        // Generate JWT token (this is a placeholder, replace with actual JWT generation logic)
        const token = btoa(JSON.stringify({ payload, secret }));

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