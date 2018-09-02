class GameScene extends Phaser.Scene {
    constructor() {
        super({
        key: 'GameScene'
        });
    }

    resize(width, height) {
        this.cameras.resize(width, height);
    }

    preload() {
    }

    create() {
        let gameWidth = this.sys.game.config.width;
        let gameHeight = this.sys.game.config.height;
        this.events.on('resize', this.resize, this);
        this.cameras.resize(gameWidth, gameHeight);

        // map
        var map = this.make.tilemap({ key: 'map' });
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        var tilesetTerrain = map.addTilesetImage('terrain-assets-extruded','terrain');
        var tilesetBuildings = map.addTilesetImage('town-combined-extruded','town');
        var belowLayer = map.createStaticLayer('Below Player', tilesetTerrain, 0, 0);
        var belowLayerDecor = map.createStaticLayer('Below Player Decoration', tilesetTerrain, 0, 0);
        var worldLayer = map.createStaticLayer('World', tilesetBuildings, 0, 0);
        worldLayer.setCollisionByProperty({ collides: true });
        var aboveLayer = map.createStaticLayer('Above Player', tilesetBuildings, 0, 0);
        aboveLayer.setDepth(10);
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
        data = this.cache.json.get('kim-anims');
        this.anims.fromJSON(data);
        data = this.cache.json.get('beggar-anims');
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
        this.input.keyboard.on('keyup_SPACE', this.interact, this);
        
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
            key: ['magister','landlord','accountant', 'kim', 'beggar'],
            immovable: true
        });
        var children = this.npcGroup.getChildren();

        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            let frame = child.frame.texture.key;
            spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', frame);
            child.setPosition(spawnPoint.x, spawnPoint.y);
            child.play(frame + '-idle-down');
        }

        this.npcGroup.refresh();

        // create player sprite
        var spawnPoint = Phaser.Utils.Array.GetFirst(objectLayer.objects, 'name', 'spawn');
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');
        this.player.setSize(38, 40)
        this.player.setOffset(13,24);
        this.player.setCollideWorldBounds(true);
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
            
        this.cameras.main.setBounds(0, 0, belowLayer.width, belowLayer.height);
        this.cameras.main.startFollow(this.player);

        this.physics.add.collider(this.player, this.npcGroup);
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
        // check for interaction
        this.playerZone.setPosition(this.player.x, this.player.y);
        
        if(this.physics.overlap(this.playerZone, this.npcGroup.getChildren())) {
            this.playerInteractIcon.setVisible(true);
            this.playerInteractIcon.setPosition(this.player.x+25, this.player.y-15);
        } else {
            this.playerInteractIcon.setVisible(false);
        }
    }

    interact() {
        if(!this.playerInteractIcon.visible) {
            return;
        }
        this.physics.overlap(this.playerZone, this.npcGroup.getChildren(), (zone, npc) => {
            this.events.emit('showdialogue', npc);
        });
    }
}

export default GameScene;