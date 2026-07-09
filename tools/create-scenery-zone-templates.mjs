import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { inflateSync } from 'zlib';

const DEFAULT_INPUT_PATH = 'wip/scenery_template_gfx';
const DEFAULT_OUTPUT_PATH = 'src/assets/json/scenery_zone_templates';
const BLACK_THRESHOLD = 128;

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readPng(filePath) {
    const file = readFileSync(filePath);
    if (!file.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
        throw new Error(`${filePath} is not a PNG file.`);
    }

    let width = 0;
    let height = 0;
    let bitDepth = 0;
    let colorType = 0;
    let interlace = 0;
    let palette = null;
    const idatChunks = [];

    let offset = PNG_SIGNATURE.length;
    while (offset < file.length) {
        const length = file.readUInt32BE(offset);
        const type = file.toString('ascii', offset + 4, offset + 8);
        const data = file.subarray(offset + 8, offset + 8 + length);

        switch (type) {
            case 'IHDR':
                width = data.readUInt32BE(0);
                height = data.readUInt32BE(4);
                bitDepth = data[8];
                colorType = data[9];
                interlace = data[12];
                break;
            case 'PLTE':
                palette = data;
                break;
            case 'IDAT':
                idatChunks.push(data);
                break;
            case 'IEND':
                offset = file.length;
                continue;
        }

        offset += length + 12;
    }

    if (bitDepth !== 8) {
        throw new Error(`${filePath} uses PNG bit depth ${bitDepth}; only 8-bit PNGs are supported.`);
    }
    if (interlace !== 0) {
        throw new Error(`${filePath} is interlaced; only non-interlaced PNGs are supported.`);
    }

    const channels = getChannelCount(colorType);
    const inflated = inflateSync(Buffer.concat(idatChunks));
    const bytesPerPixel = channels;
    const stride = width * channels;
    const pixels = Buffer.alloc(height * stride);

    let sourceOffset = 0;
    for (let y = 0; y < height; y++) {
        const filter = inflated[sourceOffset++];
        const rowStart = y * stride;
        for (let x = 0; x < stride; x++) {
            const raw = inflated[sourceOffset++];
            const left = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
            const up = y > 0 ? pixels[rowStart + x - stride] : 0;
            const upLeft = y > 0 && x >= bytesPerPixel ? pixels[rowStart + x - stride - bytesPerPixel] : 0;

            pixels[rowStart + x] = (raw + getFilterValue(filter, left, up, upLeft)) & 0xff;
        }
    }

    return { width, height, colorType, palette, pixels, stride, channels };
}

function getChannelCount(colorType) {
    switch (colorType) {
        case 0:
            return 1;
        case 2:
            return 3;
        case 3:
            return 1;
        case 4:
            return 2;
        case 6:
            return 4;
        default:
            throw new Error(`Unsupported PNG color type ${colorType}.`);
    }
}

function getFilterValue(filter, left, up, upLeft) {
    switch (filter) {
        case 0:
            return 0;
        case 1:
            return left;
        case 2:
            return up;
        case 3:
            return Math.floor((left + up) / 2);
        case 4:
            return paethPredictor(left, up, upLeft);
        default:
            throw new Error(`Unsupported PNG filter ${filter}.`);
    }
}

function paethPredictor(left, up, upLeft) {
    const prediction = left + up - upLeft;
    const leftDistance = Math.abs(prediction - left);
    const upDistance = Math.abs(prediction - up);
    const upLeftDistance = Math.abs(prediction - upLeft);

    if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
        return left;
    }
    if (upDistance <= upLeftDistance) {
        return up;
    }
    return upLeft;
}

function getPixelRgb(png, x, y) {
    const offset = y * png.stride + x * png.channels;

    switch (png.colorType) {
        case 0:
            return [png.pixels[offset], png.pixels[offset], png.pixels[offset]];
        case 2:
            return [png.pixels[offset], png.pixels[offset + 1], png.pixels[offset + 2]];
        case 3: {
            if (!png.palette) {
                throw new Error('Indexed PNG is missing a palette.');
            }
            const paletteOffset = png.pixels[offset] * 3;
            return [
                png.palette[paletteOffset],
                png.palette[paletteOffset + 1],
                png.palette[paletteOffset + 2],
            ];
        }
        case 4:
            return [png.pixels[offset], png.pixels[offset], png.pixels[offset]];
        case 6:
            return [png.pixels[offset], png.pixels[offset + 1], png.pixels[offset + 2]];
        default:
            throw new Error(`Unsupported PNG color type ${png.colorType}.`);
    }
}

function isBlackPixel(png, x, y) {
    const [r, g, b] = getPixelRgb(png, x, y);
    return r < BLACK_THRESHOLD && g < BLACK_THRESHOLD && b < BLACK_THRESHOLD;
}

function findBlackRectangles(png) {
    const totalPixels = png.width * png.height;
    const black = new Uint8Array(totalPixels);
    const visited = new Uint8Array(totalPixels);

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const index = y * png.width + x;
            black[index] = isBlackPixel(png, x, y) ? 1 : 0;
        }
    }

    const rectangles = [];
    const warnings = [];
    const queue = new Int32Array(totalPixels);

    for (let startIndex = 0; startIndex < totalPixels; startIndex++) {
        if (!black[startIndex] || visited[startIndex]) {
            continue;
        }

        let minX = startIndex % png.width;
        let maxX = minX;
        let minY = Math.floor(startIndex / png.width);
        let maxY = minY;
        let count = 0;
        let queueStart = 0;
        let queueEnd = 0;

        visited[startIndex] = 1;
        queue[queueEnd++] = startIndex;

        while (queueStart < queueEnd) {
            const index = queue[queueStart++];
            const x = index % png.width;
            const y = Math.floor(index / png.width);

            count++;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);

            addNeighbor(index - 1, x > 0);
            addNeighbor(index + 1, x < png.width - 1);
            addNeighbor(index - png.width, y > 0);
            addNeighbor(index + png.width, y < png.height - 1);
        }

        const rect = {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
        };
        const rectArea = rect.width * rect.height;
        if (count !== rectArea) {
            warnings.push(`non-rectangular black region at ${rect.x},${rect.y} (${count}/${rectArea} black pixels)`);
        }
        rectangles.push(rect);

        function addNeighbor(index, isInBounds) {
            if (isInBounds && black[index] && !visited[index]) {
                visited[index] = 1;
                queue[queueEnd++] = index;
            }
        }
    }

    rectangles.sort((a, b) => a.y - b.y || a.x - b.x);
    return { rectangles, warnings };
}

function main() {
    const options = getOptions();

    if (!existsSync(options.inputPath)) {
        throw new Error(`Input folder does not exist: ${options.inputPath}`);
    }
    if (!existsSync(options.outputPath)) {
        mkdirSync(options.outputPath, { recursive: true });
    }

    const pngFiles = readdirSync(options.inputPath)
        .filter(file => extname(file).toLowerCase() === '.png')
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (pngFiles.length === 0) {
        console.log(`No PNG files found in ${options.inputPath}.`);
        return;
    }

    for (const pngFile of pngFiles) {
        const inputFile = join(options.inputPath, pngFile);
        const outputFile = join(options.outputPath, `${basename(pngFile, extname(pngFile))}.json`);
        const png = readPng(inputFile);
        const { rectangles, warnings } = findBlackRectangles(png);

        writeFileSync(outputFile, `${JSON.stringify(rectangles, null, 2)}\n`);
        console.log(`${pngFile} -> ${outputFile} (${rectangles.length} rectangles)`);

        for (const warning of warnings) {
            console.warn(`  Warning: ${warning}`);
        }
    }
}

function getOptions() {
    const options = {
        inputPath: DEFAULT_INPUT_PATH,
        outputPath: DEFAULT_OUTPUT_PATH,
    };

    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith('--input=')) {
            options.inputPath = arg.substring('--input='.length);
        } else if (arg.startsWith('--output=')) {
            options.outputPath = arg.substring('--output='.length);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return options;
}

main();
