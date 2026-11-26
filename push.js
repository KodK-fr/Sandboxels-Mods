
function sendButtonElectricity(pixel, diagonal = true) {
    const dirs = diagonal
        ? [[0,-1],[0,1],[-1,0],[1,0],
           [-1,-1],[1,-1],[-1,1],[1,1]]
        : [[0,-1],[0,1],[-1,0],[1,0]];

    for (const [dx, dy] of dirs) {
        const n = getPixel(pixel.x + dx, pixel.y + dy);

        if (n && n.conduct > 0) {
            if (typeof chargePixel === "function") {
                chargePixel(n);
            } else {
                n.charge = 1;
            }
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
    desc: "Clique dessus pour envoyer une impulsion électrique aux voisins.",
    
    onMouseDown: function() {
    console.log("CLIC GAUCHE DÉTECTÉ !");
    },

    onClicked: function(pixel) {
        console.log("PIXEL CLIQUÉ :", pixel);
        chargePixel(pixel);
    },
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
    desc: "Clique pour allumer ou éteindre le courant.",

    onClicked: function(pixel, element) {
        pixel.on = !pixel.on;
    },

    tick: function(pixel) {
        if (pixel.on) {
            sendButtonElectricity(pixel, false);
        }
    }
};
