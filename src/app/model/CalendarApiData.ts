import { Country } from "./Country";
import { calendar_v3 } from '@googleapis/calendar';
type Schema$Events = calendar_v3.Schema$Events;

export interface CalendarApiData{
    country: Country;
    data: Schema$Events
}