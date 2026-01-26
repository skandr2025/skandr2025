// 🔥 Firebase Dashboard - النسخة النظيفة والكاملة
// تهيئة Firebase الآمنة
let db;
try {
    db = window.initSecureFirebase();
    if (!db) {
        throw new Error('فشل في تهيئة Firebase');
    }
} catch (error) {
    console.error('خطأ في تهيئة Firebase:', error);
    alert('خطأ في الاتصال بقاعدة البيانات');
}

// Dashboard Class
class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.orders = [];
        this.products = [];
        this.customers = [];
        this.stores = [];
        this.categories = [];
        this.deliveryAreas = [];
        this.drivers = [];
        this.suggestions = [];
        this.addons = [];
        
        this.editingProductID = null;
        this.editingCategoryID = null;
        this.editingStoreID = null;
        this.editingDeliveryID = null;
        this.editingSuggestionID = null;
        this.editingAddonID = null;
        
        this.init();
    }

    init() {
        console.log('🔥 تهيئة لوحة التحكم...');
        
        // إخفاء شاشة التحميل فوراً
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // تشخيص حالة Firebase
        console.log('🔍 فحص حالة Firebase:', !!db);
        if (!db) {
            console.error('❌ Firebase غير متاح - لوحة التحكم لن تعمل');
            this.showFirebaseError();
            return;
        }
        
        this.setupEventListeners();
        this.loadAllData();
    }

    showFirebaseError() {
        // عرض رسالة خطأ واضحة للمستخدم
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 60vh;
                    text-align: center;
                    padding: 2rem;
                ">
                    <div style="
                        background: #ff6b6b;
                        color: white;
                        padding: 2rem;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
                        max-width: 500px;
                    ">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h2 style="margin-bottom: 1rem;">خطأ في الاتصال بقاعدة البيانات</h2>
                        <p style="margin-bottom: 1.5rem; line-height: 1.6;">
                            لا يمكن الاتصال بـ Firebase. تأكد من:
                        </p>
                        <ul style="text-align: right; margin-bottom: 1.5rem;">
                            <li>الاتصال بالإنترنت</li>
                            <li>إعدادات Firebase صحيحة</li>
                            <li>صلاحيات قاعدة البيانات</li>
                        </ul>
                        <button onclick="location.reload()" style="
                            background: white;
                            color: #ff6b6b;
                            border: none;
                            padding: 0.8rem 2rem;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            <i class="fas fa-refresh"></i> إعادة المحاولة
                        </button>
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                
                // Add overlay for mobile
                let overlay = document.querySelector('.sidebar-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'sidebar-overlay';
                    document.body.appendChild(overlay);
                    
                    overlay.addEventListener('click', () => {
                        sidebar.classList.remove('active');
                        overlay.classList.remove('active');
                    });
                }
                overlay.classList.toggle('active');
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                e.target.classList.remove('show');
            }
        });

        // Prevent modal close when clicking inside modal content
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    async loadAllData() {
        try {
            console.log('📥 تحميل البيانات من Firebase...');
            console.log('🔍 حالة قاعدة البيانات:', !!db);
            
            if (!db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            const [productsData, ordersData, customersData, storesData, categoriesData, deliveryData, driversData, suggestionsData, addonsData] = await Promise.all([
                this.fetchData('products'),
                this.fetchData('orders'),
                this.fetchData('customers'),
                this.fetchData('stores'),
                this.fetchData('categories'),
                this.fetchData('deliveryAreas'),
                this.fetchData('drivers'),
                this.fetchData('suggestions'),
                this.fetchData('addons')
            ]);
            
            this.products = productsData || [];
            this.orders = ordersData || [];
            this.customers = customersData || [];
            this.stores = storesData || [];
            this.categories = categoriesData || [];
            this.deliveryAreas = deliveryData || [];
            this.drivers = driversData || [];
            this.suggestions = suggestionsData || [];
            this.addons = addonsData || [];
            
            console.log('✅ تم تحميل البيانات من Firebase');
            console.log('📊 إحصائيات البيانات:', {
                products: this.products.length,
                orders: this.orders.length,
                customers: this.customers.length,
                stores: this.stores.length,
                categories: this.categories.length,
                deliveryAreas: this.deliveryAreas.length,
                drivers: this.drivers.length,
                suggestions: this.suggestions.length,
                addons: this.addons.length
            });
            
            this.updateDashboard();
            
            // Update quick overview if on dashboard
            const currentSection = document.querySelector('.section.active');
            if (currentSection && currentSection.id === 'dashboard') {
                renderQuickOverview();
            }
            
            // Always update notification badge
            updateNotificationBadge();
            
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error);
            this.showDataLoadError(error);
        }
    }

    showDataLoadError(error) {
        // عرض رسالة خطأ في تحميل البيانات
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem;
                text-align: center;
            `;
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <strong>خطأ في تحميل البيانات:</strong> ${error.message}
                <br>
                <button onclick="window.dashboard.loadAllData()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                    cursor: pointer;
                ">
                    إعادة المحاولة
                </button>
            `;
            dashboardSection.insertBefore(errorDiv, dashboardSection.firstChild);
        }
    }

    async fetchData(collection) {
        try {
            console.log(`📥 جاري تحميل ${collection}...`);
            
            if (!db) {
                throw new Error(`قاعدة البيانات غير متاحة لتحميل ${collection}`);
            }
            
            const snapshot = await db.collection(collection).get();
            const data = [];
            
            console.log(`📊 تم العثور على ${snapshot.size} عنصر في ${collection}`);
            
            snapshot.forEach(doc => {
                const docData = doc.data();
                data.push({ id: doc.id, ...docData });
            });
            
            console.log(`✅ تم تحميل ${data.length} عنصر من ${collection}`);
            return data;
        } catch (error) {
            console.error(`❌ خطأ في تحميل ${collection}:`, error);
            console.error(`❌ تفاصيل الخطأ:`, {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    showSection(sectionName) {
        console.log('📍 عرض قسم:', sectionName);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                'dashboard': 'لوحة التحكم',
                'products': 'المنتجات',
                'orders': 'الطلبات',
                'customers': 'العملاء',
                'categories': 'المجموعات',
                'stores': 'المحلات',
                'delivery': 'خدمة التوصيل',
                'drivers': 'إدارة الطيارين',
                'addons': 'الإضافات',
                'suggestions': 'الاقتراحات',
                'reports': 'التقارير',
                'users': 'إدارة المستخدمين'
            };
            pageTitle.textContent = titles[sectionName] || 'لوحة التحكم';
        }

        // Load section data
        setTimeout(() => {
            if (sectionName === 'dashboard') {
                renderQuickOverview();
            } else if (sectionName === 'products') {
                this.renderProducts();
            } else if (sectionName === 'orders') {
                this.renderOrders();
            } else if (sectionName === 'customers') {
                this.renderCustomers();
            } else if (sectionName === 'stores') {
                this.renderStores();
            } else if (sectionName === 'categories') {
                this.renderCategories();
            } else if (sectionName === 'delivery') {
                this.renderDeliveryAreas();
            } else if (sectionName === 'addons') {
                this.renderAddons();
            } else if (sectionName === 'suggestions') {
                this.renderSuggestions();
            } else if (sectionName === 'reports') {
                this.renderReports();
            } else if (sectionName === 'users') {
                loadUsers();
            } else if (sectionName === 'drivers') {
                loadDrivers();
            }
        }, 50);

        this.currentSection = sectionName;
    }

    updateDashboard() {
        console.log('📊 تحديث إحصائيات لوحة التحكم...');
        
        // Update dashboard statistics
        let totalRevenue = 0;
        let completedOrders = 0;
        
        console.log(`📦 معالجة ${this.orders.length} طلب...`);
        
        this.orders.forEach(order => {
            const status = order.status || 'جديد';
            
            if (status === 'توصيل') {
                totalRevenue += parseFloat(order.total) || 0;
                completedOrders++;
            }
        });

        console.log(`💰 إجمالي الإيرادات: ${totalRevenue.toFixed(2)} ج.م`);
        console.log(`✅ الطلبات المكتملة: ${completedOrders}`);

        // Update UI elements
        const elements = {
            'totalProducts': this.products.length,
            'totalOrders': this.orders.length,
            'totalCustomers': this.customers.length,
            'totalRevenue': totalRevenue.toFixed(2) + ' ج.م'
        };

        console.log('📊 تحديث عناصر الواجهة:', elements);

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
                console.log(`✅ تم تحديث ${id}: ${elements[id]}`);
            } else {
                console.warn(`⚠️ العنصر ${id} غير موجود في الصفحة`);
            }
        });

        console.log('✅ تم تحديث لوحة التحكم بنجاح');
    }

    renderOrders() {
        console.log('🔥 عرض الطلبات:', this.orders.length);
        const tbody = document.getElementById('ordersTable');
        if (!tbody) return;

        // Update status counts
        this.updateOrderStatusCounts();

        tbody.innerHTML = '';
        
        // Filter orders based on current filter
        let filteredOrders = this.orders;
        const activeFilter = document.querySelector('.status-btn.active')?.dataset.status;
        
        if (activeFilter && activeFilter !== 'all') {
            filteredOrders = this.orders.filter(order => {
                let currentStatus = order.status || 'جديد';
                
                // تحديد الحالة الصحيحة للفلترة
                if ((order.settled || order.accountSettled) && currentStatus === 'توصيل') {
                    currentStatus = 'تم التوصيل';
                }
                
                return currentStatus === activeFilter;
            });
        }
        
        console.log(`📋 عرض ${filteredOrders.length} طلب من أصل ${this.orders.length} (الفلتر: ${activeFilter || 'الكل'})`);
        
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            
            // تحديد الحالة الصحيحة
            let currentStatus = order.status || 'جديد';
            if ((order.settled || order.accountSettled) && currentStatus === 'توصيل') {
                currentStatus = 'تم التوصيل';
            }
            
            // تحديد الحالة التالية
            const nextStatus = this.getNextOrderStatus(currentStatus);
            
            row.innerHTML = `
                <td>
                    <strong>#${order.orderID || order.id.substring(0, 8)}</strong><br>
                    <small class="text-muted">${formattedTime}</small>
                </td>
                <td>${order.customerName || order.name || '-'}</td>
                <td>
                    <a href="tel:${order.phone}" class="text-primary">
                        <i class="fas fa-phone"></i> ${order.phone || '-'}
                    </a>
                </td>
                <td>${order.area || '-'}</td>
                <td><strong>${(order.total || 0).toFixed(2)} ج.م</strong></td>
                <td>
                    <span class="status ${this.getStatusClass(currentStatus)}">
                        ${currentStatus}
                    </span>
                </td>
                <td>
                    <small>${formattedDate}</small>
                </td>
                <td>
                    <div class="order-actions">
                        <button class="order-action-btn view" onclick="viewOrderDetails('${order.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                        ${nextStatus && currentStatus !== 'تحضير' && currentStatus !== 'تم التوصيل' ? `
                            <button class="order-action-btn next-status" onclick="quickUpdateOrderStatus('${order.id}', '${nextStatus}')" title="تحديث إلى ${nextStatus}">
                                <i class="fas fa-arrow-left"></i> ${nextStatus}
                            </button>
                        ` : ''}
                        ${currentStatus === 'تحضير' ? `
                            <button class="order-action-btn delivery" onclick="assignDriverToOrder('${order.id}')" title="تخصيص طيار وتوصيل">
                                <i class="fas fa-motorcycle"></i> توصيل
                            </button>
                        ` : ''}
                        ${order.driverId && currentStatus !== 'تم التوصيل' ? `
                            <button class="order-action-btn driver-info" onclick="showDriverInfo('${order.driverId}')" title="معلومات الطيار">
                                <i class="fas fa-user"></i> ${order.driverName || 'الطيار'}
                            </button>
                        ` : ''}
                        ${currentStatus !== 'توصيل' && currentStatus !== 'إلغاء' && currentStatus !== 'تم التوصيل' ? `
                            <button class="order-action-btn cancel" onclick="quickUpdateOrderStatus('${order.id}', 'إلغاء')" title="إلغاء الطلب">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateOrderStatusCounts() {
        const counts = {
            all: this.orders.length,
            'جديد': 0,
            'تأكيد': 0,
            'تحضير': 0,
            'توصيل': 0,
            'تم التوصيل': 0,
            'إلغاء': 0
        };

        this.orders.forEach(order => {
            let status = order.status || 'جديد';
            
            // إذا كان الطلب مقفل (settled) أو مسوى (accountSettled) فهو "تم التوصيل"
            if ((order.settled || order.accountSettled) && status === 'توصيل') {
                status = 'تم التوصيل';
            }
            
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        // Update UI
        document.getElementById('allOrdersCount').textContent = counts.all;
        document.getElementById('newOrdersCount').textContent = counts['جديد'];
        document.getElementById('confirmedOrdersCount').textContent = counts['تأكيد'];
        document.getElementById('preparingOrdersCount').textContent = counts['تحضير'];
        document.getElementById('deliveredOrdersCount').textContent = counts['توصيل'];
        document.getElementById('completedOrdersCount').textContent = counts['تم التوصيل'];
        document.getElementById('cancelledOrdersCount').textContent = counts['إلغاء'];
    }

    getNextOrderStatus(currentStatus) {
        const statusFlow = {
            'جديد': 'تأكيد',
            'تأكيد': 'تحضير', 
            'تحضير': null, // لا يوجد حالة تالية، سيتم التوصيل عبر اختيار الطيار
            'توصيل': null,
            'تم التوصيل': null,
            'إلغاء': null
        };
        return statusFlow[currentStatus] || null;
    }

    getStatusClass(status) {
        const statusClasses = {
            'جديد': 'new',
            'تأكيد': 'confirmed',
            'تحضير': 'preparing',
            'توصيل': 'delivered',
            'تم التوصيل': 'completed',
            'إلغاء': 'cancelled'
        };
        return statusClasses[status] || 'new';
    }

    renderProducts() {
        console.log('🔥 عرض المنتجات:', this.products.length);
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.images?.[0] || product.image || 'img/default.jpg'}" 
                         alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${product.name || '-'}</td>
                <td><strong>${(product.price || 0).toFixed(2)} ج.م</strong></td>
                <td>${product.category || '-'}</td>
                <td>
                    <span class="badge badge-${product.visible ? 'success' : 'secondary'}">
                        ${product.visible ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleProduct('${product.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${product.visible ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCategories() {
        console.log('🔥 عرض المجموعات:', this.categories.length);
        const tbody = document.getElementById('categoriesTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.categories.forEach(category => {
            const row = document.createElement('tr');
            const productCount = this.products.filter(p => p.category === category.name).length;
            
            row.innerHTML = `
                <td>${category.name || '-'}</td>
                <td>${category.slug || '-'}</td>
                <td>${category.desc || '-'}</td>
                <td>${productCount}</td>
                <td>
                    <span class="badge badge-${category.visible ? 'success' : 'secondary'}">
                        ${category.visible ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCategory('${category.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleCategory('${category.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${category.visible ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderStores() {
        console.log('🔥 عرض المحلات:', this.stores.length);
        const tbody = document.getElementById('storesTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.stores.forEach(store => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${store.image || 'img/icon.JPG'}" 
                         alt="${store.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${store.name || '-'}</td>
                <td>
                    <a href="tel:${store.phone}" class="text-primary">
                        <i class="fas fa-phone"></i> ${store.phone || '-'}
                    </a>
                </td>
                <td>${store.address || '-'}</td>
                <td>
                    <span class="badge badge-${store.visible ? 'success' : 'secondary'}">
                        ${store.visible ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editStore('${store.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleStore('${store.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${store.visible ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStore('${store.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderDeliveryAreas() {
        console.log('🔥 عرض مناطق التوصيل:', this.deliveryAreas.length);
        const tbody = document.getElementById('deliveryTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.deliveryAreas.forEach(area => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${area.name || '-'}</td>
                <td><strong>${(area.fee || 0).toFixed(2)} ج.م</strong></td>
                <td>${area.desc || '-'}</td>
                <td>
                    <span class="badge badge-${area.active ? 'success' : 'secondary'}">
                        ${area.active ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editDeliveryArea('${area.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleDeliveryArea('${area.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${area.active ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDeliveryArea('${area.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderAddons() {
        console.log('🔥 عرض الإضافات:', this.addons.length);
        const tbody = document.getElementById('addonsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.addons.forEach(addon => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${addon.name || '-'}</td>
                <td><strong>${(addon.price || 0).toFixed(2)} ج.م</strong></td>
                <td>${addon.desc || '-'}</td>
                <td>${addon.category || '-'}</td>
                <td>
                    <span class="badge badge-${addon.active ? 'success' : 'secondary'}">
                        ${addon.active ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editAddon('${addon.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleAddon('${addon.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${addon.active ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAddon('${addon.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderSuggestions() {
        console.log('🔥 عرض الاقتراحات:', this.suggestions.length);
        const tbody = document.getElementById('suggestionsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.suggestions.forEach(suggestion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${suggestion.image || 'img/default.jpg'}" 
                         alt="${suggestion.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${suggestion.name || '-'}</td>
                <td><strong>${(suggestion.price || 0).toFixed(2)} ج.م</strong></td>
                <td>${suggestion.desc || '-'}</td>
                <td>
                    <span class="badge badge-${suggestion.active ? 'success' : 'secondary'}">
                        ${suggestion.active ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editSuggestion('${suggestion.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="toggleSuggestion('${suggestion.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${suggestion.active ? 'on' : 'off'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSuggestion('${suggestion.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCustomers() {
        console.log('🔥 عرض العملاء');
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;

        // Process customers data
        const customersData = this.processCustomersData();
        
        // Update customer counts
        this.updateCustomerCounts(customersData);

        tbody.innerHTML = '';
        
        // Filter customers based on current filter
        let filteredCustomers = customersData;
        const activeFilter = document.querySelector('.customer-filter-btn.active')?.dataset.type;
        
        if (activeFilter && activeFilter !== 'all') {
            filteredCustomers = customersData.filter(customer => customer.type === activeFilter);
        }
        
        filteredCustomers.forEach(customer => {
            const row = document.createElement('tr');
            const lastOrderDate = customer.lastOrderDate ? 
                new Date(customer.lastOrderDate).toLocaleDateString('ar-EG') : 'لا يوجد';
            
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>
                    <a href="tel:${customer.phone}" class="text-primary">
                        <i class="fas fa-phone"></i> ${customer.phone}
                    </a>
                </td>
                <td><strong>${customer.orderCount}</strong></td>
                <td><strong>${customer.totalSpent.toFixed(2)} ج.م</strong></td>
                <td>
                    <span class="customer-type-badge ${customer.type}">
                        ${this.getCustomerTypeLabel(customer.type)}
                    </span>
                </td>
                <td><small>${lastOrderDate}</small></td>
                <td>
                    <div class="order-actions">
                        <button class="order-action-btn view" onclick="viewCustomerOrders('${customer.phone}')" title="عرض الطلبات">
                            <i class="fas fa-list"></i> عرض الطلبات
                        </button>
                        <button class="order-action-btn call" onclick="callCustomer('${customer.phone}')" title="اتصال">
                            <i class="fas fa-phone"></i> اتصال
                        </button>
                        <button class="order-action-btn view" onclick="whatsappCustomer('${customer.phone}')" title="واتساب">
                            <i class="fab fa-whatsapp"></i> واتساب
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    processCustomersData() {
        const customersMap = new Map();
        
        // Group orders by phone number
        this.orders.forEach(order => {
            const phone = order.phone;
            if (!phone) return;
            
            if (!customersMap.has(phone)) {
                customersMap.set(phone, {
                    name: order.customerName || order.name || 'غير محدد',
                    phone: phone,
                    orders: [],
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrderDate: null
                });
            }
            
            const customer = customersMap.get(phone);
            customer.orders.push(order);
            customer.orderCount++;
            
            // Only count completed orders for total spent
            if (order.status === 'توصيل') {
                customer.totalSpent += parseFloat(order.total) || 0;
            }
            
            // Update last order date
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
            if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
                customer.lastOrderDate = orderDate;
            }
            
            // Update name if current order has a name and stored name is generic
            if ((order.customerName || order.name) && customer.name === 'غير محدد') {
                customer.name = order.customerName || order.name;
            }
        });
        
        // Convert to array and determine customer types
        const customers = Array.from(customersMap.values()).map(customer => {
            customer.type = this.determineCustomerType(customer.orderCount, customer.totalSpent);
            return customer;
        });
        
        // Sort by total spent (descending)
        customers.sort((a, b) => b.totalSpent - a.totalSpent);
        
        return customers;
    }

    determineCustomerType(orderCount, totalSpent) {
        if (orderCount >= 10 && totalSpent >= 3000) {
            return 'vip';
        } else if (orderCount >= 5) {
            return 'premium';
        } else {
            return 'new';
        }
    }

    getCustomerTypeLabel(type) {
        const labels = {
            'new': 'عميل جديد',
            'premium': 'عميل مميز',
            'vip': 'عميل VIP'
        };
        return labels[type] || 'عميل جديد';
    }

    updateCustomerCounts(customers) {
        const counts = {
            all: customers.length,
            new: customers.filter(c => c.type === 'new').length,
            premium: customers.filter(c => c.type === 'premium').length,
            vip: customers.filter(c => c.type === 'vip').length
        };

        document.getElementById('allCustomersCount').textContent = counts.all;
        document.getElementById('newCustomersCount').textContent = counts.new;
        document.getElementById('premiumCustomersCount').textContent = counts.premium;
        document.getElementById('vipCustomersCount').textContent = counts.vip;
    }

    renderReports() {
        console.log('🔥 عرض التقارير الحقيقية من Firebase');
        
        // Calculate reports data
        const reportsData = this.calculateReportsData();
        
        console.log('📊 عرض بيانات التقارير:', reportsData);
        
        // Update summary cards with real data
        const totalRevenueEl = document.getElementById('reportTotalRevenue');
        const deliveryRevenueEl = document.getElementById('reportDeliveryRevenue');
        const completedOrdersEl = document.getElementById('reportCompletedOrders');
        const totalOrdersEl = document.getElementById('reportTotalOrders');
        const averageOrderEl = document.getElementById('reportAverageOrder');
        const activeCustomersEl = document.getElementById('reportActiveCustomers');
        
        if (totalRevenueEl) {
            totalRevenueEl.textContent = reportsData.totalRevenue.toFixed(2) + ' ج.م';
            console.log('💰 إجمالي الإيرادات:', reportsData.totalRevenue.toFixed(2) + ' ج.م');
        }
        
        if (deliveryRevenueEl) {
            deliveryRevenueEl.textContent = reportsData.deliveryRevenue.toFixed(2) + ' ج.م';
            console.log('🚚 إجمالي رسوم التوصيل:', reportsData.deliveryRevenue.toFixed(2) + ' ج.م');
        }
        
        if (completedOrdersEl) {
            completedOrdersEl.textContent = reportsData.completedOrders;
            console.log('✅ الطلبات المكتملة:', reportsData.completedOrders);
        }
        
        if (totalOrdersEl) {
            totalOrdersEl.textContent = reportsData.totalOrders;
            console.log('📦 إجمالي الطلبات:', reportsData.totalOrders);
        }
        
        if (averageOrderEl) {
            averageOrderEl.textContent = reportsData.averageOrder.toFixed(2) + ' ج.م';
            console.log('📊 متوسط الطلب:', reportsData.averageOrder.toFixed(2) + ' ج.م');
        }
        
        if (activeCustomersEl) {
            activeCustomersEl.textContent = reportsData.activeCustomers;
            console.log('👥 العملاء النشطون:', reportsData.activeCustomers);
        }
        
        // Render top products with real data
        console.log('🏆 عرض أفضل المنتجات:', reportsData.topProducts);
        this.renderTopProducts(reportsData.topProducts);
        
        // Render top areas with real data
        console.log('🏆 عرض أفضل المناطق:', reportsData.topAreas);
        this.renderTopAreas(reportsData.topAreas);
        
        // Render VIP customers with real data
        console.log('👑 عرض العملاء المميزون:', reportsData.vipCustomers);
        this.renderVipCustomers(reportsData.vipCustomers);
        
        // Render top drivers with real data
        console.log('🏆 عرض أفضل الطيارين:', reportsData.topDrivers);
        this.renderTopDrivers(reportsData.topDrivers);
        
        // Render daily performance
        console.log('📈 عرض الأداء اليومي:', reportsData.dailyPerformance);
        this.renderDailyPerformance(reportsData.dailyPerformance);
        
        console.log('✅ تم عرض جميع التقارير بالبيانات الحقيقية من Firebase');
    }

    calculateReportsData() {
        const now = new Date();
        const currentPeriod = document.getElementById('reportPeriod')?.value || 'month';
        
        console.log('📊 حساب بيانات التقارير للفترة:', currentPeriod);
        console.log('📦 إجمالي الطلبات المتاحة:', this.orders.length);
        
        // Filter orders based on selected period
        let filteredOrders = this.orders;
        
        if (currentPeriod !== 'all') {
            filteredOrders = this.orders.filter(order => {
                const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
                return this.isOrderInPeriod(orderDate, currentPeriod, now);
            });
        }
        
        console.log('📦 الطلبات المفلترة للفترة:', filteredOrders.length);
        
        // Calculate basic metrics
        const completedOrders = filteredOrders.filter(order => order.status === 'توصيل');
        console.log('✅ الطلبات المكتملة:', completedOrders.length);
        
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        
        // Fix: Use serviceCharge instead of deliveryFee for real Firebase data
        const deliveryRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0), 0);
        
        const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
        
        // Get unique customers
        const uniqueCustomers = new Set(filteredOrders.map(order => order.phone).filter(phone => phone));
        
        // Calculate top products - FIX: Use 'products' instead of 'items' for real Firebase data
        const productStats = {};
        completedOrders.forEach(order => {
            console.log('🔍 معالجة طلب:', order.id, 'المنتجات:', order.products || order.items);
            
            // Use 'products' first (real Firebase data), then fallback to 'items'
            const orderProducts = order.products || order.items || [];
            
            if (orderProducts && orderProducts.length > 0) {
                orderProducts.forEach(product => {
                    const productName = product.name || product.title || 'منتج غير محدد';
                    if (!productStats[productName]) {
                        productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
                    }
                    productStats[productName].quantity += product.quantity || 1;
                    productStats[productName].revenue += (product.totalPrice || (product.price * product.quantity)) || 0;
                });
            }
        });
        
        console.log('📊 إحصائيات المنتجات:', productStats);
        
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        console.log('🏆 أفضل المنتجات:', topProducts);
        
        // Calculate top areas
        const areaStats = {};
        completedOrders.forEach(order => {
            const area = order.area || 'غير محدد';
            if (!areaStats[area]) {
                areaStats[area] = { name: area, orders: 0, revenue: 0 };
            }
            areaStats[area].orders++;
            areaStats[area].revenue += parseFloat(order.total) || 0;
        });
        
        const topAreas = Object.values(areaStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        console.log('🏆 أفضل المناطق:', topAreas);
        
        // Get VIP customers - Fix to use real data
        const customersData = this.processCustomersData();
        const vipCustomers = customersData
            .filter(customer => customer.type === 'vip')
            .slice(0, 10);
        
        console.log('👑 العملاء المميزون:', vipCustomers);
        
        // Calculate daily performance for the last 7 days
        const dailyPerformance = this.calculateDailyPerformance(filteredOrders);
        
        console.log('📈 الأداء اليومي:', dailyPerformance);
        
        // Calculate top drivers
        const driverStats = {};
        completedOrders.forEach(order => {
            if (order.driverId && order.driverName) {
                if (!driverStats[order.driverId]) {
                    driverStats[order.driverId] = {
                        id: order.driverId,
                        name: order.driverName,
                        orders: 0,
                        revenue: 0,
                        commission: 0
                    };
                }
                driverStats[order.driverId].orders++;
                const orderTotal = parseFloat(order.total) || 0;
                driverStats[order.driverId].revenue += orderTotal;
                
                // حساب العمولة من رسوم التوصيل فقط
                const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
                driverStats[order.driverId].commission += deliveryFee;
            }
        });
        
        const topDrivers = Object.values(driverStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        console.log('🏆 أفضل الطيارين:', topDrivers);
        
        const reportsData = {
            totalRevenue,
            deliveryRevenue,
            completedOrders: completedOrders.length,
            totalOrders: filteredOrders.length,
            averageOrder,
            activeCustomers: uniqueCustomers.size,
            topProducts,
            topAreas,
            topDrivers,
            vipCustomers,
            dailyPerformance
        };
        
        console.log('📊 بيانات التقارير النهائية:', reportsData);
        
        return reportsData;
    }

    calculateDailyPerformance(orders) {
        const dailyStats = {};
        const last7Days = [];
        const today = new Date();
        
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            last7Days.push(dateKey);
            dailyStats[dateKey] = {
                date: dateKey,
                displayDate: date.toLocaleDateString('ar-EG'),
                orders: 0,
                revenue: 0,
                completedOrders: 0
            };
        }
        
        // Process orders for daily stats
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
            const dateKey = orderDate.toISOString().split('T')[0];
            
            if (dailyStats[dateKey]) {
                dailyStats[dateKey].orders++;
                if (order.status === 'توصيل') {
                    dailyStats[dateKey].completedOrders++;
                    dailyStats[dateKey].revenue += parseFloat(order.total) || 0;
                }
            }
        });
        
        return last7Days.map(dateKey => dailyStats[dateKey]);
    }

    isOrderInPeriod(orderDate, period, now) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        
        switch (period) {
            case 'today':
                return orderDay.getTime() === today.getTime();
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return orderDay.getTime() === yesterday.getTime();
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                return orderDate >= weekStart && orderDate <= now;
            case 'lastWeek':
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay() - 1);
                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekStart.getDate() - 6);
                return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
            case 'month':
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            case 'lastMonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                return orderDate >= lastMonth && orderDate <= lastMonthEnd;
            case 'year':
                return orderDate.getFullYear() === now.getFullYear();
            case 'lastYear':
                return orderDate.getFullYear() === (now.getFullYear() - 1);
            case 'all':
                return true;
            default:
                return true;
        }
    }

    renderTopProducts(topProducts) {
        const container = document.getElementById('topProductsList');
        if (!container) {
            console.error('❌ عنصر topProductsList غير موجود');
            return;
        }
        
        console.log('🏆 عرض أفضل المنتجات:', topProducts);
        
        container.innerHTML = '';
        
        if (!topProducts || topProducts.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">لا توجد بيانات منتجات للفترة المحددة</p>
                    <small class="text-muted">تأكد من وجود طلبات مكتملة تحتوي على منتجات</small>
                </div>
            `;
            return;
        }
        
        topProducts.forEach((product, index) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'report-item';
            productDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            const rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#667eea';
            
            productDiv.innerHTML = `
                <div class="report-rank" style="
                    background: ${rankColor};
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-left: 1rem;
                ">#${index + 1}</div>
                <div class="report-details" style="flex: 1;">
                    <div class="report-name" style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">
                        ${product.name}
                    </div>
                    <div class="report-stats" style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666;">
                        <span><i class="fas fa-shopping-cart"></i> الكمية: ${product.quantity}</span>
                        <span><i class="fas fa-money-bill-wave"></i> الإيرادات: ${product.revenue.toFixed(2)} ج.م</span>
                    </div>
                </div>
            `;
            container.appendChild(productDiv);
        });
        
        console.log('✅ تم عرض أفضل المنتجات بنجاح');
    }

    renderTopAreas(topAreas) {
        const container = document.getElementById('topAreasList');
        if (!container) {
            console.error('❌ عنصر topAreasList غير موجود');
            return;
        }
        
        console.log('🏆 عرض أفضل المناطق:', topAreas);
        
        container.innerHTML = '';
        
        if (!topAreas || topAreas.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">لا توجد بيانات مناطق للفترة المحددة</p>
                    <small class="text-muted">تأكد من وجود طلبات مكتملة تحتوي على مناطق</small>
                </div>
            `;
            return;
        }
        
        topAreas.forEach((area, index) => {
            const areaDiv = document.createElement('div');
            areaDiv.className = 'report-item';
            areaDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            const rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#667eea';
            
            areaDiv.innerHTML = `
                <div class="report-rank" style="
                    background: ${rankColor};
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-left: 1rem;
                ">#${index + 1}</div>
                <div class="report-details" style="flex: 1;">
                    <div class="report-name" style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">
                        <i class="fas fa-map-marker-alt"></i> ${area.name}
                    </div>
                    <div class="report-stats" style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666;">
                        <span><i class="fas fa-shopping-bag"></i> الطلبات: ${area.orders}</span>
                        <span><i class="fas fa-money-bill-wave"></i> الإيرادات: ${area.revenue.toFixed(2)} ج.م</span>
                    </div>
                </div>
            `;
            container.appendChild(areaDiv);
        });
        
        console.log('✅ تم عرض أفضل المناطق بنجاح');
    }

    renderVipCustomers(vipCustomers) {
        const container = document.getElementById('vipCustomersList');
        if (!container) {
            console.error('❌ عنصر vipCustomersList غير موجود');
            return;
        }
        
        console.log('👑 عرض العملاء المميزون:', vipCustomers);
        
        container.innerHTML = '';
        
        if (!vipCustomers || vipCustomers.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-crown fa-3x text-muted mb-3"></i>
                    <p class="text-muted">لا يوجد عملاء VIP حالياً</p>
                    <small class="text-muted">العملاء الذين لديهم 10+ طلبات و 3000+ ج.م إنفاق يصبحون VIP</small>
                </div>
            `;
            return;
        }
        
        vipCustomers.forEach((customer, index) => {
            const customerDiv = document.createElement('div');
            customerDiv.className = 'report-item vip-customer-item';
            customerDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                border-radius: 8px;
                border: 2px solid #ffd700;
                box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
            `;
            
            customerDiv.innerHTML = `
                <div class="report-rank" style="
                    background: #ff6b35;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">
                    <i class="fas fa-crown" style="font-size: 1.2rem;"></i>
                </div>
                <div class="report-details" style="flex: 1;">
                    <div class="report-name" style="font-weight: 700; color: #333; margin-bottom: 0.5rem; font-size: 1.1rem;">
                        ${customer.name}
                    </div>
                    <div class="report-stats" style="display: flex; gap: 1rem; font-size: 0.9rem; color: #555;">
                        <span><i class="fas fa-shopping-bag"></i> ${customer.orderCount} طلب</span>
                        <span><i class="fas fa-money-bill-wave"></i> ${customer.totalSpent.toFixed(2)} ج.م</span>
                        <span><i class="fas fa-phone"></i> ${customer.phone}</span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewCustomerOrders('${customer.phone}')" style="
                        background: #667eea;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        color: white;
                        font-weight: 600;
                    ">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                </div>
            `;
            container.appendChild(customerDiv);
        });
        
        console.log('✅ تم عرض العملاء المميزون بنجاح');
    }

    renderTopDrivers(topDrivers) {
        const container = document.getElementById('topDriversList');
        if (!container) {
            console.error('❌ عنصر topDriversList غير موجود');
            return;
        }
        
        console.log('🏆 عرض أفضل الطيارين:', topDrivers);
        
        container.innerHTML = '';
        
        if (!topDrivers || topDrivers.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-motorcycle fa-3x text-muted mb-3"></i>
                    <p class="text-muted">لا توجد بيانات طيارين للفترة المحددة</p>
                    <small class="text-muted">تأكد من وجود طلبات مكتملة مخصصة للطيارين</small>
                </div>
            `;
            return;
        }
        
        topDrivers.forEach((driver, index) => {
            const driverDiv = document.createElement('div');
            driverDiv.className = 'report-item top-driver-item';
            driverDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1.5rem;
                margin-bottom: 1rem;
                background: white;
                border-radius: 12px;
                border: 2px solid #667eea;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                overflow: hidden;
            `;
            
            const rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#667eea';
            const rankIcon = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏍️';
            
            driverDiv.innerHTML = `
                <div class="rank-badge" style="
                    background: ${rankColor};
                    color: ${index < 3 ? '#333' : 'white'};
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-left: 1.5rem;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    font-size: 1.5rem;
                    position: relative;
                    z-index: 2;
                ">${rankIcon}</div>
                
                <div class="driver-details" style="flex: 1; z-index: 2;">
                    <div class="driver-name" style="
                        font-weight: 700; 
                        color: #333; 
                        margin-bottom: 0.75rem; 
                        font-size: 1.2rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <i class="fas fa-motorcycle" style="color: #667eea;"></i>
                        ${driver.name}
                        <span style="
                            background: #667eea;
                            color: white;
                            padding: 0.25rem 0.5rem;
                            border-radius: 12px;
                            font-size: 0.7rem;
                            font-weight: 600;
                        ">#${index + 1}</span>
                    </div>
                    <div class="driver-stats" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 1rem;
                        font-size: 0.9rem;
                        color: #555;
                    ">
                        <div style="
                            background: #f8f9fa;
                            padding: 0.5rem;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e9ecef;
                        ">
                            <i class="fas fa-shopping-bag" style="color: #28a745; margin-bottom: 0.25rem;"></i>
                            <div style="font-weight: 600; color: #333;">${driver.orders}</div>
                            <div style="font-size: 0.8rem; color: #666;">طلب</div>
                        </div>
                        <div style="
                            background: #f8f9fa;
                            padding: 0.5rem;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e9ecef;
                        ">
                            <i class="fas fa-money-bill-wave" style="color: #007bff; margin-bottom: 0.25rem;"></i>
                            <div style="font-weight: 600; color: #333;">${driver.revenue.toFixed(0)}</div>
                            <div style="font-size: 0.8rem; color: #666;">ج.م إيرادات</div>
                        </div>
                        <div style="
                            background: #f8f9fa;
                            padding: 0.5rem;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e9ecef;
                        ">
                            <i class="fas fa-percentage" style="color: #ffc107; margin-bottom: 0.25rem;"></i>
                            <div style="font-weight: 600; color: #333;">${driver.commission.toFixed(0)}</div>
                            <div style="font-size: 0.8rem; color: #666;">ج.م عمولة</div>
                        </div>
                    </div>
                </div>
                
                <div class="driver-actions" style="z-index: 2;">
                    <button onclick="showDriverReport('${driver.id}')" style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.9rem;
                        box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(102, 126, 234, 0.4)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(102, 126, 234, 0.3)'">
                        <i class="fas fa-chart-line"></i>
                        تقرير مفصل
                    </button>
                </div>
                
                <!-- Background decoration -->
                <div style="
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                    border-radius: 50%;
                    z-index: 1;
                "></div>
            `;
            
            // Add hover effect
            driverDiv.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.25)';
            });
            
            driverDiv.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
            });
            
            container.appendChild(driverDiv);
        });
        
        console.log('✅ تم عرض أفضل الطيارين بنجاح');
    }

    renderDailyPerformance(dailyPerformance) {
        const container = document.getElementById('dailyPerformanceList');
        if (!container) {
            console.error('❌ عنصر dailyPerformanceList غير موجود');
            return;
        }
        
        console.log('📈 عرض الأداء اليومي:', dailyPerformance);
        
        container.innerHTML = '';
        
        if (!dailyPerformance || dailyPerformance.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <p class="text-muted">لا توجد بيانات أداء يومي</p>
                </div>
            `;
            return;
        }
        
        dailyPerformance.forEach((day, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'report-item daily-performance-item';
            dayDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ${index === dailyPerformance.length - 1 ? 'border-left: 4px solid #28a745;' : ''}
            `;
            
            const isToday = index === dailyPerformance.length - 1;
            
            dayDiv.innerHTML = `
                <div class="report-rank" style="
                    background: ${isToday ? '#28a745' : '#667eea'};
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-left: 1rem;
                    flex-direction: column;
                    font-size: 0.8rem;
                ">
                    <div>${day.displayDate.split('/')[0]}</div>
                    <div style="font-size: 0.7rem;">${day.displayDate.split('/')[1]}</div>
                </div>
                <div class="report-details" style="flex: 1;">
                    <div class="report-name" style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">
                        ${isToday ? 'اليوم' : day.displayDate} ${isToday ? '🔥' : ''}
                    </div>
                    <div class="report-stats" style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666;">
                        <span><i class="fas fa-shopping-bag"></i> ${day.orders} طلب</span>
                        <span><i class="fas fa-check-circle"></i> ${day.completedOrders} مكتمل</span>
                        <span><i class="fas fa-money-bill-wave"></i> ${day.revenue.toFixed(2)} ج.م</span>
                    </div>
                </div>
            `;
            container.appendChild(dayDiv);
        });
        
        console.log('✅ تم عرض الأداء اليومي بنجاح');
    }

    // Helper functions
    loadCategoriesInSelect() {
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">-- اختر المجموعة --</option>';
        
        this.categories.forEach(category => {
            if (category.visible) {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            }
        });
    }
}

// Initialize Dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تهيئة Firebase Dashboard...');
    
    // Create dashboard instance
    window.dashboard = new Dashboard();
    
    console.log('✅ تم إنشاء Dashboard بنجاح');
});

console.log('✅ تم تحميل لوحة التحكم النظيفة والكاملة!');
// ===== ORDER FILTERING FUNCTIONS =====

// Filter orders by status
window.filterOrders = function(status) {
    console.log('🔍 فلترة الطلبات بحالة:', status);
    
    // Update active filter button
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    // Re-render orders with new filter
    if (window.dashboard) {
        window.dashboard.renderOrders();
    }
};

// Search orders
window.searchOrders = function() {
    const searchTerm = document.getElementById('orderSearch')?.value?.toLowerCase() || '';
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const customerName = row.cells[1]?.textContent?.toLowerCase() || '';
        const phone = row.cells[2]?.textContent?.toLowerCase() || '';
        const orderID = row.cells[0]?.textContent?.toLowerCase() || '';
        
        const matches = customerName.includes(searchTerm) || 
                       phone.includes(searchTerm) || 
                       orderID.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
};

// Quick update order status
window.quickUpdateOrderStatus = async function(orderId, newStatus) {
    if (!confirm(`هل أنت متأكد من تحديث حالة الطلب إلى "${newStatus}"؟`)) {
        return;
    }
    
    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: new Date()
        });
        
        // Update local data
        const orderIndex = window.dashboard.orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            window.dashboard.orders[orderIndex].status = newStatus;
        }
        
        // Re-render orders
        window.dashboard.renderOrders();
        showNotification(`تم تحديث حالة الطلب إلى "${newStatus}"`, 'success');
        
    } catch (error) {
        console.error('خطأ في تحديث حالة الطلب:', error);
        showNotification('حدث خطأ في تحديث حالة الطلب', 'error');
    }
};

// Modal Functions
window.openProductModal = function() {
    if (window.dashboard) {
        window.dashboard.loadCategoriesInSelect();
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
};

window.openCategoryModal = function() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
};

window.openStoreModal = function() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
};

window.openDeliveryModal = function() {
    const modal = document.getElementById('deliveryModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
};

window.openAddonModal = function() {
    const modal = document.getElementById('addonModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
};

window.openSuggestionModal = function() {
    const modal = document.getElementById('suggestionModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
};

// Close Modal Functions
window.closeProductModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    
    // إعادة تعيين النموذج والصورة
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    selectedImageData = null;
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    
    if (window.dashboard) {
        window.dashboard.editingProductID = null;
    }
};

window.closeCategoryModal = function() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    if (window.dashboard) {
        window.dashboard.editingCategoryID = null;
    }
};

window.closeStoreModal = function() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    
    // إعادة تعيين النموذج والصورة
    const form = document.getElementById('storeForm');
    if (form) form.reset();
    
    selectedStoreImageData = null;
    const imagePreview = document.getElementById('storeImagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    
    const fileInput = document.getElementById('storeImageFile');
    if (fileInput) fileInput.value = '';
    
    if (window.dashboard) {
        window.dashboard.editingStoreID = null;
    }
};

window.closeDeliveryModal = function() {
    const modal = document.getElementById('deliveryModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    if (window.dashboard) {
        window.dashboard.editingDeliveryID = null;
    }
};

window.closeAddonModal = function() {
    const modal = document.getElementById('addonModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    if (window.dashboard) {
        window.dashboard.editingAddonID = null;
    }
};

window.closeSuggestionModal = function() {
    const modal = document.getElementById('suggestionModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    
    // إعادة تعيين النموذج والصورة
    const form = document.getElementById('suggestionForm');
    if (form) form.reset();
    
    selectedSuggestionImageData = null;
    const imagePreview = document.getElementById('suggestionImagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    
    const fileInput = document.getElementById('suggestionImageFile');
    if (fileInput) fileInput.value = '';
    
    if (window.dashboard) {
        window.dashboard.editingSuggestionID = null;
    }
};

// Section Navigation
window.showSection = function(sectionName) {
    if (window.dashboard) {
        window.dashboard.showSection(sectionName);
    }
};

// Data Refresh
window.refreshData = function() {
    console.log('🔄 تحديث البيانات...');
    if (window.dashboard) {
        window.dashboard.loadAllData();
        showNotification('تم تحديث البيانات', 'success');
    }
};

// ===== IMAGE UPLOAD FUNCTIONS =====
let selectedImageData = null;
let selectedStoreImageData = null;
let selectedSuggestionImageData = null;

// دالة ضغط الصور
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // حساب الأبعاد الجديدة
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // رسم الصورة المضغوطة
            ctx.drawImage(img, 0, 0, width, height);
            
            // تحويل لـ Base64 مضغوط
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// رفع صور المنتجات
window.handleImageUpload = function(input) {
    console.log('📷 رفع صورة منتج...');
    handleGenericImageUpload(input, 'selectedImageData', 'imagePreview', 'منتج');
};

// رفع صور المحلات
window.handleStoreImageUpload = function(input) {
    console.log('🏪 رفع صورة محل...');
    handleGenericImageUpload(input, 'selectedStoreImageData', 'storeImagePreview', 'محل');
};

// رفع صور الاقتراحات
window.handleSuggestionImageUpload = function(input) {
    console.log('💡 رفع صورة اقتراح...');
    handleGenericImageUpload(input, 'selectedSuggestionImageData', 'suggestionImagePreview', 'اقتراح');
};

// دالة عامة لرفع الصور
function handleGenericImageUpload(input, dataVariable, previewId, itemType) {
    const file = input.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملف صورة صحيح', 'error');
        return;
    }
    
    // التحقق من حجم الملف (أقل من 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 10MB', 'error');
        return;
    }
    
    // عرض رسالة التحميل
    const preview = document.getElementById(previewId);
    preview.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #007bff; margin-bottom: 10px;"></i>
            <p style="color: #007bff; font-weight: bold;">جاري ضغط صورة ${itemType}...</p>
        </div>
    `;
    
    // ضغط الصورة (جودة أقل للصور الكبيرة)
    let quality = 0.8;
    if (file.size > 1024 * 1024) { // أكبر من 1MB
        quality = 0.6;
    }
    if (file.size > 2 * 1024 * 1024) { // أكبر من 2MB
        quality = 0.4;
    }
    
    compressImage(file, 600, quality).then(compressedImage => {
        // حساب حجم الصورة المضغوطة
        const sizeInKB = Math.round((compressedImage.length * 0.75) / 1024);
        
        // التحقق من حجم الصورة المضغوطة
        if (sizeInKB > 500) { // أكبر من 500KB
            showNotification('الصورة كبيرة جداً حتى بعد الضغط. جرب صورة أصغر', 'error');
            preview.innerHTML = '';
            return;
        }
        
        // حفظ الصورة في المتغير المناسب
        if (dataVariable === 'selectedImageData') {
            selectedImageData = compressedImage;
        } else if (dataVariable === 'selectedStoreImageData') {
            selectedStoreImageData = compressedImage;
        } else if (dataVariable === 'selectedSuggestionImageData') {
            selectedSuggestionImageData = compressedImage;
        }
        
        // عرض معاينة الصورة
        preview.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${compressedImage}" alt="معاينة" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 2px solid #28a745;">
                <div style="position: absolute; top: -10px; right: -10px; background: #28a745; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                    <i class="fas fa-check"></i>
                </div>
            </div>
            <p style="color: #28a745; margin-top: 10px; font-weight: bold;">
                <i class="fas fa-check-circle"></i> تم ضغط صورة ${itemType} بنجاح
            </p>
            <small style="color: #666;">حجم الصورة: ${sizeInKB} KB</small>
        `;
        
        showNotification(`تم ضغط صورة ${itemType} بنجاح (${sizeInKB} KB)`, 'success');
    }).catch(error => {
        console.error('خطأ في ضغط الصورة:', error);
        showNotification('حدث خطأ في معالجة الصورة', 'error');
        preview.innerHTML = '';
    });
}

// ===== SAVE FUNCTIONS =====
window.saveProduct = function() {
    console.log('💾 حفظ منتج...');
    
    const name = document.getElementById('productName')?.value?.trim();
    const price = parseFloat(document.getElementById('productPrice')?.value) || 0;
    const category = document.getElementById('productCategory')?.value?.trim();
    const desc = document.getElementById('productDesc')?.value?.trim();
    const visible = document.getElementById('productVisible')?.checked;
    
    if (!name || price <= 0) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // استخدام الصورة المرفوعة أو الصورة الافتراضية
    const imageUrl = selectedImageData || 'img/default.jpg';
    
    const productData = {
        name,
        price,
        category,
        desc,
        visible: visible !== false,
        images: [imageUrl],
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // عرض رسالة التحميل
    showNotification('جاري حفظ المنتج...', 'info');
    
    if (window.dashboard.editingProductID) {
        // تحديث منتج موجود
        console.log('🔄 تحديث منتج موجود:', window.dashboard.editingProductID);
        
        db.collection('products').doc(window.dashboard.editingProductID).update(productData).then(() => {
            console.log('✅ تم تحديث المنتج بنجاح');
            
            const productIndex = window.dashboard.products.findIndex(p => p.id === window.dashboard.editingProductID);
            if (productIndex > -1) {
                window.dashboard.products[productIndex] = { ...window.dashboard.products[productIndex], ...productData };
            }
            
            closeProductModal();
            window.dashboard.renderProducts();
            showNotification('تم تحديث المنتج بنجاح', 'success');
            window.dashboard.editingProductID = null;
            selectedImageData = null;
            
        }).catch(error => {
            console.error('❌ خطأ في تحديث المنتج:', error);
            
            // رسائل خطأ مفصلة
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لتحديث المنتجات', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('الخدمة غير متاحة حالياً، حاول مرة أخرى', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في تحديث المنتج: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
        
    } else {
        // إضافة منتج جديد
        console.log('➕ إضافة منتج جديد');
        
        db.collection('products').add(productData).then((docRef) => {
            console.log('✅ تم إضافة المنتج بنجاح:', docRef.id);
            
            window.dashboard.products.push({ id: docRef.id, ...productData });
            closeProductModal();
            window.dashboard.renderProducts();
            showNotification('تم إضافة المنتج بنجاح', 'success');
            
            // إعادة تعيين النموذج والصورة
            document.getElementById('productForm')?.reset();
            selectedImageData = null;
            document.getElementById('imagePreview').innerHTML = '';
            
        }).catch(error => {
            console.error('❌ خطأ في إضافة المنتج:', error);
            
            // رسائل خطأ مفصلة
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لإضافة منتجات', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('الخدمة غير متاحة حالياً، حاول مرة أخرى', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في إضافة المنتج: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
    }
};

window.saveCategory = function() {
    console.log('💾 حفظ مجموعة...');
    
    const name = document.getElementById('categoryName')?.value?.trim();
    const slug = document.getElementById('categorySlug')?.value?.trim();
    const desc = document.getElementById('categoryDesc')?.value?.trim();
    const visible = document.getElementById('categoryVisible')?.checked;
    
    if (!name || !slug) {
        alert('يرجى ملء الحقول المطلوبة');
        return;
    }
    
    const categoryData = {
        name,
        slug,
        desc,
        visible: visible !== false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingCategoryID) {
        // تحديث مجموعة موجودة
        db.collection('categories').doc(window.dashboard.editingCategoryID).update(categoryData).then(() => {
            const categoryIndex = window.dashboard.categories.findIndex(c => c.id === window.dashboard.editingCategoryID);
            if (categoryIndex > -1) {
                window.dashboard.categories[categoryIndex] = { ...window.dashboard.categories[categoryIndex], ...categoryData };
            }
            closeCategoryModal();
            window.dashboard.renderCategories();
            showNotification('تم تحديث المجموعة بنجاح', 'success');
            window.dashboard.editingCategoryID = null;
        }).catch(error => {
            console.error('خطأ في تحديث المجموعة:', error);
            showNotification('حدث خطأ في تحديث المجموعة', 'error');
        });
    } else {
        // إضافة مجموعة جديدة
        db.collection('categories').add(categoryData).then((docRef) => {
            window.dashboard.categories.push({ id: docRef.id, ...categoryData });
            closeCategoryModal();
            window.dashboard.renderCategories();
            showNotification('تم إضافة المجموعة بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('categoryForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة المجموعة:', error);
            showNotification('حدث خطأ في إضافة المجموعة', 'error');
        });
    }
};

window.saveStore = function() {
    console.log('💾 حفظ محل...');
    
    const name = document.getElementById('storeName')?.value?.trim();
    const phone = document.getElementById('storePhone')?.value?.trim();
    const address = document.getElementById('storeAddress')?.value?.trim();
    const visible = document.getElementById('storeVisible')?.checked;
    
    if (!name || !phone || !address) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // استخدام الصورة المرفوعة أو الصورة الافتراضية
    const imageUrl = selectedStoreImageData || 'img/icon.JPG';
    
    const storeData = {
        name,
        phone,
        address,
        visible: visible !== false,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // عرض رسالة التحميل
    showNotification('جاري حفظ المحل...', 'info');
    
    if (window.dashboard.editingStoreID) {
        // تحديث محل موجود
        console.log('🔄 تحديث محل موجود:', window.dashboard.editingStoreID);
        
        db.collection('stores').doc(window.dashboard.editingStoreID).update(storeData).then(() => {
            console.log('✅ تم تحديث المحل بنجاح');
            
            const storeIndex = window.dashboard.stores.findIndex(s => s.id === window.dashboard.editingStoreID);
            if (storeIndex > -1) {
                window.dashboard.stores[storeIndex] = { ...window.dashboard.stores[storeIndex], ...storeData };
            }
            
            closeStoreModal();
            window.dashboard.renderStores();
            showNotification('تم تحديث المحل بنجاح', 'success');
            window.dashboard.editingStoreID = null;
            selectedStoreImageData = null;
            
        }).catch(error => {
            console.error('❌ خطأ في تحديث المحل:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لتحديث المحلات', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في تحديث المحل: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
        
    } else {
        // إضافة محل جديد
        console.log('➕ إضافة محل جديد');
        
        db.collection('stores').add(storeData).then((docRef) => {
            console.log('✅ تم إضافة المحل بنجاح:', docRef.id);
            
            window.dashboard.stores.push({ id: docRef.id, ...storeData });
            closeStoreModal();
            window.dashboard.renderStores();
            showNotification('تم إضافة المحل بنجاح', 'success');
            
            // إعادة تعيين النموذج والصورة
            document.getElementById('storeForm')?.reset();
            selectedStoreImageData = null;
            document.getElementById('storeImagePreview').innerHTML = '';
            
        }).catch(error => {
            console.error('❌ خطأ في إضافة المحل:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لإضافة محلات', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في إضافة المحل: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
    }
};

window.saveDeliveryArea = function() {
    console.log('💾 حفظ منطقة توصيل...');
    
    const name = document.getElementById('deliveryName')?.value?.trim();
    const fee = parseFloat(document.getElementById('deliveryFee')?.value) || 0;
    const desc = document.getElementById('deliveryDesc')?.value?.trim();
    const active = document.getElementById('deliveryActive')?.checked;
    
    if (!name || fee < 0) {
        alert('يرجى ملء الحقول المطلوبة');
        return;
    }
    
    const deliveryData = {
        name,
        fee,
        desc,
        active: active !== false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingDeliveryID) {
        // تحديث منطقة موجودة
        db.collection('deliveryAreas').doc(window.dashboard.editingDeliveryID).update(deliveryData).then(() => {
            const deliveryIndex = window.dashboard.deliveryAreas.findIndex(d => d.id === window.dashboard.editingDeliveryID);
            if (deliveryIndex > -1) {
                window.dashboard.deliveryAreas[deliveryIndex] = { ...window.dashboard.deliveryAreas[deliveryIndex], ...deliveryData };
            }
            closeDeliveryModal();
            window.dashboard.renderDeliveryAreas();
            showNotification('تم تحديث منطقة التوصيل بنجاح', 'success');
            window.dashboard.editingDeliveryID = null;
        }).catch(error => {
            console.error('خطأ في تحديث منطقة التوصيل:', error);
            showNotification('حدث خطأ في تحديث منطقة التوصيل', 'error');
        });
    } else {
        // إضافة منطقة جديدة
        db.collection('deliveryAreas').add(deliveryData).then((docRef) => {
            window.dashboard.deliveryAreas.push({ id: docRef.id, ...deliveryData });
            closeDeliveryModal();
            window.dashboard.renderDeliveryAreas();
            showNotification('تم إضافة منطقة التوصيل بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('deliveryForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة منطقة التوصيل:', error);
            showNotification('حدث خطأ في إضافة منطقة التوصيل', 'error');
        });
    }
};

window.saveAddon = function() {
    console.log('💾 حفظ إضافة...');
    
    const name = document.getElementById('addonName')?.value?.trim();
    const price = parseFloat(document.getElementById('addonPrice')?.value) || 0;
    const desc = document.getElementById('addonDesc')?.value?.trim();
    const category = document.getElementById('addonCategory')?.value?.trim();
    const active = document.getElementById('addonActive')?.checked;
    
    if (!name || price <= 0) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const addonData = {
        name,
        price,
        desc,
        category,
        active: active !== false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingAddonID) {
        // تحديث إضافة موجودة
        db.collection('addons').doc(window.dashboard.editingAddonID).update(addonData).then(() => {
            const addonIndex = window.dashboard.addons.findIndex(a => a.id === window.dashboard.editingAddonID);
            if (addonIndex > -1) {
                window.dashboard.addons[addonIndex] = { ...window.dashboard.addons[addonIndex], ...addonData };
            }
            closeAddonModal();
            window.dashboard.renderAddons();
            showNotification('تم تحديث الإضافة بنجاح', 'success');
            window.dashboard.editingAddonID = null;
        }).catch(error => {
            console.error('خطأ في تحديث الإضافة:', error);
            showNotification('حدث خطأ في تحديث الإضافة', 'error');
        });
    } else {
        // إضافة إضافة جديدة
        db.collection('addons').add(addonData).then((docRef) => {
            if (!window.dashboard.addons) window.dashboard.addons = [];
            window.dashboard.addons.push({ id: docRef.id, ...addonData });
            closeAddonModal();
            window.dashboard.renderAddons();
            showNotification('تم إضافة الإضافة بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('addonForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة الإضافة:', error);
            showNotification('حدث خطأ في إضافة الإضافة', 'error');
        });
    }
};

window.saveSuggestion = function() {
    console.log('💾 حفظ اقتراح...');
    
    const name = document.getElementById('suggestionName')?.value?.trim();
    const price = parseFloat(document.getElementById('suggestionPrice')?.value) || 0;
    const desc = document.getElementById('suggestionDesc')?.value?.trim();
    const active = document.getElementById('suggestionActive')?.checked;
    
    if (!name || price <= 0) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // استخدام الصورة المرفوعة أو الصورة الافتراضية
    const imageUrl = selectedSuggestionImageData || 'img/default.jpg';
    
    const suggestionData = {
        name,
        price,
        desc,
        active: active !== false,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // عرض رسالة التحميل
    showNotification('جاري حفظ الاقتراح...', 'info');
    
    if (window.dashboard.editingSuggestionID) {
        // تحديث اقتراح موجود
        console.log('🔄 تحديث اقتراح موجود:', window.dashboard.editingSuggestionID);
        
        db.collection('suggestions').doc(window.dashboard.editingSuggestionID).update(suggestionData).then(() => {
            console.log('✅ تم تحديث الاقتراح بنجاح');
            
            const suggestionIndex = window.dashboard.suggestions.findIndex(s => s.id === window.dashboard.editingSuggestionID);
            if (suggestionIndex > -1) {
                window.dashboard.suggestions[suggestionIndex] = { ...window.dashboard.suggestions[suggestionIndex], ...suggestionData };
            }
            
            closeSuggestionModal();
            window.dashboard.renderSuggestions();
            showNotification('تم تحديث الاقتراح بنجاح', 'success');
            window.dashboard.editingSuggestionID = null;
            selectedSuggestionImageData = null;
            
        }).catch(error => {
            console.error('❌ خطأ في تحديث الاقتراح:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لتحديث الاقتراحات', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في تحديث الاقتراح: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
        
    } else {
        // إضافة اقتراح جديد
        console.log('➕ إضافة اقتراح جديد');
        
        db.collection('suggestions').add(suggestionData).then((docRef) => {
            console.log('✅ تم إضافة الاقتراح بنجاح:', docRef.id);
            
            window.dashboard.suggestions.push({ id: docRef.id, ...suggestionData });
            closeSuggestionModal();
            window.dashboard.renderSuggestions();
            showNotification('تم إضافة الاقتراح بنجاح', 'success');
            
            // إعادة تعيين النموذج والصورة
            document.getElementById('suggestionForm')?.reset();
            selectedSuggestionImageData = null;
            document.getElementById('suggestionImagePreview').innerHTML = '';
            
        }).catch(error => {
            console.error('❌ خطأ في إضافة الاقتراح:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('ليس لديك صلاحية لإضافة اقتراحات', 'error');
            } else if (error.message && error.message.includes('maximum size')) {
                showNotification('حجم البيانات كبير جداً، جرب صورة أصغر', 'error');
            } else {
                showNotification('حدث خطأ في إضافة الاقتراح: ' + (error.message || 'خطأ غير معروف'), 'error');
            }
        });
    }
};
// ===== EDIT FUNCTIONS =====
window.editProduct = function(productId) {
    console.log('✏️ تعديل منتج:', productId);
    const product = window.dashboard.products.find(p => p.id === productId);
    if (!product) return;
    
    // تحميل المجموعات أولاً
    window.dashboard.loadCategoriesInSelect();
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDesc').value = product.desc || '';
    document.getElementById('productVisible').checked = product.visible !== false;
    
    window.dashboard.editingProductID = productId;
    openProductModal();
};

window.editCategory = function(categoryId) {
    console.log('✏️ تعديل مجموعة:', categoryId);
    const category = window.dashboard.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('categoryName').value = category.name || '';
    document.getElementById('categorySlug').value = category.slug || '';
    document.getElementById('categoryDesc').value = category.desc || '';
    document.getElementById('categoryVisible').checked = category.visible !== false;
    
    window.dashboard.editingCategoryID = categoryId;
    openCategoryModal();
};

window.editStore = function(storeId) {
    console.log('✏️ تعديل محل:', storeId);
    const store = window.dashboard.stores.find(s => s.id === storeId);
    if (!store) return;
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('storeName').value = store.name || '';
    document.getElementById('storePhone').value = store.phone || '';
    document.getElementById('storeAddress').value = store.address || '';
    document.getElementById('storeVisible').checked = store.visible !== false;
    
    window.dashboard.editingStoreID = storeId;
    openStoreModal();
};

window.editDeliveryArea = function(areaId) {
    console.log('✏️ تعديل منطقة توصيل:', areaId);
    const area = window.dashboard.deliveryAreas.find(d => d.id === areaId);
    if (!area) return;
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('deliveryName').value = area.name || '';
    document.getElementById('deliveryFee').value = area.fee || '';
    document.getElementById('deliveryDesc').value = area.desc || '';
    document.getElementById('deliveryActive').checked = area.active !== false;
    
    window.dashboard.editingDeliveryID = areaId;
    openDeliveryModal();
};

window.editAddon = function(addonId) {
    console.log('✏️ تعديل إضافة:', addonId);
    const addon = window.dashboard.addons.find(a => a.id === addonId);
    if (!addon) return;
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('addonName').value = addon.name || '';
    document.getElementById('addonPrice').value = addon.price || '';
    document.getElementById('addonDesc').value = addon.desc || '';
    document.getElementById('addonCategory').value = addon.category || '';
    document.getElementById('addonActive').checked = addon.active !== false;
    
    window.dashboard.editingAddonID = addonId;
    openAddonModal();
};

window.editSuggestion = function(suggestionId) {
    console.log('✏️ تعديل اقتراح:', suggestionId);
    const suggestion = window.dashboard.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('suggestionName').value = suggestion.name || '';
    document.getElementById('suggestionPrice').value = suggestion.price || '';
    document.getElementById('suggestionDesc').value = suggestion.desc || '';
    document.getElementById('suggestionActive').checked = suggestion.active !== false;
    
    window.dashboard.editingSuggestionID = suggestionId;
    openSuggestionModal();
};

// ===== TOGGLE FUNCTIONS =====
window.toggleProduct = function(productId) {
    console.log('🔄 تبديل حالة منتج:', productId);
    const product = window.dashboard.products.find(p => p.id === productId);
    if (!product) return;
    
    const newStatus = !product.visible;
    
    db.collection('products').doc(productId).update({
        visible: newStatus
    }).then(() => {
        product.visible = newStatus;
        window.dashboard.renderProducts();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} المنتج`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة المنتج:', error);
        showNotification('حدث خطأ في تحديث حالة المنتج', 'error');
    });
};

window.toggleCategory = function(categoryId) {
    console.log('🔄 تبديل حالة مجموعة:', categoryId);
    const category = window.dashboard.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const newStatus = !category.visible;
    
    db.collection('categories').doc(categoryId).update({
        visible: newStatus
    }).then(() => {
        category.visible = newStatus;
        window.dashboard.renderCategories();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} المجموعة`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة المجموعة:', error);
        showNotification('حدث خطأ في تحديث حالة المجموعة', 'error');
    });
};

window.toggleStore = function(storeId) {
    console.log('🔄 تبديل حالة محل:', storeId);
    const store = window.dashboard.stores.find(s => s.id === storeId);
    if (!store) return;
    
    const newStatus = !store.visible;
    
    db.collection('stores').doc(storeId).update({
        visible: newStatus
    }).then(() => {
        store.visible = newStatus;
        window.dashboard.renderStores();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} المحل`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة المحل:', error);
        showNotification('حدث خطأ في تحديث حالة المحل', 'error');
    });
};

window.toggleDeliveryArea = function(areaId) {
    console.log('🔄 تبديل حالة منطقة توصيل:', areaId);
    const area = window.dashboard.deliveryAreas.find(d => d.id === areaId);
    if (!area) return;
    
    const newStatus = !area.active;
    
    db.collection('deliveryAreas').doc(areaId).update({
        active: newStatus
    }).then(() => {
        area.active = newStatus;
        window.dashboard.renderDeliveryAreas();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} منطقة التوصيل`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة منطقة التوصيل:', error);
        showNotification('حدث خطأ في تحديث حالة منطقة التوصيل', 'error');
    });
};

window.toggleAddon = function(addonId) {
    console.log('🔄 تبديل حالة إضافة:', addonId);
    const addon = window.dashboard.addons.find(a => a.id === addonId);
    if (!addon) return;
    
    const newStatus = !addon.active;
    
    db.collection('addons').doc(addonId).update({
        active: newStatus
    }).then(() => {
        addon.active = newStatus;
        window.dashboard.renderAddons();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الإضافة`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة الإضافة:', error);
        showNotification('حدث خطأ في تحديث حالة الإضافة', 'error');
    });
};

window.toggleSuggestion = function(suggestionId) {
    console.log('🔄 تبديل حالة اقتراح:', suggestionId);
    const suggestion = window.dashboard.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    const newStatus = !suggestion.active;
    
    db.collection('suggestions').doc(suggestionId).update({
        active: newStatus
    }).then(() => {
        suggestion.active = newStatus;
        window.dashboard.renderSuggestions();
        showNotification(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الاقتراح`, 'success');
    }).catch(error => {
        console.error('خطأ في تحديث حالة الاقتراح:', error);
        showNotification('حدث خطأ في تحديث حالة الاقتراح', 'error');
    });
};

// ===== DELETE FUNCTIONS =====
window.deleteProduct = function(productId) {
    console.log('🗑️ حذف منتج:', productId);
    const product = window.dashboard.products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
        db.collection('products').doc(productId).delete().then(() => {
            window.dashboard.products = window.dashboard.products.filter(p => p.id !== productId);
            window.dashboard.renderProducts();
            showNotification('تم حذف المنتج بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف المنتج:', error);
            showNotification('حدث خطأ في حذف المنتج', 'error');
        });
    }
};

window.deleteCategory = function(categoryId) {
    console.log('🗑️ حذف مجموعة:', categoryId);
    const category = window.dashboard.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (confirm(`هل أنت متأكد من حذف المجموعة "${category.name}"؟`)) {
        db.collection('categories').doc(categoryId).delete().then(() => {
            window.dashboard.categories = window.dashboard.categories.filter(c => c.id !== categoryId);
            window.dashboard.renderCategories();
            showNotification('تم حذف المجموعة بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف المجموعة:', error);
            showNotification('حدث خطأ في حذف المجموعة', 'error');
        });
    }
};

window.deleteStore = function(storeId) {
    console.log('🗑️ حذف محل:', storeId);
    const store = window.dashboard.stores.find(s => s.id === storeId);
    if (!store) return;
    
    if (confirm(`هل أنت متأكد من حذف المحل "${store.name}"؟`)) {
        db.collection('stores').doc(storeId).delete().then(() => {
            window.dashboard.stores = window.dashboard.stores.filter(s => s.id !== storeId);
            window.dashboard.renderStores();
            showNotification('تم حذف المحل بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف المحل:', error);
            showNotification('حدث خطأ في حذف المحل', 'error');
        });
    }
};

window.deleteDeliveryArea = function(areaId) {
    console.log('🗑️ حذف منطقة توصيل:', areaId);
    const area = window.dashboard.deliveryAreas.find(d => d.id === areaId);
    if (!area) return;
    
    if (confirm(`هل أنت متأكد من حذف منطقة التوصيل "${area.name}"؟`)) {
        db.collection('deliveryAreas').doc(areaId).delete().then(() => {
            window.dashboard.deliveryAreas = window.dashboard.deliveryAreas.filter(d => d.id !== areaId);
            window.dashboard.renderDeliveryAreas();
            showNotification('تم حذف منطقة التوصيل بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف منطقة التوصيل:', error);
            showNotification('حدث خطأ في حذف منطقة التوصيل', 'error');
        });
    }
};

window.deleteAddon = function(addonId) {
    console.log('🗑️ حذف إضافة:', addonId);
    const addon = window.dashboard.addons.find(a => a.id === addonId);
    if (!addon) return;
    
    if (confirm(`هل أنت متأكد من حذف الإضافة "${addon.name}"؟`)) {
        db.collection('addons').doc(addonId).delete().then(() => {
            window.dashboard.addons = window.dashboard.addons.filter(a => a.id !== addonId);
            window.dashboard.renderAddons();
            showNotification('تم حذف الإضافة بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف الإضافة:', error);
            showNotification('حدث خطأ في حذف الإضافة', 'error');
        });
    }
};

window.deleteSuggestion = function(suggestionId) {
    console.log('🗑️ حذف اقتراح:', suggestionId);
    const suggestion = window.dashboard.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    if (confirm(`هل أنت متأكد من حذف الاقتراح "${suggestion.name}"؟`)) {
        db.collection('suggestions').doc(suggestionId).delete().then(() => {
            window.dashboard.suggestions = window.dashboard.suggestions.filter(s => s.id !== suggestionId);
            window.dashboard.renderSuggestions();
            showNotification('تم حذف الاقتراح بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في حذف الاقتراح:', error);
            showNotification('حدث خطأ في حذف الاقتراح', 'error');
        });
    }
};
// ===== ORDER AND CUSTOMER FUNCTIONS =====

// Filter Orders by Status
window.filterOrders = function(status) {
    console.log('🔍 تصفية الطلبات:', status);
    
    // Update active button
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    // Re-render orders
    if (window.dashboard) {
        window.dashboard.renderOrders();
    }
};

// Filter Customers by Type
window.filterCustomers = function(type) {
    console.log('🔍 تصفية العملاء:', type);
    
    // Update active button
    document.querySelectorAll('.customer-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Re-render customers
    if (window.dashboard) {
        window.dashboard.renderCustomers();
    }
};

// Quick Update Order Status
window.quickUpdateOrderStatus = function(orderId, newStatus) {
    console.log('⚡ تحديث سريع لحالة الطلب:', orderId, newStatus);
    
    if (!orderId || !newStatus) return;
    
    const order = window.dashboard.orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('لم يتم العثور على الطلب', 'error');
        return;
    }
    
    // Confirm cancellation
    if (newStatus === 'إلغاء') {
        if (!confirm(`هل أنت متأكد من إلغاء الطلب #${order.orderID || orderId.substring(0, 8)}؟`)) {
            return;
        }
    }
    
    // Update in Firebase
    db.collection('orders').doc(orderId).update({
        status: newStatus,
        updatedAt: new Date()
    }).then(() => {
        // Update local data
        order.status = newStatus;
        
        // Re-render orders
        window.dashboard.renderOrders();
        
        // Show success message
        showNotification(`تم تحديث حالة الطلب إلى "${newStatus}" بنجاح`, 'success');
        
    }).catch(error => {
        console.error('خطأ في تحديث حالة الطلب:', error);
        showNotification('حدث خطأ في تحديث حالة الطلب', 'error');
    });
};

// Enhanced View Order Details
window.viewOrderDetails = function(orderId) {
    console.log('👁️ عرض تفاصيل الطلب:', orderId);
    
    // Test modal first
    const modal = document.getElementById('orderModal');
    if (!modal) {
        console.error('❌ Modal غير موجود في الصفحة');
        showNotification('خطأ: Modal غير موجود', 'error');
        return;
    }
    
    // Get order data
    let order = null;
    if (window.dashboard && window.dashboard.orders) {
        order = window.dashboard.orders.find(o => o.id === orderId);
    }
    
    // If no order found, use sample data
    if (!order) {
        console.log('⚠️ لم يتم العثور على الطلب، استخدام بيانات تجريبية');
        const sampleOrders = {
            'order1': {
                customerName: 'أحمد محمد',
                phone: '01xxxxxxxxx',
                address: 'شارع الجمهورية، المنصورة',
                area: 'المنصورة',
                status: 'توصيل',
                total: 150.50,
                deliveryFee: 15.00,
                subtotal: 135.50,
                productsTotal: 135.50,
                items: [
                    { 
                        name: 'كبدة سكندراني', 
                        title: 'كبدة سكندراني',
                        quantity: 2, 
                        count: 2,
                        price: 45.00, 
                        image: 'img/default.jpg',
                        img: 'img/default.jpg'
                    },
                    { 
                        name: 'سجق', 
                        title: 'سجق',
                        quantity: 1, 
                        count: 1,
                        price: 35.00, 
                        image: 'img/default.jpg',
                        img: 'img/default.jpg'
                    },
                    { 
                        name: 'مخ', 
                        title: 'مخ',
                        quantity: 1, 
                        count: 1,
                        price: 25.50, 
                        image: 'img/default.jpg',
                        img: 'img/default.jpg'
                    }
                ]
            },
            'order2': {
                customerName: 'فاطمة علي',
                phone: '01xxxxxxxxx',
                address: 'شارع البحر، الإسكندرية',
                area: 'الإسكندرية',
                status: 'تحضير',
                total: 200.00,
                deliveryFee: 20.00,
                subtotal: 180.00,
                productsTotal: 180.00,
                items: [
                    { 
                        name: 'كبدة سكندراني', 
                        title: 'كبدة سكندراني',
                        quantity: 3, 
                        count: 3,
                        price: 45.00, 
                        image: 'img/default.jpg',
                        img: 'img/default.jpg'
                    },
                    { 
                        name: 'كلاوي', 
                        title: 'كلاوي',
                        quantity: 2, 
                        count: 2,
                        price: 30.00, 
                        image: 'img/default.jpg',
                        img: 'img/default.jpg'
                    }
                ]
            }
        };
        order = sampleOrders[orderId] || sampleOrders['order1'];
    }
    
    // Fill modal with order data safely
    const elements = {
        'modalOrderID': order.orderID || orderId.substring(0, 8),
        'modalCustomerName': order.customerName || order.name || '-',
        'modalCustomerPhone': order.phone || '-',
        'modalCustomerAddress': order.address || '-',
        'modalCustomerArea': order.area || '-'
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Add driver information
    const driverNameElement = document.getElementById('modalDriverName');
    const driverPhoneElement = document.getElementById('modalDriverPhone');
    
    if (order.driverId && order.driverName) {
        if (driverNameElement) driverNameElement.textContent = order.driverName;
        
        // Get driver phone from drivers list
        const driver = dashboard.drivers?.find(d => d.id === order.driverId);
        if (driverPhoneElement) {
            driverPhoneElement.textContent = driver?.phone || '-';
        }
    } else {
        if (driverNameElement) driverNameElement.textContent = 'لم يتم التخصيص';
        if (driverPhoneElement) driverPhoneElement.textContent = '-';
    }
    
    // Format date and time
    const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate || new Date());
    const modalOrderDate = document.getElementById('modalOrderDate');
    const modalOrderTime = document.getElementById('modalOrderTime');
    
    if (modalOrderDate) modalOrderDate.textContent = orderDate.toLocaleDateString('ar-EG');
    if (modalOrderTime) modalOrderTime.textContent = orderDate.toLocaleTimeString('ar-EG');
    
    // Fill products - GET REAL DATA FROM FIREBASE
    const productsContainer = document.getElementById('modalOrderProducts');
    if (productsContainer) {
        console.log('🔥 جلب المنتجات الحقيقية من Firebase...');
        
        // Clear first
        productsContainer.innerHTML = '';
        
        console.log('📦 بيانات الطلب:', order);
        
        // البيانات محفوظة باسم products مش items
        const orderProducts = order.products || order.items || [];
        console.log('📦 منتجات الطلب:', orderProducts);
        
        if (orderProducts && orderProducts.length > 0) {
            console.log('✅ تم العثور على منتجات:', orderProducts.length);
            
            orderProducts.forEach((product, index) => {
                console.log(`📦 منتج ${index + 1}:`, product);
                
                const productDiv = document.createElement('div');
                productDiv.style.cssText = `
                    display: flex !important;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid #e9ecef;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                
                productDiv.innerHTML = `
                    <img src="${product.image || product.img || 'img/default.jpg'}" alt="${product.name || product.title || 'منتج'}" 
                         style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">${product.name || product.title || 'منتج غير محدد'}</div>
                        <div style="color: #666; font-size: 0.9rem;">الكمية: ${product.quantity || product.count || 1}</div>
                        ${product.price ? `<div style="color: #666; font-size: 0.9rem;">السعر: ${product.price} ج.م</div>` : ''}
                        ${product.category ? `<div style="color: #666; font-size: 0.9rem;">الفئة: ${product.category}</div>` : ''}
                        ${product.addons && product.addons.length > 0 ? `
                            <div style="color: #666; font-size: 0.9rem;">الإضافات: ${product.addons.map(addon => addon.name || addon).join(', ')}</div>
                        ` : ''}
                    </div>
                    <div style="font-weight: bold; color: #667eea;">
                        ${product.totalPrice ? product.totalPrice.toFixed(2) + ' ج.م' : 
                          (product.price && product.quantity ? (product.price * product.quantity).toFixed(2) + ' ج.م' : 'غير محدد')}
                    </div>
                `;
                productsContainer.appendChild(productDiv);
            });
            
            console.log('✅ تم عرض المنتجات الحقيقية من Firebase');
        } else {
            console.log('⚠️ لا توجد منتجات في هذا الطلب من Firebase');
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                    <i class="fas fa-shopping-cart" style="font-size: 2.5em; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 1.1em;">لا توجد منتجات محددة لهذا الطلب في Firebase</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9em; color: #888;">تحقق من بيانات الطلب في Firebase</p>
                    <button onclick="forceDisplayProducts('${orderId}')" class="btn btn-primary btn-sm mt-2">
                        <i class="fas fa-sync"></i> إعادة المحاولة
                    </button>
                </div>
            `;
        }
        
    } else {
        console.error('❌ عنصر المنتجات غير موجود: modalOrderProducts');
    }
    
    // Fill summary - GET REAL DATA FROM FIREBASE
    const productsTotal = order.productsTotal || order.subtotal || 0;
    const deliveryFee = order.serviceCharge || order.deliveryFee || order.shippingFee || 0;
    const total = order.total || order.grandTotal || 0;
    
    console.log('💰 ملخص الطلب الحقيقي من Firebase:', { 
        productsTotal, 
        deliveryFee, 
        total,
        serviceCharge: order.serviceCharge,
        orderData: order 
    });
    
    // Update summary elements with real data
    const modalProductsTotal = document.getElementById('modalProductsTotal');
    const modalServiceTotal = document.getElementById('modalServiceTotal');
    const modalOrderTotal = document.getElementById('modalOrderTotal');
    
    if (modalProductsTotal) {
        modalProductsTotal.textContent = productsTotal.toFixed(2) + ' ج.م';
        modalProductsTotal.style.fontWeight = 'bold';
        modalProductsTotal.style.color = '#28a745';
        console.log('✅ تم تحديث سعر المنتجات من Firebase:', productsTotal.toFixed(2) + ' ج.م');
    }
    
    if (modalServiceTotal) {
        modalServiceTotal.textContent = deliveryFee.toFixed(2) + ' ج.م';
        modalServiceTotal.style.fontWeight = 'bold';
        modalServiceTotal.style.color = '#28a745';
        console.log('✅ تم تحديث رسوم التوصيل من Firebase:', deliveryFee.toFixed(2) + ' ج.م');
    }
    
    if (modalOrderTotal) {
        modalOrderTotal.textContent = total.toFixed(2) + ' ج.م';
        modalOrderTotal.style.fontWeight = 'bold';
        modalOrderTotal.style.color = '#28a745';
        modalOrderTotal.style.fontSize = '1.2rem';
        console.log('✅ تم تحديث الإجمالي من Firebase:', total.toFixed(2) + ' ج.م');
    }
    
    // Set current status
    const modalOrderStatus = document.getElementById('modalOrderStatus');
    if (modalOrderStatus) {
        modalOrderStatus.value = order.status || 'جديد';
    }
    
    // Show/hide cancel button based on status
    const cancelBtn = document.getElementById('cancelOrderBtn');
    const currentStatus = order.status || 'جديد';
    if (cancelBtn) {
        if (currentStatus !== 'توصيل' && currentStatus !== 'إلغاء') {
            cancelBtn.style.display = 'inline-block';
        } else {
            cancelBtn.style.display = 'none';
        }
    }
    
    // Store current order ID
    window.currentOrderId = orderId;
    
    // Show modal with multiple methods
    console.log('🎯 فتح Modal...');
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    console.log('✅ تم فتح Modal بنجاح');
};

// View Order Details from Customer Modal
// Update Order Status from Modal
window.updateOrderStatus = function() {
    const newStatus = document.getElementById('modalOrderStatus').value;
    const orderId = window.currentOrderId;
    
    if (!orderId || !newStatus) return;
    
    quickUpdateOrderStatus(orderId, newStatus);
    closeOrderModal();
};

// Close Order Modal
window.closeOrderModal = function() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    window.currentOrderId = null;
};

// View Customer Orders
window.viewCustomerOrders = function(customerPhone) {
    console.log('👁️ عرض طلبات العميل:', customerPhone);
    
    const customerOrders = window.dashboard.orders.filter(order => order.phone === customerPhone);
    
    if (customerOrders.length === 0) {
        showNotification('لا توجد طلبات لهذا العميل', 'error');
        return;
    }
    
    // Get customer info
    const customer = customerOrders[0];
    const customerName = customer.customerName || customer.name || 'غير محدد';
    
    // Fill modal header
    document.getElementById('modalCustomerName2').textContent = customerName;
    document.getElementById('modalCustomerPhone2').textContent = customerPhone;
    document.getElementById('modalCustomerOrdersCount').textContent = customerOrders.length;
    
    // Calculate total spent (only completed orders)
    const totalSpent = customerOrders
        .filter(order => order.status === 'توصيل')
        .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    
    document.getElementById('modalCustomerTotalSpent').textContent = totalSpent.toFixed(2) + ' ج.م';
    
    // Fill orders list
    const ordersContainer = document.getElementById('modalCustomerOrdersList');
    ordersContainer.innerHTML = '';
    
    // Sort orders by date (newest first)
    customerOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt || a.orderDate);
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt || b.orderDate);
        return dateB - dateA;
    });
    
    customerOrders.forEach(order => {
        const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('ar-EG');
        const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        const orderDiv = document.createElement('div');
        orderDiv.className = 'customer-order-item';
        orderDiv.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <strong>طلب #${order.orderID || order.id.substring(0, 8)}</strong>
                    <span class="order-date">${formattedDate} - ${formattedTime}</span>
                    ${order.driverName ? `<span class="driver-info"><i class="fas fa-motorcycle"></i> ${order.driverName}</span>` : ''}
                </div>
                <div class="order-status">
                    <span class="status ${window.dashboard.getStatusClass(order.status || 'جديد')}">
                        ${order.status || 'جديد'}
                    </span>
                    <strong class="order-total">${(order.total || 0).toFixed(2)} ج.م</strong>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetailsFromCustomer('${order.id}')">
                    <i class="fas fa-eye"></i> عرض التفاصيل
                </button>
                <button class="btn btn-sm btn-success" onclick="printOrder('${order.id}')">
                    <i class="fas fa-print"></i> طباعة
                </button>
            </div>
        `;
        ordersContainer.appendChild(orderDiv);
    });
    
    // Show modal
    const modal = document.getElementById('customerOrdersModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
};

// View Order Details from Customer Modal
window.viewOrderDetailsFromCustomer = function(orderId) {
    // Close customer orders modal
    closeCustomerOrdersModal();
    
    // Show order details modal
    viewOrderDetails(orderId);
    
    // Show back button
    document.getElementById('backToCustomerBtn').style.display = 'inline-block';
    document.getElementById('backToCustomerBtn').onclick = () => {
        closeOrderModal();
        // Get customer phone from the order
        const order = window.dashboard.orders.find(o => o.id === orderId);
        if (order) {
            viewCustomerOrders(order.phone);
        }
    };
};

// Close Customer Orders Modal
window.closeCustomerOrdersModal = function() {
    const modal = document.getElementById('customerOrdersModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
};

// Back to Customer Orders
window.backToCustomerOrders = function() {
    const orderId = window.currentOrderId;
    if (orderId) {
        const order = window.dashboard.orders.find(o => o.id === orderId);
        if (order) {
            closeOrderModal();
            viewCustomerOrders(order.phone);
        }
    }
};

// WhatsApp Customer
window.whatsappCustomer = function(phone) {
    console.log('📱 إرسال واتساب للعميل:', phone);
    if (phone) {
        const message = encodeURIComponent('مرحباً، نتواصل معك من مطعم سكندر للكبدة السكندراني');
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
};

// Enhanced Call Customer
window.callCustomer = function(phone) {
    console.log('📞 الاتصال بالعميل:', phone);
    if (phone) {
        // Clean phone number
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        window.open(`tel:${cleanPhone}`, '_self');
    }
};

// Print Order
// Print Order - Simple direct printing like order details modal
// Print Order - Simple direct printing matching order details modal
window.printOrder = function(orderId) {
    console.log('🖨️ طباعة فاتورة مع معاينة للطلب:', orderId);
    
    const order = window.dashboard.orders.find(o => o.id === (orderId || window.currentOrderId));
    if (!order) {
        showNotification('لم يتم العثور على الطلب', 'error');
        return;
    }
    
    // Get real products data
    const orderProducts = order.products || order.items || [];
    const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
    
    // Calculate totals using real Firebase data
    const productsTotal = order.productsTotal || 0;
    const serviceCharge = order.serviceCharge || order.deliveryFee || 0;
    const totalAmount = order.total || 0;
    
    // Create receipt content matching the order details modal exactly
    const receiptContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة #${order.orderID || order.id.substring(0, 8)}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                    color: #333;
                }
                
                .receipt-header {
                    text-align: center;
                    border-bottom: 3px solid #007bff;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                
                .restaurant-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 5px;
                }
                
                .receipt-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
                
                .order-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #666;
                }
                
                .products-section {
                    margin-bottom: 20px;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #e9ecef;
                }
                
                .product-item {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 10px;
                }
                
                .product-name {
                    font-weight: bold;
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 5px;
                }
                
                .product-details {
                    display: flex;
                    justify-content: space-between;
                    color: #666;
                    font-size: 13px;
                }
                
                .summary-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .summary-item:last-child {
                    border-bottom: none;
                }
                
                .total-section {
                    background: #007bff;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                
                .receipt-footer {
                    text-align: center;
                    border-top: 2px solid #e9ecef;
                    padding-top: 15px;
                    color: #666;
                }
                
                @media print {
                    body { margin: 0; padding: 15px; }
                    .receipt-header { page-break-inside: avoid; }
                    .products-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <div class="restaurant-name">🍽️ سكندر للكبدة السكندراني</div>
                <div class="receipt-title">فاتورة رقم #${order.orderID || order.id.substring(0, 8)}</div>
            </div>
            
            <div class="order-info">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">العميل:</span>
                        <span>${order.customerName || order.name || 'غير محدد'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">الهاتف:</span>
                        <span>${order.phone || 'غير محدد'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">المنطقة:</span>
                        <span>${order.area || 'غير محدد'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">التاريخ:</span>
                        <span>${orderDate.toLocaleDateString('ar-EG')} ${orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    ${order.driverName ? `
                    <div class="info-item">
                        <span class="info-label">الطيار:</span>
                        <span>${order.driverName}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">الحالة:</span>
                        <span>${order.status || 'جديد'}</span>
                    </div>
                </div>
            </div>
            
            <div class="products-section">
                <div class="section-title">المنتجات المطلوبة</div>
                ${orderProducts.length > 0 ? orderProducts.map((product, index) => `
                    <div class="product-item">
                        <div class="product-name">${index + 1}. ${product.name || product.title || 'منتج غير محدد'}</div>
                        <div class="product-details">
                            <span>الكمية: ${product.quantity || product.count || 1}</span>
                            <span>السعر: ${(product.price || 0).toFixed(2)} ج.م</span>
                            <span>الإجمالي: ${((product.price || 0) * (product.quantity || 1)).toFixed(2)} ج.م</span>
                        </div>
                    </div>
                `).join('') : '<div style="text-align: center; color: #666; padding: 20px;">لا توجد منتجات محددة</div>'}
            </div>
            
            <div class="summary-section">
                <div class="summary-item">
                    <span>سعر المنتجات:</span>
                    <span style="font-weight: bold; color: #28a745;">${productsTotal.toFixed(2)} ج.م</span>
                </div>
                <div class="summary-item">
                    <span>رسوم التوصيل:</span>
                    <span style="font-weight: bold; color: #28a745;">${serviceCharge.toFixed(2)} ج.م</span>
                </div>
            </div>
            
            <div class="total-section">
                الإجمالي: ${totalAmount.toFixed(2)} ج.م
            </div>
            
            <div class="receipt-footer">
                <p><strong>شكراً لاختياركم مطعم سكندر للكبدة السكندراني</strong></p>
                <p>نتطلع لخدمتكم دائماً</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </body>
        </html>
    `;
    
    // Open print preview window
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Auto focus and show print dialog
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };
    
    console.log('✅ تم فتح معاينة الطباعة');
};

// Show print size selection modal
function showPrintSizeModal(orderId) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        direction: rtl;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            min-width: 300px;
        ">
            <h3 style="margin-bottom: 1.5rem; color: #333;">اختر مقاس ورق الطباعة</h3>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                <button onclick="printOrder('${orderId}', '58mm'); document.body.removeChild(this.closest('.print-modal'))" 
                        style="
                            flex: 1;
                            padding: 1rem;
                            background: #667eea;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: background 0.3s;
                        "
                        onmouseover="this.style.background='#5a6fd8'"
                        onmouseout="this.style.background='#667eea'">
                    <i class="fas fa-receipt" style="display: block; font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    58mm<br>
                    <small>ورق صغير</small>
                </button>
                
                <button onclick="printOrder('${orderId}', '80mm'); document.body.removeChild(this.closest('.print-modal'))" 
                        style="
                            flex: 1;
                            padding: 1rem;
                            background: #28a745;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: background 0.3s;
                        "
                        onmouseover="this.style.background='#218838'"
                        onmouseout="this.style.background='#28a745'">
                    <i class="fas fa-receipt" style="display: block; font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    80mm<br>
                    <small>ورق عادي</small>
                </button>
            </div>
            
            <button onclick="document.body.removeChild(this.closest('.print-modal'))" 
                    style="
                        padding: 0.5rem 2rem;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                إلغاء
            </button>
        </div>
    `;
    
    modal.className = 'print-modal';
    document.body.appendChild(modal);
    
    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Quick print functions
window.print58mm = function(orderId) {
    printOrder(orderId, '58mm');
};

window.print80mm = function(orderId) {
    printOrder(orderId, '80mm');
};

// Enhanced Search Orders
window.searchOrders = function() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#ordersTable tr');
    
    rows.forEach(row => {
        const customerName = row.cells[1]?.textContent.toLowerCase() || '';
        const customerPhone = row.cells[2]?.textContent.toLowerCase() || '';
        const orderID = row.cells[0]?.textContent.toLowerCase() || '';
        const area = row.cells[3]?.textContent.toLowerCase() || '';
        
        const matches = customerName.includes(searchTerm) || 
                       customerPhone.includes(searchTerm) || 
                       orderID.includes(searchTerm) ||
                       area.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
};

// Enhanced Search Customers
window.searchCustomers = function() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#customersTable tr');
    
    rows.forEach(row => {
        const customerName = row.cells[0]?.textContent.toLowerCase() || '';
        const customerPhone = row.cells[1]?.textContent.toLowerCase() || '';
        
        const matches = customerName.includes(searchTerm) || 
                       customerPhone.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
};

// ===== REPORTS FUNCTIONS =====

// Generate Reports with Period Selection
window.generateReports = function() {
    console.log('📊 إنشاء التقارير...');
    
    if (window.dashboard) {
        // Show loading message
        showNotification('جاري إنشاء التقارير...', 'info');
        
        setTimeout(() => {
            window.dashboard.renderReports();
            
            // Show success message
            const successMsg = document.getElementById('reportsSuccessMessage');
            if (successMsg) {
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 3000);
            }
            
            showNotification('تم إنشاء التقارير بنجاح', 'success');
        }, 1000);
    }
};

// Force Reports (refresh all data)
window.forceReports = function() {
    console.log('🔄 إجبار تحديث التقارير...');
    
    if (window.dashboard) {
        showNotification('جاري تحديث البيانات...', 'info');
        
        // Reload all data first
        window.dashboard.loadAllData().then(() => {
            window.dashboard.renderReports();
            showNotification('تم تحديث التقارير بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في تحديث التقارير:', error);
            showNotification('حدث خطأ في تحديث التقارير', 'error');
        });
    }
};

// Export Reports to PDF
window.exportReports = function() {
    console.log('📄 تصدير التقارير إلى PDF...');
    
    const reportsSection = document.getElementById('reports');
    if (!reportsSection) {
        showNotification('لا توجد تقارير للتصدير', 'error');
        return;
    }
    
    // Create print-friendly content
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('ar-EG');
    
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقارير سكندر للكبدة السكندراني - ${currentDate}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    direction: rtl; 
                    margin: 20px;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .reports-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                .report-card { 
                    border: 1px solid #ddd; 
                    padding: 15px; 
                    border-radius: 8px; 
                    text-align: center;
                    background: #f8f9fa;
                }
                .report-card h3 {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                }
                .report-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #333;
                }
                .report-section { 
                    margin-bottom: 30px; 
                    page-break-inside: avoid;
                }
                .report-section h3 { 
                    border-bottom: 2px solid #667eea; 
                    padding-bottom: 10px;
                    color: #667eea;
                }
                .report-item { 
                    display: flex; 
                    align-items: center; 
                    padding: 10px; 
                    border-bottom: 1px solid #eee; 
                }
                .report-rank { 
                    margin-left: 15px; 
                    font-weight: bold;
                    color: #667eea;
                }
                .report-details { 
                    flex: 1; 
                }
                .report-name { 
                    font-weight: bold; 
                    margin-bottom: 5px; 
                }
                .report-stats { 
                    font-size: 0.9em; 
                    color: #666; 
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                    color: #666;
                }
                @media print { 
                    body { margin: 0; }
                    .report-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🍽️ سكندر للكبدة السكندراني</h1>
                <h2>تقرير المبيعات والأداء</h2>
                <p>تاريخ التقرير: ${currentDate}</p>
            </div>
            ${reportsSection.innerHTML}
            <div class="footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام إدارة سكندر للكبدة السكندراني</p>
                <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
        showNotification('تم تحضير التقرير للطباعة', 'success');
    }, 500);
};

// Print Reports
window.printReports = function() {
    console.log('🖨️ طباعة التقارير...');
    exportReports(); // Same as export for now
};

// Toggle Custom Date Inputs
window.toggleCustomDateInputs = function() {
    const period = document.getElementById('reportPeriod')?.value;
    const customInputs = document.getElementById('customDateInputs');
    
    if (customInputs) {
        customInputs.style.display = period === 'custom' ? 'flex' : 'none';
    }
    
    // Update period text
    const periodText = document.getElementById('reportPeriodText');
    if (periodText) {
        const periodLabels = {
            'today': 'اليوم',
            'yesterday': 'أمس',
            'week': 'هذا الأسبوع',
            'lastWeek': 'الأسبوع الماضي',
            'month': 'هذا الشهر',
            'lastMonth': 'الشهر الماضي',
            'year': 'هذا العام',
            'lastYear': 'العام الماضي',
            'custom': 'فترة مخصصة',
            'all': 'جميع الفترات'
        };
        periodText.textContent = periodLabels[period] || 'هذا الشهر';
    }
    
    // Auto-refresh reports when period changes
    if (window.dashboard) {
        console.log('🔄 تحديث التقارير للفترة الجديدة:', period);
        setTimeout(() => {
            window.dashboard.renderReports();
        }, 100);
    }
};

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Debounce Function for Search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced Search with Debounce
const debouncedOrderSearch = debounce(searchOrders, 300);
const debouncedCustomerSearch = debounce(searchCustomers, 300);

// Update search event listeners
document.addEventListener('DOMContentLoaded', function() {
    const orderSearchInput = document.getElementById('orderSearch');
    const customerSearchInput = document.getElementById('customerSearch');
    
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', debouncedOrderSearch);
    }
    
    if (customerSearchInput) {
        customerSearchInput.addEventListener('input', debouncedCustomerSearch);
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            const searchInput = activeSection.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.style.display = 'none';
            openModal.classList.remove('show');
        }
    }
});

// Auto-refresh data every 5 minutes
setInterval(() => {
    if (window.dashboard && document.visibilityState === 'visible') {
        console.log('🔄 تحديث تلقائي للبيانات...');
        window.dashboard.loadAllData();
    }
}, 5 * 60 * 1000); // 5 minutes

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && window.dashboard) {
        // Refresh data when page becomes visible
        window.dashboard.loadAllData();
    }
});

console.log('✅ تم تحميل جميع الوظائف الإضافية والمحسنة للوحة التحكم!');

// ===== QUICK OVERVIEW FUNCTIONS =====

// Render Quick Overview
function renderQuickOverview() {
    if (!window.dashboard || !window.dashboard.orders) return;
    
    console.log('🔥 عرض النظرة السريعة');
    
    renderRecentOrdersMini();
    renderTopProductsMini();
    renderTodayStatsMini();
    updateNotificationBadge();
}

// Render Recent Orders Mini
function renderRecentOrdersMini() {
    const container = document.getElementById('recentOrdersMini');
    if (!container) return;
    
    console.log('📋 عرض آخر الطلبات');
    
    // Sort orders by creation date (newest first) and get real data
    const recentOrders = window.dashboard.orders
        .sort((a, b) => {
            const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt || a.orderDate);
            const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt || b.orderDate);
            return dateB - dateA;
        })
        .slice(0, 5);
    
    console.log('📦 آخر الطلبات:', recentOrders);
    
    container.innerHTML = '';
    
    if (recentOrders.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center p-3">
                <i class="fas fa-shopping-cart fa-2x mb-2"></i>
                <p>لا توجد طلبات حديثة</p>
                <small>الطلبات الجديدة ستظهر هنا</small>
            </div>
        `;
        return;
    }
    
    recentOrders.forEach(order => {
        const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
        const timeAgo = getTimeAgo(orderDate);
        const orderTotal = parseFloat(order.total) || 0;
        const customerName = order.customerName || order.name || 'عميل';
        const customerPhone = order.phone || '';
        const orderStatus = order.status || 'جديد';
        const orderArea = order.area || '';
        
        console.log('📋 طلب:', {
            id: order.id,
            customer: customerName,
            phone: customerPhone,
            total: orderTotal,
            status: orderStatus,
            area: orderArea,
            date: orderDate
        });
        
        const orderDiv = document.createElement('div');
        orderDiv.className = 'mini-item';
        orderDiv.style.cssText = `
            cursor: pointer;
            transition: all 0.2s;
            border-right: 4px solid ${getStatusColor(orderStatus)};
        `;
        
        orderDiv.innerHTML = `
            <div class="mini-item-icon status-${getStatusClass(orderStatus)}">
                ${getStatusIcon(orderStatus)}
            </div>
            <div class="mini-item-content">
                <div class="mini-item-title">
                    ${customerName}
                    ${customerPhone ? `<small class="text-muted">(${customerPhone})</small>` : ''}
                </div>
                <div class="mini-item-subtitle">
                    ${timeAgo} • ${orderStatus}
                    ${orderArea ? ` • ${orderArea}` : ''}
                </div>
            </div>
            <div class="mini-item-value" style="color: ${getStatusColor(orderStatus)};">
                ${orderTotal.toFixed(2)} ج.م
            </div>
        `;
        
        // Add hover effect
        orderDiv.onmouseenter = () => {
            orderDiv.style.transform = 'translateX(-5px)';
            orderDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        };
        
        orderDiv.onmouseleave = () => {
            orderDiv.style.transform = 'translateX(0)';
            orderDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };
        
        // Click to view order details
        orderDiv.onclick = () => {
            console.log('👁️ عرض تفاصيل الطلب:', order.id);
            viewOrderDetails(order.id);
        };
        
        container.appendChild(orderDiv);
    });
    
    console.log('✅ تم عرض آخر الطلبات بنجاح');
}

// Render Top Products Mini
function renderTopProductsMini() {
    const container = document.getElementById('topProductsMini');
    if (!container) return;
    
    // Calculate top products from completed orders
    const productStats = {};
    const completedOrders = window.dashboard.orders.filter(order => order.status === 'توصيل');
    
    completedOrders.forEach(order => {
        const orderProducts = order.products || order.items || [];
        orderProducts.forEach(product => {
            const productName = product.name || product.title || 'منتج غير محدد';
            if (!productStats[productName]) {
                productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
            }
            productStats[productName].quantity += product.quantity || 1;
            productStats[productName].revenue += (product.totalPrice || (product.price * product.quantity)) || 0;
        });
    });
    
    const topProducts = Object.values(productStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (topProducts.length === 0) {
        container.innerHTML = '<div class="text-muted text-center p-3">لا توجد بيانات منتجات</div>';
        return;
    }
    
    topProducts.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'mini-item';
        productDiv.innerHTML = `
            <div class="mini-item-icon" style="background: #ffd700; color: #333;">
                #${index + 1}
            </div>
            <div class="mini-item-content">
                <div class="mini-item-title">${product.name}</div>
                <div class="mini-item-subtitle">تم بيع ${product.quantity} قطعة</div>
            </div>
            <div class="mini-item-value">${product.revenue.toFixed(2)} ج.م</div>
        `;
        container.appendChild(productDiv);
    });
}

// Render Today Stats Mini
function renderTodayStatsMini() {
    const container = document.getElementById('todayStatsMini');
    if (!container) return;
    
    console.log('📊 عرض إحصائيات اليوم الحقيقية');
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    console.log('📅 فترة اليوم:', todayStart, 'إلى', todayEnd);
    
    // Filter today's orders using real Firebase data
    const todayOrders = window.dashboard.orders.filter(order => {
        const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
        return orderDate >= todayStart && orderDate <= todayEnd;
    });
    
    console.log('📦 طلبات اليوم:', todayOrders.length, todayOrders);
    
    // Calculate real statistics
    const completedToday = todayOrders.filter(order => order.status === 'توصيل');
    const newOrdersToday = todayOrders.filter(order => order.status === 'جديد');
    const preparingToday = todayOrders.filter(order => order.status === 'تحضير' || order.status === 'تأكيد');
    
    // Calculate real revenue using correct field names
    const revenueToday = completedToday.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total) || 0;
        console.log('💰 طلب مكتمل:', order.id, 'المبلغ:', orderTotal);
        return sum + orderTotal;
    }, 0);
    
    // Calculate delivery fees using serviceCharge (real Firebase field)
    const deliveryFeesToday = completedToday.reduce((sum, order) => {
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        return sum + deliveryFee;
    }, 0);
    
    // Calculate products revenue (total - delivery fees)
    const productsRevenueToday = revenueToday - deliveryFeesToday;
    
    console.log('📊 إحصائيات اليوم الحقيقية:', {
        totalOrders: todayOrders.length,
        completedOrders: completedToday.length,
        newOrders: newOrdersToday.length,
        preparingOrders: preparingToday.length,
        totalRevenue: revenueToday,
        productsRevenue: productsRevenueToday,
        deliveryFees: deliveryFeesToday
    });
    
    container.innerHTML = '';
    
    const stats = [
        { 
            icon: '📦', 
            title: 'إجمالي الطلبات', 
            value: todayOrders.length, 
            color: '#667eea',
            subtitle: 'طلب اليوم'
        },
        { 
            icon: '✅', 
            title: 'طلبات مكتملة', 
            value: completedToday.length, 
            color: '#28a745',
            subtitle: 'تم التوصيل'
        },
        { 
            icon: '🔴', 
            title: 'طلبات جديدة', 
            value: newOrdersToday.length, 
            color: '#dc3545',
            subtitle: 'تحتاج معالجة'
        },
        { 
            icon: '🟡', 
            title: 'قيد التحضير', 
            value: preparingToday.length, 
            color: '#ffc107',
            subtitle: 'جاري التحضير'
        },
        { 
            icon: '💰', 
            title: 'إيرادات اليوم', 
            value: revenueToday.toFixed(2) + ' ج.م', 
            color: '#17a2b8',
            subtitle: 'إجمالي المبيعات'
        },
        { 
            icon: '🛍️', 
            title: 'إيرادات المنتجات', 
            value: productsRevenueToday.toFixed(2) + ' ج.م', 
            color: '#6f42c1',
            subtitle: 'بدون رسوم التوصيل'
        },
        { 
            icon: '🚚', 
            title: 'رسوم التوصيل', 
            value: deliveryFeesToday.toFixed(2) + ' ج.م', 
            color: '#fd7e14',
            subtitle: 'إجمالي رسوم اليوم'
        }
    ];
    
    // Show only non-zero stats or important ones
    const filteredStats = stats.filter(stat => {
        if (typeof stat.value === 'string') {
            return parseFloat(stat.value) > 0 || stat.title === 'إجمالي الطلبات';
        }
        return stat.value > 0 || stat.title === 'إجمالي الطلبات';
    });
    
    if (filteredStats.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center p-3">
                <i class="fas fa-calendar-day fa-2x mb-2"></i>
                <p>لا توجد طلبات اليوم بعد</p>
                <small>ابدأ يومك بأول طلب!</small>
            </div>
        `;
        return;
    }
    
    filteredStats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.className = 'mini-item';
        statDiv.style.cssText = `
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        
        statDiv.innerHTML = `
            <div class="mini-item-icon" style="background: ${stat.color}; color: white; font-size: 1rem;">
                ${stat.icon}
            </div>
            <div class="mini-item-content">
                <div class="mini-item-title">${stat.title}</div>
                <div class="mini-item-subtitle">${stat.subtitle}</div>
            </div>
            <div class="mini-item-value" style="color: ${stat.color}; font-weight: bold;">
                ${stat.value}
            </div>
        `;
        
        // Add hover effect
        statDiv.onmouseenter = () => {
            statDiv.style.transform = 'translateY(-2px)';
            statDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        };
        
        statDiv.onmouseleave = () => {
            statDiv.style.transform = 'translateY(0)';
            statDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };
        
        // Add click action for relevant stats
        if (stat.title === 'طلبات جديدة' && newOrdersToday.length > 0) {
            statDiv.onclick = () => {
                showSection('orders');
                setTimeout(() => filterOrders('جديد'), 100);
            };
        } else if (stat.title === 'طلبات مكتملة' && completedToday.length > 0) {
            statDiv.onclick = () => {
                showSection('orders');
                setTimeout(() => filterOrders('توصيل'), 100);
            };
        } else if (stat.title === 'قيد التحضير' && preparingToday.length > 0) {
            statDiv.onclick = () => {
                showSection('orders');
                setTimeout(() => filterOrders('تحضير'), 100);
            };
        }
        
        container.appendChild(statDiv);
    });
    
    console.log('✅ تم عرض إحصائيات اليوم الحقيقية بنجاح');
}

// Update Notification Badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const newOrders = window.dashboard.orders.filter(order => order.status === 'جديد').length;
    
    badge.textContent = newOrders;
    
    if (newOrders > 0) {
        badge.classList.remove('hidden');
        badge.style.display = 'flex';
    } else {
        badge.classList.add('hidden');
        badge.style.display = 'none';
    }
}

// Show Notifications
window.showNotifications = function() {
    console.log('🔔 عرض الإشعارات');
    
    const newOrders = window.dashboard.orders.filter(order => order.status === 'جديد');
    
    if (newOrders.length === 0) {
        showNotification('لا توجد إشعارات جديدة', 'info');
        return;
    }
    
    // Switch to orders section and filter new orders
    showSection('orders');
    setTimeout(() => {
        filterOrders('جديد');
    }, 100);
    
    showNotification(`لديك ${newOrders.length} طلب جديد`, 'info');
};

// Helper Functions
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
}

function getStatusIcon(status) {
    const icons = {
        'جديد': '🔴',
        'تأكيد': '🔵',
        'تحضير': '🟡',
        'جاهز': '🔵',
        'توصيل': '✅',
        'إلغاء': '❌'
    };
    return icons[status] || '📦';
}

function getStatusClass(status) {
    const classes = {
        'جديد': 'new',
        'تأكيد': 'confirmed',
        'تحضير': 'preparing',
        'جاهز': 'ready',
        'توصيل': 'delivered',
        'إلغاء': 'cancelled'
    };
    return classes[status] || 'new';
}

function getStatusColor(status) {
    const colors = {
        'جديد': '#dc3545',
        'تأكيد': '#007bff',
        'تحضير': '#ffc107',
        'جاهز': '#17a2b8',
        'توصيل': '#28a745',
        'إلغاء': '#6c757d'
    };
    return colors[status] || '#dc3545';
}

// Auto-refresh quick overview every 30 seconds
setInterval(() => {
    if (window.dashboard && document.visibilityState === 'visible') {
        const currentSection = document.querySelector('.section.active');
        if (currentSection && currentSection.id === 'dashboard') {
            renderQuickOverview();
        }
    }
}, 30000);

console.log('✅ تم تحميل وظائف النظرة السريعة والإشعارات!');
// Enhanced Quick Overview with Real-time Updates
function enhanceQuickOverview() {
    // Add real-time clock
    const clockElement = document.createElement('div');
    clockElement.id = 'realTimeClock';
    clockElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        clockElement.innerHTML = `
            <div style="font-size: 1.1rem;">${timeString}</div>
            <div style="font-size: 0.8rem; opacity: 0.9;">${dateString}</div>
        `;
    }
    
    // Add clock to page if not exists
    if (!document.getElementById('realTimeClock')) {
        document.body.appendChild(clockElement);
        updateClock();
        setInterval(updateClock, 1000);
    }
}

// Call enhance function when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(enhanceQuickOverview, 2000);
});

console.log('✅ تم تحميل التحسينات الإضافية للنظرة السريعة!');
// Debug function to check order data structure
window.debugOrderData = function(orderId) {
    const order = window.dashboard.orders.find(o => o.id === orderId);
    if (order) {
        console.log('🔍 تشخيص بيانات الطلب:', orderId);
        console.log('📦 الطلب الكامل:', order);
        console.log('🛍️ المنتجات (products):', order.products);
        console.log('📋 العناصر (items):', order.items);
        console.log('💰 الإجمالي:', order.total);
        console.log('🚚 رسوم التوصيل (serviceCharge):', order.serviceCharge);
        console.log('🚚 رسوم التوصيل (deliveryFee):', order.deliveryFee);
        console.log('💵 إجمالي المنتجات:', order.productsTotal);
        
        // Show in notification
        const productsCount = (order.products || order.items || []).length;
        showNotification(`الطلب يحتوي على ${productsCount} منتج - تحقق من Console للتفاصيل`, 'info');
    } else {
        console.log('❌ لم يتم العثور على الطلب:', orderId);
        showNotification('لم يتم العثور على الطلب', 'error');
    }
};

// Enhanced modal products display with better error handling
function forceDisplayProducts(orderId) {
    console.log('🔧 إجبار عرض المنتجات للطلب:', orderId);
    
    const order = window.dashboard.orders.find(o => o.id === orderId);
    if (!order) {
        console.log('❌ لم يتم العثور على الطلب');
        return;
    }
    
    const productsContainer = document.getElementById('modalOrderProducts');
    if (!productsContainer) {
        console.log('❌ عنصر المنتجات غير موجود');
        return;
    }
    
    // Clear container
    productsContainer.innerHTML = '';
    
    // Try multiple data sources
    let orderProducts = [];
    
    if (order.products && order.products.length > 0) {
        orderProducts = order.products;
        console.log('✅ تم العثور على منتجات في order.products:', orderProducts);
    } else if (order.items && order.items.length > 0) {
        orderProducts = order.items;
        console.log('✅ تم العثور على منتجات في order.items:', orderProducts);
    } else {
        console.log('⚠️ لا توجد منتجات في الطلب');
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <h4>لا توجد منتجات في هذا الطلب</h4>
                <p>قد يكون هناك خطأ في بيانات الطلب أو لم يتم حفظ المنتجات بشكل صحيح</p>
                <button onclick="debugOrderData('${orderId}')" class="btn btn-warning btn-sm mt-2">
                    <i class="fas fa-bug"></i> تشخيص البيانات
                </button>
            </div>
        `;
        return;
    }
    
    // Display products
    orderProducts.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        `;
        
        productDiv.onmouseenter = () => productDiv.style.transform = 'translateY(-2px)';
        productDiv.onmouseleave = () => productDiv.style.transform = 'translateY(0)';
        
        const productName = product.name || product.title || `منتج ${index + 1}`;
        const productPrice = product.price || 0;
        const productQuantity = product.quantity || product.count || 1;
        const productTotal = product.totalPrice || (productPrice * productQuantity) || 0;
        const productImage = product.image || product.img || 'img/default.jpg';
        
        productDiv.innerHTML = `
            <img src="${productImage}" alt="${productName}" 
                 style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid #e9ecef;"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNERUUyRTYiLz4KPC9zdmc+'">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #333; margin-bottom: 0.5rem; font-size: 1.1rem;">
                    ${productName}
                </div>
                <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666;">
                    <span><i class="fas fa-shopping-cart"></i> الكمية: ${productQuantity}</span>
                    <span><i class="fas fa-tag"></i> السعر: ${productPrice.toFixed(2)} ج.م</span>
                    ${product.category ? `<span><i class="fas fa-folder"></i> ${product.category}</span>` : ''}
                </div>
                ${product.addons && product.addons.length > 0 ? `
                    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #667eea;">
                        <i class="fas fa-plus-circle"></i> الإضافات: ${product.addons.map(addon => addon.name || addon).join(', ')}
                    </div>
                ` : ''}
            </div>
            <div style="text-align: center;">
                <div style="font-weight: bold; color: #667eea; font-size: 1.2rem;">
                    ${productTotal.toFixed(2)} ج.م
                </div>
                <div style="font-size: 0.8rem; color: #666;">
                    الإجمالي
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productDiv);
    });
    
    console.log(`✅ تم عرض ${orderProducts.length} منتج بنجاح`);
}

console.log('✅ تم تحميل وظائف التشخيص والإصلاح!');
// Print Dropdown Functions
window.togglePrintDropdown = function(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('printDropdownMenu');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // Update chevron icon
        const chevron = event.target.querySelector('.fa-chevron-up, .fa-chevron-down');
        if (chevron) {
            chevron.className = isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }
};

window.hidePrintDropdown = function() {
    const dropdown = document.getElementById('printDropdownMenu');
    if (dropdown) {
        dropdown.style.display = 'none';
        
        // Reset chevron icon
        const chevron = document.querySelector('.dropdown-toggle .fa-chevron-down, .dropdown-toggle .fa-chevron-up');
        if (chevron) {
            chevron.className = 'fas fa-chevron-up';
        }
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('printDropdownMenu');
    const toggle = document.querySelector('.dropdown-toggle');
    
    if (dropdown && toggle && !toggle.contains(event.target) && !dropdown.contains(event.target)) {
        hidePrintDropdown();
    }
});

// Enhanced print functions with size validation
window.validateAndPrint = function(orderId, size) {
    if (!orderId) {
        showNotification('لم يتم تحديد الطلب للطباعة', 'error');
        return;
    }
    
    if (!size || (size !== '58mm' && size !== '80mm' && size !== 'select')) {
        showNotification('مقاس الورق غير صحيح', 'error');
        return;
    }
    
    printOrder(orderId, size);
};

console.log('✅ تم تحميل وظائف الطباعة المتعددة المقاسات!');
// Quick Silent Print Function
window.quickPrint = function(orderId) {
    console.log('⚡ طباعة سريعة صامتة للطلب:', orderId);
    
    const order = window.dashboard.orders.find(o => o.id === (orderId || window.currentOrderId));
    if (!order) {
        showNotification('لم يتم العثور على الطلب', 'error');
        return;
    }
    
    // Create minimal print content for fastest printing
    const orderProducts = order.products || order.items || [];
    const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate || new Date());
    const productsTotal = order.productsTotal || 0;
    const serviceCharge = order.serviceCharge || order.deliveryFee || 0;
    const totalAmount = order.total || 0;
    
    const quickContent = `
        <html><head><meta charset="UTF-8"><style>
        body{font-family:monospace;font-size:9px;width:58mm;margin:0;padding:2mm;direction:rtl}
        .h{text-align:center;border-bottom:2px solid #000;padding-bottom:4px;margin-bottom:6px}
        .t{font-size:12px;font-weight:bold}
        .s{font-size:8px;margin:2px 0}
        .p{margin:4px 0;padding:3px;background:#f5f5f5;border-radius:2px}
        .total{background:#000;color:white;padding:4px;text-align:center;font-weight:bold;margin:6px 0}
        </style></head><body>
        <div class="h">
            <div class="t">🍽️ سكندر للكبدة</div>
            <div class="s">فاتورة #${order.orderID || order.id.substring(0, 6)}</div>
            <div class="s">${orderDate.toLocaleDateString('ar-EG')} ${orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div class="s"><b>العميل:</b> ${(order.customerName || 'عميل').substring(0, 12)}</div>
        <div class="s"><b>الهاتف:</b> ${order.phone || 'غير محدد'}</div>
        <div class="s"><b>المنطقة:</b> ${(order.area || 'غير محدد').substring(0, 10)}</div>
        <div style="border-top:1px dashed #000;margin:4px 0;padding-top:4px">
        ${orderProducts.map((product, index) => `
            <div class="p">
                <div><b>${index + 1}. ${(product.name || 'منتج').substring(0, 15)}</b></div>
                <div>${(product.price || 0).toFixed(2)} ج.م × ${product.quantity || 1} = ${(product.totalPrice || (product.price * product.quantity) || 0).toFixed(2)} ج.م</div>
            </div>
        `).join('')}
        </div>
        <div style="border-top:1px solid #000;padding-top:4px;margin-top:4px">
            <div class="s">المنتجات: ${productsTotal.toFixed(2)} ج.م</div>
            <div class="s">التوصيل: ${serviceCharge.toFixed(2)} ج.م</div>
        </div>
        <div class="total">الإجمالي: ${totalAmount.toFixed(2)} ج.م</div>
        <div style="text-align:center;font-size:7px;margin-top:6px;border-top:1px dashed #000;padding-top:4px">
            شكراً لاختياركم سكندر<br>نتطلع لخدمتكم دائماً
        </div>
        </body></html>
    `;
    
    // Create hidden iframe for silent printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '58mm';
    iframe.style.height = 'auto';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(quickContent);
    iframeDoc.close();
    
    // Print immediately
    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remove iframe after printing
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
            
            showNotification('تم إرسال الفاتورة للطباعة', 'success');
        } catch (error) {
            console.log('خطأ في الطباعة السريعة:', error);
            document.body.removeChild(iframe);
            // Fallback to regular print
            printOrder(orderId);
        }
    }, 200);
};

// Auto-print function for thermal printers - True Silent Printing
window.thermalPrint = function(orderId) {
    console.log('🖨️ طباعة حرارية مباشرة صامتة للطلب:', orderId);
    
    const order = window.dashboard.orders.find(o => o.id === (orderId || window.currentOrderId));
    if (!order) {
        showNotification('لم يتم العثور على الطلب', 'error');
        return;
    }
    
    // Get real products data
    const orderProducts = order.products || order.items || [];
    const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate || new Date());
    const productsTotal = order.productsTotal || 0;
    const serviceCharge = order.serviceCharge || order.deliveryFee || 0;
    const totalAmount = order.total || 0;
    
    // Create simple receipt content for 58mm thermal printer
    const receiptHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>فاتورة #${order.orderID || order.id.substring(0, 8)}</title>
    <style>
        @page { 
            size: 58mm auto; 
            margin: 0; 
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.2;
            margin: 0;
            padding: 2mm;
            direction: rtl;
            width: 54mm;
            color: #000;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
        }
        .restaurant-name {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .receipt-number {
            font-size: 10px;
            font-weight: bold;
        }
        .info-line {
            font-size: 8px;
            margin-bottom: 1px;
        }
        .products {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 3px 0;
            margin: 5px 0;
        }
        .product {
            margin-bottom: 3px;
            font-size: 8px;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 1px;
        }
        .product-details {
            font-size: 7px;
        }
        .summary-line {
            font-size: 8px;
            margin-bottom: 1px;
            display: flex;
            justify-content: space-between;
        }
        .total {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 3px 0;
            margin: 5px 0;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 5px;
            border-top: 1px dashed #000;
            padding-top: 3px;
            font-size: 6px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">🍽️ سكندر للكبدة</div>
        <div class="receipt-number">فاتورة #${order.orderID || order.id.substring(0, 8)}</div>
    </div>
    
    <div class="info-line"><strong>العميل:</strong> ${order.customerName || order.name || 'غير محدد'}</div>
    <div class="info-line"><strong>الهاتف:</strong> ${order.phone || 'غير محدد'}</div>
    <div class="info-line"><strong>المنطقة:</strong> ${order.area || 'غير محدد'}</div>
    <div class="info-line"><strong>التاريخ:</strong> ${orderDate.toLocaleDateString('ar-EG')} ${orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
    
    <div class="products">
        ${orderProducts.length > 0 ? orderProducts.map((product, index) => `
            <div class="product">
                <div class="product-name">${index + 1}. ${product.name || product.title || 'منتج غير محدد'}</div>
                <div class="product-details">
                    الكمية: ${product.quantity || product.count || 1} × ${(product.price || 0).toFixed(2)} ج.م = ${((product.price || 0) * (product.quantity || 1)).toFixed(2)} ج.م
                </div>
            </div>
        `).join('') : '<div style="text-align: center;">لا توجد منتجات محددة</div>'}
    </div>
    
    <div class="summary-line">
        <span>المنتجات:</span>
        <span>${productsTotal.toFixed(2)} ج.م</span>
    </div>
    <div class="summary-line">
        <span>رسوم التوصيل:</span>
        <span>${serviceCharge.toFixed(2)} ج.م</span>
    </div>
    
    <div class="total">
        الإجمالي: ${totalAmount.toFixed(2)} ج.م
    </div>
    
    <div class="footer">
        <div>شكراً لاختياركم مطعم سكندر</div>
        <div>نتطلع لخدمتكم دائماً</div>
        <div>طُبع: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
</body>
</html>`;
    
    // Method 1: Try direct window print (most compatible)
    try {
        const printWindow = window.open('', '_blank', 'width=300,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
        // Auto print when loaded
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 100);
        };
        
        showNotification('تم إرسال الفاتورة للطباعة المباشرة', 'success');
        console.log('✅ تم إرسال الفاتورة للطباعة المباشرة');
        
    } catch (error) {
        console.log('فشل في الطباعة المباشرة، محاولة الطريقة البديلة...');
        
        // Method 2: Fallback to iframe method
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:58mm;height:auto;border:none;';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(receiptHTML);
        doc.close();
        
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 1000);
                
                showNotification('تم إرسال الفاتورة للطباعة', 'success');
            } catch (printError) {
                console.log('خطأ في الطباعة:', printError);
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                showNotification('حدث خطأ في الطباعة', 'error');
            }
        }, 200);
    }
};

console.log('✅ تم تحميل وظائف الطباعة السريعة والصامتة!');
console.log('📷 تم تحميل نظام رفع الصور المحسن للمنتجات!');
console.log('🗜️ نظام ضغط الصور يدعم حتى 10MB ويضغط لأقل من 500KB!');
console.log('🏪 تم إضافة رفع الصور للمحلات والاقتراحات!');
// ===== MOBILE RESPONSIVENESS ENHANCEMENTS =====

// Mobile-specific initialization
function initMobileFeatures() {
    // Add mobile class to body
    if (window.innerWidth <= 767) {
        document.body.classList.add('mobile-view');
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Recalculate heights after orientation change
            adjustMobileLayout();
        }, 100);
    });
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            adjustMobileLayout();
        }, 250);
    });
    
    // Add touch event handlers
    addTouchHandlers();
    
    // Initialize mobile table features
    initMobileTables();
    
    // Add mobile-specific event listeners
    addMobileEventListeners();
}

// Adjust layout for mobile
function adjustMobileLayout() {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        document.body.classList.add('mobile-view');
        
        // Adjust content wrapper height
        const header = document.querySelector('.header');
        const contentWrapper = document.querySelector('.content-wrapper');
        if (header && contentWrapper) {
            const headerHeight = header.offsetHeight;
            contentWrapper.style.marginTop = headerHeight + 'px';
            contentWrapper.style.height = `calc(100vh - ${headerHeight}px)`;
        }
        
        // Close sidebar on mobile when clicking outside
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay') || createSidebarOverlay();
        
        if (sidebar && sidebar.classList.contains('active')) {
            overlay.classList.add('active');
        }
    } else {
        document.body.classList.remove('mobile-view');
        
        // Remove mobile-specific elements
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

// Create sidebar overlay for mobile
function createSidebarOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', function() {
        closeSidebar();
    });
    document.body.appendChild(overlay);
    return overlay;
}

// Enhanced sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay') || createSidebarOverlay();
    const menuToggle = document.getElementById('menuToggle');
    
    if (sidebar.classList.contains('active')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay') || createSidebarOverlay();
    const menuToggle = document.getElementById('menuToggle');
    
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Change menu toggle icon to X
    if (menuToggle) {
        menuToggle.classList.add('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            // Force change the icon class
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const menuToggle = document.getElementById('menuToggle');
    
    sidebar.classList.remove('active');
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = ''; // Restore scrolling
    
    // Change menu toggle icon back to hamburger
    if (menuToggle) {
        menuToggle.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            // Force change the icon class
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

// Add touch handlers for better mobile interaction
function addTouchHandlers() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn, .status-btn, .customer-filter-btn, .nav-item');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Handle swipe gestures for sidebar
    let startX, startY, distX, distY;
    
    document.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const touch = e.touches[0];
        distX = touch.clientX - startX;
        distY = touch.clientY - startY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        // Swipe from right edge to open sidebar
        if (startX > window.innerWidth - 50 && distX < -50 && Math.abs(distY) < 100) {
            openSidebar();
        }
        
        // Swipe right to close sidebar
        if (startX < 50 && distX > 50 && Math.abs(distY) < 100) {
            closeSidebar();
        }
        
        startX = startY = distX = distY = null;
    });
}

// Initialize mobile table features
function initMobileTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        // Add data-label attributes for mobile stacked view
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent.trim());
                }
            });
        });
        
        // Add scroll indicator
        const container = table.closest('.table-container');
        if (container && window.innerWidth <= 767) {
            container.classList.add('mobile-table');
        }
    });
}

// Add mobile-specific event listeners
function addMobileEventListeners() {
    // Handle menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Handle nav item clicks on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 767) {
                closeSidebar();
                
                // Update page title
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    pageTitle.textContent = this.textContent.trim();
                }
            }
        });
    });
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Handle form inputs to prevent zoom on iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 767) {
                // Scroll input into view
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Add click handlers for action buttons
    addActionButtonHandlers();
}

// Add action button handlers
function addActionButtonHandlers() {
    // Add loading state to action buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.action-btn, .order-action-btn, .btn-sm, .table-action-btn')) {
            const button = e.target;
            
            // Add loading state
            button.classList.add('loading');
            
            // Remove loading state after 2 seconds (adjust as needed)
            setTimeout(() => {
                button.classList.remove('loading');
            }, 2000);
        }
    });
    
    // Add touch feedback for mobile
    const actionButtons = document.querySelectorAll('.action-btn, .order-action-btn, .btn-sm, .table-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Enhanced modal handling for mobile
function openMobileModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    const firstFocusable = modal.querySelector('input, select, textarea, button');
    if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeMobileModal(modalId);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeMobileModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Return focus to trigger element if available
    const trigger = document.querySelector(`[onclick*="${modalId}"]`);
    if (trigger) {
        trigger.focus();
    }
}

// Optimize table rendering for mobile
function optimizeTableForMobile(tableId) {
    const table = document.getElementById(tableId);
    if (!table || window.innerWidth > 767) return;
    
    // Add loading state
    table.classList.add('loading');
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        // Process table data in chunks to prevent blocking
        const rows = table.querySelectorAll('tbody tr');
        const chunkSize = 10;
        let index = 0;
        
        function processChunk() {
            const chunk = Array.from(rows).slice(index, index + chunkSize);
            
            chunk.forEach(row => {
                // Add mobile-specific classes or attributes
                row.classList.add('mobile-row');
                
                // Optimize images
                const images = row.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src && !img.dataset.optimized) {
                        img.loading = 'lazy';
                        img.dataset.optimized = 'true';
                    }
                });
            });
            
            index += chunkSize;
            
            if (index < rows.length) {
                requestAnimationFrame(processChunk);
            } else {
                table.classList.remove('loading');
            }
        }
        
        processChunk();
    });
}

// Performance optimization for mobile
function optimizeForMobile() {
    // Debounce scroll events
    let scrollTimer;
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (contentWrapper) {
        contentWrapper.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                // Handle scroll-based optimizations
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;
                
                // Lazy load content when near bottom
                if (scrollTop + clientHeight >= scrollHeight - 100) {
                    // Trigger lazy loading if needed
                    loadMoreContent();
                }
            }, 100);
        });
    }
    
    // Optimize images for mobile
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (window.innerWidth <= 767) {
            img.loading = 'lazy';
            
            // Add error handling
            img.addEventListener('error', function() {
                this.src = 'img/default.jpg';
                this.alt = 'صورة غير متوفرة';
            });
        }
    });
}

// Load more content (placeholder for pagination)
function loadMoreContent() {
    // Implementation for loading more content
    console.log('Loading more content...');
}

// Initialize mobile features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileFeatures();
    optimizeForMobile();
    
    // Re-initialize on dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Re-initialize mobile features for new content
                initMobileTables();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openMobileModal = openMobileModal;
window.closeMobileModal = closeMobileModal;
window.optimizeTableForMobile = optimizeTableForMobile;
// ===== ENHANCED MENU TOGGLE FUNCTIONALITY =====

// Force menu toggle to work properly
function forceMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        // Remove any existing event listeners
        menuToggle.removeEventListener('click', toggleSidebar);
        
        // Add new event listener with force
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.sidebar-overlay') || createSidebarOverlay();
            const icon = this.querySelector('i');
            
            if (sidebar.classList.contains('active')) {
                // Close sidebar
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                this.classList.remove('active');
                
                // Change icon to hamburger
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            } else {
                // Open sidebar
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.classList.add('active');
                
                // Change icon to X
                if (icon) {
                    icon.className = 'fas fa-times';
                }
            }
        });
    }
}

// Force action buttons to be visible
function forceActionButtonsVisible() {
    const actionContainers = document.querySelectorAll('.table-actions, .order-actions, .action-buttons');
    
    actionContainers.forEach(container => {
        // Force display
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '0.25rem';
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Force all child buttons to be visible
        const buttons = container.querySelectorAll('button, .btn, [class*="btn-"]');
        buttons.forEach(button => {
            button.style.display = 'inline-flex';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.position = 'relative';
            button.style.zIndex = '1';
        });
    });
}

// Initialize enhanced functionality
function initEnhancedMobile() {
    // Force menu toggle
    forceMenuToggle();
    
    // Force action buttons visibility
    forceActionButtonsVisible();
    
    // Re-run on window resize
    window.addEventListener('resize', function() {
        setTimeout(() => {
            forceActionButtonsVisible();
        }, 100);
    });
    
    // Re-run when content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                setTimeout(() => {
                    forceActionButtonsVisible();
                }, 100);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedMobile);
} else {
    initEnhancedMobile();
}

// Also run after a short delay to ensure everything is loaded
setTimeout(initEnhancedMobile, 500);

// ===== إدارة المستخدمين =====

let currentEditingUser = null;

// تحميل المستخدمين
async function loadUsers() {
    try {
        const snapshot = await db.collection('users').get();
        const users = {};
        
        snapshot.forEach(doc => {
            users[doc.id] = { id: doc.id, ...doc.data() };
        });
        
        const usersGrid = document.getElementById('usersGrid');
        if (!usersGrid) return;
        
        usersGrid.innerHTML = '';
        
        // حساب إحصائيات المستخدمين
        let adminCount = 0, managerCount = 0, employeeCount = 0;
        
        Object.keys(users).forEach(username => {
            const user = users[username];
            
            // حساب الإحصائيات
            if (user.role === 'admin') adminCount++;
            else if (user.role === 'manager') managerCount++;
            else if (user.role === 'employee') employeeCount++;
            
            // حساب عدد الصلاحيات
            const permissionsCount = Object.values(user.permissions || {}).filter(p => p).length;
            const totalPermissions = Object.keys(user.permissions || {}).length;
            
            // إنشاء بطاقة المستخدم
            const userCard = document.createElement('div');
            userCard.className = `user-card ${user.role}-user`;
            
            userCard.innerHTML = `
                <div class="user-card-header">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-status ${user.role}">
                        <i class="fas fa-circle"></i>
                    </div>
                </div>
                
                <div class="user-card-body">
                    <h3 class="user-name">${user.name}</h3>
                    <p class="user-username">@${username}</p>
                    
                    <div class="user-role-badge ${user.role}">
                        <i class="fas ${getRoleIcon(user.role)}"></i>
                        <span>${getRoleText(user.role)}</span>
                    </div>
                    
                    <div class="user-permissions">
                        <div class="permissions-bar">
                            <div class="permissions-fill" style="width: ${totalPermissions > 0 ? (permissionsCount/totalPermissions)*100 : 0}%"></div>
                        </div>
                        <span class="permissions-text">${permissionsCount}/${totalPermissions} صلاحية</span>
                    </div>
                    
                    <div class="user-last-login">
                        <i class="fas fa-clock"></i>
                        <span>${user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}</span>
                    </div>
                </div>
                
                <div class="user-card-actions">
                    <button class="action-btn view-btn" onclick="showUserDetails('${username}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn permissions-btn" onclick="showUserPermissions('${username}')" title="عرض الصلاحيات">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editUser('${username}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${username !== 'admin' ? `
                        <button class="action-btn delete-btn" onclick="deleteUser('${username}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            usersGrid.appendChild(userCard);
        });
        
        // تحديث الإحصائيات
        updateUsersStats(adminCount, managerCount, employeeCount, Object.keys(users).length);
        
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين من Firebase:', error);
        alert('حدث خطأ في تحميل المستخدمين');
    }
}

// الحصول على أيقونة الدور
function getRoleIcon(role) {
    const icons = {
        'admin': 'fa-crown',
        'manager': 'fa-user-tie',
        'employee': 'fa-user'
    };
    return icons[role] || 'fa-user';
}

// تحديث إحصائيات المستخدمين
function updateUsersStats(adminCount, managerCount, employeeCount, totalCount) {
    const adminElement = document.getElementById('adminUsersCount');
    const managerElement = document.getElementById('managerUsersCount');
    const employeeElement = document.getElementById('employeeUsersCount');
    const totalElement = document.getElementById('totalUsersCount');
    
    if (adminElement) adminElement.textContent = adminCount;
    if (managerElement) managerElement.textContent = managerCount;
    if (employeeElement) employeeElement.textContent = employeeCount;
    if (totalElement) totalElement.textContent = totalCount;
}

// الحصول على نص الدور
function getRoleText(role) {
    const roles = {
        'admin': 'مدير عام',
        'manager': 'مدير مطعم',
        'employee': 'موظف'
    };
    return roles[role] || role;
}

// فتح نافذة المستخدم
async function openUserModal(username = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');
    
    if (username) {
        // تعديل مستخدم موجود
        currentEditingUser = username;
        title.textContent = 'تعديل المستخدم';
        
        try {
            const userDoc = await db.collection('users').doc(username).get();
            if (userDoc.exists) {
                const user = userDoc.data();
                
                document.getElementById('userUsername').value = username;
                document.getElementById('userUsername').disabled = true;
                document.getElementById('userFullName').value = user.name || '';
                document.getElementById('userPassword').value = user.password || '';
                document.getElementById('userRole').value = user.role || '';
                
                // تحديد الصلاحيات
                const permissions = user.permissions || {};
                Object.keys(permissions).forEach(permission => {
                    const checkbox = document.getElementById(`perm_${permission}`);
                    if (checkbox) {
                        checkbox.checked = permissions[permission];
                    }
                });
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدم:', error);
            alert('حدث خطأ في تحميل بيانات المستخدم');
            return;
        }
    } else {
        // إضافة مستخدم جديد
        currentEditingUser = null;
        title.textContent = 'إضافة مستخدم جديد';
        form.reset();
        document.getElementById('userUsername').disabled = false;
        
        // إلغاء تحديد جميع الصلاحيات
        document.querySelectorAll('.permissions-grid input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    modal.style.display = 'block';
}

// إغلاق نافذة المستخدم
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    currentEditingUser = null;
}

// تحديث الصلاحيات حسب الدور
function updatePermissionsBasedOnRole() {
    const role = document.getElementById('userRole').value;
    
    // الصلاحيات الافتراضية لكل دور
    const defaultPermissions = {
        'admin': {
            dashboard: true,
            orders: true,
            products: true,
            categories: true,
            customers: true,
            stores: true,
            delivery: true,
            drivers: true,
            addons: true,
            suggestions: true,
            reports: true,
            users: true
        },
        'manager': {
            dashboard: true,
            orders: true,
            products: true,
            categories: true,
            customers: true,
            stores: false,
            delivery: true,
            drivers: true,
            addons: true,
            suggestions: true,
            reports: true,
            users: false
        },
        'employee': {
            dashboard: true,
            orders: true,
            products: false,
            categories: false,
            customers: true,
            stores: false,
            delivery: false,
            drivers: false,
            addons: false,
            suggestions: false,
            reports: false,
            users: false
        }
    };
    
    if (defaultPermissions[role]) {
        Object.keys(defaultPermissions[role]).forEach(permission => {
            const checkbox = document.getElementById(`perm_${permission}`);
            if (checkbox) {
                checkbox.checked = defaultPermissions[role][permission];
            }
        });
    }
}

// حفظ المستخدم
async function saveUser() {
    const username = document.getElementById('userUsername').value.trim();
    const fullName = document.getElementById('userFullName').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    
    if (!username || !fullName || !password || !role) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    if (password.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    // جمع الصلاحيات
    const permissions = {};
    document.querySelectorAll('.permissions-grid input[type="checkbox"]').forEach(checkbox => {
        permissions[checkbox.value] = checkbox.checked;
    });
    
    try {
        // التحقق من عدم وجود اسم المستخدم (في حالة الإضافة)
        if (!currentEditingUser) {
            const existingUser = await db.collection('users').doc(username).get();
            if (existingUser.exists) {
                alert('اسم المستخدم موجود مسبقاً');
                return;
            }
        }
        
        // بيانات المستخدم
        const userData = {
            name: fullName,
            password: password,
            role: role,
            permissions: permissions,
            updatedAt: new Date()
        };
        
        if (!currentEditingUser) {
            userData.createdAt = new Date();
        }
        
        // حفظ المستخدم في Firebase
        await db.collection('users').doc(username).set(userData, { merge: true });
        
        // إعادة تحميل الجدول
        await loadUsers();
        
        // إغلاق النافذة
        closeUserModal();
        
        // إظهار رسالة نجاح
        alert(currentEditingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
        
        // تحديث الصلاحيات إذا كان المستخدم الحالي
        if (authSystem && authSystem.getCurrentUser().username === username) {
            // إعادة تحميل بيانات المستخدم الحالي
            const updatedUserDoc = await db.collection('users').doc(username).get();
            if (updatedUserDoc.exists) {
                const updatedUser = updatedUserDoc.data();
                sessionStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    name: updatedUser.name,
                    role: updatedUser.role,
                    permissions: updatedUser.permissions,
                    loginTime: new Date().toISOString()
                }));
                authSystem.updatePermissions();
            }
        }
        
    } catch (error) {
        console.error('خطأ في حفظ المستخدم:', error);
        alert('حدث خطأ في حفظ المستخدم');
    }
}

// تعديل مستخدم
function editUser(username) {
    openUserModal(username);
}

// حذف مستخدم
async function deleteUser(username) {
    if (username === 'admin') {
        alert('لا يمكن حذف المدير العام');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) {
        try {
            await db.collection('users').doc(username).delete();
            await loadUsers();
            alert('تم حذف المستخدم بنجاح');
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            alert('حدث خطأ في حذف المستخدم');
        }
    }
}

// عرض تفاصيل المستخدم
async function showUserDetails(username) {
    try {
        const userDoc = await db.collection('users').doc(username).get();
        if (!userDoc.exists) {
            alert('المستخدم غير موجود');
            return;
        }
        
        const user = userDoc.data();
        
        const permissionsList = Object.keys(user.permissions || {})
            .filter(p => user.permissions[p])
            .map(p => getPermissionText(p))
            .join('، ');
        
        const details = `
المستخدم: ${username}
الاسم: ${user.name}
الدور: ${getRoleText(user.role)}
تاريخ الإنشاء: ${user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('ar-EG') : 'غير محدد'}
آخر تحديث: ${user.updatedAt ? new Date(user.updatedAt.toDate()).toLocaleDateString('ar-EG') : 'غير محدد'}

الصلاحيات:
${permissionsList || 'لا توجد صلاحيات'}
        `;
        
        alert(details);
    } catch (error) {
        console.error('خطأ في عرض تفاصيل المستخدم:', error);
        alert('حدث خطأ في عرض تفاصيل المستخدم');
    }
}

// عرض صلاحيات المستخدم
async function showUserPermissions(username) {
    try {
        const userDoc = await db.collection('users').doc(username).get();
        if (!userDoc.exists) {
            alert('المستخدم غير موجود');
            return;
        }
        
        const user = userDoc.data();
        const permissions = user.permissions || {};
        
        let permissionsHTML = '<div class="permissions-popup"><h4>صلاحيات المستخدم: ' + username + '</h4><ul>';
        
        Object.keys(permissions).forEach(permission => {
            const hasPermission = permissions[permission];
            const icon = hasPermission ? '✅' : '❌';
            const text = getPermissionText(permission);
            permissionsHTML += `<li>${icon} ${text}</li>`;
        });
        
        permissionsHTML += '</ul></div>';
        
        // إنشاء نافذة منبثقة مخصصة
        const popup = document.createElement('div');
        popup.className = 'permissions-popup-overlay';
        popup.innerHTML = `
            <div class="permissions-popup-content">
                ${permissionsHTML}
                <button onclick="this.parentElement.parentElement.remove()">إغلاق</button>
            </div>
        `;
        
        document.body.appendChild(popup);
    } catch (error) {
        console.error('خطأ في عرض صلاحيات المستخدم:', error);
        alert('حدث خطأ في عرض صلاحيات المستخدم');
    }
}

// الحصول على نص الصلاحية
function getPermissionText(permission) {
    const permissions = {
        'dashboard': 'الرئيسية',
        'orders': 'الطلبات',
        'products': 'المنتجات',
        'categories': 'المجموعات',
        'customers': 'العملاء',
        'stores': 'المحلات',
        'delivery': 'التوصيل',
        'drivers': 'إدارة الطيارين',
        'addons': 'الإضافات',
        'suggestions': 'الاقتراحات',
        'reports': 'التقارير',
        'users': 'إدارة المستخدمين'
    };
    return permissions[permission] || permission;
}

// تحميل المستخدمين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير قليل للتأكد من تحميل نظام المصادقة
    setTimeout(async () => {
        if (document.getElementById('usersGrid')) {
            // التأكد من وجود المستخدمين الافتراضيين في Firebase
            await ensureDefaultUsers();
            await loadUsers();
        }
    }, 500);
});

// التأكد من وجود المستخدمين الافتراضيين
async function ensureDefaultUsers() {
    try {
        const snapshot = await db.collection('users').get();
        
        // إذا لم توجد مستخدمين، إنشاء المستخدمين الافتراضيين
        if (snapshot.empty) {
            console.log('إنشاء المستخدمين الافتراضيين في Firebase...');
            
            const defaultUsers = {
                'admin': {
                    password: '',
                    role: 'admin',
                    name: 'المدير العام',
                    permissions: {
                        dashboard: true,
                        orders: true,
                        products: true,
                        categories: true,
                        customers: true,
                        stores: true,
                        delivery: true,
                        drivers: true,
                        addons: true,
                        suggestions: true,
                        reports: true,
                        users: true
                    }
                },
                'manager': {
                    password: '',
                    role: 'manager',
                    name: 'مدير المطعم',
                    permissions: {
                        dashboard: true,
                        orders: true,
                        products: true,
                        categories: true,
                        customers: true,
                        stores: false,
                        delivery: true,
                        drivers: true,
                        addons: true,
                        suggestions: true,
                        reports: true,
                        users: false
                    }
                },
                'employee': {
                    password: '',
                    role: 'employee',
                    name: 'موظف',
                    permissions: {
                        dashboard: true,
                        orders: true,
                        products: false,
                        categories: false,
                        customers: true,
                        stores: false,
                        delivery: false,
                        drivers: false,
                        addons: false,
                        suggestions: false,
                        reports: false,
                        users: false
                    }
                }
            };
            
            const batch = db.batch();
            
            Object.keys(defaultUsers).forEach(username => {
                const userRef = db.collection('users').doc(username);
                batch.set(userRef, {
                    ...defaultUsers[username],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            });
            
            await batch.commit();
            console.log('تم إنشاء المستخدمين الافتراضيين في Firebase');
        }
    } catch (error) {
        console.error('خطأ في التأكد من المستخدمين الافتراضيين:', error);
    }
}

// إضافة CSS للمستخدمين
const usersCSS = `
<style>
/* ===== تصميم شاشة إدارة المستخدمين ===== */

.users-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    color: white;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.users-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.users-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.users-title-text h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
}

.users-title-text p {
    margin: 0.25rem 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
}

.add-user-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.add-user-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.6);
}

.add-user-btn .btn-icon {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
}

.add-user-btn:hover .btn-shine {
    left: 100%;
}

/* إحصائيات المستخدمين */
.users-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.user-stat-card {
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.user-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent-color);
}

.user-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.admin-card {
    --accent-color: #dc3545;
    background: linear-gradient(135deg, #fff5f5, #fff);
}

.manager-card {
    --accent-color: #ffc107;
    background: linear-gradient(135deg, #fffbf0, #fff);
}

.employee-card {
    --accent-color: #28a745;
    background: linear-gradient(135deg, #f0fff4, #fff);
}

.total-card {
    --accent-color: #667eea;
    background: linear-gradient(135deg, #f8f9ff, #fff);
}

.user-stat-card .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: white;
    background: var(--accent-color);
}

.user-stat-card .stat-info h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-color);
}

.user-stat-card .stat-info p {
    margin: 0.25rem 0 0 0;
    color: #666;
    font-size: 0.9rem;
}

/* شبكة المستخدمين */
.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.user-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
}

.user-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--user-color);
}

.admin-user {
    --user-color: #dc3545;
}

.manager-user {
    --user-color: #ffc107;
}

.employee-user {
    --user-color: #28a745;
}

.user-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--user-color);
}

.user-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--user-color), rgba(var(--user-color), 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.user-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: relative;
}

.user-status.admin {
    color: #dc3545;
}

.user-status.manager {
    color: #ffc107;
}

.user-status.employee {
    color: #28a745;
}

.user-card-body {
    text-align: center;
    margin-bottom: 1.5rem;
}

.user-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
}

.user-username {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
}

.user-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.user-role-badge.admin {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
}

.user-role-badge.manager {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #212529;
}

.user-role-badge.employee {
    background: linear-gradient(135deg, #28a745, #1e7e34);
    color: white;
}

.user-permissions {
    margin-bottom: 1rem;
}

.permissions-bar {
    width: 100%;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.permissions-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--user-color), rgba(var(--user-color), 0.8));
    border-radius: 3px;
    transition: width 0.3s ease;
}

.permissions-text {
    font-size: 0.8rem;
    color: #666;
    font-weight: 600;
}

.user-last-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #666;
}

.user-card-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.action-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.view-btn {
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
}

.view-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
}

.permissions-btn {
    background: linear-gradient(135deg, #6f42c1, #5a32a3);
    color: white;
}

.permissions-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(111, 66, 193, 0.4);
}

.edit-btn {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #212529;
}

.edit-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
}

.delete-btn {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
}

.delete-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

/* تحسينات الموبايل */
@media (max-width: 768px) {
    .users-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .users-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .users-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .user-card {
        padding: 1rem;
    }
    
    .add-user-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .users-stats {
        grid-template-columns: 1fr;
    }
    
    .user-stat-card {
        padding: 1rem;
    }
    
    .users-title-text h2 {
        font-size: 1.4rem;
    }
    
    .user-card-actions {
        gap: 0.25rem;
    }
    
    .action-btn {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
    }
}

/* تحسين النوافذ المنبثقة للصلاحيات */
.permissions-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.permissions-popup-content {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: popupSlideIn 0.3s ease;
}

@keyframes popupSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.permissions-popup h4 {
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
    font-size: 1.3rem;
    border-bottom: 2px solid #667eea;
    padding-bottom: 0.5rem;
}

.permissions-popup ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.permissions-popup li {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 10px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
}

.permissions-popup li:last-child {
    margin-bottom: 0;
}

.permissions-popup button {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;
    transition: all 0.3s ease;
}

.permissions-popup button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* تحسين نموذج المستخدم */
.permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
}

.permission-item {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 0.5rem;
    transition: all 0.3s ease;
}

.permission-item:hover {
    background: #e9ecef;
    transform: translateY(-1px);
}

.permission-item label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.permission-item label:hover {
    background: rgba(102, 126, 234, 0.1);
}

.permission-item input[type="checkbox"] {
    margin: 0;
    width: 18px;
    height: 18px;
    accent-color: #667eea;
}

/* تأثيرات إضافية */
.user-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s ease;
}

.user-card:hover::after {
    left: 100%;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', usersCSS);

// إضافة دالة showNotification لتحسين تجربة المستخدم
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنماط إذا لم تكن موجودة
    if (!document.getElementById('notificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 1rem;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 1rem;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification.success { border-left: 4px solid #28a745; }
            .notification.error { border-left: 4px solid #dc3545; }
            .notification.info { border-left: 4px solid #17a2b8; }
            .notification-content { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
            .notification-close { background: none; border: none; cursor: pointer; opacity: 0.7; }
            .notification-close:hover { opacity: 1; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== إدارة الطيارين =====

let currentEditingDriver = null;
let currentDriverReport = null;

// تحميل الطيارين
async function loadDrivers() {
    try {
        const driversData = await dashboard.fetchData('drivers');
        dashboard.drivers = driversData || [];
        
        const driversGrid = document.getElementById('driversGrid');
        if (!driversGrid) return;
        
        driversGrid.innerHTML = '';
        
        // حساب إحصائيات الطيارين الحقيقية
        let activeCount = 0, busyCount = 0, totalCount = dashboard.drivers.length;
        
        // حساب الطلبات المعلقة الحقيقية
        const pendingOrders = dashboard.orders.filter(order => 
            (order.status === 'تأكيد' || order.status === 'تحضير') && !order.driverId
        ).length;
        
        // إذا لم توجد طيارين، عرض رسالة
        if (dashboard.drivers.length === 0) {
            driversGrid.innerHTML = `
                <div class="no-drivers-message">
                    <div class="no-drivers-icon">
                        <i class="fas fa-motorcycle"></i>
                    </div>
                    <h3>لا يوجد طيارين مسجلين</h3>
                    <p>ابدأ بإضافة طيار جديد لإدارة عمليات التوصيل</p>
                    <button class="btn btn-primary" onclick="openDriverModal()">
                        <i class="fas fa-plus"></i> إضافة طيار جديد
                    </button>
                    <button class="btn btn-success" onclick="createDefaultDrivers()" style="margin-top: 10px;">
                        <i class="fas fa-magic"></i> إنشاء طيارين افتراضيين
                    </button>
                </div>
            `;
            updateDriversStats(0, 0, pendingOrders, 0);
            return;
        }
        
        dashboard.drivers.forEach(driver => {
            if (driver.active) {
                activeCount++;
                // حساب الطيارين المشغولين بناءً على الطلبات الحقيقية
                const driverActiveOrders = dashboard.orders.filter(order => 
                    order.driverId === driver.id && 
                    order.status === 'توصيل' && 
                    !order.settled && 
                    !order.accountSettled
                ).length;
                
                if (driverActiveOrders > 0) {
                    busyCount++;
                }
            }
            
            // إنشاء بطاقة الطيار
            const driverCard = document.createElement('div');
            driverCard.className = `driver-card ${driver.active ? 'active' : 'inactive'}`;
            
            // حساب إحصائيات الطيار الحقيقية - فقط الطلبات النشطة غير المقفلة
            const allDriverOrders = dashboard.orders.filter(order => order.driverId === driver.id);
            const completedOrders = allDriverOrders.filter(order => order.status === 'توصيل');
            const activeOrders = completedOrders.filter(order => !order.settled && !order.accountSettled);
            
            // حساب طلبات اليوم فقط
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            const todayOrders = allDriverOrders.filter(order => {
                const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
                return orderDate >= todayStart && orderDate < todayEnd;
            });
            
            // حساب الأرباح الحقيقية - فقط من الطلبات النشطة
            const totalEarnings = activeOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
            const commission = activeOrders.reduce((sum, order) => {
                const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
                return sum + deliveryFee;
            }, 0);
            
            driverCard.innerHTML = `
                <div class="driver-card-header">
                    <div class="driver-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="driver-status ${driver.active ? 'active' : 'inactive'}">
                        <i class="fas fa-circle"></i>
                    </div>
                </div>
                
                <div class="driver-card-body">
                    <h3 class="driver-name">${driver.name}</h3>
                    <p class="driver-phone">
                        <i class="fas fa-phone"></i> ${driver.phone}
                    </p>
                    
                    <div class="driver-vehicle">
                        <i class="fas fa-${getVehicleIcon(driver.vehicle)}"></i>
                        <span>${getVehicleText(driver.vehicle)}</span>
                    </div>
                    
                    <div class="driver-stats-mini">
                        <div class="mini-stat">
                            <span class="mini-stat-number">${todayOrders.length}</span>
                            <span class="mini-stat-label">إجمالي</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-number">${activeOrders.length}</span>
                            <span class="mini-stat-label">نشط</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-number">${commission.toFixed(0)}</span>
                            <span class="mini-stat-label">ج.م</span>
                        </div>
                    </div>
                </div>
                
                <div class="driver-card-actions">
                    <button class="action-btn report-btn" onclick="showDriverReport('${driver.id}')" title="تقرير الطيار">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editDriver('${driver.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${activeOrders.length > 0 ? `
                        <button class="action-btn busy-btn" onclick="setDriverBusy('${driver.id}')" title="خروج الطيار">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn toggle-btn" onclick="toggleDriver('${driver.id}')" title="تبديل الحالة">
                        <i class="fas fa-toggle-${driver.active ? 'on' : 'off'}"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteDriver('${driver.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            driversGrid.appendChild(driverCard);
        });
        
        // تحديث الإحصائيات الحقيقية
        updateDriversStats(activeCount, busyCount, pendingOrders, totalCount);
        
    } catch (error) {
        console.error('خطأ في تحميل الطيارين:', error);
        const driversGrid = document.getElementById('driversGrid');
        if (driversGrid) {
            driversGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>حدث خطأ في تحميل الطيارين</p>
                    <button class="btn btn-primary" onclick="loadDrivers()">إعادة المحاولة</button>
                </div>
            `;
        }
    }
}

// تحديث إحصائيات الطيارين
function updateDriversStats(activeCount, busyCount, pendingOrders, totalCount) {
    const elements = {
        'activeDriversCount': activeCount,
        'busyDriversCount': busyCount,
        'pendingOrdersCount': pendingOrders,
        'totalDriversCount': totalCount
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

// الحصول على أيقونة المركبة
function getVehicleIcon(vehicle) {
    const icons = {
        'motorcycle': 'motorcycle',
        'car': 'car',
        'bicycle': 'bicycle'
    };
    return icons[vehicle] || 'motorcycle';
}

// الحصول على نص المركبة
function getVehicleText(vehicle) {
    const texts = {
        'motorcycle': 'موتوسيكل',
        'car': 'سيارة',
        'bicycle': 'دراجة'
    };
    return texts[vehicle] || 'موتوسيكل';
}

// فتح نافذة الطيار
function openDriverModal(driverId = null) {
    const modal = document.getElementById('driverModal');
    const title = document.getElementById('driverModalTitle');
    const form = document.getElementById('driverForm');
    
    if (driverId) {
        // تعديل طيار موجود
        currentEditingDriver = driverId;
        title.textContent = 'تعديل الطيار';
        
        const driver = dashboard.drivers.find(d => d.id === driverId);
        if (driver) {
            document.getElementById('driverName').value = driver.name || '';
            document.getElementById('driverPhone').value = driver.phone || '';
            document.getElementById('driverLicense').value = driver.license || '';
            document.getElementById('driverVehicle').value = driver.vehicle || 'motorcycle';
            document.getElementById('driverAddress').value = driver.address || '';
            document.getElementById('driverActive').checked = driver.active !== false;
        }
    } else {
        // إضافة طيار جديد
        currentEditingDriver = null;
        title.textContent = 'إضافة طيار جديد';
        form.reset();
        document.getElementById('driverActive').checked = true;
    }
    
    modal.style.display = 'block';
}

// إغلاق نافذة الطيار
function closeDriverModal() {
    document.getElementById('driverModal').style.display = 'none';
    currentEditingDriver = null;
}

// حفظ الطيار
async function saveDriver() {
    const name = document.getElementById('driverName').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();
    const license = document.getElementById('driverLicense').value.trim();
    const vehicle = document.getElementById('driverVehicle').value;
    const address = document.getElementById('driverAddress').value.trim();
    const active = document.getElementById('driverActive').checked;
    
    if (!name || !phone) {
        alert('يرجى ملء الحقول المطلوبة');
        return;
    }
    
    try {
        const driverData = {
            name,
            phone,
            license,
            vehicle,
            commission: 10, // نسبة ثابتة 10%
            address,
            active,
            status: 'available',
            createdAt: currentEditingDriver ? undefined : new Date(),
            updatedAt: new Date()
        };
        
        if (currentEditingDriver) {
            // تحديث طيار موجود
            await db.collection('drivers').doc(currentEditingDriver).update(driverData);
            alert('تم تحديث الطيار بنجاح');
        } else {
            // إضافة طيار جديد
            await db.collection('drivers').add(driverData);
            alert('تم إضافة الطيار بنجاح');
        }
        
        closeDriverModal();
        
        // إعادة تحميل البيانات فوراً
        await dashboard.loadAllData();
        loadDrivers();
        
        console.log('✅ تم تحديث قائمة الطيارين:', dashboard.drivers.length);
        
    } catch (error) {
        console.error('خطأ في حفظ الطيار:', error);
        alert('حدث خطأ في حفظ الطيار');
    }
}

// تعديل طيار
function editDriver(driverId) {
    openDriverModal(driverId);
}

// تبديل حالة الطيار
async function toggleDriver(driverId) {
    try {
        const driver = dashboard.drivers.find(d => d.id === driverId);
        if (!driver) return;
        
        await db.collection('drivers').doc(driverId).update({
            active: !driver.active,
            updatedAt: new Date()
        });
        
        loadDrivers();
        
    } catch (error) {
        console.error('خطأ في تبديل حالة الطيار:', error);
        alert('حدث خطأ في تبديل حالة الطيار');
    }
}

// جعل الطيار مشغول (خروج الطيار)
async function setDriverBusy(driverId) {
    try {
        const driver = dashboard.drivers.find(d => d.id === driverId);
        if (!driver) return;
        
        // التحقق من وجود طلبات نشطة
        const activeOrders = dashboard.orders.filter(order => 
            order.driverId === driverId && 
            order.status === 'توصيل' && 
            !order.settled && 
            !order.accountSettled
        );
        
        if (activeOrders.length === 0) {
            alert('لا توجد طلبات نشطة لهذا الطيار');
            return;
        }
        
        if (!confirm(`هل أنت متأكد من جعل الطيار ${driver.name} مشغول؟\nسيتم منعه من استلام طلبات جديدة حتى يتم تسوية حسابه.`)) {
            return;
        }
        
        await db.collection('drivers').doc(driverId).update({
            status: 'busy',
            busyAt: new Date(),
            updatedAt: new Date()
        });
        
        // تحديث البيانات المحلية
        const driverIndex = dashboard.drivers.findIndex(d => d.id === driverId);
        if (driverIndex !== -1) {
            dashboard.drivers[driverIndex].status = 'busy';
            dashboard.drivers[driverIndex].busyAt = new Date();
        }
        
        loadDrivers();
        alert(`تم جعل الطيار ${driver.name} مشغول بنجاح`);
        
    } catch (error) {
        console.error('خطأ في جعل الطيار مشغول:', error);
        alert('حدث خطأ في العملية');
    }
}

// حذف طيار
async function deleteDriver(driverId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطيار؟')) return;
    
    try {
        await db.collection('drivers').doc(driverId).delete();
        alert('تم حذف الطيار بنجاح');
        loadDrivers();
        
    } catch (error) {
        console.error('خطأ في حذف الطيار:', error);
        alert('حدث خطأ في حذف الطيار');
    }
}

// عرض تقرير الطيار
function showDriverReport(driverId) {
    const driver = dashboard.drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    currentDriverReport = driverId;
    
    // تحديث معلومات الطيار
    document.getElementById('reportDriverName').textContent = driver.name;
    document.getElementById('reportDriverFullName').textContent = driver.name;
    document.getElementById('reportDriverPhone').textContent = driver.phone;
    document.getElementById('reportDriverVehicle').textContent = getVehicleText(driver.vehicle);
    
    const statusBadge = document.getElementById('reportDriverStatus');
    statusBadge.innerHTML = `<span class="status-badge ${driver.active ? 'active' : 'inactive'}">${driver.active ? 'نشط' : 'غير نشط'}</span>`;
    
    // حساب إحصائيات الطيار - فقط الطلبات غير المسواة
    const allDriverOrders = dashboard.orders.filter(order => order.driverId === driverId);
    const activeOrders = allDriverOrders.filter(order => 
        order.status === 'توصيل' && 
        !order.accountSettled && 
        !order.settled
    );
    
    // حساب الأرباح الصافية (بدون رسوم التوصيل) - فقط الطلبات النشطة
    const totalEarnings = activeOrders.reduce((sum, order) => {
        const total = parseFloat(order.total) || 0;
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        return sum + (total - deliveryFee);
    }, 0);
    
    // حساب عمولة الطيار من رسوم التوصيل فقط - فقط الطلبات النشطة
    const commissionEarnings = activeOrders.reduce((sum, order) => {
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        return sum + deliveryFee;
    }, 0);
    
    // الإجمالي الكامل
    const grandTotal = totalEarnings + commissionEarnings;
    
    document.getElementById('reportTotalOrders').textContent = allDriverOrders.length;
    document.getElementById('reportCompletedOrders').textContent = activeOrders.length;
    document.getElementById('reportTotalEarnings').textContent = totalEarnings.toFixed(2) + ' ج.م';
    document.getElementById('reportCommissionEarnings').textContent = commissionEarnings.toFixed(2) + ' ج.م';
    document.getElementById('reportGrandTotal').textContent = grandTotal.toFixed(2) + ' ج.م';
    
    // عرض طلبات الطيار
    loadDriverOrders(driverId);
    
    // تحديث أزرار الإجراءات
    const closeAllBtn = document.getElementById('closeAllOrdersBtn');
    const settleBtn = document.getElementById('settleAccountBtn');
    const oldOrdersBtn = document.getElementById('showDriverHistoryBtn');
    const driverBusyBtn = document.getElementById('setDriverBusyBtn');
    
    // إظهار/إخفاء زر إغلاق جميع الطلبات
    if (closeAllBtn) {
        closeAllBtn.style.display = activeOrders.length > 0 ? 'inline-block' : 'none';
    }
    
    // إخفاء زر تسوية الحساب (مكرر مع إغلاق جميع الطلبات)
    if (settleBtn) {
        settleBtn.style.display = 'none';
    }
    
    // إخفاء زر الطلبات القديمة (لا يعمل)
    if (oldOrdersBtn) {
        oldOrdersBtn.style.display = 'none';
    }
    
    // إظهار/إخفاء زر خروج الطيار
    if (driverBusyBtn) {
        // إظهار الزر فقط إذا:
        // 1. الطيار ليس مشغول (status !== 'busy')
        // 2. لديه طلبات نشطة (activeOrders.length > 0)
        const shouldShowButton = activeOrders.length > 0 && driver.status !== 'busy';
        driverBusyBtn.style.display = shouldShowButton ? 'inline-block' : 'none';
    } else {
        // إنشاء زر خروج الطيار إذا لم يكن موجود
        const reportActions = document.querySelector('.driver-report-actions');
        if (reportActions && activeOrders.length > 0 && driver.status !== 'busy') {
            const busyBtn = document.createElement('button');
            busyBtn.id = 'setDriverBusyBtn';
            busyBtn.className = 'btn btn-warning';
            busyBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> خروج الطيار';
            busyBtn.onclick = () => setDriverBusyFromReport(driverId);
            reportActions.appendChild(busyBtn);
        }
    }
    
    document.getElementById('driverReportModal').style.display = 'block';
}

// جعل الطيار مشغول من تقرير الطيار
async function setDriverBusyFromReport(driverId) {
    try {
        const driver = dashboard.drivers.find(d => d.id === driverId);
        if (!driver) return;
        
        // التحقق من وجود طلبات نشطة
        const activeOrders = dashboard.orders.filter(order => 
            order.driverId === driverId && 
            order.status === 'توصيل' && 
            !order.settled && 
            !order.accountSettled
        );
        
        if (activeOrders.length <= 1) {
            alert('يجب أن يكون لدى الطيار أكثر من طلب واحد لاستخدام هذه الميزة');
            return;
        }
        
        if (!confirm(`هل أنت متأكد من جعل الطيار ${driver.name} مشغول؟\nلديه ${activeOrders.length} طلبات نشطة.\nسيتم منعه من استلام طلبات جديدة.`)) {
            return;
        }
        
        await db.collection('drivers').doc(driverId).update({
            status: 'busy',
            busyAt: new Date(),
            updatedAt: new Date()
        });
        
        // تحديث البيانات المحلية
        const driverIndex = dashboard.drivers.findIndex(d => d.id === driverId);
        if (driverIndex !== -1) {
            dashboard.drivers[driverIndex].status = 'busy';
            dashboard.drivers[driverIndex].busyAt = new Date();
        }
        
        // إغلاق تقرير الطيار وإعادة تحميل البيانات
        closeDriverReportModal();
        loadDrivers();
        
        showNotification(`تم جعل الطيار ${driver.name} مشغول بنجاح`, 'success');
        
    } catch (error) {
        console.error('خطأ في جعل الطيار مشغول:', error);
        alert('حدث خطأ في العملية');
    }
}

// تحميل طلبات الطيار
function loadDriverOrders(driverId) {
    console.log('🔄 تحميل طلبات الطيار:', driverId);
    
    const driverOrders = dashboard.orders.filter(order => order.driverId === driverId);
    const ordersList = document.getElementById('driverOrdersList');
    
    console.log('📋 طلبات الطيار:', driverOrders);
    
    ordersList.innerHTML = '';
    
    if (driverOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">لا توجد طلبات لهذا الطيار</p>';
        return;
    }
    
    driverOrders.forEach(order => {
        const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
        const canClose = order.status === 'توصيل' && !order.settled && !order.accountSettled;
        
        // تحديد حالة الطلب الصحيحة
        let displayStatus = order.status || 'جديد';
        if ((order.settled || order.accountSettled) && displayStatus === 'توصيل') {
            displayStatus = 'تم التوصيل';
        }
        
        const orderCard = document.createElement('div');
        orderCard.className = `driver-order-card ${displayStatus === 'تم التوصيل' ? 'completed' : displayStatus === 'توصيل' ? 'active' : 'pending'}`;
        
        const orderTotal = parseFloat(order.total) || 0;
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        const netAmount = orderTotal - deliveryFee;
        
        orderCard.innerHTML = `
            <div class="order-card-header">
                <div class="order-id">#${order.orderID || order.id.substring(0, 8)}</div>
                <div class="order-status ${displayStatus}">${displayStatus}</div>
            </div>
            <div class="order-card-body">
                <p><i class="fas fa-user"></i> ${order.customerName || order.name}</p>
                <p><i class="fas fa-phone"></i> ${order.phone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${order.area}</p>
                <p><i class="fas fa-calendar"></i> ${orderDate.toLocaleDateString('ar-EG')}</p>
                <p><i class="fas fa-money-bill-wave"></i> صافي: ${netAmount.toFixed(2)} ج.م</p>
                <p><i class="fas fa-truck"></i> خدمة: ${deliveryFee.toFixed(2)} ج.م</p>
                <p><strong>الإجمالي: ${orderTotal.toFixed(2)} ج.م</strong></p>
            </div>
            <div class="order-card-footer">
                <button class="view-order-btn" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> عرض التفاصيل
                </button>
                ${canClose ? `
                    <button class="close-order-btn" onclick="closeDriverOrder('${order.id}')">
                        <i class="fas fa-check"></i> إقفال الطلب
                    </button>
                ` : ''}
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// تحميل الطلبات حسب التاريخ
function loadDailyDriverOrders(driverId) {
    const driverOrders = dashboard.orders.filter(order => 
        order.driverId === driverId && order.status === 'توصيل'
    );
    
    // تجميع الطلبات حسب التاريخ
    const ordersByDate = {};
    driverOrders.forEach(order => {
        const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
        const dateKey = orderDate.toLocaleDateString('ar-EG');
        
        if (!ordersByDate[dateKey]) {
            ordersByDate[dateKey] = {
                date: dateKey,
                orders: [],
                totalAmount: 0,
                totalDeliveryFees: 0,
                netAmount: 0,
                count: 0
            };
        }
        
        const orderTotal = parseFloat(order.total) || 0;
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        const netAmount = orderTotal - deliveryFee;
        
        ordersByDate[dateKey].orders.push(order);
        ordersByDate[dateKey].totalAmount += orderTotal;
        ordersByDate[dateKey].totalDeliveryFees += deliveryFee;
        ordersByDate[dateKey].netAmount += netAmount;
        ordersByDate[dateKey].count++;
    });
    
    const dailyList = document.getElementById('dailyOrdersList');
    dailyList.innerHTML = '';
    
    if (Object.keys(ordersByDate).length === 0) {
        dailyList.innerHTML = '<p class="no-orders">لا توجد طلبات مكتملة لهذا الطيار</p>';
        return;
    }
    
    // ترتيب التواريخ من الأحدث للأقدم
    const sortedDates = Object.keys(ordersByDate).sort((a, b) => 
        new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))
    );
    
    sortedDates.forEach(dateKey => {
        const dayData = ordersByDate[dateKey];
        
        const dayCard = document.createElement('div');
        dayCard.className = 'daily-orders-card';
        
        dayCard.innerHTML = `
            <div class="daily-card-header" onclick="toggleDayOrders('${dateKey}')">
                <div class="day-info">
                    <h5><i class="fas fa-calendar-day"></i> ${dateKey}</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.85rem;">
                        <span><i class="fas fa-shopping-bag"></i> ${dayData.count} طلب</span>
                        <span><i class="fas fa-money-bill-wave"></i> صافي: ${dayData.netAmount.toFixed(2)} ج.م</span>
                        <span><i class="fas fa-truck"></i> خدمة: ${dayData.totalDeliveryFees.toFixed(2)} ج.م</span>
                        <span><i class="fas fa-calculator"></i> إجمالي: ${dayData.totalAmount.toFixed(2)} ج.م</span>
                    </div>
                </div>
                <div class="toggle-icon">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="daily-orders-details" id="day-${dateKey.replace(/\//g, '-')}" style="display: none;">
                ${dayData.orders.map(order => {
                    const orderTotal = parseFloat(order.total) || 0;
                    const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
                    const netAmount = orderTotal - deliveryFee;
                    
                    // تحديد حالة الطلب الصحيحة
                    let displayStatus = order.status || 'جديد';
                    if ((order.settled || order.accountSettled) && displayStatus === 'توصيل') {
                        displayStatus = 'تم التوصيل';
                    }
                    
                    return `
                        <div class="daily-order-item">
                            <div class="order-info">
                                <span class="order-id">#${order.orderID || order.id.substring(0, 8)}</span>
                                <span class="customer-name">${order.customerName || order.name}</span>
                                <span class="order-status-small ${displayStatus}">${displayStatus}</span>
                                <div class="order-amounts">
                                    <span class="net-amount">صافي: ${netAmount.toFixed(2)} ج.م</span>
                                    <span class="service-amount">خدمة: ${deliveryFee.toFixed(2)} ج.م</span>
                                    <span class="order-total">الإجمالي: ${orderTotal.toFixed(2)} ج.م</span>
                                </div>
                            </div>
                            <button class="view-order-btn small" onclick="viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        dailyList.appendChild(dayCard);
    });
}

// فلترة طلبات الطيار
function filterDriverOrders(filter) {
    // تحديث أزرار الفلتر
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    const ordersList = document.getElementById('driverOrdersList');
    const dailyView = document.getElementById('dailyOrdersView');
    
    if (filter === 'daily') {
        // إظهار العرض اليومي
        ordersList.style.display = 'none';
        dailyView.style.display = 'block';
        loadDailyDriverOrders(currentDriverReport);
    } else {
        // إظهار العرض العادي
        ordersList.style.display = 'block';
        dailyView.style.display = 'none';
        
        // فلترة الطلبات
        const orderCards = document.querySelectorAll('.driver-order-card');
        orderCards.forEach(card => {
            const status = card.querySelector('.order-status').textContent;
            
            if (filter === 'all') {
                card.style.display = 'block';
            } else if (filter === 'active') {
                card.style.display = status !== 'توصيل' ? 'block' : 'none';
            } else if (filter === 'completed') {
                card.style.display = status === 'توصيل' ? 'block' : 'none';
            }
        });
    }
}

// إغلاق نافذة تقرير الطيار
function closeDriverReportModal() {
    document.getElementById('driverReportModal').style.display = 'none';
    currentDriverReport = null;
}

// تبديل عرض طلبات اليوم
function toggleDayOrders(dateKey) {
    const dayDetails = document.getElementById(`day-${dateKey.replace(/\//g, '-')}`);
    const toggleIcon = dayDetails.parentElement.querySelector('.toggle-icon i');
    
    if (dayDetails.style.display === 'none') {
        dayDetails.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-up';
    } else {
        dayDetails.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-down';
    }
}

// إغلاق طلب واحد للطيار
async function closeDriverOrder(orderId) {
    if (!confirm('هل أنت متأكد من إغلاق هذا الطلب؟ سيتم تحرير الطيار وتحديث حالة الطلب إلى "تم التوصيل".')) {
        return;
    }
    
    try {
        const batch = db.batch();
        
        // تحديث الطلب كمقفل
        const orderRef = db.collection('orders').doc(orderId);
        batch.update(orderRef, {
            settled: true,
            settledAt: new Date()
        });
        
        // تحرير الطيار
        const order = dashboard.orders.find(o => o.id === orderId);
        if (order && order.driverId) {
            const driverRef = db.collection('drivers').doc(order.driverId);
            batch.update(driverRef, {
                status: 'available',
                lastOrderClosedAt: new Date()
            });
        }
        
        await batch.commit();
        
        // تحديث البيانات المحلية فوراً
        const orderIndex = dashboard.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            dashboard.orders[orderIndex].settled = true;
            dashboard.orders[orderIndex].settledAt = new Date();
        }
        
        // تحديث حالة الطيار محلياً
        if (order && order.driverId) {
            const driverIndex = dashboard.drivers.findIndex(d => d.id === order.driverId);
            if (driverIndex !== -1) {
                dashboard.drivers[driverIndex].status = 'available';
                dashboard.drivers[driverIndex].lastOrderClosedAt = new Date();
            }
        }
        
        showNotification('تم إغلاق الطلب وتحرير الطيار بنجاح', 'success');
        
        // إعادة تحميل البيانات
        await dashboard.loadAllData();
        loadDrivers(); // تحديث إدارة الطيارين
        
        // إعادة تحميل تقرير الطيار
        if (currentDriverReport) {
            setTimeout(() => showDriverReport(currentDriverReport), 500);
        }
        
    } catch (error) {
        console.error('خطأ في إغلاق الطلب:', error);
        alert('حدث خطأ في إغلاق الطلب: ' + error.message);
    }
}

// إغلاق جميع طلبات الطيار
async function closeAllDriverOrders() {
    if (!currentDriverReport) return;
    
    const driverOrders = dashboard.orders.filter(order => 
        order.driverId === currentDriverReport && 
        order.status === 'توصيل' &&
        !order.settled &&
        !order.accountSettled
    );
    
    if (driverOrders.length === 0) {
        alert('لا توجد طلبات مفتوحة لإغلاقها');
        return;
    }
    
    if (!confirm(`هل أنت متأكد من إغلاق جميع الطلبات (${driverOrders.length} طلب)؟`)) {
        return;
    }
    
    try {
        const batch = db.batch();
        
        driverOrders.forEach(order => {
            const orderRef = db.collection('orders').doc(order.id);
            batch.update(orderRef, {
                settled: true,
                settledAt: new Date()
            });
        });
        
        // تحرير الطيار
        const driverRef = db.collection('drivers').doc(currentDriverReport);
        batch.update(driverRef, {
            status: 'available'
        });
        
        await batch.commit();
        
        // تحديث البيانات المحلية فوراً
        driverOrders.forEach(order => {
            const orderIndex = dashboard.orders.findIndex(o => o.id === order.id);
            if (orderIndex !== -1) {
                dashboard.orders[orderIndex].settled = true;
                dashboard.orders[orderIndex].settledAt = new Date();
            }
        });
        
        // تحديث حالة الطيار محلياً
        const driverIndex = dashboard.drivers.findIndex(d => d.id === currentDriverReport);
        if (driverIndex !== -1) {
            dashboard.drivers[driverIndex].status = 'available';
        }
        
        showNotification(`تم إغلاق ${driverOrders.length} طلب وتحرير الطيار بنجاح`, 'success');
        
        // إعادة تحميل البيانات وتحديث التقرير
        await dashboard.loadAllData();
        loadDrivers(); // تحديث إدارة الطيارين
        
        // إعادة تحميل تقرير الطيار لإظهار الإحصائيات المحدثة
        setTimeout(() => showDriverReport(currentDriverReport), 500);
        
    } catch (error) {
        console.error('خطأ في إغلاق الطلبات:', error);
        alert('حدث خطأ في إغلاق الطلبات');
    }
}

// تسوية حساب الطيار
async function settleDriverAccount() {
    if (!currentDriverReport) return;
    
    const driver = dashboard.drivers.find(d => d.id === currentDriverReport);
    if (!driver) return;
    
    const driverOrders = dashboard.orders.filter(order => 
        order.driverId === currentDriverReport && 
        order.status === 'توصيل' && 
        !order.accountSettled && 
        !order.settled
    );
    
    if (driverOrders.length === 0) {
        alert('لا توجد طلبات للتسوية');
        return;
    }
    
    // حساب الأرباح الصافية (بدون رسوم التوصيل)
    const totalAmount = driverOrders.reduce((sum, order) => {
        const total = parseFloat(order.total) || 0;
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        return sum + (total - deliveryFee);
    }, 0);
    
    // حساب عمولة الطيار من رسوم التوصيل فقط
    const commission = driverOrders.reduce((sum, order) => {
        const deliveryFee = parseFloat(order.serviceCharge) || parseFloat(order.deliveryFee) || 0;
        return sum + deliveryFee;
    }, 0);
    
    const grandTotal = totalAmount + commission;
    
    if (!confirm(`تسوية حساب ${driver.name}
عدد الطلبات: ${driverOrders.length}
صافي الطلبات: ${totalAmount.toFixed(2)} ج.م
عمولة الطيار: ${commission.toFixed(2)} ج.م
الإجمالي: ${grandTotal.toFixed(2)} ج.م

هل تريد المتابعة؟`)) {
        return;
    }
    
    try {
        const batch = db.batch();
        
        // تحديث الطلبات كمسواة
        driverOrders.forEach(order => {
            const orderRef = db.collection('orders').doc(order.id);
            batch.update(orderRef, {
                accountSettled: true,
                settledAt: new Date(),
                settledAmount: commission
            });
        });
        
        // إضافة سجل تسوية
        const settlementRef = db.collection('settlements').doc();
        batch.set(settlementRef, {
            driverId: currentDriverReport,
            driverName: driver.name,
            ordersCount: driverOrders.length,
            totalAmount: grandTotal,
            netAmount: totalAmount,
            commission: commission,
            settledAt: new Date(),
            orderIds: driverOrders.map(o => o.id),
            orders: driverOrders.map(order => ({
                id: order.id,
                orderID: order.orderID,
                customerName: order.customerName || order.name,
                phone: order.phone,
                area: order.area,
                total: order.total,
                serviceCharge: order.serviceCharge || order.deliveryFee || 0,
                netAmount: (order.total || 0) - (order.serviceCharge || order.deliveryFee || 0),
                createdAt: order.createdAt,
                settledAt: new Date()
            }))
        });
        
        await batch.commit();
        
        alert(`تم تسوية حساب ${driver.name} بنجاح
صافي الطلبات: ${totalAmount.toFixed(2)} ج.م
عمولة الطيار: ${commission.toFixed(2)} ج.م
الإجمالي: ${grandTotal.toFixed(2)} ج.م`);
        
        // مسح الإحصائيات لبداية جديدة
        document.getElementById('reportTotalEarnings').textContent = '0.00 ج.م';
        document.getElementById('reportCommissionEarnings').textContent = '0.00 ج.م';
        document.getElementById('reportGrandTotal').textContent = '0.00 ج.م';
        document.getElementById('reportCompletedOrders').textContent = '0';
        
        dashboard.loadAllData();
        
        // إعادة تحميل تقرير الطيار
        setTimeout(() => showDriverReport(currentDriverReport), 1000);
        
    } catch (error) {
        console.error('خطأ في تسوية الحساب:', error);
        alert('حدث خطأ في تسوية الحساب');
    }
}

// عرض تاريخ الطيار
function showDriverHistory() {
    if (!currentDriverReport) return;
    
    const driver = dashboard.drivers.find(d => d.id === currentDriverReport);
    if (!driver) return;
    
    console.log('🔍 البحث عن تاريخ الطيار:', driver.name);
    
    // البحث عن سجلات التسوية
    db.collection('settlements')
        .where('driverId', '==', currentDriverReport)
        .orderBy('settledAt', 'desc')
        .get()
        .then(snapshot => {
            console.log('📋 عدد سجلات التسوية:', snapshot.size);
            
            if (snapshot.empty) {
                alert('لا توجد سجلات تسوية سابقة لهذا الطيار');
                return;
            }
            
            let historyHTML = `
                <div class="driver-history-modal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                ">
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 12px;
                        max-width: 900px;
                        max-height: 80vh;
                        overflow-y: auto;
                        direction: rtl;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3>تاريخ تسويات الطيار: ${driver.name}</h3>
                            <button onclick="this.closest('.driver-history-modal').remove()" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 6px;
                                cursor: pointer;
                            ">إغلاق</button>
                        </div>
                        <div class="settlements-list">
            `;
            
            snapshot.forEach(doc => {
                const settlement = doc.data();
                const settledDate = settlement.settledAt.toDate();
                
                console.log('📊 تسوية:', settlement);
                
                historyHTML += `
                    <div style="
                        background: #f8f9fa;
                        padding: 1.5rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        border-left: 4px solid #007bff;
                    ">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <strong style="font-size: 1.1rem;">تاريخ التسوية: ${settledDate.toLocaleDateString('ar-EG')}</strong>
                            <span style="background: #28a745; color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.9rem;">
                                عمولة: ${settlement.commission.toFixed(2)} ج.م
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 0.9rem; margin-bottom: 1rem;">
                            <div><i class="fas fa-shopping-bag"></i> عدد الطلبات: <strong>${settlement.ordersCount}</strong></div>
                            <div><i class="fas fa-money-bill-wave"></i> صافي الطلبات: <strong>${(settlement.netAmount || (settlement.totalAmount - settlement.commission)).toFixed(2)} ج.م</strong></div>
                            <div><i class="fas fa-calculator"></i> إجمالي المبلغ: <strong>${settlement.totalAmount.toFixed(2)} ج.م</strong></div>
                        </div>
                        <details style="margin-top: 1rem;">
                            <summary style="cursor: pointer; font-weight: 600; color: #007bff;">عرض تفاصيل الطلبات</summary>
                            <div style="margin-top: 1rem; max-height: 200px; overflow-y: auto;">
                                ${settlement.orders ? settlement.orders.map(order => `
                                    <div style="
                                        background: white;
                                        padding: 0.75rem;
                                        margin: 0.5rem 0;
                                        border-radius: 5px;
                                        border: 1px solid #e9ecef;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    ">
                                        <div>
                                            <strong>#${order.orderID || order.id.substring(0, 8)}</strong>
                                            <span style="margin: 0 0.5rem;">|</span>
                                            <span>${order.customerName}</span>
                                            <span style="margin: 0 0.5rem;">|</span>
                                            <span>${order.area}</span>
                                        </div>
                                        <div style="text-align: left;">
                                            <div style="font-size: 0.8rem; color: #666;">
                                                صافي: ${order.netAmount.toFixed(2)} ج.م | خدمة: ${order.serviceCharge.toFixed(2)} ج.م
                                            </div>
                                            <div style="font-weight: 600;">إجمالي: ${order.total.toFixed(2)} ج.م</div>
                                        </div>
                                    </div>
                                `).join('') : '<p style="color: #666; font-style: italic;">لا توجد تفاصيل طلبات محفوظة</p>'}
                            </div>
                        </details>
                    </div>
                `;
            });
            
            historyHTML += `
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', historyHTML);
        })
        .catch(error => {
            console.error('❌ خطأ في تحميل تاريخ الطيار:', error);
            alert('حدث خطأ في تحميل تاريخ الطيار: ' + error.message);
        });
}

// تخصيص طيار للطلب
function assignDriverToOrder(orderId) {
    console.log('🔍 البحث عن الطيارين المتاحين...');
    console.log('📋 جميع الطيارين:', dashboard.drivers);
    
    // التأكد من وجود بيانات الطيارين
    if (!dashboard.drivers || dashboard.drivers.length === 0) {
        console.log('⚠️ لا توجد بيانات طيارين، جاري إعادة التحميل...');
        dashboard.loadAllData().then(() => {
            console.log('✅ تم إعادة تحميل البيانات، المحاولة مرة أخرى...');
            assignDriverToOrder(orderId);
        });
        return;
    }
    
    const availableDrivers = dashboard.drivers.filter(driver => {
        const isActive = driver.active === true;
        const isAvailable = !driver.status || driver.status === 'available' || driver.status !== 'busy';
        
        console.log(`طيار ${driver.name}: نشط=${isActive}, متاح=${isAvailable}, الحالة=${driver.status}`);
        
        return isActive && isAvailable;
    });
    
    console.log('✅ الطيارين المتاحين:', availableDrivers);
    
    if (availableDrivers.length === 0) {
        const refreshConfirm = confirm(`لا يوجد طيارين متاحين حالياً

إجمالي الطيارين: ${dashboard.drivers.length}
الطيارين النشطين: ${dashboard.drivers.filter(d => d.active).length}
الطيارين المتاحين: ${dashboard.drivers.filter(d => d.active && (!d.status || d.status === 'available')).length}

هل تريد إعادة تحميل البيانات والمحاولة مرة أخرى؟`);
        
        if (refreshConfirm) {
            console.log('🔄 إعادة تحميل البيانات...');
            dashboard.loadAllData().then(() => {
                console.log('✅ تم إعادة التحميل، المحاولة مرة أخرى...');
                setTimeout(() => assignDriverToOrder(orderId), 500);
            });
        }
        return;
    }
    
    document.getElementById('assignOrderId').textContent = orderId;
    
    const driversList = document.getElementById('availableDriversList');
    driversList.innerHTML = '';
    
    availableDrivers.forEach(driver => {
        const driverCard = document.createElement('div');
        driverCard.className = 'available-driver-card';
        driverCard.onclick = () => assignDriver(orderId, driver.id, driver.name);
        
        driverCard.innerHTML = `
            <div class="driver-info">
                <div class="driver-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="driver-details">
                    <h4>${driver.name}</h4>
                    <p><i class="fas fa-phone"></i> ${driver.phone}</p>
                    <p><i class="fas fa-${getVehicleIcon(driver.vehicle)}"></i> ${getVehicleText(driver.vehicle)}</p>
                </div>
            </div>
            <div class="assign-btn">
                <i class="fas fa-arrow-left"></i>
            </div>
        `;
        
        driversList.appendChild(driverCard);
    });
    
    document.getElementById('assignDriverModal').style.display = 'block';
}

// تخصيص الطيار
async function assignDriver(orderId, driverId, driverName) {
    try {
        console.log('⚡ تخصيص طيار سريع:', { orderId, driverId, driverName });
        
        // عرض مؤشر التحميل
        const modal = document.getElementById('assignDriverModal');
        if (modal) {
            modal.style.opacity = '0.6';
            modal.style.pointerEvents = 'none';
        }
        
        // تحديث قاعدة البيانات
        await db.collection('orders').doc(orderId).update({
            driverId: driverId,
            driverName: driverName,
            assignedAt: new Date(),
            status: 'توصيل'
        });
        
        // تحديث البيانات المحلية فوراً
        const orderIndex = dashboard.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            dashboard.orders[orderIndex].driverId = driverId;
            dashboard.orders[orderIndex].driverName = driverName;
            dashboard.orders[orderIndex].status = 'توصيل';
            dashboard.orders[orderIndex].assignedAt = new Date();
        }
        
        // تحديث آخر تخصيص للطيار فقط
        await db.collection('drivers').doc(driverId).update({
            lastAssignedAt: new Date()
        });
        
        // تحديث البيانات المحلية للطيار
        const driverIndex = dashboard.drivers.findIndex(d => d.id === driverId);
        if (driverIndex !== -1) {
            dashboard.drivers[driverIndex].lastAssignedAt = new Date();
        }
        
        // إغلاق النافذة
        closeAssignDriverModal();
        
        // تحديث الواجهة فوراً
        dashboard.renderOrders();
        dashboard.updateStats();
        
        // رسالة نجاح
        showNotification(`تم تخصيص الطيار ${driverName} للطلب بنجاح`, 'success');
        
        console.log('✅ تم تخصيص الطيار بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في تخصيص الطيار:', error);
        
        // إزالة مؤشر التحميل
        const modal = document.getElementById('assignDriverModal');
        if (modal) {
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
        }
        
        alert('حدث خطأ في تخصيص الطيار: ' + error.message);
    }
}

// إغلاق نافذة تخصيص الطيار
function closeAssignDriverModal() {
    document.getElementById('assignDriverModal').style.display = 'none';
}

// عرض معلومات الطيار
function showDriverInfo(driverId) {
    showDriverReport(driverId);
}

// إنشاء طيارين افتراضيين
async function createDefaultDrivers() {
    try {
        const defaultDrivers = [
            {
                name: 'أحمد محمد',
                phone: '01xxxxxxxxx',
                license: 'D123456789',
                vehicle: 'motorcycle',
                commission: 10,
                address: 'الإسكندرية',
                active: true,
                status: 'available'
            },
            {
                name: 'محمد علي',
                phone: '01098765432',
                license: 'D987654321',
                vehicle: 'motorcycle',
                commission: 12,
                address: 'الإسكندرية',
                active: true,
                status: 'available'
            },
            {
                name: 'علي حسن',
                phone: '01055555555',
                license: 'D555555555',
                vehicle: 'car',
                commission: 8,
                address: 'الإسكندرية',
                active: true,
                status: 'available'
            }
        ];

        const batch = db.batch();
        
        defaultDrivers.forEach(driverData => {
            const driverRef = db.collection('drivers').doc();
            batch.set(driverRef, {
                ...driverData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });
        
        await batch.commit();
        
        alert('تم إنشاء الطيارين الافتراضيين بنجاح!');
        
        // إعادة تحميل البيانات
        await dashboard.loadAllData();
        loadDrivers();
        
    } catch (error) {
        console.error('خطأ في إنشاء الطيارين الافتراضيين:', error);
        alert('حدث خطأ في إنشاء الطيارين الافتراضيين');
    }
}
// إضافة CSS للطيارين
const driversCSS = `
<style>
/* ===== تصميم شاشة إدارة الطيارين ===== */

.drivers-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    border-radius: 15px;
    color: white;
    box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
}

.drivers-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.drivers-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.drivers-title-text h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
}

.drivers-title-text p {
    margin: 0.25rem 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
}

.add-driver-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
}

.add-driver-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.6);
}

/* إحصائيات الطيارين */
.drivers-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.driver-stat-card {
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.driver-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent-color);
}

.driver-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.active-card {
    --accent-color: #28a745;
    background: linear-gradient(135deg, #f0fff4, #fff);
}

.busy-card {
    --accent-color: #ffc107;
    background: linear-gradient(135deg, #fffbf0, #fff);
}

.orders-card {
    --accent-color: #dc3545;
    background: linear-gradient(135deg, #fff5f5, #fff);
}

.total-card {
    --accent-color: #007bff;
    background: linear-gradient(135deg, #f0f8ff, #fff);
}

/* شبكة الطيارين */
.drivers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.driver-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
}

.driver-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--driver-color);
}

.driver-card.active {
    --driver-color: #28a745;
}

.driver-card.inactive {
    --driver-color: #6c757d;
    opacity: 0.7;
}

.driver-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--driver-color);
}

.driver-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.driver-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--driver-color), rgba(var(--driver-color), 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.driver-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: relative;
}

.driver-status.active {
    color: #28a745;
}

.driver-status.inactive {
    color: #6c757d;
}

.driver-card-body {
    text-align: center;
    margin-bottom: 1.5rem;
}

.driver-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
}

.driver-phone {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
}

.driver-vehicle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #666;
}

.driver-stats-mini {
    display: flex;
    justify-content: space-around;
    margin-bottom: 1rem;
}

.mini-stat {
    text-align: center;
}

.mini-stat-number {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--driver-color);
}

.mini-stat-label {
    font-size: 0.8rem;
    color: #666;
}

.driver-card-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.report-btn {
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
}

.report-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
}

.toggle-btn {
    background: linear-gradient(135deg, #6f42c1, #5a32a3);
    color: white;
}

.toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(111, 66, 193, 0.4);
}

/* نافذة تقرير الطيار */
.driver-report-content {
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
}

.driver-info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8f9fa, #fff);
    border-radius: 15px;
    margin-bottom: 1.5rem;
    border: 1px solid #e9ecef;
}

.driver-info-card .driver-avatar {
    width: 80px;
    height: 80px;
    font-size: 2rem;
}

.driver-details h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #333;
}

.driver-details p {
    margin: 0.25rem 0;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

/* إحصائيات التقرير */
.driver-report-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.report-stat-card {
    padding: 1rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.report-stat-card .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: white;
    background: #007bff;
}

.report-stat-card .stat-info h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
}

.report-stat-card .stat-info p {
    margin: 0.25rem 0 0 0;
    color: #666;
    font-size: 0.8rem;
}

/* قسم طلبات الطيار */
.driver-orders-section {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 1.5rem;
}

.orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.orders-header h4 {
    margin: 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.orders-filters {
    display: flex;
    gap: 0.5rem;
}

.filter-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 20px;
    background: #e9ecef;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.8rem;
}

.filter-btn.active,
.filter-btn:hover {
    background: #007bff;
    color: white;
}

.driver-orders-list {
    max-height: 400px;
    overflow-y: auto;
}

.driver-order-card {
    background: white;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.driver-order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.driver-order-card.completed {
    border-left: 4px solid #28a745;
}

.driver-order-card.active {
    border-left: 4px solid #ffc107;
}

.order-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.order-id {
    font-weight: 700;
    color: #333;
}

.order-status {
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
}

.order-status.جديد {
    background: #f8d7da;
    color: #721c24;
}

.order-status.تأكيد {
    background: #d1ecf1;
    color: #0c5460;
}

.order-status.تحضير {
    background: #fff3cd;
    color: #856404;
}

.order-status.توصيل {
    background: #d4edda;
    color: #155724;
}

.order-status.completed {
    background: #28a745;
    color: white;
    font-weight: 600;
}

.order-status-small {
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 0.5rem;
}

.order-status-small.توصيل {
    background: #d4edda;
    color: #155724;
}

.order-status-small.completed {
    background: #28a745;
    color: white;
}

.driver-order-card.pending {
    border-left: 4px solid #ffc107;
}

.driver-order-card.completed {
    border-left: 4px solid #28a745;
    opacity: 0.8;
}

.order-card-body p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.order-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef;
}

.order-total {
    font-weight: 700;
    color: #28a745;
    font-size: 1.1rem;
}

.close-order-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.8rem;
}

.close-order-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(40, 167, 69, 0.4);
}

.no-orders {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
}

/* نافذة تخصيص الطيار */
.available-drivers {
    max-height: 400px;
    overflow-y: auto;
}

.available-driver-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border-radius: 10px;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.available-driver-card:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 123, 255, 0.2);
}

.available-driver-card .driver-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.available-driver-card .driver-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
}

.available-driver-card .driver-details h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    color: #333;
}

.available-driver-card .driver-details p {
    margin: 0.1rem 0;
    font-size: 0.8rem;
    color: #666;
}

.assign-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

/* أزرار الإجراءات في الطلبات */
.order-action-btn.assign-driver {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.order-action-btn.assign-driver:hover {
    background: linear-gradient(135deg, #20c997, #17a2b8);
    transform: translateY(-1px);
}

.order-action-btn.delivery {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.order-action-btn.delivery:hover {
    background: linear-gradient(135deg, #20c997, #17a2b8);
    transform: translateY(-1px);
}

.order-action-btn.driver-info {
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
}

.order-action-btn.driver-info:hover {
    background: linear-gradient(135deg, #138496, #0c5460);
    transform: translateY(-1px);
}

/* تحسينات الموبايل */
@media (max-width: 768px) {
    .drivers-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .drivers-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .drivers-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .driver-card {
        padding: 1rem;
    }
    
    .add-driver-btn {
        width: 100%;
        justify-content: center;
    }
    
    .driver-report-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .orders-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .orders-filters {
        width: 100%;
        justify-content: center;
    }
}

/* رسائل عدم وجود بيانات */
.no-drivers-message {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    grid-column: 1 / -1;
}

.no-drivers-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #28a745, #20c997);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
}

.no-drivers-message h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.3rem;
}

.no-drivers-message p {
    margin: 0 0 1.5rem 0;
    color: #666;
}

.error-message {
    text-align: center;
    padding: 2rem;
    background: #fff5f5;
    border: 1px solid #f5c6cb;
    border-radius: 10px;
    color: #721c24;
    grid-column: 1 / -1;
}

.error-message i {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
}

.error-message p {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
}

/* تحسينات الموبايل */
@media (max-width: 768px) {
    .drivers-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .drivers-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .drivers-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .driver-card {
        padding: 1rem;
    }
    
    .add-driver-btn {
        width: 100%;
        justify-content: center;
    }
    
    .driver-report-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .orders-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .orders-filters {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .drivers-stats {
        grid-template-columns: 1fr;
    }
    
    .driver-report-stats {
        grid-template-columns: 1fr;
    }
    
    .driver-stat-card {
        padding: 1rem;
    }
    
    .drivers-title-text h2 {
        font-size: 1.4rem;
    }
    
    .driver-card-actions {
        gap: 0.25rem;
    }
    
    .action-btn {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', driversCSS);

// دوال التشخيص والاختبار
window.runDiagnostics = function() {
    console.log('🔍 بدء تشخيص النظام...');
    
    const diagnostics = {
        firebase: !!db,
        dashboard: !!window.dashboard,
        elements: {},
        data: {}
    };
    
    // فحص العناصر المهمة
    const importantElements = [
        'totalProducts', 'totalOrders', 'totalCustomers', 'totalRevenue',
        'ordersTable', 'productsTable', 'customersTable'
    ];
    
    importantElements.forEach(id => {
        const element = document.getElementById(id);
        diagnostics.elements[id] = !!element;
        if (!element) {
            console.warn(`⚠️ العنصر ${id} غير موجود`);
        }
    });
    
    // فحص البيانات
    if (window.dashboard) {
        diagnostics.data = {
            products: window.dashboard.products?.length || 0,
            orders: window.dashboard.orders?.length || 0,
            customers: window.dashboard.customers?.length || 0,
            stores: window.dashboard.stores?.length || 0,
            categories: window.dashboard.categories?.length || 0
        };
    }
    
    console.log('📊 نتائج التشخيص:', diagnostics);
    
    // عرض النتائج للمستخدم
    const resultHtml = `
        <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px; margin: 2rem auto;">
            <h3 style="color: #333; margin-bottom: 1.5rem; text-align: center;">
                <i class="fas fa-stethoscope"></i> نتائج تشخيص النظام
            </h3>
            
            <div style="margin-bottom: 1rem;">
                <strong>🔥 Firebase:</strong> 
                <span style="color: ${diagnostics.firebase ? '#28a745' : '#dc3545'}">
                    ${diagnostics.firebase ? '✅ متصل' : '❌ غير متصل'}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>📊 لوحة التحكم:</strong> 
                <span style="color: ${diagnostics.dashboard ? '#28a745' : '#dc3545'}">
                    ${diagnostics.dashboard ? '✅ مُهيأة' : '❌ غير مُهيأة'}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>📈 البيانات:</strong>
                <ul style="margin: 0.5rem 0; padding-right: 1rem;">
                    <li>المنتجات: ${diagnostics.data.products || 0}</li>
                    <li>الطلبات: ${diagnostics.data.orders || 0}</li>
                    <li>العملاء: ${diagnostics.data.customers || 0}</li>
                    <li>المحلات: ${diagnostics.data.stores || 0}</li>
                    <li>المجموعات: ${diagnostics.data.categories || 0}</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>🎯 العناصر المهمة:</strong>
                <ul style="margin: 0.5rem 0; padding-right: 1rem;">
                    ${importantElements.map(id => 
                        `<li style="color: ${diagnostics.elements[id] ? '#28a745' : '#dc3545'}">
                            ${id}: ${diagnostics.elements[id] ? '✅' : '❌'}
                        </li>`
                    ).join('')}
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 1.5rem;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #667eea; 
                    color: white; 
                    border: none; 
                    padding: 0.8rem 2rem; 
                    border-radius: 8px; 
                    cursor: pointer;
                    font-weight: 600;
                ">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    
    // إضافة النتائج للصفحة
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    `;
    overlay.innerHTML = resultHtml;
    document.body.appendChild(overlay);
    
    // إغلاق عند النقر على الخلفية
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
};

window.testFirebaseConnection = async function() {
    console.log('🔥 اختبار اتصال Firebase...');
    
    if (!db) {
        alert('❌ Firebase غير متصل');
        return;
    }
    
    try {
        // اختبار بسيط لقراءة البيانات
        const testSnapshot = await db.collection('products').limit(1).get();
        console.log('✅ Firebase متصل بنجاح');
        console.log('📊 عدد المنتجات المتاحة:', testSnapshot.size);
        
        alert(`✅ Firebase متصل بنجاح!\n📊 تم العثور على ${testSnapshot.size} منتج في قاعدة البيانات`);
    } catch (error) {
        console.error('❌ خطأ في اتصال Firebase:', error);
        alert(`❌ خطأ في اتصال Firebase:\n${error.message}`);
    }
};

window.forceReloadFromFirebase = async function() {
    console.log('🔄 إعادة تحميل البيانات من Firebase...');
    
    if (!window.dashboard) {
        alert('❌ لوحة التحكم غير مُهيأة');
        return;
    }
    
    try {
        await window.dashboard.loadAllData();
        alert('✅ تم إعادة تحميل البيانات بنجاح');
    } catch (error) {
        console.error('❌ خطأ في إعادة التحميل:', error);
        alert(`❌ خطأ في إعادة التحميل:\n${error.message}`);
    }
};

console.log('🔧 تم تحميل دوال التشخيص بنجاح');
