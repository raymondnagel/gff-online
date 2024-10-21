import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

export function getFiles(dir, filelist = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
        const filepath = join(dir, file);
        if (statSync(filepath).isDirectory()) {
            getFiles(filepath, filelist);
        } else {
            filelist.push(filepath.replace(/^src\\assets\\/, '').replaceAll('\\', '/'));
        }
    });
    return filelist;
}

const ASSETS_PATH = 'src/assets';

const IMAGES_PATH = `${ASSETS_PATH}/images`;
const IMAGE_MANIFEST_NAME = 'image-manifest.json';
const IMAGE_MANIFEST_PATH = `${ASSETS_PATH}/${IMAGE_MANIFEST_NAME}`

const SPRITES_PATH = `${ASSETS_PATH}/sprites`;
const SPRITE_MANIFEST_NAME = 'sprite-manifest.json';
const SPRITE_MANIFEST_PATH = `${ASSETS_PATH}/${SPRITE_MANIFEST_NAME}`

const AUDIO_PATH = `${ASSETS_PATH}/audio`;
const AUDIO_MANIFEST_NAME = 'audio-manifest.json';
const AUDIO_MANIFEST_PATH = `${ASSETS_PATH}/${AUDIO_MANIFEST_NAME}`

const JSON_PATH = `${ASSETS_PATH}/json`;
const JSON_MANIFEST_NAME = 'json-manifest.json';
const JSON_MANIFEST_PATH = `${ASSETS_PATH}/${JSON_MANIFEST_NAME}`

if (existsSync(IMAGE_MANIFEST_PATH)) {
    unlinkSync(IMAGE_MANIFEST_PATH);
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

const imageAssetList = getFiles(IMAGES_PATH);

if (!existsSync(IMAGE_MANIFEST_PATH)) {
    writeFileSync(IMAGE_MANIFEST_PATH, JSON.stringify(imageAssetList, null, 2));
    console.log('Image Manifest created @ ' + IMAGE_MANIFEST_PATH);
}

const spriteAssetList = getFiles(SPRITES_PATH);

if (!existsSync(SPRITE_MANIFEST_PATH)) {
    writeFileSync(SPRITE_MANIFEST_PATH, JSON.stringify(spriteAssetList, null, 2));
    console.log('Sprite Manifest created @ ' + SPRITE_MANIFEST_PATH);
}

const audioAssetList = getFiles(AUDIO_PATH);

if (!existsSync(AUDIO_MANIFEST_PATH)) {
    writeFileSync(AUDIO_MANIFEST_PATH, JSON.stringify(audioAssetList, null, 2));
    console.log('Audio Manifest created @ ' + AUDIO_MANIFEST_PATH);
}

const jsonAssetList = getFiles(JSON_PATH);

if (!existsSync(JSON_MANIFEST_PATH)) {
    writeFileSync(JSON_MANIFEST_PATH, JSON.stringify(jsonAssetList, null, 2));
    console.log('JSON Manifest created @ ' + JSON_MANIFEST_PATH);
}