import 'phaser';
import { GPersonSprite } from './GPersonSprite';
import { GPerson } from '../../types';

export class GSatanSprite extends GPersonSprite {

    static PERSON: GPerson = {
        firstName: 'Lucifer',
        lastName: 'the Covering Cherub',
        preferredName: 'Satan',
        spriteKeyPrefix: 'lucifer',
        gender: 'm',
        voice: 1,
        faith: -100,
        familiarity: 0,
        nameLevel: 1,
        reprobate: true,
        convert: false,
        captive: false,
        specialGift: null,
        homeTown: null,
        bio1: null,
        bio2: null,
        favoriteBook: 'Job',
        conversations: 0
    };

    constructor(x: number, y: number, useStaff: boolean) {
        super(
            GSatanSprite.PERSON,
            x,
            y
        );
    }

    public static getSatanPerson(): GPerson {
        return GSatanSprite.PERSON;
    }
}