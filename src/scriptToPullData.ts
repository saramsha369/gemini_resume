import admin from "firebase-admin";
import fs from "fs"
import { getFirestore, QuerySnapshot, Query } from "firebase-admin/firestore";
import serviceAccount from "./credentials/qa-a-2cf51-firebase-adminsdk-74pln-6558a95e19.json";

// Initialize Firebase Admin SDK (replace with your credentials)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as unknown as any)
});

const db = getFirestore();

// async function getAllDocumentsPaginated(collectionName: string): Promise<any[]> {
//   const allDocuments: any[] = [];
//   let lastSnapshot: QuerySnapshot | null = null;

//   while (true) {
//     let query: Query = db.collection(collectionName);
//     if (lastSnapshot) {
//       query = query.startAfter(lastSnapshot.docs[lastSnapshot.docs.length - 1]);
//     }

//     const snapshot = await query.limit(1000).get(); // Adjust limit as needed

//     if (snapshot.empty) {
//       break;
//     }

//     snapshot.forEach((doc) => {
//       allDocuments.push({ id: doc.id, ...doc.data() });
//     });
//     lastSnapshot = snapshot;
//   }

//   return allDocuments;
// }
async function getAllDocumentsPaginated(collectionName: string): Promise<any[]> {
  const allDocuments: any[] = [];
  let lastSnapshot: QuerySnapshot | null = null;

  while (true) {
    let query: Query = db.collection(collectionName);
    if (lastSnapshot) {
      query = query.startAfter(lastSnapshot.docs[lastSnapshot.docs.length - 1]);
    }

    const snapshot = await query.limit(1000).get(); // Adjust limit as needed

    if (snapshot.empty) {
      break;
    }

    snapshot.forEach((doc) => {
      // Select only the desired fields
      const selectedData = {
        id: doc.id,
        industry: doc.data().industry,
        jobTitle: doc.data().jobTitle,
        occupation: doc.data().occupation,
      };

      //Handle potential missing fields (optional but recommended)
      for (const key in selectedData) {
        // @ts-ignore
          if (selectedData[key] === undefined) selectedData[key] = null; 
      }

      allDocuments.push(selectedData);
    });
    lastSnapshot = snapshot;
  }

  return allDocuments;
}
  getAllDocumentsPaginated("jobs")
  .then((documents) => {
    const jsonFile = fs.createWriteStream("./src/jobsData.json","utf-8")
    console.log(documents);
    jsonFile.write(JSON.stringify(documents))
    jsonFile.close()    
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });


  /*
  getAllDocumentsPaginated("occupations")
  .then((documents) => {
    const jsonFile = fs.createWriteStream("./src/occupationsData.json","utf-8")
    console.log(documents);
    jsonFile.write(JSON.stringify(documents))
    jsonFile.close()    
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

  getAllDocumentsPaginated("industries")
  .then((documents) => {
    const jsonFile = fs.createWriteStream("./src/industriesData.json","utf-8")
    console.log(documents);
    jsonFile.write(JSON.stringify(documents))
    jsonFile.close()    
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
  */