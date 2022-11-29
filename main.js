import Phaser from "phaser"

let gameState = {}

//load assets
function preload() {
  this.load.spritesheet('sam', './assets/sam-sprite.png', { frameWidth: 32, frameHeight: 40 })
  this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/platform.png')
  this.load.image('ladder',  './assets/ladder.png')
}

//Scene
function create() {

  gameState.active = true

  //platforms
  const platforms = this.physics.add.staticGroup()
    const platPositions = [
      { x: 50, y: 575 }, { x: 250, y: 575 }, { x: 450, y: 575 }, { x: 400, y: 380 }, { x: 155, y: 200 },
    ]
    platPositions.forEach(plat => {
      platforms.create(plat.x, plat.y, 'platform')
    })

  //ladders
    const ladders = this.physics.add.staticGroup()
    const ladderPositions = [528, 483, 438, 393, 348, 303, 258, 213, 168]
    ladderPositions.forEach(ladder => {
      ladders.create(25, ladder, 'ladder').setScale(0.3)
    })

  //player
  gameState.player = this.physics.add.sprite(350, 500, "sam").setScale(1.5)

  //colliders
  this.physics.add.collider(gameState.player, platforms)
  gameState.player.setCollideWorldBounds(true)

  //animations
  this.anims.create({
    key: "run-left",
    frames: this.anims.generateFrameNumbers("sam", { start: 3, end: 5 }),
    frameRate: 5,
    repeat: -1
  })
  this.anims.create({
    key: "run-right",
    frames: this.anims.generateFrameNumbers("sam", { start: 9, end: 11 }),
    frameRate: 5,
    repeat: -1
  })
  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("sam", { start: 0, end: 0 }),
    frameRate: 5,
    repeat: -1
  })
  this.anims.create({
    key: "climbing",
    frames: this.anims.generateFrameNumbers("sam", { start: 6, end: 8 }),
    frameRate: 5,
    repeat: -1
  })
  this.anims.create({
    key: "ladder-idle",
    frames: this.anims.generateFrameNumbers("sam", { start: 6, end: 6 }),
    frameRate: 5,
    repeat: -1
  })

  //inputs
  gameState.cursors = this.input.keyboard.createCursorKeys()

  //ladder overlap
  this.physics.add.overlap(gameState.player, ladders, () => {
    this.physics.config.gravity.y = 0
    gameState.player.anims.play("ladder-idle", true)
    if ((gameState.cursors.space.isDown || gameState.cursors.up.isDown)) {
      gameState.player.setVelocityY(-300)
    } 

  })

  //win condition


  //lose condition

}

//gameplay
function update() {
  if (gameState.active) {
    this.physics.config.gravity.y = 2000
    //travelling or idling
    if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(350)
      gameState.player.anims.play("run-right", true)
    } else if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-350)
      gameState.player.anims.play("run-left", true)
    } else {
      gameState.player.setVelocityX(0) 
      gameState.player.anims.play("idle", true)
    }

    //jump
    if ((gameState.cursors.space.isDown || gameState.cursors.up.isDown) && gameState.player.body.touching.down) {
      gameState.player.setVelocityY(-700);
    }  

    //climb

  }
}

const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 800,
  backgroundColor: 0xEEEEEE,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2000 },
      enableBody: true,
    }
  },
  scene: { preload, create, update }
}

const game = new Phaser.Game(config)