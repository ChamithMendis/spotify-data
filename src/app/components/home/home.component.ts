import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HomeService } from '../../services/home/home.service';
import { MatTableDataSource } from '@angular/material/table';

interface searchItem {
  value: string;
  viewValue: string;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  seachItemList: searchItem[] = [
    { value: 'artist', viewValue: 'Search by artist' },
    { value: 'album', viewValue: 'Search by album' },
    { value: 'track', viewValue: 'Search by track' },
  ];

  searchForm: FormGroup = new FormGroup({
    search: new FormControl(''),
    selectItem: new FormControl(''),
  });

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  constructor(private _homeService: HomeService) {}

  ngOnInit(): void {
    this.getAccess();
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
        },
        (error) => {
          console.log(error);
        }
      );
    // this.searchForm.reset();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
