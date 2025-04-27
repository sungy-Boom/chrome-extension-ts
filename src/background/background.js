console.log("background js 333");

chrome.action.onClicked.addListener(function (tab) {
    //打开新网页
    // chrome.tabs.create({"url":"popup/index.html", "selected":true});
    //打开弹窗
    chrome.windows.create({
        url: "popup/index.html",
        type: "popup",
        width: 1024,
        height: 768,
    });
});
