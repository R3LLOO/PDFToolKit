const mergeButton =
    document.getElementById(
        "mergeButton"
    );


const splitButton =
    document.getElementById(
        "splitButton"
    );


const extractButton =
    document.getElementById(
        "extractButton"
    );


const rotateButton =
    document.getElementById(
        "rotateButton"
    );

const imagesButton =
    document.getElementById(
        "imagesButton"
    );

const compressButton =
    document.getElementById(
        "compressButton"
    );


/*
    =========================
    MERGE PDF
    =========================
*/

if (mergeButton) {

    mergeButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/merge/merge.html"
                )
            });

        }
    );

}


if (splitButton) {

    splitButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/split/split.html"
                )
            });

        }
    );

}


if (extractButton) {

    extractButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/extract/extract.html"
                )
            });

        }
    );

}


if (rotateButton) {

    rotateButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/rotate/rotate.html"
                )
            });

        }
    );

}


if (imagesButton) {

    imagesButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/images/image.html"
                )
            });

        }
    );

}


if (compressButton) {

    compressButton.addEventListener(
        "click",
        () => {

            chrome.tabs.create({
                url: chrome.runtime.getURL(
                    "pages/compress/compress.html"
                )
            });

        }
    );

}