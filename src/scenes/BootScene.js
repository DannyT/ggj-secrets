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
      this.load.atlas('atlas', 'assets/atlas/atlas.png','assets/atlas/atlas.json');
      this.load.image('terrain', 'assets/tilesets/terrain-assets-extruded.png');
      this.load.image('town', 'assets/tilesets/town-combined-extruded.png');
      this.load.tilemapTiledJSON('map', 'assets/tilemaps/village.json');

      this.load.audio('intro', [
        'assets/audio/Prologue_1.mp3'
      ]);
      this.load.audio('village', [
        'assets/audio/Village_1.0.mp3'
      ]);
      this.load.audio('magister-end', [
        'assets/audio/Magister_Ending_1.0.mp3'
      ]);
      this.load.audio('landlord-end', [
        'assets/audio/Landlord_Ending_1.0.mp3'
      ]);
      this.load.audio('accountant-end', [
        'assets/audio/Accountant_Ending_1.0.mp3'
      ]);
      this.load.audio('kim-end', [
        'assets/audio/Kim_Ending_1.0.mp3'
      ]);

      // animation spritesheet (create at http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/)
      this.load.spritesheet('player', 'assets/images/character.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('magister', 'assets/images/magister.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('landlord', 'assets/images/landlord.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('kim', 'assets/images/kim.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('accountant', 'assets/images/accountant.png', { frameWidth: 64, frameHeight: 64 });
      // animation data
      this.load.json('player-anims', 'assets/json/character-anims.json');
      this.load.json('magister-anims', 'assets/json/magister-anims.json');
      this.load.json('landlord-anims', 'assets/json/landlord-anims.json');
      this.load.json('accountant-anims', 'assets/json/accountant-anims.json');
      this.load.json('kim-anims', 'assets/json/kim-anims.json');
      this.load.json('script', 'assets/json/script.json');
    }

    create(){
      //  this.scene.start('TitleScene');
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    }
}

export default BootScene;
