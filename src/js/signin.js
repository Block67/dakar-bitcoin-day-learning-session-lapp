const signinButton = document.getElementById('signin-button');
const qrButton = document.querySelector('#signin .qr-button');
const weblnButton = document.querySelector('#signin .webln-button');

let signinActive = false;

// Mock bootstrap modal if it doesn't exist to prevent crashes
if (typeof bootstrap === 'undefined') {
    window.bootstrap = {
        Modal: function() {
            return {
                show: () => {
                    const modal = document.getElementById('signin');
                    if (modal) {
                        modal.classList.remove('hidden');
                        setTimeout(() => modal.classList.replace('opacity-0', 'opacity-100'), 10);
                    }
                },
                hide: () => {
                    const modal = document.getElementById('signin');
                    if (modal) {
                        modal.classList.replace('opacity-100', 'opacity-0');
                        setTimeout(() => modal.classList.add('hidden'), 300);
                    }
                }
            }
        }
    };
}

const loginModal = new bootstrap.Modal('#signin');

async function signin() {

    if(signinActive)
        return;

    signinActive = true;
    loginModal.show();

    if (signinButton) {
        signinButton.disabled = true;
        signinButton.innerHTML = `<div class="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>`;
    }

    try {
        const request = await fetch('/do-login');
        const result = await request.json();

        const qrLink = document.querySelector('#signin .qr-link');
        const qrImg = document.querySelector('#signin .qr');

        if (qrLink) qrLink.href = "lightning:" + result.lnurl;
        if (qrImg) qrImg.src = result.qrCode;

        if (window.webln && weblnButton) {
            weblnButton.href = "lightning:" + result.lnurl;
            weblnButton.classList.remove('hidden', 'd-none');
        } else {
            if (qrButton) qrButton.classList.add('hidden', 'd-none');
            startQr();
        }

        startPolling(1000, function () {
            signinActive = false;
            window.location.reload();
        });
    } catch (e) {
        console.error("Signin error:", e);
        signinActive = false;
    }
}

function loading() {
    const footer = document.querySelector('#signin .modal-footer');
    if (footer) footer.classList.remove('hidden', 'd-none');
}

function startQr() {
    loading();
    const qrContainer = document.querySelector('#signin .qr-container');
    if (qrContainer) qrContainer.classList.remove('hidden', 'd-none');
}

async function isSignedIn() {
    try {
        const response = await fetch('/me');
        const result = await response.json();
        return result.user != null;
    } catch (e) {
        return false;
    }
}

function startPolling(timeout, onSuccess) {
    if(!signinActive)
        return;
        
    setTimeout(async function () {
        const result = await isSignedIn();

        if (!result) {
            startPolling(timeout, onSuccess);
        } else {
            onSuccess();
        }
    }, timeout);
}