/*! Product Quick-View + Variants (كشري الخديوي)
 *  - Opens instead of direct add-to-cart
 *  - color filters images, pick size, qty
 *  - Confirm adds to existing cart format + options
 *  - Does NOT modify old files; uses capture-phase to intercept clicks
 */

(function () {
  // استخدام Firebase بدلاً من JSON
  const PRODUCTS_SOURCE = 'firebase';

  let _allProducts = null;

  // تحميل المنتجات من Firebase
  function loadProducts() {
    if (window.websiteProducts && window.websiteProducts.length > 0) {
      _allProducts = window.websiteProducts;
      console.log('✅ تم تحميل المنتجات من Firebase للمودال:', _allProducts.length);
      return Promise.resolve(_allProducts);
    } else {
      // انتظار تحميل البيانات
      return new Promise((resolve) => {
        const checkData = () => {
          if (window.websiteProducts && window.websiteProducts.length > 0) {
            _allProducts = window.websiteProducts;
            resolve(_allProducts);
          } else {
            setTimeout(checkData, 100);
          }
        };
        checkData();
      });
    }
  }
  let _scrollY = 0;

  // Function to refresh product data (called when dashboard updates)
  window.refreshProductData = function() {
    _allProducts = null; // Clear cache to force reload
    console.log('Product data cache cleared - will reload on next modal open');
  };

  // Listen for storage changes to refresh data
  window.addEventListener('storage', function(e) {
    if (e.key === 'websiteProducts') {
      window.refreshProductData();
    }
  });

  // Also listen for custom events from dashboard and Firebase
  document.addEventListener('productsUpdated', function() {
    window.refreshProductData();
  });
  
  document.addEventListener('firebaseProductsLoaded', function() {
    window.refreshProductData();
  });

  // 🚫 MODAL DISABLED FOR SPEED - Direct cart addition only
  // The modal system is disabled to allow instant cart addition
  // User requested maximum speed without modal popup
  console.log('🚫 Modal system disabled - using direct cart addition for speed');

  async function ensureData() {
    if (_allProducts) return _allProducts;
    
    console.log('🔄 Loading product data for modal...');
    
    // Try to load from localStorage first (Firebase products) - أسرع
    const firebaseProducts = JSON.parse(localStorage.getItem('firebaseProducts') || '[]');
    if (firebaseProducts.length > 0) {
      console.log('✅ Loading products from Firebase for modal:', firebaseProducts.length);
      _allProducts = firebaseProducts.filter(p => p.visible !== false);
      return _allProducts;
    }
    
    const dashboardProducts = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
    if (dashboardProducts.length > 0) {
      console.log('✅ Loading products from dashboard for modal:', dashboardProducts.length);
      _allProducts = dashboardProducts.filter(p => p.active);
      return _allProducts;
    }
    
    const websiteProducts = JSON.parse(localStorage.getItem('websiteProducts') || '[]');
    if (websiteProducts.length > 0) {
      console.log('✅ Loading products from website storage for modal:', websiteProducts.length);
      _allProducts = websiteProducts;
      return _allProducts;
    }
    
    // Fallback to JSON file - أبطأ خيار
    try {
      console.log('📄 Loading products from Firebase for modal...');
      return await loadProducts();
    } catch (error) {
      console.error('❌ Error loading products:', error);
      _allProducts = [];
      return _allProducts;
    }
  }

  async function openQuickView(productId) {
    // تحميل البيانات بسرعة
    const products = await ensureData();
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    _scrollY = window.scrollY;

    // إنشاء وعرض المودال فوراً
    const modal = buildModal(product);
    document.body.appendChild(modal.backdrop);
    
    // عرض المودال بسرعة - بدون setTimeout
    modal.backdrop.classList.add('active');
  }

  function buildModal(product) {
    const backdrop = document.createElement('div');
    backdrop.className = 'khed-modal-backdrop';
    backdrop.innerHTML = `
      <div class="khed-modal" role="dialog" aria-modal="true">
        <button class="khed-close" aria-label="Close">&times;</button>
        <div class="khed-modal__left">
          <div class="khed-modal__thumbs"></div>
          <div class="khed-modal__stage"><img alt=""></div>
        </div>
        <div class="khed-modal__right">
          <h3 class="khed-title">${escapeHtml(product.name || '')}</h3>
          <div class="khed-price">
            <span class="now">LE ${Number(product.price || 0).toFixed(2)}</span>
            ${product.old_price ? `<span class="old">LE ${Number(product.old_price).toFixed(2)}</span>` : ''}
          </div>
          <p class="khed-desc">${escapeHtml(product.desc || 'بدون وصف للمنتج')}</p>

          <div class="khed-options">
            <div class="khed-option-group khed-colors" style="display:none">
              <div class="khed-option-label">اللون</div>
              <div class="khed-color-pills"></div>
            </div>
            <div class="khed-option-group khed-sizes" style="display:none">
              <div class="khed-option-label">المقاس</div>
              <div class="khed-size-pills"></div>
            </div>
            <div class="khed-option-group khed-qty">
              <div class="khed-option-label">الكمية</div>
              <button type="button" data-act="dec">-</button>
              <input type="number" min="1" step="1" value="1">
              <button type="button" data-act="inc">+</button>
            </div>
          </div>

          <div class="khed-actions">
            <button class="khed-btn" data-act="confirm">تأكيد</button>
            <button class="khed-btn secondary" data-act="إلغاء">إلغاء</button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      // إغلاق سريع بدون انتظار
      backdrop.classList.remove('active');
      // تقليل وقت الانتظار من 180ms إلى 100ms
      setTimeout(() => {
        if (backdrop.parentNode) {
          backdrop.remove();
        }
        window.scrollTo({ top: _scrollY });
      }, 100);
    };

    const modalEl = backdrop.querySelector('.khed-modal');
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) close();
    });
    backdrop.querySelector('.khed-close').addEventListener('click', close);
    backdrop.querySelector('[data-act="إلغاء"]').addEventListener('click', close);

    // Options: colors & sizes (backward compatible)
    const colorsWrap = backdrop.querySelector('.khed-colors');
    const sizesWrap  = backdrop.querySelector('.khed-sizes');
    const colorPills = backdrop.querySelector('.khed-color-pills');
    const sizePills  = backdrop.querySelector('.khed-size-pills');
    const qtyInput   = backdrop.querySelector('.khed-qty input');

    // Collect variants if present
    const variants = product.variants || {};
    const colors = Array.isArray(variants.colors) ? variants.colors : [];
    const sizes = Array.isArray(variants.sizes) ? variants.sizes : [];

    let selectedColor = colors.length ? (colors.find(c=>c.default) || colors[0]) : null;
    let selectedSize  = sizes.length ? (sizes.find(s=>s.default) || sizes[0]) : null;

    // Build color pills
    if (colors.length) {
      colorsWrap.style.display = 'grid';
      colors.forEach((c, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'khed-pill';
        if (c.hex) { pill.setAttribute('data-color', c.hex); pill.style.background = c.hex; pill.title = c.name || ''; }
        else { pill.textContent = c.name || '—'; }
        if (idx === 0 || c === selectedColor) pill.classList.add('active');
        pill.addEventListener('click', () => {
          colorPills.querySelectorAll('.khed-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          selectedColor = c;
          refreshImages();
        });
        colorPills.appendChild(pill);
      });
    }

    // Build size pills
    if (sizes.length) {
      sizesWrap.style.display = 'grid';
      sizes.forEach((s, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'khed-pill';
        pill.textContent = typeof s === 'string' ? s : (s.label || s.value || '—');
        if (idx === 0 || s === selectedSize) pill.classList.add('active');
        pill.addEventListener('click', () => {
          sizePills.querySelectorAll('.khed-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          selectedSize = s;
        });
        sizePills.appendChild(pill);
      });
    }

    // Quantity
    modalEl.querySelector('.khed-qty').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-act]'); if (!btn) return;
      const act = btn.getAttribute('data-act');
      const v = Math.max(1, parseInt(qtyInput.value || '1', 10));
      qtyInput.value = String(act === 'inc' ? v + 1 : Math.max(1, v - 1));
    });

    // Images
    const stageImg = backdrop.querySelector('.khed-modal__stage img');
    const thumbs = backdrop.querySelector('.khed-modal__thumbs');
    function currentImages() {
      if (selectedColor && Array.isArray(selectedColor.images) && selectedColor.images.length) {
        return selectedColor.images;
      }
      if (Array.isArray(product.images) && product.images.length) return product.images;
      return [product.img].filter(Boolean);
    }
    function refreshImages() {
      const imgs = currentImages();
      thumbs.innerHTML = '';
      imgs.forEach((src, idx) => {
        const t = document.createElement('img');
        t.src = src;
        if (idx === 0) t.classList.add('active');
        t.addEventListener('click', () => {
          thumbs.querySelectorAll('img').forEach(x => x.classList.remove('active'));
          t.classList.add('active');
          stageImg.src = src;
        });
        thumbs.appendChild(t);
      });
      stageImg.src = imgs[0] || '';
    }
    refreshImages();

    // Confirm add - محسن للسرعة
    modalEl.querySelector('[data-act="confirm"]').addEventListener('click', () => {
      const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
      const imgs = currentImages();
      const primaryImage = imgs && imgs.length ? imgs[0] : (product.img || '');
      
      // إضافة للسلة فوراً
      addToCartWithOptions(product, {
        color: selectedColor ? (selectedColor.value || selectedColor.hex || selectedColor.name) : null,
        colorLabel: selectedColor ? (selectedColor.name || selectedColor.value || selectedColor.hex) : null,
        size: selectedSize ? (selectedSize.value || selectedSize) : null,
        sizeLabel: selectedSize ? (selectedSize.label || selectedSize.value || selectedSize) : null,
        images: imgs,
        primaryImage: primaryImage
      }, qty);
      
      // إغلاق المودال فوراً
      close();
    });

    return { backdrop };
  }

  function addToCartWithOptions(product, opts, qty) {
    console.log('🛒 إضافة فورية للسلة:', product.name);
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Try to merge with existing same product+options
    const keyMatch = (it) =>
      String(it.id) === String(product.id) &&
      String(it.selectedColor || '') === String(opts.color || '') &&
      String(it.selectedSize || '') === String(opts.size || '');

    const existing = cart.find(keyMatch);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
    } else {
      // Create cart item with proper structure
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.discount > 0 ? 
          Math.round(product.price - (product.price * product.discount / 100)) : 
          product.price,
        img: (opts && opts.primaryImage) ? opts.primaryImage : (product.images && product.images[0] ? product.images[0] : product.img || ''),
        quantity: qty,
        selectedColor: opts.color,
        selectedColorLabel: opts.colorLabel,
        selectedSize: opts.size,
        selectedSizeLabel: opts.sizeLabel,
        images: Array.isArray(opts.images) ? opts.images : (product.images || [product.img].filter(Boolean)),
        // Keep original product data for compatibility
        desc: product.description || product.desc || '',
        catetory: product.category || product.catetory || 'kabida',
        code_new: product.code_new || product.code || '',
        old_price: product.discount > 0 ? product.price : undefined
      };
      
      cart.push(cartItem);
    }

    // حفظ فوري
    localStorage.setItem('cart', JSON.stringify(cart));

    // تحديث العدادات فوراً - بدون انتظار
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // تحديث جميع العدادات والأسعار فوراً
    document.querySelectorAll('.count_item_cart, .count_item_heater, .count_item_header').forEach(el => {
      el.textContent = totalItems;
    });
    
    document.querySelectorAll('.price_cart_total').forEach(el => {
      el.innerHTML = `LE:${totalPrice.toFixed(2)}`;
    });

    // تحديث حالة الأزرار فوراً
    const buttons = document.querySelectorAll(`.btn_add_cart[data-id="${product.id}"]`);
    buttons.forEach(button => {
      button.classList.add('active');
      button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> في السلة';
    });

    // تحديث السلة العامة فوراً
    if (typeof window.updateCart === 'function') {
      try { 
        // تحديث البيانات العامة
        if (window.cartData) {
          window.cartData = cart;
        }
        window.updateCart(); 
      } catch(e) {
        console.log('updateCart not available');
      }
    }

    // رسالة نجاح فورية
    toast(`✅ تم إضافة ${product.name}`);
    
    console.log('✅ تم إضافة المنتج فوراً');
  }

  function toast(msg) {
    let el = document.querySelector('.khed-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'khed-toast';
      Object.assign(el.style, {
        position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
        background: '#28a745', color: '#fff', padding: '8px 12px', borderRadius: '6px',
        zIndex: 4000, boxShadow: '0 4px 12px rgba(0,0,0,.2)', opacity: '0',
        transition: 'opacity .15s', fontSize: '14px', fontWeight: '500'
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    // تقليل وقت الرسالة من 1700ms إلى 1200ms
    setTimeout(()=>{ el.style.opacity = '0'; }, 1200);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[s]));
  }
})();




// ✅ ضمان حفظ الكود الجديد داخل عناصر السلة بدون لمس القديم
(function(){
  const _push = (items, obj) => {
    // لو الدالة بتستدعى من مكان تاني، نضيف code_new قبل الحفظ
    if (obj && obj.code_new === undefined) {
      obj.code_new = (obj.code_new || obj.code || ''); // fallback لو لسه مفيش code_new
    }
    items.push(obj);
  };

  // لو عندك مكان بيعمل cart.push(...) مباشرة:
  const _setItem = localStorage.setItem;
  localStorage.setItem = function(k, v){
    if (k === 'cart') {
      try {
        const arr = JSON.parse(v || '[]');
        arr.forEach(p => { if (p && p.code_new === undefined) p.code_new = (p.code_new || p.code || ''); });
        return _setItem.call(this, k, JSON.stringify(arr));
      } catch(e){ /* ignore */ }
    }
    return _setItem.call(this, k, v);
  };
})();


// product_modalالخديوي.js — يضمن حفظ code_new داخل عناصر السلة
(function(){
  // لو عندك كودك الخاص لفتح مودال/إضافة للسلة… خلي دي “شبكة أمان” على التخزين:
  const _setItem = localStorage.setItem;
  localStorage.setItem = function(k, v){
    if (k === 'cart') {
      try {
        const arr = JSON.parse(v || '[]');
        arr.forEach(p => {
          if (!p) return;
          if (p.code_new == null || p.code_new === '') {
            p.code_new = p.code_new || p.code || '';
          }
        });
        return _setItem.call(this, k, JSON.stringify(arr));
      } catch(e){ /* ignore */ }
    }
    return _setItem.call(this, k, v);
  };

  // في حالة عندك استدعاء مباشر cart.push({...product})
  // غيّر في مكان الإضافة الأصلي إن أمكنك:
  // cart.push({ ...product, code_new: product.code_new || product.code || '' , ... });

})();
 
