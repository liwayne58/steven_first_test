/**
 * Toast 通知系統
 * 支援成功、失敗、警告和資訊類型的通知
 */
class Toast {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    /**
     * 初始化 Toast 容器
     */
    initContainer() {
        // 檢查是否已存在容器
        this.container = document.getElementById('toast-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 顯示成功通知
     * @param {string} message - 要顯示的訊息
     * @param {number} duration - 顯示時間（毫秒），預設 3000ms
     */
    showSuccess(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    /**
     * 顯示失敗通知
     * @param {string} message - 要顯示的訊息
     * @param {number} duration - 顯示時間（毫秒），預設 4000ms
     */
    showError(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    /**
     * 顯示警告通知
     * @param {string} message - 要顯示的訊息
     * @param {number} duration - 顯示時間（毫秒），預設 3500ms
     */
    showWarning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    }

    /**
     * 顯示資訊通知
     * @param {string} message - 要顯示的訊息
     * @param {number} duration - 顯示時間（毫秒），預設 3000ms
     */
    showInfo(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    /**
     * 顯示 Toast 通知
     * @param {string} message - 要顯示的訊息
     * @param {string} type - 通知類型 ('success', 'error', 'warning', 'info')
     * @param {number} duration - 顯示時間（毫秒）
     */
    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // 觸發進入動畫
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // 設定自動移除
        const timeoutId = setTimeout(() => {
            this.remove(toast);
        }, duration);

        // 點擊關閉
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.remove(toast);
        });

        // 滑鼠懸停暫停自動關閉
        let isPaused = false;
        let remainingTime = duration;
        let startTime = Date.now();

        toast.addEventListener('mouseenter', () => {
            if (!isPaused) {
                clearTimeout(timeoutId);
                remainingTime = duration - (Date.now() - startTime);
                isPaused = true;
            }
        });

        toast.addEventListener('mouseleave', () => {
            if (isPaused) {
                const newTimeoutId = setTimeout(() => {
                    this.remove(toast);
                }, remainingTime);
                isPaused = false;
                startTime = Date.now();
            }
        });
    }

    /**
     * 創建 Toast 元素
     * @param {string} message - 訊息內容
     * @param {string} type - 通知類型
     * @returns {HTMLElement} Toast 元素
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" aria-label="關閉通知">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        toast.appendChild(progressBar);
        return toast;
    }

    /**
     * 獲取對應類型的圖示
     * @param {string} type - 通知類型
     * @returns {string} 圖示 HTML
     */
    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="12" y1="16" x2="12" y2="12"></line>
                     <line x1="12" y1="8" x2="12.01" y2="8"></line>
                   </svg>`
        };
        return icons[type] || icons.info;
    }

    /**
     * 移除 Toast 通知
     * @param {HTMLElement} toast - 要移除的 Toast 元素
     */
    remove(toast) {
        toast.classList.add('toast-hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // 等待動畫完成
    }

    /**
     * 清除所有 Toast 通知
     */
    clear() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.remove(toast));
    }
}

// 確保DOM載入完成後才初始化Toast
let toast;
let isToastReady = false;

function initializeToast() {
    if (!isToastReady) {
        toast = new Toast();
        isToastReady = true;
        // 為了向後相容，也可以直接使用函數
        window.showToast = {
            success: (message, duration) => toast.showSuccess(message, duration),
            error: (message, duration) => toast.showError(message, duration),
            warning: (message, duration) => toast.showWarning(message, duration),
            info: (message, duration) => toast.showInfo(message, duration)
        };

        // 提供 Toast.success/info/warning/error 靜態方法
        Toast.success = function(message, duration) { toast.showSuccess(message, duration); };
        Toast.error = function(message, duration) { toast.showError(message, duration); };
        Toast.warning = function(message, duration) { toast.showWarning(message, duration); };
        Toast.info = function(message, duration) { toast.showInfo(message, duration); };
        Toast.clear = function() { toast.clear(); };
    }
}

// 如果DOM已載入就立即初始化，否則等待載入完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToast);
} else {
    initializeToast();
}

// 匯出 Toast 類別和實例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Toast, toast };
}