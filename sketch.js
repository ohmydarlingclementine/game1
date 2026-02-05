let player;
let platforms = [];
let score = 0;
let game_state = "start";
// controls which screen is shown


// physical main settings
const GRAVITY = 0.4;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;
// sag sol

// the size of the platform
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;

// prevents platforms from spawning too close to screen edges
const EDGE_MARGIN = 10;

// the vertical space between the platforms
const GAP_MIN = 60;
const GAP_MAX = 115;

// the number of platform creating and testing
const TRY_COUNT = 12;

// the chanche for another bigger gap
const BIG_GAP_CHANCE = 0.12;
//12 sans 8 taneden 1 i zorlastirdi

function setup() {
  createCanvas(600, 800); // make the screen 600x800 
  reset_game();
}

function draw() {
  background(220);
    // clears the screen every frame


  
  // check the state of the game w this (start: started, gameover: ended)
  if (game_state === "start") return draw_start_screen();
  
  if (game_state === "gameover") return draw_game_over_screen();
    // oyun su an hangi durumda return der dur



  play_game();
    // otherwise run the main game logic
}

function keyPressed() { // Space / Enter / R / r when u press these
  if (game_state === "start" && (keyCode === ENTER || key === " ")) {
    game_state = "playing";
    reset_game();
  }
    // starts the game from the menu


  if (game_state === "gameover" && (key === "r" || key === "R" || key === " ")) {
    game_state = "playing";
    reset_game();
  }
  // restarts the game after losing
}

// main screen 
function draw_start_screen() {
  textAlign(CENTER);
  fill(0);

  textSize(32);
  text("Escape the Tower", width / 2, height / 2 - 40);

  textSize(16);
  text("To start press ENTER or SPACE", width / 2, height / 2 + 10);
  text("To move you can use ARROW KEYS or A/D ", width / 2, height / 2 + 40);

 
   // the color description (for player to understand)
  text("Green: stable  |  Blue: moves right and left  |  Yellow: moves up and down", width / 2, height / 2 + 95);
  text("Red: fragile (it breaks when you press it)", width / 2, height / 2 + 125);
}

// losing screen
function draw_game_over_screen() {
  textAlign(CENTER);

  textSize(32);
  fill(200, 0, 0);
  text("YOU LOST!", width / 2, height / 2 - 40);

  textSize(20);
  fill(255, 100, 100); // like pastel red
  text("YOUR SCORE: " + score, width / 2, height / 2);

  textSize(16);
  fill(0);
  text("Press R or Space to play again", width / 2, height / 2 + 40);
}

// game's main mode
function play_game() {
  // score text
  fill(0);
  textAlign(LEFT);
  textSize(20);
  text("Score " + score, 10, 30);
  // display current score

  player.update();
    // applies gravity and movement

  player.show();
    // draws the player


  // check the platforms one by one
  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];

    platform.update();
    platform.show();

    // if player falls to the platform again it breaks
    if (player.velocity > 0 && player.lands_on(platform)) {

      if (platform.type === "breakable") platform.broken = true;
      player.jump();
            // resets vertical velocity

    }

    if (!platform.passed && platform.y > player.y) {// if the player gets on the platform the score increases
      score++;
      platform.passed = true;
    }
        // gectikce puan


    
    if (platform.broken) {  // if broken erase it
      platforms.splice(i, 1);
      continue;
    }
        // remove broken platforms


    if (platform.y > height) { // if the platform goes under make a new one
      platforms.splice(i, 1);
      spawn_platform();
          // recycle platforms that fall off screen

    }
  }
  
//kamera efekti
  // platforms and player's going down situation
  if (player.y < height / 2) {
    const diff = height / 2 - player.y;
    player.y = height / 2;

    for (const platform of platforms) {
      platform.y += diff;

      if (platform.type === "moving" && platform.axis === "y") {
        platform.start_y += diff;
      }
    }
  }

  if (player.y > height) game_state = "gameover"; // if player goes under the screen game ends


  while (platforms.length < 15) spawn_platform();
    // find the highest platform to place new one above it

}


function reset_game() {
  score = 0;
  player = new Player();
  platforms = [];
  

  // the lowest platform
  const ground = new Platform(0, height - 20, "normal", width);
  ground.passed = true;
  platforms.push(ground);
  

  const start_y = height - 20 - 95;
  const first_x = random(EDGE_MARGIN, width - PLATFORM_WIDTH - EDGE_MARGIN);
  platforms.push(new Platform(first_x, start_y, "normal"));

  while (platforms.length < 18) spawn_platform();
}


// finds the highest platform on the screen (y the lowest)
function the_highest_platform() {
  if (!platforms.length) return null;

  let top = platforms[0];
  for (const platform of platforms) {
    if (platform.y < top.y) top = platform;
  }
  return top;
}

// prevents the platforms to be so close to each other
function can_put_platform(x, y, w) {
  for (const p of platforms) {
    const overlap_x = !(x + w < p.x || x > p.x + p.w);
    const overlap_y = !(y + PLATFORM_HEIGHT < p.y || y > p.y + p.h);
    if (overlap_x && overlap_y) return false;

    if (abs(p.y - y) < 18 && abs((p.x + p.w / 2) - (x + w / 2)) < 55) return false;
  }
  return true;
}

// adds a new platform
function spawn_platform() {
  // reference: make a new platform on the top of the last
  let ref = the_highest_platform();
  if (!ref) ref = { x: width / 2 - PLATFORM_WIDTH / 2, y: height - 120, w: PLATFORM_WIDTH };

  // normally we pick a lil higher than thew y ref
  let chosen_x = random(EDGE_MARGIN, width - PLATFORM_WIDTH - EDGE_MARGIN);
  let chosen_y = ref.y - random(GAP_MIN, GAP_MAX);

  // gap for the platforms that moves up and down
  let bigGap = random() < BIG_GAP_CHANCE;
  if (bigGap && platforms.length < 6) bigGap = false;

  if (bigGap) {
    chosen_y -= random(35, 80);
  }

  let gap = ref.y - chosen_y;
  //İki platform arasındaki dikey mesafe
  let dxMax = 170 - gap * 0.75;
  //yatay mesafeyi, dikey mesafeye göre
  if (dxMax < 60) dxMax = 60;
  if (dxMax > 220) dxMax = 220;

  let w = PLATFORM_WIDTH;
  if (random() < 0.06) w = random(100, 140);

  for (let i = 0; i < TRY_COUNT; i++) {
    let x = ref.x + random(-dxMax, dxMax);
    x = constrain(x, EDGE_MARGIN, width - w - EDGE_MARGIN);

    let y = chosen_y + random(-6, 6);

    if (can_put_platform(x, y, w)) {
      //platform koymak icin guvenli alan mi
      chosen_x = x;
      chosen_y = y;
      break;
      //loop durur bulunca
    }

    if (i === 5) chosen_y = ref.y - random(GAP_MIN, GAP_MAX);
  }

  let type = "normal";
  let r = random(1);

  if (bigGap) {
    type = "moving";
  } else {
    if (r < 0.22) type = "breakable";
    else if (r < 0.38) type = "moving";
  }

  const platform = new Platform(chosen_x, chosen_y, type, w);

  // in a situation of big gap durumunda push vertical move
  if (bigGap) {
    platform.axis = "y";
    platform.range = random(45, 110);
    platform.speed = 2;
    platform.start_y = chosen_y;
    platform.y = platform.start_y + random(-platform.range, platform.range);
  }

  platforms.push(platform);
}

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.velocity = 0;
    this.size = 30;
  }

  update() {
    // gravity
    this.velocity += GRAVITY;
    this.y += this.velocity;

    // movement
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= MOVE_SPEED;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += MOVE_SPEED;

    // the ones go from right goes left (wrap)
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;


  }

  // players shape
  show() {
    fill(0, 150, 255);
    noStroke();
    ellipse(this.x, this.y, this.size);

    fill(255);
    ellipse(this.x - 5, this.y - 5, 8);
    ellipse(this.x + 5, this.y - 5, 8);

    fill(0);
    ellipse(this.x - 5, this.y - 5, 3);
    ellipse(this.x + 5, this.y - 5, 3);
  }

  jump() {
    this.velocity = JUMP_FORCE;
  }
  // the control to see if the player has pressed the platform
  lands_on(platform) {
    const r = this.size * 0.5;
    return (
      this.x + r > platform.x &&
      this.x - r < platform.x + platform.w &&
      this.y + r > platform.y &&
      this.y + r < platform.y + platform.h + 6
    );
  }
}

class Platform {
  constructor(x, y, type, w) {
    this.x = x;
    this.y = y;

    this.w = (w !== undefined ? w : PLATFORM_WIDTH);
    this.h = PLATFORM_HEIGHT;

    this.type = type;

    this.broken = false;
    this.passed = false;

    // moving platform settings
    this.axis = null;
    this.range = 50;
    this.start_y = y;

    // speed direction etc
    this.speed = random(1, 3);
    this.direction = 1;

    // if its moving draw x/y pick
    if (this.type === "moving") {
      this.axis = random() < 0.55 ? "x" : "y";

      if (this.axis === "y") {
        this.speed = 2;
        this.range = random(35, 90);
        this.y = this.start_y + random(-this.range, this.range);
      } else {
        this.speed = random(1.2, 2.6);
      }
    }
  }

  update() {
    if (this.type !== "moving") return;

    // BLUE that goes right and left
    if (this.axis === "x") {
      this.x += this.speed * this.direction;
      if (this.x > width - this.w || this.x < 0) this.direction *= -1;
      return;
    }

    // YELLOW that goes up and down
    this.y += this.speed * this.direction;
    if (this.y > this.start_y + this.range || this.y < this.start_y - this.range) this.direction *= -1;
  }

  show() {
    if (this.type === "normal") {
      fill(100, 255, 100);
    } else if (this.type === "breakable") {
      fill(150, 50, 50);
    } else {
      if (this.axis === "y") fill(255, 255, 0);
      else fill(100, 100, 255);
    }

    // platform drawing
    stroke(0);
    rect(this.x, this.y, this.w, this.h, 5);
  }
}
