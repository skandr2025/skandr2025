document.addEventListener("DOMContentLoaded", function () {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCCbgntmD4nhYmR4RLSJHIhlik5TG0H0gs",
        authDomain: "dashboard-skandr.firebaseapp.com",
        projectId: "dashboard-skandr",
        storageBucket: "dashboard-skandr.firebasestorage.app",
        messagingSenderId: "875308290353",
        appId: "1:875308290353:web:952296a93bb4b9b7d5a010"
    };

    // Initialize Firebase
    let db;
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        console.log('✅ Firebase initialized for checkout');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
    }
    
    const form = document.getElementById("form_contact");
    const addressInput = document.getElementById("Address");
    const areaSelect = document.getElementById("Area");
    const subtotalPriceElement = document.querySelector(".subtotal_chekout");
    const servicePriceElement = document.querySelector(".service_price");
    const finalTotalPriceElement = document.querySelector(".total_chekout");

    // الحقول المخفية
    const serviceChargeInput = document.getElementById("service_charge_input");
    const productsInput = document.getElementById("products_input");
    const totalPriceInput = document.getElementById("total_price_input");

    // Load delivery areas from Firebase
    loadDeliveryAreasFromFirebase();

    async function loadDeliveryAreasFromFirebase() {
        try {
            if (!db) {
                console.log('Firebase not available, using fallback areas');
                loadFallbackAreas();
                return;
            }

            const snapshot = await db.collection('deliveryAreas').where('active', '==', true).get();
            const deliveryAreas = [];
            
            snapshot.forEach(doc => {
                deliveryAreas.push({ id: doc.id, ...doc.data() });
            });

            if (deliveryAreas.length > 0) {
                // احتفظ بالخيار الأول وأضف المناطق
                populateDeliveryAreas(deliveryAreas);
                console.log(`✅ Loaded ${deliveryAreas.length} delivery areas from Firebase`);
            } else {
                loadFallbackAreas();
            }
        } catch (error) {
            console.error('❌ Error loading delivery areas:', error);
            loadFallbackAreas();
        }
    }

    function populateDeliveryAreas(areas) {
        // احفظ الخيار الأول
        const firstOption = areaSelect.querySelector('option[value=""]');
        const selectedValue = areaSelect.value; // احفظ القيمة المختارة
        
        // امسح كل الخيارات
        areaSelect.innerHTML = '';
        
        // أعد إضافة الخيار الأول
        if (firstOption) {
            areaSelect.appendChild(firstOption.cloneNode(true));
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- اختر المنطقة --';
            areaSelect.appendChild(defaultOption);
        }
        
        // أضف المناطق
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.name;
            option.textContent = `${area.name} – ${area.fee} ج.م`;
            option.dataset.fee = area.fee;
            areaSelect.appendChild(option);
        });
        
        // استعد القيمة المختارة إن وجدت
        if (selectedValue) {
            areaSelect.value = selectedValue;
        }
    }

    function loadFallbackAreas() {
        // Fallback delivery areas if Firebase fails
        const fallbackAreas = [
            { name: 'الإسكندرية - وسط البلد', fee: 10 },
            { name: 'الإسكندرية - المنتزه', fee: 15 },
            { name: 'الإسكندرية - العجمي', fee: 20 },
            { name: 'الإسكندرية - برج العرب', fee: 25 }
        ];

        populateDeliveryAreas(fallbackAreas);
        console.log('✅ Loaded fallback delivery areas');
    }

    function getDeliveryFee() {
        const selectedOption = areaSelect.options[areaSelect.selectedIndex];
        return selectedOption ? parseFloat(selectedOption.dataset.fee || 0) : 0;
    }

    function updateFinalPrice() {
        const subtotalText = subtotalPriceElement.textContent.replace('LE:', '').replace('ج.م:', '').trim();
        const subtotal = parseFloat(subtotalText) || 0;

        const deliveryFee = getDeliveryFee();
        servicePriceElement.textContent = `ج.م:${deliveryFee.toFixed(2)}`;

        const finalTotal = subtotal + deliveryFee;
        finalTotalPriceElement.textContent = `ج.م:${finalTotal.toFixed(2)}`;

        // Update hidden inputs
        if (serviceChargeInput) serviceChargeInput.value = deliveryFee.toFixed(2);
        if (totalPriceInput) totalPriceInput.value = finalTotal.toFixed(2);
    }

    // Event listener for area selection change
    if (areaSelect) {
        areaSelect.addEventListener('change', updateFinalPrice);
    }

    // Initial price update
    updateFinalPrice();

    // Form submission
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            try {
                // Show loading
                submitButton.textContent = 'جاري الإرسال...';
                submitButton.disabled = true;

                // Collect form data
                const formData = new FormData(form);
                
                // Get cart items from localStorage or global variable
                let cartItems = [];
                try {
                    cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
                } catch (e) {
                    console.warn('Could not parse cart items from localStorage');
                }
                
                // Calculate totals - مع الإضافات
                const subtotal = cartItems.reduce((sum, item) => {
                    const itemPrice = item.totalPrice || item.price;
                    return sum + (itemPrice * item.quantity);
                }, 0);
                const deliveryFee = getDeliveryFee();
                const total = subtotal + deliveryFee;

                const orderData = {
                    // Customer info
                    customerName: formData.get('Name') || '',
                    phone: '0' + (formData.get('Phone') || '').replace(/^0+/, ''), // Ensure leading 0
                    area: formData.get('Area') || '',
                    address: formData.get('Address') || '',
                    
                    // Order details - تحويل المنتجات إلى تنسيق مناسب للطلب مع الإضافات
                    products: cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.img || item.images?.[0] || 'img/default.jpg',
                        category: item.category || 'غير محدد',
                        addons: item.addons || [], // إضافة الإضافات
                        totalPrice: item.totalPrice || item.price // السعر الإجمالي مع الإضافات
                    })),
                    productsTotal: subtotal,
                    serviceCharge: deliveryFee,
                    total: total,
                    
                    // Order metadata
                    status: 'جديد',
                    orderDate: new Date().toISOString(),
                    createdAt: new Date()
                };

                console.log('📦 Submitting order to Firebase:', orderData);

                // Submit to Firebase
                if (db) {
                    const orderId = Date.now().toString();
                    const orderDoc = {
                        ...orderData,
                        orderID: orderId,
                        id: orderId
                    };

                    await db.collection('orders').doc(orderId).set(orderDoc);
                    
                    console.log('✅ Order submitted to Firebase successfully');
                    
                    // Show success message
                    alert('تم إرسال طلبك بنجاح! رقم الطلب: ' + orderId + '\nسيتم التواصل معك قريباً.');
                    
                    // Clear cart and reset form
                    localStorage.removeItem('cart'); // تغيير من cartItems إلى cart
                    form.reset();
                    updateFinalPrice();
                    
                    // Update cart display
                    if (window.cartManager) {
                        window.cartManager.clearCart();
                    } else if (window.updateCartDisplay) {
                        window.updateCartDisplay();
                    }
                    
                    // Redirect to home page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    
                } else {
                    throw new Error('Firebase not available');
                }

            } catch (error) {
                console.error('❌ Error submitting order:', error);
                alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.\nالخطأ: ' + error.message);
            } finally {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // Load products from Firebase for the website
    async function loadProductsFromFirebase() {
        try {
            if (!db) return;

            const snapshot = await db.collection('products').where('visible', '==', true).get();
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });

            // Store products in localStorage for the website to use
            localStorage.setItem('firebaseProducts', JSON.stringify(products));
            console.log(`✅ Loaded ${products.length} products from Firebase`);

            // Trigger custom event to notify other scripts
            window.dispatchEvent(new CustomEvent('productsLoaded', { detail: products }));

        } catch (error) {
            console.error('❌ Error loading products:', error);
        }
    }

    // Load categories from Firebase
    async function loadCategoriesFromFirebase() {
        try {
            if (!db) return;

            const snapshot = await db.collection('categories').where('visible', '==', true).get();
            const categories = [];
            
            snapshot.forEach(doc => {
                categories.push({ id: doc.id, ...doc.data() });
            });

            // Store categories in localStorage
            localStorage.setItem('firebaseCategories', JSON.stringify(categories));
            console.log(`✅ Loaded ${categories.length} categories from Firebase`);

            // Trigger custom event
            window.dispatchEvent(new CustomEvent('categoriesLoaded', { detail: categories }));

        } catch (error) {
            console.error('❌ Error loading categories:', error);
        }
    }

    // Load all data on page load
    loadProductsFromFirebase();
    loadCategoriesFromFirebase();
    loadSuggestionsFromFirebase();
});

// Load suggestions from Firebase for checkout
async function loadSuggestionsFromFirebase() {
    try {
        if (!db) return;

        const snapshot = await db.collection('suggestions').where('active', '==', true).get();
        const suggestions = [];
        
        snapshot.forEach(doc => {
            suggestions.push({ id: doc.id, ...doc.data() });
        });

        // Store suggestions in localStorage
        localStorage.setItem('firebaseSuggestions', JSON.stringify(suggestions));
        console.log(`✅ Loaded ${suggestions.length} suggestions from Firebase`);

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('suggestionsLoaded', { detail: suggestions }));

    } catch (error) {
        console.error('❌ Error loading suggestions:', error);
    }
}

// Global function to get products from Firebase (for other scripts)
window.getFirebaseProducts = function() {
    return JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
};

// Global function to get categories from Firebase (for other scripts)
window.getFirebaseCategories = function() {
    return JSON.parse(localStorage.getItem('firebaseCategories') || '[]');
};

// Global function to get suggestions from Firebase (for other scripts)
window.getFirebaseSuggestions = function() {
    return JSON.parse(localStorage.getItem('firebaseSuggestions') || '[]');
};

