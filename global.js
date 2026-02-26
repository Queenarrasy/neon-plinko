// GLOBAL SYSTEM - NEON PLINKO
// Menangani Saldo, Win Rate, Database Referral, Bahasa, Keamanan, dan Sinkronisasi Cloud

// ============================================================
// 0. KONFIGURASI DATABASE CLOUD (TAMBAHAN ADMIN)
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqQWXIJuVnkIxLvdu3kYiiRDVh7eyrsy-KU6rG1qtQClgfAzmMoclv2ULFZ_hRdE_qUg/exec";

// Fungsi Universal untuk berkomunikasi dengan Google Sheets
async function fetchCloud(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (e) {
        console.error("Koneksi Database Gagal:", e);
        return null;
    }
}

// ============================================================
// 1. SISTEM AUTH (REGISTER & LOGIN) - NEW ADDITION
// ============================================================
async function cloudRegister(userData) {
    const lang = localStorage.getItem('appLang') || 'id';
    // Menambahkan action register untuk Apps Script
    const payload = { action: "register", ...userData };
    const res = await fetchCloud(payload);
    
    if (res === "SUCCESS") {
        showNeonAlert(translations[lang]["success-reg"], "SUCCESS");
        return "SUCCESS";
    } else if (res === "EXISTS") {
        showNeonAlert(translations[lang]["err-user-exist"], "ERROR");
        return "EXISTS";
    } else {
        showNeonAlert("Server Error", "ERROR");
        return "ERROR";
    }
}

async function cloudLogin(username, password) {
    const lang = localStorage.getItem('appLang') || 'id';
    const res = await fetchCloud({
        action: "login",
        username: username,
        password: password
    });

    if (res && res !== "FAILED") {
        // Simpan data dari Cloud ke LocalStorage
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('saldo_permainan', res.saldo);
        localStorage.setItem('winrate_setting', res.winrate);
        localStorage.setItem('user_tier', res.tier);
        
        showNeonAlert(translations[lang]["success-login"], "SUCCESS");
        setTimeout(() => { window.location.href = "game.html"; }, 1500);
        return "SUCCESS";
    } else {
        showNeonAlert(translations[lang]["err-wrong-pass"], "ERROR");
        return "FAILED";
    }
}

// ============================================================
// 2. SISTEM SALDO SINKRON
// ============================================================
function updateSaldo(jumlah) {
    let saldo = parseInt(localStorage.getItem('saldo_permainan')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        return false; // Saldo tidak cukup
    }
    
    saldo += jumlah;
    localStorage.setItem('saldo_permainan', saldo);

    // --- SINKRONISASI CLOUD KE ADMIN ---
    const currentUsername = localStorage.getItem('user_session');
    if (currentUsername && jumlah !== 0) {
        fetchCloud({
            action: "updateSaldo",
            username: currentUsername,
            newSaldo: saldo
        });
    }
    
    const display = document.getElementById('display-saldo');
    if (display) {
        display.innerText = "IDR " + saldo.toLocaleString('id-ID');
    }
    
    const tier = document.getElementById('tier-name');
    if (tier) {
        // Tier otomatis berdasarkan saldo
        if (saldo >= 1000000) tier.innerText = "PLATINUM VIP";
        else if (saldo >= 500000) tier.innerText = "GOLD MEMBER";
        else tier.innerText = "BRONZE PLAYER";
    }
    return true;
}

// ============================================================
// 3. SISTEM MULTI-BAHASA (i18n) - KAMUS LENGKAP
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
        "msg-welcome": "Selamat Datang di Neon Plinko!",
        
        // --- AUTH & PENDAFTARAN ---
        "auth-title": "PENDAFTARAN",
        "label-user": "USERNAME",
        "label-phone": "NOMOR HP",
        "label-fullname": "NAMA LENGKAP",
        "label-bank": "NAMA BANK / EWALLET",
        "label-rekening": "NO REK / EWALLET",
        "label-ref": "KODE REFERRAL (OPSIONAL)",
        "ref-note": "* Kosongkan jika tidak ada",
        "placeholder-user": "Buat username unik",
        "placeholder-phone": "Contoh: 08123456789",
        "placeholder-fullname": "Sesuai rekening bank",
        "placeholder-rek": "Masukkan nomor rekening/e-wallet",
        "placeholder-pass": "Minimal 6 karakter",
        "placeholder-ref": "Masukkan kode jika ada",
        "btn-reg": "Daftar Sekarang",
        
        // --- POP-UP & MODAL ---
        "modal-info": "INFORMASI",
        "modal-success": "BERHASIL",
        "btn-understand": "MENGERTI",
        "err-auth-fields": "Username wajib diisi & Password minimal 6 karakter!",
        "err-wrong-pass": "Username atau Password salah!",
        "err-incomplete": "Harap lengkapi semua data pendaftaran!",
        "err-user-exist": "Username sudah digunakan!",
        "success-login": "Login Berhasil! Selamat Datang Kembali.",
        "success-reg": "Pendaftaran Berhasil! Selamat bergabung.",
        
        // --- WITHDRAW ---
        "label-wd-limit": "Minimal Withdraw: IDR 50.000",
        "label-depo-info": "Pilih Metode Pembayaran",
        "label-saldo-game": "Saldo Permainan",
        "label-name-rek": "NAMA SESUAI REKENING:",
        "label-target-rek": "TUJUAN REKENING:",
        "btn-submit-wd": "AJUKAN PENARIKAN",
        "label-history-wd": "RIWAYAT PENARIKAN",
        "th-date": "TANGGAL / WAKTU",
        "th-total": "TOTAL",
        "th-status": "STATUS",
        
        // --- REWARD ---
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
        "invite-history": "RIWAYAT UNDANGAN"
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
        "msg-welcome": "Welcome to Neon Plinko!",

        // --- AUTH & REGISTRATION ---
        "auth-title": "REGISTRATION",
        "label-user": "USERNAME",
        "label-phone": "PHONE NUMBER",
        "label-fullname": "FULL NAME",
        "label-bank": "BANK / EWALLET NAME",
        "label-rekening": "ACCOUNT NUMBER",
        "label-ref": "REFERRAL CODE (OPTIONAL)",
        "ref-note": "* Leave empty if none",
        "placeholder-user": "Create unique username",
        "placeholder-phone": "Example: 08123456789",
        "placeholder-fullname": "Match your bank account",
        "placeholder-rek": "Enter account/e-wallet number",
        "placeholder-pass": "Minimum 6 characters",
        "placeholder-ref": "Enter code if available",
        "btn-reg": "Register Now",

        // --- POP-UP & MODAL ---
        "modal-info": "INFORMATION",
        "modal-success": "SUCCESS",
        "btn-understand": "GOT IT",
        "err-auth-fields": "Username required & Password min 6 characters!",
        "err-wrong-pass": "Invalid Username or Password!",
        "err-incomplete": "Please complete all registration data!",
        "err-user-exist": "Username is already taken!",
        "success-login": "Login Success! Welcome back.",
        "success-reg": "Registration Success! Welcome to the club.",
        
        // --- WITHDRAW ---
        "label-saldo-game": "Game Balance",
        "label-name-rek": "ACCOUNT HOLDER NAME:",
        "label-target-rek": "DESTINATION ACCOUNT:",
        "btn-submit-wd": "SUBMIT WITHDRAWAL",
        "label-history-wd": "WITHDRAWAL HISTORY",
        "th-date": "DATE / TIME",
        "th-total": "TOTAL",
        "th-status": "STATUS",
        
        // --- REWARD ---
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
        "invite-history": "INVITATION HISTORY"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('appLang', lang);
    applyLanguage();
}

function applyLanguage() {
    const lang = localStorage.getItem('appLang') || 'id';
    
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

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    const langItems = document.querySelectorAll('.lang-item');
    langItems.forEach(item => {
        item.classList.remove('active');
        if (item.id === 'lang-' + lang) item.classList.add('active');
    });

    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        const isAutoActive = typeof isAuto !== 'undefined' && isAuto;
        playBtn.innerText = isAutoActive ? translations[lang]["btn-stop"] : translations[lang]["btn-play"];
    }
}

// ============================================================
// 4. SISTEM PERUBAHAN PASSWORD (SINKRON)
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

    localStorage.setItem('user_password', newPass);

    // --- SINKRONISASI PASSWORD KE CLOUD ---
    const user = localStorage.getItem('user_session');
    if (user) {
        fetchCloud({
            action: "updateSaldo", 
            username: user, 
            newSaldo: parseInt(localStorage.getItem('saldo_permainan')), 
            password: newPass 
        });
    }

    showNeonAlert(translations[lang]["msg-success-pass"], "SUCCESS");
    return true;
}

// ============================================================
// 5. SISTEM REFERRAL & WIN RATE
// ============================================================
function getWinRate() { 
    return parseFloat(localStorage.getItem('winrate_setting')) || 0.5; 
}

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
// 6. AUTO-INJECT CSS & HTML MODAL
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
    const lang = localStorage.getItem('appLang') || 'id';
    const btnText = translations[lang]["btn-understand"] || "MENGERTI";
    
    document.getElementById('neon-title').innerText = title;
    document.getElementById('neon-msg').innerText = msg;
    document.querySelector('.neon-global-btn').innerText = btnText;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};

window.alert = function(message) { 
    const lang = localStorage.getItem('appLang') || 'id';
    showNeonAlert(message, translations[lang]["modal-info"] || "NOTIFIKASI"); 
};

// LOAD SEMUA SISTEM SAAT HALAMAN DIBUKA
window.addEventListener('load', () => {
    updateSaldo(0);
    applyLanguage();
});
