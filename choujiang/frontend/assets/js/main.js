// 导入其他模块
import { initLotterySphere } from './sphere.js';
import { initAudio } from './audio.js';
import { initEffects } from './effects.js';
import { initLottery } from './lottery.js';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个模块
    initLotterySphere();
    initAudio();
    initEffects();
    initLottery();
    
    // 绑定控制按钮事件
    bindControlEvents();
    
    // 加载组件
    loadComponents();
});

// 绑定控制按钮事件
function bindControlEvents() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const viewBtn = document.getElementById('viewBtn');
    
    startBtn.addEventListener('click', () => {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        // 触发开始抽奖事件
        window.dispatchEvent(new CustomEvent('lottery-start'));
    });
    
    stopBtn.addEventListener('click', () => {
        stopBtn.disabled = true;
        startBtn.disabled = false;
        // 触发停止抽奖事件
        window.dispatchEvent(new CustomEvent('lottery-stop'));
    });
    
    resetBtn.addEventListener('click', () => {
        // 触发重置抽奖事件
        window.dispatchEvent(new CustomEvent('lottery-reset'));
    });
    
    viewBtn.addEventListener('click', () => {
        // 触发视角切换事件
        window.dispatchEvent(new CustomEvent('view-toggle'));
    });
}

// 加载组件
async function loadComponents() {
    try {
        // 加载奖品列表组件
        const prizeSection = document.getElementById('prizeSection');
        const prizeResponse = await fetch('components/prize-list.html');
        prizeSection.innerHTML = await prizeResponse.text();
        
        // 加载抽奖球体组件
        const lotterySection = document.querySelector('.lottery-section');
        const sphereResponse = await fetch('components/lottery-sphere.html');
        lotterySection.innerHTML = await sphereResponse.text();
        
        // 加载信息面板组件
        const infoSection = document.querySelector('.info-section');
        const infoResponse = await fetch('components/info-panel.html');
        infoSection.innerHTML = await infoResponse.text();
    } catch (error) {
        console.error('Failed to load components:', error);
    }
} 