// Nettoyeur - Supprime tout sauf Insulator et Glass
// Compatible Sandboxels Modding API officielle

elements.Net = {
    name: "Net",
    type: "liquid",
    color: "#aa00ff",
    density: 1000,
    viscosity: 0.01,
    category: "special",
    desc: "Supprime eau, gaz, poudres, solides sauf Insulator et Glass",
    
    // Behavior standard : check tous les voisins
    tick: function(pixel) {
        // Voisins 3x3 (sauf lui-même)
        for (let nx = -1; nx <= 1; nx++) {
            for (let ny = -1; ny <= 1; ny++) {
                if (nx === 0 && ny === 0) continue;
                
                let x2 = pixel.x + nx;
                let y2 = pixel.y + ny;
                
                if (!isEmpty(x2, y2) && isInBounds(x2, y2)) {
                    let touched = pixelMap[x2][y2];
                    
                    // SUPPRIME TOUT sauf exceptions
                    if (touched.element !== "Net" && 
                        touched.element !== "insulator" && 
                        touched.element !== "glass") {
                        deletePixel(x2, y2);
                    }
                }
            }
        }
        
        // Se consume lentement (équilibrage)
        if (Math.random() < 0.015) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};

// Réaction optionnelle : eau → vapeur
elements.water.reactions.Net = {
    "1": [1, "steam"]
};
