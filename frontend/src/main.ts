import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const API_URL = 'http://localhost:8000';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
