document.addEventListener('DOMContentLoaded', () => {
    // --- SCROLL ANIMATIONS ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach(el => observer.observe(el));

    // --- STICKY HEADER ---
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- HERO IMAGE SEQUENCE (SCROLL CONTROLLED) ---
    const canvas = document.getElementById('hero-canvas');
    const scrollTrack = document.querySelector('.hero-scroll-track');

    if (canvas && scrollTrack) {
        const ctx = canvas.getContext('2d');
        const frameCount = 64;
        const images = [];
        const imagePath = (index) => `assets/images/HeroAni/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

        // Preload Images
        // Start loading immediately
        let framesLoaded = 0;
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = imagePath(i);
            img.onload = () => {
                framesLoaded++;
                if (framesLoaded === 1) renderFrame(0); // Show first frame asap
            };
            images.push(img);
        }

        const renderFrame = (index) => {
            if (index >= 0 && index < images.length && images[index].complete) {
                const img = images[index];

                // Calculate cover 'fit'
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-render current frame on resize (would need to track currentFrame if we were precise, 
            // but usually next scroll event fixes it. Let's force update based on current scroll)
            updateCanvasOnScroll();
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // SCROLL LOGIC
        function updateCanvasOnScroll() {
            const trackRect = scrollTrack.getBoundingClientRect();
            const trackHeight = trackRect.height - window.innerHeight; // Scrollable distance
            const scrolled = -trackRect.top; // Amount scrolled from top of track

            // Calculate progress (0 to 1)
            let progress = scrolled / trackHeight;

            // Clamp progress
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;

            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(progress * (frameCount - 1))
            );

            requestAnimationFrame(() => renderFrame(frameIndex));

            // Optional: Fade out text as we scroll deep
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = 1 - (progress * 2);
                heroContent.style.transform = `translateY(-${progress * 100}px)`;
            }
        }

        window.addEventListener('scroll', updateCanvasOnScroll);
    }
});
