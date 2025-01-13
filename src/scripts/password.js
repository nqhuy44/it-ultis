console.log('Password script loaded');

const passwd = {
    setLength: function(length) {
        document.getElementById('length').value = length;
    },
    generate: function() {
        console.log('Generate function called');
        const length = parseInt(document.getElementById('length').value);
        if (isNaN(length) || length <= 0 || length > 128) {
            this.showErrorNotification();
            return;
        }

        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let generatedPassword = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            generatedPassword += charset[randomIndex];
        }

        document.getElementById('password').value = generatedPassword;
    },
    copy: function() {
        const passwordField = document.getElementById('password');
        passwordField.select();
        passwordField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy password');
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
    },
    showErrorNotification: function() {
        const notification = document.getElementById('error-notification');
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

// Set default length on page load
document.addEventListener('DOMContentLoaded', () => {
    passwd.setLength(12);
});