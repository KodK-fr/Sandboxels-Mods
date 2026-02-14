elements.Net = {
    name: "Net",
    type: "liquid",
    color: "#aa00ff",
    density: 1000,
    category: "special",
    tick: function(pixel) {
        for(let nx=-1;nx<=1;nx++)for(let ny=-1;ny<=1;ny++)if(nx||ny){
            let x2=pixel.x+nx,y2=pixel.y+ny;
            if(isInBounds(x2,y2)&&!isEmpty(x2,y2)){
                let el=pixelMap[x2][y2].element;
                if(el!=="Net"&&el!=="insulator"&&el!=="glass")deletePixel(x2,y2);
            }
        }
        if(Math.random()<0.01)deletePixel(pixel.x,pixel.y);
    }
};
