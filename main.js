let player;
let platforms = [];
let score = 0;
let game_state = "start";

// physical main settings
const GRAVITY = 0.4;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;

// the size of the platform
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;

// the edges of the platform
const EDGE_MARGIN = 10;

// the vertical space between the platforms
const GAP_MIN = 60;
const GAP_MAX = 115;

// the number of platform creating and testing
const TRY_COUNT = 12;

// the chanche for another bigger gap
const BIG_GAP_CHANCE = 0.12;

function setup() {
  createCanvas(600, 800); // make the screen 600x800 
  reset_game();
}

function draw() {
  background(220);

  
  // check the state of the game w this (start: started, gameover: ended)
  if (game_state === "start") return draw_start_screen();
  if (game_state === "gameover") return draw_game_over_screen();

  play_game();
}

function keyPressed() { // Space / Enter / R / r when u press these
  if (game_state === "start" && (keyCode === ENTER || key === " ")) {
    game_state = "playing";
    reset_game();
  }

  if (game_state === "gameover" && (key === "r" || key === "R" || key === " ")) {
    game_state = "playing";
    reset_game();
  }
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
  fill(255, 100, 100); // pastel kırmızı gibi
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

  player.update();
  player.show();

  // check the platforms one by one
  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];

    platform.update();
    platform.show();

    // if player falls to the platform again it breaks
    if (player.velocity > 0 && player.lands_on(platform)) {
      if (platform.type === "breakable") platform.broken = true;
      player.jump();
    }
if (!platform.passed && platform.y > player.y) {// if the player gets on the platform the score increases
      score++;
      platform.passed = true;
    }

    if (platform.broken) {  // if broken erase it
      platforms.splice(i, 1);
      continue;
    }

    if (platform.y > height) { // if the platform goes under make a new one
      platforms.splice(i, 1);
      spawn_platform();
    }
  }

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
}

function reset_game() {
  score = 0;
  player = new Player();
  platforms = [];
