import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

export function getFiles(dir, ext, filelist = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
        const filepath = join(dir, file);
        if (statSync(filepath).isDirectory()) {
            getFiles(filepath, ext, filelist);
        } else if (file.toLowerCase().endsWith(ext.toLowerCase())) {
            filelist.push(filepath.replace(/^src\\assets\\/, '').replaceAll('\\', '/'));
        }
    });
    return filelist;
}

export function getFilenamesOnly(dir, ext, filelist = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
        const filepath = join(dir, file);
        if (statSync(filepath).isDirectory()) {
            getFilenamesOnly(filepath, ext, filelist);
        } else if (file.toLowerCase().endsWith(ext.toLowerCase())) {
            // Add filename, without the extension
            filelist.push(file.replace(/\.[^/.]+$/, ""));
        }
    });
    return filelist;
}

const ASSETS_PATH = 'src/assets';

const IMAGES_PATH = `${ASSETS_PATH}/images`;
const IMAGE_MANIFEST_NAME = 'image-manifest.json';
const IMAGE_MANIFEST_PATH = `${ASSETS_PATH}/${IMAGE_MANIFEST_NAME}`;

const SCENERY_PATH = `${IMAGES_PATH}/new_scenery_objects`;
const SCENERY_MANIFEST_NAME = 'scenery-manifest.json';
const SCENERY_MANIFEST_PATH = `${ASSETS_PATH}/${SCENERY_MANIFEST_NAME}`;

const SPRITES_PATH = `${ASSETS_PATH}/sprites`;
const SPRITE_MANIFEST_NAME = 'sprite-manifest.json';
const SPRITE_MANIFEST_PATH = `${ASSETS_PATH}/${SPRITE_MANIFEST_NAME}`;

const AUDIO_PATH = `${ASSETS_PATH}/audio`;
const AUDIO_MANIFEST_NAME = 'audio-manifest.json';
const AUDIO_MANIFEST_PATH = `${ASSETS_PATH}/${AUDIO_MANIFEST_NAME}`;

const JSON_PATH = `${ASSETS_PATH}/json`;
const JSON_MANIFEST_NAME = 'json-manifest.json';
const JSON_MANIFEST_PATH = `${ASSETS_PATH}/${JSON_MANIFEST_NAME}`;


const FONT_PATH = `${ASSETS_PATH}/fonts`;
const FONT_MANIFEST_NAME = 'font-manifest.json';
const FONT_MANIFEST_PATH = `${ASSETS_PATH}/${FONT_MANIFEST_NAME}`;

if (existsSync(IMAGE_MANIFEST_PATH)) {
    unlinkSync(IMAGE_MANIFEST_PATH);
}
if (existsSync(SCENERY_MANIFEST_PATH)) {
    unlinkSync(SCENERY_MANIFEST_PATH);
}
if (existsSync(SPRITE_MANIFEST_PATH)) {
    unlinkSync(SPRITE_MANIFEST_PATH);
}
if (existsSync(AUDIO_MANIFEST_PATH)) {
    unlinkSync(AUDIO_MANIFEST_PATH);
}
if (existsSync(JSON_MANIFEST_PATH)) {
    unlinkSync(JSON_MANIFEST_PATH);
}
if (existsSync(FONT_MANIFEST_PATH)) {
    unlinkSync(FONT_MANIFEST_PATH);
}

const imageAssetList = getFiles(IMAGES_PATH, '.png');

if (!existsSync(IMAGE_MANIFEST_PATH)) {
    writeFileSync(IMAGE_MANIFEST_PATH, JSON.stringify(imageAssetList, null, 2));
    console.log('Image Manifest created @ ' + IMAGE_MANIFEST_PATH);
}

const sceneryAssetList = getFilenamesOnly(SCENERY_PATH, '.png');

if (!existsSync(SCENERY_MANIFEST_PATH)) {
    writeFileSync(SCENERY_MANIFEST_PATH, JSON.stringify(sceneryAssetList, null, 2));
    console.log('Scenery Manifest created @ ' + SCENERY_MANIFEST_PATH);
}

const spriteAssetList = getFiles(SPRITES_PATH, '.png');

if (!existsSync(SPRITE_MANIFEST_PATH)) {
    writeFileSync(SPRITE_MANIFEST_PATH, JSON.stringify(spriteAssetList, null, 2));
    console.log('Sprite Manifest created @ ' + SPRITE_MANIFEST_PATH);
}

const audioAssetList = getFiles(AUDIO_PATH, '.wav');

if (!existsSync(AUDIO_MANIFEST_PATH)) {
    writeFileSync(AUDIO_MANIFEST_PATH, JSON.stringify(audioAssetList, null, 2));
    console.log('Audio Manifest created @ ' + AUDIO_MANIFEST_PATH);
}

const jsonAssetList = getFiles(JSON_PATH, '.json');

if (!existsSync(JSON_MANIFEST_PATH)) {
    writeFileSync(JSON_MANIFEST_PATH, JSON.stringify(jsonAssetList, null, 2));
    console.log('JSON Manifest created @ ' + JSON_MANIFEST_PATH);
}

const fontAssetList = getFiles(FONT_PATH, '.ttf');

if (!existsSync(FONT_MANIFEST_PATH)) {
    writeFileSync(FONT_MANIFEST_PATH, JSON.stringify(fontAssetList, null, 2));
    console.log('Font Manifest created @ ' + FONT_MANIFEST_PATH);
}