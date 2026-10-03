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
// SYNC MENU ADMIN → LANDING PAGE
// ==========================================

(function syncAdminMenuToLanding() {

    const STORAGE_KEY = 'lamak-bana-menu-data';

    function getAdminMenuData() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const data = JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.warn(
                'Gagal membaca menu admin:',
                error
            );

            return [];
        }
    }


    function formatRupiah(value) {

        return 'Rp' +
            Number(value || 0)
                .toLocaleString('id-ID');

    }


    function findMenuByName(menuData, name) {

        const target =
            name.toLowerCase().trim();

        return menuData.find(function(menu) {

            return String(menu.name || '')
                .toLowerCase()
                .trim() === target;

        });

    }


    function syncMenuCards() {

        const menuData =
            getAdminMenuData();

        if (!menuData.length) {
            return;
        }


        const cards =
            document.querySelectorAll(
                '.menu-section .menu-card'
            );


        cards.forEach(function(card) {

            const title =
                card.querySelector(
                    '.menu-card-title'
                );

            if (!title) {
                return;
            }


            const menuName =
                title.textContent
                    .trim()
                    .toLowerCase();


            const menu =
                findMenuByName(
                    menuData,
                    menuName
                );


            // Tidak ada data dari admin
            // → biarkan HTML asli
            if (!menu) {
                return;
            }


            // ==============================
            // HARGA
            // ==============================

            const price =
                card.querySelector(
                    '.menu-card-price'
                );

            if (price) {

                price.textContent =
                    formatRupiah(menu.price);

            }


            // ==============================
            // DESKRIPSI
            // ==============================

            const desc =
                card.querySelector(
                    '.menu-card-desc'
                );

            if (desc && menu.desc) {

                desc.textContent =
                    menu.desc;

            }


            // ==============================
            // WEBSITE ON / OFF
            // ==============================

            if (menu.website === false) {

                card.style.display = 'none';

            } else {

                card.style.display = '';

            }

        });

    }


    // Jalankan saat halaman selesai dimuat
    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            syncMenuCards
        );

    } else {

        syncMenuCards();

    }


    // Jika localStorage berubah
    // dari halaman/tab lain
    window.addEventListener(
        'storage',
        function(event) {

            if (
                event.key === STORAGE_KEY
            ) {

                syncMenuCards();

            }

        }
    );


})();