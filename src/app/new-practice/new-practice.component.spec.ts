import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPracticeComponent } from './new-practice.component';

describe('NewPracticeComponent', () => {
  let component: NewPracticeComponent;
  let fixture: ComponentFixture<NewPracticeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewPracticeComponent]
    });
    fixture = TestBed.createComponent(NewPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
