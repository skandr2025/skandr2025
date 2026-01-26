// نظام المصادقة والصلاحيات
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    // تهيئة النظام
    init() {
        this.loadCurrentUser();
        this.checkAuthentication();
        this.setupPermissions();
    }

    // تحميل المستخدم الحالي
    loadCurrentUser() {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // التحقق من تسجيل الدخول
    checkAuthentication() {
        if (!this.currentUser) {
            // إعادة توجيه لصفحة تسجيل الدخول
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // إعداد الصلاحيات
    setupPermissions() {
        if (!this.currentUser) return;

        // إخفاء العناصر غير المسموحة
        this.hideUnauthorizedElements();
        
        // إضافة معلومات المستخدم للهيدر
        this.displayUserInfo();
        
        // إعداد أحداث تسجيل الخروج
        this.setupLogout();
    }

    // إخفاء العناصر غير المسموحة
    hideUnauthorizedElements() {
        const permissions = this.currentUser.permissions;
        
        // قائمة الشاشات والصلاحيات المطلوبة
        const screenPermissions = {
            'dashboard': 'dashboard',
            'orders': 'orders',
            'products': 'products',
            'categories': 'categories',
            'customers': 'customers',
            'stores': 'stores',
            'delivery': 'delivery',
            'drivers': 'drivers',
            'addons': 'addons',
            'suggestions': 'suggestions',
            'reports': 'reports',
            'users': 'users'
        };

        // إخفاء عناصر القائمة الجانبية
        Object.keys(screenPermissions).forEach(screen => {
            const permission = screenPermissions[screen];
            const navItem = document.querySelector(`[data-section="${screen}"]`);
            
            if (navItem && !permissions[permission]) {
                navItem.style.display = 'none';
            }
        });

        // إخفاء الأزرار في الشاشات
        this.hideUnauthorizedButtons();
    }

    // إخفاء الأزرار غير المسموحة
    hideUnauthorizedButtons() {
        const permissions = this.currentUser.permissions;
        
        // أزرار الإضافة
        if (!permissions.products) {
            const addProductBtn = document.getElementById('addProductBtn');
            if (addProductBtn) addProductBtn.style.display = 'none';
        }
        
        if (!permissions.categories) {
            const addCategoryBtn = document.getElementById('addCategoryBtn');
            if (addCategoryBtn) addCategoryBtn.style.display = 'none';
        }
        
        if (!permissions.stores) {
            const addStoreBtn = document.getElementById('addStoreBtn');
            if (addStoreBtn) addStoreBtn.style.display = 'none';
        }
        
        if (!permissions.delivery) {
            const addDeliveryBtn = document.getElementById('addDeliveryBtn');
            if (addDeliveryBtn) addDeliveryBtn.style.display = 'none';
        }
        
        if (!permissions.addons) {
            const addAddonBtn = document.getElementById('addAddonBtn');
            if (addAddonBtn) addAddonBtn.style.display = 'none';
        }
        
        if (!permissions.suggestions) {
            const addSuggestionBtn = document.getElementById('addSuggestionBtn');
            if (addSuggestionBtn) addSuggestionBtn.style.display = 'none';
        }

        // أزرار الإجراءات في الجداول
        this.hideTableActions();
    }

    // إخفاء أزرار الإجراءات في الجداول
    hideTableActions() {
        const permissions = this.currentUser.permissions;
        
        // إخفاء أزرار التعديل والحذف حسب الصلاحيات
        setTimeout(() => {
            // أزرار المنتجات
            if (!permissions.products) {
                document.querySelectorAll('#productsTable .btn-edit, #productsTable .btn-delete').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
            
            // أزرار المجموعات
            if (!permissions.categories) {
                document.querySelectorAll('#categoriesTable .btn-edit, #categoriesTable .btn-delete').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
            
            // أزرار المحلات
            if (!permissions.stores) {
                document.querySelectorAll('#storesTable .btn-edit, #storesTable .btn-delete').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
        }, 1000);
    }

    // عرض معلومات المستخدم
    displayUserInfo() {
        // إضافة معلومات المستخدم للهيدر
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn" onclick="toggleUserMenu()">
                        <i class="fas fa-user-circle"></i>
                        <span class="user-name">${this.currentUser.name}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-menu" id="userMenu">
                        <div class="user-info-item">
                            <strong>${this.currentUser.name}</strong>
                            <small>${this.getRoleText(this.currentUser.role)}</small>
                        </div>
                        <hr>
                        <a href="#" onclick="logout()" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                        </a>
                    </div>
                </div>
            `;
            
            // إدراج معلومات المستخدم قبل الأزرار الأخرى
            headerActions.insertBefore(userInfo, headerActions.firstChild);
        }
    }

    // الحصول على نص الدور
    getRoleText(role) {
        const roles = {
            'admin': 'مدير عام',
            'manager': 'مدير مطعم',
            'employee': 'موظف'
        };
        return roles[role] || role;
    }

    // إعداد تسجيل الخروج
    setupLogout() {
        // إضافة دالة تسجيل الخروج للنافذة العامة
        window.logout = () => {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        };

        // إضافة دوال أخرى
        window.toggleUserMenu = () => {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.classList.toggle('show');
            }
        };

        window.showProfile = () => {
            alert('سيتم إضافة صفحة الملف الشخصي قريباً');
        };

        window.changePassword = () => {
            const newPassword = prompt('أدخل كلمة المرور الجديدة:');
            if (newPassword && newPassword.length >= 6) {
                // تحديث كلمة المرور في localStorage
                const users = JSON.parse(localStorage.getItem('dashboardUsers') || '{}');
                if (users[this.currentUser.username]) {
                    users[this.currentUser.username].password = newPassword;
                    localStorage.setItem('dashboardUsers', JSON.stringify(users));
                    alert('تم تغيير كلمة المرور بنجاح');
                }
            } else if (newPassword !== null) {
                alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            }
        };

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const userBtn = document.querySelector('.user-btn');
            
            if (userMenu && userBtn && !userBtn.contains(e.target)) {
                userMenu.classList.remove('show');
            }
        });
    }

    // التحقق من صلاحية معينة
    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions[permission];
    }

    // التحقق من الدور
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // تحديث الصلاحيات (للاستخدام في إدارة المستخدمين)
    updatePermissions() {
        this.loadCurrentUser();
        this.hideUnauthorizedElements();
    }
}

// تهيئة نظام المصادقة عند تحميل الصفحة
let authSystem;
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
});

// إضافة CSS للمستخدم
const userCSS = `
<style>
.user-info {
    position: relative;
    margin-left: 1rem;
}

.user-dropdown {
    position: relative;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #333;
    font-size: 0.9rem;
}

.user-btn:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
}

.user-name {
    font-weight: 600;
}

.user-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    min-width: 200px;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.user-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.user-info-item {
    text-align: center;
    margin-bottom: 0.5rem;
}

.user-info-item strong {
    display: block;
    color: #333;
    font-size: 1rem;
}

.user-info-item small {
    color: #666;
    font-size: 0.8rem;
}

.user-menu hr {
    margin: 0.5rem 0;
    border: none;
    border-top: 1px solid #eee;
}

.user-menu a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    color: #333;
    text-decoration: none;
    border-radius: 5px;
    transition: background 0.3s ease;
}

.user-menu a:hover {
    background: #f8f9fa;
}

.user-menu .logout-btn {
    color: #dc3545;
}

.user-menu .logout-btn:hover {
    background: #fee;
}

@media (max-width: 768px) {
    .user-btn .user-name {
        display: none;
    }
    
    .user-btn {
        padding: 0.5rem;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        justify-content: center;
    }
    
    .user-menu {
        right: 0;
        left: auto;
    }
}
</style>
`;

// إضافة CSS للصفحة
document.head.insertAdjacentHTML('beforeend', userCSS);