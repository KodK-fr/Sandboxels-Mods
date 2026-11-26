elements.e_button = {
    name: "E-Button",
    color: "#ff6600",
    colorOn: "#ffff00",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    canPlace: true,
    desc: "Clique dessus pour envoyer une impulsion électrique aux voisins.",
    tool: function(pixel) {
        let dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];
        for (let [dx, dy] of dirs) {
            let n = getPixel(pixel.x + dx, pixel.y + dy);
            if (n && n.conduct > 0) {
                chargePixel(n);
            }
        }
    }
};

elements.push_button = {
    name: "Push Button",
    color: "#4488ff",
    colorOn: "#ffcc00",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    canPlace: true,
    desc: "Clique pour allumer/éteindre le courant vers les voisins.",
    tool: function(pixel) {
        pixel.on = !pixel.on;
        if (pixel.on) pixel.charge = 1;
        else pixel.charge = 0;
    },
    tick: function(pixel) {
        if (pixel.on) {
            pixel.charge = 1;
            let dirs = [[0,-1],[0,1],[-1,0],[1,0]];
            for (let [dx, dy] of dirs) {
                let n = getPixel(pixel.x + dx, pixel.y + dy);
                if (n && n.conduct > 0) {
                    chargePixel(n);
                }
            }
        }
    }
};   
