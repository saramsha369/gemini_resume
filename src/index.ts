import pLimit from "p-limit";
import { listFilesInDirectory } from "./filesToArray";
import { generativeModel } from "./modelConfig";
import { writeToFile } from "./writeFile";
import { promises as fs } from "fs";
import { GenerateContentRequest, Part } from "@google-cloud/vertexai";
import path from "path";
import {
  arrayBufferToBase64File,
  convertHeicToJpeg,
  getMimeTypeFromUrl,
  readFileAsArrayBuffer,
  wordFilesToText,
} from "./converter";
import { ResponseRequired } from "./@types";
import { v4 } from "uuid";
import { resumeList } from "./resumeList";

const TEXT_PROMPT = { text: "" };

async function generateContent(name: string, data: string, fileType: string) {
  try {
    const parts: Part[] = [
      TEXT_PROMPT,
      {
        inlineData: {
          data,
          mimeType: fileType,
        },
      },
    ];

    const req: GenerateContentRequest = {
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const modelResponse = await generativeModel.generateContent(req);

    if (!modelResponse.response) return;
    if (!modelResponse.response.candidates) return;
    const response = JSON.parse(
      modelResponse.response.candidates[0].content.parts[0].text!
    ) as ResponseRequired;
    response.educations = response.educations?.map((item) => ({
      ...item,
      id: v4(),
    }));
    response.experiences = response.experiences?.map((item) => ({
      ...item,
      id: v4(),
    }));

    writeToFile(`${name}.json`, JSON.stringify(response));
  } catch (err: any) {
    console.log(`Error generating data: ${name}`);
    throw err;
  }
}
async function main() {
  const promptPath = path.join(process.cwd(), "/src/prompt.txt");
  const prompt_text = await fs.readFile(promptPath, "utf-8");

  const jobData = path.join(process.cwd(), "/src/jobsData.json");
  const jobList = await fs.readFile(jobData, "utf-8");

  TEXT_PROMPT.text = `${prompt_text} JobsData:${jobList.toString()}`;

  const limit = pLimit(4);
  const taskList = resumeList.map(async (url) => {
    const { contentType, data } = await getMimeTypeFromUrl(url);
    console.log({ contentType });
    const fileName = new Date().toISOString()
    switch (contentType) {
      case "application/pdf": {
        const base64String = arrayBufferToBase64File(data, "application/pdf");
        return limit(() =>
          generateContent(fileName, base64String, "application/pdf")
        );
      }

      case "image/png": {
        const base64String = arrayBufferToBase64File(data, "image/png");
        return limit(() => generateContent(fileName, base64String, "image/png"));
      }

      case "image/jpeg":
      case "image/jpg": {
        const base64String = arrayBufferToBase64File(data, "image/jpg");
        return limit(() => generateContent(fileName, base64String, "image/jpg"));
      }

      case "image/hiec": {
        const fileBuffer = await readFileAsArrayBuffer(data);
        const resultBuffer = await convertHeicToJpeg(fileBuffer);
        const base64String = arrayBufferToBase64File(resultBuffer, "image/jpg");
        return limit(() => generateContent(fileName, base64String, "image/jpg"));
      }

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const fileBuffer = await readFileAsArrayBuffer(data);
        const resultBuffer = await wordFilesToText(fileBuffer);
        const base64String = arrayBufferToBase64File(
          resultBuffer,
          "text/plain"
        );

        return limit(() => generateContent(url, base64String, "text/plain"));
      }
    }
  });
  const result = await Promise.allSettled(taskList);
  await writeToFile("error.json", JSON.stringify(result), "/src");
  console.log("Complete Result");
}
try {
  main();
} catch (err) {
  console.log("error occurred");
}
