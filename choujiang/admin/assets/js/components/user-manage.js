import { api } from '../api.js';
import { store } from '../store.js';
import { adminAPI } from '../admin.js';
import { User } from '../models.js';

export async function initUserManage() {
    let users = [];
    let departments = [];
    const userList = document.getElementById('userTableBody');

    // 初始化数据
    async function initData() {
        try {
            const [usersData, deptsData] = await Promise.all([
                api.users.list(),
                api.departments.list()
            ]);
            users = usersData;
            departments = deptsData;
            updateUI();
            initDepartmentFilter();
        } catch (error) {
            console.error('Failed to load user data:', error);
            adminAPI.showMessage('加载用户数据失败', 'error');
        }
    }

    // 更新界面
    function updateUI() {
        if (!userList) return;
        console.log('Updating UI with users:', users.length);

        userList.innerHTML = users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.number}"></td>
                <td>${user.number}</td>
                <td>${user.name}</td>
                <td>${user.department}</td>
                <td>${user.position || '-'}</td>
                <td>
                    <img src="${user.avatar || 'assets/images/default-avatar.png'}" 
                         alt="头像" class="user-avatar">
                </td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${user.participateLottery ? 'checked' : ''}
                               data-id="${user.number}"
                               onchange="toggleUserParticipation(this)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="edit-btn" data-id="${user.number}">编辑</button>
                    <button class="delete-btn" data-id="${user.number}">删除</button>
                </td>
            </tr>
        `).join('');

        bindUserEvents();
    }

    // 初始化部门筛选
    function initDepartmentFilter() {
        const deptFilter = document.getElementById('deptFilter');
        if (!deptFilter) return;

        deptFilter.innerHTML = `
            <option value="">所有部门</option>
            ${departments.map(dept => 
                `<option value="${dept.code}">${dept.name}</option>`
            ).join('')}
        `;
    }

    // 绑定事件
    function bindUserEvents() {
        // 添加用户按钮
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', showUserModal);
        }

        // 导入导出按钮
        const importBtn = document.getElementById('importUserBtn');
        const exportBtn = document.getElementById('exportUserBtn');
        
        if (importBtn) {
            importBtn.addEventListener('click', showImportModal);
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportUsers);
        }

        // 全选框
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', e => {
                const checkboxes = userList.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }
    }

    // 初始化组件
    console.log('Initializing user management component');
    await initData();
    
    // 返回组件接口
    return {
        async save() {
            try {
                await store.updateSettings({ users });
                adminAPI.showMessage('保存成功', 'success');
            } catch (error) {
                adminAPI.showMessage('保存失败', 'error');
            }
        },
        refresh: initData,
        destroy() {
            // 清理工作
            users = [];
            departments = [];
        }
    };
}

// 添加这些处理函数
async function showUserModal(userData = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    
    if (!modal || !form) return;
    
    // 填充部门选项
    const deptSelect = form.querySelector('[name="department"]');
    if (deptSelect) {
        deptSelect.innerHTML = `
            <option value="">请选择部门</option>
            ${departments.map(dept => 
                `<option value="${dept.code}">${dept.name}</option>`
            ).join('')}
        `;
    }
    
    // 如果是编辑，填充表单
    if (userData) {
        form.querySelector('[name="userNumber"]').value = userData.number;
        form.querySelector('[name="userName"]').value = userData.name;
        form.querySelector('[name="department"]').value = userData.department;
        form.querySelector('[name="position"]').value = userData.position || '';
        form.querySelector('[name="participateLottery"]').checked = userData.participateLottery;
        if (userData.avatar) {
            form.querySelector('.image-preview').innerHTML = 
                `<img src="${userData.avatar}" alt="预览图">`;
        }
    } else {
        form.reset();
        form.querySelector('.image-preview').innerHTML = '';
    }
    
    modal.style.display = 'block';
}

function showImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

async function exportUsers() {
    try {
        const response = await api.users.export();
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '人员名单.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        adminAPI.showMessage('导出失败', 'error');
    }
}

// 添加关闭模态框的通用函数
window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
};

// 添加全局函数用于切换用户参与状态
window.toggleUserParticipation = async function(checkbox) {
    try {
        const userId = checkbox.dataset.id;
        await api.users.toggleParticipation(userId, checkbox.checked);
        adminAPI.showMessage('更新成功', 'success');
    } catch (error) {
        checkbox.checked = !checkbox.checked; // 恢复原状态
        adminAPI.showMessage('更新失败', 'error');
    }
}; 