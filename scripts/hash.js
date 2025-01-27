function generateHash(algorithm) {
    const inputString = document.getElementById('input-string').value;
    let hash;

    switch (algorithm) {
        case 'MD5':
            hash = CryptoJS.MD5(inputString).toString(CryptoJS.enc.Hex);
            break;
        case 'SHA1':
            hash = CryptoJS.SHA1(inputString).toString(CryptoJS.enc.Hex);
            break;
        case 'SHA256':
            hash = CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);
            break;
        default:
            hash = '';
    }

    document.getElementById('output-hash').value = hash;
}

function toggleButtons() {
    const inputString = document.getElementById('input-string').value;
    const buttons = ['md5-button', 'sha1-button', 'sha256-button'];

    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (inputString.trim() === '') {
            button.setAttribute('disabled', 'true');
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            button.removeAttribute('disabled');
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

function copyHash() {
    const outputHash = document.getElementById('output-hash');
    outputHash.select();
    outputHash.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Failed to copy hash');
    }
}

function showCopyNotification() {
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

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    toggleButtons();
});