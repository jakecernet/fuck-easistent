import { Component, inject, signal } from '@angular/core';
import { Auth } from '../auth';
import { Invites } from '../services/invites';
import { Grades } from '../services/grades';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  authService = inject(Auth);
  inviteService = inject(Invites);
  gradeService = inject(Grades);
  inviteCodes = signal<string[]>([]);

  confirmAccountDeletion = signal(false);

  username: string = '';
  password: string = '';

  ngOnInit() {
    this.loadInviteCodes();
  }

  loadInviteCodes() {
    this.inviteService.loadInvites().subscribe((res) => {
      console.log(res);
      this.inviteCodes.set(res);
    });
  }

  generateInviteCode() {
    this.inviteService.generateInvite().subscribe((res) => {
      console.log(`Generated invite code: ${res}`);
      this.loadInviteCodes();
    });
  }

  removeInviteCode(code: string) {
    console.log(`Removing: ${code}`);
    this.inviteService.removeInvite(code).subscribe((_) => {
      this.loadInviteCodes();
    });
  }

  clearData() {
    if (confirm("Are you sure?\nThis deletes all saved grades.")) {
      this.gradeService.clearData().subscribe(res => {
        if (res) {
          alert("Saved data deleted succesfully!");
        } else {
          alert("Failed to delete data!")
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
