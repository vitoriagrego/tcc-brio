import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getUsuarioAtual() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getPerfilUsuario() {
    const user = await this.getUsuarioAtual();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async atualizarPerfil(dadosAtualizados: any) {
    const user = await this.getUsuarioAtual();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .update(dadosAtualizados)
      .eq('id', user.id);

    if (error) throw error;
    return data;
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({
      email,
      password: pass
    });
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password: pass
    });
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email);
  }

  async salvarQuestionario(dadosQuestionario: any) {
    const user = await this.getUsuarioAtual();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data, error } = await this.supabase
      .from('user_questionnaire')
      .upsert(
        {
          user_id: user.id,
          ...dadosQuestionario,
          updated_at: new Date()
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    return data;
  }
}