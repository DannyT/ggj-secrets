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

        this.input.keyboard.once('keydown', this.hideIntro, this);
        this.input.once('pointerup', this.hideIntro, this);

        // intro music
        this.music = this.sound.add('intro');
        this.music.play();

        //  Grab a reference to the Game Scene
        this.game = this.scene.get('GameScene');
        //  Listen for events from it
        this.game.events.on('showdialogue', this.showDialogue, this);

        this.scene.pause('GameScene');
    }

    showStoryText(text){
        this.introText.setText(text);
        this.intro.setVisible(true);
        this.introText.setVisible(true);
        this.music.stop();
        switch(this.storyline){
            case 'magister':
                this.music = this.sound.add('magister-end');
                break;
            case 'landlord':
                this.music = this.sound.add('landlord-end');
                break;
            case 'accountant':
                this.music = this.sound.add('accountant-end');
                break;
            case 'kim':
                this.music = this.sound.add('kim-end');
                break;
        }
        this.music.play();
        this.scene.pause('GameScene');
    }

    hideIntro(){
        if(this.intro.visible) {
            this.intro.setVisible(false);
            this.introText.setVisible(false);
            this.music.stop();
            this.music = this.sound.add('village');
            this.music.play();
            this.scene.resume('GameScene');
        }
    }

    showDialogue(npc){
        this.scene.pause('GameScene');
        this.storyline = npc.frame.texture.key;
        // get the dialogue
        this.dialogue = Phaser.Utils.Array.GetFirst(this.script.dialogue, 'id', this.storyline);
        // show box
        this.dlg.setVisible(true);
        this.dlgText.setVisible(true);
        this.dialogueIndex = 0;
        this.dlgText.setText(this.dialogue.script[this.dialogueIndex][0] + ' : ' + this.dialogue.script[this.dialogueIndex][1]);

        // step through the text
        this.input.keyboard.on('keydown_SPACE', this.progressConvo, this);
        // cancel
        this.input.keyboard.on('keydown_ESC', this.hideDialogue, this);
    }

    progressConvo() {
        this.dialogueIndex++;
        if(this.dialogueIndex < this.dialogue.script.length) {
            this.dlgText.setText(this.dialogue.script[this.dialogueIndex][0] + ' : ' + this.dialogue.script[this.dialogueIndex][1]);
            return;
        }

        this.dialogueIndex = 0;
        this.input.keyboard.off('keydown_SPACE', this.progressConvo, this);
        this.dlgText.setText(this.dialogue.options);
        this.input.keyboard.on('keydown', this.makeChoice, this);
    }

    makeChoice(key) {
        let optionsCount = this.dialogue.options.length;
        let endGame = this.dialogue.endGameOption.toString();
        switch(key.key){
            case endGame:
                this.hideDialogue();
                this.showStoryText(this.dialogue.endGameStory);
                break;
            case "1":
                this.hideDialogue();
                break;
            case "2":
                if(optionsCount > 1) {
                    this.hideDialogue();
                }
                break;
            case "3":
                if(optionsCount > 2) {
                    this.hideDialogue();
                }
                break;
            case "4":
                if(optionsCount > 3) {
                    this.hideDialogue();
                }
                break;
            case "5":
                if(optionsCount > 4) {
                    this.hideDialogue();
                }
                break;
        }
    }

    hideDialogue() {
        this.input.keyboard.off('keydown', this.makeChoice, this);
        this.dlg.setVisible(false);
        this.dlgText.setVisible(false);
        this.scene.resume('GameScene');
    }
}
export default UIScene;