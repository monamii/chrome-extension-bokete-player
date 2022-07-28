console.log('background');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    watchList: [{
      label: "America",
      code: "usa"
    }
    ],
  });
  console.log(`Default background countries set`);
});
