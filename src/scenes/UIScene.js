class UIScene extends Phaser.Scene {
    
    constructor() {
      super({
        key: 'UIScene'
      });
    }

    create() {
        let gameWidth = this.sys.game.config.width;
        let gameHeight = this.sys.game.config.height;
        
        // Intro dialogue
        let boxWidth = gameWidth * 0.5;
        let boxHeight = gameHeight * 0.75;
        let xOffset = gameWidth/2-boxWidth/2;
        let yOffset = gameHeight/2-boxHeight/2;

        this.intro = this.add.nineslice(
            xOffset, yOffset,   // this is the starting x/y location
            boxWidth, boxHeight,   // the width and height of your object
            {
                key:'atlas',
                frame: 'ui/panel_brown.png'
            },
            10,         // the width and height to offset for a corner slice
            10          // (optional) pixels to offset when computing the safe usage area
        );
        this.intro.setInteractive();
        
        // Intro text
        this.script = this.cache.json.get('script');
        var dlgRect = this.intro.getUsableBounds();
        this.introText = this.make.text({
            x: dlgRect.x,
            y: dlgRect.y,
            text: this.script.intro,
            style: {
                font: '25px "Courier New"',
                fill: 'black',
                wordWrap: { width: dlgRect.width }
            }
        });

        // dialogue box
        boxWidth = gameWidth * 0.95;
        boxHeight = 150;
        xOffset = gameWidth/2-boxWidth/2;
        this.dlg = this.add.nineslice(
            xOffset, gameHeight-boxHeight,   // this is the starting x/y location
            boxWidth, boxHeight-20,   // the width and height of your object
            {
                key:'atlas',
                frame: 'ui/panel_beige.png'
            },
            10,         // the width and height to offset for a corner slice
            10          // (optional) pixels to offset when computing the safe usage area
        ).setVisible(false);
        this.dlg.setInteractive();
        // text
        dlgRect = this.dlg.getUsableBounds();
        this.dlgText = this.make.text({
            x: dlgRect.x,
            y: dlgRect.y,
            text: 'chat here',
            style: {
                font: '25px "Courier New"',
                fill: 'black',
                wordWrap: { width: dlgRect.width }
            },
            visible:false
        });

        // intro music
        this.music = this.sound.add('intro');
        this.music.play();

        //  Grab a reference to the Game Scene
        this.game = this.scene.get('GameScene');
        //  Listen for events from it
        this.game.events.on('hideintro', this.hideIntro, this);

        // listen for dialogue events
        this.game.events.on('showdialogue', this.showDialogue, this)
    }

    hideIntro(){
        if(this.intro.visible) {
            this.intro.setVisible(false);
            this.introText.setVisible(false);
            this.music.stop();
            this.music = this.sound.add('village');
            this.music.play();
        }
    }

    showDialogue(npc){
        this.scene.pause('GameScene');
        // get the dialogue
        this.dialogue = Phaser.Utils.Array.GetFirst(this.script.dialogue, 'id', npc.frame.texture.key).script;
        // show box
        this.dlg.setVisible(true);
        this.dlgText.setVisible(true);
        this.dialogueIndex = 0;
        this.dlgText.setText(this.dialogue[this.dialogueIndex][1]);

        // step through the text
        this.input.keyboard.on('keydown_SPACE', this.progressConvo, this);

        
        // accept choice input
    }

    progressConvo() {
        this.dialogueIndex++;
        if(this.dialogueIndex >= this.dialogue.length) {
            this.dialogueIndex = 0;
            this.input.keyboard.off('keydown_SPACE', this.progressConvo);
            this.hideDialogue();
            this.scene.resume('GameScene');
        }
        this.dlgText.setText(this.dialogue[this.dialogueIndex][1]);
        
    }

    hideDialogue() {
        this.dlg.setVisible(false);
        this.dlgText.setVisible(false);
    }
}
export default UIScene;