import { CalendarApiData } from './app/model/CalendarApiData';
import { debounce } from 'lodash';
import { ChromeStorage } from './app/model/enum/ChromeStorage';

console.log('background: called', new Date());

const debounceGetApiData = debounce(getApiData, 1000);

chrome.runtime.onInstalled.addListener(async () => {
  await getApiData();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (
    area === 'sync' &&
    changes[ChromeStorage.WATCH_LIST]?.newValue !== undefined
  ) {
    console.log(
      'background: watchlist onChanged',
      changes[ChromeStorage.WATCH_LIST]?.newValue.length
    );
    debounceGetApiData();
  }
});

async function getApiData() {
  const { watchList } = await chrome.storage.sync.get(ChromeStorage.WATCH_LIST);
  if (watchList === undefined) {
    return;
  }

  const calendarApiDataList: CalendarApiData[] = [];
  for (const country of watchList) {
    const url: string = `https://www.googleapis.com/calendar/v3/calendars/en.${country.code}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyAxHZk4hcnmO1Bl9hJ5D_LxTYcRLrJQ7Lg`;
    const response: Response = await fetch(url);
    const json = await response.json();
    console.log(json);
    calendarApiDataList.push({
      country: country,
      data: json,
    });
  }
  console.log(
    'background: Get holidays for',
    calendarApiDataList.length,
    'countries'
  );

  await chrome.storage.local.set({
    [ChromeStorage.CALENDAR_API_DATA_LIST]: calendarApiDataList,
  });
}
