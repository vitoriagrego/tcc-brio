import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupSincronizacaoPage } from './backup-sincronizacao.page';

describe('BackupSincronizacaoPage', () => {
  let component: BackupSincronizacaoPage;
  let fixture: ComponentFixture<BackupSincronizacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BackupSincronizacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
