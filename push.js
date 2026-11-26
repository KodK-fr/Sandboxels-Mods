
/* =========================================
   KODK - SANDBOXELS BUTTONS
   Détection personnalisée de la souris
   ========================================= */

// Registre des boutons : coordonnées X,Y
const kodButtonRegistry = new Map();

// Enregistrement des boutons présents
function kodRegisterButtons() {
    kodButtonRegistry.clear();

    for (const pixel of currentPixels) {
        if (
            pixel &&
            (pixel.element === "e_button" ||
             pixel.element === "push_button")
        ) {
            kodButtonRegistry.set(
                pixel.x + "," + pixel.y,
                pixel
            );
        }
    }
}

// Envoyer du courant aux voisins
function kodSendElectricity(pixel, diagonal = true) {
    const directions = diagonal
        ? [
            [0,-1], [0,1], [-1,0], [1,0],
            [-1,-1], [1,-1], [-1,1], [1,1]
        ]
        : [
            [0,-1], [0,1], [-1,0], [1,0]
        ];

    for (const [dx, dy] of directions) {
        const x = pixel.x + dx;
        const y = pixel.y + dy;

        const neighbor = pixelMap[x]?.[y];

        if (neighbor && neighbor.conduct > 0) {
            chargePixel(neighbor);
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

    desc: "Clic gauche : envoie une impulsion électrique.",

    tick: function(pixel) {
        // Actualisation du registre
        kodButtonRegistry.set(
            pixel.x + "," + pixel.y,
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

    desc: "Clic gauche : active ou désactive le courant.",

    tick: function(pixel) {
        kodButtonRegistry.set(
            pixel.x + "," + pixel.y,
            pixel
        );

        if (pixel.on) {
            kodSendElectricity(pixel, false);
        }
    }
};


// =========================================
// DETECTION PERSONNALISEE DE LA SOURIS
// =========================================

// Éviter les doublons si le mod est rechargé
if (window.kodButtonMouseHandler) {
    document.removeEventListener(
        "mousedown",
        window.kodButtonMouseHandler,
        true
    );
}

window.kodButtonMouseHandler = function(event) {

    // Seulement le clic gauche
    if (event.button !== 0) return;

    // Seulement sur le canvas
    if (
        !event.target ||
        event.target.tagName !== "CANVAS"
    ) return;

    // Récupération des coordonnées de la souris
    const x = Math.floor(mousePos.x);
    const y = Math.floor(mousePos.y);

    // Actualisation du registre
    kodRegisterButtons();

    // Recherche du bouton sous la souris
    const key = x + "," + y;
    const pixel = kodButtonRegistry.get(key);

    if (!pixel) return;

    // Vérification que le pixel existe toujours
    if (pixelMap[x]?.[y] !== pixel) return;

    // E-BUTTON : impulsion unique
    if (pixel.element === "e_button") {
        console.log("KODK: E-BUTTON ACTIVÉ !");
        kodSendElectricity(pixel, true);
    }

    // PUSH BUTTON : activation / désactivation
    else if (pixel.element === "push_button") {
        pixel.on = !pixel.on;

        console.log(
            "KODK: PUSH BUTTON :",
            pixel.on ? "ON" : "OFF"
        );

        if (pixel.on) {
            kodSendElectricity(pixel, false);
        }
    }
};

// Installation du détecteur
document.addEventListener(
    "mousedown",
    window.kodButtonMouseHandler,
    true
);

// Initialisation du registre
kodRegisterButtons();

console.log("KODK BUTTONS : système de clic installé !");
