// import { COLOR } from "../colors";
// import { GInputMode } from "../GInputMode";
// import { GFF } from "../main";
// import { GUIScene } from "./GUIScene";

// const INPUT_DEFAULT: GInputMode = new GInputMode('options.default');
// const IMAGE_OFFSET_X: number = 300;
// const IMAGE_OFFSET_Y: number = 100;

// export class GOptionsUI extends GUIScene {
//     private sceneryObjectNames: string[];
//     private backgroundRect: Phaser.GameObjects.Rectangle;
//     private sceneryImage: Phaser.GameObjects.Image;
//     private sceneryIndex: number = 0;
//     private bodyRect: Phaser.GameObjects.Rectangle;
//     private sceneryKeyText: Phaser.GameObjects.Text;
//     private bodyLocText: Phaser.GameObjects.Text;
//     private bodySizeText: Phaser.GameObjects.Text;

//     constructor() {
//         super("OptionsUI");

//         this.setContainingMode(GFF.OPTIONS_MODE);
//     }

//     public preload(): void {
//         this.sceneryObjectNames = this.cache.json.get('scenery-manifest') as string[];
//     }

//     public create(): void {
//         super.create();
//         this.add.image(0, 0, 'options_subscreen_bg').setOrigin(0, 0);
//         this.add.text(512, 20, 'Options', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'dyonisius',
//             fontSize: '48px'
//         }).setOrigin(.5, 0);

//         this.add.text(50, 100, 'Scenery Body-Builder', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.add.text(50, 130, 'Cycle image with < / >', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.add.text(50, 160, 'Move body with arrow keys', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.add.text(50, 190, 'Resize body width with [ / ]', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.add.text(50, 220, 'Adjust body top with K / L', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.add.text(50, 240, 'Adjust body bottom with ; / \'', {
//             color: COLOR.GREY_1.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);

//         this.sceneryKeyText =this.add.text(50, 300, `""`, {
//             color: COLOR.WHITE.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.bodyLocText = this.add.text(50, 320, `(X, Y)`, {
//             color: COLOR.WHITE.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);
//         this.bodySizeText = this.add.text(50, 340, `W x H`, {
//             color: COLOR.WHITE.str(),
//             fontFamily: 'averia_serif',
//             fontSize: '16px'
//         }).setOrigin(0, 0);

//         this.backgroundRect = this.add.rectangle(IMAGE_OFFSET_X, IMAGE_OFFSET_Y, 500, 500, COLOR.GREY_2.num())
//             .setOrigin(0, 0);

//         this.sceneryImage = this.add.image(IMAGE_OFFSET_X, IMAGE_OFFSET_Y, 'nothing')
//             .setOrigin(0, 0);

//         this.bodyRect = this.add.rectangle(IMAGE_OFFSET_X, IMAGE_OFFSET_Y, 100, 100).setStrokeStyle(1, COLOR.WHITE.num())
//             .setOrigin(0, 0);

//         // Flash bodyRect red/white
//         this.tweens.add({
//             targets: this.bodyRect,
//             duration: 200,
//             repeat: -1,
//             yoyo: true,
//             strokeColor: COLOR.RED.num()
//         });

//         this.setSubscreen();
//         this.initInputMode();
//         //this.createTileGuidelines();

//         this.loadSceneryImage(this.sceneryObjectNames[this.sceneryIndex]);
//     }

//     private loadSceneryImage(imageKey: string) {
//         this.sceneryImage.setTexture(imageKey);
//         this.backgroundRect.width = this.sceneryImage.width;
//         this.backgroundRect.height = this.sceneryImage.height;
//         this.bodyRect.x = IMAGE_OFFSET_X;
//         this.bodyRect.y = IMAGE_OFFSET_Y + this.sceneryImage.height - 16;
//         this.bodyRect.setSize(this.sceneryImage.width, 16);
//         this.sceneryKeyText.setText(`"${imageKey}"`);
//     }

//     private initInputMode() {
//         INPUT_DEFAULT.allowRepeats([',', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '[', ']', 'k', 'l', ';', '\'']);
//         INPUT_DEFAULT.onKeyDown((keyEvent: KeyboardEvent) => {
//             const amount = keyEvent.shiftKey ? 10 : 1;
//             switch(keyEvent.key.toLowerCase()) {
//                 case ',':
//                     this.sceneryIndex = (this.sceneryIndex + 1) % this.sceneryObjectNames.length;
//                     this.loadSceneryImage(this.sceneryObjectNames[this.sceneryIndex]);
//                     break;
//                 case '.':
//                     this.sceneryIndex = (this.sceneryIndex - 1 + this.sceneryObjectNames.length) % this.sceneryObjectNames.length;
//                     this.loadSceneryImage(this.sceneryObjectNames[this.sceneryIndex]);
//                     break;
//                 case 'arrowleft':
//                     this.bodyRect.x -= amount;
//                     break;
//                 case 'arrowright':
//                     this.bodyRect.x += amount;
//                     break;
//                 case 'arrowup':
//                     this.bodyRect.y -= amount;
//                     break;
//                 case 'arrowdown':
//                     this.bodyRect.y += amount;
//                     break;
//                 case '[':
//                     this.bodyRect.setSize(this.bodyRect.width - amount, this.bodyRect.height);
//                     break;
//                 case ']':
//                     this.bodyRect.setSize(this.bodyRect.width + amount, this.bodyRect.height);
//                     break;
//                 case 'k':
//                     this.bodyRect.setSize(this.bodyRect.width, this.bodyRect.height + amount);
//                     this.bodyRect.y -= amount;
//                     break;
//                 case 'l':
//                     this.bodyRect.setSize(this.bodyRect.width, this.bodyRect.height - amount);
//                     this.bodyRect.y += amount;
//                     break;
//                 case ';':
//                     this.bodyRect.setSize(this.bodyRect.width, this.bodyRect.height - amount);
//                     break;
//                 case "\'":
//                     this.bodyRect.setSize(this.bodyRect.width, this.bodyRect.height + amount);
//                     break;
//                 case " ":
//                     const keyName: string = this.sceneryObjectNames[this.sceneryIndex];
//                     const bodyX: number = this.bodyRect.x - IMAGE_OFFSET_X;
//                     const bodyY: number = this.bodyRect.y - IMAGE_OFFSET_Y;
//                     const bodyWidth: number = this.bodyRect.width;
//                     const bodyHeight: number = this.bodyRect.height;
//                     console.log(`{ key: '${keyName}', type: 'static', body: {x: ${bodyX}, y: ${bodyY}, width: ${bodyWidth}, height: ${bodyHeight}} },`);
//                     this.sceneryIndex = (this.sceneryIndex - 1 + this.sceneryObjectNames.length) % this.sceneryObjectNames.length;
//                     this.loadSceneryImage(this.sceneryObjectNames[this.sceneryIndex]);
//                     break;
//                 default:
//                     this.sendPotentialHotkey(keyEvent);
//             }
//             this.bodyLocText.setText(`(${this.bodyRect.x - IMAGE_OFFSET_X}, ${this.bodyRect.y - IMAGE_OFFSET_Y})`);
//             this.bodySizeText.setText(`${this.bodyRect.width} x ${this.bodyRect.height}`);
//         });
//         INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
//         this.setInputMode(INPUT_DEFAULT);
//     }
// }