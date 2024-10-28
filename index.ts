import { fileURLToPath } from 'url';
import { convertHeicToJpeg, urlToBuffer } from './src/converter';


// Example usage


async function getMimeTypeFromUrl(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD' }); // HEAD request is faster, only gets headers

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    return contentType || null; // Return null if content-type header is missing
  } catch (error) {
    console.error('Error fetching URL:', error);
    return null;
  }
}

// Example usage:

const fileList = [
  "https://firebasestorage.googleapis.com/v0/b/qa-a-2cf51.appspot.com/o/resumes%2Fseekers%2Fl89U4FDx3PdgPwMKwPe3W8owHbh1%2F1726054900197-sample.pdf?alt=media&token=99fa90a2-433f-4870-9d63-6b8f80a54a49",
  "https://firebasestorage.googleapis.com/v0/b/qa-a-2cf51.appspot.com/o/resumes%2Fseekers%2Fl89U4FDx3PdgPwMKwPe3W8owHbh1%2F1726053741137-sample3.heic?alt=media&token=b5629ba9-5b5a-429a-aecc-f21952e0a5d2",
  "https://www.lakemills.k12.wi.us/cms_files/resources/Downloading%20Documents.doc?__cf_chl_tk=8N9Wf57WsrIZlLlFoRw6f7hEfVBRufYPqB.OY1ODxrM-1729857210-1.0.1.1-1V8LDkMHHm.8zwtxqW98d0.KxKmq58zwDl.Uxzay.CE",
  "https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx"
]

async function main() {
  try {
    // const result = await Promise.all([
    //     getMimeTypeFromUrl(),
    //     getMimeTypeFromUrl(),
    //     getMimeTypeFromUrl(),
    //     getMimeTypeFromUrl(),

    // ])
    const file  = await urlToBuffer(fileList[1]);
    const result = await convertHeicToJpeg(file)
    console.log(result);
  } catch (err) {
    console.log(err);
  }
}
main()
