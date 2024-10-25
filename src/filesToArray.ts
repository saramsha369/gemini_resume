import * as fs from "fs"
import path from "path"

export type FileItem = {
    name: string;
    extension: string;
    fullPath: string;
};

export const listFilesInDirectory = (directoryPath: string): FileItem[] => {
    const files: FileItem[] = [];

    const fileNames = fs.readdirSync(directoryPath);

    fileNames.forEach((fileName) => {
        const fullPath = path.join(directoryPath, fileName);
        if (fs.lstatSync(fullPath).isFile() && path.extname(fileName)) {

            const extension = path.extname(fileName);
            const name = path.basename(fileName, extension);

            files.push({
                name,
                extension,
                fullPath
            });
        }
    });

    return files;
};

