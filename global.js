// GLOBAL SYSTEM - NEON PLINKO
// Menangani Saldo, Win Rate, Database Referral, Bahasa, dan Keamanan

// ============================================================
// 1. SISTEM SALDO SINKRON
// ============================================================
function updateSaldo(jumlah) {
    let saldo = parseInt(localStorage.getItem('saldo_permainan')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        return false; // Saldo tidak cukup
    }
    
    saldo += jumlah;
    localStorage.setItem('saldo_permainan', saldo);
    
    const display = document.getElementById('display-saldo');
    if (display) {
        display.innerText = "IDR " + saldo.toLocaleString('id-ID');
    }
    
    const tier = document.getElementById('tier-name');
    if (tier) {
        if (saldo >= 1000000) tier.innerText = "PLATINUM VIP";
        else if (saldo >= 500000) tier.innerText = "GOLD MEMBER";
        else tier.innerText = "BRONZE PLAYER";
    }
    return true;
}

// ============================================================
// 2. SISTEM MULTI-BAHASA (i18n) - FULL UPDATE KAMUS
// ============================================================
const translations = {
    id: {
        "nav-settings": "PENGATURAN",
        "tab-pass": "KATA SANDI",
        "tab-lang": "BAHASA",
        "label-old": "Password Saat Ini",
        "label-new": "Password Baru",
        "label-confirm": "Konfirmasi Password",
        "btn-update": "UPDATE PASSWORD",
        "msg-success-pass": "Password berhasil diperbarui!",
        "msg-wrong-old": "Password lama salah!",
        "msg-no-match": "Konfirmasi password tidak cocok!",
        "msg-short": "Password minimal 6 karakter!",
        "menu-profile": "PROFIL",
        "nav-withdraw": "WITHDRAW",
        "nav-deposit": "DEPOSIT",
        "nav-reward": "REWARD",
        "btn-play": "MULAI MAIN",
        "btn-stop": "STOP AUTO",
        "auth-title": "HALAMAN LOGIN",
        "label-user": "Username",
        "label-wd-limit": "Minimal Withdraw: IDR 50.000",
        "label-depo-info": "Pilih Metode Pembayaran",
        "btn-claim": "KLAIM SEKARANG",
        "msg-welcome": "Selamat Datang di Neon Plinko!",
        
        // --- TAMBAHAN KUNCI WITHDRAW ---
        "label-saldo-game": "Saldo Permainan",
        "label-name-rek": "NAMA SESUAI REKENING:",
        "label-target-rek": "TUJUAN REKENING:",
        "btn-submit-wd": "AJUKAN PENARIKAN",
        "label-history-wd": "RIWAYAT PENARIKAN",
        "th-date": "TANGGAL / WAKTU",
        "th-total": "TOTAL",
        "th-status": "STATUS",
        
        // --- TAMBAHAN KUNCI REWARD ---
        "btn-back": "KEMBALI KE GAME",
        "label-your-code": "KODE REFERRAL ANDA",
        "hint-copy": "Klik kode di atas untuk menyalin",
        "label-daily": "DAILY CHECK-IN",
        "btn-claim-daily": "KLAIM HADIAH HARIAN",
        "daily-warning": "* Segera klaim jatah harian Anda. Jatah yang terlewatkan 1 hari akan otomatis hangus dan tidak dapat diakumulasi.",
        "label-inbox": "KOTAK MASUK",
        "referral-title": "PROGRAM REFERRAL VIP",
        "referral-desc": "Setiap teman yang mendaftar dan melakukan deposit pertama, Anda berhak mendapatkan bonus saldo.",
        "bonus-tag": "BONUS IDR 5.000 / TEMAN",
        "total-invite": "Total Undangan",
        "reward-available": "Reward Tersedia",
        "sunday-only": "Klaim hanya tersedia hari Minggu",
        "btn-claim-sunday": "KLAIM REWARD (MINGGU)",
        "invite-history": "RIWAYAT UNDANGAN",
        "modal-title-info": "INFO",
        "btn-understand": "MENGERTI"
    },
    en: {
        "nav-settings": "SETTINGS",
        "tab-pass": "PASSWORD",
        "tab-lang": "LANGUAGE",
        "label-old": "Current Password",
        "label-new": "New Password",
        "label-confirm": "Confirm Password",
        "btn-update": "UPDATE PASSWORD",
        "msg-success-pass": "Password updated successfully!",
        "msg-wrong-old": "Wrong current password!",
        "msg-no-match": "Password confirmation mismatch!",
        "msg-short": "Password must be at least 6 characters!",
        "menu-profile": "PROFILE",
        "nav-withdraw": "WITHDRAW",
        "nav-deposit": "DEPOSIT",
        "nav-reward": "REWARD",
        "btn-play": "START PLAY",
        "btn-stop": "STOP AUTO",
        "auth-title": "LOGIN PAGE",
        "label-user": "Username",
        "label-wd-limit": "Min Withdraw: IDR 50,000",
        "label-depo-info": "Choose Payment Method",
        "btn-claim": "CLAIM NOW",
        "msg-welcome": "Welcome to Neon Plinko!",
        
        // --- ADDITIONAL WITHDRAW KEYS ---
        "label-saldo-game": "Game Balance",
        "label-name-rek": "ACCOUNT HOLDER NAME:",
        "label-target-rek": "DESTINATION ACCOUNT:",
        "btn-submit-wd": "SUBMIT WITHDRAWAL",
        "label-history-wd": "WITHDRAWAL HISTORY",
        "th-date": "DATE / TIME",
        "th-total": "TOTAL",
        "th-status": "STATUS",
        
        // --- ADDITIONAL REWARD KEYS ---
        "btn-back": "BACK TO GAME",
        "label-your-code": "YOUR REFERRAL CODE",
        "hint-copy": "Click code above to copy",
        "label-daily": "DAILY CHECK-IN",
        "btn-claim-daily": "CLAIM DAILY REWARD",
        "daily-warning": "* Claim your daily quota immediately. Missed daily claims will expire and cannot be accumulated.",
        "label-inbox": "INBOX",
        "referral-title": "VIP REFERRAL PROGRAM",
        "referral-desc": "For every friend who registers and makes their first deposit, you are entitled to a bonus balance.",
        "bonus-tag": "BONUS IDR 5,000 / FRIEND",
        "total-invite": "Total Invites",
        "reward-available": "Available Reward",
        "sunday-only": "Claims only available on Sunday",
        "btn-claim-sunday": "CLAIM REWARD (SUNDAY)",
        "invite-history": "INVITATION HISTORY",
        "modal-title-info": "INFO",
        "btn-understand": "UNDERSTAND"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('appLang', lang);
    applyLanguage();
}

function applyLanguage() {
    const lang = localStorage.getItem('appLang') || 'id';
    
    // 1. Update Teks Berdasarkan Atribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                el.value = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });

    // 2. Update Placeholder Input secara otomatis
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // 3. Update class active pada daftar bahasa
    const langItems = document.querySelectorAll('.lang-item');
    langItems.forEach(item => {
        item.classList.remove('active');
        if (item.id === 'lang-' + lang) item.classList.add('active');
    });

    // 4. Sinkronisasi tombol play
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        const isAutoActive = typeof isAuto !== 'undefined' && isAuto;
        playBtn.innerText = isAutoActive ? translations[lang]["btn-stop"] : translations[lang]["btn-play"];
    }
}

// ============================================================
// 3. SISTEM PERUBAHAN PASSWORD (UPDATED: SINKRON ADMIN)
// ============================================================
function updatePassword(newPass, confirmPass) {
    const lang = localStorage.getItem('appLang') || 'id';

    if (newPass.length < 6) {
        showNeonAlert(translations[lang]["msg-short"], "ERROR");
        return false;
    }
    if (newPass !== confirmPass) {
        showNeonAlert(translations[lang]["msg-no-match"], "ERROR");
        return false;
    }

    // Update password di sistem utama agar admin & login langsung sinkron
    localStorage.setItem('user_password', newPass);
    showNeonAlert(translations[lang]["msg-success-pass"], "SUCCESS");
    return true;
}

// ============================================================
// 4. SISTEM REFERRAL & WIN RATE (KODE ASLI ANDA)
// ============================================================
function getWinRate() { return parseInt(localStorage.getItem('admin_win_rate')) || 30; }

function registerReferral(usernameBaru, kodeRef) {
    if (!kodeRef) return;
    let refData = JSON.parse(localStorage.getItem('referral_database')) || [];
    refData.push({
        invitedUser: usernameBaru, fromCode: kodeRef,
        hasDeposited: false, date: new Date().toLocaleDateString('id-ID')
    });
    localStorage.setItem('referral_database', JSON.stringify(refData));
}

// ============================================================
// 5. AUTO-INJECT CSS & HTML MODAL (KODE ASLI ANDA)
// ============================================================
const styleNeon = document.createElement('style');
styleNeon.innerHTML = `
    #neon-global-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); backdrop-filter: blur(10px);
        display: none; justify-content: center; align-items: center; z-index: 9999999;
    }
    .neon-global-modal {
        background: #050612; border: 2px solid #00d4ff; border-radius: 25px;
        padding: 30px; text-align: center; width: 85%; max-width: 320px;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.4);
    }
    .neon-global-modal h2 { color: #fbff00; text-shadow: 0 0 10px #fbff00; margin: 0 0 15px 0; }
    .neon-global-modal p { color: #ffffff; margin-bottom: 25px; }
    .neon-global-btn {
        background: transparent; border: 2px solid #ff0077; color: #ff0077;
        padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
        cursor: pointer; box-shadow: 0 0 15px #ff0077;
    }
`;
document.head.appendChild(styleNeon);

const modalContainer = document.createElement('div');
modalContainer.id = 'neon-global-overlay';
modalContainer.innerHTML = `
    <div class="neon-global-modal">
        <h2 id="neon-title">INFO</h2>
        <p id="neon-msg">Pesan sistem di sini.</p>
        <button class="neon-global-btn" onclick="closeNeonAlert()">MENGERTI</button>
    </div>
`;
document.body.appendChild(modalContainer);

window.closeNeonAlert = function() { document.getElementById('neon-global-overlay').style.display = 'none'; };
window.showNeonAlert = function(msg, title = "INFO") {
    document.getElementById('neon-title').innerText = title;
    document.getElementById('neon-msg').innerText = msg;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};
window.alert = function(message) { showNeonAlert(message, "NOTIFIKASI"); };

// LOAD SEMUA SISTEM SAAT HALAMAN DIBUKA
window.addEventListener('load', () => {
    updateSaldo(0);
    applyLanguage();
});
