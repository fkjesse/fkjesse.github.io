import { initAudio } from './audio.js';

export function initLottery() {
    let currentPrize = null;
    let participants = [];
    let winners = [];
    let isRunning = false;
    
    const audio = initAudio();
    
    // 初始化数据
    async function initData() {
        try {
            // 加载奖品数据
            const prizesResponse = await fetch('/data/prizes.json');
            const prizes = await prizesResponse.json();
            
            // 加载参与者数据
            const usersResponse = await fetch('/data/users.json');
            const users = await usersResponse.json();
            
            participants = users.filter(user => !winners.includes(user.number));
            updateUI();
            
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    // 更新界面显示
    function updateUI() {
        // 更新奖品信息
        if (currentPrize) {
            const prizeInfo = document.querySelector('.prize-info');
            prizeInfo.querySelector('.prize-name').textContent = currentPrize.name;
            prizeInfo.querySelector('.prize-count').textContent = `剩余：${currentPrize.remaining}个`;
            prizeInfo.querySelector('.progress').style.width = 
                `${((currentPrize.count - currentPrize.remaining) / currentPrize.count) * 100}%`;
        }
        
        // 更新中奖记录
        const recordsList = document.getElementById('recordsList');
        recordsList.innerHTML = winners.map(winner => `
            <div class="record-item">
                <img src="${winner.avatar || 'assets/images/default-avatar.png'}" alt="头像">
                <div class="winner-info">
                    <h4>${winner.name}</h4>
                    <p>${winner.department}</p>
                    <p>${winner.prize}</p>
                </div>
            </div>
        `).join('');
    }
    
    // 处理中奖结果
    function handleWinner(winner) {
        if (!currentPrize || !winner) return;
        
        // 播放中奖音效
        audio.playWinSound();
        
        // 更新中奖记录
        winners.unshift({
            ...winner,
            prize: currentPrize.name,
            timestamp: new Date()
        });
        
        // 更新剩余数量
        currentPrize.remaining--;
        
        // 从参与者列表中移除
        participants = participants.filter(p => p.number !== winner.number);
        
        // 显示中奖结果
        const winnerDisplay = document.getElementById('winnerDisplay');
        winnerDisplay.querySelector('.winner-avatar').src = winner.avatar || 'assets/images/default-avatar.png';
        winnerDisplay.querySelector('.winner-name').textContent = winner.name;
        winnerDisplay.querySelector('.winner-dept').textContent = winner.department;
        winnerDisplay.querySelector('.winner-number').textContent = winner.number;
        winnerDisplay.style.display = 'block';
        
        // 触发特效
        window.dispatchEvent(new CustomEvent('winner-effect'));
        
        // 更新界面
        updateUI();
        
        // 保存结果
        saveResults();
    }
    
    // 保存抽奖结果
    async function saveResults() {
        try {
            await fetch('/api/lottery/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    winners,
                    timestamp: new Date()
                })
            });
        } catch (error) {
            console.error('Failed to save results:', error);
        }
    }
    
    // 绑定控制事件
    function bindEvents() {
        // 开始抽奖
        window.addEventListener('lottery-start', () => {
            if (!currentPrize || currentPrize.remaining <= 0) {
                alert('请先选择有效奖项！');
                return;
            }
            isRunning = true;
            audio.playClickSound();
        });
        
        // 停止抽奖
        window.addEventListener('lottery-stop', () => {
            isRunning = false;
            audio.playClickSound();
        });
        
        // 中奖者选中事件
        window.addEventListener('winner-selected', (event) => {
            handleWinner(event.detail);
        });
        
        // 重置抽奖
        window.addEventListener('lottery-reset', () => {
            if (isRunning) return;
            document.getElementById('winnerDisplay').style.display = 'none';
            window.dispatchEvent(new CustomEvent('effect-reset'));
        });
    }
    
    // 初始化
    initData();
    bindEvents();
    
    // 返回控制接口
    return {
        setPrize: (prize) => {
            currentPrize = prize;
            updateUI();
        },
        getWinners: () => winners,
        getCurrentPrize: () => currentPrize,
        reset: () => {
            winners = [];
            initData();
        }
    };
} 