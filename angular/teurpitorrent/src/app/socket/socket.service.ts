import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  baseUrl: string = environment.backendSocketHost;

  private socket?: Socket;

  constructor() {
    this.socket = undefined;
  }

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.baseUrl, {
      reconnectionDelayMax: 10000,
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  sendEvent(event: string, data: any, callback?: (response: any) => void) {
    if (this.socket) {
      this.socket.emit(event, data, callback);
    }
  }

  onEvent(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}
