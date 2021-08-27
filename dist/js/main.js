const dropzone = document.querySelector(".drop-zone");

const active = () => dropzone.classList.add("active-border");
const inactive = () => dropzone.classList.remove("active-border");
const prevents = (e) => e.preventDefault();

const eventList = ["dragover", "drop"];
eventList.forEach((eventName) =>
  dropzone.addEventListener(eventName, prevents)
);

const incomingEvents = ["dragenter", "dragover"];
incomingEvents.forEach((eventName) =>
  dropzone.addEventListener(eventName, active)
);

const outgoingEvents = ["dragleave", "drop"];
outgoingEvents.forEach((eventName) =>
  dropzone.addEventListener(eventName, inactive)
);

let zipFlagArr = [];
let fileListLen;
const setFileListLen = (len) => {
  fileListLen = len;
};

const generateZippedDownloadLink = () => {
  const downloadAllLink = document.createElement("button");
  downloadAllLink.className = "download-all-button";
  downloadAllLink.textContent = "download all";
  downloadAllLink.addEventListener("click", zipAndDownload);
  document.querySelector(".results").appendChild(downloadAllLink);
};

const handleDrop = (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  const droppedFileList = [...files];

  const filteredFileList = droppedFileList.filter((file) =>
    file.type.includes("image")
  );
  console.log(filteredFileList);

  if (droppedFileList.length > 20) return alert("too many files bruv");
  handleFiles(droppedFileList);
  setFileListLen(filteredFileList.length);
};

dropzone.addEventListener("drop", handleDrop);

const handleFiles = (fileArray) => {
  fileArray.forEach((file) => {
    const fileId = Math.round(Math.random() * 10000);
    if (file.size > 4 * 1024 * 1024) return alert("file size exceeded");
    file.type.includes("image")
      ? (file.extensionFlag = true)
      : (file.extensionFlag = false);
    createResult(file, fileId);
    uploadFile(file, fileId);
  });
};

const createResult = (file, fileId) => {
  const originalFileSizeString = getFileSizeString(file.size);

  const fileName = document.createElement("p");
  fileName.className = "file_name";
  fileName.textContent = file.name;

  const fileSizeBefore = document.createElement("p");
  fileSizeBefore.className = "file_size_before";
  fileSizeBefore.textContent = originalFileSizeString;

  const divBeforeCompression = document.createElement("div");
  divBeforeCompression.appendChild(fileName);
  divBeforeCompression.appendChild(fileSizeBefore);

  const progressBar = document.createElement("progress");
  progressBar.id = `progress-bar_${file.name}_${fileId}`;
  progressBar.className = "progress-bar";
  progressBar.max = 10;
  progressBar.value = 0;

  const fileSizeAfter = document.createElement("p");
  fileSizeAfter.id = `file_size_after_${file.name}_${fileId}`;
  fileSizeAfter.className = "file_size_after";

  const downloadLinkWrapper = document.createElement("div");
  downloadLinkWrapper.id = `download_link_wrapper_${file.name}_${fileId}`;
  downloadLinkWrapper.className = "download_link_wrapper";

  const compressedPercentage = document.createElement("p");
  compressedPercentage.id = `compressed_percentage_${file.name}_${fileId}`;
  compressedPercentage.className = "compressed_percentage";

  const divAfterCompression = document.createElement("div");
  divAfterCompression.appendChild(fileSizeAfter);
  divAfterCompression.appendChild(downloadLinkWrapper);
  divAfterCompression.appendChild(compressedPercentage);

  const listItem = document.createElement("li");
  listItem.appendChild(divBeforeCompression);
  listItem.appendChild(progressBar);
  if (file.extensionFlag) {
    listItem.appendChild(divAfterCompression);
  }

  const resultListItem = document.querySelector(".result-list");
  resultListItem.appendChild(listItem);
};

const getFileSizeString = (fileSize) => {
  const sizeInKB = parseFloat(fileSize) / 1024;
  const sizeInMB = sizeInKB / 1024;
  return sizeInKB > 1024
    ? `${sizeInMB.toFixed(1)} MB`
    : `${sizeInKB.toFixed(1)} KB`;
};

const uploadFile = (file, fileId) => {
  const fileReader = new FileReader();
  fileReader.addEventListener("loadend", async (e) => {
    const fileName = file.name;
    const base64String = e.target.result;
    const extension = fileName.split(".").pop();
    const name = fileName.slice(0, fileName.length - (extension.length + 1));
    const body = { base64String, name, extension };
    const url = "./.netlify/functions/compress_files";

    try {
      const fileStream = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const imgJson = await fileStream.json();
      if (imgJson.error) return handleFileError(fileName, fileId);
      if (!file.extensionFlag) return handleExtensionError(fileName, fileId);
      updateProgressBar(file, fileId, imgJson);
    } catch (err) {
      console.log(err);
    }
  });

  fileReader.readAsDataURL(file);
};

const handleFileError = (fileName, fileId) => {
  const progressBar = document.getElementById(
    `progress-bar_${fileName}_${fileId}`
  );
  progressBar.value = 10;
  progressBar.classList.add("error");
};

const handleExtensionError = (fileName, fileId) => {
  const progressBar = document.getElementById(
    `progress-bar_${fileName}_${fileId}`
  );
  progressBar.value = 10;
  progressBar.classList.add("extension_error");
};

const updateProgressBar = (file, fileId, imgJson) => {
  const progressBar = document.getElementById(
    `progress-bar_${file.name}_${fileId}`
  );
  const addProgress = setInterval(() => {
    progressBar.value += 1;
    if (progressBar.value === 10) {
      clearInterval(addProgress);
      progressBar.classList.add("finished");
      if (file.extensionFlag) {
        populateDivAfterCompression(file, fileId, imgJson);
        zipFlagArr.push(true);
      }
      //render zipped download link only after processing all files
      if (zipFlagArr.length === fileListLen) {
        generateZippedDownloadLink();
      }
    } else {
      progressBar.classList.add("uploading");
    }
  }, 50);
};

const populateDivAfterCompression = (file, fileId, imgJson) => {
  const comrpessedFileSizeString = getFileSizeString(imgJson.fileSize);
  const compressedPercentage = getCompressedPercentage(
    file.size,
    imgJson.fileSize
  );

  const fileSizeAfter = document.getElementById(
    `file_size_after_${file.name}_${fileId}`
  );
  fileSizeAfter.textContent = comrpessedFileSizeString;

  const downloadLinkWrapper = document.getElementById(
    `download_link_wrapper_${file.name}_${fileId}`
  );
  const downloadLink = generateDownloadLink(imgJson, fileId);
  downloadLinkWrapper.appendChild(downloadLink);

  const percentageDisplay = document.getElementById(
    `compressed_percentage_${file.name}_${fileId}`
  );
  percentageDisplay.textContent = `-${Math.round(compressedPercentage)}%`;
};

const getCompressedPercentage = (originalSize, compressedSize) => {
  const orgSz = parseFloat(originalSize);
  const newSz = parseFloat(compressedSize);
  const percentSaved = ((orgSz - newSz) / orgSz) * 100;
  return percentSaved;
};

let downloadFileObj = {};
let compressedFilesArr = [];

const generateDownloadLink = (imgJson, fileId) => {
  const extension = imgJson.filename.split(".").pop();
  const link = document.createElement("a");
  link.href = `data:image/${extension};base64,${imgJson.base64CompString}`;
  link.download = imgJson.filename;
  link.textContent = "download";
  compressedFilesArr.push({
    id: fileId,
    filename: link.download,
    url: link.href,
  });
  return link;
};

let zip = new JSZip();
let count = 0;

const zipAndDownload = () => {
  compressedFilesArr.forEach(function (file) {
    JSZipUtils.getBinaryContent(file.url, function (err, data) {
      if (err) {
        console.log(err);
      }
      zip.file(file.id + "_" + file.filename, data, { binary: true });
      count++;
      if (count === compressedFilesArr.length) {
        zip.generateAsync({ type: "blob" }).then(function (content) {
          saveAs(content, new Date() + "zip");
        });
      }
    });
  });
};
