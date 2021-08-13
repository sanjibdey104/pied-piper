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
    // uploadFile(file, fileId);
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

  const fileSizeAfter = document.createElement("p");
  fileSizeAfter.className = "file_size_after";
  fileSizeAfter.innerHTML = "25 KB";

  const progressBar = document.createElement("progress");
  progressBar.id = `${fileName}_progress-bar`;
  progressBar.max = 10;
  progressBar.value = 0;

  const downloadLinkWrapper = document.createElement("div");
  downloadLinkWrapper.className = "file_download_wrapper";
  downloadLinkWrapper.innerHTML = `<a href="#">download</a>`;

  const compressedPercentage = document.createElement("p");
  compressedPercentage.className = "compressed_percentage";
  compressedPercentage.innerHTML = "-67%";

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
