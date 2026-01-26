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
            p.name === 'كبدة سكندراني حار' ||
            p.name.includes('كبدة سكندراني حار')
        );

        // إذا لم يوجد، استخدم أول منتج كبدة
        if (!featuredProduct) {
            featuredProduct = products.find(p => 
                p.category === 'كبدة سكندراني' || 
                p.category === 'kabida' ||
                p.name.includes('كبدة')
            );
        }

        // إذا لم يوجد أي منتج، استخدم أول منتج متاح
        if (!featuredProduct && products.length > 0) {
            featuredProduct = products[0];
        }

        if (featuredProduct && this.banner) {
            this.showBanner(featuredProduct);
        } else {
            this.hideBanner();
        }
    }

    showBanner(product) {
        if (!this.banner) return;

        const productPrice = product.price || 0;
        const productImage = product.image || product.img || 'img/default.jpg';
        
        this.banner.innerHTML = `
            <div class="featured-product-item" onclick="scrollToProduct('${product.id}')">
                <div class="featured-product-info">
                    <div class="featured-product-name">${product.name}</div>
                    <div class="featured-product-category">${product.category || 'منتج مميز'}</div>
                </div>
                <div class="featured-product-price">${productPrice} ج.م</div>
            </div>
        `;
        
        this.banner.style.display = 'block';
        document.body.classList.add('has-featured-product');
        
        console.log('✅ تم عرض المنتج المميز:', product.name);
    }

    hideBanner() {
        if (this.banner) {
            this.banner.style.display = 'none';
            document.body.classList.remove('has-featured-product');
        }
    }
}

// دالة للانتقال للمنتج
function scrollToProduct(productId) {
    const productElement = document.getElementById(`product-${productId}`);
    if (productElement) {
        productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // تعليم المنتج
        productElement.style.border = '3px solid #ff6b35';
        productElement.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.6)';
        
        setTimeout(() => {
            productElement.style.border = '';
            productElement.style.boxShadow = '';
        }, 2000);
    }
}

// تشغيل المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.featuredProductManager = new FeaturedProductManager();
});

// تصدير الدوال للاستخدام العام
window.scrollToProduct = scrollToProduct;
