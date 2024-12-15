import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDirectoryComponent } from './file-directory.component';

describe('FileDirectoryComponent', () => {
  let component: FileDirectoryComponent;
  let fixture: ComponentFixture<FileDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDirectoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
