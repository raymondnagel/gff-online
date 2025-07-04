import { COLOR } from "../../colors";
import { PEOPLE } from "../../people";
import { GPerson } from "../../types";

const PADDING: number = 10;

export class GPersonFile extends Phaser.GameObjects.Container {

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, person: GPerson) {
        super(scene, x, y);
        this.scene.add.existing(this);

        // Background
        const bg: Phaser.GameObjects.Rectangle = scene.add.rectangle(0, 0, width, 120, COLOR.GREY_4.num()).setOrigin(0, 0);

        // Person graphic
        const graphic: Phaser.GameObjects.Image = scene.add.image(PADDING, PADDING, person.spriteKeyPrefix + '_idle_s').setOrigin(0, 0);

        // Name label
        const nameLabel = scene.add.text(graphic.width + PADDING, PADDING, PEOPLE.getNameForProfile(person), {
            fontFamily: 'averia_serif',
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0, 0);

        // Information labels
        let labelY = nameLabel.y + nameLabel.height + 6;
        const genderLabel = scene.add.text(graphic.width + PADDING, labelY, `Gender: ${PEOPLE.getSexFull(person)}`, {
            fontFamily: 'averia_serif',
            fontSize: '16px',
            color: '#000000'
        }).setOrigin(0, 0);

        labelY += 18;
        const salvationLabel = scene.add.text(graphic.width + PADDING, labelY, `Believer: ${person.faith >= 100 ? 'Yes' : 'No'}`, {
            fontFamily: 'averia_serif',
            fontSize: '16px',
            color: '#000000'
        }).setOrigin(0, 0);

        labelY += 18;
        const conversationLabel = scene.add.text(graphic.width + PADDING, labelY, `Conversations: ${person.conversations}`, {
            fontFamily: 'averia_serif',
            fontSize: '16px',
            color: '#000000'
        }).setOrigin(0, 0);

        labelY += 18;
        const bookLabel = scene.add.text(graphic.width + PADDING, labelY, `Favorite Book: ${person.faith >= 100 ? person.favoriteBook : 'N/A'}`, {
            fontFamily: 'averia_serif',
            fontSize: '16px',
            color: '#000000'
        }).setOrigin(0, 0);

        // Border
        const border = this.scene.add.rectangle(0, 0, bg.width, bg.height);
        border.setStrokeStyle(1, COLOR.GREY_3.num());
        border.setOrigin(0, 0);

        // Add elements to the container
        this.add(bg);
        this.add(graphic);
        this.add(border);
        this.add(nameLabel);
        this.add(genderLabel);
        this.add(salvationLabel);
        this.add(conversationLabel);
        this.add(bookLabel);

        this.width = bg.width;
        this.height = bg.height;
    }

}