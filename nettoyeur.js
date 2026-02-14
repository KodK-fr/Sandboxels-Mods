elements.net = {
    color: "#aa00ff",
    behavior: behaviors.LIQUID,
    category: "special",
    state: "liquid",
    density: 1000,
    desc: "Supprime tout sauf insulator et glass",
    tick: function(pixel) {
        var r = 1;
        for (var j = -r; j <= r; j++) {
            for (var i = -r; i <= r; i++) {
                var x = pixel.x + i;
                var y = pixel.y + j;

                if (!isEmpty(x, y, true)) {
                    var newPixel = pixelMap[x][y];

                    if (
                        newPixel &&
                        newPixel.element !== "net" &&
                        newPixel.element !== "insulator" &&
                        newPixel.element !== "glass"
                    ) {
                        deletePixel(x, y);
                    }
                }
            }
        }

        if (Math.random() < 0.02) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
