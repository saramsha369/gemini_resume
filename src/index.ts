import pLimit from "p-limit";
import { listFilesInDirectory } from "./filesToArray";
import { generativeModel } from "./modelConfig";
import { writeToFile } from "./writeFile";
import { promises as fs } from "fs";
import { GenerateContentRequest } from "@google-cloud/vertexai";
import path from "path";
import { convertDocxFiles } from "./converter";
import { ResponseRequired } from "./@types";
import { v4 } from "uuid";

const TEXT_PROMPT = {
    text: `
    
    Task: Extract Experience, Education, and Skills from the following resume data. Organize the information into a structured JSON format with the following structure:

    Note: Dates does not have to be precious just MM/YYYY would be okay too or empty string
    Experience: An array of objects where each object contains:

    jobTitle (string)
    companyName (string)
    location (string)
    datesOfEmployment: An object with start (string) and end (string or \"Present\").
    responsibilitiesAndAchievements: An array of bullet points (strings) summarizing responsibilities and achievements.
    
    
    Education: An array of objects where each object contains:

    degree (string)
    institution (string)
    location (string)
    graduationYear (string or Date or Expected Year)
    relevantCoursework (optional array of strings)
    grades (string percentage/gpa)
    

    Skills: An object that includes:

    technicalSkills: An array of technical skills (strings).
    softSkills: An array of soft skills (strings).
    languages: An optional array where each object contains language (string) and proficiency (string).
    
    Below is the resume data:
`};

async function generateContent(name: string, filePath: string, fileType: string) {
    const startTime = new Date()

    const FILE_TO_UPLOAD = await fs.readFile(filePath, "base64")

    const req: GenerateContentRequest = {

        contents: [
            {
                role: 'user', parts: [
                    TEXT_PROMPT,
                    {
                        inlineData: {
                            data: FILE_TO_UPLOAD,
                            mimeType: fileType
                        }
                    }
                ]
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
    response.educations =response.educations?.map(item=>({...item,id: v4()}))
    response.experiences= response.experiences?.map(item=>({...item,id: v4()}))
    writeToFile(`${name}.json`, JSON.stringify(response))

    const endTime = new Date()
    console.log(`\n\nTask "${name}" Ended: ${(endTime.getTime() - startTime.getTime()) / 1000}seconds`);
}

async function main() {
    await convertDocxFiles()
    const promptPath = path.join(process.cwd(), "/src/prompt.txt")
    const prompt_text = await fs.readFile(promptPath, "utf-8")


    const jobData = path.join(process.cwd(), "/src/jobsData.json")
    const jobList = await fs.readFile(jobData, "utf-8")

    TEXT_PROMPT.text = `${prompt_text} JobsData:${jobList.toString()}`
    const resumesPath = path.join(process.cwd(), "/resumes")
    const filesToParse = listFilesInDirectory(resumesPath)
    const limit = pLimit(4)
    const taskList = filesToParse.map(file => {
        switch (file.extension) {
            case ".pdf":
                return limit(() => generateContent(file.name, file.fullPath, "application/pdf"))

            case ".png":
                return limit(() => generateContent(file.name, file.fullPath, "image/png"))

            case ".jpg":
            case ".jpeg":
                return limit(() => generateContent(file.name, file.fullPath, "image/jpg"))

            case ".txt":
                return limit(() => generateContent(file.name, file.fullPath, "text/plain"))

        }
    })
    await Promise.all(taskList)
}
try {

    main();
} catch (err) {
    console.log(err);
}