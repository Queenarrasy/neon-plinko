// GLOBAL SYSTEM - NEON PLINKO VIP
// Koneksi ke Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYTC11njbEBtAsdpbaRLJRt13j7iEKCkANV1SgxxguV_zFUyZ6Z7FAj0SKuw4d5ThmKw/exec";

// ============================================================
// 1. SISTEM POP-UP NEON UNIVERSAL (PINK, BLUE, YELLOW THEME)
// ============================================================
const injectNeonModal = () => {
    if (document.getElementById('neon-global-overlay')) return;
    const style = document.createElement('style');
    style.innerHTML = `
        #neon-global-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(5, 6, 18, 0.9); backdrop-filter: blur(12px);
            display: none; justify-content: center; align-items: center; z-index: 1000000;
            font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .neon-modal-box {
            background: #0a0b1e; 
            border: 3px solid #00d4ff; 
            border-radius: 30px;
            padding: 35px 25px; 
            text-align: center; 
            width: 90%; 
            max-width: 380px;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.1);
            animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes modalPop {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .neon-modal-box h2 { 
            color: #fbff00; 
            text-shadow: 0 0 15px #fbff00; 
            margin-bottom: 20px; 
            text-transform: uppercase; 
            font-weight: 900;
            letter-spacing: 2px;
            font-size: 24px;
        }
        .neon-modal-box p { 
            color: #ffffff; 
            margin-bottom: 30px; 
            font-weight: 600; 
            line-height: 1.6;
            font-size: 16px;
        }
        .neon-modal-btn {
            background: transparent; 
            border: 2px solid #ff0077; 
            color: #ff0077;
            padding: 14px 0; 
            width: 100%; 
            border-radius: 50px; 
            font-weight: 900;
            cursor: pointer; 
            box-shadow: 0 0 15px rgba(255, 0, 119, 0.4); 
            text-transform: uppercase;
            transition: 0.3s;
            letter-spacing: 2px;
        }
        .neon-modal-btn:hover {
            background: #ff0077;
            color: white;
            box-shadow: 0 0 25px #ff0077;
        }
    `;
    document.head.appendChild(style);
    const modal = document.createElement('div');
    modal.id = 'neon-global-overlay';
    modal.innerHTML = `
        <div class="neon-modal-box">
            <h2 id="neon-modal-title">INFO</h2>
            <p id="neon-modal-msg">...</p>
            <button class="neon-modal-btn" onclick="closeNeonAlert()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.showNeonAlert = function(msg, title = "VIP INFO") {
    injectNeonModal();
    document.getElementById('neon-modal-title').innerText = title;
    document.getElementById('neon-modal-msg').innerText = msg;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};

window.closeNeonAlert = function() { 
    document.getElementById('neon-global-overlay').style.display = 'none'; 
};

// ============================================================
// 2. CORE DATABASE COMMUNICATOR (VERSI TERBARU & STABIL)
// ============================================================
async function callCloud(payload) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });
        
        // Mengambil teks respon terlebih dahulu untuk menghindari error parsing
        const text = await response.text();
        return JSON.parse(text);
        
    } catch (e) {
        console.error("Cloud Error:", e);
        return null;
    }
}

// ============================================================
// 3. LOGIKA LOGIN & SESSION
// ============================================================
window.handleLogin = async function(username, password) {
    const res = await callCloud({ action: "login", username, password });
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('user_fullname', res.fullname);
        localStorage.setItem('saldo', res.saldo);
        window.showNeonAlert("Selamat Datang Kembali, Member VIP " + res.fullname, "AKSES DITERIMA");
        setTimeout(() => { window.location.href = "game.html"; }, 1500);
    } else if (res && res.result === "WRONG_PASSWORD") {
        window.showNeonAlert("Password yang Anda masukkan salah!", "AKSES DITOLAK");
    } else {
        window.showNeonAlert("ID Member tidak ditemukan di database!", "LOGIN GAGAL");
    }
};

// ============================================================
// 4. SINKRONISASI SALDO & DATA REAL-TIME
// ============================================================
window.syncAllData = async function() {
    const user = localStorage.getItem('user_session');
    if (!user) return;

    const res = await callCloud({ action: "getUserData", username: user });
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('saldo', res.saldo);
        const fmt = (v) => "IDR " + Number(v).toLocaleString('id-ID');
        
        // Update elemen UI jika tersedia di halaman
        const s1 = document.getElementById('SALDO UTAMA VIP');
        const s2 = document.getElementById('SALDO SAAT INI');
        const s3 = document.getElementById('saldo-display'); // Tambahan ID umum
        
        if(s1) s1.innerText = fmt(res.saldo);
        if(s2) s2.innerText = fmt(res.saldo);
        if(s3) s3.innerText = fmt(res.saldo);
    }
};

// Inisialisasi Sinkronisasi Otomatis
if (localStorage.getItem('user_session')) {
    window.syncAllData();
    setInterval(window.syncAllData, 10000); // Sinkronisasi setiap 10 detik
}
