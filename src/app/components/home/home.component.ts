import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HomeService } from '../../services/home/home.service';
import { error } from 'console';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

interface searchItem {
  value: string;
  viewValue: string;
}

// export interface SpotifyTrackDetails {
//   position: number;
//   trackName: string;
//   primaryArtist: string;
//   additionalArtist: string;
//   albumName: string;
//   label: string;
//   isrc: string;
//   upc: string;
//   trackLength: string;
//   lifetimeStreams: string;
//   streamsInThePastYear: string;
// }

// const ELEMENT_DATA: SpotifyTrackDetails[] = [];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  dataArray: Array<any> = new Array();

  seachItemList: searchItem[] = [
    // { value: 'artist', viewValue: 'Search by artist' },
    // { value: 'album', viewValue: 'Search by album' },
    { value: 'track', viewValue: 'Search by track' },
  ];

  searchForm: FormGroup = new FormGroup({
    search: new FormControl(''),
    selectItem: new FormControl(''),
  });

  displayedColumns: string[] = [
    // 'position',
    'trackName',
    'primaryArtist',
    'additionalArtist',
    'albumName',
    'label',
    'isrc',
    'upc',
    'trackLength',
    'lifetimeStreams',
    'streamsInThepastYear',
  ];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private _homeService: HomeService) {
    this.dataSource = new MatTableDataSource([{}]);
  }

  ngOnInit(): void {
    this.getAccess();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public getAccess(): void {
    const accessToken = this._homeService.getAccessToken();

    if (
      accessToken !== null &&
      accessToken !== '' &&
      accessToken !== undefined
    ) {
      console.log('access token exists');
      return;
    }

    this._homeService.requestAccessToken().subscribe(
      (res: any) => {
        console.log(res);
        this._homeService.setAccessToken(res.access_token);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public onSearch(): void {
    this._homeService
      .search(
        this.searchForm.get('search')?.value,
        this.searchForm.get('selectItem')?.value
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.populateDataTable(res?.tracks?.items);
          // set data to ELEMENT_DATA
          // this.dataArray = [{ upc: '1' }];
          this.dataSource = new MatTableDataSource(this.dataArray);
        },
        (error) => {
          console.log(error);
          if (error.response.status === 401) {
            this._homeService.requestAccessToken().subscribe(
              (res: any) => {
                console.log(res);
                this._homeService.setAccessToken(res.access_token);
              },
              (error) => {
                console.log(error);
              }
            );
          }
        }
      );
    // this.searchForm.reset();
  }

  public clearTable(): void {
    this.dataArray = [];
  }

  public populateDataTable(items: any): void {
    if (items.length <= 0) {
      return;
    }
    this.clearTable();

    items.forEach((element: any) => {
      const dataObject = {
        // position: 0,
        trackName: element.name,
        primaryArtist: element?.artists[0]?.name,
        additionalArtist: this.getAdditionalArtists(element?.artists),
        albumName: element.album.name,
        label: '',
        isrc: element?.external_ids?.isrc,
        upc: element?.external_ids?.upc,
        trackLength: this.msToMinutes(element.duration_ms),
        lifetimeStreams: '',
        streamsInThepastYear: '',
      };

      this.dataArray.push(dataObject);
    });
  }

  public msToMinutes(ms: any): any {
    let seconds = ms / 1000;
    let minutes = seconds / 60;
    return minutes;
  }

  public getAdditionalArtists(artists: any): any {
    // element?.artists[0]?.name
    if (artists.length <= 0) {
      return;
    }

    let additionalNames = '';

    if (artists[1]) {
      for (let index = 1; index < artists.length; index++) {
        additionalNames = additionalNames + artists[index].name + ', ';
      }
    }
    return additionalNames;
  }
}
