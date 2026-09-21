import {
    getDocument,
    GlobalWorkerOptions
} from "../../build/pdf.mjs";


/*
    =========================
    PDF.JS WORKER
    =========================
*/

GlobalWorkerOptions.workerSrc =
    chrome.runtime.getURL(
        "build/pdf.worker.mjs"
    );


/*
    =========================
    ELEMENTS
    =========================
*/

const backButton =
    document.getElementById(
        "backButton"
    );

const dropZone =
    document.getElementById(
        "dropZone"
    );

const fileInput =
    document.getElementById(
        "fileInput"
    );

const pdfSection =
    document.getElementById(
        "pdfSection"
    );

const fileName =
    document.getElementById(
        "fileName"
    );

const fileSize =
    document.getElementById(
        "fileSize"
    );

const changeFileButton =
    document.getElementById(
        "changeFileButton"
    );

const originalSize =
    document.getElementById(
        "originalSize"
    );

const pageCount =
    document.getElementById(
        "pageCount"
    );

const compressionSection =
    document.getElementById(
        "compressionSection"
    );

const compressButton =
    document.getElementById(
        "compressButton"
    );

const statusBox =
    document.getElementById(
        "statusBox"
    );

const resultOriginal =
    document.getElementById(
        "resultOriginal"
    );

const resultCompressed =
    document.getElementById(
        "resultCompressed"
    );

const resultReduction =
    document.getElementById(
        "resultReduction"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const compressionOptions =
    document.querySelectorAll(
        ".compression-option"
    );


/*
    =========================
    COMPRESSION LEVELS

    Each page is rendered to an
    image and placed into a new
    PDF.

    scale   - how many pixels we
              render per PDF point.
              Lower means fewer
              pixels, so a smaller
              file.

    quality - JPEG quality for the
              rendered page.
    =========================
*/

const LEVELS = {

    low: {
        scale: 1.5,
        quality: 0.85
    },

    medium: {
        scale: 1.1,
        quality: 0.7
    },

    high: {
        scale: 0.8,
        quality: 0.5
    }

};


/*
    =========================
    STATE
    =========================
*/

let selectedFile = null;

let loadedPdf = null;

let selectedLevel = "medium";


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
    FILE INPUT
    =========================
*/

fileInput.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        await loadPdf(file);

        fileInput.value = "";

    }
);


/*
    =========================
    CHANGE FILE
    =========================
*/

changeFileButton.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);


/*
    =========================
    DRAG OVER
    =========================
*/

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


/*
    =========================
    DRAG LEAVE
    =========================
*/

dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


/*
    =========================
    DROP
    =========================
*/

dropZone.addEventListener(
    "drop",
    async (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

        const file =
            event.dataTransfer.files[0];

        if (!file) {
            return;
        }

        await loadPdf(file);

    }
);


/*
    =========================
    LOAD PDF
    =========================
*/

async function loadPdf(file) {

    clearStatus();

    statusBox.classList.add(
        "hidden"
    );


    if (!isPdf(file)) {

        showError(
            "Please select a PDF file."
        );

        return;

    }


    try {

        showStatus(
            "Loading PDF..."
        );


        selectedFile = file;


        const arrayBuffer =
            await file.arrayBuffer();


        /*
            pdf.js takes ownership of
            the buffer it is given, so
            hand it a copy and keep the
            original for later.
        */

        loadedPdf =
            await getDocument({
                data: arrayBuffer.slice(0)
            }).promise;


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatBytes(file.size);


        originalSize.textContent =
            formatBytes(file.size);


        pageCount.textContent =
            loadedPdf.numPages;


        pdfSection.classList.remove(
            "hidden"
        );


        compressionSection.classList.remove(
            "hidden"
        );


        compressButton.disabled = false;


        clearStatus();


    }
    catch (error) {

        console.error(error);


        selectedFile = null;

        loadedPdf = null;


        pdfSection.classList.add(
            "hidden"
        );


        compressionSection.classList.add(
            "hidden"
        );


        compressButton.disabled = true;


        showError(
            "This PDF could not be opened. It may be damaged or password protected."
        );

    }

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
    COMPRESSION OPTIONS
    =========================
*/

compressionOptions.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                compressionOptions.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedLevel =
                    button.dataset.level;

            }
        );

    }
);


/*
    =========================
    COMPRESS BUTTON
    =========================
*/

compressButton.addEventListener(
    "click",
    async () => {

        await compressPdf();

    }
);


/*
    =========================
    COMPRESS

    Every page is rendered to a
    JPEG and written into a fresh
    PDF at the original page size.

    Text stops being selectable,
    which is the trade-off for a
    genuinely smaller file.
    =========================
*/

async function compressPdf() {

    if (!loadedPdf || !selectedFile) {

        showError(
            "Please select a PDF first."
        );

        return;

    }


    const level =
        LEVELS[selectedLevel] ||
        LEVELS.medium;


    compressButton.disabled = true;

    compressButton.textContent =
        "Compressing...";


    statusBox.classList.add(
        "hidden"
    );


    try {

        const newPdf =
            await PDFLib.PDFDocument.create();


        for (
            let pageNumber = 1;
            pageNumber <= loadedPdf.numPages;
            pageNumber++
        ) {

            showStatus(
                `Compressing page ${pageNumber} of ${loadedPdf.numPages}...`
            );


            /*
                Yield to the browser so
                the status text repaints
                between pages.
            */

            await nextFrame();


            const jpegBytes =
                await renderPageToJpeg(
                    pageNumber,
                    level
                );


            const image =
                await newPdf.embedJpg(
                    jpegBytes
                );


            /*
                Keep the original page
                size so the compressed
                PDF prints the same.
            */

            const sourcePage =
                await loadedPdf.getPage(
                    pageNumber
                );

            const sourceViewport =
                sourcePage.getViewport({
                    scale: 1
                });


            const page =
                newPdf.addPage([
                    sourceViewport.width,
                    sourceViewport.height
                ]);


            page.drawImage(
                image,
                {
                    x: 0,
                    y: 0,
                    width: sourceViewport.width,
                    height: sourceViewport.height
                }
            );

        }


        const pdfBytes =
            await newPdf.save();


        reportResult(
            selectedFile.size,
            pdfBytes.length
        );


        downloadPdf(
            pdfBytes,
            `${getBaseName()}-compressed.pdf`
        );


        compressButton.disabled = false;

        compressButton.textContent =
            "Compress PDF";


    }
    catch (error) {

        console.error(error);


        compressButton.disabled = false;

        compressButton.textContent =
            "Compress PDF";


        showError(
            "The PDF could not be compressed. Please make sure it is valid and is not password protected."
        );

    }

}


/*
    =========================
    RENDER PAGE TO JPEG
    =========================
*/

async function renderPageToJpeg(
    pageNumber,
    level
) {

    const page =
        await loadedPdf.getPage(
            pageNumber
        );


    const viewport =
        page.getViewport({
            scale: level.scale
        });


    const canvas =
        document.createElement(
            "canvas"
        );


    const context =
        canvas.getContext("2d");


    canvas.width =
        Math.max(
            1,
            Math.floor(viewport.width)
        );

    canvas.height =
        Math.max(
            1,
            Math.floor(viewport.height)
        );


    /*
        JPEG has no transparency, so
        paint a white background or
        the page comes out black.
    */

    context.fillStyle = "#ffffff";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    await page.render({
        canvasContext: context,
        viewport
    }).promise;


    const blob =
        await canvasToBlob(
            canvas,
            "image/jpeg",
            level.quality
        );


    const buffer =
        await blob.arrayBuffer();


    return new Uint8Array(buffer);

}


/*
    =========================
    CANVAS TO BLOB
    =========================
*/

function canvasToBlob(
    canvas,
    type,
    quality
) {

    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                (blob) => {

                    if (!blob) {

                        reject(
                            new Error(
                                "Could not create image."
                            )
                        );

                        return;

                    }

                    resolve(blob);

                },
                type,
                quality
            );

        }
    );

}


/*
    =========================
    REPORT RESULT
    =========================
*/

function reportResult(
    originalBytes,
    compressedBytes
) {

    resultOriginal.textContent =
        formatBytes(originalBytes);


    resultCompressed.textContent =
        formatBytes(compressedBytes);


    const saved =
        originalBytes - compressedBytes;


    const percent =
        originalBytes === 0
            ? 0
            : Math.round(
                (saved / originalBytes) * 100
            );


    statusBox.classList.remove(
        "hidden"
    );


    /*
        A rendered PDF can come out
        larger than the original, for
        example when the source was
        plain text. Say so plainly
        rather than showing a negative
        saving.
    */

    if (saved <= 0) {

        resultReduction.textContent =
            "0%";


        showStatus(
            "This PDF was already smaller than the compressed version. The compressed file was still saved."
        );

        return;

    }


    resultReduction.textContent =
        `${percent}%`;


    showSuccess(
        `Saved ${formatBytes(saved)} (${percent}% smaller).`
    );

}


/*
    =========================
    DOWNLOAD
    =========================
*/

function downloadPdf(
    pdfBytes,
    name
) {

    const blob =
        new Blob(
            [pdfBytes],
            {
                type: "application/pdf"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = name;


    document.body.appendChild(link);


    link.click();


    link.remove();


    URL.revokeObjectURL(url);

}


/*
    =========================
    BASE NAME
    =========================
*/

function getBaseName() {

    if (!selectedFile) {

        return "document";

    }


    return selectedFile.name.replace(
        /\.pdf$/i,
        ""
    );

}


/*
    =========================
    FORMAT BYTES
    =========================
*/

function formatBytes(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }


    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


/*
    =========================
    NEXT FRAME
    =========================
*/

function nextFrame() {

    return new Promise(
        (resolve) => {

            requestAnimationFrame(
                () => resolve()
            );

        }
    );

}


/*
    =========================
    STATUS
    =========================
*/

function showStatus(message) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message";

}


function showSuccess(message) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message success";

}


function showError(message) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message error";

}


function clearStatus() {

    statusMessage.textContent = "";

    statusMessage.className =
        "status-message";

}
