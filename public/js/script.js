   // Game elements
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('score');
        const levelDisplay = document.getElementById('level');
        const highScoreDisplay = document.getElementById('high-score');
        const finalScoreDisplay = document.getElementById('final-score');
        const finalHighScoreDisplay = document.getElementById('final-high-score');
        const levelUpIndicator = document.getElementById('level-up');
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        // Game variables
        let player = { x: 400, y: 300, radius: 20 };
        let orbs = [];
        let enemies = [];
        let score = 0;
        let level = 1;
        let highScore = 0;
        let gameRunning = false;
        let orbsCollectedThisLevel = 0;
        let animationId;
        
        // Initialize game
        function init() {
            // Load high score from cookie
            highScore = getCookie('highScore') || 0;
            highScoreDisplay.textContent = highScore;
            
            // Reset game state
            score = 0;
            level = 1;
            orbsCollectedThisLevel = 0;
            scoreDisplay.textContent = score;
            levelDisplay.textContent = level;
            
            // Clear game objects
            orbs = [];
            enemies = [];
            
            // Create initial orbs
            for (let i = 0; i < 10; i++) {
                createOrb();
            }
            
            // Create initial enemies
            for (let i = 0; i < 3; i++) {
                createEnemy();
            }
            
            // Position player in center
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
        }
        
        // Create a new orb
        function createOrb() {
            const colors = ['#00f2fe', '#4facfe', '#00ff9d', '#ffcc00'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            orbs.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: Math.random() * (canvas.height - 40) + 20,
                radius: 8 + Math.random() * 4,
                color: color
            });
        }
        
        // Create a new enemy
        function createEnemy() {
            // Randomly position enemy on the edge
            let x, y;
            const side = Math.floor(Math.random() * 4);
            
            if (side === 0) { // Top
                x = Math.random() * canvas.width;
                y = -30;
            } else if (side === 1) { // Right
                x = canvas.width + 30;
                y = Math.random() * canvas.height;
            } else if (side === 2) { // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 30;
            } else { // Left
                x = -30;
                y = Math.random() * canvas.height;
            }
            
            enemies.push({
                x: x,
                y: y,
                radius: 15 + Math.random() * 10,
                speed: 1 + (level * 0.3),
                color: '#e94560',
                angle: Math.atan2(player.y - y, player.x - x)
            });
        }
        
        // Update game state
        function update() {
            // Move enemies towards player
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                
                // Update angle to follow player
                enemy.angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                
                // Move enemy
                enemy.x += Math.cos(enemy.angle) * enemy.speed;
                enemy.y += Math.sin(enemy.angle) * enemy.speed;
                
                // Check collision with player
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < player.radius + enemy.radius) {
                    gameOver();
                    return;
                }
            }
            
            // Check collision with orbs
            for (let i = orbs.length - 1; i >= 0; i--) {
                const orb = orbs[i];
                const dx = player.x - orb.x;
                const dy = player.y - orb.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < player.radius + orb.radius) {
                    // Collect orb
                    orbs.splice(i, 1);
                    createOrb();
                    score += 10;
                    orbsCollectedThisLevel++;
                    scoreDisplay.textContent = score;
                    
                    // Play collection sound
                    playCollectSound();
                    
                    // Check level completion
                    if (orbsCollectedThisLevel >= 20) {
                        levelUp();
                    }
                }
            }
            
            // Add new enemies occasionally
            if (Math.random() < 0.02) {
                createEnemy();
            }
        }
        
        // Draw game objects
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid background
            drawGrid();
            
            // Draw orbs
            for (const orb of orbs) {
                drawOrb(orb);
            }
            
            // Draw enemies
            for (const enemy of enemies) {
                drawEnemy(enemy);
            }
            
            // Draw player
            drawPlayer();
        }
        
        // Draw grid background
        function drawGrid() {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Draw an orb
        function drawOrb(orb) {
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fillStyle = orb.color;
            ctx.fill();
            
            // Add glow effect
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius * 1.5, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                orb.x, orb.y, orb.radius,
                orb.x, orb.y, orb.radius * 1.5
            );
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // Draw an enemy
        function drawEnemy(enemy) {
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fillStyle = enemy.color;
            ctx.fill();
            
            // Add glow effect
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius * 1.5, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                enemy.x, enemy.y, enemy.radius,
                enemy.x, enemy.y, enemy.radius * 1.5
            );
            gradient.addColorStop(0, enemy.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw eyes for the enemy
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(enemy.x - enemy.radius/2, enemy.y - enemy.radius/3, enemy.radius/4, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.radius/2, enemy.y - enemy.radius/3, enemy.radius/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw pupils
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(enemy.x - enemy.radius/2, enemy.y - enemy.radius/3, enemy.radius/8, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.radius/2, enemy.y - enemy.radius/3, enemy.radius/8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw the player
        function drawPlayer() {
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                player.x, player.y, 0,
                player.x, player.y, player.radius
            );
            gradient.addColorStop(0, '#4facfe');
            gradient.addColorStop(1, '#00f2fe');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Add glow effect
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius * 2, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
                player.x, player.y, player.radius,
                player.x, player.y, player.radius * 2
            );
            glowGradient.addColorStop(0, 'rgba(0, 242, 254, 0.5)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fill();
        }
        
        // Level up
        function levelUp() {
            level++;
            levelDisplay.textContent = level;
            orbsCollectedThisLevel = 0;
            
            // Show level up indicator
            levelUpIndicator.style.opacity = '1';
            setTimeout(() => {
                levelUpIndicator.style.opacity = '0';
            }, 2000);
            
            // Play level up sound
            playLevelUpSound();
            
            // Increase difficulty
            for (let i = 0; i < 2; i++) {
                createEnemy();
            }
        }
        
        // Game over
        function gameOver() {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                setCookie('highScore', highScore, 365);
                highScoreDisplay.textContent = highScore;
            }
            
            // Update game over screen
            finalScoreDisplay.textContent = score;
            finalHighScoreDisplay.textContent = highScore;
            
            // Show game over screen
            gameOverScreen.style.display = 'flex';
            
            // Play game over sound
            playGameOverSound();
        }
        
        // Game loop
        function gameLoop() {
            if (gameRunning) {
                update();
                draw();
                animationId = requestAnimationFrame(gameLoop);
            }
        }
        
        // Handle mouse movement
        canvas.addEventListener('mousemove', (e) => {
            if (!gameRunning) return;
            
            const rect = canvas.getBoundingClientRect();
            player.x = e.clientX - rect.left;
            player.y = e.clientY - rect.top;
        });
        
        // Cookie functions
        function setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/";
        }
        
        function getCookie(name) {
            const cookieName = name + "=";
            const decodedCookie = decodeURIComponent(document.cookie);
            const cookieArray = decodedCookie.split(';');
            
            for (let i = 0; i < cookieArray.length; i++) {
                let cookie = cookieArray[i];
                while (cookie.charAt(0) === ' ') {
                    cookie = cookie.substring(1);
                }
                if (cookie.indexOf(cookieName) === 0) {
                    return parseInt(cookie.substring(cookieName.length, cookie.length));
                }
            }
            return 0;
        }
        
        // Sound effects
        function playCollectSound() {
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYyQlZmdn6Kkp6mrrK2vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/";
            audio.volume = 0.3;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
        
        function playLevelUpSound() {
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYyQlZmdn6Kkp6mrrK2vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/";
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
        
        function playGameOverSound() {
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYyQlZmdn6Kkp6mrrK2vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/";
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Start button event
        startBtn.addEventListener('click', () => {
            startScreen.style.display = 'none';
            gameRunning = true;
            init();
            gameLoop();
        });
        
        // Restart button event
        restartBtn.addEventListener('click', () => {
            gameOverScreen.style.display = 'none';
            gameRunning = true;
            init();
            gameLoop();
        });
        
        // Initialize the game on load
        window.addEventListener('load', () => {
            highScore = getCookie('highScore') || 0;
            highScoreDisplay.textContent = highScore;
        });