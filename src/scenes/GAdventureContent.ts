import 'phaser';
import { GArea } from '../areas/GArea';
import { GDirection } from '../GDirection';
import { GRect, GPerson, GSpirit, GKeyList, BoundedGameObject, GPoint, CardDir, Dir9 } from '../types';
import { GRandom } from '../GRandom';
import { GPlayerSprite } from '../objects/chars/GPlayerSprite';
import { GPersonSprite } from '../objects/chars/GPersonSprite';
import { GObstacleStatic } from '../objects/obstacles/GObstacleStatic';
import { GObstacleSprite } from '../objects/obstacles/GObstacleSprite';
import { GFF } from '../main';
import { GRoom } from '../GRoom';
import { GImpSprite } from '../objects/chars/GImpSprite';
import { GCharSprite } from '../objects/chars/GCharSprite';
import { GContentScene } from './GContentScene';
import { GConversation } from '../GConversation';
import { GPopup } from '../objects/components/GPopup';
import { GTreasureChest } from '../objects/GTreasureChest';
import { PLAYER } from '../player';
import { ENEMY } from '../enemy';
import { GrayscalePostFxPipeline } from '../shaders/GrayscalePostFxPipeline';
import { GInputMode } from '../GInputMode';
import { AREA } from '../area';
import { GTown } from '../GTown';
import { GChurch } from '../GChurch';
import { GInteractable } from '../objects/interactables/GInteractable';
import { DEPTH } from '../depths';
import { COMMANDMENTS } from '../commandments';

const MOUSE_UI_BUTTON: string = 'MOUSE_UI_BUTTON';

const INPUT_ADVENTURING: GInputMode = new GInputMode('adv.adventuring');
const INPUT_CONVERSATION: GInputMode = new GInputMode('adv.conversation');
const INPUT_POPUP: GInputMode = new GInputMode('adv.popup');
const INPUT_PAUSE: GInputMode = new GInputMode('adv.paused');
const INPUT_DISABLED: GInputMode = new GInputMode('adv.disabled');

const NON_ESS_TRANS_SPAWN_TRIES: number = 20;

export class GAdventureContent extends GContentScene {

    private visionRadiusImage: Phaser.GameObjects.Image;
    private visionBlackRects: Phaser.GameObjects.Rectangle[] = [];

    private currentArea: GArea;
    private bottomBound: Phaser.GameObjects.Rectangle;
    private playerFloor: number = 0;
    private playerRoomX: number = 0;
    private playerRoomY: number = 0;

    private player: GPlayerSprite;
    private obstaclesGroup: Phaser.GameObjects.Group;
    private personsGroup: Phaser.GameObjects.Group;
    private impsGroup: Phaser.GameObjects.Group;
    private interactablesGroup: Phaser.GameObjects.Group;

    private impSpawnTimeEvent: Phaser.Time.TimerEvent;

    private popup: GPopup|null = null;
    private conversation: GConversation|null = null;

    constructor() {
        super("AdventureContent");
        GFF.AdventureContent = this;
        this.setContainingMode(GFF.ADVENTURE_MODE);
    }

    public preload(): void {
        this.obstaclesGroup = this.add.group();
        this.personsGroup = this.add.group();
        this.impsGroup = this.add.group();
        this.interactablesGroup = this.add.group();
    }

    public create(): void {
        const startRoom = AREA.WORLD_AREA.getStartRoom();
        this.setCurrentRoom(startRoom.getX(), startRoom.getY(), AREA.WORLD_AREA);

        // Create the player:
        this.player = new GPlayerSprite(this, 500, 500);

        // Init physics:
        this.initPhysics();

        // Init vision objects:
        this.initVision();

        // Init debug tools:
        this.initDebugs();

        // Init grayscale shader:
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline('GrayscalePostFxPipeline', GrayscalePostFxPipeline);
        this.updateFidelityMode();

        // Init input modes:
        this.initInputModes();
        this.setInputMode(INPUT_ADVENTURING);

        // Set vision:
        this.setVision(true);
    }

    private initVision() {
        this.visionRadiusImage = this.add.image(0, 0, 'radius_0')
            .setDepth(DEPTH.VISION)
            .setOrigin(.5, .5)
            .setData('permanent', true);
        for (let r: number = 0; r < 4; r++) {
            this.visionBlackRects.push(
                this.add.rectangle(0, 0, 0, 0, 0x00000)
                .setDepth(DEPTH.VISION)
                .setOrigin(0, 0)
                .setData('permanent', true)
            );
        }
    }

    private initInputModes() {
        // INPUT_ADVENTURING is for the main part of the game, adventuring:
        INPUT_ADVENTURING.setScene(this);
        INPUT_ADVENTURING.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case ' ':
                    this.playerTalk();
                    break;
                case 'n':
                    GFF.showNametags = true;
                    break;
                case 'y':
                    this.doConversationTest();
                    break;
                case 'l':
                    this.getCurrentRoom()?.logRoomInfo();
                    break;
                case 'p':
                    GFF.AdventureUI.pauseAdventure();
                    this.setInputMode(INPUT_PAUSE);
                    break;
                // These will be polled; just ignore:
                case 'ArrowUp':
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'ArrowDown':
                case 'Shift':
                    break;
                default:
                    GFF.AdventureUI.sendPotentialHotkey(keyEvent);
            }
        });
        INPUT_ADVENTURING.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'n':
                    GFF.showNametags = false;
                    break;
            }
        });
        INPUT_ADVENTURING.addPollKeys(['Up', 'Left', 'Right', 'Down', 'Shift']);
        INPUT_ADVENTURING.addAllowedEvent(MOUSE_UI_BUTTON);

        // INPUT_CONVERSATION is active when a conversation bubble is visible:
        INPUT_CONVERSATION.setScene(this);
        INPUT_CONVERSATION.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'Enter':
                case 'ArrowUp':
                case 'ArrowDown':
                    this.conversation?.sendKey(keyEvent.key);
                    break;
                case 'n':
                    GFF.showNametags = true;
                    break;
                case 'p':
                    GFF.AdventureUI.pauseAdventure();
                    this.setInputMode(INPUT_PAUSE);
                    break;
                default:
                    GFF.AdventureUI.sendPotentialHotkey(keyEvent);
            }
        });
        INPUT_CONVERSATION.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'n':
                    GFF.showNametags = false;
                    break;
            }
        });
        INPUT_CONVERSATION.addAllowedEvent(MOUSE_UI_BUTTON);

        // INPUT_POPUP is active when a popup is visible:
        INPUT_POPUP.setScene(this);
        INPUT_POPUP.onKeyDown((keyEvent: KeyboardEvent) => {
            GFF.AdventureUI.sendPotentialHotkey(keyEvent);
        });

        // INPUT_PAUSE is active when the game is paused:
        INPUT_PAUSE.setScene(this);
        INPUT_PAUSE.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'n':
                    GFF.showNametags = true;
                    break;
                case 'p':
                    GFF.AdventureUI.unpauseAdventure();
                    this.revertInputMode();
                    break;
            }
        });
        INPUT_PAUSE.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'n':
                    GFF.showNametags = false;
                    break;
            }
        });
        INPUT_PAUSE.addAllowedEvent(MOUSE_UI_BUTTON);

        // INPUT_DISABLED is active during transitions and cutscenes;
        // no additional initialization is needed, since it won't do anything.
        INPUT_DISABLED.setScene(this);
    }

    private doConversationTest() {
        GConversation.fromFile('solo_test_conv');
    }

    private initPhysics() {
        this.createBottomBound();

        // Add colliders:
        this.physics.add.collider(this.player, this.bottomBound);
        this.physics.add.collider(this.player, this.personsGroup);
        this.physics.add.collider(this.player, this.impsGroup);
        this.physics.add.collider(this.player, this.obstaclesGroup);
        this.physics.add.collider(this.player, this.interactablesGroup);
        this.physics.add.collider(this.personsGroup, this.bottomBound);
        this.physics.add.collider(this.personsGroup, this.personsGroup);
        this.physics.add.collider(this.personsGroup, this.obstaclesGroup);
        this.physics.add.collider(this.personsGroup, this.interactablesGroup);
        this.physics.add.collider(this.impsGroup, this.impsGroup);
        this.physics.add.collider(this.impsGroup, this.bottomBound);

        // Detect collisions between two objects:
        // (only the player has this.body.onCollide = true;
        // we don't care about collisions between other objects)
        this.physics.world.on('collide', (
            obj1: Phaser.GameObjects.GameObject,
            obj2: Phaser.GameObjects.GameObject,
            body1: Phaser.Physics.Arcade.Body,
            body2: Phaser.Physics.Arcade.Body
        ) => {
            let name1 = obj1.toString();
            let name2 = obj2.toString();
            GFF.log(`${name1} collided with ${name2}`);

            // Bottom bound of room:
            if (
                (obj1 === this.bottomBound || obj2 === this.bottomBound)
                && (obj1 === this.player || obj2 === this.player)
            ) {
                this.walkToAdjacentRoom(Dir9.S);
            }

            // Enemy:
            if (
                (obj1 instanceof GImpSprite || obj2 instanceof GImpSprite)
                && (obj1 === this.player || obj2 === this.player)
            ) {
                if (!this.isConversationActive()) {
                    let enemy: GImpSprite = (obj1 instanceof GImpSprite ? obj1 : obj2) as GImpSprite;
                    this.encounterEnemy(enemy);
                }
            }

            // Interactable:
            if (
                (obj1 instanceof GInteractable || obj2 instanceof GInteractable)
                && (obj1 === this.player || obj2 === this.player)
            ) {
                let interactable: GInteractable = (obj1 instanceof GInteractable ? obj1 : obj2) as GInteractable;
                if (interactable.canInteract()) {
                    interactable.interact();
                }
            }
        });

        // Detect collisions with the world bounds:
        const thisScene: GAdventureContent = this;
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) => {
            let obj = body.gameObject;
            let name = obj.toString();
            let dir: Dir9 =
                up ? Dir9.N :
                left ? Dir9.W :
                right ? Dir9.E :
                Dir9.NONE;

            // Log the collision:
            GFF.log(`${name} collided with ${GDirection.dir9Texts()[dir]} WORLDBOUND`);

            // Try to walk to an adjacent room if the player reached the top, left, or right side of the screen:
            if (dir === Dir9.N || dir === Dir9.W || dir === Dir9.E) {
                thisScene.walkToAdjacentRoom(dir);
            }
        });
    }

    private initDebugs() {
        // Enable log toggle:
        this.input.keyboard?.on('keydown-F1', (_event: KeyboardEvent) => {
            GFF.gameLogging = !GFF.gameLogging;
            GFF.log('Logging: ' + GFF.gameLogging);
        });

        // Enable physics debug:
        this.physics.world.debugGraphic = this.add.graphics();
        this.input.keyboard?.on('keydown-F2', (_event: KeyboardEvent) => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
            GFF.log('Physics debug: ' + this.physics.world.drawDebug);
        });
    }

    private createBottomBound() {
        // Create a bottom bound for the room; this is necessary because the room
        // does not extend all the way to the bottom of the screen, due to the icon bar.
        this.bottomBound = this.add.rectangle(GFF.LEFT_BOUND, GFF.BOTTOM_BOUND, GFF.ROOM_W, 1);
        this.bottomBound.setOrigin(0, 0);
        this.bottomBound.setData('permanent', true);
        this.bottomBound.name = 'bottomBound';
        this.physics.add.existing(this.bottomBound, false);
        (this.bottomBound.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    }

    public setVision(full: boolean, commandments: number = 10) {
        full = full || commandments === 10;
        this.visionRadiusImage.setVisible(!full);
        for (let r: number = 0; r < 4; r++) {
            this.visionBlackRects[r].setVisible(!full);
        }
        if (!full) {
            this.visionRadiusImage.setTexture('radius_' + commandments);
        }
    }

    public walkToAdjacentRoom(dir: CardDir) {
        // Move to the adjacent room, if there is one:
        let newRoomX = this.playerRoomX + GDirection.getHorzInc(dir);
        let newRoomY = this.playerRoomY + GDirection.getVertInc(dir);

        if (this.currentArea.containsRoom(this.playerFloor, newRoomX, newRoomY)) {
            // Before transitioning, walk NONE to stop moving and remove diagonals:
            this.player.walkDirection(Dir9.NONE);
            this.player.stop();
            this.transitionToRoom(newRoomX, newRoomY, this.currentArea, () => {
                // Re-position player:
                let newEdge: Dir9 = GDirection.getOpposite(dir);
                let newPlayerX: number =
                    (newEdge === Dir9.W || newEdge === Dir9.E)
                    ? GDirection.getCharPosForEdge(newEdge)
                    : this.player.x;
                let newPlayerY: number =
                    (newEdge === Dir9.N || newEdge === Dir9.S)
                    ? GDirection.getCharPosForEdge(newEdge)
                    : this.player.y;
                this.player.setPosition(newPlayerX, newPlayerY);
                const playerCtr: GPoint = this.player.getPhysicalCenter();
                const room: GRoom = this.getCurrentRoom() as GRoom;
                const wallCtr: GPoint = room.getNearestWallCenter(GDirection.getOpposite(dir) as CardDir, playerCtr);
                this.player.centerPhysically(wallCtr);
            });
        }
    }

    public setCurrentArea(area: GArea) {
        this.currentArea = area;
        if (this.getSound().isMusicPlaying()) {
            this.getSound().fadeOutMusic(500, () => {
                this.startAreaBgMusic();
            });
        } else {
            this.startAreaBgMusic();
        }
    }

    public getCurrentArea(): GArea {
        return this.currentArea;
    }

    public getCurrentFloor(): number {
        return this.playerFloor;
    }

    public startAreaBgMusic() {
        this.getSound().fadeInMusic(this.currentArea.getBgMusic(), 500);
    }

    public setCurrentRoom(roomX: number, roomY: number, area?: GArea) {
        // Unload the current room if there is one:
        let currentRoom: GRoom|null = this.getCurrentRoom();
        currentRoom?.unload();

        // If an area was specified, set it:
        if (area !== undefined && area !== this.currentArea) {
            this.setCurrentArea(area);
        }

        // Set the new coordinates:
        this.playerRoomX = roomX;
        this.playerRoomY = roomY;

        // Load the new room:
        currentRoom = this.getCurrentRoom();
        currentRoom?.discover();
        currentRoom?.load();
    }

    public getCurrentRoom(): GRoom|null {
        return this.currentArea === undefined
            ? null
            : this.currentArea.getRoomAt(this.playerFloor, this.playerRoomX, this.playerRoomY);
    }

    public transitionToRoom(roomX: number, roomY: number, area: GArea, meanwhile: Function) {
        GFF.showNametags = false;
        this.setInputMode(INPUT_DISABLED);
        this.stopChars();
        // Remove the imp spawn event if there is one:
        this.impSpawnTimeEvent?.remove();
        this.fadeOut(500, undefined, () => {
            this.setCurrentRoom(roomX, roomY, area);
            this.spawnPeopleForRoom();

            if (this.getCurrentRoom()?.isSafe()) {
                // Safe rooms:
                this.setVision(true);

            } else {
                // Non-safe rooms:
                this.setVision(false, COMMANDMENTS.getCount());

                // 33% chance to spawn a common chest:
                if (GRandom.randPct() <= .33) {
                    this.spawnCommonChest();
                }

                // Spawn an imp in 1-5 seconds, with 50% chance for up to 2 more:
                this.impSpawnTimeEvent = this.time.delayedCall(GRandom.randInt(1000, 5000), () => {
                    this.addRandomImp();
                    if (GRandom.flipCoin()) {
                        this.impSpawnTimeEvent = this.time.delayedCall(GRandom.randInt(1000, 5000), () => {
                            this.addRandomImp();
                            if (GRandom.flipCoin()) {
                                this.impSpawnTimeEvent = this.time.delayedCall(GRandom.randInt(1000, 5000), () => {
                                    this.addRandomImp();
                                });
                            }
                        });
                    }
                });
            }
            this.fadeIn(500, undefined, meanwhile, () => {
                this.revertInputMode();
            });
        });
    }

    public getSpawnPointForTransient(transient: BoundedGameObject, body: GRect, essential: boolean): GPoint|null {
        let t: number = 0;
        // If it is essential to spawn the transient, keep trying forever; we MUST do it!
        while(essential || t < NON_ESS_TRANS_SPAWN_TRIES) {
            const top: number = GFF.ROOM_AREA_TOP;
            const left: number = GFF.ROOM_AREA_LEFT;
            const right: number = GFF.ROOM_AREA_RIGHT - body.width;
            const bottom: number = GFF.ROOM_AREA_BOTTOM - body.height;
            const tX = GRandom.randInt(left, right);
            const tY = GRandom.randInt(top, bottom);
            if (this.spaceClearForTransient(body, tX, tY)) {
                return {x: tX - body.x, y: tY - body.y};
            }
            t++;
        }
        return null;
    }

    public spaceClearForTransient(transBody: GRect, x: number, y: number): boolean {
        return (
            !this.intersectsWithGroup(transBody, x, y, this.obstaclesGroup)
            && !this.intersectsWithGroup(transBody, x, y, this.personsGroup)
            && !this.intersectsWithGroup(transBody, x, y, this.interactablesGroup)
        );
    }

    public intersectsWithGroup(body: GRect, x: number, y: number, group: Phaser.GameObjects.Group) {
        for (let otherObject of group.getChildren()) {
            if (otherObject.body) {
                const otherBody: GRect = otherObject.body as Phaser.Physics.Arcade.Body;
                if (!(
                    x + body.width <= otherBody.x ||
                    x >= otherBody.x + otherBody.width ||
                    y + body.height <= otherBody.y ||
                    y >= otherBody.y + otherBody.height
                )) {
                    return true;
                }
            }
        }
    }

    public spawnPerson(person: GPerson): boolean {
        const sprite: GPersonSprite = new GPersonSprite(this, person, 0, 0);
        sprite.setVisible(false);
        const body: GRect = sprite.getBody();
        const spawnPoint: GPoint|null = this.getSpawnPointForTransient(sprite, body, false);
        if (!spawnPoint) {
            sprite.destroy();
            return false;
        } else {
            sprite.setVisible(true);
            sprite.setPosition(spawnPoint.x, spawnPoint.y);
            this.addPerson(sprite);
            return true;
        }
    }

    public spawnImp(imp: GSpirit): boolean {
        const sprite: GImpSprite = new GImpSprite(this, imp, 0, 0);
        sprite.setVisible(false);
        const body: GRect = sprite.getBody();
        const spawnPoint: GPoint|null = this.getSpawnPointForTransient(sprite, body, false);
        if (!spawnPoint) {
            sprite.destroy();
            return false;
        } else {
            sprite.setVisible(true);
            sprite.setPosition(spawnPoint.x, spawnPoint.y);
            this.addImp(sprite);
            return true;
        }
    }

    public spawnCommonChest(): boolean {
        const chest: GTreasureChest = new GTreasureChest(0, 0, 'common_chest');
        chest.setVisible(false);
        const body: GRect = chest.getBody();
        const spawnPoint: GPoint|null = this.getSpawnPointForTransient(chest, body, false);
        if (!spawnPoint) {
            chest.destroy();
            return false;
        } else {
            chest.setVisible(true);
            chest.setPosition(spawnPoint.x, spawnPoint.y);
            return true;
        }
    }

    public spawnPeopleForRoom() {
        const room: GRoom = this.getCurrentRoom() as GRoom;
        if (room.getChurch()) {
            // Spawn all people of the church
            this.spawnChurchPeople(room);
        } else if (room.getArea() === AREA.WORLD_AREA) {
            // Add random people from nearby towns
            this.spawnNeighbors(room);
        }
    }

    public spawnChurchPeople(room: GRoom) {
        const church: GChurch = room.getChurch() as GChurch;
        const people: GPerson[] = church.getPeople();
        for (let member of people) {
            this.spawnPerson(member);
        }
    }

    public spawnNeighbors(room: GRoom) {
        // 30% chance to add each citizen if we are in a town:
        const town: GTown|null = room.getTown();
        if (town) {
            const citizens: GPerson[] = town.getPeople();
            for (let p of citizens) {
                if (GRandom.randPct() <= .3) {
                    this.spawnPerson(p);
                }
            }
            return;
        }

        // Get a list of all nearby towns:
        const neighboringTowns: GTown[] = [];
        const neighborsWithTowns = room.getNeighbors((n: GRoom) => {
            return n.getTown() !== null;
        });
        for (let n of neighborsWithTowns) {
            const town: GTown = n.getTown() as GTown;
            if (!neighboringTowns.includes(town)) {
                neighboringTowns.push(town);
            }
        }

        // 10% chance to add each citizen of each nearby town:
        for (let t of neighboringTowns) {
            const citizens: GPerson[] = t.getPeople();
            for (let p of citizens) {
                if (GRandom.randPct() <= .1) {
                    this.spawnPerson(p);
                }
            }
        }
    }

    public addRandomImp() {
        let imp: GSpirit;
        let exists: boolean;
        do {
            exists = false;
            imp = GRandom.randElement(ENEMY.getImps());
            for (let i of this.impsGroup.getChildren() as GImpSprite[]) {
                if (i.getSpirit() === imp) {
                    exists = true;
                }
            }
        } while (exists);
        this.spawnImp(imp);
    }

    public addObstacle(obstacleObject: GObstacleStatic|GObstacleSprite|Phaser.GameObjects.Rectangle) {
        this.obstaclesGroup.add(obstacleObject);
    }

    public addPerson(personSprite: GPersonSprite) {
        this.personsGroup.add(personSprite);
    }

    public addImp(impSprite: GImpSprite) {
        this.impsGroup.add(impSprite);
    }

    public addInteractable(interactable: GInteractable) {
        this.interactablesGroup.add(interactable);
    }

    public encounterEnemy(enemy: GImpSprite) {
        if (PLAYER.getFaith() > 0 && !enemy.isImmobile()) {
            this.stopChars();
            this.setInputMode(INPUT_DISABLED);
            enemy.getSpirit().introduced = true;
            this.player.walkDirection(Dir9.NONE);
            this.getSound().stopMusic();
            ENEMY.init(enemy, enemy.getSpirit(), 'devil_circle', 'battle_devil');
            GFF.AdventureUI.transitionToBattle(this.player.getCenter(), (this.getCurrentRoom() as GRoom).getEncounterBg());
        }
    }

    public resumeAfterBattlePreFadeIn(victory: boolean) {
        this.stopChars();
        GFF.showNametags = false;
        ENEMY.levelUp();
        if (victory) {
            this.impsGroup.remove(ENEMY.getSprite());
            ENEMY.getSprite().destroy();
        } else {
            // It wasn't a victory... faith is probably at 0
            this.updateFidelityMode();
        }
    }

    public resumeAfterBattlePostFadeIn(victory: boolean) {
        this.time.delayedCall(500, () => {
            if (victory) {
                PLAYER.addXp(ENEMY.getXpValue());
                if (PLAYER.canLevelUp()) {
                    this.levelUp();
                } else {
                    this.startAreaBgMusic();
                    this.setInputMode(INPUT_ADVENTURING);
                    this.startChars();
                }
            } else {
                GPopup.createSimplePopup('While you have no faith, enemies will not attack you; however, you cannot open treasure chests or obtain new items.\n\nYou must seek out other believers who can restore you in the spirit of meekness.\n\nBe not faithless, but believing!', 'Where is your faith?').onClose(() => {
                    this.setInputMode(INPUT_ADVENTURING);
                    this.startChars();
                });
            }
        });
    }

    public levelUp() {
        this.getSound().playSound('hallelujah').once('complete', () => {this.getSound().playSound('hallelujah')});
        this.fadeOut(1000, 0xffffff, () => {
            PLAYER.levelUp();
            this.fadeIn(1000, 0xffffff, undefined, () => {
                GPopup.createSimplePopup(`You are now Level ${PLAYER.getLevel()}!`, 'Level Up!').onClose(() => {
                    if (PLAYER.canLevelUp()) {
                        this.levelUp();
                    } else {
                        this.startAreaBgMusic();
                        this.setInputMode(INPUT_ADVENTURING);
                        this.startChars();
                    }
                });
            });
        });
    }

    public getPersonToTalkTo(): GPersonSprite|null {
        const speakArea: GRect = this.player.getInteractionArea();
        const persons: GPersonSprite[] = this.children.list.filter(gameObject =>
            gameObject instanceof GPersonSprite && gameObject.isWithin(speakArea)
        ) as GPersonSprite[];

        let talkPartner: GPersonSprite|null = null;
        let closestDist: number = Number.MAX_VALUE;
        persons.forEach(p => {
            const distToPerson: number = this.player.getDistanceToChar(p);
            if (distToPerson <= closestDist) {
                closestDist = distToPerson;
                talkPartner = p;
            }
        });

        return talkPartner;
    }

    public playerTalk() {
        const talkPartner: GPersonSprite|null = this.getPersonToTalkTo();
        if (talkPartner !== null) {
            talkPartner.getPerson().introduced = true;
            talkPartner.getPerson().knowsPlayer = true;
            GConversation.fromFile('dynamic_test_conv', [
                { label: 'other', char: talkPartner }
            ]);
        }
    }

    public setConversation(conversation: GConversation) {
        this.conversation = conversation;
        this.setInputMode(INPUT_CONVERSATION);
    }

    public getConversation(): GConversation|null {
        return this.conversation;
    }

    public clearConversation(): void {
        this.conversation = null;
        this.revertInputMode();
    }

    public isConversationActive(): boolean {
        return this.conversation !== null;
    }

    public setPopup(popup: GPopup) {
        this.popup = popup;
        this.setInputMode(INPUT_POPUP);
    }

    public getPopup(): GPopup|null {
        return this.popup;
    }

    public clearPopup(postFunction?: Function): void {
        this.popup = null;
        this.revertInputMode();
        this.scene.resume();
        postFunction?.call(this);
    }

    public isPopupActive(): boolean {
        return this.popup !== null;
    }

    public startChars() {
        let objs: Phaser.GameObjects.GameObject[] = this.impsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(false);
        });
        objs = this.personsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(false);
        });
    }

    public stopChars() {
        let objs: Phaser.GameObjects.GameObject[] = this.impsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(true);
        });
        objs = this.personsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(true);
        });
    }

    public updateFidelityMode() {
        this.cameras.main.resetPostPipeline();
        if (PLAYER.getFaith() <= 0) {
            this.cameras.main.setPostPipeline(GrayscalePostFxPipeline);
        }
    }

    private updateVision() {
        const playerCtr: GPoint = this.player.getCenter();
        this.visionRadiusImage.setPosition(playerCtr.x, playerCtr.y);
        const tlRad: GPoint = {
            x: this.visionRadiusImage.x - (this.visionRadiusImage.width / 2),
            y: this.visionRadiusImage.y - (this.visionRadiusImage.height / 2)
        };
        const brRad: GPoint = {
            x: this.visionRadiusImage.x + (this.visionRadiusImage.width / 2),
            y: this.visionRadiusImage.y + (this.visionRadiusImage.height / 2)
        };
        // Top
        this.visionBlackRects[0]
            .setPosition(0, 0)
            .setSize(GFF.GAME_W, tlRad.y);
        // Left
        this.visionBlackRects[1]
            .setPosition(0, tlRad.y)
            .setSize(tlRad.x, this.visionRadiusImage.height);
        // Right
        this.visionBlackRects[2]
            .setPosition(brRad.x, tlRad.y)
            .setSize(GFF.GAME_W - brRad.x, this.visionRadiusImage.height);
        // Bottom
        this.visionBlackRects[3]
            .setPosition(0, brRad.y)
            .setSize(GFF.GAME_W, GFF.BOTTOM_BOUND - brRad.y);
    }

    public update(_time: number, _delta: number): void {
        // Only process user controls for the player if in adventuring input mode:
        if (this.getInputMode() === INPUT_ADVENTURING) {
            const polledKeys: GKeyList = INPUT_ADVENTURING.getPollKeys();
            let direction: Dir9 = GDirection.getDirectionForKeys(polledKeys);
            if (polledKeys['Shift'].isDown) {
                this.player.runDirection(direction);
            } else {
                this.player.walkDirection(direction);
            }
        }

        // Update vision:
        if (this.visionRadiusImage.visible) {
            this.updateVision();
        }

        // Process current conversation, if there is one:
        if (this.conversation !== null) {
            this.conversation.update();
        }
    }

    public endGame() {
        this.setInputMode(INPUT_DISABLED);
        this.getSound().stopMusic();
        this.scene.pause();
        this.getSound().playSound('game_over', .75);
        GFF.AdventureUI.fadeOut(1000, undefined, () => {
            GFF.AdventureUI.add.text(512, 384, 'G A M E    O V E R', {
                fontSize: '32px',
                fontFamily: 'dyonisius',
                color: '#ffffff'
            }).setDepth(DEPTH.TRANSITION).setOrigin(0.5, 0.5);
        });
    }

    public deactivate(): void {
        this.scene.sleep();
    }
}