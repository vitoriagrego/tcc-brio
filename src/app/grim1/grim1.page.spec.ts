import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grim1Page } from './grim1.page';

describe('Grim1Page', () => {
  let component: Grim1Page;
  let fixture: ComponentFixture<Grim1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Grim1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
