import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SonsPage } from './sons.page';

describe('SonsPage', () => {
  let component: SonsPage;
  let fixture: ComponentFixture<SonsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SonsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
