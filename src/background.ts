console.log('background');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    countries: [
      'usa',
      'australian',
      //   'thai',
      'japanese',
      'indian',
      'south_korea',
    ],
  });
  console.log(`Default background countries set`);
});
