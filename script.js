document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-board');
  const ctx = canvas.getContext('2d');
  // const nextCanvas = document.getElementById('next-tetromino');
  // const nextCtx = nextCanvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');

  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  const EMPTY = 'white';

  let board = [];
  let currentTetromino;
  let nextTetromino;
  let score = 0;
  let level = 1;
  let dropStart = Date.now();
  let gameOver = false;
  let isPaused = false;

  // テトリミノの形状と色を定義
  const TETROMINOS = {
      'I': { color: 'cyan', shape: [[1, 1, 1, 1]] },
      'J': { color: 'blue', shape: [[1, 0, 0], [1, 1, 1]] },
      'L': { color: 'orange', shape: [[0, 0, 1], [1, 1, 1]] },
      'O': { color: 'yellow', shape: [[1, 1], [1, 1]] },
      'S': { color: 'green', shape: [[0, 1, 1], [1, 1, 0]] },
      'T': { color: 'purple', shape: [[0, 1, 0], [1, 1, 1]] },
      'Z': { color: 'red', shape: [[1, 1, 0], [0, 1, 1]] }
  };

  const tetrominoKeys = Object.keys(TETROMINOS);

  // 初期化
  function init() {
      for (let row = 0; row < ROWS; row++) {
          board[row] = [];
          for (let col = 0; col < COLS; col++) {
              board[row][col] = EMPTY;
          }
      }
      currentTetromino = randomTetromino();
      nextTetromino = randomTetromino();
      drawBoard();
      updateScore();
      updateLevel();
      updateNextTetromino();
  }

  // ランダムなテトリミノを生成
  function randomTetromino() {
      const key = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
      return {
          ...TETROMINOS[key],
          x: Math.floor(COLS / 2) - 1,
          y: 0
      };
  }

  // ゲームボードを描画
  function drawBoard() {
      for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
              drawBlock(col, row, board[row][col]);
          }
      }
  }

  // ブロックを描画
  function drawBlock(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  // テトリミノを描画
  function drawTetromino(tetromino) {
      tetromino.shape.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value) {
                  drawBlock(tetromino.x + x, tetromino.y + y, tetromino.color);
              }
          });
      });
  }

  // 衝突判定
  function collision(x, y, tetromino) {
      for (let row = 0; row < tetromino.shape.length; row++) {
          for (let col = 0; col < tetromino.shape[row].length; col++) {
              if (tetromino.shape[row][col]) {
                  const newX = tetromino.x + col + x;
                  const newY = tetromino.y + row + y;
                  if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX] !== EMPTY) {
                      return true;
                  }
              }
          }
      }
      return false;
  }

  // テトリミノの移動
  function moveTetromino(x, y) {
      if (!collision(x, y, currentTetromino)) {
          currentTetromino.x += x;
          currentTetromino.y += y;
          draw();
          return true;
      }
      return false;
  }

  // テトリミノの回転
  function rotateTetromino() {
      const rotatedShape = currentTetromino.shape[0].map((_, i) =>
          currentTetromino.shape.map(row => row[i]).reverse()
      );

      const originalShape = currentTetromino.shape;
      currentTetromino.shape = rotatedShape;

      if (collision(0, 0, currentTetromino)) {
          currentTetromino.shape = originalShape;
      } else {
          draw();
      }
  }

  // ゲーム描画の更新
  function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard();
      drawTetromino(currentTetromino);
  }

  // ゲーム開始
  function startGame() {
      if (!isPaused) {
          init();
          gameOver = false;
          score = 0;
          level = 1;
          dropStart = Date.now();
          drop();
      }
  }

  // ゲーム一時停止
  function pauseGame() {
      isPaused = !isPaused;
  }

  // スコアの更新
  function updateScore() {
      scoreElement.innerText = `Score: ${score}`;
  }

  // レベルの更新
  function updateLevel() {
      levelElement.innerText = `Level: ${level}`;
  }

  // 次のテトリミノの更新
  function updateNextTetromino() {
      // 描画コードを追加
      // nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      //   nextTetromino.shape.forEach((row, y) => {
      //       row.forEach((value, x) => {
      //           if (value) {
      //               drawBlock(nextCtx, x, y, nextTetromino.color);
      //           }
      //       });
      //   });
  }

  // ゲームオーバー
  function handleGameOver() {
      gameOver = true;
      alert('Game Over');
  }

  // テトリミノの固定とライン消去
  function lockTetromino() {
      currentTetromino.shape.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value) {
                  board[currentTetromino.y + y][currentTetromino.x + x] = currentTetromino.color;
              }
          });
      });

      for (let row = 0; row < ROWS; row++) {
          if (board[row].every(cell => cell !== EMPTY)) {
              board.splice(row, 1);
              board.unshift(new Array(COLS).fill(EMPTY));
              score += 10;
              updateScore();
          }
      }

      currentTetromino = nextTetromino;
      nextTetromino = randomTetromino();
      updateNextTetromino();

      if (collision(0, 0, currentTetromino)) {
          handleGameOver();
      }
  }

  // テトリミノの落下
  function drop() {
      if (!moveTetromino(0, 1)) {
          lockTetromino();
      }

      if (!gameOver && !isPaused) {
          setTimeout(drop, 1000 / level);
      }
  }

  // キーボード操作
  document.addEventListener('keydown', (event) => {
      if (!gameOver) {
          switch (event.key) {
              case 'ArrowLeft':
                  moveTetromino(-1, 0);
                  break;
              case 'ArrowRight':
                  moveTetromino(1, 0);
                  break;
              case 'ArrowDown':
                  moveTetromino(0, 1);
                  break;
              case 'ArrowUp':
                  rotateTetromino();
                  break;
              case ' ':
                  while (moveTetromino(0, 1)) {}
                  lockTetromino();
                  break;
              case 'p':
                  pauseGame();
                  break;
          }
      }
  });

  // ボタン操作
  startButton.addEventListener('click', startGame);
  pauseButton.addEventListener('click', pauseGame);
});