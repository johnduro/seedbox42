import { Component, Input } from '@angular/core';
import { File } from '../files/file';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-file-list-file',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './file-list-file.component.html',
  styleUrl: './file-list-file.component.scss'
})
export class FileListFileComponent {
  @Input({ required: true }) file!: File;
}
