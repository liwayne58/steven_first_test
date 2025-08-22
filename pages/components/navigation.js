/**
 * SDS Site 統一導航組件
 * 提供一致的網站導航和頁腳
 */

class SiteNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.navigationData = {
            links: [
                { href: './', label: '首頁', icon: '🏠', path: 'index' },
                { href: './JsonFormatter', label: 'JSON 格式化', icon: '🎨', path: 'JsonFormatter' },
                { href: './Base64Converter', label: 'Base64 轉換', icon: '🔐', path: 'Base64Converter' },
                { href: './CodeCompare', label: '代碼比較', icon: '🔍', path: 'CodeCompare' },
                { href: './SqlFormatter', label: 'SQL 格式化', icon: '🗃️', path: 'SqlFormatter' },
                { href: './CronGenerator', label: 'Cron 生成器', icon: '⏰', path: 'CronGenerator' },
                { href: './AlarmClock', label: '開發者鬧鐘', icon: '🦆', path: 'AlarmClock' }
            ]
        };
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        
        // 處理不同的路徑格式
        if (filename === '' || filename === 'index.html' || path === '/') {
            return 'index';
        }
        
        // 移除 .html 後綴
        return filename.replace('.html', '');
    }

    generateNavigation(style = 'horizontal') {
        if (style === 'horizontal') {
            return this.generateHorizontalNav();
        } else if (style === 'simple') {
            return this.generateSimpleNav();
        }
    }

    generateHorizontalNav() {
        const links = this.navigationData.links.map(link => {
            const isActive = this.currentPage === link.path;
            const activeStyle = isActive ? 'color: var(--primary-color); font-weight: 600;' : '';
            
            return `<a href="${link.href}" class="nav-link" style="${activeStyle}">${link.label}</a>`;
        }).join('<span class="nav-link">|</span>');

        return `
            <!-- Navigation -->
            <nav class="navigation" aria-label="網站導航">
                ${links}
            </nav>
        `;
    }

    generateSimpleNav() {
        const links = this.navigationData.links
            .filter(link => link.path !== this.currentPage) // 排除當前頁面
            .map(link => {
                return `<a href="${link.href}" class="nav-link">${link.icon} ${link.label}</a>`;
            }).join('');

        return `
            <!-- Navigation -->
            <nav class="navigation" aria-label="網站導航">
                ${links}
            </nav>
        `;
    }

    generateFooter() {
        return `
            <!-- Footer -->
            <footer class="footer">
                <p>&copy; 2025 SDS Site. Made with ❤️ for developers.</p>
            </footer>
        `;
    }

    render(navigationStyle = 'horizontal', includeFooter = true) {
        const navigation = this.generateNavigation(navigationStyle);
        const footer = includeFooter ? this.generateFooter() : '';
        
        return `
            ${navigation}
            ${footer}
        `;
    }

    // 自動插入到頁面中
    insertIntoPage(containerId = null, navigationStyle = 'horizontal', includeFooter = true) {
        const content = this.render(navigationStyle, includeFooter);
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = content;
            }
        } else {
            // 自動查找插入位置
            this.autoInsert(content);
        }
    }

    autoInsert(content) {
        // 查找現有的 navigation 元素並替換
        const existingNav = document.querySelector('.navigation');
        const existingFooter = document.querySelector('.footer');
        
        if (existingNav) {
            // 創建一個容器來包含導航和頁腳
            const container = document.createElement('div');
            container.innerHTML = content;
            
            // 替換導航
            const newNav = container.querySelector('.navigation');
            if (newNav) {
                existingNav.parentNode.replaceChild(newNav, existingNav);
            }
            
            // 替換頁腳
            const newFooter = container.querySelector('.footer');
            if (newFooter && existingFooter) {
                existingFooter.parentNode.replaceChild(newFooter, existingFooter);
            } else if (newFooter && !existingFooter) {
                // 如果沒有現有頁腳，添加到最後
                document.querySelector('.container').appendChild(newFooter);
            }
        } else {
            // 如果沒有現有導航，插入到 container 的末尾
            const container = document.querySelector('.container');
            if (container) {
                container.insertAdjacentHTML('beforeend', content);
            }
        }
    }
}

// 初始化導航系統
let siteNavigation;

function initSiteNavigation(style = 'horizontal', includeFooter = true) {
    siteNavigation = new SiteNavigation();
    siteNavigation.insertIntoPage(null, style, includeFooter);
}

// 手動插入導航的輔助函數
function insertNavigation(containerId, style = 'horizontal', includeFooter = true) {
    if (!siteNavigation) {
        siteNavigation = new SiteNavigation();
    }
    siteNavigation.insertIntoPage(containerId, style, includeFooter);
}

// 更新當前頁面高亮
function updateNavigationHighlight() {
    if (siteNavigation) {
        siteNavigation.currentPage = siteNavigation.getCurrentPage();
        siteNavigation.insertIntoPage();
    }
}

// 確保DOM載入完成後才初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 檢查頁面是否需要自動初始化導航
        if (document.querySelector('.navigation') || document.querySelector('[data-auto-navigation]')) {
            initSiteNavigation();
        }
    });
} else {
    // 如果DOM已經載入完成，立即檢查
    if (document.querySelector('.navigation') || document.querySelector('[data-auto-navigation]')) {
        initSiteNavigation();
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SiteNavigation, initSiteNavigation, insertNavigation };
}
