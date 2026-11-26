
elements.aspirateur = {
    color: ["#777f88", "#aeb8c2", "#454d56"],
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    hardness: 0.9,

    tick: function(pixel) {
        // Fonctionne uniquement avec l'électricité activée
        if (!pixel.charge && !pixel.chargeCD) {
            return;
        }

        var radius = 8;

        pixel.suctionTimer = (pixel.suctionTimer || 0) + 1;

        // Aspiration progressive
        if (pixel.suctionTimer < 3) return;
        pixel.suctionTimer = 0;

        var gases = [];

        for (var dx = -radius; dx <= radius; dx++) {
            for (var dy = -radius; dy <= radius; dy++) {
                if (dx === 0 && dy === 0) continue;

                if (dx*dx + dy*dy > radius*radius) continue;

                var p = getPixel(pixel.x + dx, pixel.y + dy);

                if (!p || p.del) continue;

                var info = elements[p.element];

                if (
                    info &&
                    (info.state === "gas" || info.isGas === true)
                ) {
                    gases.push(p);
                }
            }
        }

        // Détruire un gaz à chaque cycle
        if (gases.length > 0) {
            var target = gases[
                Math.floor(Math.random() * gases.length)
            ];

            deletePixel(target.x, target.y);
        }
    }
};
