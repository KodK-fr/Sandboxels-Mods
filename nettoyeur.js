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
                var coord = [pixel.x+i,pixel.y+j];
                if (!isEmpty(coord[0],coord[1],true)) {
                    var newPixel = pixelMap[coord[0]][coord[1]];
                    if (newPixel.element!=="net" && 
                        newPixel.element!=="insulator" && 
                        newPixel.element!=="glass") {
                        deletePixel(coord[0],coord[1]);
                    }
                }
            }
        }
        if (Math.random()<0.02) deletePixel(pixel.x,pixel.y);
    }
};
