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


/*
    =========================
    MERGE PDF
    =========================
*/

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


/*
    =========================
    SPLIT PDF
    =========================
*/

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


/*
    =========================
    EXTRACT PAGES
    =========================
*/

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


/*
    =========================
    ROTATE PDF
    =========================
*/

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