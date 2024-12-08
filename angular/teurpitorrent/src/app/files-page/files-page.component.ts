import { Component } from '@angular/core';
import { FileListComponent } from '../file-list/file-list.component';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [FileListComponent],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.scss'
})
export class FilesPageComponent {

}
