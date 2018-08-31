class TitleScene extends Phaser.Scene {
    
    constructor() {
      super({
        key: 'TitleScene'
      });
    }

    /**
     * Called when browser window resizes
     */
    resize (width, height) {
      // console.log("resizing bootscene");
      if (width === undefined) { width = this.sys.game.config.width; }
      if (height === undefined) { height = this.sys.game.config.height; }

      this.cameras.resize(width, height);
      this.physics.world.setBounds(0,0, width, height);
    }

    preload() {
    }

    create() {

      var particles = this.add.particles('blue');

      var emitter = particles.createEmitter({
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD'
      });

      var logo = this.physics.add.image(400, 100, 'logo');

      logo.setVelocity(100, 200);
      logo.setBounce(1, 1);
      logo.setCollideWorldBounds(true);

      emitter.startFollow(logo);
      this.events.on('resize', this.resize, this);
    }

    update(time, delta) {
    }

    
}

export default TitleScene;
