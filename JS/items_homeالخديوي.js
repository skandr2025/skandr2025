// Load products from Firebase
function loadProductsData() {
  console.log('🔄 Loading products data...');
  
  // Try to load from Firebase first
  const firebaseProducts = JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
  const firebaseCategories = JSON.parse(localStorage.getItem('firebaseCategories') || '[]');
  
  console.log('📊 Firebase data found:', {
    firebaseProducts: firebaseProducts.length,
    firebaseCategories: firebaseCategories.length
  });
  
  // Use Firebase products if available
  if (firebaseProducts.length > 0) {
    console.log('✅ Using Firebase products');
    const productsToUse = firebaseProducts.filter(p => p.visible !== false);
    const categoriesToUse = firebaseCategories.filter(c => c.visible !== false);
    displayProductsFromDashboard(productsToUse, categoriesToUse);
  } else {
    console.log('📄 انتظار تحميل البيانات من Firebase...');
    // انتظار تحميل البيانات من Firebase
    setTimeout(loadProductsData, 1000);
  }
}

function displayProductsFromDashboard(products, categories = []) {
  console.log('🎨 Displaying products from dashboard:', products.length);
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Create dynamic category sections
  createDynamicCategorySections(categories, products);
  
  const containers = {
    swiper_items_sale: document.getElementById("swiper_items_sale"),
    swiper_kashri: document.getElementById("swiper_kashri"),
    swiper_kabida: document.getElementById("swiper_kabida"),
    swiper_mix: document.getElementById("swiper_mix"),
    swiper_sweet: document.getElementById("swiper_sweet"),
    swiper_add: document.getElementById("swiper_add"),
    swiper_top: document.getElementById("swiper_top")
  };

  // Add dynamic category containers
  categories.forEach(category => {
    if (category.visible !== false) { // تغيير من active إلى visible
      const containerId = `products_${category.slug}`;
      const container = document.getElementById(containerId);
      if (container) {
        containers[containerId] = container;
      }
    }
  });

  // Clear existing content
  Object.values(containers).forEach(container => {
    if (container) container.innerHTML = '';
  });

  console.log('📦 Processing products:', products.length);
  let productsAdded = 0;

  products.filter(product => product.visible !== false).forEach(product => { // تغيير من active إلى visible
    const isIncart = cart.some(cartItem => cartItem.id === product.id);
    const discountedPrice = product.discount > 0 ? 
      Math.round(product.price - (product.price * product.discount / 100)) : 
      product.price;
    
    const old_price_paragraph = product.discount > 0 ? 
      `<p class="old_price">LE:${product.price}</p>` : "";
    const percent_disc_div = product.discount > 0 ? 
      `<span class="sale_present">%${product.discount}</span>` : "";

    // استخدام الصورة الأولى أو صورة افتراضية
    const productImage = (product.images && product.images.length > 0) ? 
      product.images[0] : 
      'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg';

    const productHTML = `
      <div class="swiper-slide product" id="product-${product.id}" data-product-id="${product.id}">
        ${percent_disc_div}
        <div class="img_product">
          <img src="${productImage}" alt="${product.name}" loading="lazy">
        </div>
        <p class="name_product">${product.name}</p>
        <div class="price">
          <p><span>EGP ${discountedPrice}</span></p>
          ${old_price_paragraph}
        </div>
        ${product.addons && product.addons.length > 0 ? 
          `<div class="product-addons-info">
            <small><i class="fas fa-plus-circle"></i> إضافات متاحة (${product.addons.length})</small>
          </div>` : ''
        }
        <div class="icons">
          <span class="btn_add_cart ${isIncart ? 'active' : ''}" data-id="${product.id}" 
                data-name="${product.name}" 
                data-price="${discountedPrice}" 
                data-img="${productImage}"
                data-addons='${JSON.stringify(product.addons || [])}'>
            <i class="fa-solid fa-cart-shopping"></i> ${isIncart ? 'في السلة' : 'أضف للسلة'}
          </span>
        </div>
      </div>
    `;

    let productAdded = false;

    // Add to sale section if discounted
    if (product.discount > 0 && containers.swiper_items_sale) {
      containers.swiper_items_sale.innerHTML += productHTML;
      productAdded = true;
      productsAdded++;
    }
    
    // Check for dynamic categories first - استخدام category name بدلاً من slug
    const categoryContainer = containers[`products_${product.category.toLowerCase().replace(/\s+/g, '-')}`];
    if (categoryContainer) {
      categoryContainer.innerHTML += productHTML;
      productAdded = true;
      productsAdded++;
    } else {
      // البحث عن المجموعة بالاسم
      const matchingCategory = categories.find(cat => 
        cat.name === product.category || 
        cat.slug === product.category ||
        cat.name.toLowerCase() === product.category.toLowerCase()
      );
      
      if (matchingCategory) {
        const matchingContainer = containers[`products_${matchingCategory.slug}`];
        if (matchingContainer) {
          matchingContainer.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        }
      }
      
      // Fallback to static categories or default
      if (!productAdded) {
        if (product.category === "kashri" && containers.swiper_kashri) {
          containers.swiper_kashri.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else if (product.category === "kabida" || product.category === "كبدة اسكندراني" && containers.swiper_kabida) {
          containers.swiper_kabida.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else if (product.category === "mix" && containers.swiper_mix) {
          containers.swiper_mix.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else if (product.category === "sweet" && containers.swiper_sweet) {
          containers.swiper_sweet.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else if (product.category === "add" && containers.swiper_add) {
          containers.swiper_add.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else if (product.category === "top" && containers.swiper_top) {
          containers.swiper_top.innerHTML += productHTML;
          productAdded = true;
          productsAdded++;
        } else {
          // Default to kabida if no specific category
          if (containers.swiper_kabida) {
            containers.swiper_kabida.innerHTML += productHTML;
            productAdded = true;
            productsAdded++;
          }
        }
      }
    }

    if (!productAdded) {
      console.warn('⚠️ Product not added to any container:', product.name, 'Category:', product.category);
    }
  });

  console.log('✅ Products added to containers:', productsAdded);

  // تحديث إدارة السلة بعد عرض المنتجات - فوراً
  if (window.setupDirectButtons) {
    console.log('🔄 إعداد أزرار السلة المباشرة');
    setTimeout(() => window.setupDirectButtons(), 50);
  }

  // Track product views
  if (window.websiteIntegration) {
    window.websiteIntegration.trackProductViews();
  }
  
  // Refresh product modal data
  if (window.refreshProductData) {
    window.refreshProductData();
  }
  
  console.log('🎯 Products displayed from dashboard:', products.length);
  console.log('📂 Categories displayed:', categories.length);
  
  // Force refresh of any Swiper instances
  setTimeout(() => {
    if (window.Swiper && window.mySwiper) {
      try {
        window.mySwiper.update();
      } catch (e) {
        console.log('Swiper update not needed');
      }
    }
  }, 100);
}

function createDynamicCategorySections(categories, products) {
  const dynamicContainer = document.getElementById('dynamicCategorySections');
  if (!dynamicContainer) return;
  
  // Clear existing dynamic sections
  dynamicContainer.innerHTML = '';
  
  // Create sections for visible categories that have products
  categories.filter(category => category.visible !== false).forEach(category => {
    const categoryProducts = products.filter(product => 
      (product.category === category.name || 
       product.category === category.slug ||
       product.category.toLowerCase() === category.name.toLowerCase()) && 
      product.visible !== false
    );
    
    // Only create section if category has products
    if (categoryProducts.length > 0) {
      const sectionHTML = `
        <div class="category-section-static" data-category="${category.slug}">
          <div class="slide_product mySwiper">
            <div class="tpo_slide">
              <h2>
                <i class="fa-solid fa-utensils"></i>
                ${category.name}
              </h2>
              ${category.desc ? `<p class="category-description">${category.desc}</p>` : ''}
            </div>
            <div class="products swiper-wrapper" id="products_${category.slug}">
              <!-- سيتم إضافة المنتجات هنا ديناميكياً -->
            </div>
          </div>
        </div>
      `;
      
      dynamicContainer.innerHTML += sectionHTML;
    }
  });
  
  console.log('✅ Dynamic category sections created:', categories.filter(c => c.visible !== false).length);
}

// Initialize products loading
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Items home script loaded');
  
  // Wait for Firebase integration to load first
  setTimeout(() => {
    loadProductsData();
  }, 1500);
});

// Listen for Firebase products loaded event
window.addEventListener('firebaseProductsLoaded', (event) => {
  console.log('📢 Firebase products loaded event received');
  setTimeout(() => {
    loadProductsData();
  }, 100);
});

// Listen for product updates from dashboard
document.addEventListener('productsUpdated', (event) => {
  console.log('📢 Products updated event received - reloading...');
  setTimeout(() => {
    loadProductsData();
  }, 100);
});

// Listen for storage changes (from other tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'firebaseProducts' || e.key === 'websiteProducts' || e.key === 'dashboardProducts') {
    console.log('💾 Products updated in storage - reloading...');
    setTimeout(() => {
      loadProductsData();
    }, 100);
  }
});

// Make products data available globally
window.loadProductsData = loadProductsData;

// Function to manually refresh products (can be called from dashboard)
window.refreshWebsiteProducts = function() {
  console.log('🔄 Manual refresh triggered');
  loadProductsData();
};

// Listen for category updates from dashboard
document.addEventListener('categoriesUpdated', function(event) {
  console.log('Categories updated, refreshing display');
  loadProductsData();
});

// Function to refresh categories display
function refreshCategoriesDisplay() {
  loadProductsData();
}

// Make refresh function globally available
window.refreshCategoriesDisplay = refreshCategoriesDisplay;

