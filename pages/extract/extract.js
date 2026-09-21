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

const rangeInput =
    document.getElementById("rangeInput");

const rangeFeedback =
    document.getElementById(
        "rangeFeedback"
    );

const actionSection =
    document.getElementById(
        "actionSection"
    );

const selectionInformation =
    document.getElementById(
        "selectionInformation"
    );

const extractButton =
    document.getElementById(
        "extractButton"
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


        rangeInput.value = "";


        pdfInformation.textContent =
            `${pageCount} ${
                pageCount === 1
                    ? "page"
                    : "pages"
            } available`;


        pdfSection.classList.remove(
            "hidden"
        );


        actionSection.classList.remove(
            "hidden"
        );


        hideStatus();

        updateSelection();


        rangeInput.focus();


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
    PARSE PAGE RANGE

    Accepts input such as:

        1-3, 7, 10-12
        all

    Returns:

        {
            pages: [0, 1, 2, 6, ...],
            error: null
        }

    Page numbers the user types are
    1-based. The returned indexes are
    0-based, because that is what
    pdf-lib expects.
    =========================
*/

function parsePageRange(
    text,
    pageCount
) {

    const trimmed =
        text.trim();


    if (trimmed === "") {

        return {
            pages: [],
            error: null
        };

    }


    /*
        "all" is a shortcut for
        every page in the document.
    */

    if (
        trimmed.toLowerCase() === "all"
    ) {

        const everyPage = [];


        for (
            let i = 0;
            i < pageCount;
            i++
        ) {

            everyPage.push(i);

        }


        return {
            pages: everyPage,
            error: null
        };

    }


    const pages = [];


    const parts =
        trimmed.split(",");


    for (const rawPart of parts) {

        const part =
            rawPart.trim();


        /*
            A trailing comma leaves an
            empty part. Skip it rather
            than calling it an error.
        */

        if (part === "") {

            continue;

        }


        /*
            A hyphen means a range.
        */

        if (part.includes("-")) {

            const bounds =
                part.split("-");


            if (bounds.length !== 2) {

                return {
                    pages: [],
                    error: `"${part}" is not a valid range.`
                };

            }


            const start =
                parsePageNumber(
                    bounds[0]
                );

            const end =
                parsePageNumber(
                    bounds[1]
                );


            if (
                start === null ||
                end === null
            ) {

                return {
                    pages: [],
                    error: `"${part}" is not a valid range.`
                };

            }


            if (
                start > pageCount ||
                end > pageCount
            ) {

                return {
                    pages: [],
                    error: `This PDF only has ${pageCount} ${
                        pageCount === 1
                            ? "page"
                            : "pages"
                    }.`
                };

            }


            /*
                Accept a reversed range
                such as 9-5 by walking
                from the lower number.
            */

            const from =
                Math.min(start, end);

            const to =
                Math.max(start, end);


            for (
                let page = from;
                page <= to;
                page++
            ) {

                pages.push(page - 1);

            }


            continue;

        }


        /*
            Otherwise it is a single page.
        */

        const single =
            parsePageNumber(part);


        if (single === null) {

            return {
                pages: [],
                error: `"${part}" is not a valid page number.`
            };

        }


        if (single > pageCount) {

            return {
                pages: [],
                error: `This PDF only has ${pageCount} ${
                    pageCount === 1
                        ? "page"
                        : "pages"
                }.`
            };

        }


        pages.push(single - 1);

    }


    /*
        Remove duplicates, then sort.

        This means 3,1,3 becomes 1,3.
    */

    const unique =
        Array.from(
            new Set(pages)
        );


    unique.sort(
        (a, b) =>
            a - b
    );


    return {
        pages: unique,
        error: null
    };

}


/*
    =========================
    PARSE PAGE NUMBER

    Returns a positive whole number,
    or null when the text is not one.
    =========================
*/

function parsePageNumber(text) {

    const trimmed =
        text.trim();


    /*
        Guard against input that
        Number() would quietly accept,
        such as "1.5", "1e2" or "".
    */

    if (
        !/^\d+$/.test(trimmed)
    ) {

        return null;

    }


    const value =
        Number(trimmed);


    if (value < 1) {

        return null;

    }


    return value;

}


/*
    =========================
    RANGE INPUT
    =========================
*/

rangeInput.addEventListener(
    "input",
    () => {

        updateSelection();

    }
);


/*
    =========================
    UPDATE SELECTION
    =========================
*/

function updateSelection() {

    if (!loadedPdf) {

        selectedPages = [];

        extractButton.disabled = true;

        return;

    }


    const pageCount =
        loadedPdf.getPageCount();


    const result =
        parsePageRange(
            rangeInput.value,
            pageCount
        );


    /*
        Show the parse error and stop.
    */

    if (result.error) {

        selectedPages = [];


        rangeInput.classList.add(
            "invalid"
        );


        setFeedback(
            result.error,
            "error"
        );


        selectionInformation.textContent =
            "0 pages selected";


        extractButton.disabled = true;


        return;

    }


    selectedPages =
        result.pages;


    rangeInput.classList.remove(
        "invalid"
    );


    const count =
        selectedPages.length;


    if (count === 0) {

        setFeedback("", "");

    }
    else {

        setFeedback(
            `Pages ${formatPageList(
                selectedPages
            )} will be extracted.`,
            "success"
        );

    }


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

    extractButton.disabled =
        count === 0;

}


/*
    =========================
    FORMAT PAGE LIST

    Turns [0,1,2,6] into "1-3, 7"
    so the confirmation reads the
    way the user typed it.
    =========================
*/

function formatPageList(pages) {

    const groups = [];


    let runStart =
        pages[0];

    let runEnd =
        pages[0];


    for (
        let i = 1;
        i < pages.length;
        i++
    ) {

        if (
            pages[i] === runEnd + 1
        ) {

            runEnd = pages[i];

            continue;

        }


        groups.push(
            describeRun(
                runStart,
                runEnd
            )
        );


        runStart = pages[i];

        runEnd = pages[i];

    }


    groups.push(
        describeRun(
            runStart,
            runEnd
        )
    );


    return groups.join(", ");

}


function describeRun(start, end) {

    if (start === end) {

        return `${start + 1}`;

    }


    return `${start + 1}-${end + 1}`;

}


/*
    =========================
    FEEDBACK
    =========================
*/

function setFeedback(
    message,
    kind
) {

    rangeFeedback.textContent =
        message;


    rangeFeedback.className =
        kind === ""
            ? "range-feedback"
            : `range-feedback ${kind}`;

}


/*
    =========================
    OUTPUT MODE
    =========================
*/

function getOutputMode() {

    const checked =
        document.querySelector(
            "input[name='outputMode']:checked"
        );


    if (!checked) {

        return "single";

    }


    return checked.value;

}


/*
    =========================
    EXTRACT BUTTON
    =========================
*/

extractButton.addEventListener(
    "click",
    async () => {

        await extractPages();

    }
);


/*
    =========================
    EXTRACT FUNCTION
    =========================
*/

async function extractPages() {

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
            "Please enter at least one page."
        );

        return;

    }


    try {

        extractButton.disabled =
            true;

        extractButton.textContent =
            "Creating PDF...";


        const mode =
            getOutputMode();


        if (mode === "separate") {

            await saveSeparatePdfs();

        }
        else {

            await saveCombinedPdf();

        }


        extractButton.disabled =
            false;

        extractButton.textContent =
            "Extract Pages";

    }
    catch (error) {

        console.error(
            "PDF extract error:",
            error
        );


        extractButton.disabled =
            false;

        extractButton.textContent =
            "Extract Pages";


        alert(
            "The pages could not be extracted. Please make sure the PDF is valid and is not password protected."
        );

    }

}


/*
    =========================
    SAVE COMBINED PDF

    Every selected page goes into
    one new file.
    =========================
*/

async function saveCombinedPdf() {

    const newPdf =
        await PDFLib.PDFDocument.create();


    const copiedPages =
        await newPdf.copyPages(
            loadedPdf,
            selectedPages
        );


    for (
        const page of copiedPages
    ) {

        newPdf.addPage(page);

    }


    const pdfBytes =
        await newPdf.save();


    downloadPdf(
        pdfBytes,
        `${getBaseName()}-extracted.pdf`
    );


    alert(
        `${selectedPages.length} ${
            selectedPages.length === 1
                ? "page has"
                : "pages have"
        } been saved.`
    );

}


/*
    =========================
    SAVE SEPARATE PDFS

    Each selected page becomes its
    own file.
    =========================
*/

async function saveSeparatePdfs() {

    const baseName =
        getBaseName();


    for (
        const pageIndex of selectedPages
    ) {

        const newPdf =
            await PDFLib.PDFDocument.create();


        const copiedPages =
            await newPdf.copyPages(
                loadedPdf,
                [pageIndex]
            );


        newPdf.addPage(
            copiedPages[0]
        );


        const pdfBytes =
            await newPdf.save();


        downloadPdf(
            pdfBytes,
            `${baseName}-page-${
                pageIndex + 1
            }.pdf`
        );


        /*
            Chrome drops downloads that
            arrive in the same instant,
            so space them out a little.
        */

        await delay(300);

    }


    alert(
        `${selectedPages.length} ${
            selectedPages.length === 1
                ? "file has"
                : "files have"
        } been saved.`
    );

}


/*
    =========================
    DOWNLOAD
    =========================
*/

function downloadPdf(
    pdfBytes,
    fileName
) {

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
        fileName;


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

}


/*
    =========================
    BASE NAME

    Reuses the original file name so
    the downloads are easy to match
    back to their source.
    =========================
*/

function getBaseName() {

    if (!selectedFile) {

        return "extract";

    }


    return selectedFile.name.replace(
        /\.pdf$/i,
        ""
    );

}


/*
    =========================
    DELAY
    =========================
*/

function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

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


    rangeInput.value = "";

    rangeInput.classList.remove(
        "invalid"
    );


    setFeedback("", "");


    pdfInformation.textContent =
        "0 pages";


    selectionInformation.textContent =
        "0 pages selected";


    extractButton.disabled = true;


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
