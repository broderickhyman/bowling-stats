import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page.component';
import { UploadPage } from './upload-page/upload-page.component';
import { LeagueListPage } from './league-page/list-page.component';
import { LeaguePage } from './league-page/league-page.component';
import { BallsPage } from './balls-page/balls-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'upload',
    component: UploadPage,
  },
  {
    path: 'leagues',
    component: LeagueListPage,
  },
  {
    path: 'league/:id',
    component: LeaguePage,
  },
  {
    path: 'balls',
    component: BallsPage,
  },
];
