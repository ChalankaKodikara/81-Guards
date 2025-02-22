const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(fileBuffer, fileName, folderPath) {
  const key = `${folderPath}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: "application/pdf", // Adjust if necessary
  });

  await s3Client.send(command);
  return key; // Return the S3 key for saving in the database
}

module.exports = { s3Client, uploadFileToS3 };
