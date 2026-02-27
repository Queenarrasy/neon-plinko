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
// 1. SISTEM POP-UP NEON GLOBAL
// ============================================================
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
        }
        .neon-modal-box h2 { color: #fbff00; text-shadow: 0 0 10px #fbff00; margin: 0 0 15px; font-size: 22px; text-transform: uppercase; }
        .neon-modal-box p { color: #ffffff; margin-bottom: 25px; line-height: 1.5; font-size: 15px; }
        .neon-modal-btn {
            background: transparent; border: 2px solid #ff0077; color: #ff0077;
            padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
            cursor: pointer; box-shadow: 0 0 15px #ff0077; text-transform: uppercase;
        }
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

// ============================================================
// 2. SISTEM AUTH
// ============================================================
async function cloudRegister(userData) {
    const res = await fetchCloud({ action: "register", ...userData });
    if (res && (res === "SUCCESS" || res.result === "SUCCESS")) {
        localStorage.setItem('user_session', userData.username);
        localStorage.setItem('saldo', 0); // Sesuaikan nama ke 'saldo'
        showNeonAlert("Pendaftaran Berhasil!", "SUKSES");
        setTimeout(() => window.location.href = "game.html", 2000);
        return "SUCCESS";
    }
    showNeonAlert("Gagal Mendaftar!", "ERROR");
    return "ERROR";
}

async function cloudLogin(username, password) {
    const res = await fetchCloud({ action: "login", username, password });
    if (res && res.result === "SUCCESS") {
        localStorage.setItem('user_session', res.username);
        localStorage.setItem('saldo', res.saldo || 0); // Sesuaikan nama ke 'saldo'
        localStorage.setItem('user_tier', res.tier || "BRONZE");
        showNeonAlert("Login Berhasil!", "SUKSES");
        setTimeout(() => window.location.href = "game.html", 1500);
        return "SUCCESS";
    }
    showNeonAlert("Login Gagal!", "ERROR");
    return "FAILED";
}

// ============================================================
// 3. SISTEM SALDO (SINKRON DENGAN GAME.HTML)
// ============================================================
window.updateSaldo = function(jumlah) {
    // Gunakan kunci 'saldo' agar sama dengan yang ada di game.html
    let saldo = Number(localStorage.getItem('saldo')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        showNeonAlert("Saldo tidak cukup!", "SALDO KURANG");
        return false;
    }

    saldo += jumlah;
    localStorage.setItem('saldo', saldo);

    // Update tampilan saldo di UI
    const saldoEl = document.getElementById('display-saldo');
    if(saldoEl) {
        saldoEl.innerText = "IDR " + saldo.toLocaleString('id-ID');
    }

    // Sinkronisasi ke Cloud jika saldo bertambah (Menang)
    const currentUsername = localStorage.getItem('user_session');
    if (currentUsername && jumlah > 0) {
        fetchCloud({ 
            action: "updateSaldo", 
            username: currentUsername, 
            newSaldo: saldo 
        });
    }
    return true;
};

// ============================================================
// 4. MONITORING INBOX
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
                    fetchCloud({ action: "claimInbox", id: msg.id, username: user });
                }
            }
        });
    }
}

// ============================================================
// 5. INITIALIZATION
// ============================================================
window.addEventListener('load', () => {
    injectNeonModal();
    // Inisialisasi tampilan awal
    const savedSaldo = localStorage.getItem('saldo');
    if(savedSaldo !== null) {
        const saldoEl = document.getElementById('display-saldo');
        if(saldoEl) saldoEl.innerText = "IDR " + Number(savedSaldo).toLocaleString('id-ID');
    }
    
    if (localStorage.getItem('user_session')) {
        syncInbox();
        setInterval(syncInbox, 60000);
    }
});
