// GLOBAL SYSTEM - NEON PLINKO VIP
// Menangani Saldo, Win Rate, Sinkronisasi Profil, Bahasa, dan Pop-up Neon

// ============================================================
// 0. KONFIGURASI DATABASE CLOUD
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqQWXIJuVnkIxLvdu3kYiiRDVh7eyrsy-KU6rG1qtQClgfAzmMoclv2ULFZ_hRdE_qUg/exec";

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
// 1. SISTEM POP-UP NEON GLOBAL (PENGGANTI ALERT)
// ============================================================
// Fungsi ini otomatis menyuntikkan HTML & CSS Modal ke semua halaman
const injectNeonModal = () => {
    if (document.getElementById('neon-global-overlay')) return;

    const style = document.createElement('style');
    style.innerHTML = `
        #neon-global-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); backdrop-filter: blur(8px);
            display: none; justify-content: center; align-items: center; z-index: 1000000;
        }
        .neon-modal-box {
            background: #050612; border: 2px solid #00d4ff; border-radius: 25px;
            padding: 30px; text-align: center; width: 85%; max-width: 350px;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
            animation: neonSlide 0.3s ease-out;
        }
        @keyframes neonSlide { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .neon-modal-box h2 { color: #fbff00; text-shadow: 0 0 10px #fbff00; margin: 0 0 15px; font-size: 22px; text-transform: uppercase; }
        .neon-modal-box p { color: #ffffff; margin-bottom: 25px; line-height: 1.5; font-size: 15px; }
        .neon-modal-btn {
            background: transparent; border: 2px solid #ff0077; color: #ff0077;
            padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
            cursor: pointer; box-shadow: 0 0 15px #ff0077; text-transform: uppercase; transition: 0.3s;
        }
        .neon-modal-btn:hover { background: #ff0077; color: #fff; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'neon-global-overlay';
    modal.innerHTML = `
        <div class="neon-modal-box">
            <h2 id="neon-modal-title">INFO</h2>
            <p id="neon-modal-msg">Pesan sistem.</p>
            <button class="neon-modal-btn" onclick="closeNeonAlert()">MENGERTI</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.showNeonAlert = function(msg, title = "NOTIFIKASI") {
    injectNeonModal();
    document.getElementById('neon-modal-title').innerText = title;
    document.getElementById('neon-modal-msg').innerText = msg;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};

window.closeNeonAlert = function() {
    document.getElementById('neon-global-overlay').style.display = 'none';
};

// Mengambil alih fungsi alert bawaan browser agar bertema neon
window.alert = function(msg) { showNeonAlert(msg, "VIP INFO"); };

// ============================================================
// 2. SISTEM AUTH (REGISTER & LOGIN)
// ============================================================
async function cloudRegister(userData) {
    const res = await fetchCloud({ action: "register", ...userData });
    if (res === "SUCCESS") {
        localStorage.setItem('user_session', userData.username);
        localStorage.setItem('fullname', userData.fullname || "-");
        localStorage.setItem('bank_name', userData.bank || "-");
        localStorage.setItem('account_no', userData.rekening || "-");
        localStorage.setItem('saldo_permainan', 0);
        localStorage.setItem('user_tier', "BRONZE");
        showNeonAlert("Pendaftaran Berhasil! Selamat Datang.", "SUKSES");
        setTimeout(() => window.location.href = "game.html", 2000);
        return "SUCCESS";
    } else if (res === "EXISTS") {
        showNeonAlert("Username sudah digunakan, coba yang lain!", "GAGAL");
        return "EXISTS";
    } else {
        showNeonAlert("Terjadi gangguan server!", "ERROR");
        return "ERROR";
    }
}

async function cloudLogin(username, password) {
    const res = await fetchCloud({ action: "login", username, password });
    if (res && res !== "FAILED" && res.username) {
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('fullname', res.fullname || "-");
        localStorage.setItem('bank_name', res.bank || "-");
        localStorage.setItem('account_no', res.rekening || "-");
        localStorage.setItem('saldo_permainan', res.saldo || 0);
        localStorage.setItem('winrate_setting', res.winrate || 0.5);
        localStorage.setItem('user_tier', res.tier || "BRONZE");
        showNeonAlert("Login Berhasil! Mengalihkan...", "SUKSES");
        setTimeout(() => window.location.href = "game.html", 1500);
        return "SUCCESS";
    } else {
        showNeonAlert("Username atau Password salah!", "LOGIN GAGAL");
        return "FAILED";
    }
}

// ============================================================
// 3. SISTEM SALDO & TIER
// ============================================================
function updateSaldo(jumlah) {
    let saldo = parseInt(localStorage.getItem('saldo_permainan')) || 0;
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        showNeonAlert("Saldo tidak cukup untuk melakukan taruhan!", "SALDO KURANG");
        return false;
    }
    saldo += jumlah;
    localStorage.setItem('saldo_permainan', saldo);

    document.querySelectorAll('#display-saldo').forEach(d => {
        d.innerText = "IDR " + saldo.toLocaleString('id-ID');
    });

    const currentUsername = localStorage.getItem('user_session');
    if (currentUsername && jumlah !== 0) {
        fetchCloud({ action: "updateSaldo", username: currentUsername, newSaldo: saldo });
    }
    return true;
}

// ============================================================
// 4. SISTEM BAHASA (i18n)
// ============================================================
const translations = {
    id: { "btn-understand": "MENGERTI", "success-reg": "Daftar Berhasil!", "success-login": "Login Berhasil!" },
    en: { "btn-understand": "GOT IT", "success-reg": "Register Success!", "success-login": "Login Success!" }
};

function applyLanguage() {
    const lang = localStorage.getItem('appLang') || 'id';
    // Logika i18n Anda di sini...
}

// ============================================================
// 5. MONITORING ONLINE & INBOX
// ============================================================
async function syncInbox() {
    const user = localStorage.getItem('user_session');
    if (!user) return;
    const res = await fetchCloud({ action: "getInbox", username: user });
    if (res && Array.isArray(res)) {
        res.forEach(msg => {
            if (msg.status === "UNCLAIMED") {
                showNeonAlert(`${msg.pesan}\nHadiah: IDR ${msg.hadiah}`, "PESAN VIP");
                if (parseInt(msg.hadiah) > 0) {
                    updateSaldo(parseInt(msg.hadiah));
                    fetchCloud({ action: "claimInbox", id: msg.id });
                }
            }
        });
    }
}

// ============================================================
// 6. INITIALIZATION LOAD
// ============================================================
window.addEventListener('load', () => {
    injectNeonModal();
    applyLanguage();
    updateSaldo(0);
    if (localStorage.getItem('user_session')) {
        syncInbox();
        setInterval(syncInbox, 60000); // Cek pesan tiap 1 menit
    }
});
