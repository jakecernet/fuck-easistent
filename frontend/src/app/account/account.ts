import { Component, inject, signal } from '@angular/core';
import { Auth } from '../auth';
import { Grades } from '../services/grades';
import { Extra } from '../services/extra';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  authService = inject(Auth);
  gradeService = inject(Grades);
  extraService = inject(Extra);
  refreshing = signal(false);

  confirmAccountDeletion = signal(false);

  username: string = '';
  password: string = '';

  forceRefresh() {
    this.refreshing.set(true);
    this.extraService.refresh().subscribe(() => {
      setTimeout(() => this.refreshing.set(false), 4000);
    });
  }

  clearData() {
    if (confirm('Are you sure?\nThis deletes all saved grades.')) {
      this.gradeService.clearData().subscribe((res) => {
        if (res) {
          alert('Saved data deleted succesfully!');
        } else {
          alert('Failed to delete data!');
        }
      });
    }
  }

  addLoginInfo(e: Event) {
    e.preventDefault();
    if (!confirm('Are you sure you want to add this login info?')) {
      return;
    }
    console.log(this.username);
    console.log(this.password);
    this.gradeService.addLoginInfo(this.username, this.password).subscribe((res) => {
      console.log(res);
    });
  }
  deleteAccount() {
    this.confirmAccountDeletion.set(true);
  }
  actuallyDeleteAccount() {
    this.authService.deleteAccount().subscribe((success) => {
      if (!success) {
        alert("Couldn't delete the account!");
        this.confirmAccountDeletion.set(false);
      }
    });
  }
}
