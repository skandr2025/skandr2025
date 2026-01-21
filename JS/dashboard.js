// 🔥 Firebase Dashboard - النسخة النظيفة والكاملة
// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCCbgntmD4nhYmR4RLSJHIhlik5TG0H0gs",
    authDomain: "dashboard-skandr.firebaseapp.com",
    projectId: "dashboard-skandr",
    storageBucket: "dashboard-skandr.firebasestorage.app",
    messagingSenderId: "875308290353",
    appId: "1:875308290353:web:952296a93bb4b9b7d5a010",
    measurementId: "G-Q6TDXX2DHX"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
        
        this.setupEventListeners();
        this.loadAllData();
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
            
            const [productsData, ordersData, customersData, storesData, categoriesData, deliveryData, suggestionsData, addonsData] = await Promise.all([
                this.fetchData('products'),
                this.fetchData('orders'),
                this.fetchData('customers'),
                this.fetchData('stores'),
                this.fetchData('categories'),
                this.fetchData('deliveryAreas'),
                this.fetchData('suggestions'),
                this.fetchData('addons')
            ]);
            
            this.products = productsData || [];
            this.orders = ordersData || [];
            this.customers = customersData || [];
            this.stores = storesData || [];
            this.categories = categoriesData || [];
            this.deliveryAreas = deliveryData || [];
            this.suggestions = suggestionsData || [];
            this.addons = addonsData || [];
            
            console.log('✅ تم تحميل البيانات من Firebase');
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
        }
    }

    async fetchData(collection) {
        try {
            const snapshot = await db.collection(collection).get();
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            return data;
        } catch (error) {
            console.error(`خطأ في تحميل ${collection}:`, error);
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
                'addons': 'الإضافات',
                'suggestions': 'الاقتراحات',
                'reports': 'التقارير'
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
            }
        }, 50);

        this.currentSection = sectionName;
    }

    updateDashboard() {
        // Update dashboard statistics
        let totalRevenue = 0;
        let completedOrders = 0;
        
        this.orders.forEach(order => {
            const status = order.status || 'جديد';
            
            if (status === 'توصيل') {
                totalRevenue += parseFloat(order.total) || 0;
                completedOrders++;
            }
        });

        // Update UI elements
        const elements = {
            'totalProducts': this.products.length,
            'totalOrders': this.orders.length,
            'totalCustomers': this.customers.length,
            'totalRevenue': totalRevenue.toFixed(2) + ' ج.م'
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });

        console.log('📊 Dashboard updated');
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
            filteredOrders = this.orders.filter(order => (order.status || 'جديد') === activeFilter);
        }
        
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt || order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            
            // تحديد الحالة التالية
            const nextStatus = this.getNextOrderStatus(order.status || 'جديد');
            const currentStatus = order.status || 'جديد';
            
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
                        ${nextStatus ? `
                            <button class="order-action-btn next-status" onclick="quickUpdateOrderStatus('${order.id}', '${nextStatus}')" title="تحديث إلى ${nextStatus}">
                                <i class="fas fa-arrow-left"></i> ${nextStatus}
                            </button>
                        ` : ''}
                        ${currentStatus !== 'توصيل' && currentStatus !== 'إلغاء' ? `
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
            'إلغاء': 0
        };

        this.orders.forEach(order => {
            const status = order.status || 'جديد';
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
        document.getElementById('cancelledOrdersCount').textContent = counts['إلغاء'];
    }

    getNextOrderStatus(currentStatus) {
        const statusFlow = {
            'جديد': 'تأكيد',
            'تأكيد': 'تحضير', 
            'تحضير': 'توصيل',
            'توصيل': null,
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
        
        const reportsData = {
            totalRevenue,
            deliveryRevenue,
            completedOrders: completedOrders.length,
            totalOrders: filteredOrders.length,
            averageOrder,
            activeCustomers: uniqueCustomers.size,
            topProducts,
            topAreas,
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
// ===== GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS =====

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

// ===== SAVE FUNCTIONS =====
window.saveProduct = function() {
    console.log('💾 حفظ منتج...');
    
    const name = document.getElementById('productName')?.value?.trim();
    const price = parseFloat(document.getElementById('productPrice')?.value) || 0;
    const category = document.getElementById('productCategory')?.value?.trim();
    const desc = document.getElementById('productDesc')?.value?.trim();
    const visible = document.getElementById('productVisible')?.checked;
    
    if (!name || price <= 0) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const productData = {
        name,
        price,
        category,
        desc,
        visible: visible !== false,
        images: ['img/default.jpg'],
        image: 'img/default.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingProductID) {
        // تحديث منتج موجود
        db.collection('products').doc(window.dashboard.editingProductID).update(productData).then(() => {
            const productIndex = window.dashboard.products.findIndex(p => p.id === window.dashboard.editingProductID);
            if (productIndex > -1) {
                window.dashboard.products[productIndex] = { ...window.dashboard.products[productIndex], ...productData };
            }
            closeProductModal();
            window.dashboard.renderProducts();
            showNotification('تم تحديث المنتج بنجاح', 'success');
            window.dashboard.editingProductID = null;
        }).catch(error => {
            console.error('خطأ في تحديث المنتج:', error);
            showNotification('حدث خطأ في تحديث المنتج', 'error');
        });
    } else {
        // إضافة منتج جديد
        db.collection('products').add(productData).then((docRef) => {
            window.dashboard.products.push({ id: docRef.id, ...productData });
            closeProductModal();
            window.dashboard.renderProducts();
            showNotification('تم إضافة المنتج بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('productForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة المنتج:', error);
            showNotification('حدث خطأ في إضافة المنتج', 'error');
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
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const storeData = {
        name,
        phone,
        address,
        visible: visible !== false,
        image: 'img/icon.JPG',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingStoreID) {
        // تحديث محل موجود
        db.collection('stores').doc(window.dashboard.editingStoreID).update(storeData).then(() => {
            const storeIndex = window.dashboard.stores.findIndex(s => s.id === window.dashboard.editingStoreID);
            if (storeIndex > -1) {
                window.dashboard.stores[storeIndex] = { ...window.dashboard.stores[storeIndex], ...storeData };
            }
            closeStoreModal();
            window.dashboard.renderStores();
            showNotification('تم تحديث المحل بنجاح', 'success');
            window.dashboard.editingStoreID = null;
        }).catch(error => {
            console.error('خطأ في تحديث المحل:', error);
            showNotification('حدث خطأ في تحديث المحل', 'error');
        });
    } else {
        // إضافة محل جديد
        db.collection('stores').add(storeData).then((docRef) => {
            window.dashboard.stores.push({ id: docRef.id, ...storeData });
            closeStoreModal();
            window.dashboard.renderStores();
            showNotification('تم إضافة المحل بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('storeForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة المحل:', error);
            showNotification('حدث خطأ في إضافة المحل', 'error');
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
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    const suggestionData = {
        name,
        price,
        desc,
        active: active !== false,
        image: 'img/default.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    if (window.dashboard.editingSuggestionID) {
        // تحديث اقتراح موجود
        db.collection('suggestions').doc(window.dashboard.editingSuggestionID).update(suggestionData).then(() => {
            const suggestionIndex = window.dashboard.suggestions.findIndex(s => s.id === window.dashboard.editingSuggestionID);
            if (suggestionIndex > -1) {
                window.dashboard.suggestions[suggestionIndex] = { ...window.dashboard.suggestions[suggestionIndex], ...suggestionData };
            }
            closeSuggestionModal();
            window.dashboard.renderSuggestions();
            showNotification('تم تحديث الاقتراح بنجاح', 'success');
            window.dashboard.editingSuggestionID = null;
        }).catch(error => {
            console.error('خطأ في تحديث الاقتراح:', error);
            showNotification('حدث خطأ في تحديث الاقتراح', 'error');
        });
    } else {
        // إضافة اقتراح جديد
        db.collection('suggestions').add(suggestionData).then((docRef) => {
            window.dashboard.suggestions.push({ id: docRef.id, ...suggestionData });
            closeSuggestionModal();
            window.dashboard.renderSuggestions();
            showNotification('تم إضافة الاقتراح بنجاح', 'success');
            
            // إعادة تعيين النموذج
            document.getElementById('suggestionForm')?.reset();
        }).catch(error => {
            console.error('خطأ في إضافة الاقتراح:', error);
            showNotification('حدث خطأ في إضافة الاقتراح', 'error');
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
                phone: '01234567890',
                address: 'شارع الجمهورية، المنصورة',
                area: 'المنصورة',
                status: 'توصيل',
                total: 150.50,
                deliveryFee: 15.00,
                subtotal: 135.50,
                productsTotal: 135.50,
                items: [
                    { 
                        name: 'كبدة اسكندراني', 
                        title: 'كبدة اسكندراني',
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
                phone: '01123456789',
                address: 'شارع البحر، الإسكندرية',
                area: 'الإسكندرية',
                status: 'تحضير',
                total: 200.00,
                deliveryFee: 20.00,
                subtotal: 180.00,
                productsTotal: 180.00,
                items: [
                    { 
                        name: 'كبدة اسكندراني', 
                        title: 'كبدة اسكندراني',
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
        const message = encodeURIComponent('مرحباً، نتواصل معك من مطعم اسكندر للكبدة الاسكندراني');
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
                <div class="restaurant-name">🍽️ اسكندر للكبدة الاسكندراني</div>
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
                <p><strong>شكراً لاختياركم مطعم اسكندر للكبدة الاسكندراني</strong></p>
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
            <title>تقارير اسكندر للكبدة الاسكندراني - ${currentDate}</title>
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
                <h1>🍽️ اسكندر للكبدة الاسكندراني</h1>
                <h2>تقرير المبيعات والأداء</h2>
                <p>تاريخ التقرير: ${currentDate}</p>
            </div>
            ${reportsSection.innerHTML}
            <div class="footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام إدارة اسكندر للكبدة الاسكندراني</p>
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
            <div class="t">🍽️ اسكندر للكبدة</div>
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
            شكراً لاختياركم اسكندر<br>نتطلع لخدمتكم دائماً
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
        <div class="restaurant-name">🍽️ اسكندر للكبدة</div>
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
        <div>شكراً لاختياركم مطعم اسكندر</div>
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