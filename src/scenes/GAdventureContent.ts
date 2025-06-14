import 'phaser';
import { GArea } from '../areas/GArea';
import { DIRECTION } from '../direction';
import { GRect, GPerson, GSpirit, GKeyList, BoundedGameObject, GPoint2D, CardDir, Dir9, GInteractable } from '../types';
import { RANDOM } from '../random';
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
import { GTreasureChest } from '../objects/touchables/GTreasureChest';
import { PLAYER } from '../player';
import { ENEMY } from '../enemy';
import { GrayscalePostFxPipeline } from '../shaders/GrayscalePostFxPipeline';
import { GInputMode } from '../GInputMode';
import { AREA } from '../area';
import { GTown } from '../GTown';
import { GChurch } from '../GChurch';
import { DEPTH } from '../depths';
import { COMMANDMENTS } from '../commandments';
import { GTouchable } from '../objects/touchables/GTouchable';
import { PHYSICS } from '../physics';
import { COLOR } from '../colors';
import { GPiano } from '../objects/interactables/GPiano';
import { GBuildingExit } from '../objects/touchables/GBuildingExit';
import { GBuildingEntrance } from '../objects/touchables/GBuildingEntrance';
import { GChurchServiceCutscene } from '../cutscenes/GChurchServiceCutscene';
import { GRestGoal } from '../goals/GRestGoal';
import { GCutscene } from '../cutscenes/GCutscene';
import { GStreetPreachCutscene } from '../cutscenes/GStreetPreachCutscene';
import { GTravelAgentSprite } from '../objects/chars/GTravelAgentSprite';

const MOUSE_UI_BUTTON: string = 'MOUSE_UI_BUTTON';

const INPUT_ADVENTURING: GInputMode = new GInputMode('adv.adventuring');
const INPUT_CONVERSATION: GInputMode = new GInputMode('adv.conversation');
const INPUT_POPUP: GInputMode = new GInputMode('adv.popup');
const INPUT_PAUSE: GInputMode = new GInputMode('adv.paused');
const INPUT_DISABLED: GInputMode = new GInputMode('adv.disabled');

const NON_ESS_TRANS_SPAWN_TRIES: number = 20;
const UNIQUE_ROOM_THRESHOLD: number = 5;

const COMPANION_RELATIVE_SPAWN_POINTS: GPoint2D[] = [
    {x: 0, y: -16},  // N
    {x: 36, y: 0},   // E
    {x: 0, y: 16},   // S
    {x: -36, y: 0},  // W
    {x: 36, y: -16}, // NE
    {x: 36, y: 16},  // SE
    {x: -36, y: 16}, // SW
    {x: -36, y: -16} // NW
];

export class GAdventureContent extends GContentScene {

    private visionRadiusImage: Phaser.GameObjects.Image;
    private visionBlackRects: Phaser.GameObjects.Rectangle[] = [];

    private currentArea: GArea;
    private bottomBound: Phaser.GameObjects.Rectangle;
    private playerFloor: number = 0;
    private playerRoomX: number = 0;
    private playerRoomY: number = 0;
    private uniqueRoomsVisited: GRoom[] = [];

    private player: GPlayerSprite;
    private obstaclesGroup: Phaser.GameObjects.Group;
    private personsGroup: Phaser.GameObjects.Group;
    private impsGroup: Phaser.GameObjects.Group;
    private touchablesGroup: Phaser.GameObjects.Group;

    private impSpawnTimeEvent: Phaser.Time.TimerEvent;

    private popup: GPopup|null = null;
    private conversation: GConversation|null = null;
    private cutscene: GCutscene|null = null;

    constructor() {
        super("AdventureContent");
        GFF.AdventureContent = this;
        this.setContainingMode(GFF.ADVENTURE_MODE);
    }

    public preload(): void {
        this.obstaclesGroup = this.add.group();
        this.personsGroup = this.add.group();
        this.impsGroup = this.add.group();
        this.touchablesGroup = this.add.group();
    }

    public create(): void {
        const startRoom = AREA.WORLD_AREA.getStartRoom();
        this.setCurrentRoom(startRoom.getX(), startRoom.getY(), AREA.WORLD_AREA);

        // Create the player:
        this.player = new GPlayerSprite(512-(GFF.CHAR_W/2), 460);

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

        // Intro:
        if (GFF.introInit) {
            GFF.introInit = false;
            this.time.delayedCall(1000, () => {
                GConversation.fromFile('latest_update_intro');
            });
        }
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
                case '`':
                    this.reportPlayerPosition();
                    break;
                case ' ':
                    this.playerTalkOrInteract();
                    break;
                case 'n':
                    GFF.showNametags = true;
                    break;
                case 'h':
                    GConversation.fromFile('latest_update_intro');
                    break;
                case 'y':
                    GConversation.fromFile('cheat_conv');
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
            }
        });
        INPUT_CONVERSATION.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'n':
                    GFF.showNametags = false;
                    break;
            }
        });

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

        // INPUT_DISABLED is active during transitions and cutscenes;
        // no additional initialization is needed, since it won't do anything.
        INPUT_DISABLED.setScene(this);
    }

    public reportPlayerPosition() {
        const playerCtr: GPoint2D = this.player.getPhysicalCenter();
        console.log(`Player physical center: ${playerCtr.x},${playerCtr.y}`);
    }

    public playerEnterBuilding() {
        const room: GRoom = this.getCurrentRoom() as GRoom;
        const portalRoom: GRoom|null = room.getPortalRoom();

        if (portalRoom !== null) {
            this.player.walkDirection(Dir9.NONE);
            this.player.faceDirection(Dir9.N);
            this.player.stop();

            this.transitionToRoom(portalRoom.getX(), portalRoom.getY(), portalRoom.getArea(), () => {
                // If the player is entering a church, we need to play the service cutscene:
                if (room.getChurch() !== null) {
                    const church: GChurch = room.getChurch() as GChurch;
                    new GChurchServiceCutscene(church).play();
                } else {
                    // If not starting a cutscene, we'll just position the player at the exit
                    const exit: GBuildingExit = this.children.list.find(gameObject =>
                        gameObject instanceof GBuildingExit
                    ) as GBuildingExit;

                    const newPlayerX: number = exit.x + (exit.width / 2);
                    const newPlayerY: number = exit.y - (GFF.CHAR_BODY_H / 2) - 1;
                    this.player.centerPhysically({x: newPlayerX, y: newPlayerY});
                }
            });
        }
    }

    public playerExitBuilding() {
        const room: GRoom = this.getCurrentRoom() as GRoom;
        const portalRoom: GRoom|null = room.getPortalRoom();

        if (portalRoom !== null) {
            this.player.walkDirection(Dir9.NONE);
            this.player.faceDirection(Dir9.S);
            this.player.stop();
            this.transitionToRoom(portalRoom.getX(), portalRoom.getY(), portalRoom.getArea(), () => {
                // We'll initially hide the player.
                // When the new room is loaded, his position will cause the door-open trigger,
                // and we'll make him visible when that animation is finished.
                this.player.setVisible(false);

                // Although you left through an exit, you'll actually come out the entrance:
                const entrance: GBuildingEntrance = this.children.list.find(gameObject =>
                    gameObject instanceof GBuildingEntrance
                ) as GBuildingEntrance;

                // Re-position player:
                const newPlayerX: number = entrance.x + (entrance.width / 2);
                const newPlayerY: number = entrance.y + (GFF.CHAR_BODY_H / 2) + 1;
                this.player.centerPhysically({x: newPlayerX, y: newPlayerY});
            });
        }
    }

    private doMapExport(fromX: number, fromY: number) {
        // if (this.mapRt === undefined) {
        //     this.mapRt = new Phaser.GameObjects.RenderTexture(this, 0, 0, 2000, 1200);
        // }

        const area = this.getCurrentArea();
        const w = area.getWidth();
        const h = area.getHeight();
        const finalX = fromX;
        const finalY = fromY;
        const n = (finalY * w) + finalX;
        this.setCurrentRoom(finalX, finalY);
        this.sys.game.renderer.snapshotArea(
            0, 0, GFF.ROOM_W, GFF.ROOM_H,
            (image: HTMLImageElement|Phaser.Display.Color) => {
                // Save the image as a base64 data URL
                let dataUrl = (image as HTMLImageElement).src;

                // Trigger a download
                let a = document.createElement('a');
                a.href = dataUrl;
                a.download = `Room-${n}__${finalX},${finalY}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                let nextX = finalX;
                let nextY = finalY;
                if (nextX < w-1) {
                    nextX++;
                } else {
                    nextX = 0;
                    nextY++;
                }
                if (nextY < h) {
                    // Recurse
                    this.doMapExport(nextX, nextY);
                }
            }
        );
    }

    private initPhysics() {
        this.createBottomBound();

        // Add colliders:
        this.physics.add.collider(this.player, this.bottomBound);
        this.physics.add.collider(this.player, this.personsGroup);
        this.physics.add.collider(this.player, this.impsGroup);
        this.physics.add.collider(this.player, this.obstaclesGroup);
        this.physics.add.collider(this.player, this.touchablesGroup);
        this.physics.add.collider(this.personsGroup, this.bottomBound);
        this.physics.add.collider(this.personsGroup, this.personsGroup);
        this.physics.add.collider(this.personsGroup, this.obstaclesGroup);
        this.physics.add.collider(this.personsGroup, this.touchablesGroup);
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

            // Person collisions:
            if (obj1 instanceof GPersonSprite || obj2 instanceof GPersonSprite) {
                // If a person collides with the player, make them rest for 1 second,
                // facing the player, so we'll have a better chance to talk to them.
                // If the person is not moving, just face the player.
                if (obj1 === this.player && obj2 instanceof GPersonSprite && obj2.canInterrupt()) {
                    if (obj2.isDoing('walk')) {
                        obj2.setGoal(new GRestGoal(1000, DIRECTION.getDirectionOf(body2.center, body1.center)));
                    } else {
                        obj2.faceChar(this.player, true);
                    }
                } else if (obj2 === this.player && obj1 instanceof GPersonSprite && obj1.canInterrupt()) {
                    if (obj1.isDoing('walk')) {
                        obj1.setGoal(new GRestGoal(1000, DIRECTION.getDirectionOf(body1.center, body2.center)));
                    } else {
                        obj1.faceChar(this.player, true);
                    }
                } else {
                    // Otherwise, if a person collides with anything else (outside of a cutscene)
                    // while walking, reset their goal; this will keep them from trying to walk through obstacles.
                    if (this.cutscene === null && obj1 instanceof GPersonSprite && obj1.isDoing('walk') && obj1.canInterrupt()) {
                        obj1.setGoal(null);
                    }
                    if (this.cutscene === null && obj2 instanceof GPersonSprite && obj2.isDoing('walk') && obj2.canInterrupt()) {
                        obj2.setGoal(null);
                    }
                }
            }

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
                if (!this.isConversationOrCutsceneActive()) {
                    let enemy: GImpSprite = (obj1 instanceof GImpSprite ? obj1 : obj2) as GImpSprite;
                    this.encounterEnemy(enemy);
                }
            }

            // Touchable:
            if (
                (obj1 instanceof GTouchable || obj2 instanceof GTouchable)
                && (obj1 === this.player || obj2 === this.player)
            ) {
                let touchable: GTouchable = (obj1 instanceof GTouchable ? obj1 : obj2) as GTouchable;
                if (touchable.canTouch()) {
                    touchable.doTouch();
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
            GFF.log(`${name} collided with ${DIRECTION.dir9Texts()[dir]} WORLDBOUND`);

            // Try to walk to an adjacent room if the player reached the top, left, or right side of the screen:
            if (dir === Dir9.N || dir === Dir9.W || dir === Dir9.E) {
                if (obj === PLAYER.getSprite()) {
                    thisScene.walkToAdjacentRoom(dir);
                }
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
        this.input.keyboard?.on('keydown-F2', (_event: KeyboardEvent) => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic = this.add.graphics();
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

    public setBottomBoundEnabled(enabled: boolean) {
        (this.bottomBound.body as Phaser.Physics.Arcade.Body).setEnable(enabled);
    }

    public setVision(full: boolean, commandments: number = 10) {
        full = full || commandments === 10 || GFF.debugMode;
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
        let newRoomX = this.playerRoomX + DIRECTION.getHorzInc(dir);
        let newRoomY = this.playerRoomY + DIRECTION.getVertInc(dir);

        if (this.currentArea.containsRoom(this.playerFloor, newRoomX, newRoomY)) {
            // Before transitioning, walk NONE to stop moving and remove diagonals:
            this.player.walkDirection(Dir9.NONE);
            this.player.stop();
            this.transitionToRoom(newRoomX, newRoomY, this.currentArea, () => {
                // Re-position player:
                let newEdge: Dir9 = DIRECTION.getOpposite(dir);
                let newPlayerX: number =
                    (newEdge === Dir9.W || newEdge === Dir9.E)
                    ? DIRECTION.getCharPosForEdge(newEdge)
                    : this.player.x;
                let newPlayerY: number =
                    (newEdge === Dir9.N || newEdge === Dir9.S)
                    ? DIRECTION.getCharPosForEdge(newEdge)
                    : this.player.y;
                this.player.setPosition(newPlayerX, newPlayerY);
                const playerCtr: GPoint2D = this.player.getPhysicalCenter();
                const room: GRoom = this.getCurrentRoom() as GRoom;
                const wallCtr: GPoint2D = room.getNearestWallCenter(DIRECTION.getOpposite(dir) as CardDir, playerCtr);
                this.player.centerPhysically(wallCtr);
                // Spawn companion after the player is positioned:
                this.spawnCompanion();
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
        currentRoom = this.getCurrentRoom() as GRoom;
        currentRoom.discover();
        currentRoom.load();

        // Add the new room to the list of unique rooms visited:
        if (!this.uniqueRoomsVisited.includes(currentRoom)) {
            this.uniqueRoomsVisited.push(currentRoom);
            GFF.log(`Unique rooms visited: ${this.uniqueRoomsVisited.length}`);
            if (this.uniqueRoomsVisited.length >= UNIQUE_ROOM_THRESHOLD) {
                this.uniqueRoomsVisited.length = 0;
                this.resetUniqueRoomsFlags();
            }
        }
    }

    public getCurrentRoom(): GRoom|null {
        return this.currentArea === undefined
            ? null
            : this.currentArea.getRoomAt(this.playerFloor, this.playerRoomX, this.playerRoomY);
    }

    public reloadCurrentRoom(meanwhile: Function) {
        this.transitionToRoom(this.playerRoomX, this.playerRoomY, this.currentArea, meanwhile);
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
                if (RANDOM.randPct() <= .33) {
                    this.spawnCommonChest();
                }

                if (!GFF.impRepellant) {
                    // Spawn an imp in 1-5 seconds, with 50% chance for up to 2 more:
                    this.impSpawnTimeEvent = this.time.delayedCall(RANDOM.randInt(1000, 5000), () => {
                        this.addRandomImp();
                        if (RANDOM.flipCoin()) {
                            this.impSpawnTimeEvent = this.time.delayedCall(RANDOM.randInt(1000, 5000), () => {
                                this.addRandomImp();
                                if (RANDOM.flipCoin()) {
                                    this.impSpawnTimeEvent = this.time.delayedCall(RANDOM.randInt(1000, 5000), () => {
                                        this.addRandomImp();
                                    });
                                }
                            });
                        }
                    });
                }
            }
            this.fadeIn(500, undefined, meanwhile, () => {
                this.revertInputMode();
            });
        });
    }

    private resetUniqueRoomsFlags() {
        GFF.canGiftSeed = true;
    }

    public getSpawnPointForTransient(transient: BoundedGameObject, body: GRect, essential: boolean): GPoint2D|null {
        let t: number = 0;
        // If it is essential to spawn the transient, keep trying forever; we MUST do it!
        while(essential || t < NON_ESS_TRANS_SPAWN_TRIES) {
            const top: number = GFF.ROOM_AREA_TOP;
            const left: number = GFF.ROOM_AREA_LEFT;
            const right: number = GFF.ROOM_AREA_RIGHT - body.width;
            const bottom: number = GFF.ROOM_AREA_BOTTOM - body.height;
            const tX = RANDOM.randInt(left, right);
            const tY = RANDOM.randInt(top, bottom);
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
            && !this.intersectsWithGroup(transBody, x, y, this.touchablesGroup)
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

    /**
     * Spawn a person sprite at a given or random location.
     * If person is a GPersonSprite, the existing sprite is positioned.
     * If person is a GPerson, a sprite is created for it.
     *
     * The sprite is destroyed if it doesn't fit in the chosen location;
     * for that reason, only spawn important sprites at locations that
     * are known to be safe. Sprites attempting to spawn at random
     * locations are deemed to be non-critical, and may not spawn at all
     * if an invalid location is chosen.
     */
    public spawnPerson(person: GPerson|GPersonSprite, location?: GPoint2D): GCharSprite|null {
        const sprite: GPersonSprite = person instanceof GPersonSprite ?
            person :
            new GPersonSprite(person, 0, 0);

        sprite.setVisible(false);
        const body: GRect = sprite.getBody();
        const spawnPoint: GPoint2D|null = location ?? this.getSpawnPointForTransient(sprite, body, false);
        if (spawnPoint === null) {
            sprite.destroy();
            return null;
        } else {
            sprite.setVisible(true);
            sprite.setPosition(spawnPoint.x, spawnPoint.y);
            this.addPerson(sprite);
            return sprite;
        }
    }

    /**
     * Same as spawnPerson, but for essential people.
     * We will keep trying to spawn them until we find a valid location.
     */
    public spawnEssentialPerson(person: GPerson|GPersonSprite, location?: GPoint2D): GCharSprite {
        const sprite: GPersonSprite = person instanceof GPersonSprite ?
            person :
            new GPersonSprite(person, 0, 0);

        sprite.setVisible(false);
        const body: GRect = sprite.getBody();

        // Pass true (essential) if the random point function is used:
        const spawnPoint: GPoint2D = location ?? this.getSpawnPointForTransient(sprite, body, true) as GPoint2D;

        sprite.setVisible(true);
        sprite.setPosition(spawnPoint.x, spawnPoint.y);
        this.addPerson(sprite);
        return sprite;
    }

    /**
     * Spawn an imp sprite at a given or random location.
     * If imp is a GImpSprite, the existing sprite is positioned.
     * If imp is a GSpirit, a sprite is created for it.
     *
     * The sprite is destroyed if it doesn't fit in the chosen location;
     * for that reason, only spawn important sprites at locations that
     * are known to be safe. Sprites attempting to spawn at random
     * locations are deemed to be non-critical, and may not spawn at all
     * if an invalid location is chosen.
     */
    public spawnImp(imp: GSpirit|GImpSprite, location?: GPoint2D): GCharSprite|null {
        const sprite: GImpSprite = imp instanceof GImpSprite ?
            imp :
            new GImpSprite(imp, 0, 0);
        sprite.setVisible(false);
        const body: GRect = sprite.getBody();
        const spawnPoint: GPoint2D|null = location ?? this.getSpawnPointForTransient(sprite, body, false);
        if (!spawnPoint) {
            sprite.destroy();
            return null;
        } else {
            sprite.setVisible(true);
            sprite.setPosition(spawnPoint.x, spawnPoint.y);
            this.addImp(sprite);
            return sprite;
        }
    }

    public spawnCommonChest(): boolean {
        const chest: GTreasureChest = new GTreasureChest(0, 0, 'common_chest');
        chest.setVisible(false);
        const body: GRect = chest.getBody();
        const spawnPoint: GPoint2D|null = this.getSpawnPointForTransient(chest, body, false);
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

    public spawnCompanion() {
        if (PLAYER.getCompanion() !== null) {
            const companion: GPerson = PLAYER.getCompanion() as GPerson;
            let companionSprite: GPersonSprite|null;
            for (let i: number = 1; i <= 3; i++) {
                for (let point of COMPANION_RELATIVE_SPAWN_POINTS) {
                    const spawnPoint: GPoint2D = {x: PLAYER.getSprite().x + (point.x * i), y: PLAYER.getSprite().y + (point.y * i)};
                    companionSprite = this.spawnPerson(companion, spawnPoint) as GPersonSprite|null;
                    if (companionSprite !== null) {
                        return;
                    }
                }
            }
        }
    }

    public spawnChurchPeople(room: GRoom) {
        const church: GChurch = room.getChurch() as GChurch;
        const people: GPerson[] = church.getPeople();
        // If player has faith, do a normal, random spawn:
        if (PLAYER.getFaith() > 0) {
            for (let member of people) {
                // Don't spawn the player companion along with the other church members:
                if (member !== PLAYER.getCompanion()) {
                    this.spawnPerson(member);
                }
            }
        } else {
            // If player has no faith, spawn the church members in a tight cluster,
            // and make them all rest; they'll have a prayer meeting soon...
            this.spawnPeopleCluster(people);
        }
    }

    private spawnPeopleCluster(people: GPerson[]) {
        let ctrPoint: GPoint2D|null = null;
        for (let member of people) {
            // Don't spawn the player companion if he is one of the people:
            if (member !== PLAYER.getCompanion()) {
                // First person's location will be the center of the cluster:
                if (ctrPoint === null) {
                    const firstSprite: GCharSprite = this.spawnEssentialPerson(member);
                    firstSprite.setGoal(new GRestGoal(undefined));
                    ctrPoint = firstSprite.getPhysicalCenter();
                } else {
                    const sprite: GCharSprite|null = this.spawnPersonNear(member, ctrPoint, 150);
                    if (sprite !== null) {
                        sprite.setGoal(new GRestGoal(undefined));
                    }
                }
            }
        }
    }

    private spawnPersonNear(person: GPerson, ctrPoint: GPoint2D, distance: number, tries: number = 10): GCharSprite|null {
        let sprite: GCharSprite|null = null;
        for (let t = 0; t < tries; t++) {
            const x: number = ctrPoint.x + RANDOM.randInt(-distance, distance);
            const y: number = ctrPoint.y + RANDOM.randInt(-distance, distance);
            sprite = this.spawnPerson(person, {x, y});
            if (sprite !== null) {
                return sprite;
            }
        }
        return null;
    }

    public spawnNeighbors(room: GRoom) {
        // 30% chance to add each citizen if we are in a town:
        const town: GTown|null = room.getTown();
        if (town) {
            const citizens: GPerson[] = town.getPeople();
            for (let p of citizens) {
                if (RANDOM.randPct() <= .3) {
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
                if (RANDOM.randPct() <= .1) {
                    this.spawnPerson(p);
                }
            }
        }
    }

    public addRandomImp() {
        // Only spawn an imp if the player is not in a conversation or cutscene:
        if (this.isConversationOrCutsceneActive()) {
            return;
        }

        let imp: GSpirit;
        let exists: boolean;
        do {
            exists = false;
            imp = RANDOM.randElement(ENEMY.getImps());
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

    public getPersons(includeTravelAgent: boolean = false): GPersonSprite[] {
        const persons: GPersonSprite[] = this.personsGroup.getChildren() as GPersonSprite[];
        if (includeTravelAgent) {
            return persons;
        } else {
            return persons.filter(p => !(p instanceof GTravelAgentSprite));
        }
    }

    public addImp(impSprite: GImpSprite) {
        this.impsGroup.add(impSprite);
    }

    public getImps(): GImpSprite[] {
        return this.impsGroup.getChildren() as GImpSprite[];
    }

    public addTouchable(touchable: GTouchable) {
        this.touchablesGroup.add(touchable);
    }

    public encounterEnemy(enemy: GImpSprite) {
        if (PLAYER.getFaith() > 0 && !enemy.isImmobile()) {
            this.stopChars();
            this.setInputMode(INPUT_DISABLED);
            enemy.getSpirit().introduced = true;
            this.player.walkDirection(Dir9.NONE);
            this.getSound().stopMusic();
            ENEMY.init(enemy, enemy.getSpirit(), 'spirit_circle', 'battle_spirit');
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

    public getInteractionTarget(): GInteractable|null {
        const interactArea: GRect = this.player.getInteractionArea();
        const interactables: GInteractable[] = this.children.list.filter(gameObject =>
            'interact' in gameObject
        ) as GInteractable[];

        let target: GInteractable|null = null;
        let closestDist: number = Number.MAX_VALUE;
        interactables.forEach(i => {
            const dist: number = PHYSICS.getDistanceBetween(this.player, i);
            if (PHYSICS.isCenterWithin(i, interactArea) && dist <= closestDist) {
                closestDist = dist;
                target = i;
            }
        });

        return target;
    }

    public playerTalkOrInteract() {
        const target: GInteractable|null = this.getInteractionTarget();
        if (target !== null) {
            target.interact();
        }
    }

    public playerPlayPiano(piano: GPiano) {
        this.setInputMode(INPUT_CONVERSATION);
        this.stopChars();
        this.getSound().fadeOutMusic(500);
        this.fadeOut(500, COLOR.BLACK.num(), () => {
            PHYSICS.setPositionRelativeTo(this.player, piano, -12, 2);
            this.player.play('adam_sit_ne', false);
            this.fadeIn(500, COLOR.BLACK.num(), () => {
                GConversation.fromFile('play_piano');
            });
        });
    }

    public playerFinishPiano() {
        this.fadeOut(500, COLOR.BLACK.num(), () => {
            PHYSICS.setPositionRelativeTo(this.player, this.player, 0, 24);
            this.player.walkDirection(Dir9.S);
            this.getSound().fadeInMusic(this.currentArea.getBgMusic(), 500);
            this.fadeIn(500, COLOR.BLACK.num(), () => {
                this.startChars();
                this.setInputMode(INPUT_ADVENTURING);
            });
        });
    }

    public canStreetPreach(): boolean {
        const room: GRoom = this.getCurrentRoom() as GRoom;
        // Can only preach a sermon under the following conditions:
        return (
            this.getInputMode() === INPUT_ADVENTURING &&
            room.getChurch() === null &&
            room.getArea() === AREA.WORLD_AREA &&
            this.getPersons().length > 0 &&
            PLAYER.getFaith() > 0 &&
            PLAYER.getSermons() > 0
        );
    }

    public streetPreach() {
        if (this.canStreetPreach()) {
            this.stopChars(true, false, true);
            this.getPersons().forEach(person => {
                person.faceChar(PLAYER.getSprite(), true);
            });
            new GStreetPreachCutscene().play();
        }
    }

    /**
     * I hate to do this, but it may be necessary in certain cases when
     * changing from one input mode to another (for example, from Conversation
     * to Popup) in order to make sure that revertInputMode() correctly switches
     * back to Adventuring when it is finally called.
     */
    public forceAdventureInputMode() {
        this.setInputMode(INPUT_ADVENTURING);
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

    public isConversationOrCutsceneActive(): boolean {
        return this.conversation !== null || this.cutscene !== null;
    }

    public setPopup(popup: GPopup) {
        this.popup = popup;
        this.setInputMode(INPUT_POPUP);
    }

    public getPopup(): GPopup|null {
        return this.popup;
    }

    public clearPopup(postFunction?: Function) {
        this.popup = null;
        this.revertInputMode();
        this.scene.resume();
        postFunction?.call(this);
    }

    public isPopupActive(): boolean {
        return this.popup !== null;
    }

    public setCutscene(cutscene: GCutscene) {
        this.cutscene = cutscene;
        this.setInputMode(INPUT_CONVERSATION);
    }

    public getCutscene(): GCutscene|null {
        return this.cutscene;
    }

    public clearCutscene() {
        this.cutscene = null;
        this.setInputMode(INPUT_ADVENTURING);
    }

    public startChars() {
        let objs: Phaser.GameObjects.GameObject[] = this.impsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(false);
            (obj as GCharSprite).setControlled(false);
        });
        objs = this.personsGroup.getChildren();
        objs.forEach(obj => {
            (obj as GCharSprite).setImmobile(false);
            (obj as GCharSprite).setControlled(false);
        });
        this.player.setImmobile(false);
        this.player.setControlled(true);
    }

    public stopChars(stopPeople: boolean = true, stopImps: boolean = true, stopPlayer: boolean = true) {
        let objs: Phaser.GameObjects.GameObject[] = this.impsGroup.getChildren();
        if (stopImps) {
            objs.forEach(obj => {
                (obj as GCharSprite).setImmobile(true);
            });
        }
        if (stopPeople) {
            objs = this.personsGroup.getChildren();
            objs.forEach(obj => {
                (obj as GCharSprite).setImmobile(true);
            });
        }
        if (stopPlayer) {
            this.player.setImmobile(true);
        }
    }

    public updateFidelityMode() {
        this.cameras.main.resetPostPipeline();
        if (PLAYER.getFaith() <= 0) {
            this.cameras.main.setPostPipeline(GrayscalePostFxPipeline);
        }
    }

    private updateVision() {
        const playerCtr: GPoint2D = this.player.getCenter();
        this.visionRadiusImage.setPosition(playerCtr.x, playerCtr.y);
        const tlRad: GPoint2D = {
            x: this.visionRadiusImage.x - (this.visionRadiusImage.width / 2),
            y: this.visionRadiusImage.y - (this.visionRadiusImage.height / 2)
        };
        const brRad: GPoint2D = {
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
            let direction: Dir9 = DIRECTION.getDirectionForKeys(polledKeys);
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

        // Process event triggers:
        this.getCurrentRoom()?.getEventTriggers().forEach(t => {
            t.process();
        });

        // Check cutscene conditions, allowing conditional events:
        this.cutscene?.checkConditions();

        // Process current conversation, if there is one:
        this.conversation?.update();
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