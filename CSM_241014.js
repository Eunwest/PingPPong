const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = 800;
canvas.height = 600;

// 패들 설정
const paddleWidth = 10;
const paddleHeight = 100;
const playerPaddle = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0, color: 'blue' };
const aiPaddle = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 4, color: 'red' };

// 공 설정
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 4, dy: 4 };

// 장애물 설정 (초기 상태는 없음)
let obstacle = null;

// 게임 상태 변수
let score = 0;
let gameOver = false;
let level = 1;
let gameStarted = false;

// 관리자 메뉴 상태
let adminMenuOpen = false;

// 키 입력 처리
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        playerPaddle.dy = -6;
    } else if (event.key === 'ArrowDown') {
        playerPaddle.dy = 6;
    }

    // 게임 시작
    if (event.key === 'Enter' && !gameStarted) {
        startGame();
    }

    // 게임 오버 후 재시작
    if (event.key === 'Enter' && gameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        playerPaddle.dy = 0;
    }
});

// 게임 시작 함수
function startGame() {
    document.getElementById('gameMessage').style.display = 'none';
    gameStarted = true;
    gameOver = false;
    gameLoop();
}

// 게임 업데이트 로직
function update() {
    if (gameOver) return;

    // 플레이어 패들 이동
    playerPaddle.y += playerPaddle.dy;
    playerPaddle.y = Math.max(Math.min(playerPaddle.y, canvas.height - paddleHeight), 0);

    // AI 패들 이동
    if (ball.y < aiPaddle.y + paddleHeight / 2) {
        aiPaddle.y -= aiPaddle.dy;
    } else {
        aiPaddle.y += aiPaddle.dy;
    }

    aiPaddle.y = Math.max(Math.min(aiPaddle.y, canvas.height - paddleHeight), 0);

    // 공 이동
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 상하 벽에 공이 부딪힐 경우
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
    }

    // 패들에 공이 부딪힐 경우
    if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
        ball.dx *= -1;
        score++;  // 점수 증가
        checkLevelUp();
    }

    if (ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
        ball.dx *= -1;
    }

    // 공이 왼쪽 벽에 부딪힐 경우 - 게임 오버
    if (ball.x - ball.radius < 0) {
        endGame();
    }

    // 공이 오른쪽 벽에 부딪힐 경우 - 점수 증가
    if (ball.x + ball.radius > canvas.width) {
        resetBall();
    }

    // 장애물이 있으면 장애물 이동
    if (obstacle) {
        obstacle.y += obstacle.dy;
        if (obstacle.y + obstacle.height > canvas.height || obstacle.y < 0) {
            obstacle.dy *= -1;  // 벽에 부딪히면 반대 방향으로 이동
        }

        // 공과 장애물 충돌
        if (ball.x + ball.radius > obstacle.x &&
            ball.x - ball.radius < obstacle.x + obstacle.width &&
            ball.y + ball.radius > obstacle.y &&
            ball.y - ball.radius < obstacle.height + obstacle.y) {
            ball.dx *= -1;  // 공이 장애물에 부딪히면 방향 변경
        }
    }
}

// 레벨업 조건 체크
function checkLevelUp() {
    if (score === 5 && level === 1) {
        setLevel(2);  // 5점에서 레벨 2로
    } else if (score === 10 && level === 2) {
        setLevel(3);  // 10점에서 레벨 3으로
    }
}

// 공 초기화
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);  // 랜덤하게 공의 방향을 설정
    ball.dy = 4;
}

// 게임 종료 함수
function endGame() {
    gameOver = true;
    document.getElementById('gameMessage').style.display = 'block';
    document.getElementById('gameMessage').innerHTML = '<h1>Game Over! Press Enter to Restart</h1>';
}

// 게임 루프
function gameLoop() {
    update();
    draw();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);  // 게임이 종료되지 않았다면 루프를 계속
    }
}

// 게임 그리기 함수
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 패들
    context.fillStyle = playerPaddle.color;
    context.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

    // AI 패들
    context.fillStyle = aiPaddle.color;
    context.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);

    // 공 그리기
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = '#fff';
    context.fill();
    context.closePath();

    // 장애물 그리기
    if (obstacle) {
        context.fillStyle = obstacle.color;
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // 점수 표시
    context.font = '20px Arial';
    context.fillStyle = '#fff';
    context.fillText(`Score: ${score}`, 20, 30);

    // 레벨 표시 (우측 상단)
    context.fillText(`Level: ${level}`, canvas.width - 100, 30);
}

// 게임 재시작 함수
function restartGame() {
    // 모든 상태 초기화
    score = 0;
    level = 1;
    gameOver = false;
    obstacle = null;  // 장애물 제거
    resetBall();
    gameStarted = true;
    document.getElementById('gameMessage').style.display = 'none';  // 메시지 숨김
    gameLoop();  // 게임 다시 시작
}

// 관리자 메뉴 열기/닫기 함수
function toggleAdminMenu() {
    const adminMenu = document.getElementById('adminMenu');
    const adminButton = document.getElementById('adminButton');

    // 관리자 메뉴가 열려 있으면 숨기고, 닫혀 있으면 표시
    if (adminMenu.style.display === 'none' || adminMenu.style.display === '') {
        adminMenu.style.display = 'block';
        adminButton.innerText = 'Close Admin Menu';  // 버튼 텍스트 변경
    } else {
        adminMenu.style.display = 'none';
        adminButton.innerText = 'Admin Menu';  // 버튼 텍스트를 다시 'Admin Menu'로 변경
    }
}

// 레벨 변경 버튼 토글
function toggleLevelControls() {
    const controls = document.getElementById('levelControls');
    controls.style.display = controls.style.display === 'none' || controls.style.display === '' ? 'block' : 'none';
}

// 플레이어 색 변경 버튼 토글
function toggleColorControls() {
    const controls = document.getElementById('colorControls');
    controls.style.display = controls.style.display === 'none' || controls.style.display === '' ? 'block' : 'none';
}

// 장애물 속도 제어 버튼 토글
function toggleObstacleSpeedControls() {
    const controls = document.getElementById('obstacleSpeedControls');
    controls.style.display = controls.style.display === 'none' || controls.style.display === '' ? 'block' : 'none';
}

// 공 속도 제어 버튼 토글
function toggleBallSpeedControls() {
    const controls = document.getElementById('ballSpeedControls');
    controls.style.display = controls.style.display === 'none' || controls.style.display === '' ? 'block' : 'none';
}

// 레벨 설정 함수
function setLevel(newLevel) {
    level = newLevel;

    // 레벨에 따라 공 속도와 장애물 상태를 업데이트
    if (level === 1) {
        ball.dx = 4;
        ball.dy = 4;
        obstacle = null;  // 레벨 1에서는 장애물 없음
    } else if (level === 2) {
        ball.dx = 4;
        ball.dy = 4;
        createObstacle();  // 레벨 2에서 장애물 생성
        obstacle.dy = 2;  // 기본 장애물 속도 설정
    } else if (level === 3) {
        ball.dx = 6;  // 레벨 3에서 공의 속도를 높임
        ball.dy = 6;
        if (!obstacle) {
            createObstacle();  // 장애물이 없으면 생성
        }
        obstacle.dy = 3;  // 장애물 속도 증가
    }

    // 레벨 변경 후 즉시 우측 상단에 표시
    draw();  // 화면을 즉시 다시 그려서 레벨 표시
    alert(`Changed to Level ${newLevel}`);
}

// 장애물 생성 함수
function createObstacle() {
    obstacle = {
        x: canvas.width / 2 - 10,
        y: Math.random() * (canvas.height - 100),
        width: 20,
        height: 100,
        dy: 2,  // 기본 장애물의 이동 속도
        color: 'purple'
    };
}

// 플레이어 색상 변경 함수
function setPlayerColor(color) {
    playerPaddle.color = color;
}

// 장애물 속도 설정 함수
function setObstacleSpeed(speed) {
    if (obstacle) {
        obstacle.dy = speed;
    }
}

// 공 속도 설정 함수
function setBallSpeed(speed) {
    ball.dx = speed;
    ball.dy = speed;
}
