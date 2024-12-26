import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export function initLotterySphere() {
    let scene, camera, renderer, sphere, controls;
    let nameParticles = [];
    let rotationSpeed = 0.005;
    let isSpinning = false;
    
    // 初始化Three.js场景
    function initScene() {
        // 创建场景
        scene = new THREE.Scene();
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        
        // 创建渲染器
        const canvas = document.getElementById('lotterySphere');
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 添加环境光和点光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x2C7EF8, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        // 初始化控制器
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
    }
    
    // 创建球体
    function createSphere(participants) {
        // 创建球体几何体
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2C7EF8,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        
        // 加载字体
        const fontLoader = new FontLoader();
        fontLoader.load('assets/fonts/helvetiker_regular.typeface.json', function(font) {
            // 为每个参与者创建文字
            participants.forEach((participant, index) => {
                const textGeometry = new TextGeometry(participant.name, {
                    font: font,
                    size: 0.1,
                    height: 0.02
                });
                
                const textMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff
                });
                
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                
                // 计算球面位置
                const phi = Math.acos(-1 + (2 * index) / participants.length);
                const theta = Math.sqrt(participants.length * Math.PI) * phi;
                
                textMesh.position.setFromSphericalCoords(2, phi, theta);
                textMesh.lookAt(0, 0, 0);
                
                nameParticles.push({
                    mesh: textMesh,
                    originalPosition: textMesh.position.clone(),
                    participant: participant
                });
                
                scene.add(textMesh);
            });
        });
    }
    
    // 更新球体旋转
    function updateSphere() {
        if (!sphere) return;
        
        if (isSpinning) {
            sphere.rotation.y += rotationSpeed;
            nameParticles.forEach(particle => {
                particle.mesh.rotation.y += rotationSpeed;
            });
        }
        
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(updateSphere);
    }
    
    // 开始旋转
    function startSpin() {
        isSpinning = true;
        rotationSpeed = 0.05;
        controls.enabled = false;
        
        // 加速动画
        const accelerate = () => {
            if (rotationSpeed < 0.2) {
                rotationSpeed += 0.01;
                setTimeout(accelerate, 100);
            }
        };
        accelerate();
    }
    
    // 停止旋转
    function stopSpin() {
        // 减速动画
        const decelerate = () => {
            if (rotationSpeed > 0.001) {
                rotationSpeed *= 0.95;
                setTimeout(decelerate, 100);
            } else {
                isSpinning = false;
                rotationSpeed = 0;
                controls.enabled = true;
                selectWinner();
            }
        };
        decelerate();
    }
    
    // 选择中奖者
    function selectWinner() {
        // 获取当前朝向摄像机的参与者
        let winner = null;
        let maxVisibility = -1;
        
        nameParticles.forEach(particle => {
            const visibility = getVisibility(particle.mesh);
            if (visibility > maxVisibility) {
                maxVisibility = visibility;
                winner = particle;
            }
        });
        
        if (winner) {
            highlightWinner(winner);
            // 触发中奖事件
            window.dispatchEvent(new CustomEvent('winner-selected', {
                detail: winner.participant
            }));
        }
    }
    
    // 计算元素可见度
    function getVisibility(mesh) {
        const direction = new THREE.Vector3();
        mesh.getWorldPosition(direction);
        direction.sub(camera.position).normalize();
        return -direction.z; // 朝向摄像机的程度
    }
    
    // 高亮显示中奖者
    function highlightWinner(winner) {
        // 其他参与者淡出
        nameParticles.forEach(particle => {
            if (particle !== winner) {
                new THREE.Tween(particle.mesh.material)
                    .to({ opacity: 0.2 }, 1000)
                    .start();
            }
        });
        
        // 中奖者放大并高亮
        new THREE.Tween(winner.mesh.scale)
            .to({ x: 2, y: 2, z: 2 }, 1000)
            .start();
        
        winner.mesh.material.color.setHex(0xFFD700);
    }
    
    // 重置球体状态
    function resetSphere() {
        nameParticles.forEach(particle => {
            particle.mesh.scale.set(1, 1, 1);
            particle.mesh.material.opacity = 1;
            particle.mesh.material.color.setHex(0xffffff);
        });
    }
    
    // 窗口大小改变时更新渲染器
    function onWindowResize() {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    // 事件监听
    window.addEventListener('lottery-start', startSpin);
    window.addEventListener('lottery-stop', stopSpin);
    window.addEventListener('lottery-reset', resetSphere);
    window.addEventListener('resize', onWindowResize);
    
    // 初始化
    initScene();
    
    // 加载测试数据
    const testParticipants = [
        { name: '张三', department: '技术部', number: '001' },
        { name: '李四', department: '市场部', number: '002' },
        // ... 更多测试数据
    ];
    
    createSphere(testParticipants);
    updateSphere();
    
    // 返回控制接口
    return {
        setParticipants: (participants) => {
            // 清除现有名字
            nameParticles.forEach(particle => {
                scene.remove(particle.mesh);
            });
            nameParticles = [];
            
            // 创建新的球体
            createSphere(participants);
        },
        setRotationSpeed: (speed) => {
            rotationSpeed = speed;
        },
        resetView: () => {
            camera.position.set(0, 0, 5);
            controls.reset();
        }
    };
} 