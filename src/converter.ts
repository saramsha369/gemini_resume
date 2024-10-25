import mammoth from "mammoth";
import path from "path";
import wordExtractor from "word-extractor"
import { listFilesInDirectory } from "./filesToArray";
import { writeToFile } from "./writeFile";

const resumesPath = path.join(process.cwd(), "/resumes")


export function convertDocxFiles() {
    return new Promise((resolve, reject) => {

        const fileList = listFilesInDirectory(resumesPath)

        fileList.forEach(async file => {
            try {
                if (['.docx', '.doc'].some(item => item === file.extension)) {
                    const extractor = new wordExtractor()
                    const result = await extractor.extract(file.fullPath);
                    const wordData = result.getBody()
                    writeToFile(`${file.name}.txt`, wordData, "/resumes")
                }
            } catch (err) {
                reject(err)
            }
        })
        resolve("")
    })
}