console.log("PUSH.JS : début du chargement");

runAfterLoad(function() {
    console.log("PUSH.JS : exécution après chargement");

    elements.e_button = {
        name: "E-Button",
        color: "#ff6600",
        behavior: behaviors.WALL,
        category: "machines",
        state: "solid",
        density: 1200,
        conduct: 1
    };

    elements.push_button = {
        name: "Push Button",
        color: "#4488ff",
        behavior: behaviors.WALL,
        category: "machines",
        state: "solid",
        density: 1200,
        conduct: 1
    };

    console.log("PUSH.JS : éléments enregistrés !");
});
