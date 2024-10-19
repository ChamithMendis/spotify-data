import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HomeService } from '../../services/home/home.service';
import { error } from 'console';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { start } from 'repl';
import { catchError, map, startWith, switchMap } from 'rxjs';
import { merge, Observable, of as observableOf, pipe } from 'rxjs';

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
  isLoading = false;
  limitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private _homeService: HomeService) {
    this.dataSource = new MatTableDataSource([{}]);
  }

  ngOnInit(): void {
    this.getAccess();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    // this.paginator.page
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoading = false;
    //       return this.onSearch(
    //         this.paginator.pageIndex + 1,
    //         this.paginator.pageSize
    //       ).pipe(catchError(() => observableOf(null)));
    //     }),
    //     map(() => {
    //       // if (empData == null) return [];
    //       //   this.totalData = empData.total;
    //       //   this.isLoading = false;
    //       //   return empData.data;
    //     })
    //   )
    //   .subscribe(() => {
    //     // this.EmpData = empData;
    //     // this.dataSource = new MatTableDataSource(this.EmpData);
    //   });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
        // console.log(res);
        this._homeService.setAccessToken(res.access_token);
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  public onSearch(pageIndex?: any, pageSize?: any): any {
    // if (pageIndex === undefined || pageSize === undefined) {
    this.clearTable();
    this.totalRecords = 0;
    // }

    this._homeService
      .search(
        this.searchForm.get('search')?.value,
        this.searchForm.get('selectItem')?.value
      )
      .subscribe(
        (res) => {
          this.populateDataTable(res?.tracks?.items, res?.tracks?.total);
          this.dataSource = new MatTableDataSource(this.dataArray);
          this.dataSource.paginator = this.paginator;
          // this.totalRecords = res?.tracks?.total;
          // if (this.totalRecords <= 0) {
          // }
        },
        (error) => {
          console.log(error);
          if (error.status === 401) {
            this._homeService.requestAccessToken().subscribe(
              (res: any) => {
                // console.log(res);
                this._homeService.setAccessToken(res.access_token);
                this.onSearch();
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

  public populateDataTable(items: any, totalData: number): void {
    if (items.length <= 0) {
      return;
    }

    const tempDataArray: any = [];

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

      tempDataArray.push(dataObject);
    });

    this.dataArray = tempDataArray;
    this.dataArray.length = totalData;
    this.totalRecords = totalData;
  }

  public populateNextDataTable(
    items: any,
    currentSize: any,
    offset: any,
    limit: any,
    totalRecords: any
  ): void {
    if (items.length <= 0) {
      return;
    }

    const tempDataArray: any = [];
    this.dataArray.length = currentSize;

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

      tempDataArray.push(dataObject);
    });

    this.dataArray.push(...tempDataArray);
    this.dataArray.length = this.totalRecords;
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

  onPageChange(event: PageEvent) {
    console.log(event);
    this.isLoading = true;
    let pageIndex = event.pageIndex;
    let pageSize = event.pageSize;
    let previousIndex = event.previousPageIndex;
    let previousSize = pageSize * pageIndex;
    this.getNextData(previousSize, pageIndex.toString(), pageSize.toString());
    // this.pageIndex = event.pageIndex;
    // this.pageSize = event.pageSize;
    // this.getPagedData();
  }

  public getNextData(currentSize: any, offset: any, limit: any): void {
    this._homeService
      .searchNextData(
        this.searchForm.get('search')?.value,
        this.searchForm.get('selectItem')?.value,
        offset,
        limit
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.populateNextDataTable(
            res?.tracks?.items,
            currentSize,
            offset,
            limit,
            res?.tracks?.total
          );
          this.dataSource = new MatTableDataSource(this.dataArray);
          this.dataSource._updateChangeSubscription();
          this.dataSource.paginator = this.paginator;
        },
        (error) => {
          console.log(error);
          if (error.status === 401) {
            this._homeService.requestAccessToken().subscribe(
              (res: any) => {
                this._homeService.setAccessToken(res.access_token);
                this.onSearch();
              },
              (error) => {
                console.log(error);
              }
            );
          }
        }
      );
  }
}
