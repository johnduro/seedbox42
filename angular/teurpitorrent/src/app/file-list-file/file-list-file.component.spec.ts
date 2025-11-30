import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListFileComponent } from './file-list-file.component';

describe('FileListFileComponent', () => {
  let component: FileListFileComponent;
  let fixture: ComponentFixture<FileListFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileListFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
