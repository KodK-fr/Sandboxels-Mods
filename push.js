
function sendButtonElectricity(pixel, diagonal = true) {
    const dirs = diagonal
        ? [[0,-1],[0,1],[-1,0],[1,0],
           [-1,-1],[1,-1],[-1,1],[1,1]]
        : [[0,-1],[0,1],[-1,0],[1,0]];

    for (const [dx, dy] of dirs) {
        const n = getPixel(pixel.x + dx, pixel.y + dy);

        if (n && n.conduct > 0) {
            chargePixel(n);
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

    onClicked: function(pixel) {
        console.log("E-BUTTON ACTIVÉ !");
        sendButtonElectricity(pixel, true);
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
    desc: "Clique pour allumer ou éteindre le courant.",

    onClicked: function(pixel) {
        pixel.on = !pixel.on;
        console.log("PUSH BUTTON :", pixel.on);
    },

    tick: function(pixel) {
        if (pixel.on) {
            sendButtonElectricity(pixel, false);
        }
    }
};
