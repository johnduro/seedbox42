import { Component, inject } from '@angular/core';
import { FilesService } from '../files/files.service';
import { FileDetail } from '../files/file';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileDirectoryComponent } from '../file-directory/file-directory.component';

@Component({
  selector: 'app-file-detail',
  standalone: true,
  imports: [RouterLink, FileDirectoryComponent],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent {
  private route = inject(ActivatedRoute);

  id: string = "";
  fileDetail: FileDetail = {} as FileDetail;

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
    console.log('FileDetailComponent.ngOnInit');

    this.route.params.subscribe(params => {
      this.id = params['id'];
   });

    this.fileService.getFileDetail(this.id).subscribe(fileDetail => {
      console.log('FileListComponent.getFiles', fileDetail);
      this.fileDetail = fileDetail;
    });
  }
}
