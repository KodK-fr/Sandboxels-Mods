/* ============================================================
   KODK SANDBOXELS BUNDLE v1.1
   Réunit : bougie_electrique, e_button, push_button,
            transformateur_ac_dc, aspirateur, gaz_convoye
   ============================================================ */

// =========================================
// 1. BOUGIE ÉLECTRIQUE
// =========================================

elements.bougie_electrique = {
    color: ["#555b66", "#aeb7c2", "#343a40"],
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,

    properties: {
        ignitionTimer: 0
    },

    tick: function(pixel) {
        if (!pixel.charge) {
            pixel.ignitionTimer = 0;
            return;
        }

        pixel.ignitionTimer = (pixel.ignitionTimer || 0) + 1;

        if (pixel.ignitionTimer < 2) return;
        pixel.ignitionTimer = 0;

        var positions = [
            [-1,-1], [0,-1], [1,-1],
            [-1, 0],         [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];

        positions.sort(function() {
            return Math.random() - 0.5;
        });

        for (var i = 0; i < positions.length; i++) {
            var x = pixel.x + positions[i][0];
            var y = pixel.y + positions[i][1];

            if (isEmpty(x, y)) {
                createPixel("fire", x, y);
                break;
            }
        }
    }
};

// =========================================
// 2. KODK BUTTONS (E-Button + Push Button)
// =========================================

const kodButtonRegistry = new Map();

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

function kodGetMousePixel(event) {
    const canvas = event.target;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(
        (event.clientX - rect.left) * scaleX / pixelSize
    );
    const y = Math.floor(
        (event.clientY - rect.top) * scaleY / pixelSize
    );

    return { x, y };
}

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

    if (pixel.element === "e_button") {
        kodSendElectricity(pixel, true);
    }

    else if (pixel.element === "push_button") {
        const group = kodGetButtonGroup(pixel);
        if (group.length === 0) return;

        const newState = !group.some(p => p.on === true);

        for (const p of group) {
            p.on = newState;
        }

        if (newState) {
            for (const p of group) {
                kodSendElectricity(p, false);
            }
        }
    }
};

document.addEventListener(
    "mousedown",
    window.kodButtonMouseHandler,
    true
);

kodRegisterButtons();

// =========================================
// 3. TRANSFORMATEUR AC/DC
// =========================================

elements.transformateur_ac_dc = {
    name: "Transformateur AC/DC",
    color: "#777f91",
    category: "machines",
    behavior: behaviors.WALL,
    state: "solid",
    conduct: 0,

    properties: {
        dcDirection: 0,
        dcLastInput: -9999,
        dcPixels: []
    },

    onShiftSelect: function() {
        promptDir(
            "Choisis la direction de SORTIE du courant continu :",
            function(direction) {
                elements.transformateur_ac_dc
                    .properties.dcDirection = direction;
            },
            "Direction du transformateur"
        );
    }
};

function dcTint(pixel, active) {
    if (pixel.dcOriginalColor === undefined) {
        pixel.dcOriginalColor = pixel.color;
    }

    if (!active) {
        pixel.color = pixel.dcOriginalColor;
        delete pixel.dcOriginalColor;
        return;
    }

    let c = pixel.dcOriginalColor;
    if (typeof c !== "string" || !c.startsWith("#")) return;

    let r = parseInt(c.slice(1,3),16);
    let g = parseInt(c.slice(3,5),16);
    let b = parseInt(c.slice(5,7),16);

    let amount = 0.13;

    r = Math.round(r + (255-r)*amount);
    g = Math.round(g + (235-g)*amount);
    b = Math.round(b + (70-b)*amount);

    pixel.color = "#" +
        [r,g,b].map(v =>
            v.toString(16).padStart(2,"0")
        ).join("");
}

const dcDirections = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

runEveryTick(function() {
    for (let t of currentPixels) {
        if (t.element !== "transformateur_ac_dc") continue;

        let direction = t.dcDirection ?? 0;
        let outDir = dcDirections[direction];
        let inDir = dcDirections[(direction + 2) % 4];

        let input = getPixel(
            t.x + inDir[0],
            t.y + inDir[1]
        );

        if (input && input.charge > 0) {
            t.dcLastInput = pixelTicks;
        }

        let active =
            pixelTicks - t.dcLastInput < 60;

        let output = getPixel(
            t.x + outDir[0],
            t.y + outDir[1]
        );

        let queue = [];
        let visited = new Set();
        let powered = [];

        let inputKey = input
            ? input.x + "," + input.y
            : null;

        if (
            active &&
            output &&
            elements[output.element] &&
            elements[output.element].conduct > 0
        ) {
            queue.push(output);
        }

        while (queue.length > 0) {
            let p = queue.shift();
            let key = p.x + "," + p.y;

            if (visited.has(key)) continue;
            if (key === inputKey) continue;

            visited.add(key);

            let def = elements[p.element];
            if (!def || !(def.conduct > 0)) continue;

            powered.push(p);

            let neighbors = [
                [p.x+1,p.y],
                [p.x-1,p.y],
                [p.x,p.y+1],
                [p.x,p.y-1]
            ];

            for (let pos of neighbors) {
                let n = getPixel(pos[0],pos[1]);
                if (!n || visited.has(n.x+","+n.y)) continue;

                let nd = elements[n.element];
                if (nd && nd.conduct > 0) {
                    queue.push(n);
                }
            }
        }

        let newSet = new Set(powered);

        for (let p of t.dcPixels || []) {
            if (!newSet.has(p)) {
                p.charge = 0;
                p.chargeCD = 0;
                dcTint(p, false);
                delete p.dcPowered;
            }
        }

        for (let p of powered) {
            p.charge = 1;
            p.chargeCD = 0;
            p.dcPowered = true;
            dcTint(p, true);
        }

        t.dcPixels = powered;
    }
});

// =========================================
// 4. ASPIRATEUR
// =========================================

elements.aspirateur = {
    color: "#778899",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    colorOn: "#35d9ff",

    properties: {
        suctionTimer: 0
    },

    tick: function(pixel) {
        if (!pixel.charge) return;

        pixel.suctionTimer = (pixel.suctionTimer || 0) + 1;

        if (pixel.suctionTimer < 3) return;
        pixel.suctionTimer = 0;

        var radius = 8;
        var gases = [];

        for (var dx = -radius; dx <= radius; dx++) {
            for (var dy = -radius; dy <= radius; dy++) {

                if (dx*dx + dy*dy > radius*radius) continue;
                if (dx === 0 && dy === 0) continue;

                var p = getPixel(pixel.x + dx, pixel.y + dy);
                if (!p || p.del) continue;

                var info = elements[p.element];

                if (info && info.state === "gas") {
                    gases.push(p);
                }
            }
        }

        if (gases.length > 0) {
            var target = gases[
                Math.floor(Math.random() * gases.length)
            ];

            deletePixel(target.x, target.y);
        }
    }
};

// =========================================
// 5. GAZ CONVOYÉ
// =========================================

// --- PIPELINE ---
elements.pipeline = {
    name: "Pipeline",
    color: "#555e6a",
    colorOn: "#7a99b0",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 0,
    hardness: 0.4,
    desc: "Conduit de gaz. Relier une entrée à une sortie via des pipelines pour transporter le gaz.",

    properties: {
        pressurized: false
    },

    tick: function(pixel) {
        if (pixel.pressurized) {
            pixel.color = "#7a99b0";
        } else {
            pixel.color = "#555e6a";
        }
    }
};

// --- ENTRÉE DE GAZ ---
elements.entree_gaz = {
    name: "Entrée de Gaz",
    color: "#33bb55",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 0,
    hardness: 0.4,
    desc: "Injecte du gaz dans les pipelines adjacents.",

    properties: {
        emitTimer: 0
    },

    tick: function(pixel) {
        pixel.emitTimer = (pixel.emitTimer || 0) + 1;
        if (pixel.emitTimer < 2) return;
        pixel.emitTimer = 0;

        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < dirs.length; i++) {
            var p = getPixel(pixel.x + dirs[i][0], pixel.y + dirs[i][1]);
            if (p && p.element === "pipeline") {
                p.pressurized = true;
            }
        }
    }
};

// --- SORTIE DE GAZ ---
elements.sortie_gaz = {
    name: "Sortie de Gaz",
    color: "#cc3333",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 0,
    hardness: 0.4,
    desc: "Libère le gaz dans l'espace adjacent si un pipeline pressurisé est connecté.",

    properties: {
        releaseTimer: 0
    },

    tick: function(pixel) {
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        var hasGas = false;

        for (var i = 0; i < dirs.length; i++) {
            var p = getPixel(pixel.x + dirs[i][0], pixel.y + dirs[i][1]);
            if (p && p.element === "pipeline" && p.pressurized) {
                hasGas = true;
                break;
            }
        }

        if (!hasGas) return;

        pixel.releaseTimer = (pixel.releaseTimer || 0) + 1;
        if (pixel.releaseTimer < 3) return;
        pixel.releaseTimer = 0;

        var emptySpots = [];
        for (var i = 0; i < dirs.length; i++) {
            var x = pixel.x + dirs[i][0];
            var y = pixel.y + dirs[i][1];
            if (isEmpty(x, y)) {
                emptySpots.push([x, y]);
            }
        }

        if (emptySpots.length > 0) {
            var spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            createPixel("gas", spot[0], spot[1]);
        }
    }
};

// --- PROPAGATION DE LA PRESSION ---
runEveryTick(function() {
    // Chaque pipeline pressurisé propage la pression à ses voisins
    // (1 pixel par tick = effet de vague visible)
    for (var p of currentPixels) {
        if (p.element !== "pipeline" || !p.pressurized) continue;

        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < dirs.length; i++) {
            var n = getPixel(p.x + dirs[i][0], p.y + dirs[i][1]);
            if (n && n.element === "pipeline" && !n.pressurized) {
                n.pressurized = true;
            }
        }
    }
});

// =========================================
// FIN DU BUNDLE
// =========================================

console.log("KODK BUNDLE : 6 MODS LOADED ✓");   
