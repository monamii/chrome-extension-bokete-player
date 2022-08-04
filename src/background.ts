import { calendar_v3 } from '@googleapis/calendar';
import { CalendarApiData } from "./model/CalendarApiData";
import { debounce } from "lodash";

console.log('background');

const debouncedFunction = debounce(getApiData, 1000);

chrome.runtime.onInstalled.addListener(async () => {
  await getApiData();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if(area === 'sync' && changes['watchList']?.newValue !== undefined){

    console.log('watchlist onChanged', changes['watchList']?.newValue.length);
    debouncedFunction();
  }
});

async function getApiData(){
  
  const {watchList} = await chrome.storage.sync.get('watchList');
  if(watchList === undefined){
    return;
  }

  const calendarApiDataList: CalendarApiData[] = []
  for (const country of watchList) {
    const url: string = `https://www.googleapis.com/calendar/v3/calendars/en.${country.code}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyAxHZk4hcnmO1Bl9hJ5D_LxTYcRLrJQ7Lg`;
    const response: Response = await fetch(url);
    calendarApiDataList.push({
      country: country,
      data: await response.json()}
      );
  }
  console.log('Get holidays for', calendarApiDataList.length, 'countries');
  await chrome.storage.local.set({'calendarApiDataList': calendarApiDataList});
}