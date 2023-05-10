
// canvas setup

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})


// global variables
let toggleConnections = false;
let toggleMagnet = false;
let toggleMenu = false;
let toggleMouseMove = false;
let fps = 25;
let particlesArray = [];
let hue = 0;
let bumpRadius = 30;
let saturation = 100;
let light = 100;
let randomMovement = true;
let particleBehaviour = "none";


// getting buttons and sliders

// Slider
var radiusInput = document.getElementById('radius');
var radius = radiusInput.value;
radiusInput.oninput = function () {
    radius = this.value;
}

var satSlider = document.getElementById("satRange");
var satSliderDisplay = document.getElementById("sat");
satSlider.oninput = function () {
    saturation = this.value;
    satSliderDisplay.innerHTML = this.value;
}

var lightSlider = document.getElementById("lightRange");
var lightSliderDisplay = document.getElementById("light");
lightSlider.oninput = function () {
    light = this.value;
    lightSliderDisplay.innerHTML = this.value;
}

// Buttons

let menuSwitch = document.getElementById("menuSwitch");
let menu = document.getElementById("nav");
menuSwitch.addEventListener('click', () => {
    if (toggleMenu === false) {
        menuSwitch.style.background = "whitesmoke";
        menuSwitch.style.color = "black";
        toggleMenu = true;
        menu.style.opacity = 1;
        menu.style.visibility = "visible";
    } else {
        menuSwitch.style.background = "transparent";
        menuSwitch.style.color = "whitesmoke";
        menu.style.opacity = 0;
        menu.style.visibility = "hidden";
        toggleMenu = false;
    }
});

particleBehaviourSelect = document.getElementById("behaviour-select");
particleBehaviourSelect.addEventListener("change", () => {
    particleBehaviour = particleBehaviourSelect.value;
})


let connectSwitch = document.getElementById("connectionSwitch");
connectSwitch.addEventListener('click', () => {
    if (toggleConnections === false) {
        connectSwitch.style.background = "whitesmoke";
        connectSwitch.style.color = "black";

        toggleConnections = true;
    } else {
        connectSwitch.style.background = "transparent";
        connectSwitch.style.color = "whitesmoke";
        toggleConnections = false;
    }
});

let mouseMoveSwitch = document.getElementById("mouseMoveSwitch");
mouseMoveSwitch.addEventListener('click', () => {
    if (toggleMouseMove === false) {
        mouseMoveSwitch.style.background = "whitesmoke";
        mouseMoveSwitch.style.color = "black";
        toggleMouseMove = true;
    } else {
        mouseMoveSwitch.style.background = "transparent";
        mouseMoveSwitch.style.color = "whitesmoke";
        toggleMouseMove = false;
    }
});

// Class to track mouse movement
class Mouse {
    constructor() {
        x: undefined;
        lastX: undefined;
        y: undefined;
        lastY: undefined;
        lastmousetime: undefined;
        velocityX: undefined;
        velocityY: undefined;
        this.radius = 100;
    }
    draw() {
        ctx.strokeStyle = 'hsl(0,100%,100%)';
        ctx.lineWidth = '100px';
        ctx.beginPath();
        ctx.arc(this.x, this.y, bumpRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }
}
let mouse = new Mouse();

// Class for particles

class Particle {
    constructor(x, y) {
        this.radius = Math.random() * radius + 1;
        this.hue = hue;
        this.saturation = saturation;
        this.light = light;
        this.lightSwitch = false;
        this.x = x;
        this.y = y;
        this.bumpSpeedX = 0;
        this.bumpSpeedY = 0;
        this.size = Math.random() * 5 + 1;
        if (randomMovement == true) {
            this.baseSpeedX = Math.random() * 3 - 1.5;
            this.baseSpeedY = Math.random() * 3 - 1.5;
        } else if (randomMovement == false) {
            this.baseSpeedX = 0;
            this.baseSpeedY = 0;
        }
        this.density = Math.random() * 10 + 1;
    }

    // running method to move/track particles
    update() {

        // collision with window borders
        if (this.x >= window.innerWidth || this.x <= 1) { this.speedX = this.speedX * -1 };
        if (this.y >= window.innerHeight || this.y <= 1) { this.speedY = this.speedY * -1 };

        // shrink particles over time
        if (this.radius >= 0.2) this.radius -= 0.03;

        // distance between particle center and mouse
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.abs(dx) + Math.abs(dy);

        // forcedirection 
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;

        // max distance for gravity effect, normalized to be 0 to 1
        const maxDistance = 300;
        let force = (maxDistance - distance) / maxDistance;
        // avoid negative force
        if (force < 0) force = 0;

        // effect of gravity on speed
        this.bumpSpeedX = (forceDirectionX * force * this.density * 0.6);
        this.bumpSpeedY = (forceDirectionY * force * this.density * 0.6);

        // update on positions based on gravity 
        if (distance < mouse.radius + this.radius) {
            if (particleBehaviour === "Repel") {
                this.x += this.bumpSpeedX;
                this.y += this.bumpSpeedY;
                this.baseSpeedX = this.bumpSpeedX;
                this.baseSpeedY = this.bumpSpeedY;
            } else if (particleBehaviour === "Attract") {
                this.x -= this.bumpSpeedX;
                this.y -= this.bumpSpeedY;
                this.baseSpeedX = this.bumpSpeedX * -1;
                this.baseSpeedY = this.bumpSpeedY * -1;
            }
        }
        this.x += this.baseSpeedX;
        this.y += this.baseSpeedY;
    }

    // optional strobo-effect (disabled)
    changelight() {
        if (this.light >= 90) {
            this.lightSwitch = false;
        } else if (this.light <= 10) {
            this.lightSwitch = true;
        };

        if (this.lightSwitch == true) {
            this.light = this.light += .5;
        } else {
            this.light = this.light -= .5;
        }
    }
    draw(x, y) {
        ctx.fillStyle = 'hsl(' + this.hue + ',' + this.saturation + '%,' + this.light + '%)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // find distance between particles and draw connections if less than 100
    connect(i) {
        for (let j = i; j < particlesArray.length; j++) {
            const particle = particlesArray[j];
            let distance = Math.abs(this.x - particle.x) + Math.abs(this.y - particle.y);
            if (distance < 100) {
                ctx.strokeStyle = 'hsl(' + this.hue + ',' + this.saturation + '%,' + this.light + '%)';
                ctx.lineWidth = this.radius / 10;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(particle.x, particle.y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// event listener for spawning particles
canvas.addEventListener('click', (event) => {
    for (let i = 0; i < 20; i++) {
        let randomPosOnBumpRadiusX = Math.random() * bumpRadius - (bumpRadius / 2);
        let randomPosOnBumpRadiusY = Math.random() * bumpRadius - (bumpRadius / 2);
        particlesArray.push(new Particle(event.x + randomPosOnBumpRadiusX, event.y + randomPosOnBumpRadiusY));
    }
})

// spawn particles on mouse move
addEventListener('mousemove', (event) => {
    evaluateMouseSpeed(event);
    if (toggleMouseMove == true) {
        for (let i = 0; i < 2; i++) {
            let randomPosOnBumpRadiusX = Math.random() * bumpRadius - (bumpRadius / 2);
            let randomPosOnBumpRadiusY = Math.random() * bumpRadius - (bumpRadius / 2);
            particlesArray.push(new Particle(event.x + randomPosOnBumpRadiusX, event.y + randomPosOnBumpRadiusY));
        }
    }
})


// extra method to evaluate mouse speed to make bounce effect (disabled)
function evaluateMouseSpeed(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    if (mouse.lastX == undefined) {
        mouse.lastX = event.x;
        mouse.lastY = event.y;
        mouse.lastmousetime = Date.now();
    };
    let distanceX = Math.abs(mouse.x - mouse.lastX);
    let distanceY = Math.abs(mouse.y - mouse.lastY);
    let timeNow = Date.now();
    let timeDiff = timeNow - mouse.lastmousetime;
    let timeDiffSec = timeDiff / 1000;
    mouse.velocityX = (distanceX / timeDiff) * 10;
    mouse.velocityY = (distanceY / timeDiff) * 10;

    mouse.lastmousetime = Date.now();
    mouse.lastX = event.x;
    mouse.lastY = event.y;

}

// function connect_particles() {
//     for (let a = 0; a < particlesArray.length; a++) {
//         for (let b = 0; b < particlesArray.length; b++) {
//             let particleA = particlesArray[a];
//             let particleB = particlesArray[b];
//             let distance = Math.abs(particleA.x - particleB.x) + Math.abs(particleA.y - particleB.y);
//             if (distance < 100) {
//                 ctx.strokeStyle = 'hsl(' + particleA.hue + ',' + particleA.saturation + '%,' + particleA.light + '%)';
//                 ctx.lineWidth = particleA.radius / 10;
//                 ctx.beginPath();
//                 ctx.moveTo(particleA.x, particleA.y);
//                 ctx.lineTo(particleB.x, particleB.y);
//                 ctx.stroke();
//                 ctx.closePath();
//             }
//         }
//     }
// }

// handler and manager

function handleParticles(x, y) {
    for (let i = 0; i < particlesArray.length; i++) {
        const particle = particlesArray[i];
        particle.update();
        particle.draw(x, y);
        if (toggleConnections == true) {
            particle.connect(i);
        }
        if (particle.radius <= 0.3) {
            let idx = particlesArray.indexOf(particle);
            particlesArray.splice(idx, 1);
        }
    }
}

function handleMouse() {
    mouse.draw();
}

// animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear all particles
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height)
    handleParticles();
    handleMouse();
    hue++;
    setTimeout(() =>
        requestAnimationFrame(animate)
        , 1000 / fps);
}
animate();