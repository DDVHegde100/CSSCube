const resetBtn = document.querySelector('.reset');
const svg = document.querySelector("svg");
const groups = svg.querySelectorAll("g[id*=face]");
const faceNodes = Array.from(groups).map((f) => f.querySelectorAll(".cell"));
const density = Math.sqrt(faceNodes[0].length);
const lastIndex = density - 1;

function toRowCol(index) {
  const row = Math.floor(index / density);
  const col = index % density;

  return [row, col];
}

function toIndex(row, col) {
  return row * density + col;
}

function generateFaces() {
  return faceNodes.map((f, fi) =>
    Array.from(f).map((c, i) => {
      if ([0, 1, 2].includes(fi)) return 0;

      return Math.random() > 0.85 ? 1 : 0;
    })
  );
}

let faces = generateFaces();

const edgeFuncs = [
  // 0
  (row, col) => {
    if (col >= density) {
      return getCell(5, row, 0);
    } else if (col < 0) {
      return getCell(1, row, lastIndex);
    } else if (row >= density) {
      return getCell(2, 0, lastIndex - col);
    } else if (row < 0) {
      return getCell(3, 0, lastIndex - col);
    }
  },
  // 1
  (row, col) => {
    if (col >= density) {
      return getCell(0, row, 0);
    } else if (col < 0) {
      return getCell(4, row, lastIndex);
    } else if (row >= density) {
      return getCell(2, lastIndex - col, lastIndex);
    } else if (row < 0) {
      return getCell(3, lastIndex - col, lastIndex);
    }
  },
  // 2
  (row, col) => {
    if (col >= density) {
      return getCell(1, lastIndex, lastIndex - row);
    } else if (col < 0) {
      return getCell(5, lastIndex, row);
    } else if (row >= density) {
      return getCell(4, lastIndex, col);
    } else if (row < 0) {
      return getCell(0, lastIndex, lastIndex - col);
    }
  },
  // 3
  (row, col) => {
    if (col >= density) {
      return getCell(1, 0, lastIndex - row);
    } else if (col < 0) {
      return getCell(5, 0, row);
    } else if (row >= density) {
      return getCell(4, 0, col);
    } else if (row < 0) {
      return getCell(0, 0, lastIndex - col);
    }
  },
  // 4
  (row, col) => {
    if (col >= density) {
      return getCell(1, row, 0);
    } else if (col < 0) {
      return getCell(5, row, lastIndex);
    } else if (row >= density) {
      return getCell(2, lastIndex, col);
    } else if (row < 0) {
      return getCell(3, lastIndex, col);
    }
  },
  // 5
  (row, col) => {
    if (col >= density) {
      return getCell(4, row, 0);
    } else if (col < 0) {
      return getCell(0, row, lastIndex);
    } else if (row >= density) {
      return getCell(2, col, 0);
    } else if (row < 0) {
      return getCell(3, col, 0);
    }
  }
];

function getCell(faceIndex, row, col) {
  const getPossibleEdgeCell = edgeFuncs[faceIndex];
  const overflowRow = row >= density || row < 0;
  const overflowCol = col >= density || col < 0;

  if (overflowRow && overflowCol) {
    return 1;
  }

  return getPossibleEdgeCell(row, col) ?? faces[faceIndex][toIndex(row, col)];
}

function getCellNeighbors(faceIndex, cellIndex) {
  const face = faces[faceIndex];
  const [row, col] = toRowCol(cellIndex);

  return [
    getCell(faceIndex, row - 1, col - 1),
    getCell(faceIndex, row - 1, col),
    getCell(faceIndex, row - 1, col + 1),
    getCell(faceIndex, row, col - 1),
    getCell(faceIndex, row, col + 1),
    getCell(faceIndex, row + 1, col - 1),
    getCell(faceIndex, row + 1, col),
    getCell(faceIndex, row + 1, col + 1)
  ];
}

function nextCellState(cell, neighbors) {
  const liveNeighbors = neighbors.reduce((acc, curr) =>
    curr ? acc + curr : acc
  );

  // Game of Life
  if (!cell && liveNeighbors === 3) {
    return 1;
  } else if (cell && (liveNeighbors === 2 || liveNeighbors === 3)) {
    return 1;
  } else {
    return 0;
  }

  // Seeds
  return liveNeighbors === 2 ? 1 : 0;
}

function nextFaceState(cells, faceIndex) {
  const newState = [...cells];

  for (let [i, cell] of Object.entries(cells)) {
    const neighbors = getCellNeighbors(faceIndex, i);
    const newCellState = nextCellState(cell, neighbors);
    newState[i] = newCellState;
  }

  return newState;
}

function nextGameState() {
  faces = faces.map((face, i) => nextFaceState(face, i));
}

function render() {
  faces.forEach((face, faceIndex) => {
    face.forEach((cell, cellIndex) => {
      const node = faceNodes[faceIndex][cellIndex];
      const curr = parseInt(node.dataset.alive ?? 0);
      if (curr !== cell) {
        node.dataset.alive = cell ? "1" : "0";
      }
    });
  });
}

setInterval(() => {
  requestAnimationFrame(() => {
    nextGameState();
    render();
  });
}, 124);

render();

resetBtn.addEventListener('click', e => {
  faces = generateFaces();
})