class UIScene extends Phaser.Scene {
    
    constructor() {
      super({
        key: 'UIScene'
      });
    }

    create() {
        let gameWidth = this.sys.game.config.width;
        let gameHeight = this.sys.game.config.height;
        
        // modal screen
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x000000, 0.8);
        this.graphics.fillRect(0, 0, gameWidth, gameHeight);
        this.graphics.setVisible(false);

        // Intro dialogue
        this.boxConfig = {
            boxWidth : gameWidth * 0.6,
            boxHeight : gameHeight * 0.90,
            xOffset : gameWidth/2-(gameWidth * 0.6)/2,
            yOffset : gameHeight/2-(gameHeight * 0.90)/2
        }

        this.introBox = this.add.nineslice(
            this.boxConfig.xOffset, this.boxConfig.yOffset,   // this is the starting x/y location
            this.boxConfig.boxWidth, this.boxConfig.boxHeight,   // the width and height of your object
            {
                key:'atlas',
                frame: 'ui/panel_beige.png'
            },
            10,         // the width and height to offset for a corner slice
            10          // (optional) pixels to offset when computing the safe usage area
        );

        this.introBoxDark = this.add.nineslice(
            this.boxConfig.xOffset, this.boxConfig.yOffset,   // this is the starting x/y location
            this.boxConfig.boxWidth, this.boxConfig.boxHeight,   // the width and height of your object
            {
                key:'atlas',
                frame: 'ui/panel_blue.png'
            },
            10,         // the width and height to offset for a corner slice
            10          // (optional) pixels to offset when computing the safe usage area
        ).setVisible(false);

        this.introBox.setInteractive();
        
        
        // Intro text
        this.script = this.cache.json.get('script');
        var dlgRect = this.introBox.getUsableBounds();
        this.introText = this.make.text({
            x: dlgRect.x +10,
            y: dlgRect.y,
            text: '',
            style: {
                font: '25px "Courier New"',
                fill: 'black',
                wordWrap: { width: dlgRect.width*0.9 }
            }
        });

        // dialogue box
        let dialogBoxConfig = {
            boxWidth : gameWidth * 0.95,
            boxHeight : 180,
            xOffset : gameWidth/2-(gameWidth * 0.95)/2,
            frame : 'ui/panel_beige.png'
        }
        this.dlg = this.add.nineslice(
            dialogBoxConfig.xOffset, gameHeight-dialogBoxConfig.boxHeight-20,   // this is the starting x/y location
            dialogBoxConfig.boxWidth, dialogBoxConfig.boxHeight,   // the width and height of your object
            {
                key:'atlas',
                frame: dialogBoxConfig.frame
            },
            10,         // the width and height to offset for a corner slice
            10          // (optional) pixels to offset when computing the safe usage area
        ).setVisible(false);
        this.dlg.setInteractive();
        // text
        dlgRect = this.dlg.getUsableBounds();
        this.dlgText = this.make.text({
            x: dlgRect.x +10,
            y: dlgRect.y,
            text: 'chat here',
            style: {
                font: '25px "Courier New"',
                fill: 'black',
                wordWrap: { width: dlgRect.width * 0.9 }
            },
            visible:false
        });

        this.currentTextBox = this.introText;
        this.setText(this.script.intro);

        this.input.keyboard.on('keydown', this.hideIntro, this);
        this.input.on('pointerup', this.hideIntro, this);

        // intro music
        this.music = this.sound.add('intro');
        this.music.play('',{ loop:true });

        //  Grab a reference to the Game Scene
        this.game = this.scene.get('GameScene');
        //  Listen for events from it
        this.game.events.on('showdialogue', this.startDialogue, this);

        this.scene.pause('GameScene');

        // boolean used to determine if the endGameScript has been played yet
        this.hasPlayedEndGame = false;
    }

    hideIntro(){
        if(this.introBox.visible) {
            if(this.currentTextBox.text.length < this.currentTextToShow.length) {
                this.currentTextBox.setText(this.currentTextToShow);
                return;
            }

            this.input.keyboard.off('keydown', this.hideIntro, this);
            this.input.off('pointerup', this.hideIntro, this);

            this.introBox.setVisible(false);
            this.introText.setVisible(false);
            this.music.stop();
            this.music = this.sound.add('village');
            this.music.play();
            this.scene.resume('GameScene');
        }
    }

    startDialogue(npc){
        this.storyline = npc.frame.texture.key;
        // get the dialogue for this character
        this.dialogue = Phaser.Utils.Array.GetFirst(this.script.dialogue, 'id', this.storyline);
        // we have multiple scripts per character (main script then end game script)
        this.currentScript = this.dialogue.script;
        this.showDialogue();
    }

    showDialogue() {
        this.scene.pause('GameScene');
        // show box
        this.dlg.setVisible(true);
        this.dlgText.setVisible(true);
        this.dialogueIndex = 0;
        this.currentTextBox = this.dlgText;
        
        this.setText(this.currentScript[this.dialogueIndex][0] + ' : ' + this.currentScript[this.dialogueIndex][1]);

        // step through the text
        this.input.keyboard.on('keydown_SPACE', this.progressConvo, this);
        // cancel
        this.input.keyboard.on('keydown_ESC', this.hideDialogue, this);
    }

    progressConvo() {
        if(this.currentTextBox.text.length < this.currentTextToShow.length) {
            this.currentTextBox.setText(this.currentTextToShow);
            return;
        }

        this.dialogueIndex++;
        if(this.dialogueIndex < this.currentScript.length) {
            this.setText(this.currentScript[this.dialogueIndex][0] + ' : ' + this.currentScript[this.dialogueIndex][1]);
            return;
        }

        if(!this.hasPlayedEndGame) {
            this.input.keyboard.off('keydown_SPACE', this.progressConvo, this);
            //show options
            let optionsFormatted = '';
            for(let i=0; i < this.dialogue.options.length; i++) {
                optionsFormatted += this.dialogue.options[i][0];
                optionsFormatted += ') ';
                optionsFormatted += this.dialogue.options[i][1];
                optionsFormatted += '\n';
            }
            optionsFormatted += '\nEnter a number to make your choice...';
            this.setText(optionsFormatted);
            this.input.keyboard.on('keydown', this.makeChoice, this);
        } else {
            this.showEndGame();
        }
    }

    makeChoice(key) {
        let keyAsInt = parseInt(key.key, 10);

        // ignore naff inputs
        if(isNaN(keyAsInt)) {
            return;
        }
        let optionsCount = this.dialogue.options.length;
        if(keyAsInt > optionsCount) {
            return;
        }
        
        // a legit decision has been made
        this.input.keyboard.off('keydown', this.makeChoice, this);
        this.hideDialogue();
        
        // check for endGame
        let endGame = this.dialogue.endGameOption;
        if(keyAsInt == endGame) {
            this.showEndGame();
        }
    }

    showEndGame(){
        if((this.dialogue.endGameScript != undefined) && !this.hasPlayedEndGame) {
            console.log('Starting end game script');
            this.currentScript = this.dialogue.endGameScript;
            this.hasPlayedEndGame = true;
            this.showDialogue();
            return;
        }
        this.hideDialogue();
        this.input.keyboard.off('keydown_SPACE', this.progressConvo, this);
        this.currentTextBox = this.introText;
        this.setText(this.dialogue.endGameStory + '\n\nTHE END\n\nAny key to restart and try a different companion!');
        this.introBox.setVisible(true);
        this.introText.setVisible(true);
        this.introBox.setAlpha(0);
        this.introText.setAlpha(0);
        this.introBoxDark.setAlpha(0);
        this.tweens.add({
            targets: [this.introBox, this.introText, this.introBoxDark],
            alpha: 1,
            ease: 'Power1',
            duration: 2000
        });
        
        this.music.stop();
        switch(this.storyline){
            case 'magister':
                this.music = this.sound.add('magister-end');
                this.graphics.setVisible(true);
                this.introBoxDark.setVisible(true);
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
            case 'beggar':
                this.music = this.sound.add('beggar-end');
                this.graphics.setVisible(true);
                this.introBoxDark.setVisible(true);
                break;
        }
        this.music.play();
        this.scene.pause('GameScene');
        this.input.keyboard.on('keydown', this.restartGame, this);
    }

    hideDialogue() {
        this.dlg.setVisible(false);
        this.dlgText.setVisible(false);
        this.scene.resume('GameScene');
    }

    setText(textToShow) {
        this.currentTextBox.setText('');
        this.currentTextToShow = textToShow;
    }

    update() {
        if(this.currentTextBox.visible){
            this.currentTextBox.setText(this.currentTextToShow.substring(0,this.currentTextBox.text.length+1));
        }
    }

    restartGame() {
        if(this.currentTextBox.text.length < this.currentTextToShow.length) {
            this.currentTextBox.setText(this.currentTextToShow);
            return;
        }
        this.input.keyboard.off('keydown', this.restartGame, this);
        this.music.stop();
        this.scene.restart();
        this.game.scene.restart();
    }
}
export default UIScene;