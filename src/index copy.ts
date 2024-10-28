import pLimit from "p-limit";
import { listFilesInDirectory } from "./filesToArray";
import { generativeModel } from "./modelConfig";
import { writeToFile } from "./writeFile";
import { promises as fs } from "fs";
import { Content, GenerateContentRequest, Part } from "@google-cloud/vertexai";
import path from "path";
import { arrayBufferToBase64File,  convertHeicToJpeg, readFileAsArrayBuffer, wordFilesToText } from "./converter";
import { ResponseRequired } from "./@types";
import { v4 } from "uuid";

const TEXT_PROMPT = {text:''}

async function generateContent(name: string, data: string, fileType: string,) {
    try {
        const startTime = new Date()
        const parts:Part[] = [
            TEXT_PROMPT,
            {
                inlineData: {
                    data,
                    mimeType:fileType
                }
            }
        ]
        const req: GenerateContentRequest = {
            contents: [
                {
                    role: 'user', parts
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            },
        };


        const streamingResp = await generativeModel.generateContent(req);
        if (!streamingResp.response) return
        if (!streamingResp.response.candidates) return
        const response = JSON.parse(streamingResp.response.candidates[0].content.parts[0].text!) as ResponseRequired
        response.educations = response.educations?.map(item => ({ ...item, id: v4() }))
        response.experiences = response.experiences?.map(item => ({ ...item, id: v4() }))
        writeToFile(`${name}.json`, JSON.stringify(response))

        const endTime = new Date()
        console.log(`\n\nTask "${name}" Ended: ${(endTime.getTime() - startTime.getTime()) / 1000}seconds`);
    }
    catch (err:any) {
        console.log("\n\n",name, fileType);
        throw err
    }
};
async function main() {
    // await convertDocxFiles()
    const promptPath = path.join(process.cwd(), "/src/prompt.txt")
    const prompt_text = await fs.readFile(promptPath, "utf-8")


    const jobData = path.join(process.cwd(), "/src/jobsData.json")
    const jobList = await fs.readFile(jobData, "utf-8")

    TEXT_PROMPT.text = `${prompt_text} JobsData:${jobList.toString()}`

    const resumesPath = path.join(process.cwd(), "/resumes")
    const filesToParse = listFilesInDirectory(resumesPath)
    const limit = pLimit(4)
    const taskList = filesToParse.map(async file => {
        switch (file.extension) {
            case ".pdf":
                return limit(() => generateContent(file.name, file.fullPath, "application/pdf"))

            case ".png":
                return limit(() => generateContent(file.name, file.fullPath, "image/png"))

            case ".jpg":
            case ".jpeg":
                return limit(() => generateContent(file.name, file.fullPath, "image/jpg"))

            case ".heic":
                {
                    const fileBuffer = await readFileAsArrayBuffer(file.fullPath)
                    const resultBuffer = await convertHeicToJpeg(fileBuffer)
                    const base64String = arrayBufferToBase64File(resultBuffer,"image/jpg")
                    return limit(() => generateContent(file.name,base64String , "image/jpg"))
                }

            case ".doc":
            case ".docx":
                {
                    const fileBuffer = await readFileAsArrayBuffer(file.fullPath)
                    const resultBuffer = await wordFilesToText(fileBuffer)
                    const base64String = arrayBufferToBase64File(resultBuffer,"text/plain")

                    return limit(() => generateContent(file.name,base64String , "text/plain"))
                }

        }
    })
    const result = await Promise.allSettled(taskList)
    await writeToFile("error.json",JSON.stringify(result),"/src")
    console.log("Complete Result");
}
try {

    main();
} catch (err) {
    console.log("error occured");
}