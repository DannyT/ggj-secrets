class GameScene extends Phaser.Scene {
  
  constructor() {
    super({
      key: 'GameScene'
    });
  }

  preload() {
  }

  create() {
    var map = this.make.tilemap({ key: 'map' });
    var tilesetTerrain = map.addTilesetImage('terrain-assets-extruded','terrain');
    var tilesetBuildings = map.addTilesetImage('base-assets-extruded','buildings');
    var belowLayer = map.createStaticLayer('Below Player', tilesetTerrain, 0, 0);
    var belowLayerDecor = map.createStaticLayer('Below Player Decoration', tilesetTerrain, 0, 0);
    var worldLayer = map.createStaticLayer('World', tilesetBuildings, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    // var aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);
    // aboveLayer.setDepth(10);
    var objectLayer = map.getObjectLayer('Objects');

    // create animations from data
    var data = this.cache.json.get('player-anims');
    this.anims.fromJSON(data);
    data = this.cache.json.get('landlord-anims');
    this.anims.fromJSON(data);
    data = this.cache.json.get('magister-anims');
    this.anims.fromJSON(data);
    data = this.cache.json.get('accountant-anims');
    this.anims.fromJSON(data);
    this.idleState = 'idle-down';

    // set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    // set up mouse/touch input
    this.pointerIsActive = false;
    this.input.on('pointerdown', (pointer, gameObject) => {
        this.pointerIsActive = true;          
    });
    this.input.on('pointerup', (pointer, gameObject) => {
        this.pointerIsActive = false;
    });

    // npcs
    this.npcGroup = this.physics.add.staticGroup({
        key: ['magister','landlord','accountant'],
        immovable: true
    });
    var children = this.npcGroup.getChildren();

    for (var i = 0; i < children.length; i++)
    {
        let child = children[i];
        let frame = child.frame.texture.key;
        spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', frame);
        child.setPosition(spawnPoint.x, spawnPoint.y);
        child.play(frame+'-idle-down');
    }

    this.npcGroup.refresh();

    // create player sprite
    var spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'spawn');
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');
    this.player.setSize(38, 40)
    this.player.setOffset(13,24);
    this.player.play(this.idleState);
    // interaction icon
    this.playerInteractIcon = this.add.sprite(this.player.x, this.player.y, 'atlas', 'ui/interactive-icon.png');
    this.playerInteractIcon.setVisible(false);
    // player interaction zone
    this.playerZone = this.add.zone(this.player.x, this.player.y);
    this.playerZone.setSize(this.player.width*2, this.player.height*2);
    this.playerZone.setOrigin(0.5);
    this.physics.world.enable(this.playerZone);
    this.physics.add.overlap(this.npcGroup, this.playerZone);

    this.input.keyboard.once('keydown', this.hideIntro, this);
        
    this.cameras.main.setBounds(0, 0, belowLayer.width, belowLayer.height);
    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, this.npcGroup);
    this.physics.add.collider(this.player, worldLayer);

    // Intro dialogue
    let gameWidth = this.sys.game.config.width;
    let gameHeight = this.sys.game.config.height;
    let introWidth = gameWidth * 0.5;
    let introHeight = gameHeight * 0.75;
    let xOffset = gameWidth/2-introWidth/2;
    this.intro = this.add.nineslice(
        xOffset, gameHeight/2,   // this is the starting x/y location
        introWidth, introHeight,   // the width and height of your object
        {
            key:'atlas',
            frame: 'ui/panel_brown.png'
        },
        10,         // the width and height to offset for a corner slice
        10          // (optional) pixels to offset when computing the safe usage area
    );
    this.intro.setInteractive();
    // Intro text
    var script = this.cache.json.get('script');
    var dlgRect = this.intro.getUsableBounds();
    this.introText = this.make.text({
        x: dlgRect.x,
        y: dlgRect.y,
        text: script.intro,
        style: {
            font: '25px "Courier New"',
            fill: 'black',
            wordWrap: { width: dlgRect.width }
        }
    });
    
    // intro music
    this.music = this.sound.add('intro');
    this.music.play();

    this.intro.once('pointerup', this.hideIntro, this);
  }

  update(time, delta) {

    this.player.setVelocity(0);
    // handle keyboard input
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
        this.player.setVelocityY(-300);
    }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        this.player.setVelocityY(300);
    }
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.player.setVelocityX(-300);
    }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.player.setVelocityX(300);
    }
    // handle pointer input
    var angle = 0;
    if(this.pointerIsActive && this.input.activePointer.isDown && this.input.activePointer.leftButtonDown()) {
        // get angle between player and touch point
        angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY));
        // up/down
        if(angle > -150 && angle < -30) {
            this.player.setVelocityY(-300);
        } else if (angle > 30 && angle < 150) {
            this.player.setVelocityY(300);
        }
        // left/right
        if (angle > 120 || angle < -120) {
            this.player.setVelocityX(-300);
        } else if(angle > -60 && angle < 60) {
            this.player.setVelocityX(300);
        }
    }
    // set the animation based on current velocity
    if(this.player.body.velocity.x > 0) {
        this.player.play('walk-right', true);
        this.idleState = 'idle-right'; // we store the direction to show the correct idle direction when we stop moving
    } else if(this.player.body.velocity.x < 0) {
        this.player.play('walk-left', true);
        this.idleState = 'idle-left';
    }
    if(this.player.body.velocity.x == 0) {
        if(this.player.body.velocity.y < 0) {
            this.player.play('walk-up', true);
            this.idleState = 'idle-up';
        } else if(this.player.body.velocity.y > 0) {
            this.player.play('walk-down', true);
            this.idleState = 'idle-down';
        }
        if(this.player.body.velocity.y == 0) {
            this.player.play(this.idleState, true);
        }
    }
    // check for interaction
    this.playerZone.setPosition(this.player.x, this.player.y);
    
    if(this.physics.overlap(this.playerZone, this.npcGroup.getChildren())) {
        this.playerInteractIcon.setVisible(true);
        this.playerInteractIcon.setPosition(this.player.x+25, this.player.y-15);
    } else {
        this.playerInteractIcon.setVisible(false);
    }
  }
  
  hideIntro() {
    this.intro.setVisible(false);
    this.introText.setVisible(false);
    this.music.stop();
    this.music = this.sound.add('village');
    this.music.play();

  }
}

export default GameScene;