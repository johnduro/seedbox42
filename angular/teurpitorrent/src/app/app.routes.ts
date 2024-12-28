import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TorrentsPageComponent } from './torrents-page/torrents-page.component';
import { FilesPageComponent } from './files-page/files-page.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth/auth.guard';
import { FileDetailComponent } from './file-detail/file-detail.component';
import { MyProfilePageComponent } from './my-profile-page/my-profile-page.component';
import { UsersPageComponent } from './users-page/users-page.component';
import { FilesManagerPageComponent } from './files-manager-page/files-manager-page.component';
import { ConfigurationPageComponent } from './configuration-page/configuration-page.component';
import { UserEditPageComponent } from './user-edit-page/user-edit-page.component';
import { UserCreatePageComponent } from './user-create-page/user-create-page.component';

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
                path: 'my-profile',
                component: MyProfilePageComponent,
                title: 'My profile'
            },
            {
                path: 'users',
                component: UsersPageComponent,
                title: 'Users'
            },
            {
                path: 'users/create',
                component: UserCreatePageComponent,
                title: 'Users'
            },
            {
                path: 'users/:id',
                component: UserEditPageComponent,
                title: 'Users'
            },
            {
                path: 'files-manager',
                component: FilesManagerPageComponent,
                title: 'Files manager'
            },
            {
                path: 'configuration',
                component: ConfigurationPageComponent,
                title: 'Configuration'
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
