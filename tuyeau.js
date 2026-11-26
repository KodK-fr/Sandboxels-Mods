
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
        // Vérifier si l'aspirateur est électrifié
        if (!pixel.charge) return;

        pixel.suctionTimer = (pixel.suctionTimer || 0) + 1;

        // Aspiration toutes les 3 frames
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
