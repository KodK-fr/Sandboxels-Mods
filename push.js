elements.push_button = {
    name: "Push Button",
    color: "#4488ff",
    colorOn: "#ffcc00",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    desc: "Clique pour allumer/éteindre le courant vers les voisins.",
    tool: function(pixel) {
        pixel.on = !pixel.on;
        pixel.charge = pixel.on ? 1 : 0;
    },
    tick: function(pixel) {
        if (pixel.on) {
            pixel.charge = 1;
            let dirs = [[0,-1],[0,1],[-1,0],[1,0]];
            for (let [dx, dy] of dirs) {
                let n = getPixel(pixel.x + dx, pixel.y + dy);
                if (n && n.conduct > 0) {
                    chargePixel(n, 1);
                }
            }
        }
    }
};
elements.e_button = {
    name: "E-Button",
    color: "#ff6600",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Clique dessus pour envoyer du courant aux pixels voisins.",
    tool: function(pixel) {
        pixel.charge = 1;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                let neighbor = getPixel(pixel.x + dx, pixel.y + dy);
                if (neighbor) {
                    doElectricity(neighbor);
                }
            }
        }
    }
};   
