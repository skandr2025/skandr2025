// 🔥 Firebase Website Integration - Load Products and Categories
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCbgntmD4nhYmR4RLSJHIhlik5TG0H0gs",
    authDomain: "dashboard-skandr.firebaseapp.com",
    projectId: "dashboard-skandr",
    storageBucket: "dashboard-skandr.firebasestorage.app",
    messagingSenderId: "875308290353",
    appId: "1:875308290353:web:952296a93bb4b9b7d5a010"
};

// Initialize Firebase for website
let websiteDB;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    websiteDB = firebase.firestore();
    console.log('✅ Firebase initialized for website');
} catch (error) {
    console.error('❌ Firebase initialization failed for website:', error);
}

// Load products from Firebase and integrate with existing website
async function loadProductsFromFirebase() {
    try {
        if (!websiteDB) {
            console.log('Firebase not available, using fallback products');
            return;
        }

        console.log('📥 Loading products from Firebase...');
        
        const snapshot = await websiteDB.collection('products').where('visible', '==', true).get();
        const firebaseProducts = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseProducts.push({
                id: doc.id,
                name: data.name,
                price: data.price,
                discount: data.discount || 0,
                category: data.category,
                desc: data.desc || '',
                images: data.images || ['img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg'], // fallback image
                visible: data.visible
            });
        });

        if (firebaseProducts.length > 0) {
            // Store in localStorage for other scripts to use
            localStorage.setItem('firebaseProducts', JSON.stringify(firebaseProducts));
            localStorage.setItem('websiteProducts', JSON.stringify(firebaseProducts)); // للتوافق مع items_home
            localStorage.setItem('dashboardProducts', JSON.stringify(firebaseProducts)); // للتوافق مع items_home
            
            // Update global products array if it exists
            if (window.products) {
                window.products = firebaseProducts;
            }
            
            // Make products available globally for other scripts
            window.websiteProducts = firebaseProducts;
            window.firebaseProducts = firebaseProducts;
            
            // Trigger custom event for other scripts
            window.dispatchEvent(new CustomEvent('firebaseProductsLoaded', { 
                detail: firebaseProducts 
            }));
            
            // Trigger products updated event for items_home
            document.dispatchEvent(new CustomEvent('productsUpdated', {
                detail: { products: firebaseProducts }
            }));
            
            console.log(`✅ Loaded ${firebaseProducts.length} products from Firebase`);
            
            // Re-render products if the function exists
            if (window.loadProductsData) {
                setTimeout(() => {
                    window.loadProductsData();
                }, 500);
            }
            
            return firebaseProducts;
        } else {
            console.log('No products found in Firebase');
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error loading products from Firebase:', error);
        return [];
    }
}

// Load categories from Firebase
async function loadCategoriesFromFirebase() {
    try {
        if (!websiteDB) return [];

        console.log('📥 Loading categories from Firebase...');
        
        const snapshot = await websiteDB.collection('categories').where('visible', '==', true).get();
        const firebaseCategories = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseCategories.push({
                id: doc.id,
                name: data.name,
                slug: data.slug,
                desc: data.desc || '',
                visible: data.visible
            });
        });

        if (firebaseCategories.length > 0) {
            localStorage.setItem('firebaseCategories', JSON.stringify(firebaseCategories));
            localStorage.setItem('websiteCategories', JSON.stringify(firebaseCategories)); // للتوافق مع items_home
            localStorage.setItem('dashboardCategories', JSON.stringify(firebaseCategories)); // للتوافق مع items_home
            
            if (window.categories) {
                window.categories = firebaseCategories;
            }
            
            // Make categories available globally for other scripts
            window.websiteCategories = firebaseCategories;
            window.firebaseCategories = firebaseCategories;
            
            window.dispatchEvent(new CustomEvent('firebaseCategoriesLoaded', { 
                detail: firebaseCategories 
            }));
            
            // Trigger categories updated event for items_home
            document.dispatchEvent(new CustomEvent('categoriesUpdated', {
                detail: { categories: firebaseCategories }
            }));
            
            console.log(`✅ Loaded ${firebaseCategories.length} categories from Firebase`);
            return firebaseCategories;
        }
        
    } catch (error) {
        console.error('❌ Error loading categories from Firebase:', error);
        return [];
    }
}

// Load stores from Firebase
async function loadStoresFromFirebase() {
    try {
        if (!websiteDB) return [];

        console.log('📥 Loading stores from Firebase...');
        
        const snapshot = await websiteDB.collection('stores').where('visible', '==', true).get();
        const firebaseStores = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseStores.push({
                id: doc.id,
                name: data.name,
                phone: data.phone,
                address: data.address,
                image: data.image || 'img/icon.JPG',
                visible: data.visible,
                active: data.visible // للتوافق مع branches integration
            });
        });

        if (firebaseStores.length > 0) {
            localStorage.setItem('firebaseStores', JSON.stringify(firebaseStores));
            localStorage.setItem('websiteBranches', JSON.stringify(firebaseStores)); // للتوافق مع branches_integration
            localStorage.setItem('dashboardBranches', JSON.stringify(firebaseStores)); // للتوافق مع branches_integration
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('firebaseStoresLoaded', { 
                detail: firebaseStores 
            }));
            
            // Trigger branches updated event for branches_integration
            document.dispatchEvent(new CustomEvent('branchesUpdated', {
                detail: { branches: firebaseStores }
            }));
            
            console.log(`✅ Loaded ${firebaseStores.length} stores from Firebase`);
            
            // Refresh branches display if function exists
            if (window.refreshBranchesData) {
                setTimeout(() => {
                    window.refreshBranchesData();
                }, 500);
            }
            
            return firebaseStores;
        }
        
    } catch (error) {
        console.error('❌ Error loading stores from Firebase:', error);
        return [];
    }
}

// Load delivery areas from Firebase
async function loadDeliveryAreasFromFirebase() {
    try {
        if (!websiteDB) return [];

        const snapshot = await websiteDB.collection('deliveryAreas').where('active', '==', true).get();
        const deliveryAreas = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            deliveryAreas.push({
                id: doc.id,
                name: data.name,
                fee: data.fee || 0,
                desc: data.desc || '',
                active: data.active
            });
        });

        localStorage.setItem('firebaseDeliveryAreas', JSON.stringify(deliveryAreas));
        console.log(`✅ Loaded ${deliveryAreas.length} delivery areas from Firebase`);
        return deliveryAreas;
        
    } catch (error) {
        console.error('❌ Error loading delivery areas from Firebase:', error);
        return [];
    }
}

// Load suggestions from Firebase
async function loadSuggestionsFromFirebase() {
    try {
        if (!websiteDB) return [];

        console.log('📥 Loading suggestions from Firebase...');
        
        const snapshot = await websiteDB.collection('suggestions').where('active', '==', true).get();
        const firebaseSuggestions = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseSuggestions.push({
                id: doc.id,
                name: data.name,
                price: data.price || 0,
                desc: data.desc || '',
                image: data.image || 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg',
                active: data.active,
                visible: data.active // للتوافق
            });
        });

        if (firebaseSuggestions.length > 0) {
            localStorage.setItem('firebaseSuggestions', JSON.stringify(firebaseSuggestions));
            localStorage.setItem('websiteSuggestions', JSON.stringify(firebaseSuggestions));
            
            // Make suggestions available globally
            window.firebaseSuggestions = firebaseSuggestions;
            
            window.dispatchEvent(new CustomEvent('firebaseSuggestionsLoaded', { 
                detail: firebaseSuggestions 
            }));
            
            console.log(`✅ Loaded ${firebaseSuggestions.length} suggestions from Firebase`);
            return firebaseSuggestions;
        } else {
            console.log('No suggestions found in Firebase');
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error loading suggestions from Firebase:', error);
        return [];
    }
}

// Initialize Firebase data loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Initializing Firebase website integration...');
    initializeFirebaseData();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeFirebaseData();
    });
} else {
    // DOM is already loaded
    setTimeout(() => {
        initializeFirebaseData();
    }, 100);
}

async function initializeFirebaseData() {
    // Load all data
    setTimeout(async () => {
        console.log('🔄 بدء تحميل البيانات من Firebase...');
        
        await Promise.all([
            loadProductsFromFirebase(),
            loadCategoriesFromFirebase(),
            loadStoresFromFirebase(),
            loadDeliveryAreasFromFirebase(),
            loadSuggestionsFromFirebase()
        ]);
        
        console.log('✅ Firebase website integration complete');
        
        // إعادة إعداد أزرار السلة بعد تحميل المنتجات
        setTimeout(() => {
            if (window.setupCartButtons) {
                console.log('🔄 إعادة إعداد أزرار السلة بعد تحميل Firebase');
                window.setupCartButtons();
            }
        }, 500);
        
    }, 500); // Wait for other scripts to load
}

// Global functions for other scripts to use
window.getFirebaseProducts = function() {
    return JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
};

window.getFirebaseCategories = function() {
    return JSON.parse(localStorage.getItem('firebaseCategories') || '[]');
};

window.getFirebaseStores = function() {
    return JSON.parse(localStorage.getItem('firebaseStores') || '[]');
};

window.getFirebaseDeliveryAreas = function() {
    return JSON.parse(localStorage.getItem('firebaseDeliveryAreas') || '[]');
};

window.getFirebaseSuggestions = function() {
    return JSON.parse(localStorage.getItem('firebaseSuggestions') || '[]');
};

// Refresh Firebase data
window.refreshFirebaseData = async function() {
    console.log('🔄 Refreshing Firebase data...');
    await Promise.all([
        loadProductsFromFirebase(),
        loadCategoriesFromFirebase(),
        loadStoresFromFirebase(),
        loadDeliveryAreasFromFirebase(),
        loadSuggestionsFromFirebase()
    ]);
    console.log('✅ Firebase data refreshed');
};
