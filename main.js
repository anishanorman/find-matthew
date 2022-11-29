import Phaser from "phaser"

let gameState = {}

function checkKeysUp(keys) {
  for (let i=0; i<keys.length; i++) {
    if(keys[i].isDown) {
      return false
    }
  }
  return true
}

//load assets
function preload() {
  this.load.spritesheet('sam', './assets/sam-sprite.png', { frameWidth: 32, frameHeight: 41 })
  this.load.image('platform', './assets/platform.png')
  this.load.image('ladder',  './assets/ladder.png')
  this.load.image('background', './assets/office-background.png')
}

//Scene
function create() {

  gameState.active = true

  // background
  gameState.background = this.add.image(0, 0, "background").setOrigin(0)

  //platforms
  const platforms = this.physics.add.staticGroup()
    const platPositions = [389, 258, 127]
    platPositions.forEach(platform => {
      platforms.create(304, platform, 'platform')
    })

  //ladders
    const ladders = this.physics.add.staticGroup()
    const ladderPositions = [489, 454, 419, 384, 349, 314, 279, 244, 209, 174, 139, 104, 69]
    ladderPositions.forEach(y => {
      ladders.create(18, y, 'ladder')
    })

  //player
  gameState.player = this.physics.add.sprite(150, 480, "sam")

  //colliders
  this.physics.add.collider(gameState.player, platforms)
  gameState.player.setCollideWorldBounds(true)

  //animations
  this.anims.create({
    key: "run-left",
    frames: this.anims.generateFrameNumbers("sam", { start: 3, end: 5 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "run-right",
    frames: this.anims.generateFrameNumbers("sam", { start: 9, end: 11 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "dancing",
    frames: this.anims.generateFrameNumbers("sam", { start: 12, end: 14 }),
    frameRate: 8,
  })
  this.anims.create({
    key: "ladder",
    frames: this.anims.generateFrameNumbers("sam", { start: 6, end: 8 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "falling",
    frames: this.anims.generateFrameNumbers("sam", { start: 0, end: 2 }),
    frameRate: 13,
    repeat: -1
  })

  //camera
  this.cameras.main.setBounds(-20, -20, 607, 545)
  this.cameras.main.zoom = 1.3
  this.cameras.main.startFollow(gameState.player, true, 0.5, 0.5)

  //inputs
  gameState.cursors = this.input.keyboard.createCursorKeys()
  gameState.cursors.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
  gameState.cursors.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
  gameState.cursors.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
  gameState.cursors.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

  // ladder overlap
  this.physics.add.overlap(gameState.player, ladders, () => {
      console.log(gameState.player)
      if (gameState.cursors.space.isDown || gameState.cursors.up.isDown || gameState.cursors.w.isDown) {
        gameState.player.setVelocityY(-200)
        gameState.player.anims.play("ladder", true)
      } else if (gameState.cursors.down.isDown || gameState.cursors.shift.isDown || gameState.cursors.s.isDown) {
        gameState.player.anims.play("falling", true)
        gameState.player.setVelocityY(250)
      } else if (checkKeysUp(gameState.cursors) && !(gameState.player.body.onFloor())){
        gameState.player.setVelocityY(100)
        gameState.player.anims.play("ladder", true)
      }
  })

  //win condition


  //lose condition

}

//gameplay
function update() {
  if (gameState.active) {
    //travelling or idling
    if (gameState.cursors.right.isDown || gameState.cursors.d.isDown) {
      gameState.player.setVelocityX(250)
      gameState.player.anims.play("run-right", true)
    } else if (gameState.cursors.left.isDown || gameState.cursors.a.isDown) {
      gameState.player.setVelocityX(-250)
      gameState.player.anims.play("run-left", true)
    } 
    else if (checkKeysUp(gameState.cursors) && (gameState.player.body.onFloor())){
      gameState.player.anims.pause()
      gameState.player.setVelocityX(0) 
      gameState.player.setFrame(0)
    }
      
    //jump
    if ((gameState.cursors.space.isDown || gameState.cursors.up.isDown || gameState.cursors.w.isDown) && (gameState.player.body.onFloor())) {
      gameState.player.setVelocityY(-500);
    }  

  }
}

const config = {
  type: Phaser.AUTO,
  width: 571,
  height: 507,
  backgroundColor: 0x848587,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2000 },
      enableBody: true,
    }
  },
  scene: { preload, create, update, checkKeysUp }
}

const game = new Phaser.Game(config)