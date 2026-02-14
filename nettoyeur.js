elem.Nettoyeur = {
    name: "Nettoyeur",
    type: "liquid",
    color: "#aa00ff",
    density: 1000,
    state: "liquid",
    stateHigh: "fire",
    tempHigh: 500,
    viscosity: 0.01,
    category: "special",
    desc: "Supprime tout sauf Isolant et Verre",
    tick: function(pixel) {
        // Propagation vers le bas (comportement liquide)
        for (let i = 0; i < 4; i++) {
            let coords = [pixel.x, pixel.y+i+1];
            if (!isEmpty(coords[0], coords[1])) {
                let touched = pixelMap[coords[0]][coords[1]];
                if (touched && touched.element !== "Nettoyeur" && touched.element !== "Insulator" && touched.element !== "Glass") {
                    deletePixel(coords[0], coords[1]);
                }
            }
        }
        
        // Effet sur les voisins (gauche, droite, haut, diagonales)
        for (let nx = -1; nx <= 1; nx++) {
            for (let ny = -1; ny <= 1; ny++) {
                if (nx === 0 && ny === 0) continue;
                let x2 = pixel.x + nx;
                let y2 = pixel.y + ny;
                if (isInBounds(x2, y2) && !isEmpty(x2, y2)) {
                    let touched = pixelMap[x2][y2];
                    if (touched && touched.element !== "Nettoyeur" && touched.element !== "Insulator" && touched.element !== "Glass") {
                        deletePixel(x2, y2);
                    }
                }
            }
        }
        
        // Le Nettoyeur se consume lentement
        if (Math.random() < 0.02) {
            deletePixel(pixel.x, pixel.y);
        }
    }
}

// Réactions avec l'eau (optionnel : transforme l'eau en vapeur avant suppression)
elementals.water.reactions.push({
    "Nettoyeur": [1, "steam"]
});
