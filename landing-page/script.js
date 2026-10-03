// KATEGORI: klik untuk pindah item aktif 
const kategoriItems = document.querySelectorAll('.kategori-item');
document.documentElement.classList.add('js');

kategoriItems.forEach((item) => {
    item.addEventListener('click', () => {
        kategoriItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// NAVBAR: tandai link sesuai section yang sedang dilihat 
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

// NAVBAR: bayangan muncul saat halaman sudah discroll
const navbarEl = document.querySelector('.navbar');

const setNavbarShadow = () => {
    navbarEl.classList.toggle('scrolled', window.scrollY > 20);
};

window.addEventListener('scroll', setNavbarShadow);
window.addEventListener('load', setNavbarShadow);

const setActiveLink = () => {
    let currentSectionId = sections[0] ? sections[0].id : '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
        }
    });

    // Kalau sudah discroll sampai halaman paling bawah, paksa section terakhir aktif
    const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    if (scrolledToBottom) {
        currentSectionId = sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active-link');
        }
    });
};

window.addEventListener('scroll', setActiveLink);
window.addEventListener('load', setActiveLink);

// NAVBAR MOBILE: buka/tutup menu hamburger 
const navToggle = document.getElementById('navToggle');
const navLinksList = document.querySelector('.nav-links');

if (navToggle && navLinksList) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinksList.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Tutup menu otomatis saat salah satu link diklik (khusus mobile)
    navLinksList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinksList.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// BACK TO TOP: tombol muncul setelah discroll turun ke plg bawah ngeklik buat balik ke atas
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 400);
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// STATUS BUKA/TUTUP: dihitung dari jam buka resto, pakai waktu WIB
const statusBadge = document.getElementById('statusBadge');

const updateStatusBadge = () => {
    if (!statusBadge) return;

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());

    const map = {};
    parts.forEach((p) => { map[p.type] = p.value; });

    const isWeekend = map.weekday === 'Sat' || map.weekday === 'Sun';
    const minutesNow = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);

    // Buka Senin-Jumat (8-21) dan Sabtu-Minggu (8-22)
    const openAt = 8 * 60; // 08.00
    const closeAt = isWeekend ? 22 * 60 : 21 * 60; // 22.00 Sabtu-Minggu, 21.00 Senin-Jumat

    const isOpen = minutesNow >= openAt && minutesNow < closeAt;

    statusBadge.textContent = isOpen ? 'Buka Sekarang' : 'Tutup';
    statusBadge.classList.toggle('open', isOpen);
    statusBadge.classList.toggle('closed', !isOpen);
};

updateStatusBadge();
setInterval(updateStatusBadge, 60000); // ngcek ulang tiap 1 menit

// SCROLL REVEAL: munculkan elemen .reveal saat masuk layar, sembunyikan lagi saat keluar
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('show', entry.isIntersecting);         // toggle('show', kondisi): tambah class kalau true, lepas kalau false
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px' // picu sedikit sebelum elemen menyentuh tepi bawah layar
});

revealEls.forEach((el) => revealObserver.observe(el));

// ==========================================
// RENDER MENU LANDING PAGE DARI localStorage ato data dari Admin
// ==========================================
(function renderMenuFromAdmin() {

    const STORAGE_KEY = 'lamak-bana-menu-data';

    // false = tampilin semua menu yang website ON
    // true  = hanya menu yg website ON dan Menu Andalan
    const SHOW_ONLY_FEATURED = false;

    const grid = document.querySelector('.menu-section .menu-grid');
    if (!grid) return;

    // Kembalikan null kalo admin belom pernah nyimpen data
    function getAdminMenuData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) return null;
            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : null;
        } catch (error) {
            console.warn('Gagal membaca menu admin:', error);
            return null;
        }
    }

    function formatRupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function createMenuCard(menu) {
        const card = document.createElement('div');
        card.className = 'menu-card reveal';
        card.dataset.menuId = menu.id || '';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-img-wrapper';

        if (menu.featured) {
            const badge = document.createElement('span');
            badge.className = 'badge-terlaris';
            badge.textContent = '★ Terlaris';
            imgWrap.appendChild(badge);
        }

        const foto = document.createElement('div');
        foto.className = 'foto-placeholder';
        foto.textContent = 'FOTO';
        imgWrap.appendChild(foto);

        const body = document.createElement('div');
        body.className = 'card-body';

        const row = document.createElement('div');
        row.className = 'card-title-row';

        const title = document.createElement('h3');
        title.className = 'menu-card-title';
        title.textContent = String(menu.name || '').toUpperCase();

        const price = document.createElement('span');
        price.className = 'menu-card-price';
        price.textContent = formatRupiah(menu.price);

        row.appendChild(title);
        row.appendChild(price);

        const desc = document.createElement('p');
        desc.className = 'menu-card-desc';
        desc.textContent = menu.desc || '';

        const btn = document.createElement('a');
        btn.className = 'btn-solid-red';
        btn.href = '#';
        btn.textContent = 'Pesan';
        btn.dataset.menuId = menu.id || '';

        body.appendChild(row);
        body.appendChild(desc);
        body.appendChild(btn);

        card.appendChild(imgWrap);
        card.appendChild(body);
        return card;
    }

    function renderMenuCards() {
        const menuData = getAdminMenuData();

        // admin belum pernah nyimpen apa pun, maka pakai kartu HTML asli
        if (menuData === null) return;

        const visible = menuData.filter(function (menu) {
            if (menu.website === false) return false;
            if (SHOW_ONLY_FEATURED && !menu.featured) return false;
            return true;
        });

        grid.innerHTML = '';

        if (!visible.length) {
            const empty = document.createElement('p');
            empty.className = 'menu-card-desc';
            empty.style.gridColumn = '1 / -1';
            empty.style.color = 'var(--cream)';
            empty.style.textAlign = 'center';
            empty.textContent = 'Menu sedang diperbarui. Silakan cek kembali sebentar lagi.';
            grid.appendChild(empty);
            return;
        }

        visible.forEach(function (menu) {
            const card = createMenuCard(menu);
            grid.appendChild(card);
            // wajib daftarin  ke observer, kalo gak kartu tetap opacity 0
            revealObserver.observe(card);
        });
    }

    renderMenuCards();

    // ngupdate otomatis kalo admin ngubah data di tab lain
    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY) {
            renderMenuCards();
        }
    });

})();