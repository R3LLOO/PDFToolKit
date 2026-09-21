const backButton =
    document.getElementById(
        "backButton"
    );


const chooseFileButton =
    document.getElementById(
        "chooseFileButton"
    );


const changeFileButton =
    document.getElementById(
        "changeFileButton"
    );


const fileInput =
    document.getElementById(
        "fileInput"
    );


const dropZone =
    document.getElementById(
        "dropZone"
    );


const pdfSection =
    document.getElementById(
        "pdfSection"
    );


const pdfInformation =
    document.getElementById(
        "pdfInformation"
    );


const pageList =
    document.getElementById(
        "pageList"
    );


const actionSection =
    document.getElementById(
        "actionSection"
    );


const selectionInformation =
    document.getElementById(
        "selectionInformation"
    );


const rotateButton =
    document.getElementById(
        "rotateButton"
    );


const selectAllButton =
    document.getElementById(
        "selectAllButton"
    );


const clearSelectionButton =
    document.getElementById(
        "clearSelectionButton"
    );


const statusMessage =
    document.getElementById(
        "statusMessage"
    );


const rotationButtons =
    document.querySelectorAll(
        ".rotation-button"
    );


/*
    =========================
    STATE
    =========================
*/

let selectedFile = null;

let loadedPdf = null;

let selectedPages = [];

let rotationAngle = 90;


/*
    =========================
    BACK
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
    CHOOSE FILE
    =========================
*/

chooseFileButton.addEventListener(
    "click",
    () => {

        fileInput.click();

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

        resetPdf();

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
    async (event) => {

        const files =
            Array.from(
                event.target.files
            );


        if (files.length === 0) {

            return;

        }


        await loadPdfFile(
            files[0]
        );


        fileInput.value = "";

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
            "drag-over"
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
            "drag-over"
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
            "drag-over"
        );


        const files =
            Array.from(
                event.dataTransfer.files
            );


        if (files.length === 0) {

            return;

        }


        await loadPdfFile(
            files[0]
        );

    }
);


/*
    =========================
    LOAD PDF
    =========================
*/

async function loadPdfFile(file) {

    if (!isPdf(file)) {

        alert(
            "Please select a PDF file."
        );

        return;

    }


    try {

        showStatus(
            "Loading PDF..."
        );


        selectedFile =
            file;


        const fileBytes =
            await file.arrayBuffer();


        loadedPdf =
            await PDFLib.PDFDocument.load(
                fileBytes
            );


        const pageCount =
            loadedPdf.getPageCount();


        selectedPages = [];


        renderPages(
            pageCount
        );


        pdfInformation.textContent =
            `${pageCount} ${
                pageCount === 1
                    ? "page"
                    : "pages"
            }`;


        pdfSection.classList.remove(
            "hidden"
        );


        actionSection.classList.remove(
            "hidden"
        );


        hideStatus();


        updateSelection();


    }
    catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        selectedFile = null;

        loadedPdf = null;

        selectedPages = [];


        alert(
            "This PDF could not be opened. Please make sure it is a valid PDF and is not password protected."
        );


        hideStatus();

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
    RENDER PAGES
    =========================
*/

function renderPages(pageCount) {

    pageList.innerHTML = "";


    for (
        let pageIndex = 0;
        pageIndex < pageCount;
        pageIndex++
    ) {

        const pageElement =
            createPageElement(
                pageIndex
            );


        pageList.appendChild(
            pageElement
        );

    }

}


/*
    =========================
    CREATE PAGE
    =========================
*/

function createPageElement(
    pageIndex
) {

    const container =
        document.createElement(
            "div"
        );


    container.className =
        "page-item";


    const checkbox =
        document.createElement(
            "input"
        );


    checkbox.type =
        "checkbox";


    checkbox.className =
        "page-checkbox";


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "page-preview";


    preview.textContent =
        "📄";


    const pageNumber =
        document.createElement(
            "div"
        );


    pageNumber.className =
        "page-number";


    pageNumber.textContent =
        `Page ${pageIndex + 1}`;


    const rotationText =
        document.createElement(
            "div"
        );


    rotationText.className =
        "page-rotation";


    rotationText.textContent =
        "Original";


    container.appendChild(
        checkbox
    );


    container.appendChild(
        preview
    );


    container.appendChild(
        pageNumber
    );


    container.appendChild(
        rotationText
    );


    container.addEventListener(
        "click",
        (event) => {

            if (
                event.target === checkbox
            ) {

                return;

            }


            checkbox.checked =
                !checkbox.checked;


            updatePageSelection(
                pageIndex,
                checkbox.checked
            );

        }
    );


    checkbox.addEventListener(
        "change",
        () => {

            updatePageSelection(
                pageIndex,
                checkbox.checked
            );

        }
    );


    return container;

}


/*
    =========================
    PAGE SELECTION
    =========================
*/

function updatePageSelection(
    pageIndex,
    isSelected
) {

    if (isSelected) {

        if (
            !selectedPages.includes(
                pageIndex
            )
        ) {

            selectedPages.push(
                pageIndex
            );

        }

    }
    else {

        selectedPages =
            selectedPages.filter(
                index =>
                    index !== pageIndex
            );

    }


    updatePageVisualState();

    updateSelection();

}


/*
    =========================
    VISUAL STATE
    =========================
*/

function updatePageVisualState() {

    const pageElements =
        document.querySelectorAll(
            ".page-item"
        );


    pageElements.forEach(
        (element, index) => {

            const checkbox =
                element.querySelector(
                    ".page-checkbox"
                );


            const preview =
                element.querySelector(
                    ".page-preview"
                );


            const rotationText =
                element.querySelector(
                    ".page-rotation"
                );


            const isSelected =
                selectedPages.includes(
                    index
                );


            checkbox.checked =
                isSelected;


            element.classList.toggle(
                "selected",
                isSelected
            );


            /*
                Show a visual
                indication of the
                chosen rotation.
            */

            if (isSelected) {

                preview.style.transform =
                    `rotate(${rotationAngle}deg)`;


                rotationText.textContent =
                    `${rotationAngle}° rotation`;

            }
            else {

                preview.style.transform =
                    "rotate(0deg)";


                rotationText.textContent =
                    "Original";

            }

        }
    );

}


/*
    =========================
    UPDATE SELECTION
    =========================
*/

function updateSelection() {

    const count =
        selectedPages.length;


    selectionInformation.textContent =
        `${count} ${
            count === 1
                ? "page"
                : "pages"
        } selected`;


    rotateButton.disabled =
        count === 0;

}


/*
    =========================
    ROTATION BUTTONS
    =========================
*/

rotationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                rotationButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                rotationAngle =
                    Number(
                        button.dataset.rotation
                    );


                updatePageVisualState();

            }
        );

    }
);


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


        const pageCount =
            loadedPdf.getPageCount();


        selectedPages = [];


        for (
            let i = 0;
            i < pageCount;
            i++
        ) {

            selectedPages.push(
                i
            );

        }


        updatePageVisualState();

        updateSelection();

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

        selectedPages = [];


        updatePageVisualState();

        updateSelection();

    }
);


/*
    =========================
    ROTATE PDF
    =========================
*/

rotateButton.addEventListener(
    "click",
    async () => {

        await rotatePdf();

    }
);


/*
    =========================
    ROTATE FUNCTION
    =========================
*/

async function rotatePdf() {

    if (!loadedPdf) {

        alert(
            "Please select a PDF first."
        );

        return;

    }


    if (
        selectedPages.length === 0
    ) {

        alert(
            "Please select at least one page."
        );

        return;

    }


    try {

        rotateButton.disabled =
            true;


        rotateButton.textContent =
            "Rotating PDF...";


        /*
            Get all pages.
        */

        const pages =
            loadedPdf.getPages();


        /*
            Apply rotation only
            to selected pages.
        */

        for (
            const pageIndex
            of selectedPages
        ) {

            const page =
                pages[pageIndex];


            const currentRotation =
                page.getRotation().angle;


            const newRotation =
                currentRotation +
                rotationAngle;


            page.setRotation(
                PDFLib.degrees(
                    newRotation
                )
            );

        }


        /*
            Save the modified PDF.
        */

        const pdfBytes =
            await loadedPdf.save();


        /*
            Create Blob.
        */

        const blob =
            new Blob(
                [pdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        /*
            Create temporary URL.
        */

        const downloadUrl =
            URL.createObjectURL(
                blob
            );


        /*
            Create download link.
        */

        const downloadLink =
            document.createElement(
                "a"
            );


        downloadLink.href =
            downloadUrl;


        downloadLink.download =
            "rotated.pdf";


        document.body.appendChild(
            downloadLink
        );


        downloadLink.click();


        downloadLink.remove();


        /*
            Clean up.
        */

        URL.revokeObjectURL(
            downloadUrl
        );


        rotateButton.disabled =
            false;


        rotateButton.textContent =
            "Rotate PDF";


        alert(
            `The selected ${
                selectedPages.length === 1
                    ? "page has"
                    : "pages have"
            } been rotated successfully.`
        );

    }
    catch (error) {

        console.error(
            "PDF rotation error:",
            error
        );


        rotateButton.disabled =
            false;


        rotateButton.textContent =
            "Rotate PDF";


        alert(
            "The PDF could not be rotated. Please make sure the PDF is valid and is not password protected."
        );

    }

}


/*
    =========================
    RESET
    =========================
*/

function resetPdf() {

    selectedFile = null;

    loadedPdf = null;

    selectedPages = [];


    pdfSection.classList.add(
        "hidden"
    );


    actionSection.classList.add(
        "hidden"
    );


    pageList.innerHTML = "";


    pdfInformation.textContent =
        "0 pages";


    updateSelection();


    hideStatus();

}


/*
    =========================
    STATUS
    =========================
*/

function showStatus(message) {

    statusMessage.textContent =
        message;


    statusMessage.classList.remove(
        "hidden"
    );

}


function hideStatus() {

    statusMessage.classList.add(
        "hidden"
    );

}