/*! Dark Mode Toggle - اسكندر
------------------------------------------------------------------------------
- تغيير الوضع الليلي/النهاري فقط
- حفظ الإعدادات في localStorage
------------------------------------------------------------------------------*/

(function() {
    'use strict';

    // المتغيرات العامة
    let currentTheme = localStorage.getItem('theme') || 'light';

    // تطبيق الثيم المحفوظ عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🌙 تطبيق الثيم المحفوظ:', currentTheme);
        applyTheme(currentTheme);
        updateDarkButton();
    });

    // دالة تغيير الوضع الليلي
    window.toggleDarkMode = function() {
        console.log('🌙 تغيير الثيم من', currentTheme);
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log('🌙 إلى', currentTheme);
        
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateDarkButton();
        
        // تطبيق على صفحة الطلب أيضاً
        broadcastThemeChange(currentTheme);
    };

    // تطبيق الثيم
    function applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        
        console.log('✅ تم تطبيق الثيم:', theme);
    }

    // تحديث زر النايت مود
    function updateDarkButton() {
        const darkButton = document.querySelector('.dark-button');
        if (darkButton) {
            const icon = darkButton.querySelector('i');
            if (currentTheme === 'dark') {
                darkButton.classList.add('active');
                darkButton.setAttribute('title', 'الوضع النهاري');
                if (icon) icon.className = 'fas fa-sun';
            } else {
                darkButton.classList.remove('active');
                darkButton.setAttribute('title', 'الوضع الليلي');
                if (icon) icon.className = 'fas fa-moon';
            }
        }
    }

    // إرسال التغييرات للصفحات الأخرى
    function broadcastThemeChange(theme) {
        localStorage.setItem('theme_broadcast', JSON.stringify({
            value: theme,
            timestamp: Date.now()
        }));
    }

    // الاستماع للتغييرات من الصفحات الأخرى
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme_broadcast') {
            const data = JSON.parse(e.newValue);
            if (data && data.value !== currentTheme) {
                currentTheme = data.value;
                applyTheme(currentTheme);
                updateDarkButton();
            }
        }
    });

    console.log('✅ تم تحميل نظام النايت مود');
})();