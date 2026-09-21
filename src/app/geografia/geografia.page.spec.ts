import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeografiaPage } from './geografia.page';

describe('GeografiaPage', () => {
  let component: GeografiaPage;
  let fixture: ComponentFixture<GeografiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GeografiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
