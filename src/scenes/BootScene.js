class BootScene extends Phaser.Scene {
    
  constructor() {
      super({
        key: 'BootScene',
        pack: {
          files: [
              { type: 'image', key: 'logo', url: 'assets/images/moov2-logo.png' }
          ]
        }
      });
    }

    preload(){

      var progress = this.add.graphics();

      this.load.on('progress', (value) => {
          progress.clear();
          progress.fillStyle(0x990000, 1);
          progress.fillRect(0, this.sys.game.config.width/2-60, this.sys.game.config.width * value, 60);
      });

      this.load.on('complete', function () {
          progress.destroy();
      });

      // this.load.image('blue', 'http://labs.phaser.io/assets/particles/blue.png');
      this.load.image('terrain', 'assets/tilesets/terrain-assets-extruded.png');
      this.load.image('buildings', 'assets/tilesets/base-assets-extruded.png');
      this.load.tilemapTiledJSON('map', 'assets/tilemaps/village.json');

      // animation spritesheet (create at http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/)
      this.load.spritesheet('player', 'assets/images/character.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('magister', 'assets/images/magister.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('landlord', 'assets/images/landlord.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('accountant', 'assets/images/accountant.png', { frameWidth: 64, frameHeight: 64 });
      // animation data
      this.load.json('player-anims', 'assets/json/character-anims.json');
      this.load.json('magister-anims', 'assets/json/magister-anims.json');
      this.load.json('landlord-anims', 'assets/json/landlord-anims.json');
      this.load.json('accountant-anims', 'assets/json/accountant-anims.json');
    }

    create(){
      //  this.scene.start('TitleScene');
      this.scene.start('GameScene');
    }
}

export default BootScene;