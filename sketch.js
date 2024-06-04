let sourceImg = null;
let maskImg = null;
let renderCounter = 0;

// change these three lines as appropiate
let sourceFile1 = "images/input_1.png";
let sourceFile2 = "images/input_2.png";
let sourceFile3 = "images/input_3.png";

let sourceFile1Img;
let sourceFile2Img;
let sourceFile3Img;

let maskFile1 = "images/mask_1.png";
let maskFile2 = "images/mask_2.png";
let maskFile3 = "images/mask_3.png";

let maskFile1Img;
let maskFile2Img;
let maskFile3Img;

let outputFile = "output_2.png";

let sourceFileImgArray;
let maskFileImgArray;

function preload() {
    sourceFile1Img = loadImage(sourceFile1);
    sourceFile2Img = loadImage(sourceFile2);
    sourceFile3Img = loadImage(sourceFile3);

    maskFile1Img = loadImage(maskFile1);
    maskFile2Img = loadImage(maskFile2);
    maskFile3Img = loadImage(maskFile3);

    sourceFileImgArray = [sourceFile1Img,sourceFile2Img,sourceFile3Img];
    maskFileImgArray = [maskFile1Img,maskFile2Img,maskFile3Img];

    sourceImg = sourceFile1Img;
    maskImg = maskFile1Img;
}

function setup() {
    let main_canvas = createCanvas(1920, 1080);
    main_canvas.parent('canvasContainer');
    main_canvas.mouseClicked(cyclePalette);
    
    imageMode(CENTER);
    noStroke();
    background(0, 0, 0);
    sourceFile1Img.loadPixels();
    sourceFile2Img.loadPixels();
    sourceFile3Img.loadPixels();
    maskFile1Img.loadPixels();
    maskFile2Img.loadPixels();
    maskFile3Img.loadPixels();
}

let imageWidth = 1008;
let imageHeight = 756;
let chosenColorGradientIndex = 0;
let chosenImageIndex = 0;

let colorGradients = [
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
                x: imageWidth/2 - 200,
                y: -50
            },
            {
                x: imageWidth/2 + 200,
                y: imageHeight + 50
            },
        ],
        graphicsType: "stars"
    },
    {
        name: "red moon",
        colorStops: [
            { color: [35, 45, 15], factor: 0 },
            { color: [65, 65, 32], factor: 0.25 },
            { color: [43, 52, -6], factor: 0.5 },
            { color: [25, 40, -19], factor: 1 },
        ],
        positions: [
            {
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: imageHeight
            },
        ],
        graphicsType: "streaks"
    },
    {
        name: "aurora",
        colorStops: [
            { color: [5, 5, -17], factor: 0 },
            { color: [48, 62, 17], factor: 0.4 },
            { color: [63, -46, 14], factor: 0.8 },
            { color: [31, -22, 1], factor: 0.85 },
            { color: [20, 8, -27], factor: 1 },
        ],
        positions: [
            {
                x: imageWidth/2 + 20,
                y: 0
            },
            {
                x: imageWidth/2 - 20,
                y: imageHeight/5*3
            },
        ],
        graphicsType: "rings"
    },
    {
        name: "midnight",
        colorStops: [
            { color: [19, -3, -46], factor: 0 },
            { color: [68, 15, 27], factor: 0.2 },
            { color: [17, 8, -27], factor: 0.4 },
            { color: [5, 16, -27], factor: 1 },
        ],
        positions: [
            {
                x: imageWidth-440,
                y: imageHeight/4*3
            },
            {
                x: 440,
                y: imageHeight/4
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
                x: 50,
                y: 0
            },
            {
                x: 0,
                y: imageHeight/4*3
            },
        ],
        graphicsType: "rings"
    },
    {
        name: "spectrum",
        colorStops: [
            { color: [48, 68, 31], factor: 0 },
            { color: [56, 46, 55], factor: 0.2 },
            { color: [77, 1, 71], factor: 0.4 },
            { color: [66, -56, 55], factor: 0.6 },
            { color: [44, 11, -59], factor: 0.8 },
            { color: [43, 60, -60], factor: 1 },
        ],
        positions: [
            {
                x: 0,
                y: imageHeight
            },
            {
                x: imageWidth,
                y: 0
            },
        ],
        graphicsType: "streaks"
    },
]

let ditherPattern = [
    [0, 8, 2, 10],
    [13, 4, 15, 6],
    [3, 11, 1, 9],
    [16, 7, 14, 5],
];

function cyclePalette() {
    chosenColorGradientIndex += 1;
    chosenImageIndex += 1;
    sourceImg = sourceFileImgArray[chosenImageIndex % sourceFileImgArray.length];
    maskImg = maskFileImgArray[chosenImageIndex % maskFileImgArray.length];
    push();
    fill(0,0,0,63);
    rect(0,0,imageWidth,imageHeight);
    fill(255, 255, 255);
    pop();
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
    offscreenBuffer.strokeWeight(3);
    offscreenBuffer.angleMode(DEGREES);

    // stars graphic type
    if (chosenColorGradient.graphicsType == "stars") {
        for (let i = 0; i < 200; i++) {
            offscreenBuffer.push();
            let starTranslateX = Math.random() * imageWidth;
            let starRotate = Math.random() * 90;
            let starTranslateY = Math.random() * imageHeight;
            let starSizeOuter = map(Math.random() ** 10, 0, 1, 5, 15);
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
        let streakUnit = 15;
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
            ringsSize -= map(Math.random(),0,1,30,60);
            if (ringsSize < 0) {
                break;
            }
            offscreenBuffer.pop();
        }
    }
    
    for (let i = 0; i < totalPixels; i++) {
        // define appropriate x and y coordinates
        let x = i % imageWidth;
        let y = Math.floor(i / imageWidth);
        
        let sourcePixel = sourceImg.get(x, y);
        let offscreenBufferPixel = offscreenBuffer.get(x, y)[0];
        
        let randomVariationSpread = imageWidth/500;
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
        let averageColor = [0,0,0];
        for (let j = 0; j < chosenColorGradient.colorStops.length-1; j++) {
            averageColor[0] += chosenColorGradient.colorStops[j].color[0];
            averageColor[1] += chosenColorGradient.colorStops[j].color[1];
            averageColor[2] += chosenColorGradient.colorStops[j].color[2];
        }
        averageColor[0] /= chosenColorGradient.colorStops.length;
        averageColor[1] /= chosenColorGradient.colorStops.length;
        averageColor[2] /= chosenColorGradient.colorStops.length;

        // convert from LAB to RGB
        averageColor = labToRgb(averageColor);


        let posterisationLevel = 32;
        let sourcePixelPosterised = [
            Math.round(sourcePixel[0] / posterisationLevel) * posterisationLevel,
            Math.round(sourcePixel[1] / posterisationLevel) * posterisationLevel,
            Math.round(sourcePixel[2] / posterisationLevel) * posterisationLevel
        ]

        // console.log((sourcePixel[0]) + " " + (Math.round(sourcePixel[0] / posterisationLevel) * posterisationLevel))
        
        // multiply into source image
        outputPixelGround = blendMultiply(sourcePixelPosterised, averageColor);
        
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
    let showGradientGuides = false;
    if (showGradientGuides) {
        push();
        fill(255,255,255);
        stroke(0,0,0);
        strokeWeight(1);
        line(chosenColorGradient.positions[0].x,chosenColorGradient.positions[0].y,chosenColorGradient.positions[1].x,chosenColorGradient.positions[1].y)
        circle(chosenColorGradient.positions[0].x,chosenColorGradient.positions[0].y,5);
        circle(chosenColorGradient.positions[1].x,chosenColorGradient.positions[1].y,5);
        pop();
    }
    
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
        (base[0] * (factor) + blend[0] * (1 - factor)),
        (base[1] * (factor) + blend[1] * (1 - factor)),
        (base[2] * (factor) + blend[2] * (1 - factor))
    ]
}

function blendMultiply(base, blend) {
    return [
        ((base[0]/255) * (blend[0]/255) * 255),
        ((base[1]/255) * (blend[1]/255) * 255),
        ((base[2]/255) * (blend[2]/255) * 255)
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