
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
        // Pas d'électricité = pas de feu
        if (!pixel.charge) {
            pixel.ignitionTimer = 0;
            return;
        }

        pixel.ignitionTimer = (pixel.ignitionTimer || 0) + 1;

        // Créer du feu toutes les 2 frames
        if (pixel.ignitionTimer < 2) return;
        pixel.ignitionTimer = 0;

        // Cases adjacentes (8 directions)
        var positions = [
            [-1,-1], [0,-1], [1,-1],
            [-1, 0],         [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];

        // Mélanger les positions
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
