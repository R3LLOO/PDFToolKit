const backButton =
    document.getElementById("backButton");

const chooseFilesButton =
    document.getElementById("chooseFilesButton");

const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const filesSection =
    document.getElementById("filesSection");

const actionSection =
    document.getElementById("actionSection");

const fileList =
    document.getElementById("fileList");

const fileCount =
    document.getElementById("fileCount");

const clearButton =
    document.getElementById("clearButton");

const continueButton =
    document.getElementById("continueButton");


let selectedFiles = [];


/*
    =========================
    BACK BUTTON
    =========================
*/

backButton.addEventListener(
    "click",
    () => {

        window.history.back();

    }
);


/*
    =========================
    CHOOSE FILES
    =========================
*/

chooseFilesButton.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);


/*
    =========================
    FILE INPUT
    =========================
*/

fileInput.addEventListener(
    "change",
    (event) => {

        const files =
            Array.from(event.target.files);

        addFiles(files);

        fileInput.value = "";

    }
);


/*
    =========================
    DRAG & DROP
    =========================
*/

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );

        const files =
            Array.from(
                event.dataTransfer.files
            );

        addFiles(files);

    }
);


/*
    =========================
    ADD FILES
    =========================
*/

function addFiles(files) {

    const pdfFiles =
        files.filter(
            file => isPdf(file)
        );


    selectedFiles.push(
        ...pdfFiles
    );


    removeDuplicateFiles();

    renderFiles();

}


/*
    =========================
    PDF VALIDATION
    =========================
*/

function isPdf(file) {

    return (
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf")
    );

}


/*
    =========================
    REMOVE DUPLICATES
    =========================
*/

function removeDuplicateFiles() {

    const uniqueFiles = [];

    const seen = new Set();


    for (const file of selectedFiles) {

        const identifier =
            `${file.name}-${file.size}-${file.lastModified}`;


        if (!seen.has(identifier)) {

            seen.add(identifier);

            uniqueFiles.push(file);

        }

    }


    selectedFiles =
        uniqueFiles;

}


/*
    =========================
    RENDER FILES
    =========================
*/

function renderFiles() {

    fileList.innerHTML = "";


    selectedFiles.forEach(
        (file, index) => {

            const fileElement =
                createFileElement(
                    file,
                    index
                );


            fileList.appendChild(
                fileElement
            );

        }
    );


    updateInterface();

}


/*
    =========================
    CREATE FILE ELEMENT
    =========================
*/

function createFileElement(
    file,
    index
) {

    const container =
        document.createElement("div");

    container.className =
        "file-item";


    const icon =
        document.createElement("div");

    icon.className =
        "file-icon";

    icon.textContent =
        "📄";


    const details =
        document.createElement("div");

    details.className =
        "file-details";


    const name =
        document.createElement("div");

    name.className =
        "file-name";

    name.textContent =
        file.name;


    const size =
        document.createElement("div");

    size.className =
        "file-size";

    size.textContent =
        formatFileSize(
            file.size
        );


    details.appendChild(name);

    details.appendChild(size);


    const removeButton =
        document.createElement("button");

    removeButton.className =
        "remove-button";

    removeButton.type =
        "button";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        () => {

            removeFile(index);

        }
    );


    container.appendChild(icon);

    container.appendChild(details);

    container.appendChild(
        removeButton
    );


    return container;

}


/*
    =========================
    REMOVE FILE
    =========================
*/

function removeFile(index) {

    selectedFiles.splice(
        index,
        1
    );


    renderFiles();

}


/*
    =========================
    CLEAR ALL
    =========================
*/

clearButton.addEventListener(
    "click",
    () => {

        selectedFiles = [];

        renderFiles();

    }
);


/*
    =========================
    UPDATE INTERFACE
    =========================
*/

function updateInterface() {

    const count =
        selectedFiles.length;


    if (count === 0) {

        filesSection.classList.add(
            "hidden"
        );

        actionSection.classList.add(
            "hidden"
        );

        continueButton.disabled =
            true;

        return;

    }


    filesSection.classList.remove(
        "hidden"
    );


    actionSection.classList.remove(
        "hidden"
    );


    continueButton.disabled =
        count < 2;


    fileCount.textContent =
        `${count} ${
            count === 1
                ? "file"
                : "files"
        } selected`;

}


/*
    =========================
    FILE SIZE
    =========================
*/

function formatFileSize(bytes) {

    if (bytes === 0) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(
            1024,
            index
        );


    return (
        `${size.toFixed(2)} ${units[index]}`
    );

}


/*
    =========================
    MERGE PDFs
    =========================
*/

async function mergePdfs() {

    if (selectedFiles.length < 2) {

        alert(
            "Please select at least two PDF files."
        );

        return;

    }


    try {

        /*
            Disable button while
            the PDFs are being processed.
        */

        continueButton.disabled =
            true;

        continueButton.textContent =
            "Merging PDFs...";


        /*
            Create a new empty PDF.
        */

        const mergedPdf =
            await PDFLib.PDFDocument.create();


        /*
            Process each selected PDF
            in the order selected.
        */

        for (
            const file of selectedFiles
        ) {

            /*
                Read the file
                into memory.
            */

            const fileBytes =
                await file.arrayBuffer();


            /*
                Load the existing PDF.
            */

            const pdf =
                await PDFLib.PDFDocument.load(
                    fileBytes
                );


            /*
                Get all pages from
                the current PDF.
            */

            const pageIndices =
                pdf.getPageIndices();


            /*
                Copy those pages into
                our new PDF.
            */

            const copiedPages =
                await mergedPdf.copyPages(
                    pdf,
                    pageIndices
                );


            /*
                Add every copied page
                to the merged document.
            */

            for (
                const page of copiedPages
            ) {

                mergedPdf.addPage(page);

            }

        }


        /*
            Convert the merged PDF
            into bytes.
        */

        const mergedPdfBytes =
            await mergedPdf.save();


        /*
            Create a Blob from
            the generated PDF.
        */

        const blob =
            new Blob(
                [mergedPdfBytes],
                {
                    type: "application/pdf"
                }
            );


        /*
            Create a temporary
            browser URL.
        */

        const downloadUrl =
            URL.createObjectURL(blob);


        /*
            Create a temporary
            download link.
        */

        const downloadLink =
            document.createElement("a");


        downloadLink.href =
            downloadUrl;

        downloadLink.download =
            "merged.pdf";


        /*
            Trigger the download.
        */

        document.body.appendChild(
            downloadLink
        );

        downloadLink.click();


        /*
            Remove the temporary
            download element.
        */

        downloadLink.remove();


        /*
            Clean up the temporary URL.
        */

        URL.revokeObjectURL(
            downloadUrl
        );


        /*
            Restore button.
        */

        continueButton.disabled =
            false;

        continueButton.textContent =
            "Merge PDFs";


        alert(
            "Your PDFs have been merged successfully."
        );

    }
    catch (error) {

        console.error(
            "PDF merge error:",
            error
        );


        continueButton.disabled =
            false;

        continueButton.textContent =
            "Merge PDFs";


        alert(
            "The PDFs could not be merged. Please make sure the files are valid PDF documents."
        );

    }

}


/*
    =========================
    CONTINUE BUTTON
    =========================
*/

continueButton.addEventListener(
    "click",
    () => {

        mergePdfs();

    }
);