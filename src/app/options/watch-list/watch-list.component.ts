import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Country } from 'src/app/model/Country';
@Component({
  selector: 'app-watch-list',
  templateUrl: './watch-list.component.html',
  styleUrls: ['./watch-list.component.scss', './../options.module.shared.scss'],
})
export class WatchListComponent {
  @Input() public watchList!: Map<string, Country>;
  @Input() public sortedWatchList!: Country[];

  @Output() watchListEvent = new EventEmitter<Map<string, Country>>();
  @Output() sortedWatchListEvent = new EventEmitter<Country[]>();

  public async onDeleteClick(country: Country): Promise<void> {
    this.watchList.delete(country.code);
    this.sortedWatchList = Array.from(this.watchList.values());
    await chrome.storage.sync.set({ watchList: this.sortedWatchList });

    this.watchListEvent.emit(this.watchList);
    this.sortedWatchListEvent.emit(this.sortedWatchList);
  }
}
