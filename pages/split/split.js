const backButton =
    document.getElementById("backButton");

const chooseFileButton =
    document.getElementById(
        "chooseFileButton"
    );

const changeFileButton =
    document.getElementById(
        "changeFileButton"
    );

const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const pdfSection =
    document.getElementById("pdfSection");

const pdfInformation =
    document.getElementById(
        "pdfInformation"
    );

const pageList =
    document.getElementById("pageList");

const actionSection =
    document.getElementById(
        "actionSection"
    );

const selectionInformation =
    document.getElementById(
        "selectionInformation"
    );

const splitButton =
    document.getElementById("splitButton");

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


/*
    =========================
    STATE
    =========================
*/

let selectedFile = null;

let loadedPdf = null;

let selectedPages = [];


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
    CREATE PAGE ELEMENT
    =========================
*/

function createPageElement(
    pageIndex
) {

    const container =
        document.createElement("div");

    container.className =
        "page-item";


    const checkbox =
        document.createElement("input");

    checkbox.type =
        "checkbox";

    checkbox.className =
        "page-checkbox";

    checkbox.dataset.pageIndex =
        pageIndex;


    const preview =
        document.createElement("div");

    preview.className =
        "page-preview";

    preview.textContent =
        "📄";


    const pageNumber =
        document.createElement("div");

    pageNumber.className =
        "page-number";

    pageNumber.textContent =
        `Page ${pageIndex + 1}`;


    const pageSize =
        document.createElement("div");

    pageSize.className =
        "page-size";

    pageSize.textContent =
        "PDF page";


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
        pageSize
    );


    /*
        Clicking the card
        selects the page.
    */

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


    /*
        Clicking the checkbox
        selects the page.
    */

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
    UPDATE PAGE SELECTION
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
    PAGE VISUAL STATE
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


    /*
        We need at least
        one page to create
        a new PDF.
    */

    splitButton.disabled =
        count === 0;

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


        const pageCount =
            loadedPdf.getPageCount();


        selectedPages =
            [];


        for (
            let i = 0;
            i < pageCount;
            i++
        ) {

            selectedPages.push(i);

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
    SPLIT PDF
    =========================
*/

splitButton.addEventListener(
    "click",
    async () => {

        await splitPdf();

    }
);


/*
    =========================
    SPLIT FUNCTION
    =========================
*/

async function splitPdf() {

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

        splitButton.disabled =
            true;

        splitButton.textContent =
            "Creating PDF...";


        /*
            Create a new empty PDF.
        */

        const newPdf =
            await PDFLib.PDFDocument.create();


        /*
            Sort pages numerically.

            This means if the user selects:

            5
            2
            4

            the output becomes:

            2
            4
            5
        */

        const sortedPages =
            [...selectedPages].sort(
                (a, b) =>
                    a - b
            );


        /*
            Copy selected pages
            from the original PDF.
        */

        const copiedPages =
            await newPdf.copyPages(
                loadedPdf,
                sortedPages
            );


        /*
            Add the copied pages
            to the new PDF.
        */

        for (
            const page of copiedPages
        ) {

            newPdf.addPage(page);

        }


        /*
            Generate the new PDF.
        */

        const pdfBytes =
            await newPdf.save();


        /*
            Create a Blob.
        */

        const blob =
            new Blob(
                [pdfBytes],
                {
                    type: "application/pdf"
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
            "split.pdf";


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


        splitButton.disabled =
            false;

        splitButton.textContent =
            "Split PDF";


        alert(
            "The selected pages have been saved as split.pdf."
        );

    }
    catch (error) {

        console.error(
            "PDF split error:",
            error
        );


        splitButton.disabled =
            false;

        splitButton.textContent =
            "Split PDF";


        alert(
            "The PDF could not be split. Please make sure the PDF is valid and is not password protected."
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