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