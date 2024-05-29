let sourceImg = null;
let maskImg = null;
let renderCounter = 0;

// change these three lines as appropiate
let sourceFile = "input_new1.png";
let maskFile = "mask_new1.png";
let outputFile = "output_2.png";

function preload() {
    sourceImg = loadImage(sourceFile);
    maskImg = loadImage(maskFile);
}

function setup() {
    let main_canvas = createCanvas(1920, 1080);
    main_canvas.parent('canvasContainer');
    main_canvas.mouseClicked(cyclePalette);
    
    imageMode(CENTER);
    noStroke();
    background(0, 0, 0);
    sourceImg.loadPixels();
    maskImg.loadPixels();
}

let colorGradients = [
    {
        name: "aurora",
        colorStops: [
            { color: [5, 5, -17], factor: 0 },
            { color: [48, 62, 17], factor: 0.6 },
            { color: [63, -46, 14], factor: 0.8 },
            { color: [31, -22, 1], factor: 0.85 },
            { color: [20, 8, -27], factor: 1 },
        ],
        positions: [
            {
                x: 210,
                y: 0
            },
            {
                x: 190,
                y: 200
            },
        ],
        graphicsType: "streaks"
    },
    {
        name: "sunset",
        colorStops: [
            { color: [13, 14, -11], factor: 0 },
            { color: [41, 49, 42], factor: 0.4 },
            { color: [66, 27, 55], factor: 0.8 },
            { color: [23, 37, 0], factor: 1 },
        ],
        positions: [
            {
                x: 150,
                y: -50
            },
            {
                x: 350,
                y: 250
            },
        ],
        graphicsType: "stars"
    },
    {
        name: "sunrise",
        colorStops: [
            { color: [39, -23, -7], factor: 0 },
            { color: [64, -37, 0], factor: 0.33 },
            { color: [57, 52, 34], factor: 0.67 },
            { color: [25, 13, -16], factor: 1 },
        ],
        positions: [
            {
                x: 205,
                y: 20
            },
            {
                x: 195,
                y: 150
            },
        ],
        graphicsType: "rings"
    },
]

let imageWidth = 400;
let imageHeight = 300;
let chosenColorGradientIndex = 0;

let ditherPattern = [
    [0, 8, 2, 10],
    [13, 4, 15, 6],
    [3, 11, 1, 9],
    [16, 7, 14, 5],
];

function cyclePalette() {
    chosenColorGradientIndex += 1;
    fill(0,0,0,127);
    rect(0,0,imageWidth,imageHeight);
    setTimeout(() => {
        draw();
    }, 100);
}




function draw() {
    let totalPixels = imageWidth * imageHeight;
    
    let chosenColorGradient = colorGradients[chosenColorGradientIndex % colorGradients.length];
    
    let deltaX = chosenColorGradient.positions[1].x - chosenColorGradient.positions[0].x;
    let deltaY = chosenColorGradient.positions[1].y - chosenColorGradient.positions[0].y;
    let distance = Math.sqrt((deltaX ** 2) + (deltaY ** 2));
    
    //-----------------------//
    // sky graphics creation //
    //-----------------------//

    // setting up offscreen buffer for drawing graphics
    let offscreenBuffer = createGraphics(imageWidth,imageHeight);
    offscreenBuffer.background(0);
    offscreenBuffer.fill(127);
    offscreenBuffer.stroke(63);
    offscreenBuffer.strokeWeight(2);
    offscreenBuffer.angleMode(DEGREES);

    // stars graphic type
    if (chosenColorGradient.graphicsType == "stars") {
        for (let i = 0; i < 200; i++) {
            offscreenBuffer.push();
            let starTranslateX = Math.random() * imageWidth;
            let starRotate = Math.random() * 90;
            let starTranslateY = Math.random() * imageHeight;
            let starSizeOuter = map(Math.random() ** 10, 0, 1, 2, 10);
            let starSizeOuterInner = starSizeOuter/ 4;
            offscreenBuffer.translate(starTranslateX, starTranslateY);
            offscreenBuffer.rotate(starRotate);
            offscreenBuffer.beginShape();
            offscreenBuffer.vertex(0, -starSizeOuter);
            offscreenBuffer.vertex(starSizeOuterInner, -starSizeOuterInner);
            offscreenBuffer.vertex(starSizeOuter, 0);
            offscreenBuffer.vertex(starSizeOuterInner, starSizeOuterInner);
            offscreenBuffer.vertex(0, starSizeOuter);
            offscreenBuffer.vertex(-starSizeOuterInner, starSizeOuterInner);
            offscreenBuffer.vertex(-starSizeOuter, 0);
            offscreenBuffer.vertex(-starSizeOuterInner, -starSizeOuterInner);
            offscreenBuffer.endShape(CLOSE);
            offscreenBuffer.pop();
        }
    }

    // streaks graphic type
    if (chosenColorGradient.graphicsType == "streaks") {
        offscreenBuffer.push();
        offscreenBuffer.rectMode(CENTER);
        offscreenBuffer.rotate(30);
        let streakArray = [];
        let streakTotalWidth = 0;
        let streakUnit = 5;
        for (let i = 0; i < 10; i++) {
            let streakRandomWidth = Math.round(map(Math.random(), 0, 1, 1, 3)) * streakUnit;
            streakArray.push(streakRandomWidth);
            streakTotalWidth += streakRandomWidth;
            streakTotalWidth += streakUnit * 2;
        }
        offscreenBuffer.translate(-streakTotalWidth/3,0);
        for (let i = 0; i < streakArray.length; i++) {
            offscreenBuffer.rect(imageWidth/2 + streakArray[i]/2,imageHeight/2,streakArray[i],2000);
            offscreenBuffer.translate(streakArray[i],0);
            offscreenBuffer.translate(streakUnit * 2,0);
        }
        offscreenBuffer.pop();
    }

    // rings graphic type
    if (chosenColorGradient.graphicsType == "rings") {
        let ringsSize = imageWidth * 2;
        for (let i = 0; i < 40; i++) {
            offscreenBuffer.push();
            if (i % 2 == 1) {
                offscreenBuffer.fill(0);
            }
            offscreenBuffer.circle(imageWidth/2,imageHeight,ringsSize);
            ringsSize -= map(Math.random(),0,1,10,30);
            if (ringsSize < 0) {
                break;
            }
            console.log(i);
            offscreenBuffer.pop();
        }
    }
    
    for (let i = 0; i < totalPixels; i++) {
        // define appropriate x and y coordinates
        let x = i % imageWidth;
        let y = Math.floor(i / imageWidth);
        
        let sourcePixel = sourceImg.get(x, y);
        let offscreenBufferPixel = offscreenBuffer.get(x, y)[0];
        
        let randomVariationSpread = 10;
        let randomVariationSpreadX = Math.random() * randomVariationSpread - randomVariationSpread/2;
        let randomVariationSpreadY = Math.random() * randomVariationSpread - randomVariationSpread/2;
        let randomVariationX = Math.min(Math.max(x + randomVariationSpreadX,1),imageWidth-1);
        let randomVariationY = Math.min(Math.max(y + randomVariationSpreadY,1),imageHeight-1);
        let maskPixel = maskImg.get(randomVariationX, randomVariationY)[0];
        
        let outputPixel;

        //--------------------------//
        // linear gradient creation //
        //--------------------------//

        // project pixel onto linear gradient line
        let projectedX = x - chosenColorGradient.positions[0].x
        let projectedY = y - chosenColorGradient.positions[0].y
        let factor = (projectedX * deltaX + projectedY * deltaY) / distance ** 2;
        factor = Math.min(Math.max(factor,0),1);
        
        // find nearest color stops between
        let color1;
        let color2;
        for (let j=0; j < chosenColorGradient.colorStops.length - 1; j++) {
            let currentColorStop = chosenColorGradient.colorStops[j];
            let nextColorStop = chosenColorGradient.colorStops[j + 1];
            if (factor >= currentColorStop.factor && factor <= nextColorStop.factor) {
                color1 = currentColorStop;
                color2 = nextColorStop;
                break;
            }
        }
        
        // define factor relative to color stops
        let relativeFactor = (factor - color1.factor) / (color2.factor - color1.factor);
        interpolatedColor = [
            (color2.color[0] - color1.color[0] ) * relativeFactor + color1.color[0],
            (color2.color[1] - color1.color[1] ) * relativeFactor + color1.color[1],
            (color2.color[2] - color1.color[2] ) * relativeFactor + color1.color[2]
        ]

        // lighten color based on offscreen graphics
        interpolatedColor[0] += offscreenBufferPixel / 8;

        let outputPixelSky = labToRgb(interpolatedColor);

        //----------------------//
        // ground pixel tinting //
        //----------------------//
        
        // get average color of all color stops
        let outputPixelGround = [0,0,0];
        for (let j = 0; j < chosenColorGradient.colorStops.length-1; j++) {
            outputPixelGround[0] += chosenColorGradient.colorStops[j].color[0];
            outputPixelGround[1] += chosenColorGradient.colorStops[j].color[1];
            outputPixelGround[2] += chosenColorGradient.colorStops[j].color[2];
        }
        outputPixelGround[0] /= chosenColorGradient.colorStops.length;
        outputPixelGround[1] /= chosenColorGradient.colorStops.length;
        outputPixelGround[2] /= chosenColorGradient.colorStops.length;

        // convert from LAB to RGB
        outputPixelGround = labToRgb(outputPixelGround);
        
        // multiply into source image
        outputPixelGround = [
            (sourcePixel[0]/255) * (outputPixelGround[0]/255) * 255,
            (sourcePixel[1]/255) * (outputPixelGround[1]/255) * 255,
            (sourcePixel[2]/255) * (outputPixelGround[2]/255) * 255
        ]
        
        //-------------------//
        // mask manipulation //
        //-------------------//
        
        // apply dither pattern to mask
        maskPixel = maskPixel / 255;
        let ditherPixel = (ditherPattern[y % 4][x % 4] - 8) / 255 * 8;
        maskPixel += ditherPixel;
        outputPixel = blendAverage(outputPixelSky, outputPixelGround, maskPixel);
        
        //-------------------//
        // final composition //
        //-------------------//

        // average with source image
        let bias = 0;
        outputPixel = [
            (sourcePixel[0] * (bias) + outputPixel[0] * (1 - bias)),
            (sourcePixel[1] * (bias) + outputPixel[1] * (1 - bias)),
            (sourcePixel[2] * (bias) + outputPixel[2] * (1 - bias))
        ]

        stroke(outputPixel[0],outputPixel[1],outputPixel[2]);
        point(x,y);
    }
    
    // gradient guides
    push();
    fill(255,255,255);
    stroke(0,0,0);
    strokeWeight(1);
    line(chosenColorGradient.positions[0].x,chosenColorGradient.positions[0].y,chosenColorGradient.positions[1].x,chosenColorGradient.positions[1].y)
    circle(chosenColorGradient.positions[0].x,chosenColorGradient.positions[0].y,5);
    circle(chosenColorGradient.positions[1].x,chosenColorGradient.positions[1].y,5);
    pop();
    
    noLoop();
    // saveArtworkImage(outputFile);
}

function keyTyped() {
    if (key == '!') {
        saveBlocksImages();
    }
}


function blendAverage(base, blend, factor) {
    return [
        // (base[0] * (factor) + blend[0] * (1 - factor)),
        // (base[1] * (factor) + blend[1] * (1 - factor)),
        // (base[2] * (factor) + blend[2] * (1 - factor))
        (base[0] * (factor) + blend[0]),
        (base[1] * (factor) + blend[1]),
        (base[2] * (factor) + blend[2])
    ]
}

// LAB color to RGB, adapted as courtesy of https://github.com/antimatter15/rgb-lab/tree/master
function labToRgb(lab){
    var y = (lab[0] + 16) / 116,
    x = lab[1] / 500 + y,
    z = y - lab[2] / 200,
    r, g, b;
    
    x = (x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787;
    y = (y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787;
    z = (z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787;
    
    x *= 95.047;
    y *= 100.000;
    z *= 108.883;
    
    x /= 100;
    y /= 100;
    z /= 100;
    
    r = x *  3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y *  1.8758 + z *  0.0415;
    b = x *  0.0557 + y * -0.2040 + z *  1.0570;
    
    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;
    
    return [Math.max(0, Math.min(1, r)) * 255, 
        Math.max(0, Math.min(1, g)) * 255, 
        Math.max(0, Math.min(1, b)) * 255]
}