const ssh = {
    algorithm: 'rsa',
    bits: 2048,
    format: 'pem',

    setAlgorithm: function(algorithm) {
        this.algorithm = algorithm;
        document.querySelectorAll('.algorithm-btn').forEach(btn => btn.classList.remove('bg-blue-200', 'text-blue-700'));
        document.querySelectorAll('.algorithm-btn').forEach(btn => btn.classList.add('bg-gray-200', 'text-gray-700'));
        document.querySelector(`.algorithm-btn[onclick="ssh.setAlgorithm('${algorithm}')"]`).classList.add('bg-blue-200', 'text-blue-700');
        document.querySelector(`.algorithm-btn[onclick="ssh.setAlgorithm('${algorithm}')"]`).classList.remove('bg-gray-200', 'text-gray-700');
    },
    setBits: function(bits) {
        this.bits = bits;
        document.querySelectorAll('.bits-btn').forEach(btn => btn.classList.remove('bg-blue-200', 'text-blue-700'));
        document.querySelectorAll('.bits-btn').forEach(btn => btn.classList.add('bg-gray-200', 'text-gray-700'));
        document.querySelector(`.bits-btn[onclick="ssh.setBits(${bits})"]`).classList.add('bg-blue-200', 'text-blue-700');
        document.querySelector(`.bits-btn[onclick="ssh.setBits(${bits})"]`).classList.remove('bg-gray-200', 'text-gray-700');
    },
    setFormat: function(format) {
        this.format = format;
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('bg-blue-200', 'text-blue-700'));
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.add('bg-gray-200', 'text-gray-700'));
        document.querySelector(`.format-btn[onclick="ssh.setFormat('${format}')"]`).classList.add('bg-blue-200', 'text-blue-700');
        document.querySelector(`.format-btn[onclick="ssh.setFormat('${format}')"]`).classList.remove('bg-gray-200', 'text-gray-700');
    },
    generateKeys: function() {
        const { pki } = forge;
        let keypair;
        if (this.algorithm === 'rsa') {
            keypair = pki.rsa.generateKeyPair(this.bits);
        } else if (this.algorithm === 'dsa') {
            // DSA key generation logic
        } else if (this.algorithm === 'ecdsa') {
            // ECDSA key generation logic
        } else if (this.algorithm === 'ed25519') {
            // ED25519 key generation logic
        }

        const publicKey = pki.publicKeyToPem(keypair.publicKey);
        const privateKey = pki.privateKeyToPem(keypair.privateKey);

        document.getElementById('public-key').value = publicKey;
        document.getElementById('private-key').value = privateKey;

        this.toggleDownloadButton();
    },
    copyPublicKey: function() {
        const publicKeyField = document.getElementById('public-key');
        publicKeyField.select();
        publicKeyField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy public key');
        }
    },
    copyPrivateKey: function() {
        const privateKeyField = document.getElementById('private-key');
        privateKeyField.select();
        privateKeyField.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification();
        } catch (err) {
            console.error('Failed to copy private key');
        }
    },
    downloadKeys: function() {
        const publicKey = document.getElementById('public-key').value;
        const privateKey = document.getElementById('private-key').value;
        const extension = this.format === 'ppk' ? 'ppk' : 'pem';
        const keyName = document.getElementById('key-name').value || 'my_ssh_key';

        const publicBlob = new Blob([publicKey], { type: 'text/plain' });
        const privateBlob = new Blob([privateKey], { type: 'text/plain' });

        const publicUrl = URL.createObjectURL(publicBlob);
        const privateUrl = URL.createObjectURL(privateBlob);

        const publicLink = document.createElement('a');
        publicLink.href = publicUrl;
        publicLink.download = `${keyName}_public.${extension}`;
        publicLink.click();

        const privateLink = document.createElement('a');
        privateLink.href = privateUrl;
        privateLink.download = `${keyName}_private.${extension}`;
        privateLink.click();

        URL.revokeObjectURL(publicUrl);
        URL.revokeObjectURL(privateUrl);
    },
    toggleDownloadButton: function() {
        const publicKey = document.getElementById('public-key').value;
        const privateKey = document.getElementById('private-key').value;
        const downloadButton = document.getElementById('download-keys');

        if (publicKey && privateKey) {
            downloadButton.removeAttribute('disabled');
            downloadButton.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            downloadButton.setAttribute('disabled', 'true');
            downloadButton.classList.add('opacity-50', 'cursor-not-allowed');
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

// Set default selections
document.addEventListener('DOMContentLoaded', () => {
    ssh.setAlgorithm('rsa');
    ssh.setBits(2048);
    ssh.setFormat('pem');
});