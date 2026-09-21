import {
    getDocument,
    GlobalWorkerOptions
} from "../../build/pdf.mjs";


/*
    =========================
    PDF.JS WORKER
    =========================
*/

/*
    Inside the extension we resolve the
    worker against the extension root.

    Opened as a plain page — while
    testing, for example — chrome.runtime
    is not there, so fall back to a
    relative path.
*/

GlobalWorkerOptions.workerSrc =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.getURL
        ? chrome.runtime.getURL(
            "build/pdf.worker.mjs"
        )
        : "../../build/pdf.worker.mjs";


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

const outputSection =
    document.getElementById(
        "outputSection"
    );

const fileName =
    document.getElementById(
        "fileName"
    );

const pageCount =
    document.getElementById(
        "pageCount"
    );

const pageList =
    document.getElementById(
        "pageList"
    );

const selectAllButton =
    document.getElementById(
        "selectAllButton"
    );

const clearSelectionButton =
    document.getElementById(
        "clearSelectionButton"
    );

const changeFileButton =
    document.getElementById(
        "changeFileButton"
    );

const convertButton =
    document.getElementById(
        "convertButton"
    );

const selectionCount =
    document.getElementById(
        "selectionCount"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const qualitySection =
    document.getElementById(
        "qualitySection"
    );

const qualityRange =
    document.getElementById(
        "qualityRange"
    );

const qualityValue =
    document.getElementById(
        "qualityValue"
    );

const formatButtons =
    document.querySelectorAll(
        ".format-button"
    );


/*
    =========================
    STATE
    =========================
*/

let selectedFile = null;

let loadedPdf = null;

let selectedPages = new Set();

let selectedFormat = "png";

let jpgQuality = 0.9;


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

    }
);


/*
    =========================
    DRAG ENTER
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
    LOAD PDF
    =========================
*/

async function loadPdf(file) {

    clearStatus();

    if (
        !file.name
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        showError(
            "Please select a PDF file."
        );

        return;

    }


    selectedFile = file;

    selectedPages = new Set();


    try {

        showStatus(
            "Loading PDF..."
        );


        const arrayBuffer =
            await file.arrayBuffer();


        loadedPdf =
            await getDocument({
                data: arrayBuffer
            }).promise;


        fileName.textContent =
            file.name;


        pageCount.textContent =
            `${loadedPdf.numPages} ${
                loadedPdf.numPages === 1
                    ? "page"
                    : "pages"
            }`;


        pdfSection.classList.remove(
            "hidden"
        );


        outputSection.classList.remove(
            "hidden"
        );


        renderPageList();


        updateSelectionUI();


        showStatus(
            "PDF loaded successfully."
        );


    } catch (error) {

        console.error(error);

        loadedPdf = null;

        pdfSection.classList.add(
            "hidden"
        );

        outputSection.classList.add(
            "hidden"
        );


        showError(
            "The PDF could not be opened. It may be damaged or password protected."
        );

    }

}


/*
    =========================
    RENDER PAGE LIST
    =========================
*/

function renderPageList() {

    pageList.innerHTML = "";


    for (
        let pageNumber = 1;
        pageNumber <= loadedPdf.numPages;
        pageNumber++
    ) {

        const pageCard =
            document.createElement(
                "div"
            );

        pageCard.className =
            "page-card";


        const checkbox =
            document.createElement(
                "input"
            );

        checkbox.type =
            "checkbox";

        checkbox.className =
            "page-checkbox";


        checkbox.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );


        checkbox.addEventListener(
            "change",
            () => {

                togglePage(
                    pageNumber,
                    checkbox.checked
                );

            }
        );


        const preview =
            document.createElement(
                "div"
            );

        preview.className =
            "page-preview";

        preview.textContent =
            "📄";


        const number =
            document.createElement(
                "div"
            );

        number.className =
            "page-number";

        number.textContent =
            `Page ${pageNumber}`;


        pageCard.appendChild(
            checkbox
        );

        pageCard.appendChild(
            preview
        );

        pageCard.appendChild(
            number
        );


        pageCard.addEventListener(
            "click",
            () => {

                checkbox.checked =
                    !checkbox.checked;

                togglePage(
                    pageNumber,
                    checkbox.checked
                );

            }
        );


        pageList.appendChild(
            pageCard
        );

    }

}


/*
    =========================
    TOGGLE PAGE
    =========================
*/

function togglePage(
    pageNumber,
    isSelected
) {

    if (isSelected) {

        selectedPages.add(
            pageNumber
        );

    } else {

        selectedPages.delete(
            pageNumber
        );

    }


    updatePageVisuals();

    updateSelectionUI();

}


/*
    =========================
    UPDATE PAGE VISUALS
    =========================
*/

function updatePageVisuals() {

    const cards =
        pageList.querySelectorAll(
            ".page-card"
        );


    cards.forEach(
        (card, index) => {

            const pageNumber =
                index + 1;

            const checkbox =
                card.querySelector(
                    ".page-checkbox"
                );


            if (
                selectedPages.has(
                    pageNumber
                )
            ) {

                card.classList.add(
                    "selected"
                );

                checkbox.checked =
                    true;

            } else {

                card.classList.remove(
                    "selected"
                );

                checkbox.checked =
                    false;

            }

        }
    );

}


/*
    =========================
    SELECT ALL
    =========================
*/

selectAllButton.addEventListener(
    "click",
    () => {

        if (!loadedPdf) {
            return;
        }


        selectedPages =
            new Set(
                Array.from(
                    {
                        length:
                            loadedPdf.numPages
                    },
                    (_, index) =>
                        index + 1
                )
            );


        updatePageVisuals();

        updateSelectionUI();

    }
);


/*
    =========================
    CLEAR SELECTION
    =========================
*/

clearSelectionButton.addEventListener(
    "click",
    () => {

        selectedPages.clear();

        updatePageVisuals();

        updateSelectionUI();

    }
);


/*
    =========================
    FORMAT BUTTONS
    =========================
*/

formatButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                formatButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedFormat =
                    button.dataset.format;


                if (
                    selectedFormat === "jpg"
                ) {

                    qualitySection.classList.remove(
                        "hidden"
                    );

                } else {

                    qualitySection.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }
);


/*
    =========================
    JPG QUALITY
    =========================
*/

qualityRange.addEventListener(
    "input",
    () => {

        const value =
            Number(
                qualityRange.value
            );


        jpgQuality =
            value / 100;


        qualityValue.textContent =
            `${value}%`;

    }
);


/*
    =========================
    UPDATE SELECTION UI
    =========================
*/

function updateSelectionUI() {

    const count =
        selectedPages.size;


    selectionCount.textContent =
        `${count} ${
            count === 1
                ? "page"
                : "pages"
        } selected`;


    convertButton.disabled =
        !loadedPdf ||
        count === 0;

}


/*
    =========================
    CONVERT
    =========================
*/

convertButton.addEventListener(
    "click",
    async () => {

        if (
            !loadedPdf ||
            selectedPages.size === 0
        ) {

            return;

        }


        convertButton.disabled =
            true;


        try {

            const pages =
                Array.from(
                    selectedPages
                ).sort(
                    (a, b) => a - b
                );


            for (
                let index = 0;
                index < pages.length;
                index++
            ) {

                const pageNumber =
                    pages[index];


                showStatus(
                    `Converting page ${pageNumber} of ${pages.length}...`
                );


                await convertPage(
                    pageNumber
                );


                await delay(150);

            }


            showSuccess(
                `Finished converting ${pages.length} ${
                    pages.length === 1
                        ? "page"
                        : "pages"
                }.`
            );


        } catch (error) {

            console.error(error);

            showError(
                "Something went wrong while converting the PDF."
            );

        } finally {

            updateSelectionUI();

        }

    }
);


/*
    =========================
    CONVERT PAGE
    =========================
*/

async function convertPage(
    pageNumber
) {

    const page =
        await loadedPdf.getPage(
            pageNumber
        );


    const scale = 2;

    const viewport =
        page.getViewport({
            scale
        });


    const canvas =
        document.createElement(
            "canvas"
        );


    const context =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        viewport.width;


    canvas.height =
        viewport.height;


    await page.render({
        canvasContext: context,
        viewport
    }).promise;


    const mimeType =
        selectedFormat === "png"
            ? "image/png"
            : "image/jpeg";


    const quality =
        selectedFormat === "jpg"
            ? jpgQuality
            : undefined;


    const blob =
        await canvasToBlob(
            canvas,
            mimeType,
            quality
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const extension =
        selectedFormat === "png"
            ? "png"
            : "jpg";


    const baseName =
        selectedFile.name.replace(
            /\.pdf$/i,
            ""
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `${baseName}-page-${pageNumber}.${extension}`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

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
    DELAY
    =========================
*/

function delay(
    milliseconds
) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/*
    =========================
    STATUS
    =========================
*/

function showStatus(
    message
) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message";

}


function showSuccess(
    message
) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message success";

}


function showError(
    message
) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message error";

}


function clearStatus() {

    statusMessage.textContent =
        "";

    statusMessage.className =
        "status-message";

}