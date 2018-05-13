// This sectin contains some game constants. It is not super interesting
let GAME_WIDTH;
let GAME_HEIGHT;

const GAME_SPEED = 1.5;

const ENEMY_BASE_RADIUS = 50;
const ENEMY_MIN_RADIUS = 50;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;
const SHOOT_SPEED = 20;

// These two constants keep us from using "magic numbers" in our code
const LEFT_ARROW_CODE = 37;
const RIGHT_ARROW_CODE = 39;

// These two constants allow us to DRY
const MOVE_LEFT = 'left';
const MOVE_RIGHT = 'right';

// Global letiables
let gameEngine;
let canvas;
let ctx;
let keys = { 'left': false, 'right': false, 'space': false };
const color = {
    'blue': '#4deeea',
    'green': '#74ee15',
    'yellow': '#ffe700',
    'pink': '#f000ff',
    'red': '#fe0000',
    'orange': '#FD5F00',
};
let bullets = Array(100).fill();
let sparks = Array(25).fill();
let powerUps = Array(3).fill();
let enemies = Array(50).fill();
let explosions = Array(10).fill();
let lastPowerUp = 0;
let background;
let lastFrame = 0;
let sounds = {};
let elements = {};
let shootFX = Array(10).fill().map(el=>new Audio('sounds/shoot.mp3'));
let explosionFX = Array(10).fill().map(el=>new Audio('sounds/explosion.mp3'));
let hitFX = Array(10).fill().map(el=>new Audio('sounds/hit.mp3'));
shootFX.forEach(el=>el.volume=0.2);
hitFX.forEach(fx=>fx.volume = 0.5)
explosionFX.forEach(fx=>fx.volume = 1)


const enemyImage = enemyImageGenerator();
const sparksImage = sparksGenerator();
const explosionsImage = explosionGenerator();
const playerImage = playerGenerator();
const bulletImage = bulletGenerator();
const powerUpImage = powerUpGenerator();

// A class to create popup elements on screen
class Popup {
    constructor(element, func, str, buttonStr) {
        let popup = document.createElement('div');
        popup.style.display = 'none';
        popup.classList += 'popup';
        popup.innerText = str;
        let button = document.createElement('button');
        button.addEventListener('click', func);
        button.innerText = buttonStr
        popup.appendChild(button);
        element.appendChild(popup);
        this.popup = popup;
        this.button = button;
    }
    show() {
        this.popup.style.display = 'block'
    }
    hide () {
        this.popup.style.display = 'none'
    }
}


/**
* An entity is anything that will be rendered on screen
* 
* @class Entity
*/
class Entity {
    constructor(x, y, radius, image) {
        this.x = x;
        this.y = y;
        this.visible = false;
        this.radius = radius;
        this.speed = 0;
        this.image = new Image();
        this.image.src = image;
    }
    add(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
    }
    randomAdd() {
        this.add(Math.floor(Math.random() * GAME_WIDTH), -this.radius);
    }
    moveOffScreen() {
        this.x = -1000;
        this.y = -1000;
        this.visible = false;
    }
    moveToStaging() {
        this.x = Math.floor(Math.random() * GAME_WIDTH);
        this.y = -175;
        this.visible = true;
    }
    update(timeDiff) {
        this.y += Math.floor(this.speed * timeDiff);
        return this;
    }
    isNearArr(arr) {
        return arr.some((element) => {
            return this.radius + element.radius > distanceBetween(element, this);
        });
    }
    isNear(element) {
        return this.radius + element.radius > distanceBetween(element, this)
    }
    render() {
        ctx.drawImage(this.image, this.x - this.image.width / 2, this.y - this.image.height / 2)
    }
}

class Sparks extends Entity {
    constructor() {
        super(-1000, -1000, 80, sparksImage)
        this.creationTime = 0;
        this.move = this.move.bind(this);
        this.update = this.update.bind(this);
        this.age = 0;
        this.size = 80;
        this.maxAge = 250;
    }
    render(currentFrame) {
        ctx.drawImage(this.image, 0 + Math.floor((this.age / 5) % 3) * this.size, 0, this.size, this.size, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
        this.age++;
    }
    update(currentFrame) {
        if (currentFrame - this.creationTime > this.maxAge) {
            this.age = 0;
            this.creationTime = 0;
            this.moveOffScreen();
        };
    }
    move(x, y, time) {
        this.x = x;
        this.y = y;
        this.visible = true;
        this.creationTime = time;
    }
}

class Explosion extends Sparks {
    constructor() {
        super(-1000,-1000, 100);
        this.age = 0;
        this.size = 200;
        this.radius = 50;
        this.maxAge = 1000;
        this.image.src = explosionsImage;
    }
}

// This section is where you will be doing most of your coding
class Enemy extends Entity {
    constructor() {
        super(-1000, -1000, ENEMY_BASE_RADIUS, enemyImage);
        this.radius = ENEMY_BASE_RADIUS;
        // Each enemy should have a different speed
        this.speed = Math.random() / 5;
        this.hp = 20;
        this.MAX_HP = 20;
    }
    hit(hits) {
        this.hp -= hits;
    }
}

class Player extends Entity {
    constructor() {
        super(GAME_WIDTH / 2, GAME_HEIGHT - 100, 30, playerImage);
        this.power = 2000;
        this.speed = 0;
        this.acc = 0;
        this.maxSpeed = 8;
        this.lastShot = 0;
        this.lastGun = 1;
        this.lives = 3;
    }
    
    update(timeDiff) {
        if (keys.left) {
            this.speed -= 0.05;
        }
        if (keys.right) {
            this.speed += 0.05;
        }
        if (keys.space) {
        }
        if (Math.abs(this.speed) > this.maxSpeed) this.speed = this.maxSpeed * this.speed / Math.abs(this.speed);
        if (this.x > 40 && this.x < GAME_WIDTH - 40) {
            this.x += this.speed * timeDiff;
            this.speed *= 0.95;
        } else if (this.x < 40) {
            this.speed = 0;
            this.x = 41
        } else if (this.x > GAME_WIDTH - 40) {
            this.speed = 0;
            this.x = GAME_WIDTH - 41
        }
    }
    shoot(bullet, time) {
        if (!bullet || this.power < 1) return;
        if (time - this.lastShot < SHOOT_SPEED) return;
        bullet.visible = true;
        if (this.lastGun > 0) {
            bullet.x = this.x + 35;
            bullet.y = this.y - 5;
        } else {
            bullet.x = this.x - 35;
            bullet.y = this.y - 5;
        }
        if (this.power > 0) this.power -= 10;
        if (time%3 ==0 ){
            let fx = shootFX.find(el=>el.paused);
            if (fx) fx.play();
        }
        this.lastGun *= -1;
        this.lastShot = time
    }
}


class Bullet extends Entity {
    constructor() {
        super(-10, -10, 10, bulletImage);
        this.speed = -0.35
    }
}

class PowerUp extends Entity {
    constructor(x, y) {
        super(x, y, 20, powerUpImage);
        this.speed = 0.25;
    }
}

class SpeedUp extends Entity {
    constructor(x, y) {
        super(x, y, 10);
        this.speed = 0.35;
    }
}


class Background {
    constructor() {
        this.gridSize = 50;
        this.offScreenCanvas = document.createElement('canvas');
        this.offScreenCanvas.width = GAME_WIDTH;
        this.offScreenCanvas.height = GAME_HEIGHT * 2;
        this.offScreenContext = this.offScreenCanvas.getContext('2d');
        this.offScreenContext.fillStyle = 'black';
        this.offScreenContext.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.offScreenContext.strokeStyle = 'purple';
        this.offScreenContext.shadowColor = 'purple';
        this.offScreenContext.shadowBlur = 8;
        this.offScreenContext.lineWidth = 2;
        for (let i = 0; i < GAME_WIDTH / this.gridSize; i++) {
            for (let j = 0; j < GAME_HEIGHT / this.gridSize; j++) {
                this.offScreenContext.rect(i * this.gridSize, j * this.gridSize, this.gridSize, this.gridSize)
            }
        }
        this.offScreenContext.stroke();
        this.image = this.offScreenContext.getImageData(0, 0, GAME_WIDTH, GAME_HEIGHT * 2);
    }
    
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor() {
        // Setup the player
        this.player = new Player();
        
        // Set the initial number of enemies on the screen;
        this.enemiesOnScreen = 2;
        
        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
        
        // Last time score was written to DOM
        this.lastDomRefresh = 0;
        
        this.gameOverPopUp = new Popup(elements.grid, ()=>this.reStart(),'Game Over!', 'Replay?');
        this.PausePopUp = new Popup(elements.grid, ()=>{

            this.lastFrame = Date.now()
            requestAnimationFrame(this.gameLoop);
            this.PausePopUp.hide();

        },'Game Paused', 'Resume?');
        this.startPopUp = new Popup(elements.grid, ()=>{
            this.gameLoop();
            this.startPopUp.hide();
        },'Ready?', 'Start Game');
    }
    
    
    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        let enemySpots = GAME_WIDTH / ENEMY_BASE_RADIUS;
        let enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (!enemySpot && this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }
        
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_BASE_RADIUS, ENEMY_BASE_RADIUS);
    }
    
    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();
        
        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                keys.left = true;
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                keys.right = true;
            } else if (e.keyCode === 32) {
                keys.space = true;
            } else if (e.keyCode === 27) {
                keys.esc = true;
            }
        });
        document.addEventListener('keyup', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                keys.left = false;
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                keys.right = false;
            } else if (e.keyCode === 32) {
                keys.space = false;
            } else if (e.keyCode === 27) {
                keys.esc = false;
            }
        });
        
        // Initialize global vars
        bullets = bullets.map(el => new Bullet());
        sparks = sparks.map(s => new Sparks())
        powerUps = powerUps.map(p => new PowerUp());
        enemies = enemies.map(e => new Enemy());
        explosions = explosions.map(e => new Explosion())
        background = new Background();
        sounds.background = new Audio('sounds/Cybercity - A Synthwave Mix ⚡ (Synthwave Futuresynth Retro.mp3')
        sounds.background.currentTime = 2360;
        sounds.background.play();
        this.startPopUp.show();
    }
    reStart () {
        this.gameOverPopUp.hide();
        this.score = 0;
        this.enemiesOnScreen = 2;
        this.player.x = GAME_WIDTH / 2;
        this.player.speed = 0;
        this.lastFrame = Date.now();
        [...bullets, ...sparks, ...powerUps,...enemies, ...explosions].filter(isVisible).forEach(element=>element.moveOffScreen());
        this.gameLoop();
    }
    
    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill
    
    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
    */
    gameLoop() {
        // Check how long it's been since last frame
        let currentFrame = Date.now();
        let timeDiff = currentFrame - this.lastFrame;
        
        // Increase the score!
        this.score += timeDiff;
        
        // Draw everything!
        
        // Draw the generated background
        ctx.lineWidth = 4;
        ctx.save();
        let xoff = Math.floor(currentFrame * 0.10 % GAME_HEIGHT)
        ctx.putImageData(background.image, 0, xoff, 0, 0, GAME_WIDTH, GAME_HEIGHT)
        ctx.putImageData(background.image, 0, xoff - GAME_HEIGHT + 5, 0, 0, GAME_WIDTH, GAME_HEIGHT)
        ctx.restore();
        
        
        // Call update on all enemies
        
        let onscreenEnemies = enemies.filter(isVisible);
        if (onscreenEnemies.length < this.enemiesOnScreen) {
            let newEnemy = enemies.find(notVisible);
            if (newEnemy) {
                newEnemy.moveToStaging();
            }
        }
        
        // Update and render ENEMIES
        onscreenEnemies.forEach(enemy => {
            if (!enemy) return;
            enemy.update(timeDiff);
            enemy.render();
        })
        
        
        // update the player
        this.player.update(timeDiff);
        
        // determine onscreenBullets bullets
        bullets.forEach(setIsVisible);
        let onscreenBullets = bullets.filter(isVisible);
        
        // Update and render bullets
        onscreenBullets.forEach(bullet => {
            if (!bullet) return;
            bullet.update(timeDiff);
            bullet.render();
        });
        
        // Add Power Ups
        if (currentFrame - lastPowerUp > 5000) {
            let x = powerUps.find(notVisible);
            if (x) x.randomAdd();
            lastPowerUp = currentFrame;
        }
        
        // // as the score increases increase the number of enemies
        // if (Math.floor(this.score/1000)%3===0) {
        //     this.enemiesOnScreen++;
        //     console.log(this.enemiesOnScreen);
            
        // }

        // Check if any enemies should die
        enemies.filter(isVisible).forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT + ENEMY_BASE_RADIUS) {
                // if the enemy has moved off the screen kill it
                enemy.moveOffScreen();
                enemy.hp = 10;
            } else if (enemy.hp < 0) {
                // if the enemy has less than 0 hp kill it and spawn an explosion
                let availableExplosion = explosions.find(notVisible);
                if (availableExplosion) availableExplosion.move(enemy.x, enemy.y, currentFrame);
                let fx = explosionFX.find(el=>el.paused)
                if (fx) fx.play();
                enemy.moveOffScreen();
                enemy.hp = enemy.MAX_HP;
                // console.log('kill enemy');
                
                this.enemiesOnScreen++; 

            } else if (onscreenBullets.length > 0) {
                let hits = onscreenBullets.filter(bullet => distanceBetween(bullet, enemy) < enemy.radius);
                if (hits.length > 0) {
                    findAndPlay(hitFX);
                    enemy.hit(hits.length);
                    hits.forEach(hit => {
                        let available = sparks.find(notVisible);
                        if (available) available.move(hit.x, hit.y, currentFrame);
                        hit.moveOffScreen();
                    })
                }
            }
        });
        
        
        // If player intersects with powerup, give power to player
        powerUps.forEach((powerUp, i) => {
            if (this.player.isNear(powerUp)) {
                this.player.power += 2000;
                powerUps[i].moveOffScreen()
            }
        })
        
        // draw the player
        this.player.render(ctx);
        
        //determine onscreen powerups
        powerUps.forEach(setIsVisible)
        
        // Update and render powerups
        powerUps.filter(isVisible).forEach(powerUp => {
            powerUp.update(timeDiff)
            powerUp.render(ctx);
        });
        
        // Update and render sparks
        sparks.filter(s => s.visible).forEach((spark, i) => {
            spark.render(currentFrame);
            spark.update(currentFrame);
        })
        // Update and render explosions
        explosions.filter(s => s.visible).forEach((explosion, i) => {
            explosion.render(currentFrame);
            explosion.update(currentFrame);
        })
        
        
        
        // if space is down shoot bullet
        if (keys.space) {
            this.player.shoot(bullets.find(notVisible), currentFrame)
            
        }
        
        
        // Check if player is dead
        if (this.player.isNearArr(enemies)) {
            // If they are dead, then it's game over!
            this.gameOverPopUp.show();
            
        } else if(keys.esc) {
            this.PausePopUp.show();
        } else {
            // If player is not dead, then draw the score
            if (currentFrame - this.lastDomRefresh > 100) {
                elements.score.innerText = this.score;
                elements.power.innerText = this.player.power;
                this.lastDomRefresh = currentFrame;
            }
            // If escape is pressed abort game
            
            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
}


// This section will start the game
window.onload = () => {
    // GAME_WIDTH = Math.floor(window.innerWidth * 0.5);
    // GAME_HEIGHT = Math.floor(window.innerHeight * 0.9);
    canvas = document.querySelector('canvas');
    // canvas.width = GAME_WIDTH;
    // canvas.height = GAME_HEIGHT;
    GAME_WIDTH = canvas.width
    GAME_HEIGHT = canvas.height
    
    elements.score = document.querySelector('.score');
    elements.power = document.querySelector('.power');
    elements.grid = document.querySelector('.grid');
    elements.popup = document.querySelector('.popup')
    popup = popup(elements.popup);
    
    
    
    ctx = canvas.getContext('2d');
    gameEngine = new Engine();
    gameEngine.start();
}