// 导入组件控制器
import { initPrizeManage } from './components/prize-manage.js';
import { initUserManage } from './components/user-manage.js';
import { initSettings } from './components/settings.js';
import { store } from './store.js';
import { errorHandler } from './middleware/error-handler.js';

// 当前加载的组件
let currentComponent = null;

// 初始化后台
async function initAdmin() {
    try {
        console.log('Initializing admin...');
        
        // 初始化全局状态
        await store.init();
        console.log('Store initialized');

        // 绑定导航事件
        bindNavEvents();
        console.log('Navigation events bound');
        
        // 绑定顶部按钮事件
        bindTopBarEvents();
        console.log('Top bar events bound');
        
        // 加载默认组件
        await loadComponent('prize-manage');
        console.log('Default component loaded');
    } catch (error) {
        console.error('Admin initialization failed:', error);
        errorHandler(error);
    }
}

// 检查登录状态
function checkAuth() {
    return true;
}

// 绑定导航事件
function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const component = item.dataset.component;
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // 更新面包屑
            document.querySelector('.current-page').textContent = 
                item.textContent.trim();
            
            // 加载组件
            await loadComponent(component);
        });
    });
    
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    });
}

// 绑定顶部按钮事件
function bindTopBarEvents() {
    const saveBtn = document.getElementById('saveBtn');
    const previewBtn = document.getElementById('previewBtn');
    
    saveBtn.addEventListener('click', () => {
        if (currentComponent && currentComponent.save) {
            currentComponent.save();
        }
    });
    
    previewBtn.addEventListener('click', () => {
        if (currentComponent && currentComponent.preview) {
            currentComponent.preview();
        }
    });
}

// 加载组件
async function loadComponent(componentName) {
    console.log(`Loading component: ${componentName}`);
    const contentArea = document.querySelector('.content-area');
    
    try {
        const componentPath = `/admin/components/${componentName}.html`;
        console.log(`Fetching component from: ${componentPath}`);
        
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentName} (${response.status})`);
        }
        
        const html = await response.text();
        contentArea.innerHTML = html;
        
        // 使用相对路径动态导入
        let component;
        switch(componentName) {
            case 'prize-manage':
                const { initPrizeManage } = await import('./components/prize-manage.js');
                component = await initPrizeManage();
                break;
            case 'user-manage':
                const { initUserManage } = await import('./components/user-manage.js');
                component = await initUserManage();
                break;
            case 'settings':
                const { initSettings } = await import('./components/settings.js');
                component = await initSettings();
                break;
            default:
                throw new Error(`Unknown component: ${componentName}`);
        }
        
        currentComponent = component;
        updateTopBarButtons(componentName);
        
    } catch (error) {
        console.error('Component loading error:', error);
        contentArea.innerHTML = `
            <div class="error-message">
                <h3>加载失败</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">重试</button>
            </div>
        `;
        errorHandler(error);
    }
}

// 更新顶部按钮状态
function updateTopBarButtons(componentName) {
    const saveBtn = document.getElementById('saveBtn');
    const previewBtn = document.getElementById('previewBtn');
    
    // 根据组件类型显示/隐藏按钮
    switch(componentName) {
        case 'prize-manage':
            saveBtn.style.display = 'block';
            previewBtn.style.display = 'block';
            break;
        case 'user-manage':
            saveBtn.style.display = 'block';
            previewBtn.style.display = 'none';
            break;
        case 'settings':
            saveBtn.style.display = 'block';
            previewBtn.style.display = 'block';
            break;
        default:
            saveBtn.style.display = 'none';
            previewBtn.style.display = 'none';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', initAdmin);

// 导出管理接口
export const adminAPI = {
    refreshComponent: () => {
        if (currentComponent && currentComponent.refresh) {
            currentComponent.refresh();
        }
    },
    
    showMessage: (message, type = 'info') => {
        // 显示提示消息
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    getCurrentComponent: () => currentComponent
}; 