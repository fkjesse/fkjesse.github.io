import { api } from '../api.js';
import { store } from '../store.js';
import { adminAPI } from '../admin.js';

export async function initSettings() {
    let settings = {};

    // 初始化数据
    async function initData() {
        try {
            settings = await api.settings.get();
            updateUI();
        } catch (error) {
            adminAPI.showMessage('加载设置失败', 'error');
        }
    }

    // 更新界面
    function updateUI() {
        // 更新抽奖设置
        const lotteryForm = document.getElementById('lotterySettingsForm');
        if (lotteryForm) {
            lotteryForm.lotterySpeed.value = settings.lottery?.speed || 5;
            lotteryForm.showDepartment.checked = settings.lottery?.showDepartment ?? true;
            lotteryForm.showPosition.checked = settings.lottery?.showPosition ?? true;
            lotteryForm.showNumber.checked = settings.lottery?.showNumber ?? true;
            lotteryForm.showAvatar.checked = settings.lottery?.showAvatar ?? true;
            lotteryForm.allowRepeat.checked = settings.lottery?.allowRepeat ?? false;
            lotteryForm.deptLimit.checked = settings.lottery?.deptLimit ?? false;
            lotteryForm.positionLimit.checked = settings.lottery?.positionLimit ?? false;
        }

        // 更新主题设置
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === settings.theme);
        });

        // 更新系统设置
        const systemForm = document.getElementById('systemSettingsForm');
        if (systemForm) {
            systemForm.bgmVolume.value = settings.system?.bgmVolume ?? 50;
            systemForm.effectVolume.value = settings.system?.effectVolume ?? 80;
            systemForm.effectIntensity.value = settings.system?.effectIntensity ?? 7;
        }

        // 更新范围输入值显示
        document.querySelectorAll('.range-input').forEach(container => {
            const input = container.querySelector('input[type="range"]');
            const display = container.querySelector('.range-value');
            if (input && display) {
                display.textContent = input.name.includes('Volume') ? 
                    `${input.value}%` : input.value;
            }
        });
    }

    // 绑定事件
    function bindEvents() {
        // 抽奖设置表单
        const lotteryForm = document.getElementById('lotterySettingsForm');
        if (lotteryForm) {
            lotteryForm.addEventListener('change', handleLotterySettingsChange);
        }

        // 主题选择
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                settings.theme = option.dataset.theme;
                document.body.className = `theme-${settings.theme}`;
                updateUI();
            });
        });

        // 系统设置表单
        const systemForm = document.getElementById('systemSettingsForm');
        if (systemForm) {
            systemForm.addEventListener('input', handleSystemSettingsChange);
        }
    }

    // 组件接口
    const component = {
        async save() {
            try {
                await store.updateSettings(settings);
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
    bindEvents();
    
    return component;
}

// 添加这些处理函数
function handleLotterySettingsChange(e) {
    const target = e.target;
    if (!settings.lottery) {
        settings.lottery = {};
    }
    
    if (target.type === 'checkbox') {
        settings.lottery[target.name] = target.checked;
    } else if (target.type === 'range') {
        settings.lottery[target.name] = parseInt(target.value);
        const display = target.parentElement.querySelector('.range-value');
        if (display) {
            display.textContent = target.value;
        }
    }
}

function handleSystemSettingsChange(e) {
    const target = e.target;
    if (!settings.system) {
        settings.system = {};
    }
    
    if (target.type === 'range') {
        settings.system[target.name] = parseInt(target.value);
        const display = target.parentElement.querySelector('.range-value');
        if (display) {
            display.textContent = target.name.includes('Volume') ? 
                `${target.value}%` : target.value;
        }
    }
} 