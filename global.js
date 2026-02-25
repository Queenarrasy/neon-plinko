const SALDO_KEY = 'saldo_permainan';

function getSaldo() {
    return parseInt(localStorage.getItem(SALDO_KEY)) || 0;
}

function updateSaldo(jumlah) {
    let saldoBaru = getSaldo() + jumlah;
    if (saldoBaru < 0) return false;
    localStorage.setItem(SALDO_KEY, saldoBaru);
    window.dispatchEvent(new Event('storage'));
    refreshDisplaySaldo();
    return true;
}

// Data Ambang Batas Tier
const TIER_CONFIG = [
    { nama: "BRONZE", min: 0, max: 100000, warna: "#cd7f32", icon: "fa-user" },
    { nama: "SILVER", min: 100000, max: 1000000, warna: "#c0c0c0", icon: "fa-star" },
    { nama: "GOLD", min: 1000000, max: 5000000, warna: "#fbff00", icon: "fa-medal" },
    { nama: "PLATINUM", min: 5000000, max: 10000000, warna: "#e5e4e2", icon: "fa-crown" },
    { nama: "DIAMOND", min: 10000000, max: 100000000, warna: "#00d4ff", icon: "fa-gem" }
];

function getTierData() {
    const saldo = getSaldo();
    let current = TIER_CONFIG[0];
    
    for (let i = 0; i < TIER_CONFIG.length; i++) {
        if (saldo >= TIER_CONFIG[i].min) {
            current = TIER_CONFIG[i];
        }
    }

    // Hitung Persentase ke Tier Selanjutnya
    let persen = 100;
    if (current.nama !== "DIAMOND") {
        const range = current.max - current.min;
        const progress = saldo - current.min;
        persen = Math.floor((progress / range) * 100);
    }
    
    return { ...current, persen: persen > 100 ? 100 : persen };
}

function refreshDisplaySaldo() {
    const saldo = getSaldo();
    const tier = getTierData();

    document.querySelectorAll('#display-saldo').forEach(el => el.innerText = "IDR " + saldo.toLocaleString('id-ID'));
    document.querySelectorAll('#tier-name').forEach(el => {
        el.innerText = tier.nama;
        el.style.color = tier.warna;
    });
    document.querySelectorAll('#tier-persen').forEach(el => el.innerText = tier.persen + "%");
    document.querySelectorAll('#tier-progress-bar').forEach(el => {
        el.style.width = tier.persen + "%";
        el.style.backgroundColor = tier.warna;
        el.style.boxShadow = `0 0 10px ${tier.warna}`;
    });
}

window.addEventListener('storage', refreshDisplaySaldo);
document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
