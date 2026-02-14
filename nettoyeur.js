// Nettoyeur - Supprime tout sauf Insulator et Glass
elements.Nettoyeur = {
    name: "Nettoyeur",
    type: "liquid",
    color: "#aa00ff",
    density: 1000,
    viscosity: 0.01,
    category: "special",
    desc: "Supprime tout sauf Isolant et Verre",
    tick: function(pixel) {
        for (let nx = -1; nx <= 1; nx++) {
            for (let ny = -1; ny <= 1; ny++) {
                if (nx === 0 && ny === 0) continue;
                let x2 = pixel.x + nx;
                let y2 = pixel.y + ny;
                if (isInBounds(x2, y2) && !isEmpty(x2, y2)) {
                    let touched = pixelMap[x2][y2];
                    if (touched.element !== "Nettoyeur" && 
                        touched.element !== "insulator" && 
                        touched.element !== "glass") {
                        deletePixel(x2, y2);
                    }
                }
            }
        }
        if (Math.random() < 0.01) deletePixel(pixel.x, pixel.y);
    }
};
