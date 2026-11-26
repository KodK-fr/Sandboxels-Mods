
elements.transformateur_ac_dc = {
    name: "Transformateur AC/DC",
    color: "#777f91",
    category: "machines",
    behavior: behaviors.WALL,
    state: "solid",
    conduct: 0
};

// Réseau de courant continu
runEveryTick(function() {
    for (let t of currentPixels) {
        if (t.element !== "transformateur_ac_dc") continue;

        // Détection du courant alternatif à droite
        let input = getPixel(t.x + 1, t.y);

        if (input && input.charge > 0) {
            t.lastAC = pixelTicks;
        }

        // 2 secondes sans impulsion = arrêt
        let active = t.lastAC !== undefined &&
                     pixelTicks - t.lastAC < 60;

        // Recherche du réseau conducteur à gauche
        let queue = [];
        let visited = new Set();

        let start = getPixel(t.x - 1, t.y);

        if (start && elements[start.element].conduct > 0) {
            queue.push(start);
        }

        while (queue.length > 0) {
            let p = queue.shift();
            let key = p.x + "," + p.y;

            if (visited.has(key)) continue;
            visited.add(key);

            let def = elements[p.element];

            if (!def || !(def.conduct > 0)) continue;

            // Sauvegarde de la couleur d'origine
            if (p.dcOriginalColor === undefined) {
                p.dcOriginalColor = p.color;
            }

            // Courant continu : jaune permanent
            p.color = active
                ? "#ffff00"
                : p.dcOriginalColor;

            // Parcours des quatre côtés
            let neighbors = [
                [p.x + 1, p.y],
                [p.x - 1, p.y],
                [p.x, p.y + 1],
                [p.x, p.y - 1]
            ];

            for (let pos of neighbors) {
                let n = getPixel(pos[0], pos[1]);

                if (!n || visited.has(n.x + "," + n.y)) continue;

                let nd = elements[n.element];

                if (nd && nd.conduct > 0) {
                    queue.push(n);
                }
            }
        }
    }
});
