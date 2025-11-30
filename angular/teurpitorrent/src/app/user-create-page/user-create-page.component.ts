import { Component } from '@angular/core';
import { UserEditComponent } from '../user-edit/user-edit.component';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [
    UserEditComponent
  ],
  templateUrl: './user-create-page.component.html',
  styleUrl: './user-create-page.component.scss'
})
export class UserCreatePageComponent {

}
