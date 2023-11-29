<!-- UploadedFiles.vue -->
<template>
    <div>
      <h2>Uploaded Files</h2>
      <ul>
        <li v-for="(file, index) in uploadedFiles" :key="index">
          <a :href="file.link" target="_blank">{{ file.name }}</a>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import AWS from 'aws-sdk';
  
  export default {
    data() {
      return {
        uploadedFiles: [], // Add state to store the uploaded files information
      };
    },
    created() {
      // Fetch the uploaded files when the component is created
      this.fetchUploadedFiles();
    },
    methods: {
      async fetchUploadedFiles() {
        // AWS S3 configuration
        const s3 = new AWS.S3({
          accessKeyId: 'AKIATMXZV3KVRT6IDEWB',
          secretAccessKey: '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',
          region: 'us-east-2',
        });
  
        // S3 bucket name
        const bucketName = 'drag-drop-file-uploads';
  
        // Fetch the list of objects in the bucket
        const params = {
          Bucket: bucketName,
        };
  
        try {
          const data = await s3.listObjectsV2(params).promise();
  
          // Extract the relevant information from the response
          this.uploadedFiles = data.Contents.map((object) => ({
            name: object.Key,
            link: `https://${bucketName}.s3.amazonaws.com/${object.Key}`,
          }));
        } catch (error) {
          console.error('Error fetching uploaded files from S3', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
    /* Add styling as needed */
  </style>
  