
elements.transformateur_ac_dc = {
    name: "Transformateur AC/DC",
    color: "#777f91",
    category: "machines",
    behavior: behaviors.WALL,
    state: "solid",
    conduct: 0,

    properties: {
        dcDirection: 0,
        dcLastInput: -9999,
        dcPixels: []
    },

    // Sélection de la direction avec Shift
    onShiftSelect: function() {
        promptDir(
            "Choisis la direction de SORTIE du courant continu :",
            function(direction) {
                elements.transformateur_ac_dc
                    .properties.dcDirection = direction;
            },
            "Direction du transformateur"
        );
    }
};

function dcTint(pixel, active) {
    if (pixel.dcOriginalColor === undefined) {
        pixel.dcOriginalColor = pixel.color;
    }

    if (!active) {
        pixel.color = pixel.dcOriginalColor;
        delete pixel.dcOriginalColor;
        return;
    }

    let c = pixel.dcOriginalColor;
    if (typeof c !== "string" || !c.startsWith("#")) return;

    let r = parseInt(c.slice(1,3),16);
    let g = parseInt(c.slice(3,5),16);
    let b = parseInt(c.slice(5,7),16);

    let amount = 0.13;

    r = Math.round(r + (255-r)*amount);
    g = Math.round(g + (235-g)*amount);
    b = Math.round(b + (70-b)*amount);

    pixel.color = "#" +
        [r,g,b].map(v =>
            v.toString(16).padStart(2,"0")
        ).join("");
}

// Directions de sortie :
// 0 = gauche
// 1 = bas
// 2 = droite
// 3 = haut

const dcDirections = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

runEveryTick(function() {

    for (let t of currentPixels) {

        if (t.element !== "transformateur_ac_dc") continue;

        let direction = t.dcDirection ?? 0;

        let outDir = dcDirections[direction];

        // Entrée opposée à la sortie
        let inDir = dcDirections[(direction + 2) % 4];

        let input = getPixel(
            t.x + inDir[0],
            t.y + inDir[1]
        );

        // Détection de l'alimentation
        if (input && input.charge > 0) {
            t.dcLastInput = pixelTicks;
        }

        // Arrêt après 2 secondes
        let active =
            pixelTicks - t.dcLastInput < 60;

        let output = getPixel(
            t.x + outDir[0],
            t.y + outDir[1]
        );

        let queue = [];
        let visited = new Set();
        let powered = [];

        let inputKey = input
            ? input.x + "," + input.y
            : null;

        if (
            active &&
            output &&
            elements[output.element] &&
            elements[output.element].conduct > 0
        ) {
            queue.push(output);
        }

        // Recherche du réseau de sortie
        while (queue.length > 0) {

            let p = queue.shift();
            let key = p.x + "," + p.y;

            if (visited.has(key)) continue;
            if (key === inputKey) continue;

            visited.add(key);

            let def = elements[p.element];

            if (!def || !(def.conduct > 0)) continue;

            powered.push(p);

            let neighbors = [
                [p.x+1,p.y],
                [p.x-1,p.y],
                [p.x,p.y+1],
                [p.x,p.y-1]
            ];

            for (let pos of neighbors) {

                let n = getPixel(pos[0],pos[1]);

                if (!n || visited.has(n.x+","+n.y)) continue;

                let nd = elements[n.element];

                if (nd && nd.conduct > 0) {
                    queue.push(n);
                }
            }
        }

        let newSet = new Set(powered);

        // Décharge des anciens conducteurs
        for (let p of t.dcPixels || []) {

            if (!newSet.has(p)) {
                p.charge = 0;
                p.chargeCD = 0;

                dcTint(p, false);
                delete p.dcPowered;
            }
        }

        // Alimentation permanente
        for (let p of powered) {

            p.charge = 1;
            p.chargeCD = 0;
            p.dcPowered = true;

            dcTint(p, true);
        }

        t.dcPixels = powered;
    }
});
