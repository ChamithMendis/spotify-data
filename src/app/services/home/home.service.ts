import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from 'url';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  // https://api.spotify.com/v1/artists/{id}

  CLIENT_ID = '61ed7a60104043f19c64403ed124d92b';
  CLIENT_SECRET = 'a1264ff1951344c1ae312f1156b671ae';
  searchUrl = 'https://api.spotify.com/v1/search?query=';
  accessUrl = 'https://accounts.spotify.com/api/token';

  constructor(private _http: HttpClient) {}

  requestAccessToken() {
    const searchParameters = {
      headers: {
        'Content-Type': ' application/x-www-form-urlencoded',
      },
    };
    const accessBody =
      'grant_type=client_credentials&client_id=61ed7a60104043f19c64403ed124d92b&client_secret=a1264ff1951344c1ae312f1156b671ae';

    return this._http.post(this.accessUrl, accessBody, searchParameters);
  }

  getAccessToken() {
    let url: URL | null = null;
    if (typeof window !== undefined) {
      return JSON.parse(window.localStorage.getItem('auth_token') as string);
    }
  }

  setAccessToken(token: any) {
    let url: URL | null = null;
    if (typeof window !== undefined) {
      window.localStorage.setItem('auth_token', JSON.stringify(token));
    }
  }

  search(name: String, type: String): Observable<any> {
    const searchParameters = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.getAccessToken(),
      },
    };

    const url = this.searchUrl + name + '&offset=0&limit=20&type=' + type;

    // if (pageIndex && pageSize) {
    //   url =
    //     this.searchUrl +
    //     name +
    //     '&offset=' +
    //     pageIndex * pageSize +
    //     '&limit=20&type=' +
    //     type;
    // } else {

    // }
    return this._http.get(url, searchParameters);
  }

  searchNextData(
    name: String,
    type: String,
    offset: any,
    limit: any
  ): Observable<any> {
    const searchParameters = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.getAccessToken(),
      },
    };

    const url =
      this.searchUrl + name + '&offset=' + offset + '&limit=20&type=' + type;

    // if (pageIndex && pageSize) {
    //   url =
    //     this.searchUrl +
    //     name +
    //     '&offset=' +
    //     pageIndex * pageSize +
    //     '&limit=20&type=' +
    //     type;
    // } else {

    // }
    return this._http.get(url, searchParameters);
  }
}
