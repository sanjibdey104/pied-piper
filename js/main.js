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

const droppedFileList = [];

const handleDrop = (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  droppedFileList.push(files);
  console.log(droppedFileList);
};

dropzone.addEventListener("drop", handleDrop);
