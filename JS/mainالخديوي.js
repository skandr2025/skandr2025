let category_nav_list = document.querySelector(".category_nav_list");

function open_categ_list() {
    category_nav_list.classList.toggle("active")
}
let nav_linkc = document.querySelector(".nav_linkc")
function open_Menu() {
    nav_linkc.classList.toggle("active")
}

var cart = document.querySelector('.cart');

function open_close_cart() {
    cart.classList.toggle("active")
}

// 🛒 نظام السلة المباشر - سرعة قصوى مع الإضافات
let cartData = JSON.parse(localStorage.getItem('cart')) || [];
window.cartData = cartData;

// إضافة مباشرة للسلة - مع إمكانية الإضافات
function addToCartDirect(productId, productName, productPrice, productImg, addons = []) {
    console.log('🛒 إضافة مباشرة:', productName, 'إضافات:', addons);
    
    // حساب سعر الإضافات
    const addonsPrice = addons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = productPrice + addonsPrice;
    
    // البحث عن المنتج مع نفس الإضافات
    const existingIndex = cartData.findIndex(item => 
        item.id == productId && 
        JSON.stringify(item.addons || []) === JSON.stringify(addons)
    );
    
    if (existingIndex > -1) {
        // زيادة الكمية
        cartData[existingIndex].quantity += 1;
    } else {
        // إضافة منتج جديد
        cartData.push({
            id: productId,
            name: productName,
            price: productPrice,
            img: productImg,
            quantity: 1,
            addons: addons,
            totalPrice: totalPrice
        });
    }
    
    // حفظ فوري
    localStorage.setItem('cart', JSON.stringify(cartData));
    window.cartData = cartData;
    
    // تحديث فوري للواجهة
    updateCartInstant();
    
    // تحديث الزر فوراً
    updateButtonInstant(productId, true);
    
    console.log('✅ تم بسرعة');
}

// فتح مودال الإضافات
function openAddonsModal(productId, productName, productPrice, productImg, productAddons) {
    if (!productAddons || productAddons.length === 0) {
        // إضافة مباشرة بدون إضافات
        addToCartDirect(productId, productName, productPrice, productImg, []);
        return;
    }
    
    // إنشاء مودال الإضافات
    const modal = document.createElement('div');
    modal.className = 'addons-modal-backdrop';
    modal.innerHTML = `
        <div class="addons-modal">
            <div class="addons-modal-header">
                <h3>${productName}</h3>
                <button class="close-addons-modal">&times;</button>
            </div>
            <div class="addons-modal-body">
                <div class="product-info">
                    <img src="${productImg}" alt="${productName}">
                    <div class="product-details">
                        <h4>${productName}</h4>
                        <p class="base-price">السعر الأساسي: ${productPrice} ج.م</p>
                    </div>
                </div>
                <div class="cart-addons">
                    <h5>الإضافات المتاحة:</h5>
                    <div class="addons-slider">
                        ${productAddons.map(addon => `
                            <div class="addon-card" data-addon='${JSON.stringify(addon)}'>
                                <div class="addon-name">${addon.name}</div>
                                <div class="addon-price">+${addon.price} ج.م</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="quantity-section">
                    <label>الكمية:</label>
                    <div class="quantity-controls">
                        <button type="button" onclick="changeModalQuantity(-1)">-</button>
                        <span id="modalQuantity">1</span>
                        <button type="button" onclick="changeModalQuantity(1)">+</button>
                    </div>
                </div>
                <div class="total-price">
                    <strong>الإجمالي: <span id="modalTotal">${productPrice}</span> ج.م</strong>
                </div>
            </div>
            <div class="addons-modal-footer">
                <button class="btn-cancel" onclick="closeAddonsModal()">إلغاء</button>
                <button class="btn-add-to-cart" onclick="confirmAddToCart('${productId}', '${productName}', ${productPrice}, '${productImg}')">
                    إضافة للسلة
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة event listeners للإضافات
    modal.querySelectorAll('.addon-card').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateModalTotal(productPrice);
        });
    });
    
    // إضافة event listener للإغلاق
    modal.querySelector('.close-addons-modal').addEventListener('click', closeAddonsModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAddonsModal();
    });
    
    // عرض المودال
    setTimeout(() => modal.classList.add('active'), 10);
}

// تغيير الكمية في المودال
function changeModalQuantity(change) {
    const quantityEl = document.getElementById('modalQuantity');
    let quantity = parseInt(quantityEl.textContent) + change;
    if (quantity < 1) quantity = 1;
    quantityEl.textContent = quantity;
    
    const basePrice = parseFloat(document.querySelector('.base-price').textContent.match(/[\d.]+/)[0]);
    updateModalTotal(basePrice);
}

// تحديث الإجمالي في المودال
function updateModalTotal(basePrice) {
    const quantity = parseInt(document.getElementById('modalQuantity').textContent);
    const selectedAddons = document.querySelectorAll('.addon-card.selected');
    
    let addonsPrice = 0;
    selectedAddons.forEach(card => {
        const addon = JSON.parse(card.dataset.addon);
        addonsPrice += addon.price;
    });
    
    const total = (basePrice + addonsPrice) * quantity;
    document.getElementById('modalTotal').textContent = total.toFixed(2);
}

// تأكيد الإضافة للسلة
function confirmAddToCart(productId, productName, productPrice, productImg) {
    const quantity = parseInt(document.getElementById('modalQuantity').textContent);
    const selectedAddons = [];
    
    document.querySelectorAll('.addon-card.selected').forEach(card => {
        selectedAddons.push(JSON.parse(card.dataset.addon));
    });
    
    // إضافة المنتج بالكمية المحددة
    for (let i = 0; i < quantity; i++) {
        addToCartDirect(productId, productName, productPrice, productImg, selectedAddons);
    }
    
    closeAddonsModal();
}

// عرض الاقتراحات في السلة
function showCartSuggestions(cartContainer) {
    // تحميل الاقتراحات من Firebase
    let suggestions = [];
    try {
        suggestions = JSON.parse(localStorage.getItem('firebaseSuggestions') || '[]');
    } catch (e) {
        console.warn('خطأ في تحليل الاقتراحات من localStorage');
        suggestions = [];
    }
    
    const activeSuggestions = suggestions.filter(s => s.active !== false && s.visible !== false);
    
    if (activeSuggestions.length === 0) {
        console.log('لا توجد اقتراحات نشطة');
        return;
    }
    
    console.log('🛒 عرض', activeSuggestions.length, 'اقتراح في السلة');
    
    // إنشاء ID فريد للسلايدر
    const sliderId = 'suggestions-slider-' + Date.now();
    
    // إضافة قسم الاقتراحات بدون أزرار التحكم في أول العربة
    const suggestionsHtml = `
        <div class="cart-suggestions">
            <h4><i class="fas fa-lightbulb"></i> اقتراحات لك</h4>
            <div class="suggestions-container">
                <div class="suggestions-slider" id="${sliderId}">
                    ${activeSuggestions.map(suggestion => `
                        <div class="suggestion-card" onclick="addSuggestionToCart('${suggestion.id}', '${suggestion.name}', ${suggestion.price}, '${suggestion.image || 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg'}')">
                            <img src="${suggestion.image || 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg'}" alt="${suggestion.name}" onerror="this.src='img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg'">
                            <div class="suggestion-info">
                                <h5>${suggestion.name}</h5>
                                <p class="suggestion-price">${suggestion.price} ج.م</p>
                                <button class="btn-add-suggestion">
                                    <i class="fas fa-plus"></i> أضف
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    cartContainer.innerHTML = suggestionsHtml;
}

// إضافة اقتراح للسلة
function addSuggestionToCart(suggestionId, suggestionName, suggestionPrice, suggestionImg) {
    console.log('🛒 إضافة اقتراح للسلة:', suggestionName);
    
    // إضافة الاقتراح كمنتج عادي
    addToCartDirect(suggestionId, suggestionName, suggestionPrice, suggestionImg, []);
    
    // إظهار رسالة نجاح
    showQuickMessage(`تم إضافة ${suggestionName} للسلة!`);
}

// عرض رسالة سريعة
function showQuickMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'quick-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 2000);
}

// تحديث فوري للسلة مع الاقتراحات
function updateCartInstant() {
    const totalCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartData.reduce((sum, item) => {
        const itemPrice = item.totalPrice || item.price;
        return sum + (itemPrice * item.quantity);
    }, 0);
    
    // تحديث العدادات فوراً
    document.querySelectorAll('.count_item_cart, .count_item_heater, .count_item_header').forEach(el => {
        el.textContent = totalCount;
    });
    
    document.querySelectorAll('.price_cart_total').forEach(el => {
        el.innerHTML = `LE:${totalPrice.toFixed(2)}`;
    });
    
    // تحديث محتويات السلة
    const cartContainer = document.getElementById('cart_items');
    if (cartContainer) {
        cartContainer.innerHTML = '';
        
        // إضافة الاقتراحات في الأول إذا كانت السلة تحتوي على منتجات
        if (cartData.length > 0) {
            showCartSuggestions(cartContainer);
        }
        
        cartData.forEach((item, index) => {
            const itemPrice = item.totalPrice || item.price;
            const itemTotal = itemPrice * item.quantity;
            
            // عرض الإضافات
            let addonsHtml = '';
            if (item.addons && item.addons.length > 0) {
                addonsHtml = `
                    <div class="order-addons">
                        <div class="addon-list">
                            ${item.addons.map(addon => `<span class="addon-tag">${addon.name} (+${addon.price} ج.م)</span>`).join('')}
                        </div>
                    </div>
                `;
            }
            
            cartContainer.innerHTML += `
                <div class="item_cart">
                    <img src="${item.img}" alt="">
                    <div class="content">
                        <h4>${item.name}</h4>
                        ${addonsHtml}
                        <p class="price_cart">LE:${itemTotal.toFixed(2)}</p>
                        <div class="quantity_control">
                            <button onclick="changeQuantityInstant(${index}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button onclick="changeQuantityInstant(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button onclick="removeInstant(${index})"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        });
    }
    
    // تحديث صفحة الطلب
    const checkoutContainer = document.getElementById('checkout_items');
    if (checkoutContainer) {
        checkoutContainer.innerHTML = '';
        cartData.forEach((item, index) => {
            const itemPrice = item.totalPrice || item.price;
            const itemTotal = itemPrice * item.quantity;
            
            // عرض الإضافات في صفحة الطلب
            let addonsHtml = '';
            if (item.addons && item.addons.length > 0) {
                addonsHtml = `
                    <div class="order-addons">
                        <div class="addon-list">
                            ${item.addons.map(addon => `<span class="addon-tag">${addon.name} (+${addon.price} ج.م)</span>`).join('')}
                        </div>
                        <div class="addons-total">إضافات: +${item.addons.reduce((sum, addon) => sum + addon.price, 0)} ج.م</div>
                    </div>
                `;
            }
            
            checkoutContainer.innerHTML += `
                <div class="item_cart">
                    <div class="image_name">
                        <img src="${item.img}" alt="">
                        <div class="content">
                            <h4>${item.name}</h4>
                            ${addonsHtml}
                            <p class="price_cart">LE:${itemTotal.toFixed(2)}</p>
                            <div class="quantity_control">
                                <button onclick="changeQuantityInstant(${index}, -1)">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="changeQuantityInstant(${index}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                    <button onclick="removeInstant(${index})"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        });
        
        // تحديث الإجماليات في صفحة الطلب
        const subtotal = document.querySelector(".subtotal_chekout");
        const total = document.querySelector(".total_chekout");
        if (subtotal) subtotal.innerHTML = `LE:${totalPrice.toFixed(2)}`;
        if (total) total.innerHTML = `LE:${totalPrice.toFixed(2)}`;
    }
}

// تحديث الزر فوراً
function updateButtonInstant(productId, inCart) {
    document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`).forEach(button => {
        if (inCart) {
            button.classList.add('active');
            button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> في السلة';
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> أضف للسلة';
        }
    });
}

// تغيير الكمية فوراً
function changeQuantityInstant(index, change) {
    if (cartData[index]) {
        cartData[index].quantity += change;
        if (cartData[index].quantity <= 0) {
            const productId = cartData[index].id;
            cartData.splice(index, 1);
            updateButtonInstant(productId, false);
        }
        localStorage.setItem('cart', JSON.stringify(cartData));
        window.cartData = cartData;
        updateCartInstant();
    }
}

// حذف فوري
function removeInstant(index) {
    if (cartData[index]) {
        const productId = cartData[index].id;
        cartData.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartData));
        window.cartData = cartData;
        updateCartInstant();
        updateButtonInstant(productId, false);
    }
}

// إعداد الأزرار للعمل المباشر
function setupDirectButtons() {
    console.log('🔧 إعداد الأزرار المباشرة...');
    
    document.querySelectorAll('.btn_add_cart').forEach(button => {
        const productId = button.getAttribute('data-id');
        if (!productId) return;
        
        // إزالة المستمعات القديمة
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // إضافة المستمع المباشر
        newButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🛒 نقرة مباشرة على المنتج:', productId);
            
            // البحث عن بيانات المنتج من مصادر متعددة
            let product = null;
            
            // البحث في Firebase أولاً
            const firebaseProducts = JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
            product = firebaseProducts.find(p => String(p.id) === String(productId));
            
            if (!product) {
                // البحث في Dashboard
                const dashboardProducts = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
                product = dashboardProducts.find(p => String(p.id) === String(productId));
            }
            
            if (!product) {
                // البحث في Website
                const websiteProducts = JSON.parse(localStorage.getItem('websiteProducts') || '[]');
                product = websiteProducts.find(p => String(p.id) === String(productId));
            }
            
            if (!product) {
                // استخراج من DOM كحل أخير
                const productElement = document.querySelector(`[data-product-id="${productId}"]`);
                if (productElement) {
                    const nameElement = productElement.querySelector('.name_product');
                    const priceElement = productElement.querySelector('.price span');
                    const imgElement = productElement.querySelector('.img_product img');
                    
                    if (nameElement && priceElement) {
                        const productName = nameElement.textContent.trim();
                        const productPrice = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
                        const productImg = imgElement ? imgElement.src : 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg';
                        
                        // استخراج الإضافات من data attribute
                        const addonsData = newButton.getAttribute('data-addons');
                        let addons = [];
                        try {
                            addons = addonsData ? JSON.parse(addonsData) : [];
                        } catch (e) {
                            console.warn('خطأ في تحليل الإضافات:', e);
                            addons = [];
                        }
                        
                        product = {
                            id: productId,
                            name: productName,
                            price: productPrice,
                            img: productImg,
                            images: [productImg],
                            addons: addons
                        };
                    }
                }
            }
            
            if (product) {
                // حساب السعر مع الخصم
                const finalPrice = product.discount > 0 ? 
                    Math.round(product.price - (product.price * product.discount / 100)) : 
                    product.price;
                
                // استخدام الصورة الأولى أو الصورة الافتراضية
                const productImg = (product.images && product.images.length > 0) ? 
                    product.images[0] : 
                    (product.img || 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg');
                
                // فحص وجود إضافات
                if (product.addons && product.addons.length > 0) {
                    // فتح مودال الإضافات
                    openAddonsModal(productId, product.name, finalPrice, productImg, product.addons);
                } else {
                    // إضافة مباشرة بدون إضافات
                    addToCartDirect(productId, product.name, finalPrice, productImg, []);
                }
            } else {
                console.error('❌ لم يتم العثور على المنتج:', productId);
            }
        };
    });
    
    // تحديث حالة الأزرار
    document.querySelectorAll('.btn_add_cart').forEach(button => {
        const productId = button.getAttribute('data-id');
        if (productId) {
            const inCart = cartData.some(item => item.id == productId);
            updateButtonInstant(productId, inCart);
        }
    });
    
    console.log('✅ تم إعداد', document.querySelectorAll('.btn_add_cart').length, 'زر');
}

// تشغيل فوري
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 نظام السلة المباشر - سرعة قصوى');
    
    cartData = JSON.parse(localStorage.getItem('cart')) || [];
    window.cartData = cartData;
    
    // تحديث فوري للسلة
    updateCartInstant();
    
    // إعداد الأزرار فوراً
    setTimeout(() => setupDirectButtons(), 100);
    
    // إعادة الإعداد عند تحميل المنتجات
    document.addEventListener('productsUpdated', () => {
        console.log('🔄 إعادة إعداد الأزرار بعد تحديث المنتجات');
        setTimeout(() => setupDirectButtons(), 200);
    });
    
    // إعادة الإعداد عند تحميل منتجات Firebase
    document.addEventListener('firebaseProductsLoaded', () => {
        console.log('🔄 إعادة إعداد الأزرار بعد تحميل Firebase');
        setTimeout(() => setupDirectButtons(), 200);
    });
    
    // إعادة الإعداد كل ثانيتين للتأكد
    setInterval(() => {
        const buttons = document.querySelectorAll('.btn_add_cart');
        if (buttons.length > 0) {
            setupDirectButtons();
        }
    }, 2000);
    
    // تحديث صفحة الطلب إذا كانت موجودة
    if (document.getElementById('checkout_items')) {
        setTimeout(() => {
            if (window.updateCheckoutItems) {
                window.updateCheckoutItems();
            }
        }, 500);
    }
    
    console.log('✅ جاهز - إضافة مباشرة بدون مودال');
});

// جعل الدوال متاحة عالمياً
window.addToCartDirect = addToCartDirect;
window.updateCartInstant = updateCartInstant;
window.changeQuantityInstant = changeQuantityInstant;
window.removeInstant = removeInstant;
window.updateCart = updateCartInstant;
window.setupDirectButtons = setupDirectButtons;

// إغلاق مودال الإضافات
function closeAddonsModal() {
    const modal = document.querySelector('.addons-modal-backdrop');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// دوال الإضافات
window.openAddonsModal = openAddonsModal;
window.closeAddonsModal = closeAddonsModal;
window.changeModalQuantity = changeModalQuantity;
window.updateModalTotal = updateModalTotal;
window.confirmAddToCart = confirmAddToCart;











