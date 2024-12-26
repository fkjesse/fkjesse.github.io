export function initAudio() {
    const bgMusic = new Audio('assets/sounds/background.mp3');
    const winSound = new Audio('assets/sounds/win.mp3');
    const clickSound = new Audio('assets/sounds/click.mp3');
    
    let isBgMusicPlaying = false;
    
    // 背景音乐控制
    const bgmControl = document.getElementById('bgmControl');
    bgmControl.addEventListener('click', toggleBgMusic);
    
    function toggleBgMusic() {
        if (isBgMusicPlaying) {
            bgMusic.pause();
            bgmControl.classList.remove('active');
        } else {
            bgMusic.play();
            bgmControl.classList.add('active');
        }
        isBgMusicPlaying = !isBgMusicPlaying;
    }
    
    // 播放中奖音效
    function playWinSound() {
        winSound.play();
    }
    
    // 播放点击音效
    function playClickSound() {
        clickSound.play();
    }
    
    // 导出音频控制方法
    return {
        playWinSound,
        playClickSound,
        toggleBgMusic
    };
} 