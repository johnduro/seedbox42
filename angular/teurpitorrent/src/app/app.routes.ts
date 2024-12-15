import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TorrentsPageComponent } from './torrents-page/torrents-page.component';
import { FilesPageComponent } from './files-page/files-page.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth/auth.guard';
import { FileDetailComponent } from './file-detail/file-detail.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },
    {
        path: '',
        component: HomeComponent,
        title: 'Home',
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
                title: 'Dashboard'
            },
            {
                path: 'torrents',
                component: TorrentsPageComponent, 
                title: 'Torrents',
            },
            {
                path: 'files',
                component: FilesPageComponent,
                title: 'Files'
            },
            {
                path: 'files/:id',
                component: FileDetailComponent,
                title: 'File'
            },
            { 
                path: '', 
                redirectTo: 'dashboard', 
                pathMatch: 'full' 
            },
            { 
                path: '**', 
                redirectTo: '' //todo modify to 404 page
            }        
        ],
    },
];
