import * as fs from 'fs';
import sharp from 'sharp';

async function convertImageToWebp(base64image: string): Promise<string> {
    try {
        // Decode the base64 Image into a Buffer
        const imageBuffer: Buffer = Buffer.from(base64image, 'base64');
        // Use sharp to convert the Image Buffer to WebP Buffer
        const webpBuffer: Buffer = await sharp(imageBuffer, { failOn: "none" }).toFormat('webp').toBuffer();
        // Encode the WebP Buffer to base64
        const base64Webp: string = webpBuffer.toString('base64');
        return base64Webp;
    } catch (error) {
        throw error;
    }
}

function getImageFormatFromDataURI(dataURI: string): string | null {
    // Use a regular expression to extract the image format from the data URI
    const regex: RegExp = /^data:image\/(png|jpeg|gif|TIFF);base64,/;
    const match: RegExpMatchArray | null = dataURI.match(regex);
    // Check if there's a match and extract the image format
    if (match && match[1]) {
        return match[1];
    } else {
        // If no match is found or the format is not supported, return null or handle the error accordingly
        return null;
    }
}

interface Asset {
    p?: string;
    [key: string]: any;
}

interface LottieJson {
    assets?: Asset[];
    op?: any;
    [key: string]: any;
}

/**
 * Processes a Lottie JSON file by converting base64 encoded images to WebP format.
 *
 * @param inputFilePath - The path to the directory containing the input Lottie JSON file.
 * @param outputFilePath - The path to the directory where the processed Lottie JSON file will be saved.
 * @returns A promise that resolves when the processing is complete.
 *
 * @throws Will throw an error if the file cannot be read or written, or if the JSON parsing fails.
 */
export async function processLottieJson(inputFilePath: string, outputFilePath: string): Promise<boolean> {
    try {
        const supportedFormats: string[] = ['png', 'jpeg', 'gif', 'TIFF'];
        
        const jsonData: LottieJson = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
        
        const assets: Asset[] = jsonData.assets || [];
        const assetTF = jsonData.op;
        
        // Convert base64 PNG to base64 WebP for each asset
        await Promise.all(
            assets.map(async (asset: Asset, index: number) => {
                if (!asset.p)
                    return;
                if (asset.p && asset.p.indexOf('data:image') === 0) {
                    const format = getImageFormatFromDataURI(asset.p);
                    if (format && supportedFormats.includes(format)) {
                        const base64Data: string = asset.p.split(',')[1];
                        const base64Webp: string = await convertImageToWebp(base64Data);
                        asset.p = `data:image/webp;base64,${base64Webp}`;
                    }
                }
            })
        );

        fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`Conversion complete. Output saved to ${outputFilePath}`);
        return true;
    } catch (error) {
        console.error('Error:', error);
    }
    return false;
}
