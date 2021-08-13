const dropzone = document.querySelector(".drop-zone");

const active = () => dropzone.classList.add("active-border");
const inactive = () => dropzone.classList.remove("active-border");
const prevents = (e) => e.preventDefault();

const eventList = ["dragenter", "dragover", "dragleave", "drop"];
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

const handleDrop = (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  const droppedFileList = [...files];
  if (droppedFileList.length > 20) return alert("too many files bruv");
  console.log(droppedFileList);
  handleFiles(droppedFileList);
};

dropzone.addEventListener("drop", handleDrop);

const handleFiles = (fileArray) => {
  fileArray.forEach((file) => {
    const fileId = Math.random();
    if (file.size > 4 * 1024 * 1024) return alert("file size exceeded");
    createResult(file, fileId);
    uploadFile(file, fileId);
  });
};

const createResult = (file, fileId) => {
  const originalFileSize = getFileSizeString(file.size);

  const fileName = document.createElement("p");
  fileName.className = "file_name";
  fileName.innerHTML = file.name;

  const fileSizeBefore = document.createElement("p");
  fileSizeBefore.className = "file_size_before";
  fileSizeBefore.innerHTML = originalFileSize;

  const divBeforeCompression = document.createElement("div");
  divBeforeCompression.appendChild(fileName);
  divBeforeCompression.appendChild(fileSizeBefore);

  const progressBar = document.createElement("progress");
  progressBar.id = `progress-bar_${fileName}_${fileId}`;
  progressBar.max = 10;
  progressBar.value = 0;

  const fileSizeAfter = document.createElement("p");
  fileSizeAfter.className = "file_size_after";
  fileSizeAfter.innerHTML = "25 KB";

  const downloadLinkWrapper = document.createElement("div");
  downloadLinkWrapper.className = `download_link_wrapper`;

  const compressedPercentage = document.createElement("p");
  compressedPercentage.className = "compressed_percentage";

  const divAfterCompression = document.createElement("div");
  divAfterCompression.appendChild(fileSizeAfter);
  divAfterCompression.appendChild(downloadLinkWrapper);
  divAfterCompression.appendChild(compressedPercentage);

  const listItem = document.createElement("li");
  listItem.appendChild(divBeforeCompression);
  listItem.appendChild(progressBar);
  listItem.appendChild(divAfterCompression);

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
    const fileExtension = fileName.split(".").pop();
    const name = fileName.slice(0, fileName.length - fileExtension.length + 1);
    const body = { base64String, name, fileExtension };
    const url = "./.netlify/functions/compress_files";

    try {
      const fileStream = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        isBase64Encoded: true,
      });

      const imgJson = await fileStream.json();
      if (imgJson.error) return handleFileError(fileName, fileId);
      updateProgressBar(file, fileId, imgJson);
    } catch (err) {
      console.log(err);
    }
  });

  fileReader.readAsDataURL(file);
};

const handleFileError = (fileName, fileId) => {
  const progressBar = document.querySelector(
    `.progress_bar_${fileName}_${fileId}`
  );
  progressBar.value = 10;
  progressBar.classList.add("error");
};

const updateProgressBar = (file, fileId, imgJson) => {
  const progressBar = document.querySelector(
    `.progress_bar_${file.name}_${fileId}`
  );
  const addProgress = setInterval(() => {
    progressBar.value += 1;
    if (progressBar.value === 10) {
      clear(addProgress);
      progressBar.classList.add("finished");
      populateDivAfterCompression(file, fileId, imgJson);
    }
  }, 50);
};

const populateDivAfterCompression = (file, fileId, imgJson) => {
  const comrpessedFileSize = getFileSizeString(imgJson.size);
  const compressedPercentage = getCompressedPercentage(
    file.size,
    comrpessedFileSize
  );

  const fileSizeAfter = document.querySelector(".file_size_after");
  fileSizeAfter.textContent = comrpessedFileSize;

  const downloadLinkWrapper = document.querySelector(".download_link_wrapper");
  const downloadLink = generateDownloadLink(imgJson);
  downloadLinkWrapper.appendChild(downloadLink);

  const percentageDisplay = document.querySelector(".compressed_percentage");
  percentageDisplay.textContent = `-${compressedPercentage}%`;
};

const getCompressedPercentage = (originalSize, compressedSize) => {
  const orgSz = parseFloat(originalSize);
  const newSz = parseFloat(compressedSize);
  const percentSaved = Math.round((orgSz / newSz) * 100);
  return percentSaved;
};

const generateDownloadLink = (imgJson) => {
  const extension = imgJson.filename.split(".").pop();
  const link = docume.createElement("a");
  link.href = `data:image/${extension};base64,${imgJson.base64CompString}`;
  link.download = imgJson.filename;
  link.textContent = "download";
  return link;
};
