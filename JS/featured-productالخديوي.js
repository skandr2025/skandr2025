// Featured Product Management
class FeaturedProductManager {
    constructor() {
        this.featuredProductId = 'kabida-eskandrani-har'; // ID المنتج المميز
        this.banner = document.getElementById('featured-product-banner');
        this.init();
    }

    init() {
        // انتظار تحميل المنتجات من Firebase
        this.waitForProducts();
        
        // مراقبة تحديثات المنتجات
        window.addEventListener('firebaseProductsLoaded', () => {
            this.displayFeaturedProduct();
        });
        
        document.addEventListener('productsUpdated', () => {
            this.displayFeaturedProduct();
        });
    }

    waitForProducts() {
        const checkProducts = () => {
            const products = JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
            if (products.length > 0) {
                this.displayFeaturedProduct();
            } else {
                setTimeout(checkProducts, 500);
            }
        };
        checkProducts();
    }

    displayFeaturedProduct() {
        const products = JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
        
        // البحث عن المنتج المميز
        let featuredProduct = products.find(p => 
            p.id === this.featuredProductId || 
            p.name === 'كبدة اسكندراني حار' ||
            p.name.includes('كبدة اسكندراني حار')
        );

        // إذا لم يوجد، استخدم أول منتج كبدة
        if (!featuredProduct) {
            featuredProduct = products.find(p => 
                p.category === 'كبدة اسكندراني' || 
                p.category === 'kabida' ||
                p.name.includes('كبدة')
            );
        }

        // إذا لم يوجد أي منتج، استخدم أول منتج متاح
        if (!featuredProduct && products.length > 0) {
        