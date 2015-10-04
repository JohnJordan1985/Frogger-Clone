
/**
* App.js provides the code relating to the behaviour of the various game
* characters - player, enemeies and collectables - that are displayed by
* the engine.js file.
*/

/**
 * global variable that represents game tile width.
 * @global
 */
var TILE_WIDTH = 101;

/**
 * global variable that represents game tile height.
 * @global
 */
 var TILE_HEIGHT = 80;

 /**
 * global variable that represents the full width of the game-board.
 * @global
 */
var CANVAS_WIDTH = 505;

/**
 * function that returns a random number between the min and max parameters
 * @function
 */
var randomSpeed = function(min, max) {
    var randomSpeed = Math.floor(Math.random()*(max - min + 1)) + min;
    return randomSpeed;
};

/**
 * Superclass for all game characters
 * @constructor
 */
var Character = function(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
};

/**
 * Draws the enemy on the screen, required method for game.
 * @function
 */
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Subclass of Character that creates enemies
 * @constructor
 */
var Enemy = function(x, y, sprite) {
    /**
     * Enemy class that player must avoid -initialised with defined x
     * and y co-ordinates and a random speed.
     */
    Character.call(this, x, y, sprite);
    this.speed = randomSpeed(100,240);
};

/**
 * Enemy class delegates to Character class.
 */
Enemy.prototype = Object.create(Character.prototype);

Enemy.prototype.constructor = Enemy;

/**
 * Resets enemy if beyond canvas boundary, else
 * updates position based on enemy instance's speed
 * @function
 */
 Enemy.prototype.update = function(dt) {
    if (this.x > CANVAS_WIDTH) {
        this.x = -50;
        this.speed = randomSpeed(100,240);
    } else {
    this.x = this.x + this.speed*dt;
    }
};

/**
 * Creates a player instance with defined x and y position
 * and a specified number of lives.
 * @constructor
 */
var Player = function(x, y, sprite, lives) {
    Character.call(this, x, y, sprite);
    this.lives = lives;
    this.score = 0;
};

/**
 * Player class delegates to Character class.
 */
Player.prototype = Object.create(Character.prototype);


Player.prototype.constructor = Player;

Player.prototype.handleInput = function(input) {
    /**
     * Called from addEventListener later in code and updates player
     * position based on input. Tests whether move will keep player
     * within game boundary
     */
    if (input === 'left' && this.x - TILE_WIDTH > 0) {
        this.x = this.x - 101;
    }
    if (input === 'right' && this.x + TILE_WIDTH < 500 ) {
        this.x = this.x + 101;
    }
    if (input === 'up' && this.y - TILE_HEIGHT > -21) {
        this.y = this.y - 80;
    }
    if (input === 'down' && this.y + TILE_HEIGHT < 410 ) {
        this.y = this.y + 80;
    }
};

/**
 * Resets player to default location.
 * @function
 */
Player.prototype.resetLoc = function() {
    this.x = 203;
    this.y = 300;
};

/**
 * Iterates through allEnemies array and checks for collisions.
 * @function
 */
Player.prototype.checkEnemyCollisions = function() {
    var self = this;
    allEnemies.forEach(function(enemy) {
        if (self.x - enemy.x < 70 && self.y - enemy.y < 50 && enemy.x - self.x < 70 && enemy.y - self.y < 50) {
            /**
             * If collision detected, player location reset and a life deducted.
             */
            self.resetLoc();
            self.lives -= 1;
        }
    });
};

/**
 * Checks if player has collected a gem and increases player's score by given gem's value.
 * @function
 */
Player.prototype.checkPlayerCollection = function() {
    var self = this;
    allGems.forEach(function(gem) {
        if (self.x - gem.x < 50 && self.y - gem.y < 50 && gem.x - self.x < 50 && gem.y - self.y < 50) {
            gem.resetRandomLoc();
            self.score += gem.valueScore;
        }
    });
};

/**
 * Method that checks if the player has collected a heart
 * and increases player lives by one if this is so.
 * @function
 */
Player.prototype.checkCollectHeart = function(heart) {
    var self = this;
    if (self.x - heart.x < 10 && self.y - heart.y < 50 && heart.x - self.x < 10 && heart.y - self.y < 50) {
        heart.resetRandomLoc();
        self.lives += 1;
    }
};

Player.prototype.update = function() {
    this.checkEnemyCollisions();
    this.checkPlayerCollection();
    this.checkCollectHeart(heart);
    if (this.y < 60) {
        /**
         * If player reaches water, score is increased and location reset.
         */
        this.resetLoc();
        this.score += 1;
    }
};

/**
 * Constructor for collectable items - both gem and heart objects
 * @constructor
 */
var Gem = function(sprite, minSpeed, maxSpeed, intervalDelay, valueScore) {
    /**
     * Creates a gem instance that player can collect to increase their score.
     * the parameter 'intervalDelay' sets the gem further back from the game screen on
     * creation/resetting thus reducing the frequency that it appears - I have created
     * instances later such that higher value gems appear less often etc.
     */
    Character.call(this, -150, this.startYPos(), sprite);
    this.speed = randomSpeed(minSpeed, maxSpeed);
    this.intervalDelay = intervalDelay;
    this.valueScore = valueScore;
};

Gem.prototype = Object.create(Character.prototype);

Gem.prototype.constructor = Gem;

/**
 * selects a random y co-ordinate starting point for gem,
 * as an integer, and returns it.
 * @function
 */
Gem.prototype.startYPos = function() {
    var startYPos = [60, 140];
    var yPos = startYPos[Math.floor(Math.random()*startYPos.length)];
    return yPos;
};

/**
 * Resets gem's position after player collection, collision with
 * another gem/heart or with an enemy.
 * @function
 */
Gem.prototype.resetRandomLoc = function() {
    this.y = this.startYPos();
    /**
     * Gems that appear less frequently are sent further back along x-axis
     * when .resetRandomLoc called. Since they have longer to travel to appear
     * on game screen, they appear less frequently. Employed this approach as I
     * could not get in-built methods like setInterval etc. to work for me to delay gem respawning.
     */
    this.x = -CANVAS_WIDTH*this.intervalDelay;
};

Gem.prototype.checkBugCollisions = function() {
    var self = this;
    allEnemies.forEach(function(enemy) {
        if (self.x - enemy.x < 85 && self.y - enemy.y < 50 && enemy.x - self.x < 85 && enemy.y - self.y < 50) {
            self.resetRandomLoc();
        }
    });
};

Gem.prototype.checkGemCollisions = function(){
    var self = this;
    allGems.forEach(function(otherGem) {
        /**
         * Tests if gem has collided with a gem in allGems array OTHER than itself.
         */
        if (self.x - otherGem.x < 90 && self.y - otherGem.y < 50 && otherGem.x - self.x < 90 && otherGem.y - self.y < 50 && self !== otherGem) {
            /**
             * If two gems, or a gem and a heart collide, BOTH objects are reset.
             */
            self.resetRandomLoc();
            otherGem.resetRandomLoc();
        }
    });
};

Gem.prototype.update = function(dt) {
    this.checkBugCollisions();
    this.checkGemCollisions();
    if (this.x > CANVAS_WIDTH) {
        this.resetRandomLoc();
    }
    this.x = this.x + this.speed*dt;
};

var enemyBottom = new Enemy(-50, 220, 'images/enemy-bug.png');

var enemyMiddle = new Enemy(-50, 140, 'images/enemy-bug.png');

var enemyTop = new Enemy(-50, 60, 'images/enemy-bug.png');

var allEnemies = [];

/**
 * Created three enemies and pushed them to array allEnemies, as directed.
 */
allEnemies.push(enemyBottom, enemyMiddle, enemyTop);


var allGems = [];

var gemBlue = new Gem('images/Gem Blue.png', 200, 300, 1, 5);

var gemGreen = new Gem('images/Gem Green.png', 300, 400, 7.5, 10);

var gemOrange = new Gem('images/Gem Orange.png', 400, 500, 10, 20);

/**
 * Heart object is an instance of Gem class with no score associated with it.
 */
var heart = new Gem('images/Heart.png', 300, 400, 4, 0);

allGems.push(gemBlue, gemGreen, gemOrange);

var player = new Player(203, 300, 'images/char-boy.png', 1);

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    if (player.lives > 0) {
        /**
         * if player has no lives left, user input prohibited.
         */
        player.handleInput(allowedKeys[e.keyCode]);
    }
});