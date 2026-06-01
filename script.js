let model, webcam, ctx, maxPredictions, animationId;
let isRunning = false;

// Game State Variables
let score = 0;
let timeLeft = 30;
let timerInterval;
let lastDetected = null;

/** --- Pose Model & Game Logic --- **/

async function init() {
    const zipFile = document.getElementById('zip-upload').files[0];
    if (!zipFile) { alert("Please upload your model.zip first!"); return; }

    try {
        const jsZip = new JSZip();
        const zipContent = await jsZip.loadAsync(zipFile);
        
        const modelJson = await getFileFromZip(zipContent, "model.json");
        const weightsBin = await getFileFromZip(zipContent, "weights.bin");
        const metadataJson = await getFileFromZip(zipContent, "metadata.json");

        model = await tmPose.loadFromFiles(modelJson, weightsBin, metadataJson);
        maxPredictions = model.getTotalClasses();

        webcam = new tmPose.Webcam(400, 400, true);
        await webcam.setup();
        await webcam.play();
        
        isRunning = true;
        document.getElementById("start-btn").disabled = true;
        document.getElementById("stop-btn").disabled = false;
        
        ctx = document.getElementById("canvas").getContext("2d");
        document.getElementById("canvas").width = 400;
        document.getElementById("canvas").height = 400;

        startTimer();
        animationId = window.requestAnimationFrame(loop);
    } catch (e) { 
        console.error(e);
        alert("Error loading model zip. Ensure it contains model.json, weights.bin, and metadata.json"); 
    }
}

async function getFileFromZip(zip, name) {
    const file = zip.file(name);
    if (!file) throw new Error(`File ${name} not found in zip`);
    return new File([await file.async("blob")], name);
}

async function loop() {
    if (!isRunning) return;
    webcam.update();
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    // Game Logic: Class 1 (Index 0) and Class 2 (Index 1)
    const class1Prob = prediction[0].probability;
    const class2Prob = prediction[1].probability;
    const poseDisplay = document.getElementById("pose-number");

    if (class1Prob > 0.5) {
        poseDisplay.innerText = "6";
        lastDetected = "6";
    } else if (class2Prob > 0.5) {
        poseDisplay.innerText = "7";
        if (lastDetected === "6") {
            score++;
            document.getElementById("combo-counter").innerText = score;
            lastDetected = "7"; // Lock until they show 6 again
        }
    } else {
        poseDisplay.innerText = "-";
    }
    
    // Draw Webcam & Skeleton
    ctx.drawImage(webcam.canvas, 0, 0);
    if (pose) {
        tmPose.drawKeypoints(pose.keypoints, 0.5, ctx);
        tmPose.drawSkeleton(pose.keypoints, 0.5, ctx);
    }
    animationId = window.requestAnimationFrame(loop);
}

function startTimer() {
    timeLeft = 30;
    document.getElementById("game-timer").innerText = "00:30";
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("game-timer").innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's Up! Final Score: " + score);
            stop();
        }
    }, 1000);
}

function restartGame() {
    stop();
    score = 0;
    lastDetected = null;
    document.getElementById("combo-counter").innerText = "0";
    document.getElementById("game-timer").innerText = "00:30";
    document.getElementById("pose-number").innerText = "-";
    // Short delay to ensure camera resets before init
    setTimeout(init, 500);
}

async function stop() {
    isRunning = false;
    clearInterval(timerInterval);
    if (animationId) window.cancelAnimationFrame(animationId);
    if (webcam) await webcam.stop();
    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;
}

/** --- Digital Signature Logic --- **/

const sigCanvas = document.getElementById("sig-canvas");
const sCtx = sigCanvas.getContext("2d");
let isSigning = false;

// Line styling
sCtx.strokeStyle = "#101820";
sCtx.lineWidth = 3;
sCtx.lineCap = "round";

function getPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    return { 
        x: (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left, 
        y: (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top 
    };
}

const start = (e) => { 
    isSigning = true; 
    const p = getPos(e); 
    sCtx.beginPath(); 
    sCtx.moveTo(p.x, p.y); 
};

const move = (e) => { 
    if(!isSigning) return; 
    const p = getPos(e); 
    sCtx.lineTo(p.x, p.y); 
    sCtx.stroke(); 
    if (e.touches) e.preventDefault(); 
};

sigCanvas.addEventListener("mousedown", start);
sigCanvas.addEventListener("touchstart", start);
sigCanvas.addEventListener("mousemove", move);
sigCanvas.addEventListener("touchmove", move);
window.addEventListener("mouseup", () => isSigning = false);
window.addEventListener("touchend", () => isSigning = false);

function clearSig() { sCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height); }
function saveSig() { alert("Signature Confirmed!"); }
