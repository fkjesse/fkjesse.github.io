import { api } from '../api.js';
import { store } from '../store.js';
import { adminAPI } from '../admin.js';
import { Prize } from '../models.js';

export async function initPrizeManage() {
    const prizeList = document.getElementById('prizeTableBody');
    let prizes = [];

    // 初始化数据
    async function initData() {
        try {
            prizes = await api.prizes.list();
            updateUI();
        } catch (error) {
            adminAPI.showMessage('加载奖品数据失败', 'error');
        }
    }

    // 更新界面
    function updateUI() {
        if (!prizeList) return;
        
        prizeList.innerHTML = prizes.map(prize => `
            <tr>
                <td>${prize.name}</td>
                <td>${prize.description}</td>
                <td>${prize.count}</td>
                <td>${prize.remaining}</td>
                <td>
                    <img src="${prize.image || 'assets/images/default-prize.png'}" 
                         alt="${prize.name}" class="prize-image">
                </td>
                <td>
                    <button class="edit-btn" data-id="${prize.id}">编辑</button>
                    <button class="delete-btn" data-id="${prize.id}">删除</button>
                </td>
            </tr>
        `).join('');

        bindPrizeEvents();
    }

    // 绑定事件
    function bindPrizeEvents() {
        // 添加奖品按钮
        const addPrizeBtn = document.getElementById('addPrizeBtn');
        if (addPrizeBtn) {
            addPrizeBtn.addEventListener('click', showPrizeModal);
        }

        // 编辑和删除按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editPrize(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deletePrize(btn.dataset.id));
        });

        // 导入按钮
        const importBtn = document.getElementById('importPrizeBtn');
        if (importBtn) {
            importBtn.addEventListener('click', showImportModal);
        }
    }

    // 组件接口
    const component = {
        async save() {
            try {
                await store.updateSettings({ prizes });
                adminAPI.showMessage('保存成功', 'success');
            } catch (error) {
                adminAPI.showMessage('保存失败', 'error');
            }
        },

        async preview() {
            // 实现预览功能
            window.open('/preview.html', '_blank');
        },

        refresh: initData,

        destroy() {
            // 清理工作
        }
    };

    // 初始化
    await initData();
    
    return component;
}

// 添加这些处理函数
async function showPrizeModal(prizeData = null) {
    const modal = document.getElementById('prizeModal');
    const form = document.getElementById('prizeForm');
    
    if (!modal || !form) return;
    
    // 如果是编辑，填充表单
    if (prizeData) {
        form.querySelector('[name="prizeName"]').value = prizeData.name;
        form.querySelector('[name="prizeItemName"]').value = prizeData.description;
        form.querySelector('[name="prizeCount"]').value = prizeData.count;
        if (prizeData.image) {
            form.querySelector('.image-preview').innerHTML = 
                `<img src="${prizeData.image}" alt="预览图">`;
        }
    } else {
        form.reset();
        form.querySelector('.image-preview').innerHTML = '';
    }
    
    modal.style.display = 'block';
}

async function editPrize(id) {
    const prize = prizes.find(p => p.id === id);
    if (prize) {
        showPrizeModal(prize);
    }
}

async function deletePrize(id) {
    if (confirm('确定要删除这个奖项吗？')) {
        try {
            await api.prizes.delete(id);
            prizes = prizes.filter(p => p.id !== id);
            updateUI();
            adminAPI.showMessage('删除成功', 'success');
        } catch (error) {
            adminAPI.showMessage('删除失败', 'error');
        }
    }
}

function showImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.style.display = 'block';
    }
} 