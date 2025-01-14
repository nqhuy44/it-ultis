const passwd = {
    setLength: function(length) {
        document.getElementById('length').value = length;
    },
    generate: function() {
        const length = parseInt(document.getElementById('length').value);
        const includeSpecial = document.getElementById('include-special').checked;

        if (isNaN(length) || length < 1 || length > 128) {
            this.showErrorNotification();
            return;
        }

        let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        if (includeSpecial) {
            charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        document.getElementById('password').value = password;
    },
    copy: function() {
        const passwordField = document.getElementById('password');
        passwordField.select();
        passwordField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showCopyNotification();
        } catch (err) {
            console.error('Failed to copy password');
        }
    },
    showCopyNotification: function() {
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

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('length').value = 32;
});