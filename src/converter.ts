import path from "path";
import wordExtractor from "word-extractor"
import { listFilesInDirectory } from "./filesToArray";
import { writeToFile } from "./writeFile";
import axios from "axios";
import heicConvert from "heic-convert"
import { promises as fs, write } from "fs"

const resumesPath = path.join(process.cwd(), "/resumes")

export async function urlToBuffer(fileURL:string):Promise<ArrayBuffer>{
    const response = await axios.get(fileURL, { responseType: 'arraybuffer' });
      const heicBuffer = Buffer.from(response.data);
      return heicBuffer
}

export async function wordFilesToText(file:ArrayBuffer):Promise<ArrayBuffer>{
    const extractor = new wordExtractor()
    const fileBuffer = Buffer.from(file)
    const result = await extractor.extract(fileBuffer);
    const wordData = result.getBody()
    // writeToFile(`text${(Math.random()%100*100).toFixed()}.txt`,wordData,"/generated-result/gen")
    return Buffer.from(wordData)
}

// export function convertDocxFiles(){
//     return new Promise((resolve, reject) => {

//         const fileList = listFilesInDirectory(resumesPath)

//         fileList.forEach(async file => {
//             try {
//                 if (['.docx', '.doc'].some(item => item === file.extension)) {
//                     const extractor = new wordExtractor()
//                     const result = await extractor.extract(file.fullPath);
//                     const wordData = result.getBody()
//                     // writeToFile(`${file.name}.txt`, wordData, "/resumes")
//                     return Buffer.from(wordData)
//                 }
//             } catch (err) {
//                 reject(err)
//             }
//         })
//         resolve("")
//     })
// }


export async function convertHeicToJpeg(heicBuffer: ArrayBuffer): Promise<ArrayBuffer> {
      const outputBuffer = await heicConvert({
          buffer: Buffer.from(heicBuffer), // the HEIC file buffer
          format: 'JPEG',      // output format
          quality: 1,           // the jpeg compression quality, between 0 and 1
        });
    // writeToFile(`text${(Math.random()%100*100).toFixed()}.jpg`,Buffer.from(outputBuffer).toString(),"/generated-result/gen")

      return outputBuffer
  }

  export function arrayBufferToBase64File(arrayBuffer: ArrayBuffer, mimeType: string): string {
    const uint8Array = new Uint8Array(arrayBuffer)
    const buffer = Buffer.from(uint8Array);
    const base64String = buffer.toString('base64');
    return base64String;
  }

  export async function readFileAsArrayBuffer(filePath: string): Promise<ArrayBuffer> {
    // Read the file as a Node.js Buffer
    const buffer = await fs.readFile(filePath);
  
    // Convert the Node.js Buffer to an ArrayBuffer
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
    return arrayBuffer;
  }

  export async function getMimeTypeFromUrl(url: string) {
    try {
        const response = await axios.get(url, { method: 'HEAD', responseType:"arraybuffer" });
        const contentType = response.headers["Content-Type"] || response.headers["content-type"]
        const data = response.data
        return { contentType, data };
    } catch (error) {
        throw error
    }
}