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
    spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'magister');
    this.magister = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'magister');
    this.magister.setSize(38, 40)
    this.magister.setOffset(13,24);
    this.magister.setImmovable();
    this.magister.play('magister-idle-down');
    
    spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'landlord');
    this.landlord = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'landlord');
    this.landlord.setSize(38, 40)
    this.landlord.setOffset(13,24);
    this.landlord.setImmovable();
    this.landlord.play('landlord-idle-down');

    spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'accountant');
    this.accountant = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'accountant');
    this.accountant.setSize(38, 40)
    this.accountant.setOffset(13,24);
    this.accountant.setImmovable();
    this.accountant.play('accountant-idle-down');

    // create player sprite
    var spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'spawn');
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');
    this.player.setSize(38, 40)
    this.player.setOffset(13,24);
    this.player.play(this.idleState);
        
    this.cameras.main.setBounds(0, 0, belowLayer.width, belowLayer.height);
    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, this.magister);
    this.physics.add.collider(this.player, this.landlord);
    this.physics.add.collider(this.player, this.accountant);
    this.physics.add.collider(this.player, worldLayer);
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
  }

  
}

export default GameScene;