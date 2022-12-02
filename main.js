import Phaser from "phaser"

let time = 21
let gameState = {
  timeLeft: time,
}

function checkKeysUp(keys) {
  for (let i=0; i<keys.length; i++) {
    if(keys[i].isDown) {
      return false
    }
  }
  return true
}

function formatTime(time) {
  let mins = `${Math.floor(time/60)}`
  let secs = `${time%60}`
  return `${mins.padStart(2, "0")}:${secs.padStart(2, "0")}`
}

//load assets
function preload() {
  this.load.spritesheet('sam', './assets/sam-sprite.png', { frameWidth: 32, frameHeight: 41 })
  this.load.image('platform', './assets/platform.png')
  this.load.image('ladder',  './assets/ladder.png')
  this.load.image('background', './assets/office-background.png')
  this.load.spritesheet('david', "./assets/david-sprite.png", { frameWidth: 32, frameHeight: 36 })
  this.load.audio("davidSound", './assets/sounds/david-sound.mp3')
  this.load.audio("davidSound2", './assets/sounds/david-sound2.mp3')
  this.load.audio("guardian-music", "./assets/sounds/guardian-music.mp3")
  this.load.audio("crash", "./assets/sounds/crash.wav")
  this.load.spritesheet("matthew", "./assets/matthew-sprite.png", { frameWidth: 32, frameHeight: 32 })
}

function create() {

  gameState.win = false
  gameState.active = true
  gameState.canMove = true
  gameState.endWait = ""

  // background
  gameState.background = this.add.image(0, 0, "background").setOrigin(0)

  //win area
  gameState.winArea = this.add.rectangle(500, 57, 140, 112, 0xFFFFFF)
  this.physics.add.existing(gameState.winArea).setAlpha(0)
  gameState.winArea.body.setAllowGravity(false)

  //sounds
  gameState.sfx = {}
  gameState.sfx.davidSound = this.sound.add("davidSound").setVolume(0.3)
  gameState.sfx.davidSound2 = this.sound.add("davidSound2").setVolume(0.3)
  gameState.sfx.guardian = this.sound.add("guardian-music")
  gameState.sfx.crash = this.sound.add("crash").setVolume(0.1)

  //platforms
  const platforms = this.physics.add.staticGroup()
    const platPositions = [389, 258, 127]
    platPositions.forEach(platform => {
      platforms.create(304, platform, 'platform')
    })

  //ladders
  const ladders = this.physics.add.staticGroup()
  const ladderPositions = [493, 465, 437, 409, 381, 353, 325, 297, 269, 241, 213, 185, 157, 129, 101, 73]
  ladderPositions.forEach(y => {
    ladders.create(16, y, 'ladder')
  })

  //timer
  let timerElements = [
    this.add.rectangle(286, 75, 572, 40, 0xd2d2d2),
    gameState.timeText = this.add.text(150, 68, `${formatTime(gameState.timeLeft)}`, { fontFamily: "Arial", color: 0x1d97b5})
  ]
  timerElements.forEach((element) => { element.setScrollFactor(0, 0) })
  this.time.addEvent({
    delay: 1000,
    callback: () => {
      gameState.timeLeft-=1
    },
    callbackScope: this,
    loop: true,
  })

  //danger overlay
  gameState.dangerScreen = this.add.rectangle(286, 295, 500, 400, 0xFF0000).setScrollFactor(0, 0).setAlpha(0)

  //player
  gameState.player = this.physics.add.sprite(540, 90, "sam")

  //matthew
  gameState.matthew = this.physics.add.sprite(550, 350, "matthew").setScale(1.1)

  //david
  gameState.enemy = this.physics.add.sprite(150, 350, "david")

  //colliders
  this.physics.add.collider([gameState.player, gameState.enemy, gameState.matthew], platforms)
  this.physics.add.collider(gameState.player, gameState.matthew, () => {
    gameState.matthew.follow = true
  })
  gameState.player.setCollideWorldBounds(true)
  gameState.matthew.setCollideWorldBounds(true)

  //player comes into contact with david
  this.physics.add.overlap(gameState.player, gameState.enemy, () => {
    gameState.sfx.davidSound2.play()
    this.physics.pause()
    gameState.enemy.move.stop()
    this.anims.pauseAll()
    gameState.canMove = false
    gameState.endWait = gameState.timeLeft-5
  })


  //sam animations
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
    repeat: -1
  })
  this.anims.create({
    key: "ladder",
    frames: this.anims.generateFrameNumbers("sam", { start: 6, end: 8 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "falling",
    frames: this.anims.generateFrameNumbers("sam", { frames: [16, 17]}),
    frameRate: 8,
    repeat: -1
  })

  //david animations
  this.anims.create({
    key: "driving",
    frames: this.anims.generateFrameNumbers("david", { frames: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2]}),
    frameRate: 6,
    repeat: -1,
  })
  gameState.enemy.anims.play("driving", true)

  // matthew animations
  this.anims.create({
    key: "run-left-m",
    frames: this.anims.generateFrameNumbers("matthew", { start: 3, end: 5 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "run-right-m",
    frames: this.anims.generateFrameNumbers("matthew", { start: 9, end: 11 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "dancing-m",
    frames: this.anims.generateFrameNumbers("matthew", { start: 12, end: 14 }),
    frameRate: 8,
    repeat: -1
  })
  this.anims.create({
    key: "ladder-m",
    frames: this.anims.generateFrameNumbers("matthew", { start: 6, end: 8 }),
    frameRate: 8,
    repeat: -1
  })

  //camera
  this.cameras.main.setBounds(-20, -55, 607, 585)
  this.cameras.main.zoom = 1.3
  this.cameras.main.startFollow(gameState.player, true, 0.5, 0.5)

  //inputs
  gameState.cursors = this.input.keyboard.createCursorKeys()
  gameState.cursors.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
  gameState.cursors.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
  gameState.cursors.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
  gameState.cursors.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

  // ladder overlap for sam
  this.physics.add.overlap(gameState.player, ladders, () => {
      if (gameState.cursors.space.isDown || gameState.cursors.up.isDown || gameState.cursors.w.isDown) {
        gameState.player.setVelocityY(-200)
        gameState.player.anims.play("ladder", true)
      } else if (gameState.cursors.down.isDown || gameState.cursors.s.isDown) {
        gameState.player.anims.play("falling", true)
        gameState.player.setVelocityY(250)
      } else if (checkKeysUp(gameState.cursors) && !(gameState.player.body.onFloor())){
        gameState.player.setVelocityY(100)
        gameState.player.anims.play("ladder", true)
      }
  })
  // ladder overlap for matthew
  this.physics.add.overlap(gameState.matthew, ladders, () => {
    if (gameState.cursors.space.isDown || gameState.cursors.up.isDown || gameState.cursors.w.isDown) {
      gameState.matthew.setVelocityY(-200)
      gameState.matthew.anims.play("ladder-m", true)
    } else if (gameState.cursors.down.isDown || gameState.cursors.s.isDown) {
      gameState.matthew.anims.play("falling-m", true)
      gameState.matthew.setVelocityY(250)
    } else if (checkKeysUp(gameState.cursors) && !(gameState.player.body.onFloor())){
      gameState.matthew.setVelocityY(100)
      gameState.matthew.anims.play("ladder-m", true)
    }
})

  //david drives tween
  gameState.enemy.move = this.tweens.add({
    targets: gameState.enemy,
    x: 400,
    ease: 'Quad.easeInOut',
    duration: 1500,
    repeat: -1,
    yoyo: true,
  })

  //david leaves tween
  gameState.enemy.leave = this.tweens.add({
    targets: gameState.enemy,
    x: 1000,
    ease: "Linear",
    duration: 1500,
    repeat: 1,
  })
  gameState.enemy.leave.pause()

  //winning tweens
  gameState.player.win = this.tweens.add({
    targets: gameState.player,
    x: 540,
    y: 90,
    ease: "Linear",
    duration: 1000
  })
  gameState.player.win.pause()
  gameState.matthew.win = this.tweens.add({
    targets: gameState.matthew,
    x: 460,
    y: 95,
    ease: "Linear",
    duration: 500
  })
  gameState.matthew.win.pause()

  //winArea overlap
  gameState.winArea.setInteractive()
  this.physics.add.overlap(gameState.matthew, gameState.winArea, () => {
    gameState.win = true
  })
}

//gameplay
function update() {
  if (gameState.active) {
    //update timer
    gameState.timeText.setText(`${formatTime(gameState.timeLeft)}`)

    //check if David needs to leave

    if (gameState.timeLeft===gameState.endWait+2) {
      gameState.sfx.davidSound.play()
    }
    else if (gameState.timeLeft===gameState.endWait+1) {
      gameState.enemy.setFrame(1)
      gameState.enemy.leave.play()
    }

    //check if movements need enabling
    if (gameState.timeLeft===gameState.endWait) {
      gameState.canMove = true
      this.physics.resume()
      this.anims.resumeAll()
    }

    //stop matthew following
    if (gameState.matthew.follow && gameState.cursors.shift.isDown) {
      gameState.matthew.follow = false
    }

    //travelling or idling
    if (gameState.canMove) {
      if (gameState.cursors.right.isDown || gameState.cursors.d.isDown) {
        gameState.player.setVelocityX(250)
        gameState.player.anims.play("run-right", true)
        if (gameState.matthew.follow) {
          gameState.matthew.setVelocityX(250)
          gameState.matthew.anims.play("run-right-m", true)
        }
      } else if (gameState.cursors.left.isDown || gameState.cursors.a.isDown) {
        gameState.player.setVelocityX(-250)
        gameState.player.anims.play("run-left", true)
        if (gameState.matthew.follow) {
          gameState.matthew.setVelocityX(-250)
          gameState.matthew.anims.play("run-left-m", true)
        }
      } 
      else if (checkKeysUp(gameState.cursors) && (gameState.player.body.onFloor())){
        gameState.player.anims.pause()
        gameState.player.setVelocityX(0) 
        gameState.player.setFrame(0)
        if (gameState.matthew.follow) {
          gameState.matthew.anims.pause()
          gameState.matthew.setVelocityX(0) 
          gameState.matthew.setFrame(0)
        }
      }
        
      //jump
      if ((gameState.cursors.space.isDown || gameState.cursors.up.isDown || gameState.cursors.w.isDown) && (gameState.player.body.onFloor())) {
        gameState.player.setVelocityY(-500)
        if (gameState.matthew.follow) {
          gameState.matthew.setVelocityY(-500)
        }
      }
    }

    if (gameState.timeLeft===11) {
      gameState.sfx.guardian.play()
    }

    // danger screen show
    if (gameState.timeLeft<=10) {
      if (gameState.timeLeft%2===0) {
        gameState.dangerScreen.alpha = 0.4
      } else {
        gameState.dangerScreen.alpha = 0
      }
    }

    //win game
    if (gameState.win) {
      gameState.matthew.win.play()
      gameState.player.win.play()
      gameState.sfx.guardian.stop()
      gameState.enemy.move.stop()
      gameState.matthew.anims.play("dancing-m", true)
      gameState.player.anims.play("dancing", true)
      this.physics.pause()
      gameState.active = false
    }
    
    //lose game
    if (gameState.timeLeft===0) {
      let loseElements = [ 
        this.add.rectangle(286, 75, 572, 40, 0xd2d2d2),
        gameState.loseText = this.add.text(150, 68, `You ran out of time! Click to try again.`, { fontFamily: "Arial", color: 0x1d97b5})
      ]
      loseElements.forEach((element) => { element.setScrollFactor(0, 0) })
      gameState.sfx.guardian.stop()
      gameState.sfx.crash.play()
      this.physics.pause()
      gameState.active = false
      this.anims.pauseAll()
      gameState.enemy.move.stop()
      this.input.on("pointerup", () => {
        this.anims.resumeAll()
        gameState.timeLeft=time
        this.scene.restart()
      })
    }

  } else {
    this.input.on("pointerup", () => {
      gameState.timeLeft=time
      this.scene.restart()
    })
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
  scene: { preload, create, update }
}

const game = new Phaser.Game(config)