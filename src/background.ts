import { calendar_v3 } from '@googleapis/calendar';
import { CalendarApiData } from "./model/CalendarApiData";

console.log('background');

chrome.runtime.onInstalled.addListener(async () => {
  await getApiData();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  console.log('background watchList onChanged');
  if(area === 'sync' && changes['watchList']?.newValue !== undefined){

    console.log('background watchList onChanged inside');
    await getApiData();
  }
});

async function getApiData(){
  
  const {watchList} = await chrome.storage.sync.get('watchList');
  if(watchList === undefined){
    console.log('background: no watchlist');
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
  console.log('background', calendarApiDataList);
  await chrome.storage.local.set({'calendarApiDataList': calendarApiDataList});
}