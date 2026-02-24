function transitionToGame() {
    // Sembunyikan Pendaftaran secara permanen setelah sukses
    document.getElementById('auth-layer').style.display = 'none';
    
    // Tampilkan Game Layer
    document.getElementById('game-layer').style.display = 'block';
    
    // Mulai jalankan mesin paku plinko
    initPlinkoGame(); 
}

function openProfile() {
    // Membuka profil sebagai lapisan pop-up di atas game
    document.getElementById('profile-layer').style.display = 'flex';
}
