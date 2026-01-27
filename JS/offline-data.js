// 🔄 بيانات تجريبية للعمل بدون Firebase
// هذا الملف يحتوي على بيانات مؤقتة لاستخدامها عند تعطل Firebase

const offlineData = {
    // طلبات تجريبية
    orders: [
        {
            id: 'offline_order_1',
            customerName: 'أحمد محمد',
            customerPhone: '01234567890',
            items: [
                { name: 'كبدة سكندراني', quantity: 2, price: 45 }
            ],
            total: 90,
            status: 'جديد',
            address: 'شارع الجمهورية، الإسكندرية',
            orderDate: new Date().toISOString(),
            deliveryFee: 10
        },
        {
            id: 'offline_order_2',
            customerName: 'فاطمة أحمد',
            customerPhone: '01098765432',
            items: [
                { name: 'سجق إسكندراني', quantity: 1, price: 35 },
                { name: 'أرز بلبن', quantity: 2, price: 15 }
            ],
            total: 65,
            status: 'تحضير',
            address: 'شارع فؤاد، الإسكندرية',
            orderDate: new Date(Date.now() - 3600000).toISOString(),
            deliveryFee: 10
        }
    ],

    // منتجات تجريبية
    products: [
        {
            id: 'offline_product_1',
            name: 'كبدة سكندراني',
            price: 45,
            category: 'الأطباق الرئيسية',
            desc: 'كبدة طازجة بالخلطة السكندرانية الأصلية',
            images: ['img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg'],
            visible: true,
            discount: 0
        },
        {
            id: 'offline_product_2',
            name: 'سجق إسكندراني',
            price: 35,
            category: 'الأطباق الرئيسية',
            desc: 'سجق طازج بالتوابل الإسكندرانية',
            images: ['img/طاجن سجق.png'],
            visible: true,
            discount: 5
        },
        {
            id: 'offline_product_3',
            name: 'أرز بلبن',
            price: 15,
            category: 'الحلويات',
            desc: 'أرز بلبن طازج ولذيذ',
            images: ['img/ارز بلبن.png'],
            visible: true,
            discount: 0
        }
    ],

    // فئات تجريبية
    categories: [
        {
            id: 'offline_cat_1',
            name: 'الأطباق الرئيسية',
            slug: 'main-dishes',
            desc: 'أشهى الأطباق الرئيسية',
            visible: true
        },
        {
            id: 'offline_cat_2',
            name: 'الحلويات',
            slug: 'desserts',
            desc: 'حلويات شرقية وغربية',
            visible: true
        }
    ],

    // محلات تجريبية
    stores: [
        {
            id: 'offline_store_1',
            name: 'فرع الإسكندرية الرئيسي',
            phone: '03-1234567',
            address: 'شارع الجمهورية، الإسكندرية',
            image: 'img/icon.JPG',
            visible: true
        },
        {
            id: 'offline_store_2',
            name: 'فرع سيدي جابر',
            phone: '03-7654321',
            address: 'شارع فؤاد، سيدي جابر',
            image: 'img/icon2.jpg',
            visible: true
        }
    ],

    // مناطق التوصيل
    deliveryAreas: [
        {
            id: 'offline_area_1',
            name: 'وسط الإسكندرية',
            fee: 10,
            desc: 'التوصيل خلال 30 دقيقة',
            active: true
        },
        {
            id: 'offline_area_2',
            name: 'سيدي جابر',
            fee: 15,
            desc: 'التوصيل خلال 45 دقيقة',
            active: true
        }
    ],

    // اقتراحات تجريبية
    suggestions: [
        {
            id: 'offline_suggestion_1',
            name: 'وجبة العائلة',
            price: 120,
            desc: 'كبدة + سجق + أرز بلبن لـ 4 أشخاص',
            image: 'img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg',
            active: true
        }
    ],

    // عملاء تجريبيين
    customers: [
        {
            id: 'offline_customer_1',
            name: 'أحمد محمد',
            phone: '01234567890',
            address: 'شارع الجمهورية، الإسكندرية',
            totalOrders: 5,
            totalSpent: 450,
            joinDate: '2024-01-15'
        },
        {
            id: 'offline_customer_2',
            name: 'فاطمة أحمد',
            phone: '01098765432',
            address: 'شارع فؤاد، الإسكندرية',
            totalOrders: 3,
            totalSpent: 195,
            joinDate: '2024-02-20'
        }
    ]
};

// دالة للحصول على البيانات التجريبية
window.getOfflineData = function(collection) {
    return offlineData[collection] || [];
};

// دالة لمحاكاة Firebase عند عدم توفره
window.createOfflineFirebase = function() {
    return {
        collection: (name) => ({
            get: () => Promise.resolve({
                docs: offlineData[name]?.map(item => ({
                    id: item.id,
                    data: () => item,
                    exists: true
                })) || []
            }),
            limit: (num) => ({
                get: () => Promise.resolve({
                    docs: (offlineData[name] || []).slice(0, num).map(item => ({
                        id: item.id,
                        data: () => item,
                        exists: true
                    }))
                })
            }),
            where: (field, op, value) => ({
                get: () => {
                    let filtered = offlineData[name] || [];
                    if (op === '==') {
                        filtered = filtered.filter(item => item[field] === value);
                    }
                    return Promise.resolve({
                        docs: filtered.map(item => ({
                            id: item.id,
                            data: () => item,
                            exists: true
                        }))
                    });
                },
                limit: (num) => ({
                    get: () => {
                        let filtered = offlineData[name] || [];
                        if (op === '==') {
                            filtered = filtered.filter(item => item[field] === value);
                        }
                        return Promise.resolve({
                            docs: filtered.slice(0, num).map(item => ({
                                id: item.id,
                                data: () => item,
                                exists: true
                            }))
                        });
                    }
                })
            }),
            add: (data) => {
                const id = 'offline_' + Date.now();
                const newItem = { id, ...data };
                if (!offlineData[name]) offlineData[name] = [];
                offlineData[name].push(newItem);
                return Promise.resolve({ id });
            },
            doc: (id) => ({
                get: () => {
                    const item = (offlineData[name] || []).find(item => item.id === id);
                    return Promise.resolve({
                        exists: !!item,
                        data: () => item,
                        id: id
                    });
                },
                update: (data) => {
                    const index = (offlineData[name] || []).findIndex(item => item.id === id);
                    if (index !== -1) {
                        offlineData[name][index] = { ...offlineData[name][index], ...data };
                    }
                    return Promise.resolve();
                },
                delete: () => {
                    if (offlineData[name]) {
                        offlineData[name] = offlineData[name].filter(item => item.id !== id);
                    }
                    return Promise.resolve();
                }
            })
        })
    };
};

console.log('📦 بيانات العمل بدون Firebase جاهزة');