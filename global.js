// GLOBAL SYSTEM - NEON PLINKO VIP
// Menangani Saldo, Win Rate, Sinkronisasi Profil, Bahasa, dan Keamanan Cloud

// ============================================================
// 0. KONFIGURASI DATABASE CLOUD
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqQWXIJuVnkIxLvdu3kYiiRDVh7eyrsy-KU6rG1qtQClgfAzmMoclv2ULFZ_hRdE_qUg/exec";

// Fungsi Universal Komunikasi Cloud
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
// 1. SISTEM AUTH (REGISTER & LOGIN) - SINKRON PROFIL
// ============================================================
async function cloudRegister(userData) {
    const lang = localStorage.getItem('appLang') || 'id';
    const payload = { action: "register", ...userData };
    const res = await fetchCloud(payload);
    
    if (res === "SUCCESS") {
        // Simpan data pendaftaran secara lokal agar Profil langsung terisi
        localStorage.setItem('user_session', userData.username);
        localStorage.setItem('fullname', userData.fullname || "-");
        localStorage.setItem('bank_name', userData.bank || "-");
        localStorage.setItem('account_no', userData.rekening || "-");
        localStorage.setItem('saldo_permainan', 0);
        localStorage.setItem('user_tier', "BRONZE");
        localStorage.setItem('user_status', "ACTIVE");

        showNeonAlert(translations[lang]["success-reg"], "SUCCESS");
        return "SUCCESS";
    } else if (res === "EXISTS") {
        showNeonAlert(translations[lang]["err-user-exist"], "ERROR");
        return "EXISTS";
    } else {
        showNeonAlert("Server Error / Terjadi Kesalahan", "ERROR");
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

    // Validasi respon dari cloud (pastikan cloud mengirim objek user)
    if (res && res !== "FAILED" && res.username) {
        // --- SINKRONISASI DATA KE PROFIL ---
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('fullname', res.fullname || "-");
        localStorage.setItem('bank_name', res.bank || "-");
        localStorage.setItem('account_no', res.rekening || "-");
        localStorage.setItem('saldo_permainan', res.saldo || 0);
        localStorage.setItem('winrate_setting', res.winrate || 0.5);
        localStorage.setItem('user_tier', res.tier || "BRONZE");
        localStorage.setItem('user_status', res.status || "ACTIVE");
        
        showNeonAlert(translations[lang]["success-login"], "SUCCESS");
        setTimeout(() => { window.location.href = "game.html"; }, 1500);
        return "SUCCESS";
    } else {
        showNeonAlert(translations[lang]["err-wrong-pass"], "ERROR");
        return "FAILED";
    }
}

// ============================================================
// 2. SISTEM SALDO & TIER SINKRON
// ============================================================
function updateSaldo(jumlah) {
    let saldo = parseInt(localStorage.getItem('saldo_permainan')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        return false; // Saldo tidak cukup
    }
    
    saldo += jumlah;
    localStorage.setItem('saldo_permainan', saldo);

    // Update Tampilan Saldo di Semua Halaman yang memiliki ID 'display-saldo'
    const displays = document.querySelectorAll('#display-saldo');
    displays.forEach(d => {
        d.innerText = "IDR " + saldo.toLocaleString('id-ID');
    });

    // --- SINKRONISASI CLOUD KE ADMIN ---
    const currentUsername = localStorage.getItem('user_session');
    if (currentUsername && jumlah !== 0) {
        fetchCloud({
            action: "updateSaldo",
            username: currentUsername,
            newSaldo: saldo
        });
    }
    
    // Update Tier Berdasarkan Saldo di Profil
    const tierEl = document.getElementById('tier-name');
    if (tierEl) {
        let tierName = "BRONZE PLAYER";
        if (saldo >= 1000000) tierName = "PLATINUM VIP";
        else if (saldo >= 500000) tierName = "GOLD MEMBER";
        
        tierEl.innerText = tierName;
        localStorage.setItem('user_tier', tierName.replace(" PLAYER", "").replace(" MEMBER", ""));
    }
    return true;
}

// ============================================================
// 3. SISTEM PERUBAHAN PASSWORD
// ============================================================
async function updatePassword(newPass, confirmPass) {
    const lang = localStorage.getItem('appLang') || 'id';
    const user = localStorage.getItem('user_session');

    if (newPass.length < 6) {
        showNeonAlert(translations[lang]["msg-short"], "ERROR");
        return false;
    }
    if (newPass !== confirmPass) {
        showNeonAlert(translations[lang]["msg-no-match"], "ERROR");
        return false;
    }

    // Kirim Perubahan ke Cloud
    const res = await fetchCloud({
        action: "updatePassword", // Pastikan Apps Script Anda mendukung action ini
        username: user,
        newPassword: newPass
    });

    if (res === "SUCCESS") {
        showNeonAlert(translations[lang]["msg-success-pass"], "SUCCESS");
        return true;
    } else {
        showNeonAlert("Gagal update password di server.", "ERROR");
        return false;
    }
}

// ============================================================
// 4. SISTEM MONITORING & INBOX (ONLINE STATUS)
// ============================================================
async function updateOnlineStatus(status) {
    const currentUsername = localStorage.getItem('user_session');
    if (currentUsername) {
        fetchCloud({
            action: "updateStatus",
            username: currentUsername,
            status: status
        });
    }
}

async function syncInbox() {
    const currentUsername = localStorage.getItem('user_session');
    if (!currentUsername) return;

    const res = await fetchCloud({ action: "getInbox", username: currentUsername });
    if (res && Array.isArray(res) && res.length > 0) {
        res.forEach(msg => {
            if (msg.status === "UNCLAIMED") {
                showNeonAlert(`PESAN BARU:\n"${msg.pesan}"\nHadiah: IDR ${msg.hadiah}`, "KOTAK MASUK");
                if (parseInt(msg.hadiah) > 0) {
                    updateSaldo(parseInt(msg.hadiah));
                    fetchCloud({ action: "claimInbox", id: msg.id });
                }
            }
        });
    }
}

// --- KAMUS BAHASA (translations tetap sama seperti kode Anda) ---
// (Bagian translations dan applyLanguage tetap dipertahankan dari kode Anda)

// ============================================================
// 5. INITIALIZATION (LOADER)
// ============================================================
window.addEventListener('load', () => {
    applyLanguage();
    updateSaldo(0); // Refresh tampilan saldo saat halaman dibuka
    
    // Aktifkan Pemantauan
    if (localStorage.getItem('user_session')) {
        updateOnlineStatus("Online");
        syncInbox();
        
        // Cek Inbox setiap 5 menit
        setInterval(syncInbox, 300000);
    }
});

window.addEventListener('beforeunload', () => {
    updateOnlineStatus("Offline");
});
