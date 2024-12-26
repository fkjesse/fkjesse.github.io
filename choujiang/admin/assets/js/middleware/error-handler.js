import { adminAPI } from '../admin.js';

// 错误类型定义
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER: 'SERVER_ERROR'
};

// 错误处理中间件
export function errorHandler(error) {
    console.error('Error caught by middleware:', error);

    // 网络错误
    if (error.name === 'NetworkError') {
        adminAPI.showMessage('网络连接失败，请检查网络设置', 'error');
        return { type: ErrorTypes.NETWORK };
    }

    // 认证错误
    if (error.status === 401) {
        window.location.href = '/admin/login.html';
        return { type: ErrorTypes.AUTH };
    }

    // 验证错误
    if (error.status === 400) {
        adminAPI.showMessage(error.message || '输入数据无效', 'error');
        return { type: ErrorTypes.VALIDATION };
    }

    // 资源不存在
    if (error.status === 404) {
        adminAPI.showMessage('请求的资源不存在', 'error');
        return { type: ErrorTypes.NOT_FOUND };
    }

    // 服务器错误
    if (error.status >= 500) {
        adminAPI.showMessage('服务器错误，请稍后重试', 'error');
        return { type: ErrorTypes.SERVER };
    }

    // 默认错误处理
    adminAPI.showMessage('操作失败，请重试', 'error');
    return { type: 'UNKNOWN_ERROR' };
}

// 错误边界HOC
export function withErrorBoundary(Component) {
    return class ErrorBoundary extends HTMLElement {
        constructor() {
            super();
            this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
            console.error('Component Error:', error, errorInfo);
            errorHandler(error);
        }

        render() {
            if (this.state.hasError) {
                return `
                    <div class="error-boundary">
                        <h3>页面出现错误</h3>
                        <p>请刷新页面或联系管理员</p>
                        <button onclick="location.reload()">刷新页面</button>
                    </div>
                `;
            }

            return new Component();
        }
    };
} 