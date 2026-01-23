import { Component, inject, signal } from '@angular/core';
import { form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Auth } from '../auth';

interface LoginData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(Auth);
  error = signal<string>('');
  loggingIn = signal(false);
  show: boolean = false;

  loginModel = signal<LoginData>({
    username: '',
    password: '',
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.username, { message: 'Username is required' });
    minLength(fieldPath.username, 3, { message: 'Username should be at least 3 characters long' });

    required(fieldPath.password, { message: 'Password is required' });
    minLength(fieldPath.password, 8, { message: 'Password should be at least 8 characters' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      const credentials = this.loginModel();
      console.log('Logging in with:', credentials);
      this.loggingIn.set(true);
      this.authService.login(credentials.username, credentials.password).subscribe({
        next: (res) => {
          console.log('Ok');
          this.loggingIn.set(false);
        },
        error: (err) => {
          this.loggingIn.set(false);
          this.error.set('Invalid username or password');

          console.error(err);
        },
      });
    });
  }

  togglePassword() {
    this.show = !this.show;
  }
}
