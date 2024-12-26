// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const values = {
        'YYYY': d.getFullYear(),
        'MM': String(d.getMonth() + 1).padStart(2, '0'),
        'DD': String(d.getDate()).padStart(2, '0'),
        'HH': String(d.getHours()).padStart(2, '0'),
        'mm': String(d.getMinutes()).padStart(2, '0'),
        'ss': String(d.getSeconds()).padStart(2, '0')
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => values[match]);
}

// 文件大小格式化
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 表单数据处理
export function formToObject(formData) {
    const object = {};
    formData.forEach((value, key) => {
        if (object[key]) {
            if (!Array.isArray(object[key])) {
                object[key] = [object[key]];
            }
            object[key].push(value);
        } else {
            object[key] = value;
        }
    });
    return object;
}

// 文件类型验证
export function validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
}

// 图片预览
export function createImagePreview(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 错误处理
export function handleError(error, defaultMessage = '操作失败') {
    console.error(error);
    return {
        message: error.response?.data?.message || defaultMessage,
        type: 'error'
    };
}

// 导出CSV
export function exportToCsv(data, filename) {
    const csvContent = data.map(row => 
        Object.values(row).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// 本地存储封装
export const storage = {
    set(key, value, expire = 0) {
        const data = {
            value,
            expire: expire ? Date.now() + expire : 0
        };
        localStorage.setItem(key, JSON.stringify(data));
    },

    get(key) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data) {
            if (data.expire && data.expire < Date.now()) {
                localStorage.removeItem(key);
                return null;
            }
            return data.value;
        }
        return null;
    },

    remove(key) {
        localStorage.removeItem(key);
    }
}; 