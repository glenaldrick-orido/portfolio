const menuButton = document.getElementById("menuButton");
const closeButton = document.getElementById("closeButton");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

function openMenu() {
    sideMenu.classList.add("open");
    overlay.classList.add("visible");
    sideMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("visible");
    sideMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", openMenu);
closeButton.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

document.querySelectorAll(".side-menu a").forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.querySelectorAll(".tabs a").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tabs a").forEach((item) => {
            item.classList.remove("active");
        });

        tab.classList.add("active");
    });
});

const galleryConfig = {
    quiz1: [
        { src: "images/quiz1-front-dcit26.jpg", alt: "Quiz 1 front page" },
        { src: "images/quiz1-back-dcit26.jpg", alt: "Quiz 1 back page" }
    ],
    midterm: [
        { src: "images/midterm-dcit26.jpg", alt: "Midterm front page" }
    ],
    quiz2: [
        { src: "images/quiz2-dcit26.jpg", alt: "Quiz 2 front page" }
    ],
    quiz3: [
        { src: "images/quiz3-dcit26.jpg", alt: "Quiz 3 front page" }
    ],
    longquiz: [
        { src: "images/long-quiz-dcit26.jpg", alt: "Long Quiz front page" }
    ]
};
const preloadedGalleryImages = new Map(
    Object.values(galleryConfig)
        .flat()
        .map(({ src }) => {
            const image = new Image();
            image.src = src;
            return [
                src,
                image.decode().then(
                    () => image,
                    (error) => {
                        console.error(`Unable to load gallery image "${src}".`, error);
                        return null;
                    }
                )
            ];
        })
);
const galleryPreviews = document.querySelectorAll(".gallery-preview");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const galleryClose = document.getElementById("galleryClose");
const galleryBack = document.getElementById("galleryBack");
const galleryNext = document.getElementById("galleryNext");
let activeGallery = [];
let currentImage = 0;
let focusAfterClose = null;
let imageRequest = 0;

async function showGalleryImage(index) {
    if (!activeGallery.length) {
        return false;
    }

    currentImage = (index + activeGallery.length) % activeGallery.length;
    const imageRequestId = ++imageRequest;
    const image = activeGallery[currentImage];
    lightboxImage.classList.add("loading");

    await preloadedGalleryImages.get(image.src);
    if (imageRequestId !== imageRequest) {
        return false;
    }

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxImage.classList.remove("loading");
    return true;
}

function updateGalleryControls() {
    const showControls = activeGallery.length > 1;
    galleryBack.hidden = !showControls;
    galleryNext.hidden = !showControls;
}

async function openGallery(images, startIndex = 0, galleryTitle = "Image") {
    activeGallery = images;
    updateGalleryControls();
    const imageLoaded = await showGalleryImage(startIndex);
    if (!imageLoaded) {
        return;
    }

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-label", `${galleryTitle} image gallery`);
    lightbox.setAttribute("aria-hidden", "false");
    galleryClose.focus();
}

function closeGallery() {
    imageRequest++;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (focusAfterClose) {
        focusAfterClose.focus();
    }
}

galleryPreviews.forEach((preview) => {
    preview.addEventListener("click", () => {
        focusAfterClose = preview;
        const galleryName = preview.dataset.gallery || "quiz1";
        const galleryImages = galleryConfig[galleryName] || galleryConfig.quiz1;
        const startIndex = Number.parseInt(preview.dataset.startIndex || "0", 10);
        const galleryTitle = preview.closest(".repo-card")?.querySelector("h3")?.textContent.trim() || "Image";
        openGallery(galleryImages, startIndex, galleryTitle);
    });
});

galleryClose.addEventListener("click", closeGallery);
galleryBack.addEventListener("click", () => showGalleryImage(currentImage - 1));
galleryNext.addEventListener("click", () => showGalleryImage(currentImage + 1));
lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeGallery();
    }
});
document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) {
        return;
    }

    if (event.key === "Escape") {
        closeGallery();
    } else if (event.key === "ArrowLeft") {
        showGalleryImage(currentImage - 1);
    } else if (event.key === "ArrowRight") {
        showGalleryImage(currentImage + 1);
    }
});

const backToTop = document.getElementById("backToTop");
let previousScrollPosition = window.scrollY;

const categoryButtons = document.querySelectorAll("[data-category-filter]");
const categoryCards = document.querySelectorAll(".repo-card[data-category]");
const categoryEmpty = document.getElementById("categoryEmpty");

function filterModules(category) {
    let visibleCards = 0;

    categoryButtons.forEach((button) => {
        const isActive = button.dataset.categoryFilter === category;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    categoryCards.forEach((card) => {
        const isVisible = card.dataset.category === category;
        card.hidden = !isVisible;
        visibleCards += Number(isVisible);
    });

    categoryEmpty.hidden = visibleCards > 0;
}

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => filterModules(button.dataset.categoryFilter));
});
filterModules("quiz");

function updateBackToTopVisibility() {
    const currentScrollPosition = window.scrollY;
    const scrollingUp = currentScrollPosition < previousScrollPosition;
    const shouldShow = currentScrollPosition > 0 && scrollingUp;

    backToTop.classList.toggle("visible", shouldShow);
    previousScrollPosition = currentScrollPosition;
}

window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
updateBackToTopVisibility();