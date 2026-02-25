const SALDO_KEY = 'saldo_permainan';

// Fungsi Ambil Saldo
function getSaldo() {
    return parseInt(localStorage.getItem(SALDO_KEY)) || 0;
}

// Fungsi Update Saldo (Tambah/Kurang)
function updateSaldo(jumlah) {
    let saldoBaru = getSaldo() + jumlah;
    if (saldoBaru < 0) return false;
    localStorage.setItem(SALDO_KEY, saldoBaru);
    window.dispatchEvent(new Event('storage'));
    refreshDisplaySaldo();
    return true;
}

// Logika Tier Member
function getTier() {
    const saldo = getSaldo();
    if (saldo >= 10000000) return { nama: "DIAMOND VIP", warna: "#00d4ff", icon: "fa-gem" };
    if (saldo >= 5000000) return { nama: "PLATINUM VIP", warna: "#e5e4e2", icon: "fa-crown" };
    if (saldo >= 1000000) return { nama: "GOLD VIP", warna: "#fbff00", icon: "fa-medal" };
    if (saldo >= 100000) return { nama: "SILVER VIP", warna: "#c0c0c0", icon: "fa-star" };
    return { nama: "BRONZE MEMBER", warna: "#cd7f32", icon: "fa-user" };
}

// Refresh Tampilan di Semua Elemen
function refreshDisplaySaldo() {
    const currentSaldo = getSaldo();
    const tier = getTier();

    document.querySelectorAll('#display-saldo').forEach(el => {
        el.innerText = "IDR " + currentSaldo.toLocaleString('id-ID');
    });

    document.querySelectorAll('#tier-name').forEach(el => {
        el.innerText = tier.nama;
        el.style.color = tier.warna;
    });

    document.querySelectorAll('#tier-icon').forEach(el => {
        el.className = `fa-solid ${tier.icon}`;
        el.style.color = tier.warna;
    });
}

window.addEventListener('storage', refreshDisplaySaldo);
document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
