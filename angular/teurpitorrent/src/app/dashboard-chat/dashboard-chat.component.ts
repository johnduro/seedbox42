import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaw, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SocketService } from '../socket/socket.service';
import { AuthService } from '../auth/auth.service';
import { ChatMessage } from '../chatMessage/chat-message';


@Component({
  selector: 'app-dashboard-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dashboard-chat.component.html',
  styleUrl: './dashboard-chat.component.scss'
})
export class DashboardChatComponent {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';

  faPaw = faPaw;
  faCheck = faCheck;

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.socketService.connect(token);
    } else {
      console.error('Token is null');
    }

    this.socketService.sendEvent('chat:get:message', {}, (response: { message: ChatMessage[] }) => {
      this.messages = response.message.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.scrollToBottom();

    });

    this.socketService.onEvent('chat:new:message', (message: { message: ChatMessage }) => {
      this.messages.push(message.message);
      this.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const user = this.authService.getConnectedUser();
      if (user) {
        const messageData = {
          id: user._id,
          message: this.newMessage
        };
        this.socketService.sendEvent('chat:post:message', messageData);
        this.newMessage = '';
      } else {
        console.error('User is null');
      }
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  onUserAvatarImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Could not scroll to bottom', err);
    }
  }
}
