
/* =========================================
   KODK - SANDBOXELS BUTTONS
   MULTI-PIXEL EDITION
   ========================================= */

// =========================================
// CONFIGURATION
// =========================================

const kodButtonRegistry = new Map();

// Directions électriques
const kodDirectionsDiagonal = [
    [0,-1], [0,1],
    [-1,0], [1,0],
    [-1,-1], [1,-1],
    [-1,1], [1,1]
];

const kodDirectionsStraight = [
    [0,-1], [0,1],
    [-1,0], [1,0]
];

// =========================================
// OUTILS
// =========================================

function kodIsValidPixel(pixel) {
    return pixel &&
        pixelMap[pixel.x]?.[pixel.y] === pixel;
}

function kodIsButton(pixel) {
    return pixel &&
        (
            pixel.element === "e_button" ||
            pixel.element === "push_button"
        );
}

// =========================================
// DETECTION DES BLOCS
// =========================================

// Récupère tous les pixels connectés du même bouton
function kodGetButtonGroup(startPixel) {

    if (!kodIsValidPixel(startPixel)) return [];

    const element = startPixel.element;

    const visited = new Set();
    const result = [];

    const queue = [startPixel];

    while (queue.length > 0) {

        const pixel = queue.shift();

        const key = `${pixel.x},${pixel.y}`;

        if (visited.has(key)) continue;

        visited.add(key);

        if (!kodIsValidPixel(pixel)) continue;

        if (pixel.element !== element) continue;

        result.push(pixel);

        // Connexion horizontale et verticale
        const directions = kodDirectionsStraight;

        for (const [dx, dy] of directions) {

            const neighbor =
                pixelMap[pixel.x + dx]?.[pixel.y + dy];

            if (
                neighbor &&
                neighbor.element === element
            ) {
                queue.push(neighbor);
            }
        }
    }

    return result;
}

// =========================================
// REGISTRE DES BOUTONS
// =========================================

function kodRegisterButtons() {

    kodButtonRegistry.clear();

    for (const pixel of currentPixels) {

        if (!kodIsButton(pixel)) continue;

        kodButtonRegistry.set(
            `${pixel.x},${pixel.y}`,
            pixel
        );
    }
}

// =========================================
// TRANSMISSION ELECTRIQUE
// =========================================

function kodSendElectricity(pixel, diagonal = true) {

    if (!kodIsValidPixel(pixel)) return;

    const directions = diagonal
        ? kodDirectionsDiagonal
        : kodDirectionsStraight;

    for (const [dx, dy] of directions) {

        const x = pixel.x + dx;
        const y = pixel.y + dy;

        const neighbor = pixelMap[x]?.[y];

        if (!neighbor) continue;

        const conductivity =
            elements[neighbor.element]?.conduct;

        if (
            conductivity === undefined ||
            conductivity <= 0
        ) continue;

        if (typeof chargePixel === "function") {
            chargePixel(neighbor, 1);
        }
    }
}

// =========================================
// E-BUTTON
// =========================================

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

    desc: "Clic gauche : impulsion électrique.",

    tick(pixel) {

        kodButtonRegistry.set(
            `${pixel.x},${pixel.y}`,
            pixel
        );
    }
};

// =========================================
// PUSH BUTTON
// =========================================

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

    desc: "Clic gauche : ON / OFF.",

    tick(pixel) {

        kodButtonRegistry.set(
            `${pixel.x},${pixel.y}`,
            pixel
        );

        if (pixel.on === true) {

            kodSendElectricity(pixel, false);

        }
    }
};

// =========================================
// COORDONNEES SOURIS
// =========================================

function kodGetMousePixel(event) {

    const canvas = event.target;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(
        (event.clientX - rect.left) *
        scaleX / pixelSize
    );

    const y = Math.floor(
        (event.clientY - rect.top) *
        scaleY / pixelSize
    );

    return { x, y };
}

// =========================================
// GESTIONNAIRE SOURIS
// =========================================

if (window.kodButtonMouseHandler) {

    document.removeEventListener(
        "mousedown",
        window.kodButtonMouseHandler,
        true
    );
}

window.kodButtonMouseHandler = function(event) {

    if (event.button !== 0) return;

    if (
        !event.target ||
        event.target.tagName !== "CANVAS"
    ) return;

    const coords = kodGetMousePixel(event);

    if (!coords) return;

    const x = coords.x;
    const y = coords.y;

    const pixel = pixelMap[x]?.[y];

    if (!kodIsButton(pixel)) return;

    if (!kodIsValidPixel(pixel)) return;

    // =====================================
    // E-BUTTON
    // =====================================

    if (pixel.element === "e_button") {

        console.log("KODK: E-BUTTON ACTIVATED");

        kodSendElectricity(pixel, true);
    }

    // =====================================
    // PUSH BUTTON MULTI-PIXELS
    // =====================================

    else if (pixel.element === "push_button") {

        // Trouver tout le bloc
        const group = kodGetButtonGroup(pixel);

        if (group.length === 0) return;

        // Inverser l'état global
        const newState = !group.some(p => p.on === true);

        // Synchroniser tous les pixels
        for (const p of group) {

            p.on = newState;
        }

        console.log(
            "KODK: PUSH BUTTON",
            newState ? "ON" : "OFF",
            "SIZE:",
            group.length,
            "PIXELS"
        );

        // Impulsion immédiate à l'activation
        if (newState) {

            for (const p of group) {

                kodSendElectricity(p, false);
            }
        }
    }
};

// =========================================
// INSTALLATION
// =========================================

document.addEventListener(
    "mousedown",
    window.kodButtonMouseHandler,
    true
);

// =========================================
// INITIALISATION
// =========================================

kodRegisterButtons();

console.log(
    "KODK BUTTONS : MULTI-PIXEL SYSTEM LOADED!"
);
