import path from "path";
import fs from "fs";


export const writeToFile = (fileName:string,data:string,outputPath:string = "/generated-result") => new Promise((resolve,reject)=>{
    try {
        const pathToWrite = path.join(process.cwd(),outputPath, fileName)
        const writer = fs.createWriteStream(pathToWrite,"utf-8")
        writer.write(data);
        writer.close()
        resolve(pathToWrite)
    } catch (err) {
        console.log(err);
        reject(`Generating file failed ${fileName}`);
    }
})