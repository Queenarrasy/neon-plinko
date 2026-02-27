// GLOBAL SYSTEM - NEON PLINKO VIP
// Koneksi ke: https://script.google.com/macros/s/AKfycbzYTC11njbEBtAsdpbaRLJRt13j7iEKCkANV1SgxxguV_zFUyZ6Z7FAj0SKuw4d5ThmKw/exec

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYTC11njbEBtAsdpbaRLJRt13j7iEKCkANV1SgxxguV_zFUyZ6Z7FAj0SKuw4d5ThmKw/exec";

// ============================================================
// 1. SISTEM POP-UP NEON UNIVERSAL
// ============================================================
const injectNeonModal = () => {
    if (document.getElementById('neon-global-overlay')) return;
    const style = document.createElement('style');
    style.innerHTML = `
        #neon-global-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(7, 8, 22, 0.95); backdrop-filter: blur(10px);
            display: none; justify-content: center; align-items: center; z-index: 1000000;
        }
        .neon-modal-box {
            background: #050612; border: 2px solid #00d4ff; border-radius: 25px;
            padding: 30px; text-align: center; width: 85%; max-width: 350px;
            box-shadow: 0 0 20px #00d4ff, inset 0 0 10px #00d4ff;
        }
        .neon-modal-box h2 { color: #fbff00; text-shadow: 0 0 10px #fbff00; margin-bottom: 15px; text-transform: uppercase; }
        .neon-modal-box p { color: #ffffff; margin-bottom: 25px; font-weight: 600; }
        .neon-modal-btn {
            background: #000; border: 2px solid #ff0077; color: #ff0077;
            padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
            cursor: pointer; box-shadow: 0 0 15px #ff0077; text-transform: uppercase;
        }
    `;
    document.head.appendChild(style);
    const modal = document.createElement('div');
    modal.id = 'neon-global-overlay';
    modal.innerHTML = `<div class="neon-modal-box"><h2 id="neon-modal-title">INFO</h2><p id="neon-modal-msg">...</p><button class="neon-modal-btn" onclick="closeNeonAlert()">OK</button></div>`;
    document.body.appendChild(modal);
};

window.showNeonAlert = function(msg, title = "VIP INFO") {
    injectNeonModal();
    document.getElementById('neon-modal-title').innerText = title;
    document.getElementById('neon-modal-msg').innerText = msg;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};

window.closeNeonAlert = function() { document.getElementById('neon-global-overlay').style.display = 'none'; };

// ============================================================
// 2. CORE DATABASE COMMUNICATOR (PENTING!)
// ============================================================
async function callCloud(payload) {
    try {
        // Menggunakan mode no-cors terkadang bermasalah untuk JSON, 
        // tapi App Script biasanya oke dengan cara ini:
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Gunakan no-cors jika muncul error CORS
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        // Catatan: Karena no-cors tidak bisa baca response, 
        // kita asumsikan pendaftaran berhasil jika tidak ada error catch.
        // Untuk Login, kita butuh data, jadi gunakan fetch normal.
        if (payload.action === "register" || payload.action === "deposit") {
             return { result: "SUCCESS" }; 
        }

        const normalResponse = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        return await normalResponse.json();
    } catch (e) {
        console.error("Cloud Error:", e);
        return null;
    }
}

// ============================================================
// 3. LOGIKA LOGIN & REGISTER
// ============================================================
window.handleLogin = async function(username, password) {
    const res = await callCloud({ action: "login", username, password });
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('user_fullname', res.fullname);
        localStorage.setItem('saldo', res.saldo);
        window.showNeonAlert("Selamat Datang, " + res.fullname, "LOGIN BERHASIL");
        setTimeout(() => { window.location.href = "game.html"; }, 1500);
    } else if (res && res.result === "WRONG_PASSWORD") {
        window.showNeonAlert("Password Salah!", "AKSES DITOLAK");
    } else {
        window.showNeonAlert("User tidak ditemukan!", "GAGAL");
    }
};

// ============================================================
// 4. SINKRONISASI SALDO UTAMA
// ============================================================
window.syncAllData = async function() {
    const user = localStorage.getItem('user_session');
    if (!user) return;

    const res = await callCloud({ action: "getUserData", username: user });
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('saldo', res.saldo);
        const fmt = (v) => "IDR " + Number(v).toLocaleString('id-ID');
        
        // Update Kotak Saldo sesuai ID yang Anda minta
        const s1 = document.getElementById('SALDO UTAMA VIP');
        const s2 = document.getElementById('SALDO SAAT INI');
        if(s1) s1.innerText = fmt(res.saldo);
        if(s2) s2.innerText = fmt(res.saldo);
    }
};

// Auto Sync
setInterval(window.syncAllData, 10000); // Cek saldo setiap 10 detik
