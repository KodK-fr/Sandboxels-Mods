// Nettoyeur Liquide - Supprime tout sauf Insulator et Glass
// Basé sur l'exemple R74n deletion code

elements.net = {
    name: "Net",
    color: "#aa00ff",
    type: "liquid",
    density: 1000,
    viscosity: 0.01,
    category: "special",
    desc: "Supprime tout sauf Insulator et Glass",
    state: "liquid",
    stateHigh: "fire",
    tempHigh: 500,
    
    tick: function(pixel) {
        var coordsToCheck = [
            [pixel.x-1,pixel.y],
            [pixel.x+1,pixel.y],
            [pixel.x,pixel.y-1],
            [pixel.x,pixel.y+1],
            [pixel.x-1,pixel.y-1],
            [pixel.x+1,pixel.y-1],
            [pixel.x-1,pixel.y+1],
            [pixel.x+1,pixel.y+1]
        ];
        
        for (var i = 0; i < coordsToCheck.length; i++) {
            var coord = coordsToCheck[i];
            if (!isEmpty(coord[0],coord[1],true)) {
                var newPixel = pixelMap[coord[0]][coord[1]];
                var elState = elements[newPixel.element].state;
                var elName = newPixel.element;
                
                // SUPPRIME TOUT sauf exceptions
                if (elName !== "net" && elName !== "insulator" && elName !== "glass") {
                    deletePixel(coord[0],coord[1]);
                }
            }
        }
        
        // Se consume lentement
        if (Math.random() < 0.01) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};

// Ignore par l'acide (comme dans l'exemple)
elements.acid.ignore.push("net");
