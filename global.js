// GLOBAL SYSTEM - NEON PLINKO VIP
// Menangani Saldo, Sinkronisasi Cloud, dan Pop-up Neon Universal

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

// Fungsi Alert Global
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

// Membajak fungsi alert standar browser agar otomatis jadi tema Neon
window.alert = function(msg) {
    window.showNeonAlert(msg, "VIP NOTIFIKASI");
};

// ============================================================
// 2. SISTEM DATABASE & AUTH
// ============================================================
async function fetchCloud(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (e) {
        console.error("Database Offline");
        return null;
    }
}

// ============================================================
// 3. PENGELOLAAN SALDO (REAL-TIME UI)
// ============================================================
window.updateSaldo = function(jumlah) {
    let saldo = Number(localStorage.getItem('saldo')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        window.showNeonAlert("Saldo anda tidak mencukupi untuk transaksi ini!", "SALDO MINUS");
        return false;
    }

    saldo += jumlah;
    localStorage.setItem('saldo', saldo);

    // Update semua elemen saldo di halaman (jika ada)
    const saldoElements = [document.getElementById('display-saldo'), document.getElementById('user-balance')];
    saldoElements.forEach(el => {
        if(el) el.innerText = "IDR " + saldo.toLocaleString('id-ID');
    });

    return true;
};

// ============================================================
// 4. SINKRONISASI INBOX & HADIAH
// ============================================================
async function syncInbox() {
    const user = localStorage.getItem('user_session');
    if (!user) return;
    
    const res = await fetchCloud({ action: "getInbox", username: user });
    if (res && Array.isArray(res)) {
        res.forEach(msg => {
            if (msg.status === "UNCLAIMED") {
                window.showNeonAlert(`${msg.pesan}\n\nBonus: IDR ${Number(msg.hadiah).toLocaleString()}`, "HADIAH VIP");
                if (parseInt(msg.hadiah) > 0) {
                    window.updateSaldo(parseInt(msg.hadiah));
                    fetchCloud({ action: "claimInbox", id: msg.id, username: user });
                }
            }
        });
    }
}

// ============================================================
// 5. AUTO-LOADER
// ============================================================
window.addEventListener('load', () => {
    injectNeonModal();
    
    // Pastikan saldo awal tampil rapi
    const currentSaldo = localStorage.getItem('saldo');
    if(currentSaldo !== null) {
        const el = document.getElementById('display-saldo');
        if(el) el.innerText = "IDR " + Number(currentSaldo).toLocaleString('id-ID');
    }

    // Jalankan Sinkronisasi jika sudah login
    if (localStorage.getItem('user_session')) {
        syncInbox();
        setInterval(syncInbox, 30000); // Cek inbox setiap 30 detik
    }
});
