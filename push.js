console.log("PUSH.JS CHARGÉ !");
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
        pixel.charge = 1;
    },

    tick: function(pixel) {
        if (pixel.charge) {
            let dirs = [
                [0,-1], [0,1],
                [-1,0], [1,0],
                [-1,-1], [1,-1],
                [-1,1], [1,1]
            ];

            for (let [dx, dy] of dirs) {
                let n = getPixel(pixel.x + dx, pixel.y + dy);

                if (n && n.conduct > 0) {
                    n.charge = 1;
                }
            }

            delete pixel.charge;
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
    density: 1200,
    hardness: 0.2,
    conduct: 1,
    desc: "Clique pour allumer ou éteindre le courant.",

    onClicked: function(pixel) {
        pixel.on = !pixel.on;
    },

    tick: function(pixel) {
        if (pixel.on) {
            pixel.charge = 1;

            let dirs = [
                [0,-1], [0,1],
                [-1,0], [1,0]
            ];

            for (let [dx, dy] of dirs) {
                let n = getPixel(pixel.x + dx, pixel.y + dy);

                if (n && n.conduct > 0) {
                    n.charge = 1;
                }
            }
        } else {
            delete pixel.charge;
        }
    }
};
console.log("E-Button enregistré :", elements.e_button);
console.log("Push Button enregistré :", elements.push_button);
