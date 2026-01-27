// 🔒 نظام الحماية المتقدم
(function() {
    'use strict';
    
    // تشفير إعدادات Firebase
    const encryptedConfig = 'QUl6YVN5Q0NiZ250bUQ0bmhZbVI0UkxTSkhJaGxpazVURzBIMGdzfGRhc2hib2FyZC1za2FuZHIuZmlyZWJhc2VhcHAuY29tfGRhc2hib2FyZC1za2FuZHJ8ZGFzaGJvYXJkLXNrYW5kci5maXJlYmFzZXN0b3JhZ2UuYXBwfDg3NTMwODI5MDM1M3wxOjg3NTMwODI5MDM1Mzp3ZWI6OTUyMjk2YTkzYmI0YjliN2Q1YTAxMHxHLVE2VERYWDJESE';
    
    // فك التشفير
    function decryptConfig(encrypted) {
        try {
            const decoded = atob(encrypted);
            const parts = decoded.split('|');
            return {
                apiKey: parts[0],
                authDomain: parts[1],
                projectId: parts[2],
                storageBucket: parts[3],
                messagingSenderId: parts[4],
                appId: parts[5],
                measurementId: parts[6]
            };
        } catch (e) {
            return null;
        }
    }
    
    // حماية من فتح Developer Tools
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    // فحص نوع الجهاز
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // تطبيق حماية أدوات المطور فقط على أجهزة الكمبيوتر
    if (!isMobileDevice()) {
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    // إخفاء المحتوى عند فتح F12
                    document.body.style.display = 'none';
                    // إعادة توجيه أو رسالة تحذير
                    setTimeout(() => {
                        alert('غير مسموح بفتح أدوات المطور');
                        window.location.href = 'about:blank';
                    }, 100);
                }
            } else {
                devtools.open = false;
                document.body.style.display = 'block';
            }
        }, 500);
    }
    
    // منع النقر بالزر الأيمن (فقط على أجهزة الكمبيوتر)
    document.addEventListener('contextmenu', function(e) {
        if (!isMobileDevice()) {
            e.preventDefault();
            return false;
        }
    });
    
    // منع اختصارات لوحة المفاتيح (فقط على أجهزة الكمبيوتر)
    document.addEventListener('keydown', function(e) {
        // تطبيق الحماية فقط على أجهزة الكمبيوتر
        if (!isMobileDevice()) {
            // منع F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            // منع Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            // منع Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
            // منع Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }
            // منع Ctrl+U
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
            // منع Ctrl+S
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }
        }
    });
    
    // حماية من النسخ (فقط على أجهزة الكمبيوتر)
    document.addEventListener('selectstart', function(e) {
        if (!isMobileDevice()) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('dragstart', function(e) {
        if (!isMobileDevice()) {
            e.preventDefault();
            return false;
        }
    });
    
    // تشويش الكونسول - معطل مؤقتاً للتشخيص
    // if (typeof console !== 'undefined') {
    //     console.log = function() {};
    //     console.warn = function() {};
    //     console.error = function() {};
    //     console.info = function() {};
    //     console.debug = function() {};
    //     console.clear = function() {};
    // }
    
    // إخفاء المصدر - معطل مؤقتاً للتشخيص
    // Object.defineProperty(window, 'console', {
    //     value: {},
    //     writable: false,
    //     configurable: false
    // });
    
    // تهيئة Firebase بشكل آمن
    window.initSecureFirebase = function() {
        const config = decryptConfig(encryptedConfig);
        if (config && typeof firebase !== 'undefined') {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }
                return firebase.firestore();
            } catch (error) {
                return null;
            }
        }
        return null;
    };
    
    // حماية إضافية - معطلة مؤقتاً للتشخيص
    // setInterval(function() {
    //     // فحص إذا كان هناك محاولة للوصول للكونسول
    //     if (window.console && typeof window.console.log === 'function') {
    //         window.location.href = 'about:blank';
    //     }
    // }, 1000);
    
    // منع الطباعة (فقط على أجهزة الكمبيوتر)
    window.addEventListener('beforeprint', function(e) {
        if (!isMobileDevice()) {
            e.preventDefault();
            return false;
        }
    });
    
    // حماية من التصوير (فقط على أجهزة الكمبيوتر)
    document.addEventListener('keyup', function(e) {
        if (!isMobileDevice() && e.key === 'PrintScreen') {
            alert('التصوير غير مسموح');
        }
    });
    
})();
