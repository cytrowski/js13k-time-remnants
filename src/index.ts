const canvas = document.getElementById("app") as HTMLCanvasElement;

canvas.style.zoom = "10";
// @ts-ignore
canvas.style.imageRendering = "pixelated";

const size = 50;
const cellSize = 1;
canvas.width = size;
canvas.height = size;

const ctx = canvas.getContext("2d");

ctx.fillRect(0, 0, size, size);

let state = {
  tick: 0,
  players: [[{ x: 0, y: 0 }]],
  enemies: []
};

const maxPos = size - cellSize;
const minPos = 0;
const spawnPoints = [
  { x: minPos, y: minPos },
  { x: minPos, y: maxPos },
  { x: maxPos, y: minPos },
  { x: maxPos, y: maxPos }
];
const spawnInterval = 5;
const lastSpawnTick = 0;
const getSpawnPoint = ((i = 0) => () => {
  i = (i + 1) % spawnPoints.length;
  return spawnPoints[i];
})();

const update = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  const [, ...players] = state.players;
  players.forEach(player => {
    if (player[state.tick] === undefined) {
      return;
    }
    const { x, y } = player[state.tick];
    ctx.fillStyle = "gray";
    ctx.fillRect(x, y, cellSize, cellSize);
  });

  const enemies = state.enemies;
  enemies.forEach(enemy => {
    if (enemy[state.tick] === undefined) {
      //console.log(enemy, state.tick);
      return;
    }
    const { x, y } = enemy[state.tick];
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, cellSize, cellSize);
  });

  ctx.fillStyle = "green";
  const player = state.players[0];
  let { x, y } = player[state.tick];
  ctx.fillRect(x, y, cellSize, cellSize);
};

document.body.addEventListener("keyup", event => {
  if (event.code === "KeyU" && state.tick > 0) {
    state.tick = state.tick - 1;
    // console.log(state);
    update();
    return;
  }

  if (state.tick < state.players[0].length - 1) {
    state.players = [
      //[...new Array(state.tick), state.players[0][state.tick]],
      state.players[0].slice(0, state.tick + 1),
      ...state.players
    ];
  }

  const tick = state.tick + 1;

  const d = { x: 0, y: 0 };
  switch (event.code) {
    case "KeyD":
      d.x = 1;
      break;
    case "KeyS":
      d.y = 1;
      break;
    case "KeyA":
      d.x = -1;
      break;
    case "KeyW":
      d.y = -1;
      break;
  }

  const { x, y } = state.players[0][state.tick];
  state.players[0][tick] = { x: x + d.x, y: y + d.y };
  const playerPos = state.players[0][tick];
  state.enemies.forEach(enemy => {
    // console.log(enemy, state.tick);
    if (!enemy[state.tick]) {
      return;
    }
    const currentPos = enemy[state.tick];
    const dx = currentPos.x - playerPos.x;
    const dy = currentPos.y - playerPos.y;

    const d =
      Math.abs(dx) >= Math.abs(dy)
        ? {
            x: -Math.sign(dx),
            y: 0
          }
        : {
            x: 0,
            y: -Math.sign(dy)
          };
    const posCandidate = {
      x: currentPos.x + d.x,
      y: currentPos.y + d.y
    };
    // Check if posCandidate is occupied
    if (
      state.enemies.some(e => {
        if (
          e[tick] &&
          e[tick].x === posCandidate.x &&
          e[tick].y === posCandidate.y
        ) {
          return true;
        }
        if (
          e[state.tick] &&
          e[state.tick].x === posCandidate.x &&
          e[state.tick].y === posCandidate.y
        ) {
          return true;
        }
        return false;
      })
    ) {
      enemy[tick] = currentPos;
    } else {
      enemy[tick] = posCandidate;
    }
  });

  if (lastSpawnTick < state.tick && state.tick % spawnInterval === 0) {
    // spawn enemy
    //console.log("spawn...", state.enemies);
    state.enemies = [
      [...new Array(state.tick + 1), getSpawnPoint()],
      ...state.enemies
    ];
    //console.log("spawned...", state.enemies);
  }

  state.tick = tick;
  update();
});
update();
