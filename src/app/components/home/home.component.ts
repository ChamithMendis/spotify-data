import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HomeService } from '../../services/home/home.service';
import { error } from 'console';

interface searchItem {
  value: string;
  viewValue: string;
}

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
}
