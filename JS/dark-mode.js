    /*! Dark Mode Toggle - سكندر
    ------------------------------------------------------------------------------
    - تغيير الوضع الليلي/النهاري فقط
    - حفظ الإعدادات في localStorage
    - دعم تلقائي لنايت مود النظام
    ------------------------------------------------------------------------------*/

    (function() {
        'use strict';

        // المتغيرات العامة
        let currentTheme = localStorage.getItem('theme') || 'auto';

        // تطبيق الثيم المحفوظ عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🌙 تطبيق الثيم المحفوظ:', currentTheme);
            applyTheme(currentTheme);
            updateDarkButton();
            
            // مراقبة تغيير نايت مود النظام
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQuery.addListener(handleSystemThemeChange);
                console.log('🌙 مراقبة نايت مود النظام مفعلة');
            }
        });

        // دالة تغيير الوضع الليلي
        window.toggleDarkMode = function() {
            console.log('🌙 تغيير الثيم من', currentTheme);
            
            // دورة: auto -> light -> dark -> auto
            if (currentTheme === 'auto') {
                currentTheme = 'light';
            } else if (currentTheme === 'light') {
                currentTheme = 'dark';
            } else {
                currentTheme = 'auto';
            }
            
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
            const html = document.documentElement;
            
            // إزالة جميع الكلاسات السابقة
            body.classList.remove('dark-mode', 'light-mode', 'system-dark-mode');
            html.removeAttribute('data-theme');
            
            if (theme === 'dark') {
                body.classList.add('dark-mode');
                html.setAttribute('data-theme', 'dark');
            } else if (theme === 'light') {
                body.classList.add('light-mode');
                html.setAttribute('data-theme', 'light');
            } else if (theme === 'auto') {
                // استخدام نايت مود النظام
                const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemPrefersDark) {
                    body.classList.add('system-dark-mode');
                    html.setAttribute('data-theme', 'dark');
                } else {
                    html.setAttribute('data-theme', 'light');
                }
                console.log('🌙 نايت مود النظام:', systemPrefersDark ? 'مظلم' : 'فاتح');
            }
            
            console.log('✅ تم تطبيق الثيم:', theme);
        }

        // مراقبة تغيير نايت مود النظام
        function handleSystemThemeChange(e) {
            console.log('🌙 تغيير نايت مود النظام:', e.matches ? 'مظلم' : 'فاتح');
            
            // إعادة تطبيق الثيم إذا كان في وضع auto
            if (currentTheme === 'auto') {
                applyTheme('auto');
            }
        }

        // تحديث زر النايت مود
        function updateDarkButton() {
            const darkButton = document.querySelector('.dark-button');
            if (darkButton) {
                const icon = darkButton.querySelector('i');
                
                // إزالة جميع الكلاسات السابقة
                darkButton.classList.remove('active', 'auto', 'light');
                
                if (currentTheme === 'dark') {
                    darkButton.classList.add('active');
                    darkButton.setAttribute('title', 'الوضع التلقائي');
                    if (icon) icon.className = 'fas fa-sun';
                } else if (currentTheme === 'light') {
                    darkButton.classList.add('light');
                    darkButton.setAttribute('title', 'الوضع الليلي');
                    if (icon) icon.className = 'fas fa-moon';
                } else {
                    darkButton.classList.add('auto');
                    darkButton.setAttribute('title', 'الوضع النهاري');
                    if (icon) icon.className = 'fas fa-adjust';
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

        // دالة للحصول على الثيم الحالي
        window.getCurrentTheme = function() {
            return currentTheme;
        };

        // دالة لتعيين ثيم محدد
        window.setTheme = function(theme) {
            if (['auto', 'light', 'dark'].includes(theme)) {
                currentTheme = theme;
                applyTheme(currentTheme);
                localStorage.setItem('theme', currentTheme);
                updateDarkButton();
                broadcastThemeChange(currentTheme);
            }
        };

        console.log('✅ تم تحميل نظام النايت مود المحسن مع دعم النظام');
    })();
