const base64 = {
    encode: function() {
        const input = document.getElementById('input').value;
        const output = btoa(input);
        document.getElementById('output').value = output;
    },
    decode: function() {
        const input = document.getElementById('input').value;
        try {
            const output = atob(input);
            document.getElementById('output').value = output;
        } catch (e) {
            document.getElementById('output').value = 'Invalid Base64 string';
        }
    },
    copyOutput: function() {
        const outputField = document.getElementById('output');
        outputField.select();
        outputField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy output');
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