// GLOBAL SYSTEM - NEON PLINKO VIP
// Sinkronisasi Database Kolom A-L & Sistem Pop-up Universal

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqQWXIJuVnkIxLvdu3kYiiRDVh7eyrsy-KU6rG1qtQClgfAzmMoclv2ULFZ_hRdE_qUg/exec";

// ============================================================
// 1. SISTEM POP-UP NEON UNIVERSAL (PINK, BIRU, KUNING)
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
            animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes modalPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .neon-modal-box h2 { 
            color: #fbff00; text-shadow: 0 0 10px #fbff00; 
            margin: 0 0 15px; font-size: 20px; font-weight: 900; text-transform: uppercase; 
        }
        .neon-modal-box p { color: #ffffff; margin-bottom: 25px; line-height: 1.6; font-size: 14px; font-weight: 600; }
        
        .neon-modal-btn {
            background: #000; border: 2px solid #ff0077; color: #ff0077;
            padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
            cursor: pointer; box-shadow: 0 0 15px #ff0077; text-transform: uppercase;
            transition: 0.2s;
        }
        .neon-modal-btn:active { transform: scale(0.95); box-shadow: 0 0 5px #ff0077; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'neon-global-overlay';
    modal.innerHTML = `
        <div class="neon-modal-box">
            <h2 id="neon-modal-title">NOTIFIKASI</h2>
            <p id="neon-modal-msg">Pesan sistem...</p>
            <button class="neon-modal-btn" onclick="closeNeonAlert()">OK - MENGERTI</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.showNeonAlert = function(msg, title = "VIP INFO") {
    injectNeonModal();
    const titleEl = document.getElementById('neon-modal-title');
    const msgEl = document.getElementById('neon-modal-msg');
    const overlay = document.getElementById('neon-global-overlay');
    if(titleEl) titleEl.innerText = title;
    if(msgEl) msgEl.innerText = msg;
    if(overlay) overlay.style.display = 'flex';
};

window.closeNeonAlert = function() {
    const el = document.getElementById('neon-global-overlay');
    if(el) el.style.display = 'none';
};

// Override Alert Standar
window.alert = function(msg) { window.showNeonAlert(msg, "VIP SYSTEM"); };

// ============================================================
// 2. CORE DATABASE COMMUNICATOR
// ============================================================
async function callCloud(payload) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (e) {
        console.error("Cloud Error:", e);
        return null;
    }
}

// ============================================================
// 3. SISTEM LOGIN (PASSWORD & DATA SYNC)
// ============================================================
window.handleLogin = async function(username, password) {
    const res = await callCloud({ action: "login", username, password });
    
    if (!res) return window.showNeonAlert("Koneksi Server Gagal!", "ERROR");

    if (res.result === "SUCCESS") {
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('user_fullname', res.fullname);
        localStorage.setItem('user_bank', res.bank);
        localStorage.setItem('user_rekening', res.rekening);
        localStorage.setItem('saldo', res.saldo);
        localStorage.setItem('user_tier', res.tier);

        window.showNeonAlert("Akses diterima! Selamat datang kembali.", "LOGIN BERHASIL");
        setTimeout(() => { window.location.href = "game.html"; }, 1500);
    } 
    else if (res.result === "WRONG_PASSWORD") {
        window.showNeonAlert("Password salah! Silakan coba lagi.", "AKSES DITOLAK");
    } 
    else {
        window.showNeonAlert("Username tidak terdaftar.", "USER TIDAK ADA");
    }
};

// ============================================================
// 4. SINKRONISASI DATA (SALDO UTAMA & PROFIL)
// ============================================================
window.syncAllData = async function() {
    const user = localStorage.getItem('user_session');
    if (!user) return;

    const res = await callCloud({ action: "getUserData", username: user });
    
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('saldo', res.saldo);
        localStorage.setItem('user_tier', res.tier);

        const formatIDR = (val) => "IDR " + Number(val).toLocaleString('id-ID');

        // Hubungkan ke Kotak-Kotak UI sesuai permintaan Anda
        const saldoUtama = document.getElementById('SALDO UTAMA VIP');
        const saldoSaatIni = document.getElementById('SALDO SAAT INI');
        const displaySaldo = document.getElementById('display-saldo');

        if(saldoUtama) saldoUtama.innerText = formatIDR(res.saldo);
        if(saldoSaatIni) saldoSaatIni.innerText = formatIDR(res.saldo);
        if(displaySaldo) displaySaldo.innerText = formatIDR(res.saldo);

        // Isi Data Profil Otomatis
        if(document.getElementById('profile-name')) document.getElementById('profile-name').innerText = res.fullname;
        if(document.getElementById('wd-nama-lengkap')) document.getElementById('wd-nama-lengkap').value = res.fullname;
        if(document.getElementById('wd-rekening')) document.getElementById('wd-rekening').value = res.bank + " - " + res.rekening;
    }
};

// ============================================================
// 5. WITHDRAW HANDLER
// ============================================================
window.processWithdraw = async function(amount) {
    const user = localStorage.getItem('user_session');
    const res = await callCloud({ action: "withdraw", username: user, amount: amount });

    if (res && res.result === "SUCCESS") {
        window.showNeonAlert("Penarikan sedang diproses oleh admin.", "WD BERHASIL");
        window.syncAllData(); // Update saldo di kotak seketika
        if(typeof loadWDHistory === 'function') loadWDHistory();
    } else if (res && res.result === "INSUFFICIENT") {
        window.showNeonAlert("Saldo Anda tidak cukup!", "GAGAL WD");
    } else {
        window.showNeonAlert("Gagal memproses penarikan.", "ERROR");
    }
};

// ============================================================
// 6. RIWAYAT WITHDRAW (HISTORY BOX)
// ============================================================
window.loadWDHistory = async function() {
    const user = localStorage.getItem('user_session');
    const container = document.getElementById('wd-history-container');
    if (!container) return;

    const history = await callCloud({ action: "getHistoryWD", username: user });
    
    if (history && Array.isArray(history)) {
        container.innerHTML = history.map(item => `
            <div style="border-bottom: 1px dashed #ff0077; padding: 10px 0; font-size: 12px;">
                <div style="color: #fbff00;">WAKTU: ${item.tanggal}</div>
                <div style="color: #ffffff;">JUMLAH: IDR ${Number(item.jumlah).toLocaleString()}</div>
                <div style="color: ${item.status === 'BERHASIL' ? '#00ff00' : '#ff0077'}; font-weight: bold;">
                    STATUS: ${item.status}
                </div>
            </div>
        `).join('');
    }
};

// ============================================================
// 7. INITIALIZER
// ============================================================
window.addEventListener('load', () => {
    injectNeonModal();
    window.syncAllData();
    
    // Auto-sync setiap 30 detik agar saldo terupdate jika Admin approve deposit
    if (localStorage.getItem('user_session')) {
        setInterval(window.syncAllData, 30000);
        if(document.getElementById('wd-history-container')) window.loadWDHistory();
    }
});
