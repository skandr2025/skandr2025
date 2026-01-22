/* ===== Simple Slider Reset ===== */

// Destroy any existing swiper first
if (window.swiperInstance) {
    window.swiperInstance.destroy(true, true);
    window.swiperInstance = null;
}

// Reset initialization flag
window._sliedSwpInit = false;

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initSlider, 100);
});

function initSlider() {
    try {
        if (typeof Swiper !== 'undefined') {
            const sliderElement = document.querySelector('.slied-swp');
            
            if (sliderElement && !window._sliedSwpInit) {
                // Clean up any existing swiper classes
                sliderElement.classList.remove('swiper-initialized');
                
                window._sliedSwpInit = true;
                
                window.swiperInstance = new Swiper('.slied-swp', {
                    // Basic settings
                    slidesPerView: 1,
                    spaceBetween: 0,
                    centeredSlides: true,
                    
                    // Auto play
                    autoplay: { 
                        delay: 3500,
                        disableOnInteraction: false
                    },
                    
                    // Loop
                    loop: true,
                    
                    // Pagination
                    pagination: { 
                        el: '.swiper-pagination', 
                        clickable: true,
                        dynamicBullets: true
                    },
                    
                    // Transition
                    effect: 'slide',
                    speed: 800
                });
                
                console.log('Clean slider initialized with 5 slides');
            }
        } else {
            setTimeout(initSlider, 500);
        }
    } catch (e) {
        console.error('Slider error:', e);
    }
}
