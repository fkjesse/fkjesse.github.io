// API基础URL
const BASE_URL = '/api';

// API请求工具函数
async function request(url, options = {}) {
    const token = localStorage.getItem('admin_token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };

    try {
        const response = await fetch(`${BASE_URL}${url}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (response.status === 401) {
            // token过期或无效，跳转到登录页
            window.location.href = '/admin/login.html';
            return;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// 导出API方法
export const api = {
    // 用户认证相关
    auth: {
        login: (credentials) => request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        logout: () => request('/logout', { method: 'POST' }),
        checkToken: () => request('/check-token')
    },

    // 奖品管理相关
    prizes: {
        list: () => request('/prizes'),
        create: (prize) => request('/prizes', {
            method: 'POST',
            body: JSON.stringify(prize)
        }),
        update: (id, prize) => request(`/prizes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(prize)
        }),
        delete: (id) => request(`/prizes/${id}`, {
            method: 'DELETE'
        }),
        import: (formData) => request('/prizes/import', {
            method: 'POST',
            headers: {},  // 清除Content-Type，让浏览器自动设置
            body: formData
        })
    },

    // 人员管理相关
    users: {
        list: () => request('/users'),
        create: (user) => request('/users', {
            method: 'POST',
            body: JSON.stringify(user)
        }),
        update: (id, user) => request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        }),
        delete: (id) => request(`/users/${id}`, {
            method: 'DELETE'
        }),
        import: (formData) => request('/users/import', {
            method: 'POST',
            headers: {},
            body: formData
        }),
        toggleParticipation: (id, participate) => request(`/users/${id}/participation`, {
            method: 'PUT',
            body: JSON.stringify({ participate })
        })
    },

    // 部门管理相关
    departments: {
        list: () => request('/departments'),
        create: (dept) => request('/departments', {
            method: 'POST',
            body: JSON.stringify(dept)
        }),
        update: (id, dept) => request(`/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dept)
        }),
        delete: (id) => request(`/departments/${id}`, {
            method: 'DELETE'
        })
    },

    // 系统设置相关
    settings: {
        get: () => request('/settings'),
        update: (settings) => request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        })
    },

    // 抽奖记录相关
    records: {
        list: () => request('/lottery/records'),
        export: (format = 'csv') => request(`/lottery/records/export?format=${format}`)
    }
}; 