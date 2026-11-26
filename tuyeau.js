
elements.aspirateur = {
    color: ["#777f88", "#aeb8c2", "#454d56"],
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    hardness: 0.9,
    canContain: true,

    properties: {
        reservoir: [],
        suctionTimer: 0,
        outputTimer: 0
    },

    tick: function(pixel) {
        var radius = 8;
        var maxStorage = 200;

        // Initialisation du réservoir
        if (!Array.isArray(pixel.reservoir)) {
            pixel.reservoir = [];
        }

        // Détecter un tuyau connecté
        var pipes = [];

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                var p = getPixel(pixel.x + dx, pixel.y + dy);

                if (p && p.element === "pipe") {
                    pipes.push(p);
                }
            }
        }

        // ASPIRATION : un gaz toutes les 3 frames
        pixel.suctionTimer = (pixel.suctionTimer || 0) + 1;

        if (pixel.suctionTimer >= 3) {
            pixel.suctionTimer = 0;

            var gases = [];

            for (var dx = -radius; dx <= radius; dx++) {
                for (var dy = -radius; dy <= radius; dy++) {
                    if (dx === 0 && dy === 0) continue;

                    var distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance > radius) continue;

                    var x = pixel.x + dx;
                    var y = pixel.y + dy;
                    var p = getPixel(x, y);

                    if (!p || p.del) continue;

                    var info = elements[p.element];

                    if (
                        info &&
                        (info.state === "gas" || info.isGas === true) &&
                        p.element !== "aspirateur"
                    ) {
                        gases.push(p);
                    }
                }
            }

            if (gases.length > 0 &&
                pixel.reservoir.length < maxStorage) {

                var target = gases[
                    Math.floor(Math.random() * gases.length)
                ];

                pixel.reservoir.push(target.element);
                deletePixel(target.x, target.y);
            }
        }

        // REJET : envoyer les gaz vers le tuyau
        pixel.outputTimer = (pixel.outputTimer || 0) + 1;

        if (
            pipes.length > 0 &&
            pixel.reservoir.length > 0 &&
            pixel.outputTimer >= 3
        ) {
            pixel.outputTimer = 0;

            var pipe = pipes[0];
            var gas = pixel.reservoir[0];
            var released = false;

            // Chercher une case vide au contact du tuyau
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;

                    var x = pipe.x + dx;
                    var y = pipe.y + dy;

                    if (isEmpty(x, y)) {
                        var newPixel = tryCreate(gas, x, y);

                        if (newPixel) {
                            pixel.reservoir.shift();
                            released = true;
                            break;
                        }
                    }
                }

                if (released) break;
            }
        }
    }
};
