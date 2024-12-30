import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListManagerComponent } from './file-list-manager.component';

describe('FileListManagerComponent', () => {
  let component: FileListManagerComponent;
  let fixture: ComponentFixture<FileListManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileListManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
