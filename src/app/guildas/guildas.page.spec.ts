import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuildasPage } from './guildas.page';

describe('GuildasPage', () => {
  let component: GuildasPage;
  let fixture: ComponentFixture<GuildasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuildasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
