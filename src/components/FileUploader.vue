<template>
  <div class="file-upload-container">
    <div>
      <h2>Drag n Drop Files Uploader</h2>
    </div>

    <div
      class="drop-area"
      @click="openFileInput"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <p>{{ uploadText }}</p>
    </div>

    <!-- File input element for clicking and selecting files -->
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileInput"
      multiple
      accept="image/*"
    />

    <div v-if="files.length > 0" class="file-list">
      <div v-for="file in files" :key="file.name" class="file-item">
        {{ file.name }} - {{ formatSize(file.size) }}
      </div>
    </div>

    <div v-if="uploading" class="progress-bar">
      <div :style="{ width: progress + '%' }">
        <span>{{ Math.round(progress) }}%</span>
      </div>
    </div>

    <div v-if="message" class="upload-message">
      {{ message }}
    </div>

    <div class="show-upload-button">
      <router-link
        class="router-link"
        v-if="!uploading && message"
        to="/uploaded-files"
      >
        <button class="show-files-button" v-if="!uploading && message">
          Show Uploaded Files
        </button>
      </router-link>

      <button
        class="upload-button"
        @click="upload"
        :disabled="uploading || files.length === 0"
      >
        Upload
      </button>
    </div>
  </div>
</template>

<script>
import AWS from "aws-sdk";

export default {
  data() {
    return {
      files: [],
      uploading: false,
      progress: 0,
      isDragging: false,
      message: "",
      uploadText: "Drag and drop files here or click to select files",
    };
  },
  methods: {
    openFileInput() {
      // Triggering a click event on the hidden file input
      this.$refs.fileInput.click();
    },
    handleDragOver() {
      // Preventing default behavior to enable dropping
      this.isDragging = true;
      this.uploadText = "Upload More Files";
    },
    handleDragEnter() {
      // Highlighting drop area when a file is dragged over it
      this.isDragging = true;
      this.uploadText = "Upload More Files";
    },
    handleDragLeave() {
      // Remove highlighting when a file is dragged out of the drop area
      this.isDragging = false;
      this.uploadText = "Drag and drop files here or click to select files";
    },
    handleDrop(event) {
      this.isDragging = false;
      this.files = Array.from(event.dataTransfer.files);
      this.uploadText = "Upload More Files";
    },
    handleFileInput() {
      // Handling file selection using the file input element
      const newFiles = Array.from(this.$refs.fileInput.files);
      this.files = [...this.files, ...newFiles];
      this.uploadText = "Upload More Files";
    },
    formatSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "0 Byte";
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    },
    upload() {
      this.uploading = true;

      const s3 = new AWS.S3({
        accessKeyId: "AKIATMXZV3KVRT6IDEWB",
        secretAccessKey: "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",
        region: "us-east-2",
      });

      const totalFiles = this.files.length;
      let completedFiles = 0;

      const promises = this.files.map((file) => {
        const uploadParams = {
          Bucket: "drag-drop-file-uploads",
          Key: file.name,
          Body: file,
        };

        return s3
          .upload(uploadParams)
          .on("httpUploadProgress", (progress) => {
            const { loaded, total } = progress;
            const fileProgress = (loaded / total) * 100;

            // Update the overall progress based on the number of completed files
            this.progress = (completedFiles * 100 + fileProgress) / totalFiles;
          })
          .promise()
          .then(() => {
            completedFiles++;
            // Setting the ACL of the uploaded file to 'public-read'
            const aclParams = {
              Bucket: "drag-drop-file-uploads",
              Key: file.name,
              ACL: "public-read",
            };

            return s3.putObjectAcl(aclParams).promise();
          });
      });

      Promise.all(promises)
        .then(() => {
          // Upload completed successfully
          this.uploading = false;
          this.files = [];
          this.progress = 0;
          this.message = "File(s) uploaded successfully!";
        })
        .catch((error) => {
          // Handle errors
          console.error("Error uploading files to S3", error);
          this.uploading = false;
          this.progress = 0;
          this.message = "Error uploading files. Please try again.";
        });
    },
  },
};
</script>

<style scoped>
.file-upload-container {
  max-width: 400px;
  margin: auto;
}

.show-upload-button {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.router-link {
  display: flex;
  width: auto;
  flex-direction: column;
  text-decoration: none;
}

.upload-button {
  padding: 10px 25px;
  background-color: lightcoral;
  color: white;
  border: white;
  border-radius: 10px;
  cursor: pointer;
}

.show-files-button {
  padding: 10px 25px;
  background-color: lightseagreen;
  color: white;
  border: white;
  border-radius: 10px;
  cursor: pointer;
}

.progress-value {
  margin-left: 10px;
  font-weight: bold;
  align-self: center;
  color: white;
}

.drop-area {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: #f8f8f8;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.drop-area.dragging {
  background-color: #e0e0e0;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  margin-bottom: 5px;
}

.progress-bar {
  margin-top: 10px;
  margin-bottom: 10px;
  height: 20px;
  background-color: #f0f0f0;
  overflow: hidden;
  position: relative;
}

.progress-bar div {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar span {
  position: absolute;
  top: 0;
  right: 15%;
  left: 50%;
  transform: translateX(-50%);
  color: #000;
  font-weight: bold;
}

.upload-message {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  color: #333;
  border-radius: 8px;
}
</style>
