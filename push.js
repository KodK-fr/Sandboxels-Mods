const kodButtonRegistry = new Map();

function kodRegisterButtons() {
  kodButtonRegistry.clear();
  for (const pixel of currentPixels) {
    if (pixel && (pixel.element === "e_button" || pixel.element === "push_button")) {
      kodButtonRegistry.set(pixel.x + "," + pixel.y, pixel);
    }
  }
}

function kodSendElectricity(pixel, diagonal = true) {
  const directions = diagonal
    ? [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]
    : [[0, -1], [0, 1], [-1, 0], [1, 0]];

  for (const [dx, dy] of directions) {
    const x = pixel.x + dx;
    const y = pixel.y + dy;
    const neighbor = pixelMap[x]?.[y];
    if (!neighbor) continue;

    const definition = elements[neighbor.element];
    if (definition && (definition.conduct > 0 || definition.conductivity > 0)) {
      chargePixel(neighbor);
    }
  }
}

elements.e_button = {
  name: "E-Button",
  color: "#ff6600",
  colorOn: "#ffff00",
  behavior: behaviors.WALL,
  category: "machines",
  state: "solid",
  density: 1200,
  hardness: 0.2,
  conduct: 1,
  desc: "Clic gauche : envoie une impulsion électrique.",
  tick: function (pixel) {
    kodButtonRegistry.set(pixel.x + "," + pixel.y, pixel);
  }
};

elements.push_button = {
  name: "Push Button",
  color: "#4488ff",
  colorOn: "#ffcc00",
  behavior: behaviors.WALL,
  category: "machines",
  state: "solid",
  density: 1200,
  hardness: 0.2,
  conduct: 1,
  desc: "Clic gauche : active ou désactive le courant.",
  tick: function (pixel) {
    kodButtonRegistry.set(pixel.x + "," + pixel.y, pixel);
    if (pixel.on) {
      kodSendElectricity(pixel, false);
    }
  }
};

if (window.kodButtonMouseHandler) {
  document.removeEventListener("mousedown", window.kodButtonMouseHandler, true);
}

window.kodButtonMouseHandler = function (event) {
  if (event.button !== 0) return;
  if (!event.target || event.target.tagName !== "CANVAS") return;

  const x = Math.floor(mousePos.x);
  const y = Math.floor(mousePos.y);

  kodRegisterButtons();

  const key = x + "," + y;
  const pixel = kodButtonRegistry.get(key);
  if (!pixel) return;
  if (pixelMap[x]?.[y] !== pixel) return;

  if (pixel.element === "e_button") {
    kodSendElectricity(pixel, true);
  } else if (pixel.element === "push_button") {
    pixel.on = !pixel.on;
    if (pixel.on) {
      kodSendElectricity(pixel, false);
    }
  }
};

document.addEventListener("mousedown", window.kodButtonMouseHandler, true);
kodRegisterButtons();   
