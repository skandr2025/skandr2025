// البحث البسيط - يشتغل من أول حرف مع اقتراحات محسنة
let searchProducts = [];

function loadProducts() {
    const data = localStorage.getItem('firebaseProducts');
    if (data) {
        searchProducts = JSON.parse(data);
        console.log('تم تحميل', searchProducts.length, 'منتج للبحث');
    } else {
        // بيانات تجريبية للاختبار
        searchProducts = [
            { id: 1, name: 'كبدة سكندراني', price: 50, category: 'كبدة' },
            { id: 2, name: 'كبدة بالطحينة', price: 55, category: 'كبدة' },
            { id: 3, name: 'كبدة حار', price: 60, category: 'كبدة' },
            { id: 4, name: 'سجق سكندراني', price: 45, category: 'سجق' },
            { id: 5, name: 'طاجن سجق', price: 70, category: 'طاجن' }
        ];
        console.log('تم تحميل بيانات تجريبية للبحث');
        setTimeout(loadProducts, 1000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    let suggestionsBox = document.getElementById('search_suggestions');
    
    if (!searchInput) return;
    
    // إنشاء بوكس الاقتراحات إذا لم يكن موجود
    if (!suggestionsBox) {
        suggestionsBox = document.createElement('div');
        suggestionsBox.id = 'search_suggestions';
        suggestionsBox.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: none;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            max-height: 400px;
            overflow-y: auto;
            z-index: 999999;
            display: none;
            margin-top: 5px;
            backdrop-filter: blur(10px);
        `;
        
        const searchBox = searchInput.closest('.search_box');
        if (searchBox) {
            searchBox.style.position = 'relative';
            searchBox.style.zIndex = '1000';
            searchBox.appendChild(suggestionsBox);
        }
    }
    
    loadProducts();
    
    // البحث من أول حرف مع اقتراحات محسنة
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }
        
        // فلترة المنتجات
        const results = searchProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );
        
        // عرض النتائج بتصميم محسن
        suggestionsBox.innerHTML = '';
        
        if (results.length === 0) {
            suggestionsBox.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #95a5a6;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; color: #bdc3c7;"></i>
                    <div style="font-size: 16px; font-weight: 500; margin-bottom: 5px;">لا توجد نتائج</div>
                    <div style="font-size: 13px; color: #bdc3c7;">جرب البحث بكلمات أخرى</div>
                </div>
            `;
        } else {
            results.slice(0, 8).forEach(product => {
                const item = document.createElement('div');
                item.style.cssText = `
                    padding: 15px 20px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s ease;
                    background: white;
                `;
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 35px; height: 35px; background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-utensils" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 3px;">
                            <div style="font-weight: 600; color: #333; font-size: 14px;">${product.name}</div>
                            <div style="font-size: 12px; color: #666;">${product.category || 'منتج'}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-weight: 700; color: #ff6b35; font-size: 16px;">${product.price} ج.م</div>
                        <i class="fas fa-arrow-left" style="color: #bdc3c7; font-size: 12px;"></i>
                    </div>
                `;
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f8f9fa';
                    item.style.transform = 'translateX(-3px)';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                    item.style.transform = '';
                });
                
                item.addEventListener('click', function() {
                    searchInput.value = product.name;
                    suggestionsBox.style.display = 'none';
                    
                    // البحث عن المنتج في الصفحة
                    const productElement = document.getElementById(`product-${product.id}`);
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
                });
                
                suggestionsBox.appendChild(item);
            });
        }
        
        suggestionsBox.style.display = 'block';
    });
    
    // إخفاء عند الضغط خارج البحث
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search_box') && !e.target.closest('#search_suggestions')) {
            suggestionsBox.style.display = 'none';
        }
    });
    
    // منع إرسال النموذج
    const form = searchInput.closest('form');
    if (form) {
        form.addEventListener('submit', e => e.preventDefault());
    }
    
    // تحديث عند تحميل Firebase
    window.addEventListener('firebaseProductsLoaded', loadProducts);
});
