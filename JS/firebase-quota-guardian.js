// 🛡️ Firebase Quota Guardian - الحماية النهائية من Quota Exceeded
// هذا النظام يراقب ويحمي من تجاوز حدود Firebase

class FirebaseQuotaGuardian {
    constructor() {
        this.dailyLimits = {
            reads: 45000,    // 45K بدلاً من 50K للأمان
            writes: 18000,   // 18K بدلاً من 20K للأمان
            deletes: 18000   // 18K بدلاً من 20K للأمان
        };
        
        this.currentUsage = {
            reads: 0,
            writes: 0,
            deletes: 0,
            lastReset: this.getTodayKey()
        };
        
        this.warningThresholds = {
            reads: 40000,    // تحذير عند 40K
            writes: 15000,   // تحذير عند 15K
            deletes: 15000   // تحذير عند 15K
        };
        
        this.init();
    }
    
    init() {
        this.loadUsageFromStorage();
        this.checkDailyReset();
        this.setupUsageMonitoring();
        console.log('🛡️ Firebase Quota Guardian مفعل');
    }
    
    getTodayKey() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    checkDailyReset() {
        const today = this.getTodayKey();
        if (this.currentUsage.lastReset !== today) {
            console.log('🔄 إعادة تعيين عدادات الاستهلاك اليومي');
            this.currentUsage = {
                reads: 0,
                writes: 0,
                deletes: 0,
                lastReset: today
            };
            this.saveUsageToStorage();
        }
    }
    
    loadUsageFromStorage() {
        const stored = localStorage.getItem('firebaseQuotaUsage');
        if (stored) {
            this.currentUsage = JSON.parse(stored);
        }
    }
    
    saveUsageToStorage() {
        localStorage.setItem('firebaseQuotaUsage', JSON.stringify(this.currentUsage));
    }
    
    // فحص ما إذا كانت العملية آمنة
    canPerformOperation(type, count = 1) {
        this.checkDailyReset();
        
        const newUsage = this.currentUsage[type] + count;
        const limit = this.dailyLimits[type];
        
        if (newUsage > limit) {
            console.error(`🚨 تجاوز حد ${type}: ${newUsage}/${limit}`);
            this.showQuotaWarning(type, newUsage, limit);
            return false;
        }
        
        // تحذير عند الاقتراب من الحد
        if (newUsage > this.warningThresholds[type]) {
            this.showApproachingLimitWarning(type, newUsage, limit);
        }
        
        return true;
    }
    
    // تسجيل استخدام العملية
    recordOperation(type, count = 1) {
        this.checkDailyReset();
        this.currentUsage[type] += count;
        this.saveUsageToStorage();
        
        // تحديث مؤشر الاستهلاك في الواجهة
        this.updateUsageDisplay();
    }
    
    // عرض تحذير تجاوز الحد
    showQuotaWarning(type, current, limit) {
        const message = `
            🚨 تحذير: تم الوصول للحد الأقصى!
            
            نوع العملية: ${this.getOperationNameArabic(type)}
            الاستهلاك الحالي: ${current.toLocaleString()}
            الحد المسموح: ${limit.toLocaleString()}
            
            سيتم إيقاف العمليات لحماية Firebase من التعطل.
            الحد سيتجدد غداً الساعة 10 صباحاً.
        `;
        
        alert(message);
        this.showQuotaExceededModal(type, current, limit);
    }
    
    // تحذير الاقتراب من الحد
    showApproachingLimitWarning(type, current, limit) {
        const percentage = Math.round((current / limit) * 100);
        
        if (percentage >= 90 && !this.hasShownWarning90) {
            console.warn(`⚠️ تحذير: وصلت لـ ${percentage}% من حد ${type}`);
            this.showNotification(`تحذير: وصلت لـ ${percentage}% من حد ${this.getOperationNameArabic(type)}`, 'warning');
            this.hasShownWarning90 = true;
        }
    }
    
    getOperationNameArabic(type) {
        const names = {
            reads: 'القراءة',
            writes: 'الكتابة',
            deletes: 'الحذف'
        };
        return names[type] || type;
    }
    
    // عرض مودال تجاوز الحد
    showQuotaExceededModal(type, current, limit) {
        const modal = document.createElement('div');
        modal.className = 'quota-exceeded-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content quota-modal">
                    <div class="quota-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>تم الوصول للحد الأقصى!</h3>
                    </div>
                    <div class="quota-body">
                        <div class="quota-info">
                            <div class="quota-item">
                                <span>نوع العملية:</span>
                                <strong>${this.getOperationNameArabic(type)}</strong>
                            </div>
                            <div class="quota-item">
                                <span>الاستهلاك الحالي:</span>
                                <strong>${current.toLocaleString()}</strong>
                            </div>
                            <div class="quota-item">
                                <span>الحد المسموح:</span>
                                <strong>${limit.toLocaleString()}</strong>
                            </div>
                        </div>
                        <div class="quota-message">
                            <p>تم إيقاف العمليات مؤقتاً لحماية Firebase من التعطل.</p>
                            <p>الحد سيتجدد تلقائياً غداً الساعة 10 صباحاً.</p>
                        </div>
                        <div class="quota-solutions">
                            <h4>الحلول المتاحة:</h4>
                            <ul>
                                <li>انتظار تجديد الحد غداً</li>
                                <li>ترقية الخطة لحدود أعلى</li>
                                <li>تقليل عدد العمليات</li>
                            </ul>
                        </div>
                    </div>
                    <div class="quota-footer">
                        <button onclick="this.closest('.quota-exceeded-modal').remove()" class="btn btn-primary">
                            فهمت
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // تحديث عرض الاستهلاك في الواجهة
    updateUsageDisplay() {
        const usageDisplay = document.getElementById('quotaUsageDisplay');
        if (usageDisplay) {
            const readsPercent = Math.round((this.currentUsage.reads / this.dailyLimits.reads) * 100);
            const writesPercent = Math.round((this.currentUsage.writes / this.dailyLimits.writes) * 100);
            
            usageDisplay.innerHTML = `
                <div class="usage-item">
                    <span>القراءة: ${this.currentUsage.reads.toLocaleString()}/${this.dailyLimits.reads.toLocaleString()}</span>
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${readsPercent}%; background: ${readsPercent > 90 ? '#dc3545' : readsPercent > 70 ? '#ffc107' : '#28a745'}"></div>
                    </div>
                </div>
                <div class="usage-item">
                    <span>الكتابة: ${this.currentUsage.writes.toLocaleString()}/${this.dailyLimits.writes.toLocaleString()}</span>
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${writesPercent}%; background: ${writesPercent > 90 ? '#dc3545' : writesPercent > 70 ? '#ffc107' : '#28a745'}"></div>
                    </div>
                </div>
            `;
        }
    }
    
    // إنشاء عرض الاستهلاك في الهيدر
    createUsageDisplay() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const usageContainer = document.createElement('div');
            usageContainer.className = 'quota-usage-container';
            usageContainer.innerHTML = `
                <div class="quota-usage-toggle" onclick="this.nextElementSibling.classList.toggle('show')">
                    <i class="fas fa-chart-bar"></i>
                    <span class="d-none d-md-inline">الاستهلاك</span>
                </div>
                <div class="quota-usage-dropdown" id="quotaUsageDisplay">
                    <!-- سيتم تحديثه تلقائياً -->
                </div>
            `;
            headerActions.insertBefore(usageContainer, headerActions.firstChild);
            this.updateUsageDisplay();
        }
    }
    
    // إعداد مراقبة الاستخدام
    setupUsageMonitoring() {
        // مراقبة كل عمليات Firebase
        if (window.db && window.db.collection) {
            this.wrapFirebaseOperations();
        }
        
        // إنشاء عرض الاستهلاك
        setTimeout(() => {
            this.createUsageDisplay();
        }, 1000);
    }
    
    // تغليف عمليات Firebase لمراقبتها
    wrapFirebaseOperations() {
        const originalCollection = window.db.collection;
        const guardian = this;
        
        window.db.collection = function(name) {
            const collection = originalCollection.call(this, name);
            
            // تغليف عملية get (قراءة)
            const originalGet = collection.get;
            collection.get = async function() {
                if (!guardian.canPerformOperation('reads', 1)) {
                    throw new Error('تم الوصول للحد الأقصى للقراءة اليومي');
                }
                
                const result = await originalGet.call(this);
                guardian.recordOperation('reads', result.docs ? result.docs.length : 1);
                return result;
            };
            
            // تغليف عملية add (كتابة)
            const originalAdd = collection.add;
            collection.add = async function(data) {
                if (!guardian.canPerformOperation('writes', 1)) {
                    throw new Error('تم الوصول للحد الأقصى للكتابة اليومي');
                }
                
                const result = await originalAdd.call(this, data);
                guardian.recordOperation('writes', 1);
                return result;
            };
            
            return collection;
        };
    }
    
    // عرض إحصائيات الاستهلاك
    getUsageStats() {
        this.checkDailyReset();
        return {
            reads: {
                current: this.currentUsage.reads,
                limit: this.dailyLimits.reads,
                percentage: Math.round((this.currentUsage.reads / this.dailyLimits.reads) * 100)
            },
            writes: {
                current: this.currentUsage.writes,
                limit: this.dailyLimits.writes,
                percentage: Math.round((this.currentUsage.writes / this.dailyLimits.writes) * 100)
            },
            deletes: {
                current: this.currentUsage.deletes,
                limit: this.dailyLimits.deletes,
                percentage: Math.round((this.currentUsage.deletes / this.dailyLimits.deletes) * 100)
            }
        };
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// تفعيل النظام تلقائياً
let quotaGuardian;
document.addEventListener('DOMContentLoaded', function() {
    quotaGuardian = new FirebaseQuotaGuardian();
    window.quotaGuardian = quotaGuardian;
});

// دوال مساعدة للاستخدام العام
window.checkQuotaUsage = function() {
    if (window.quotaGuardian) {
        const stats = window.quotaGuardian.getUsageStats();
        console.table(stats);
        return stats;
    }
};

window.resetQuotaUsage = function() {
    if (window.quotaGuardian) {
        window.quotaGuardian.currentUsage = {
            reads: 0,
            writes: 0,
            deletes: 0,
            lastReset: window.quotaGuardian.getTodayKey()
        };
        window.quotaGuardian.saveUsageToStorage();
        console.log('✅ تم إعادة تعيين عدادات الاستهلاك');
    }
};

console.log('🛡️ Firebase Quota Guardian جاهز للحماية!');