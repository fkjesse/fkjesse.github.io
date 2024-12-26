document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorDisplay = document.querySelector('.form-error');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const remember = formData.get('remember') === 'on';
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    remember
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 保存token
                localStorage.setItem('admin_token', result.token);
                
                // 如果选择记住登录，设置过期时间
                if (remember) {
                    const expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 7);
                    localStorage.setItem('token_expire', expireDate.toISOString());
                }
                
                // 跳转到管理页面
                window.location.href = '/admin';
            } else {
                errorDisplay.style.display = 'block';
                errorDisplay.textContent = result.message || '用户名或密码错误';
            }
        } catch (error) {
            console.error('Login failed:', error);
            errorDisplay.style.display = 'block';
            errorDisplay.textContent = '登录失败，请重试';
        }
    });
}); 