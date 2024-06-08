import { Injectable } from '@angular/core';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';


@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() { }

  async sendEmail(e: Event, msg: string) {
    e.preventDefault();

    return await emailjs.send('service_0sg9xnl', 'template_4owdq2b', {msg: msg}, {
        publicKey: 'V77txtuXBQzUaz7y-',
      })
      .then(
        () => {
          alert("Ticket was submitted successfully!");
          return true
        },
        (error) => {
          console.log('FAILED...', (error as EmailJSResponseStatus).text);
          return false
        },
      );
  }
}
