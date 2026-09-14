import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grim2Page } from './grim2.page';

describe('Grim2Page', () => {
  let component: Grim2Page;
  let fixture: ComponentFixture<Grim2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Grim2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
