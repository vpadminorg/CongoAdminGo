(function() {
    // 确保HUGO_BASE_URL存在
    // terser .\vpadmin-menu-injector.js -o .\vpadmin\vpadmin-menu-injector.js --compress --mangle
    const baseURL = window.HUGO_BASE_URL || '/';
    // 国际化配置
    const I18N_CONFIG = {
        DEFAULT_LANGUAGE: 'en',
        LOCALSTORAGE_NAME: 'vpadmin_lang',
        SUPPORTED_LANGUAGES: ['en']
    };

// 当前语言和翻译缓存
    let currentLanguage = null;
    let translations = null;

    // 改进的 URL 构建函数
    function buildUrl(path) {
        // 移除 path 开头的斜杠（如果存在）
        const cleanPath = path.replace(/^\//, '');

        // 移除 baseURL 末尾的斜杠（如果存在）
        const cleanBaseUrl = baseURL.replace(/\/$/, '');

        if (cleanBaseUrl === '') {
            // 如果 baseURL 是根路径 '/'
            return `/${cleanPath}`;
        } else {
            // 对于其他情况，包括子目录（如 '/abc/'）
            return `${cleanBaseUrl}/${cleanPath}`;
        }
    }

    function vpadminSwitchLanguage(event, lang) {
        //event.preventDefault();
        localStorage.setItem('vpadmin_lang', lang);
        window.dispatchEvent(new CustomEvent('vpadmin-lang-change'));
        window.location.href = event.target.href;
    }

    // 将 switchLanguage 函数添加到全局作用域
    window.vpadminSwitchLanguage = vpadminSwitchLanguage;

// 获取当前语言
    function getCurrentLanguage() {
        if (currentLanguage) {
            return currentLanguage;
        }

        return getCurrentLanguageFromStorage();
    }

    function getCurrentLanguageFromStorage() {
        // 从 localStorage 获取语言设置
        const storedLang = localStorage.getItem(I18N_CONFIG.LOCALSTORAGE_NAME);

        // 如果存储的值存在且不为空
        if (storedLang && storedLang.trim() !== '') {
            // 提取主要语言代码（例如从 'en_US' 中提取 'en'）
            const mainLang = storedLang.split(/[_-]/)[0];
            return mainLang;
        }

        // 如果没有找到存储的语言或值为空，返回默认语言
        return I18N_CONFIG.DEFAULT_LANGUAGE;
    }


// 翻译函数
    function vpa_t(key, params = {}) {
        const lang = getCurrentLanguage();
        if (!translations || !translations[lang]) {
            return key;
        }

        const translation = translations[lang][key] || key;
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }

// 处理语言变化
    async function handleLanguageChange() {
        currentLanguage = getCurrentLanguageFromStorage();
        updateAllUITexts();
        console.log('handleLanguageChange');
    }

// 更新所有UI文本
    function updateAllUITexts() {
        // 更新所有需要翻译的元素
        // 模态框标题
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = vpa_t('loginTitle');
        }

        // 按钮文本
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            // 检查用户是否已登录
            const token = localStorage.getItem('accessToken');
            if (token) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const nickName = userInfo.user.nickName;
                loginButton.textContent = `${vpa_t('logout')} (${nickName})`;
            } else {
                loginButton.textContent = vpa_t('login');
            }
        }
        //userProfileButton
        const profileButton = document.getElementById('userProfileButton');
        if (profileButton) {
            profileButton.textContent = vpa_t('profile');
        }
        //userOrdersButton
        const userOrdersButton = document.getElementById('userOrdersButton');
        if (userOrdersButton) {
            userOrdersButton.textContent = vpa_t('orders');
        }
        // 其他UI元素的更新...
        // 这里需要更新所有用到翻译的UI元素
    }

// 监听语言变化事件
    window.addEventListener('vpadmin-lang-change', handleLanguageChange);

// 初始化翻译系统
    async function initializeI18n() {
        try {
            // 加载翻译文件
            // 使用baseURL构建完整的URL
            const translationsUrl = buildUrl('vpadmin/MenusTranslations.json');

            // 使用构建的URL进行fetch
            const response = await fetch(translationsUrl);
            if (!response.ok) {
                throw new Error('Failed to load translations');
            }
            translations = await response.json();
            I18N_CONFIG.DEFAULT_LANGUAGE = translations.default;
            // 设置当前语言
            currentLanguage = getCurrentLanguage();
            await handleLanguageChange();

            console.log('initializeI18n success');
        } catch (error) {
            console.error('initializeI18n failed', error);
            // 可以设置一些默认的翻译或错误处理
            translations = {};
        }
    }

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        #vpadminFloatingMenu {
            position: fixed !important;
            top: 20px !important;
            right: -25px !important;
            z-index: 9999 !important;
            transition: right 0.3s ease !important;
        }
        #vpadminFloatingMenu.vpadmin-active {
            right: 20px !important;
        }
        .vpadmin-floating-button {
            width: 50px !important;
            height: 50px !important;
            border-radius: 50% !important;
            background-color: rgba(52, 152, 219, 0.7) !important;
            color: white !important;
            border: none !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 24px !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
            z-index: 10000 !important;
            user-select: none !important;
            transition: background-color 0.3s ease !important;
        }
        .vpadmin-floating-button:hover {
            background-color: rgba(52, 152, 219, 1) !important;
        }
        #vpadminFloatingMenu.dragging .vpadmin-floating-button {
            background-color: rgba(231, 76, 60, 1) !important;
            cursor: move !important;
        }
        .vpadmin-drag-arrows {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            display: none !important;
            color: rgba(231, 76, 60, 1) !important;
            font-size: 20px !important;
            pointer-events: none !important;
            z-index: 10001 !important;
        }
        .vpadmin-drag-arrows.top {
            top: -25px !important;
        }
        .vpadmin-drag-arrows.bottom {
            bottom: -25px !important;
        }
        #vpadminFloatingMenu.dragging .vpadmin-drag-arrows {
            display: block !important;
        }
        .vpadmin-dropdown-menu {
            display: none;
            position: absolute !important;
            right: 0 !important;
            top: 60px !important;
            background-color: white !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            z-index: 9999 !important;
            width: 200px !important;
            padding: 5px 0 !important;
        }
        .vpadmin-dropdown-menu.show {
            display: block;
        }
        .vpadmin-dropdown-menu a {
            display: block !important;
            padding: 10px 20px !important;
            color: #333 !important;
            text-decoration: none !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        .vpadmin-dropdown-menu a:hover {
            background-color: #f1f1f1 !important;
        }
        @media (max-width: 768px) {
            #vpadminFloatingMenu {
                top: auto !important;
                bottom: 20px !important;
                right: -25px !important;
            }
            #vpadminFloatingMenu:hover {
                right: -25px !important;
            }
            #vpadminFloatingMenu.vpadmin-active {
                right: 20px !important;
            }
            .vpadmin-dropdown-menu {
                position: fixed !important;
                right: 20px !important;
                left: 20px !important;
                bottom: 80px !important;
                top: auto !important;
                width: auto !important;
                max-width: none !important;
                max-height: 50vh !important;
                overflow-y: auto !important;
            }
            .vpadmin-drag-arrows {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // 配置
    const VPADMIN_API_BASE_URL = 'http://localhost:8080'; // 替换为实际的API基础URL
    const VPADMIN_CLIENT_ID = '6abd11ec345d2ee75cfecda16224c8d2';
    const VPADMIN_GRANT_TYPE = 'vpadminPassword';
    const VPADMIN_TENANT_ID = '000001';
    const VPADMIN_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==';
    // 动态加载脚本
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 加载必要的库
    Promise.all([
        loadScript(buildUrl('vpadmin/crypto-js.min.js')),
        loadScript(buildUrl('vpadmin/jsencrypt.min.js'))
    ]).then(async () => {
        try {
            await initializeI18n(); // 等待国际化系统初始化完成
            initializeApp(window.CryptoJS, window.JSEncrypt); // 然后初始化应用
        } catch (error) {
            console.error('Init failed:', error);
        }
    }).catch(error => {
        console.error('Failed to load required libraries:', error);
    });


    function initializeApp(CryptoJS, JSEncrypt) {
        let isLoggedIn = false;
        let userNickname = '';
        let userImage = buildUrl('vpadmin/profile.svg');
        //let userImage = '/profile.svg';
        let forgotPasswordStep = 1;
        let forgotPasswordEmail = '';
        const socialIcons = {
            github: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
            gitlab: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.45.044 13.587a.924.924 0 0 0 .331 1.03L12 23.054l11.625-8.436a.92.92 0 0 0 .33-1.031"/></svg>`,
            google: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>`,
            facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
            wechat: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.074 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.81-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.372-8.595-6.372zM5.662 5.647a.956.956 0 1 1 0 1.912.956.956 0 0 1 0-1.912zm6.064 0a.956.956 0 1 1 0 1.912.956.956 0 0 1 0-1.912zM24 15.131c0-3.407-3.314-6.169-7.388-6.169-4.073 0-7.387 2.762-7.387 6.169s3.314 6.169 7.387 6.169c.87 0 1.705-.103 2.472-.29a.775.775 0 0 1 .653.06l1.715.99a.273.273 0 0 0 .139.04c.134 0 .243-.108.243-.243a.657.657 0 0 0-.042-.184l-.351-1.325a.49.49 0 0 1 .183-.572c1.558-1.139 2.375-2.758 2.375-4.644zm-9.749-1.969a.826.826 0 1 1 0 1.653.826.826 0 0 1 0-1.653zm5.246 0a.826.826 0 1 1 0 1.653.826.826 0 0 1 0-1.653z"/></svg>`
        };

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'vpadmin-overlay';
        overlay.innerHTML = `
            <div class="vpadmin-overlay-content">
                <div class="vpadmin-spinner"></div>
                <p id="vpadmin-overlay-message"></p>
            </div>
        `;
        document.body.appendChild(overlay);

        function generateRandomString() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < 32; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        function generateAesKey() {
            return CryptoJS.enc.Utf8.parse(generateRandomString());
        }

        function encryptBase64(str) {
            return CryptoJS.enc.Base64.stringify(str);
        }

        function encryptWithAes(message, aesKey) {
            const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        }

        function encrypt(txt) {
            const encryptor = new JSEncrypt();
            encryptor.setPublicKey(VPADMIN_RSA_PUBLIC_KEY);
            return encryptor.encrypt(txt);
        }

        // 创建一个用于API请求的函数
        function apiRequest(url, options = {}) {
            // 默认配置
            const baseOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'clientid': VPADMIN_CLIENT_ID,
                },
                mode: 'cors',
                credentials: 'include',
            };

            // 合并配置
            const finalOptions = {
                ...baseOptions,
                ...options,
                headers: {
                    ...baseOptions.headers,
                    ...options.headers
                }
            };

            // 处理 token
            const isToken = finalOptions.headers.isToken !== 'false';
            const token = localStorage.getItem('accessToken');
            if (isToken && token && url !== '/auth/register') {
                finalOptions.headers['Authorization'] = `Bearer ${token}`;
            }

            // 处理重复提交
            const isRepeatSubmit = finalOptions.headers.repeatSubmit === 'false';
            if (isRepeatSubmit && (finalOptions.method === 'POST' || finalOptions.method === 'PUT')) {
                const requestObj = {
                    url: url,
                    data: typeof finalOptions.body === 'object' ? JSON.stringify(finalOptions.body) : finalOptions.body,
                    time: new Date().getTime()
                };

                const sessionObj = sessionStorage.getItem('sessionObj')
                    ? JSON.parse(sessionStorage.getItem('sessionObj'))
                    : {};

                if (sessionObj.url === requestObj.url &&
                    sessionObj.data === requestObj.data &&
                    requestObj.time - sessionObj.time < 500) {
                    return Promise.reject(new Error(vpa_t('dataProcessingNoRepeat')));
                } else {
                    sessionStorage.setItem('sessionObj', JSON.stringify(requestObj));
                }
            }

            // 处理加密
            const isEncrypt = finalOptions.headers.isEncrypt === 'true';
            if (finalOptions.method !== 'GET' && finalOptions.body) {
                // 确保 body 是正确的 JSON 字符串
                if (typeof finalOptions.body === 'object') {
                    // 如果需要加密
                    if (isEncrypt) {
                        const aesKey = generateAesKey();
                        const encryptKey = encrypt(encryptBase64(aesKey));
                        finalOptions.headers['Encrypt-Key'] = encryptKey;
                        finalOptions.body = encryptWithAes(JSON.stringify(finalOptions.body), aesKey);
                    } else {
                        // 如果不需要加密，直接 stringify
                        finalOptions.body = JSON.stringify(finalOptions.body);
                    }
                }
            }

            // 处理 GET 请求参数
            if (finalOptions.method === 'GET' && options.params) {
                const searchParams = new URLSearchParams(options.params);
                url += (url.includes('?') ? '&' : '?') + searchParams.toString();
                delete finalOptions.params;
            }

            if (finalOptions.method === 'GET') {
                delete finalOptions.body;
            }

            // 发起请求
            return fetch(`${VPADMIN_API_BASE_URL}${url}`, finalOptions)
                .then(async response => {
                    const data = await response.json();

                    if (response.status === 401) {
                        // 处理未授权访问
                        console.error('Unauthorized access');
                        // 可以在这里处理登出逻辑
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userInfo');
                        // 可以触发重新登录
                        return Promise.reject(new Error('Unauthorized access'));
                    }

                    if (response.status === 403) {
                        console.error('Forbidden');
                        return Promise.reject(new Error('Forbidden'));
                    }

                    if (!response.ok) {
                        throw new Error(data.msg || 'Network response was not ok');
                    }

                    if(data.code === 401) {
                        //token无效了
                        isLoggedIn = false;
                        updateLoginButton();
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userInfo');
                        showLoginModal();
                        return Promise.reject(new Error(data.msg));
                    } else if (data.code !== 200) {
                        showToast(data.msg, 'error');
                        return Promise.reject(new Error(data.msg));
                    }

                    return data;
                })
                .catch(error => {
                    console.error('API Request Error:', error);
                    if (error.message !== vpa_t('dataProcessingNoRepeat')) {
                        showToast(error.message || 'Request failed', 'error');
                    }
                    return Promise.reject(error);
                });
        }

        // 创建浮动菜单
        const floatingMenu = document.createElement('div');
        floatingMenu.id = 'vpadminFloatingMenu';
        floatingMenu.innerHTML = `
            <button class="vpadmin-floating-button" id="vpadminMenuToggle" title="${vpa_t('toggleMenu')}">☰</button>
            <div class="vpadmin-drag-arrows top" title="${vpa_t('dragToMove')}">▲</div>
            <div class="vpadmin-drag-arrows bottom" title="${vpa_t('dragToMove')}">▼</div>
            <div class="vpadmin-dropdown-menu" id="vpadminDropdownMenu">
                <a href="#" id="userProfileButton" title="${vpa_t('viewProfile')}">${vpa_t('profile')}</a>
                <a href="#" id="userOrdersButton" title="${vpa_t('viewOrders')}">${vpa_t('orders')}</a>
                <a href="#" id="loginButton" title="${vpa_t('loginOrRegister')}">${vpa_t('login')}</a>
            </div>
        `;
        document.body.appendChild(floatingMenu);

        // 创建登录模态框
        const loginModal = document.createElement('div');
        loginModal.id = 'loginModal';
        loginModal.className = 'vpadmin-modal-overlay';
        loginModal.innerHTML = `
            <div class="vpadmin-modal-content">
                <span class="vpadmin-modal-close">&times;</span>
                <h2 id="modalTitle">${vpa_t('loginTitle')}</h2>
                <form id="loginForm" class="vpadmin-modal-form">
                    <input type="email" id="loginEmail" placeholder="${vpa_t('enterEmail')}" required autocomplete="username">
                    <div class="vpadmin-password-input-container">
                        <div class="vpadmin-password-input-wrapper">
                            <input type="password" id="password" placeholder="${vpa_t('enterPassword')}" required autocomplete="current-password">
                            <button type="button" class="vpadmin-toggle-password" data-target="password">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vpadmin-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    <div class="vpadmin-captcha-container">
                        <input type="text" id="captcha" placeholder="${vpa_t('enterCaptcha')}" required>
                        <img id="captchaImage" alt="${vpa_t('captchaImage')}">
                    </div>
                    <button type="submit" class="vpadmin-login-button">${vpa_t('loginButton')}</button>
                    <div class="vpadmin-form-links">
                        <a href="#" id="registerLink">${vpa_t('registerNow')}</a>
                        <a href="#" id="forgotPasswordLink">${vpa_t('forgotPassword')}</a>
                    </div>
                </form>
                <form id="registerForm" class="vpadmin-modal-form" style="display: none;">
                    <input type="email" id="registerEmail" placeholder="${vpa_t('enterEmail')}" required autocomplete="email">
                    <div class="vpadmin-password-input-container">
                        <div class="vpadmin-password-input-wrapper">
                            <input type="password" id="registerPassword" placeholder="${vpa_t('enterPassword')}" required autocomplete="new-password">
                            <button type="button" class="vpadmin-toggle-password" data-target="registerPassword">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vpadmin-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    <div class="vpadmin-password-input-container">
                        <div class="vpadmin-password-input-wrapper">
                            <input type="password" id="confirmPassword" placeholder="${vpa_t('confirmPassword')}" required autocomplete="new-password">
                            <button type="button" class="vpadmin-toggle-password" data-target="confirmPassword">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vpadmin-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>
                    <div class="vpadmin-captcha-container">
                        <input type="text" id="registerCaptcha" placeholder="${vpa_t('enterCaptcha')}" required>
                        <img id="registerCaptchaImage" alt="${vpa_t('captchaImage')}">
                    </div>
                    <button type="submit" class="vpadmin-login-button">${vpa_t('registerButton')}</button>
                    <div class="vpadmin-form-links">
                        <a href="#" id="backToLoginLink">${vpa_t('backToLogin')}</a>
                    </div>
                </form>
                <form id="forgotPasswordForm" class="vpadmin-modal-form" style="display: none;">
                    <div id="forgotStep1">
                        <input type="email" id="forgotEmail" placeholder="${vpa_t('enterEmail')}" required autocomplete="email">
                        <div class="vpadmin-captcha-container">
                            <input type="text" id="forgotCaptcha" placeholder="${vpa_t('enterCaptcha')}" required>
                            <img id="forgotCaptchaImage" alt="${vpa_t('captchaImage')}">
                        </div>
                        <button type="button" id="sendEmailCode" class="vpadmin-login-button">
                            <span class="button-text">${vpa_t('sendEmailCode')}</span>
                            <span class="button-loader">${vpa_t('sendingEmailCode')}</span>
                        </button>
                    </div>
                    <div id="forgotStep2" style="display: none;">
                        <input type="text" id="emailCode" placeholder="${vpa_t('emailCodeInputTitle')}" required>
                        <button type="button" id="verifyEmailCode" class="vpadmin-login-button">${vpa_t('verify')}</button>
                    </div>
                    <div id="forgotStep3" style="display: none;">
                        <div class="vpadmin-password-input-container">
                            <div class="vpadmin-password-input-wrapper">
                                <input type="password" id="forgotNewPassword" placeholder="${vpa_t('enterNewPassword')}" required autocomplete="new-password">
                                <button type="button" class="vpadmin-toggle-password" data-target="forgotNewPassword">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vpadmin-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                        </div>
                        <div class="vpadmin-password-input-container">
                            <div class="vpadmin-password-input-wrapper">
                                <input type="password" id="forgotConfirmNewPassword" placeholder="${vpa_t('confirmNewPassword')}" required autocomplete="new-password">
                                <button type="button" class="vpadmin-toggle-password" data-target="forgotConfirmNewPassword">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vpadmin-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="vpadmin-login-button">${vpa_t('resetPasswordButton')}</button>
                    </div>
                    <div class="vpadmin-form-links">
                        <a href="#" id="backToLoginFromForgotLink">${vpa_t('backToLogin')}</a>
                    </div>
                </form>
                <div class="vpadmin-third-party-login">
                    <p>${vpa_t('thirdPartyLogin')}</p>
                    <div class="vpadmin-social-icons">
                        ${Object.entries(socialIcons).map(([platform, icon]) => `
                            <button id="${platform}Login" class="vpadmin-social-button ${platform}">${icon}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loginModal);

        // 创建 toast 元素
        const toastElement = document.createElement('div');
        toastElement.id = 'vpadmin-toast';
        toastElement.className = 'vpadmin-toast';
        document.body.appendChild(toastElement);

        // 添加 toast 样式
        const toastStyle = document.createElement('style');
        toastStyle.textContent = `
            .vpadmin-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                max-width: 300px;
                width: auto;
                background-color: #333;
                color: #fff;
                padding: 10px 20px;
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                z-index: 10001;
                text-align: center;
            }
            .vpadmin-toast.show {
                opacity: 1;
            }
            .vpadmin-toast.success {
                background-color: #4CAF50;
            }
            .vpadmin-toast.error {
                background-color: #F44336;
            }
/*            @media (max-width: 480px) {
                .vpadmin-toast {
                    max-width: 90%;
                    width: 90%;
                }
            }*/
        `;
        document.head.appendChild(toastStyle);

        // 添加新的样式
        const newStyle = document.createElement('style');
        newStyle.textContent = `
            .vpadmin-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10000;
            }
            .vpadmin-modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                width: 30%;
                max-width: 500px;
                min-width: 280px;
                box-sizing: border-box;
                color-scheme: light;
                color: #1d2d35;
            }
            .vpadmin-modal-content * {
                background-color: transparent;
                color: inherit;
            }
            @media (max-width: 600px) {
                .vpadmin-modal-content {
                    padding: 15px;
                }
            }
            
            @media (min-width: 1200px) {
                .vpadmin-modal-content {
                    max-width: 700px;
                }
            }
            .vpadmin-modal-close {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 20px;
                cursor: pointer;
            }
            .vpadmin-modal-form input {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            .vpadmin-login-button {
                width: 100%;
                padding: 10px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .vpadmin-login-button:hover {
                background-color: #2980b9;
            }
            .vpadmin-captcha-container {
                display: flex;
                align-items: center;
                margin: 10px 0;
            }
            .vpadmin-captcha-container input {
                flex: 1;
                margin: 0 10px 0 0;
            }
            .vpadmin-captcha-container img {
                height: 38px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                padding: 0;
            }
            .vpadmin-third-party-login {
                margin-top: 20px;
                text-align: center;
            }
            .vpadmin-social-icons {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 10px;
            }
            .vpadmin-social-button {
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: opacity 0.3s;
                padding: 0;
            }
            .vpadmin-social-button:hover {
                opacity: 0.8;
            }
            .vpadmin-social-button svg {
                width: 20px;
                height: 20px;
            }
            .vpadmin-social-button.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background-color: white !important;
            }

            .vpadmin-social-button.disabled svg {
                fill: #999;
            }
            .vpadmin-social-button.github { background-color: #24292e; }
            .vpadmin-social-button.gitlab { background-color: #FC6D26; }
            .vpadmin-social-button.google { background-color: #DB4437; }
            .vpadmin-social-button.facebook { background-color: #4267B2; }
            .vpadmin-social-button.wechat { background-color: #7BB32E; }
            .vpadmin-social-button svg { fill: white; }
            .vpadmin-tabs {
                display: flex;
                margin-bottom: 20px;
            }
            .vpadmin-tab {
                flex: 1;
                padding: 10px;
                background-color: #f1f1f1;
                border: none;
                cursor: pointer;
            }
            .vpadmin-tab.active {
                background-color: #3498db;
                color: white;
            }
            .vpadmin-form-links {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
            }
            .vpadmin-form-links a {
                color: #3498db;
                text-decoration: none;
            }
            .vpadmin-form-links a:hover {
                text-decoration: underline;
            }
            .vpadmin-error-message {
                color: #F44336;
                font-size: 12px;
                margin-top: 5px;
            }
            .vpadmin-login-button:disabled {
                background-color: #cccccc;
                cursor: not-allowed;
            }
            .vpadmin-login-button .button-loader {
                display: none;
            }
            .vpadmin-login-button.loading .button-text {
                display: none;
            }
            .vpadmin-login-button.loading .button-loader {
                display: inline;
            }
            .vpadmin-password-input-container {
                position: relative;
                display: flex;
                flex-direction: column;
                margin-bottom: 15px;
            }
            .vpadmin-password-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            .vpadmin-password-input-container input {
                flex: 1;
                width: 100%;
            }
            .vpadmin-toggle-password {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                height: 100%;
                display: flex;
                align-items: center;
            }
            .vpadmin-eye-icon {
                width: 20px;
                height: 20px;
                color: #666;
            }
            .vpadmin-error-message {
                color: #F44336;
                font-size: 12px;
                margin-top: 5px;
                order: 2;
            }
        `;
        document.head.appendChild(newStyle);

        const overlayStyle = document.createElement('style');
        overlayStyle.textContent = `
            #vpadmin-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                justify-content: center;
                align-items: center;
            }
            .vpadmin-overlay-content {
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
            }
            .vpadmin-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: vpadmin-spin 1s linear infinite;
                margin: 0 auto 10px;
            }
            @keyframes vpadmin-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(overlayStyle);


        // 初始化功能
        const menuToggle = document.getElementById('vpadminMenuToggle');
        const dropdownMenu = document.getElementById('vpadminDropdownMenu');
        const loginButton = document.getElementById('loginButton');
        const modal = document.getElementById('loginModal');
        const modalClose = loginModal.querySelector('.vpadmin-modal-close');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        let isMenuVisible = false;
        let isDragging = false;
        let startY, startTop;
        const isMobile = window.innerWidth <= 768;

        function toggleMenu(event) {
            event.stopPropagation();
            isMenuVisible = !isMenuVisible;
            floatingMenu.classList.toggle('vpadmin-active', isMenuVisible);
            dropdownMenu.classList.toggle('show', isMenuVisible);
        }

        function closeMenu() {
            isMenuVisible = false;
            floatingMenu.classList.remove('vpadmin-active');
            dropdownMenu.classList.remove('show');
        }

        function startDragging(event) {
            if (!isMobile && floatingMenu.getBoundingClientRect().right <= window.innerWidth) {
                isDragging = true;
                startY = event.clientY;
                startTop = floatingMenu.getBoundingClientRect().top;
                floatingMenu.classList.add('dragging');
                event.preventDefault();
            }
        }

        function drag(event) {
            if (isDragging) {
                let newTop = startTop + (event.clientY - startY);
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - menuToggle.offsetHeight));
                floatingMenu.style.setProperty('top', `${newTop}px`, 'important');
                floatingMenu.style.setProperty('bottom', 'auto', 'important');
            }
        }

        function stopDragging() {
            if (isDragging) {
                isDragging = false;
                floatingMenu.classList.remove('dragging');
            }
        }

        function togglePasswordVisibility(event) {
            const button = event.currentTarget;
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // 切换眼睛图标
            const eyeIcon = button.querySelector('.vpadmin-eye-icon');
            if (type === 'password') {
                eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            } else {
                eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            }
        }

        // 为所有切换密码可见性的按钮添加事件监听器
        document.querySelectorAll('.vpadmin-toggle-password').forEach(button => {
            button.addEventListener('click', togglePasswordVisibility);
        });

        menuToggle.addEventListener('click', function (event) {
            if (!isDragging) {
                toggleMenu(event);
            }
        });

        document.addEventListener('click', function (event) {
            if (isMenuVisible && !floatingMenu.contains(event.target)) {
                closeMenu();
            }
            return true;
        });

        dropdownMenu.addEventListener('click', function (event) {
            closeMenu();
            event.preventDefault();
        });

        if (!isMobile) {
            menuToggle.addEventListener('mousedown', startDragging);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDragging);

            floatingMenu.addEventListener('mouseenter', function () {
                if (!isDragging) {
                    floatingMenu.classList.add('vpadmin-active');
                }
            });

            floatingMenu.addEventListener('mouseleave', function () {
                if (!isMenuVisible && !isDragging) {
                    floatingMenu.classList.remove('vpadmin-active');
                }
            });
        }

        function initializeRegisterFormValidation() {
            const loginEmail = document.getElementById('loginEmail');
            const registerEmail = document.getElementById('registerEmail');
            const registerPassword = document.getElementById('registerPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            const forgotEmail = document.getElementById('forgotEmail');
            const forgotNewPassword = document.getElementById('forgotNewPassword');
            const forgotConfirmNewPassword = document.getElementById('forgotConfirmNewPassword');
            const registerCaptcha = document.getElementById('registerCaptchaImage');
            const forgotCaptcha = document.getElementById('forgotCaptchaImage');
            const loginCaptcha = document.getElementById('captchaImage');
            registerCaptcha.addEventListener('click', () => loadCaptcha('registerCaptchaImage'));
            forgotCaptcha.addEventListener('click', () => loadCaptcha('forgotCaptchaImage'));
            loginCaptcha.addEventListener('click', () => loadCaptcha('captchaImage'));

            loginEmail.addEventListener('blur', () => validateField('loginEmail', validateEmail));
            registerEmail.addEventListener('blur', () => validateField('registerEmail', validateEmail));
            registerPassword.addEventListener('blur', () => validateField('registerPassword', validatePassword));
            confirmPassword.addEventListener('blur', () => validateField('confirmPassword', validateConfirmPassword));
            forgotEmail.addEventListener('blur', () => validateField('forgotEmail', validateEmail));
            forgotNewPassword.addEventListener('blur', () => validateField('forgotNewPassword', validatePassword));
            forgotConfirmNewPassword.addEventListener('blur', () => validateField('forgotConfirmNewPassword', validateForgotConfirmPassword));

        }

        function validateField(fieldId, validationFunction) {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();
            clearError(fieldId);

            const error = validationFunction(value);
            if (error) {
                showError(fieldId, error);
                return false;
            }
            return true;
        }

        function clearError(elementId) {
            const element = document.getElementById(elementId);
            if(elementId === 'registerEmail' || elementId === 'forgotEmail' || elementId === 'loginEmail'){
                const errorElement = document.querySelector(`#${elementId} + .vpadmin-error-message`);
                if (errorElement) {
                    errorElement.remove();
                }
            } else {
                const container = element.closest('.vpadmin-password-input-container') || element.parentNode;
                const errorElement = container.querySelector('.vpadmin-error-message');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        }

        function showError(elementId, message) {
            clearError(elementId);
            const element = document.getElementById(elementId);
            const errorElement = document.createElement('div');
            errorElement.className = 'vpadmin-error-message';
            errorElement.textContent = message;
            if(elementId === 'registerEmail' || elementId === 'forgotEmail' || elementId === 'loginEmail'){
                element.parentNode.insertBefore(errorElement, element.nextSibling);
            } else {
                const container = element.closest('.vpadmin-password-input-container') || element.parentNode;
                container.appendChild(errorElement);
            }
        }

        function showLoginModal() {
            modal.style.display = 'block';
            showForm('loginForm');
            loadCaptcha('captchaImage');
            thirdPartyLoginConfig();
            initializeRegisterFormValidation();
        }

        modalClose.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                //modal.style.display = 'none';
            }
        });

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const isEmailValid = validateField('registerEmail', validateEmail);
            const isPasswordValid = validateField('registerPassword', validatePassword);
            const isConfirmPasswordValid = validateField('confirmPassword', validateConfirmPassword);

            if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
                return; // 如果有任何字段无效，停止提交
            }

            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const captcha = document.getElementById('registerCaptcha').value;
            const captchaUuid = document.getElementById('registerCaptchaImage').dataset.uuid;

            try {
                const response = await apiRequest('/auth/register', {
                    method: 'POST',
                    headers: {
                        isToken: 'false',
                        isEncrypt: 'true',
                        repeatSubmit: 'false'
                    },
                    body: {
                        tenantId: VPADMIN_TENANT_ID,
                        username: email,
                        password: password,
                        confirmPassword: password,
                        clientId: VPADMIN_CLIENT_ID,
                        grantType: VPADMIN_GRANT_TYPE,
                        userType: 'portal_user',
                        code: captcha,
                        uuid: captchaUuid
                    }
                });

                if (response.code === 200) {
                    showToast(vpa_t('registerSuccess'), 'success');
                    showForm('loginForm'); // 切换到登录表单
                    loadCaptcha('captchaImage');
                } else {
                    throw new Error(response.msg || vpa_t('registerFailed'));
                }
            } catch (error) {
                showToast(vpa_t('registerFailed') + ': ' + error.message, 'error');
                loadCaptcha('registerCaptchaImage');
            }
        });

        function showForm(formId) {
            const forms = ['loginForm', 'registerForm', 'forgotPasswordForm'];
            forms.forEach(id => {
                const form = document.getElementById(id);
                if (form) {
                    form.style.display = id === formId ? 'block' : 'none';
                }
            });

            const modalTitle = document.getElementById('modalTitle');
            switch (formId) {
                case 'loginForm':
                    modalTitle.textContent = vpa_t('loginTitle');
                    loadCaptcha('captchaImage');
                    break;
                case 'registerForm':
                    modalTitle.textContent = vpa_t('registerTitle');
                    loadCaptcha('registerCaptchaImage');
                    break;
                case 'forgotPasswordForm':
                    modalTitle.textContent = vpa_t('passwordRecovery');
                    showForgotPasswordStep(1);
                    loadCaptcha('forgotCaptchaImage');
                    break;
            }

            // 清除所有表单的错误信息
            clearAllErrors();

            // 重置找回密码表单的状态
            if (formId !== 'forgotPasswordForm') {
                forgotPasswordStep = 1;
                forgotPasswordEmail = '';
            }

            // 更新社交登录按钮的可见性
            const socialLoginContainer = document.querySelector('.vpadmin-third-party-login');
            if (socialLoginContainer) {
                socialLoginContainer.style.display = formId === 'loginForm' ? 'block' : 'none';
            }
        }

        function clearAllErrors() {
            const errorMessages = document.querySelectorAll('.vpadmin-error-message');
            errorMessages.forEach(error => error.remove());
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email) ? null : vpa_t('invalidEmail');
        }

        function validatePassword(password) {
            const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            return re.test(password) ? null : vpa_t('invalidPassword');
        }

        function validateConfirmPassword(confirmPassword) {
            const password = document.getElementById('registerPassword').value;
            return password === confirmPassword ? null : vpa_t('passwordMismatch');
        }

        function validateForgotConfirmPassword(confirmPassword) {
            const password = document.getElementById('forgotNewPassword').value;
            return password === confirmPassword ? null : vpa_t('passwordMismatch');
        }

        function showForgotPasswordStep(step) {
            document.getElementById('forgotStep1').style.display = step === 1 ? 'block' : 'none';
            document.getElementById('forgotStep2').style.display = step === 2 ? 'block' : 'none';
            document.getElementById('forgotStep3').style.display = step === 3 ? 'block' : 'none';
            forgotPasswordStep = step;
        }

        document.getElementById('sendEmailCode').addEventListener('click', async function() {
            const sendButton = this;
            const buttonText = sendButton.querySelector('.button-text');
            const buttonLoader = sendButton.querySelector('.button-loader');
            const email = document.getElementById('forgotEmail').value;
            const captcha = document.getElementById('forgotCaptcha').value;
            const captchaUuid = document.getElementById('forgotCaptchaImage').dataset.uuid;

            const isEmailValid = validateField('forgotEmail', validateEmail);

            if (!isEmailValid) {
                return; // 如果有任何字段无效，停止提交
            }

            // 禁用按钮并显示加载状态
            sendButton.disabled = true;
            sendButton.classList.add('loading');

            try {
                const response = await apiRequest('/resource/email/code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        isToken: 'false'
                    },
                    body: JSON.stringify({
                        email: email,
                        tenantId: VPADMIN_TENANT_ID,
                        code: captcha,
                        uuid: captchaUuid,
                        clientId: VPADMIN_CLIENT_ID
                    })
                });

                if (response.code === 200) {
                    showToast(vpa_t('emailCodeSent'), 'success');
                    forgotPasswordEmail = email;
                    showForgotPasswordStep(2);

                    // 添加倒计时功能
                    let countdown = 60;
                    const countdownInterval = setInterval(() => {
                        if (countdown > 0) {
                            buttonText.textContent = `${vpa_t('resending')} (${countdown}s)`;
                            countdown--;
                        } else {
                            clearInterval(countdownInterval);
                            buttonText.textContent = vpa_t('sendEmailCode');
                            sendButton.disabled = false;
                        }
                    }, 1000);
                } else {
                    throw new Error(response.msg || vpa_t('sendEmailCodeFailed'));
                }
            } catch (error) {
                showToast(vpa_t('sendEmailCodeFailed'), 'error');
                loadCaptcha('forgotCaptchaImage');
            } finally {
                // 无论成功或失败，都移除加载状态
                sendButton.classList.remove('loading');
            }
        });

        document.getElementById('verifyEmailCode').addEventListener('click', async function() {
            const emailCode = document.getElementById('emailCode').value;

            try {
                const response = await apiRequest('/auth/verify/emailCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        isToken: 'false'
                    },
                    body: JSON.stringify({
                        email: forgotPasswordEmail,
                        code: emailCode,
                        tenantId: VPADMIN_TENANT_ID,
                        clientId: VPADMIN_CLIENT_ID
                    })
                });

                if (response.code === 200) {
                    // 保存验证码，以便在第三步使用
                    document.getElementById('emailCode').dataset.verifiedCode = emailCode;
                    showForgotPasswordStep(3);
                } else {
                    throw new Error(response.msg || vpa_t('verifyCodeFailed'));
                }
            } catch (error) {
                showToast(vpa_t('verifyCodeFailed'), 'error');
            }
        });

        document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            // 只有在第三步（重置密码）时才处理表单提交
            if (forgotPasswordStep !== 3) {
                return;
            }
            const newPassword = document.getElementById('forgotNewPassword').value;
            const emailCode = document.getElementById('emailCode').value; // 获取第二步输入的邮箱验证码


            const isPasswordValid = validateField('forgotNewPassword', validatePassword);
            const isConfirmPasswordValid = validateField('forgotConfirmNewPassword', validateForgotConfirmPassword);

            if (!isPasswordValid || !isConfirmPasswordValid) {
                return; // 如果有任何字段无效，停止提交
            }

            try {
                const response = await apiRequest('/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        isToken: 'false'
                    },
                    body: JSON.stringify({
                        email: forgotPasswordEmail,
                        newPassword: newPassword,
                        code: emailCode, // 将邮箱验证码传递给后台
                        clientId: VPADMIN_CLIENT_ID,
                        tenantId: VPADMIN_TENANT_ID
                    })
                });

                if (response.code === 200) {
                    showToast(vpa_t('passwordResetSuccess'), 'success');
                    showForm('loginForm');
                } else {
                    throw new Error(response.msg || vpa_t('resetPasswordFailed'));
                }
            } catch (error) {
                showToast(vpa_t('resetPasswordFailed'), 'error');
            }
        });

        // 加载验证码
        function loadCaptcha(captchaImageId) {
            const captchaImage = document.getElementById(captchaImageId);
            apiRequest('/auth/code', {
                method: 'GET',
                headers: {
                    isToken: 'false'
                }
            })
            .then(data => {
                if (data.code === 200 && data.data.captchaEnabled) {
                    captchaImage.src = `data:image/png;base64,${data.data.img}`;
                    captchaImage.dataset.uuid = data.data.uuid;
                } else {
                    console.error('Failed to get captcha');
                    captchaImage.alt = vpa_t('captchaLoadError');
                }
            })
            .catch(error => {
                console.error('Error fetching captcha:', error);
                captchaImage.alt = vpa_t('captchaLoadError');
            });
        }

        // 加载已经配置的三方登录
        function thirdPartyLoginConfig() {
            apiRequest('/vpadmin/thirdPartyLoginConfig/oauth', {
                method: 'GET',
                headers: {
                    isToken: 'false'
                },
                params: {
                    tenant: VPADMIN_TENANT_ID,
                    clientId: VPADMIN_CLIENT_ID
                }
            })
                .then(data => {
                    if (data.code === 200) {
                        const config = data.data;
                        // 创建一个 Set 来存储配置中的平台，便于快速查找
                        const enabledPlatforms = new Set(config.map(item => item.platform));

                        // 获取所有的社交按钮
                        const socialButtons = document.querySelectorAll('.vpadmin-social-button');

                        // 遍历每个按钮并更新其状态
                        socialButtons.forEach(button => {
                            const platform = button.id.replace('Login', '');

                            if (enabledPlatforms.has(platform)) {
                                button.disabled = false;
                                button.classList.remove('disabled');
                                const configItem = config.find(item => item.platform === platform);
                                button.setAttribute('data-status', configItem.status);
                            } else {
                                button.disabled = true;
                                button.classList.add('disabled');
                                button.removeAttribute('data-status');
                            }
                        });
                    } else {
                        console.error('Get ThirdPartyLoginConfig failed:', data.msg);
                        alert(vpa_t('socialLoginFailed') + ': ' + data.msg);
                    }
                })
                .catch(error => {
                    console.error('Error during Get ThirdPartyLoginConfig:', error);
                    alert(vpa_t('socialLoginErrorRetry'));
                });
        }

        // 处理登录
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('password').value;
            const captcha = document.getElementById('captcha').value;
            const captchaUuid = document.getElementById('captchaImage').dataset.uuid;

            try {
                const response = await apiRequest('/auth/login', {
                    method: 'POST',
                    headers: {
                        isToken: 'false',
                        isEncrypt: 'true',
                        repeatSubmit: 'false'
                    },
                    body: {
                        clientId: VPADMIN_CLIENT_ID,
                        grantType: VPADMIN_GRANT_TYPE,
                        tenantId: VPADMIN_TENANT_ID,
                        username: email,
                        password: password,
                        code: captcha,
                        uuid: captchaUuid
                    }
                });

                const data = await response;

                if (response.code === 200) {
                    await handleLoginSuccess(response.data);
                } else {
                    throw new Error(response.msg || 'Login failed');
                }
            } catch (error) {
                console.error('LoginFailed:', error);
                showToast(vpa_t('loginFailed') + error.message, 'error');
                loadCaptcha('captchaImage');
            }
        });
        // 添加社交登录功能
        function handleSocialLogin(platform) {
            apiRequest(`/auth/binding/${platform}`, {
                method: 'GET',
                params: {
                    tenantId: VPADMIN_TENANT_ID,
                    clientId: VPADMIN_CLIENT_ID,
                    domain: window.location.origin,
                    redirect: window.location.href
                }
            })
                .then(data => {
                    if (data.code === 200) {
                        window.location.href = data.data;
                    } else {
                        console.error('Social login failed:', data.msg);
                        alert(vpa_t('socialLoginFailed') + ': ' + data.msg);
                    }
                })
                .catch(error => {
                    console.error('Error during social login:', error);
                    alert(vpa_t('socialLoginErrorRetry'));
                });
        }

        Object.keys(socialIcons).forEach(platform => {
            document.getElementById(`${platform}Login`).addEventListener('click', () => handleSocialLogin(platform));
        });

        // 处理社交登录回调
        function handleSocialLoginCallback() {
            // const upgradeButton = createUpgradeButton({
            //     paymentPlatform: 'ko-fi',
            //     paymentType: 'iframe',
            //     buttonText: 'Upgrade to Pro',
            //     iframeUrl: 'https://ko-fi.com/fiwalld/?hidefeed=true&widget=true&embed=true&preview=true',
            //     paymentName: 'Pro Subscription',
            //     size: 'small',
            //     container: document.querySelector('#using-vue-in-markdown')
            // });


            if (!window.location.pathname.endsWith('/social-callback')) {
                return;
            }

            const overlay = document.getElementById('vpadmin-overlay');
            const overlayMessage = document.getElementById('vpadmin-overlay-message');

            function showOverlay(message) {
                overlayMessage.textContent = message;
                overlay.style.display = 'flex';
            }

            function hideOverlay() {
                overlay.style.display = 'none';
            }

            showOverlay(vpa_t('processingCallback'));

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const source = urlParams.get('source');

            if (code && state && source) {
                const stateJson = JSON.parse(atob(state));
                const domain = stateJson.domain;
                const redirect = stateJson.redirect;

                if (domain !== window.location.origin) {
                    let urlFull = new URL(window.location.href);
                    urlFull.host = domain;
                    window.location.href = urlFull.toString();
                    return;
                }

                apiRequest('/auth/portal/social/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        isToken: 'false'
                    },
                    body: JSON.stringify({
                        socialCode: code,
                        socialState: state,
                        tenantId: VPADMIN_TENANT_ID,
                        source: source,
                        clientId: VPADMIN_CLIENT_ID,
                        grantType: 'socialPortal'
                    })
                })
                    .then(data => {
                        if (data.code === 200) {
                            console.log('Social login successful');
                            localStorage.setItem('accessToken', data.data.access_token);
                            localStorage.setItem('refreshToken', data.data.refresh_token);
                            showOverlay(vpa_t('loginSuccess'));
                            setTimeout(() => {
                                hideOverlay();
                                window.location.href = data.data.redirect || redirect || '/';
                            }, 2000);
                        } else {
                            throw new Error(data.msg || 'Login failed');
                        }
                    })
                    .catch(error => {
                        console.error('Error during social login callback:', error);
                        showOverlay(vpa_t('loginFailed'));
                        setTimeout(() => {
                            hideOverlay();
                            window.location.href = redirect || '/';
                        }, 2000);
                    });
            } else {
                console.error('Invalid callback parameters');
                showOverlay(vpa_t('invalidCallbackParameters'));
                setTimeout(() => {
                    hideOverlay();
                    window.location.href = '/';
                }, 2000);
            }
        }
        async function handleLoginSuccess(data) {
            isLoggedIn = true;
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            modal.style.display = 'none';
            userImage = buildUrl('vpadmin/profile_blue.svg');
            await getUserInfo();
            updateLoginButton();
            showToast(vpa_t('loginSuccess'), 'success');
        }
        async function getUserInfo() {
            try {
                const response = await apiRequest('/system/user/getInfo', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (response.code === 200) {
                    userNickname = response.data.user.nickName;
                    localStorage.setItem('userInfo', JSON.stringify(response.data));
                } else {
                    throw new Error(response.msg || 'Failed to get user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                logout();
            }
        }
        async function logout() {
            try {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
                showToast(vpa_t('logoutFailed'), 'error');
            } finally {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userInfo');
                isLoggedIn = false;
                userNickname = '';
                userImage = buildUrl('vpadmin/profile.svg');
                updateLoginButton();
                showToast(vpa_t('logoutSuccess'), 'success');
            }
        }
        function updateLoginButton() {
            //const loginButton = document.getElementById('loginButton');
            if (isLoggedIn) {
                loginButton.textContent = `${vpa_t('logout')} (${userNickname})`;
                loginButton.onclick = logout;
            } else {
                loginButton.textContent = vpa_t('login');
                loginButton.onclick = showLoginModal;
            }

            // 更新用户头像
            const userMenuImage = document.querySelector('.user-menu img');
            if (userMenuImage) {
                userMenuImage.src = userImage;
            }
        }

        function showToast(message, type = 'info', duration = 3000) {
            const toast = document.getElementById('vpadmin-toast');
            toast.textContent = message;
            toast.className = `vpadmin-toast show ${type}`;

            setTimeout(() => {
                toast.className = 'vpadmin-toast';
            }, duration);
        }

        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            showForm('registerForm');
        });

        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            showForm('forgotPasswordForm');
        });

        document.getElementById('backToLoginLink').addEventListener('click', (e) => {
            e.preventDefault();
            showForm('loginForm');
        });

        document.getElementById('backToLoginFromForgotLink').addEventListener('click', (e) => {
            e.preventDefault();
            showForm('loginForm');
        });

        // 添加 Profile 点击事件处理
        document.getElementById('userProfileButton').addEventListener('click', async function(e) {
            e.preventDefault();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                showToast(vpa_t('pleaseLogin'), 'error');
                return;
            }

            try {
                const response = await apiRequest('/system/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.code === 200) {
                    showProfileDialog(response.data);
                } else {
                    throw new Error(response.msg || 'Failed to get profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                showToast(vpa_t('failedToFetchProfile'), 'error');
            }
        });

        function showProfileDialog(profileData) {
            const dialog = document.createElement('div');
            dialog.className = 'vpadmin-modal-overlay';
            dialog.style.display = 'block'; // 确保显示
            dialog.innerHTML = `
                <div class="vpadmin-profile-dialog">
                    <div class="vpadmin-profile-dialog-content">
                        <div class="vpadmin-profile-dialog-header">
                            <h3>${vpa_t('personalInformation')}</h3>
                            <button class="vpadmin-profile-dialog-close">&times;</button>
                        </div>
                        <div class="vpadmin-profile-dialog-body">
                            <div class="vpadmin-profile-container">
                                <div class="vpadmin-profile-header">
                                    <img src="${userImage}" alt="User Avatar" class="vpadmin-profile-avatar"/>
                                </div>
                                <div class="vpadmin-profile-items">
                                    <div class="vpadmin-profile-item">
                                        <span class="vpadmin-icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </span>
                                        <span class="vpadmin-profile-label">${vpa_t('username')}</span>
                                        <span class="vpadmin-profile-value">${profileData.user.userName}</span>
                                    </div>
                                    <div class="vpadmin-profile-item">
                                        <span class="vpadmin-icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                        </span>
                                        <span class="vpadmin-profile-label">${vpa_t('email')}</span>
                                        <span class="vpadmin-profile-value">${profileData.user.email}</span>
                                    </div>
                                    <div class="vpadmin-profile-item">
                                        <span class="vpadmin-icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </span>
                                        <span class="vpadmin-profile-label">${vpa_t('userRoles')}</span>
                                        <span class="vpadmin-profile-value">${profileData.roleGroup}</span>
                                    </div>
                                    <div class="vpadmin-profile-item">
                                        <span class="vpadmin-icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                        </span>
                                        <span class="vpadmin-profile-label">${vpa_t('creationTime')}</span>
                                        <span class="vpadmin-profile-value">${profileData.user.createTime}</span>
                                    </div>
                                    <div class="vpadmin-profile-item">
                                        <span class="vpadmin-icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                        </span>
                                        <span class="vpadmin-profile-label">${vpa_t('lastLogin')}</span>
                                        <span class="vpadmin-profile-value">${profileData.user.loginDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 创建完全独立的样式
            const style = document.createElement('style');
            style.textContent = `
                .vpadmin-profile-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 10001;
                }
        
                .vpadmin-profile-dialog-content {
                    position: relative;
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                }
        
                .vpadmin-profile-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #eee;
                }
        
                .vpadmin-profile-dialog-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #333;
                }
        
                .vpadmin-profile-dialog-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
                    cursor: pointer;
                    padding: 0 8px;
                    transition: color 0.3s;
                }
        
                .vpadmin-profile-dialog-close:hover {
                    color: #ff4757;
                }
        
                .vpadmin-profile-dialog-body {
                    padding: 20px;
                }
        
                .vpadmin-profile-container {
                    padding: 20px;
                }
        
                .vpadmin-profile-header {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 24px;
                }
        
                .vpadmin-profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 40px;
                    background-color: #ecf5ff;
                    padding: 8px;
                    transition: transform 0.3s ease;
                }
        
                .vpadmin-profile-avatar:hover {
                    transform: scale(1.05);
                }
        
                .vpadmin-profile-items {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
        
                .vpadmin-profile-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 6px;
                    background-color: #ecf5ff;
                    transition: background-color 0.3s ease;
                }
        
                .vpadmin-profile-item:hover {
                    background-color: #e6f0fd;
                }
        
                .vpadmin-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    margin-right: 12px;
                    color: #409eff;
                }
        
                .vpadmin-profile-label {
                    font-weight: 500;
                    color: #606266;
                    width: 120px;
                    flex-shrink: 0;
                    margin-right: 12px;
                }
        
                .vpadmin-profile-value {
                    color: #303133;
                    word-break: break-all;
                    flex: 1;
                }
        
                @media (max-width: 480px) {
                    .vpadmin-profile-dialog {
                        width: 95%;
                        margin: 10px;
                    }
                    
                    .vpadmin-profile-container {
                        padding: 15px;
                    }
                    
                    .vpadmin-profile-dialog-body {
                        padding: 15px;
                    }
                    
                    .vpadmin-profile-label {
                        width: 80px;
                    }
                }
            `;
            document.head.appendChild(style);

            // 添加关闭功能
            const closeButton = dialog.querySelector('.vpadmin-profile-dialog-close');
            closeButton.addEventListener('click', () => {
                document.body.removeChild(dialog);
            });

            // 添加点击遮罩关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    //document.body.removeChild(dialog);
                }
            });

            document.body.appendChild(dialog);
        }

        function createUpgradeButton(config) {
            // 默认配置
            const defaultConfig = {
                paymentPlatform: '',
                paymentType: 'donation', // 'donation' or shop
                buttonText: 'Upgrade to Pro',
                iframeUrl: '',
                paymentName: '',
                needLogin: 'true',
                size: 'default', // 'small' or 'default'
                container: document.body // 默认添加到 body
            };

            const finalConfig = { ...defaultConfig, ...config };

            // 创建按钮
            const button = document.createElement('button');
            button.className = finalConfig.size === 'small' ? 'vpadmin-pro-button-small' : 'vpadmin-pro-button';
            button.innerHTML = `<span class="${finalConfig.size === 'small' ? 'vpadmin-pro-text-small' : 'vpadmin-pro-text'}">${finalConfig.buttonText}</span>`;

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.className = 'vpadmin-pro-dialog';
            dialog.style.display = 'none';
            dialog.innerHTML = `
                <div class="vpadmin-pro-dialog-content">
                    <div class="vpadmin-pro-dialog-header">
                        <h3  id="proDialogTitle">Upgrade to Pro</h3>
                        <button class="vpadmin-pro-dialog-close">&times;</button>
                    </div>
                    <div class="vpadmin-pro-dialog-body">
                        <div id="user-guide" class="vpadmin-user-guide">
                            <span>${vpa_t('useEmailTip')}<span id="userEmailDisplay" style="color: red"></span></span>
                            <button class="vpadmin-copy-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                ${vpa_t('copy')}
                            </button>
                            <button class="vpadmin-help-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                ${vpa_t('help')}
                            </button>
                        </div>
                        <div class="vpadmin-iframe-container">
                            <div id="loadingOverlay" class="vpadmin-loading-overlay">
                                <div class="vpadmin-loading-spinner"></div>
                            </div>
                            <iframe id="paymentIframe" class="vpadmin-pro-iframe"></iframe>
                        </div>
                    </div>
                </div>
            `;
            dialog.querySelector('#proDialogTitle').textContent = finalConfig.buttonText;
            const dialogHeader = dialog.querySelector('.vpadmin-user-guide');
            if(finalConfig.needLogin === 'true'){
                // 添加复制按钮功能
                const copyButton = dialog.querySelector('.vpadmin-copy-button');
                copyButton.addEventListener('click', () => {
                    const emailDisplay = document.getElementById('userEmailDisplay');
                    const email = emailDisplay.textContent;

                    navigator.clipboard.writeText(email)
                        .then(() => {
                            showToast(vpa_t('emailCopied'), 'success');
                        })
                        .catch(() => {
                            showToast(vpa_t('copyFailed'), 'error');
                        });
                });

                // 添加帮助按钮功能
                const helpButton = dialog.querySelector('.vpadmin-help-button');
                helpButton.addEventListener('click', () => {
                    const helpDialog = document.createElement('div');
                    // 使用baseURL构建完整的URL
                    const guideUrl = buildUrl('vpadmin/payment-user-guide.html');
                    helpDialog.className = 'vpadmin-help-dialog vpadmin-modal-overlay';
                    helpDialog.innerHTML = `
                    <div class="vpadmin-modal-content">
                        <div class="vpadmin-modal-header">
                            <h3>Upgrade Guide</h3>
                            <button class="vpadmin-modal-close">&times;</button>
                        </div>
                        <div class="vpadmin-modal-body">
                            <iframe src="${guideUrl}" class="vpadmin-help-iframe"></iframe>
                        </div>
                    </div>
                `;

                    document.body.appendChild(helpDialog);
                    helpDialog.style.display = 'flex';

                    const closeHelpButton = helpDialog.querySelector('.vpadmin-modal-close');
                    closeHelpButton.addEventListener('click', () => {
                        document.body.removeChild(helpDialog);
                    });
                });
            } else {
                dialogHeader.style.display = 'none';
            }

            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .vpadmin-pro-button {
                    background: linear-gradient(135deg, #ff6b6b, #ff4757);
                    border: none;
                    padding: 2px 8px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .vpadmin-pro-button:hover {
                    background: linear-gradient(135deg, #ff4757, #ff3e4d);
                    box-shadow: 0 4px 6px rgba(255, 71, 87, 0.3);
                    transform: translateY(-1px);
                }
                
                .vpadmin-pro-button-small {
                    background: linear-gradient(135deg, #ff6b6b, #ff4757);
                    border: none;
                    padding: 2px 8px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    font-size: 12px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .vpadmin-pro-button-small:hover {
                    background: linear-gradient(135deg, #ff4757, #ff3e4d);
                    box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
                    transform: translateY(-1px);
                }
                
                .vpadmin-pro-text {
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
                
                .vpadmin-pro-text-small {
                    color: white;
                    font-weight: 500;
                    font-size: 12px;
                    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
                }
                
                .vpadmin-pro-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: none;
                }
                
                .vpadmin-pro-dialog-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .vpadmin-pro-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .vpadmin-pro-dialog-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #333;
                }
                
                .vpadmin-pro-dialog-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
                    cursor: pointer;
                    padding: 0 8px;
                    transition: color 0.3s;
                }
                
                .vpadmin-pro-dialog-close:hover {
                    color: #ff4757;
                }
                
                .vpadmin-pro-dialog-body {
                    padding: 20px;
                }
                
                .vpadmin-iframe-container {
                    position: relative;
                    width: 100%;
                    height: 500px;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .vpadmin-pro-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .vpadmin-loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
        
                .vpadmin-loading-spinner {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                }
        
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .vpadmin-user-guide {
                    background-color: #f8f9fa;
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .vpadmin-user-guide span {
                    color: #666;
                    font-size: 14px;
                }
                
                #userEmailDisplay {
                    font-weight: 600;
                    color: #333;
                }
                
                .vpadmin-confirm-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10001;
                }
                
                .vpadmin-confirm-content {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .vpadmin-confirm-content h3 {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    color: #333;
                }
                
                .vpadmin-confirm-content p {
                    margin: 0 0 20px 0;
                    color: #666;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .vpadmin-confirm-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                
                .vpadmin-confirm-buttons button {
                    padding: 8px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .vpadmin-confirm-no:hover {
                    background: #f1f1f1;
                    border-color: #ccc;
                }
                
                .vpadmin-help-dialog {
                    z-index: 10002;
                }
                
                .vpadmin-help-dialog .vpadmin-modal-content {
                    width: 90%;
                    max-width: 800px;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .vpadmin-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid #eee;
                }
                
                .vpadmin-modal-body {
                    flex: 1;
                    padding: 0;
                    overflow: hidden;
                }
                
                .vpadmin-help-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .vpadmin-confirm-header {
                    margin-bottom: 16px;
                }
                
                .vpadmin-confirm-body {
                    margin-bottom: 24px;
                }
                
                .vpadmin-confirm-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .vpadmin-confirm-yes,
                .vpadmin-confirm-no {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .vpadmin-confirm-yes {
                    background-color: #67c23a;
                    color: white;
                    border: none;
                }
                
                .vpadmin-confirm-yes:hover {
                    background-color: #85ce61;
                }
                
                .vpadmin-confirm-no {
                    background-color: #f56c6c;
                    color: white;
                    border: none;
                }
                
                .vpadmin-confirm-no:hover {
                    background-color: #f78989;
                }
                
                .vpadmin-copy-button,
                .vpadmin-help-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 1px 2px;
                    border: 1px solid #dcdfe6;
                    border-radius: 4px;
                    background-color: white;
                    color: #606266;
                    transition: all 0.2s;
                    font-size: 14px;
                    width: 60px;
                }
                
                .vpadmin-copy-button:hover,
                .vpadmin-help-button:hover {
                    background-color: #f5f7fa;
                    border-color: #c6e2ff;
                    color: #409eff;
                }
                
                .vpadmin-copy-button svg,
                .vpadmin-help-button svg {
                    stroke: currentColor;
                }
                
                @media (max-width: 480px) {
                    .vpadmin-pro-dialog-content {
                        width: 95%;
                        margin: 10px;
                    }
                
                    .vpadmin-iframe-container {
                        height: 400px;
                    }
                
                    .vpadmin-user-guide {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                
                    .vpadmin-confirm-content {
                        margin: 20px;
                        padding: 16px;
                    }
                
                    .vpadmin-confirm-buttons {
                        flex-direction: column;
                    }
                
                    .vpadmin-confirm-buttons button {
                        width: 100%;
                    }
                    
                    .vpadmin-help-dialog .vpadmin-modal-content {
                        width: 95%;
                        height: 90vh;
                    }
                
                    .vpadmin-confirm-footer {
                        gap: 8px;
                    }
                
                    .vpadmin-confirm-yes,
                    .vpadmin-confirm-no {
                        padding: 10px;
                        font-size: 14px;
                    }
                }
            `;
            document.head.appendChild(style);
            const iframe = dialog.querySelector('#paymentIframe');
            const loadingOverlay = dialog.querySelector('#loadingOverlay');
            iframe.onload = function() {
                loadingOverlay.style.display = 'none';
            };

            // 添加事件处理
            button.addEventListener('click', () => {
                const token = localStorage.getItem('accessToken');
                if (finalConfig.needLogin === 'true' && !token) {
                    showToast(vpa_t('pleaseLogin'), 'error');
                    return;
                }

                if(finalConfig.needLogin === 'true'){
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    const userEmail = userInfo.user.email;
                    document.getElementById('userEmailDisplay').textContent = userEmail;
                }

                if (finalConfig.paymentType.toLowerCase() === 'donation') {
                    const iframe = document.getElementById('paymentIframe');
                    iframe.src = `${finalConfig.iframeUrl}?timestamp=${Date.now()}`;
                    dialog.style.display = 'block';
                    loadingOverlay.style.display = 'flex';
                } else if (finalConfig.paymentType.toLowerCase() === 'shop') {
                    const width = 800;
                    const height = 600;
                    const left = (window.screen.width - width) / 2;
                    const top = (window.screen.height - height) / 2;
                    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
                    window.open(finalConfig.iframeUrl, 'ShopPaymentWindow', features);
                }
            });

            // 更新确认对话框实现
            function showConfirmDialog({ title, content, onConfirm, onCancel }) {
                const confirmDialog = document.createElement('div');
                confirmDialog.className = 'vpadmin-confirm-dialog';
                confirmDialog.innerHTML = `
                    <div class="vpadmin-confirm-content">
                        <div class="vpadmin-confirm-header">
                            <h3>${title}</h3>
                        </div>
                        <div class="vpadmin-confirm-body">
                            <p>${content}</p>
                        </div>
                        <div class="vpadmin-confirm-footer">
                            <button class="vpadmin-confirm-yes">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 6L9 17l-5-5"/>
                                </svg>
                                ${vpa_t('paymentSuccessful')}
                            </button>
                            <button class="vpadmin-confirm-no">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                ${vpa_t('notPaidYet')}
                            </button>
                        </div>
                    </div>
                `;

                const yesButton = confirmDialog.querySelector('.vpadmin-confirm-yes');
                const noButton = confirmDialog.querySelector('.vpadmin-confirm-no');

                // 抽取公共的 API 调用逻辑
                const callPaymentLogApi = async (paymentConfirm) => {
                    try {
                        const response = await apiRequest('/vpadmin/paymentLog', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                isToken: 'true'
                            },
                            body: {
                                paymentName: finalConfig.paymentName,
                                paymentConfirm: paymentConfirm,  // "1" for success, "0" for not paid
                                paymentLink: finalConfig.iframeUrl,
                                userEmail: document.getElementById('userEmailDisplay').textContent,
                                clientId: VPADMIN_CLIENT_ID,
                                paymentPlatform: finalConfig.paymentPlatform,
                                paymentType: finalConfig.paymentType
                            }
                        });

                        if (response.code === 200) {
                            //showToast(paymentConfirm === "1" ? 'Payment status recorded successfully' : 'Payment cancellation recorded', 'success');
                        }
                    } catch (error) {
                        console.error('Error recording payment status:', error);
                    }
                };

                yesButton.addEventListener('click', async () => {
                    await callPaymentLogApi("1");
                    document.body.removeChild(confirmDialog);
                    onConfirm && onConfirm();
                });

                noButton.addEventListener('click', async () => {
                    //await callPaymentLogApi("0");
                    document.body.removeChild(confirmDialog);
                    onCancel && onCancel();
                });

                document.body.appendChild(confirmDialog);
            }

            // 添加关闭对话框的处理
            const closeButton = dialog.querySelector('.vpadmin-pro-dialog-close');
            if(finalConfig.needLogin === 'true'){
                closeButton.addEventListener('click', () => {
                    showConfirmDialog({
                        title: vpa_t('paymentConfirm'),
                        content: vpa_t('paymentConfirmContent'),
                        onConfirm: () => {
                            dialog.style.display = 'none';
                        },
                        onCancel: () => {
                            dialog.style.display = 'none';
                        }
                    });
                });
            } else {
                closeButton.addEventListener('click', () => {
                    dialog.style.display = 'none';
                });
            }
            // 添加到指定容器
            finalConfig.container.appendChild(button);
            document.body.appendChild(dialog);

            return {
                button,
                dialog,
                show: () => dialog.style.display = 'block',
                hide: () => dialog.style.display = 'none'
            };
        }

        // 在页面加载时检查是否有社交登录回调
        // 立即检查当前文档状态并处理
        if (document.readyState === 'complete') {
            handleSocialLoginCallback();
        } else {
            window.addEventListener('load', handleSocialLoginCallback);
        }

        // 添加 Orders 点击事件处理
        document.getElementById('userOrdersButton').addEventListener('click', async function(e) {
            e.preventDefault();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                showToast(vpa_t('pleaseLogin'), 'error');
                return;
            }

            showOrdersDialog();
        });

        function showOrdersDialog() {
            // 创建对话框
            const dialog = document.createElement('div');
            dialog.className = 'vpadmin-modal-overlay';
            dialog.style.display = 'block';
            dialog.innerHTML = `
                <div class="vpadmin-orders-dialog">
                    <div class="vpadmin-orders-dialog-content">
                        <div class="vpadmin-orders-dialog-header">
                            <h3>${vpa_t('orderHistory')}</h3>
                            <button class="vpadmin-orders-dialog-close">&times;</button>
                        </div>
                        <div class="vpadmin-orders-dialog-body">
                            <div class="vpadmin-orders-container">
                                <div class="vpadmin-orders-loading" style="display: none;">
                                    <div class="vpadmin-orders-loading-spinner"></div>
                                    <span>${vpa_t('loadingOrders')}</span>
                                </div>
                                <table class="vpadmin-orders-table">
                                    <thead>
                                        <tr>
                                            <th>${vpa_t('orderId')}</th>
                                            <th>${vpa_t('orderName')}</th>
                                            <th>${vpa_t('status')}</th>
                                            <th>${vpa_t('orderTime')}</th>
                                            <th>${vpa_t('message')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Orders will be inserted here -->
                                    </tbody>
                                </table>
                                <div class="vpadmin-orders-empty" style="display: none;">
                                    ${vpa_t('noOrders')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .vpadmin-orders-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 900px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 10001;
                }
        
                .vpadmin-orders-dialog-content {
                    position: relative;
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
        
                .vpadmin-orders-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #eee;
                }
        
                .vpadmin-orders-dialog-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #333;
                }
        
                .vpadmin-orders-dialog-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
                    cursor: pointer;
                    padding: 0 8px;
                    transition: color 0.3s;
                }
        
                .vpadmin-orders-dialog-close:hover {
                    color: #ff4757;
                }
        
                .vpadmin-orders-dialog-body {
                    padding: 20px;
                    flex: 1;
                    overflow: auto;
                }
        
                .vpadmin-orders-container {
                    position: relative;
                    min-height: 200px;
                }
        
                .vpadmin-orders-table {
                    width: 100%;
                    border-collapse: collapse;
                    border-spacing: 0;
                }
        
                .vpadmin-orders-table th,
                .vpadmin-orders-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
        
                .vpadmin-orders-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #606266;
                }
        
                .vpadmin-orders-table tbody tr:hover {
                    background-color: #f5f7fa;
                }
        
                .vpadmin-orders-status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
        
                .vpadmin-orders-status-pending {
                    background-color: #e6a23c;
                    color: white;
                }
        
                .vpadmin-orders-status-success {
                    background-color: #67c23a;
                    color: white;
                }
        
                .vpadmin-orders-status-failed {
                    background-color: #f56c6c;
                    color: white;
                }
        
                .vpadmin-orders-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
        
                .vpadmin-orders-loading-spinner {
                    border: 3px solid #f3f3f3;
                    border-radius: 50%;
                    border-top: 3px solid #3498db;
                    width: 24px;
                    height: 24px;
                    animation: vpadmin-spin 1s linear infinite;
                    margin: 0 auto 8px;
                }
        
                .vpadmin-orders-empty {
                    text-align: center;
                    color: #909399;
                    padding: 24px;
                }
        
                @keyframes vpadmin-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
        
                @media (max-width: 768px) {
                    .vpadmin-orders-dialog {
                        width: 95%;
                        margin: 10px;
                    }
        
                    .vpadmin-orders-table th,
                    .vpadmin-orders-table td {
                        padding: 8px;
                        font-size: 14px;
                    }
        
                    .vpadmin-orders-dialog-body {
                        padding: 10px;
                    }
                }
            `;

            // 添加详情对话框的样式
            style.textContent += `
                .vpadmin-message-button {
                    padding: 4px 8px;
                    background-color: #409eff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s;
                }
        
                .vpadmin-message-button:hover {
                    background-color: #66b1ff;
                }
        
                .vpadmin-message-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    z-index: 10002;
                    max-width: 500px;
                    width: 90%;
                }
        
                .vpadmin-message-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #eee;
                }
        
                .vpadmin-message-dialog-title {
                    margin: 0;
                    font-size: 16px;
                    color: #333;
                }
        
                .vpadmin-message-dialog-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #666;
                    cursor: pointer;
                    padding: 4px;
                }
        
                .vpadmin-message-dialog-close:hover {
                    color: #f56c6c;
                }
        
                .vpadmin-message-content {
                    line-height: 1.6;
                    color: #666;
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
        
                @media (max-width: 768px) {
                    .vpadmin-message-dialog {
                        width: 95%;
                        margin: 10px;
                    }
                }
            `;
            document.head.appendChild(style);

            // 添加到文档
            document.body.appendChild(dialog);

            // 加载订单数据
            loadOrders(dialog);

            // 添加关闭功能
            const closeButton = dialog.querySelector('.vpadmin-orders-dialog-close');
            closeButton.addEventListener('click', () => {
                document.body.removeChild(dialog);
            });

            // 添加点击遮罩关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    //document.body.removeChild(dialog);
                }
            });
        }

        // 修改加载订单数据的函数
        async function loadOrders(dialog) {
            const loadingElement = dialog.querySelector('.vpadmin-orders-loading');
            const tableBody = dialog.querySelector('.vpadmin-orders-table tbody');
            const emptyElement = dialog.querySelector('.vpadmin-orders-empty');

            loadingElement.style.display = 'block';
            tableBody.innerHTML = '';
            emptyElement.style.display = 'none';

            try {
                const response = await apiRequest('/vpadmin/paymentLog/listAll', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        isToken: 'true'
                    }
                });

                if (response.code === 200) {
                    const orders = response.data;

                    if (orders.length === 0) {
                        emptyElement.style.display = 'block';
                        return;
                    }

                    const rows = orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.paymentName}</td>
                    <td>
                        <span class="vpadmin-orders-status ${getStatusClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </td>
                    <td>${order.createTime}</td>
                    <td>
                        ${order.replyContent ? `
                            <button class="vpadmin-message-button" data-message="${escapeHtml(order.replyContent)}">
                                Details
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');

                    tableBody.innerHTML = rows;

                    // 为所有详情按钮添加事件监听
                    tableBody.querySelectorAll('.vpadmin-message-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const message = this.getAttribute('data-message');
                            // 创建并显示消息对话框
                            const messageDialog = document.createElement('div');
                            messageDialog.className = 'vpadmin-modal-overlay';
                            messageDialog.style.display = 'block';
                            messageDialog.innerHTML = `
                        <div class="vpadmin-message-dialog">
                            <div class="vpadmin-message-dialog-header">
                                <h3 class="vpadmin-message-dialog-title">${vpa_t('messageDetails')}</h3>
                                <button class="vpadmin-message-dialog-close">&times;</button>
                            </div>
                            <div class="vpadmin-message-content">${message}</div>
                        </div>
                    `;

                            document.body.appendChild(messageDialog);

                            // 点击关闭按钮或遮罩层关闭对话框
                            messageDialog.addEventListener('click', (e) => {
                                if (e.target.classList.contains('vpadmin-message-dialog-close')) {
                                    document.body.removeChild(messageDialog);
                                }
                            });
                        });
                    });

                } else {
                    throw new Error(response.msg || vpa_t('failedToLoadOrders'));
                }
            } catch (error) {
                console.error('Error loading orders:', error);
                showToast(vpa_t('errorLoadingOrders'), 'error');
                emptyElement.textContent = vpa_t('errorLoadingOrders');
                emptyElement.style.display = 'block';
            } finally {
                loadingElement.style.display = 'none';
            }
        }

        // 添加HTML转义函数以防XSS攻击
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function getStatusClass(status) {
            switch (status) {
                case '0':
                    return 'vpadmin-orders-status-pending';
                case '1':
                    return 'vpadmin-orders-status-success';
                case '2':
                    return 'vpadmin-orders-status-failed';
                default:
                    return 'vpadmin-orders-status-pending';
            }
        }

        function getStatusText(status) {
            switch (status) {
                case '0':
                    return vpa_t('statusPending');
                case '1':
                    return vpa_t('statusSuccess');
                case '2':
                    return vpa_t('statusFailed');
                default:
                    return vpa_t('statusUnknown');
            }
        }

        // 检查用户是否已登录
        const token = localStorage.getItem('accessToken');
        if (token) {
            isLoggedIn = true;
            userImage = buildUrl('vpadmin/profile_blue.svg');
            getUserInfo().then(updateLoginButton);
        } else {
            updateLoginButton();
        }
        window.createUpgradeButton = createUpgradeButton;
        // 添加一个自定义事件来通知初始化完成
        function notifyInitialized() {
            window.dispatchEvent(new CustomEvent('vpadminInitialized'));
            //window.dispatchEvent(new CustomEvent('vpadmin-lang-change'));
        }
        // 在所有初始化完成后触发事件
        notifyInitialized();
        console.log('VpAdmin Menus are created');
    }
})();